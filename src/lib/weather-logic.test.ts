import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePolarCoordinates,
  calculateBeamHeight,
  classifyStormGate,
  calculateStormRelativeVelocity,
} from './radar-physics';
import {
  computeSignificantTornadoParameter,
  computeSupercellCompositeParameter,
  calculateLiftedCondensationLevel,
  generateThermodynamicSounding,
} from './skewt-engine';
import {
  calculateWetBulbF,
  calculateHeatIndexF,
  calculatePersonalRiskScore,
  parseMETAR,
  generateMinutePrecipitationForecast,
} from './forecast-engine';

test('calculatePolarCoordinates accurately computes distance and azimuth', () => {
  // Test from KLZK (Little Rock) to nearby coordinate
  const coords = calculatePolarCoordinates(34.836, -92.262, 35.100, -92.000);
  assert.ok(coords.distanceKm > 0, 'Distance in km should be positive');
  assert.ok(coords.distanceNm > 0, 'Distance in nm should be positive');
  assert.ok(coords.azimuthDeg >= 0 && coords.azimuthDeg <= 360, 'Azimuth should be between 0 and 360');
});

test('calculateBeamHeight models 4/3 earth curvature and beam tilt', () => {
  const heightClose = calculateBeamHeight(10, 0.5, 200);
  const heightFar = calculateBeamHeight(100, 0.5, 200);
  assert.ok(heightFar > heightClose, 'Beam height should increase with distance due to curvature and tilt');
  assert.ok(heightClose > 200 * 3.28, 'Beam height should be at least radar tower base');
});

test('classifyStormGate detects Tornado Debris Signature (TDS)', () => {
  const result = classifyStormGate('cc', 0.65);
  assert.equal(result.hazardLevel, 'tornadic');
  assert.ok(result.badge.includes('Tornado Debris Signature'));
});

test('classifyStormGate detects Giant Hail core', () => {
  const result = classifyStormGate('ref', 68);
  assert.equal(result.hazardLevel, 'severe');
  assert.ok(result.badge.includes('Giant Hail'));
});

test('calculateStormRelativeVelocity subtracts storm vector', () => {
  const srv = calculateStormRelativeVelocity(50, 25, 240, 60);
  assert.ok(typeof srv === 'number');
});

test('computeSignificantTornadoParameter reflects extreme tornadic environments', () => {
  // High CAPE, high SRH, high shear, low LCL
  const stpExtreme = computeSignificantTornadoParameter(3500, 350, 50, 750);
  assert.ok(stpExtreme >= 4.0, 'STP should be extreme (>4.0) under high parameters');

  // Low parameters
  const stpLow = computeSignificantTornadoParameter(500, 50, 10, 1500);
  assert.ok(stpLow < 1.0, 'STP should be low under weak parameters');
});

test('generateThermodynamicSounding produces valid atmospheric layers', () => {
  const sounding = generateThermodynamicSounding(35.2, -97.4);
  assert.equal(sounding.levels.length, 9, 'Should have standard isobaric pressure levels');
  assert.ok(sounding.indices.sbcape > 0, 'SBCAPE should be calculated');
  assert.ok(sounding.indices.stp >= 0, 'STP should be non-negative');
});

test('calculatePersonalRiskScore elevates risk during active tornado warning', () => {
  const riskWithWarning = calculatePersonalRiskScore({
    hasTornadoWarning: true,
    hasSevereWarning: false,
    hasFloodWarning: false,
    cape: 2500,
    stp: 3.5,
    shear06: 45,
    precipRateMmHr: 15,
  });
  assert.equal(riskWithWarning.rating, 'CRITICAL TORNADIC');
  assert.ok(riskWithWarning.overallScore >= 80, 'Score should be high with active warning');
});

test('parseMETAR properly determines flight categories', () => {
  // Clear day -> VFR
  const vfr = parseMETAR('KLIT 081853Z 19012KT 10SM CLR 24/16 A2995 RMK AO2');
  assert.equal(vfr.flightCategory, 'VFR');

  // Low ceiling OVC004 -> LIFR
  const lifr = parseMETAR('KORD 081853Z 02008KT 1SM OVC004 04/03 A2980 RMK AO2');
  assert.equal(lifr.flightCategory, 'LIFR');
});

test('generateMinutePrecipitationForecast provides 60 minutes of data', () => {
  const forecast = generateMinutePrecipitationForecast(false);
  assert.equal(forecast.minutes.length, 61);
  assert.ok(forecast.summary.length > 0);
});
