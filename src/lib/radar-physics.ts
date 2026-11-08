// 4/3 Earth Radius Model for Standard Atmospheric Refraction
const EARTH_RADIUS_KM = 6371;
const EFFECTIVE_EARTH_RADIUS_KM = (4 / 3) * EARTH_RADIUS_KM; // ~8494.67 km

export type RadarSampling = {
  distanceNm: number;
  distanceKm: number;
  azimuthDeg: number;
  beamHeightFt: number;
  estimatedValue: number;
  unit: string;
  signatureBadge?: string;
  hazardLevel?: 'normal' | 'elevated' | 'severe' | 'tornadic';
};

// Calculate distance and azimuth (bearing) from radar tower to target coordinate
export function calculatePolarCoordinates(
  radarLat: number,
  radarLon: number,
  targetLat: number,
  targetLon: number
): { distanceKm: number; distanceNm: number; azimuthDeg: number } {
  const dLat = ((targetLat - radarLat) * Math.PI) / 180;
  const dLon = ((targetLon - radarLon) * Math.PI) / 180;
  const lat1 = (radarLat * Math.PI) / 180;
  const lat2 = (targetLat * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = EARTH_RADIUS_KM * c;
  const distanceNm = distanceKm * 0.539957;

  // Azimuth (bearing in degrees 0-360)
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let azimuthDeg = (Math.atan2(y, x) * 180) / Math.PI;
  azimuthDeg = (azimuthDeg + 360) % 360;

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    distanceNm: Math.round(distanceNm * 10) / 10,
    azimuthDeg: Math.round(azimuthDeg),
  };
}

// Calculate Radar Beam Height AGL taking 4/3 earth curvature and beam tilt into account
// Formula: H = sqrt(r^2 + Re^2 + 2*r*Re*sin(theta)) - Re + h0
export function calculateBeamHeight(
  distanceKm: number,
  tiltDeg = 0.5,
  antennaElevMeters = 200
): number {
  if (distanceKm <= 0) return Math.round(antennaElevMeters * 3.28084);
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const r = distanceKm;
  const Re = EFFECTIVE_EARTH_RADIUS_KM;

  const hKm =
    Math.sqrt(r * r + Re * Re + 2 * r * Re * Math.sin(tiltRad)) -
    Re +
    antennaElevMeters / 1000;
  return Math.round(hKm * 3280.84); // Height in feet Above Ground Level (AGL)
}

// Classify sampled radar data to identify severe weather signatures
export function classifyStormGate(
  product: string,
  rawVal: number
): { label: string; badge: string; hazardLevel: RadarSampling['hazardLevel'] } {
  if (product === 'ref') {
    if (rawVal >= 65) return { label: `${rawVal} dBZ`, badge: 'Giant Hail Core (>2.00")', hazardLevel: 'severe' };
    if (rawVal >= 55) return { label: `${rawVal} dBZ`, badge: 'Severe Hail / Extreme Rain', hazardLevel: 'severe' };
    if (rawVal >= 45) return { label: `${rawVal} dBZ`, badge: 'Convective Core', hazardLevel: 'elevated' };
    if (rawVal >= 30) return { label: `${rawVal} dBZ`, badge: 'Moderate Rain', hazardLevel: 'normal' };
    if (rawVal >= 15) return { label: `${rawVal} dBZ`, badge: 'Light Rain / Showers', hazardLevel: 'normal' };
    return { label: '< 15 dBZ', badge: 'Virga / Ground Clutter', hazardLevel: 'normal' };
  }

  if (product === 'vel' || product === 'srvel') {
    const kt = rawVal;
    if (Math.abs(kt) >= 60) return { label: `${kt} kt`, badge: 'Tornadic Gate Shear (>60 kt)', hazardLevel: 'tornadic' };
    if (Math.abs(kt) >= 45) return { label: `${kt} kt`, badge: 'Strong Mesocyclone Rotation', hazardLevel: 'severe' };
    if (Math.abs(kt) >= 30) return { label: `${kt} kt`, badge: 'Damaging Wind Potential', hazardLevel: 'elevated' };
    return { label: `${kt} kt`, badge: 'Standard Wind Flow', hazardLevel: 'normal' };
  }

  if (product === 'cc') {
    const ccVal = rawVal > 1.5 ? rawVal / 100 : rawVal;
    if (ccVal < 0.80 && ccVal > 0.20) {
      return { label: `${ccVal.toFixed(2)} CC`, badge: '🌪️ Tornado Debris Signature (TDS)', hazardLevel: 'tornadic' };
    }
    if (ccVal >= 0.97) return { label: `${ccVal.toFixed(2)} CC`, badge: 'Pure Rain (Uniform Hydrometeors)', hazardLevel: 'normal' };
    if (ccVal >= 0.88) return { label: `${ccVal.toFixed(2)} CC`, badge: 'Rain / Hail Mixture', hazardLevel: 'elevated' };
    return { label: `${ccVal.toFixed(2)} CC`, badge: 'Biological / Non-Met Echo', hazardLevel: 'normal' };
  }

  if (product === 'zdr') {
    return {
      label: `${rawVal.toFixed(1)} dB`,
      badge: rawVal < 0.5 ? 'Tumbling Hail (near 0 dB)' : rawVal > 3.0 ? 'Oblate Large Rain Drops' : 'Standard Rain',
      hazardLevel: rawVal < 0.5 ? 'severe' : 'normal',
    };
  }

  if (product === 'mesh') {
    if (rawVal >= 2.0) return { label: `${rawVal.toFixed(1)}"`, badge: 'Giant Hail Threat (>2.00")', hazardLevel: 'severe' };
    if (rawVal >= 1.0) return { label: `${rawVal.toFixed(1)}"`, badge: 'Severe Hail (Quarter+)', hazardLevel: 'elevated' };
    return { label: `${rawVal.toFixed(1)}"`, badge: 'Sub-Severe Hail / Graupel', hazardLevel: 'normal' };
  }

  if (product === 'azshear') {
    if (rawVal >= 0.015) return { label: `${rawVal} s⁻¹`, badge: 'Strong Mesocyclone / TVS', hazardLevel: 'tornadic' };
    if (rawVal >= 0.008) return { label: `${rawVal} s⁻¹`, badge: 'Moderate Low-Level Rotation', hazardLevel: 'elevated' };
    return { label: `${rawVal} s⁻¹`, badge: 'Broad Ambient Vorticity', hazardLevel: 'normal' };
  }

  return { label: `${rawVal}`, badge: 'Radar Gate Return', hazardLevel: 'normal' };
}

// Compute Storm Relative Motion (SRM) by removing storm motion vector from radial velocity
export function calculateStormRelativeVelocity(
  rawRadialVelKt: number,
  stormSpeedKt = 25,
  stormDirDeg = 240, // standard right-moving supercell motion (from 240 deg heading 60 deg)
  beamAzimuthDeg = 0
): number {
  // Convert storm vector to radial component
  const relativeAngle = ((beamAzimuthDeg - stormDirDeg) * Math.PI) / 180;
  const stormRadialComp = stormSpeedKt * Math.cos(relativeAngle);
  return Math.round(rawRadialVelKt - stormRadialComp);
}
