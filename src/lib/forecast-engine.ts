export type HyperlocalTelemetry = {
  tempF: number;
  feelsLikeF: number;
  dewPointF: number;
  wetBulbF: number;
  heatIndexF: number;
  windChillF: number;
  humidity: number;
  pressureInHg: number;
  pressureTrend: 'falling_rapidly' | 'falling' | 'steady' | 'rising';
  pressureTrendMbHr: number;
  windSpeedKt: number;
  windGustKt: number;
  windDirDeg: number;
  windDirCard: string;
  visibilityMi: number;
  cloudCoverPct: number;
  aqi: number;
  aqiStatus: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy';
  pm25: number;
  ozonePpb: number;
  uvIndex: number;
};

export type MinutePrecipitation = {
  minute: number;
  intensityMmHr: number;
  probability: number;
  type: 'none' | 'light_rain' | 'moderate_rain' | 'heavy_rain' | 'hail_mix' | 'snow';
};

export type WeatherModelComparison = {
  name: 'HRRR' | 'GFS' | 'ECMWF' | 'NAM 3km' | 'ICON';
  tempF: number;
  dewPointF: number;
  capeJkg: number;
  windGustKt: number;
  precipNext6hIn: number;
  confidenceScore: number; // 0 - 100%
  description: string;
};

export type DecodedMETAR = {
  raw: string;
  station: string;
  name: string;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  tempC: number;
  dewC: number;
  tempF: number;
  dewPointF: number;
  altimeterInHg: number;
  windSpeedKt: number;
  windGustKt?: number;
  windDirDeg: number;
  visibilitySm: number;
  clouds: string;
  remarks: string;
};

export type MarineBuoy = {
  stationId: string;
  name: string;
  waveHeightFt: number;
  dominantPeriodSec: number;
  swellDir: string;
  waterTempF: number;
  airTempF: number;
  tideFeet: number;
  tideTrend: 'Rising' | 'Falling' | 'Slack High' | 'Slack Low';
  nextTideTime: string;
};

export type AgriculturalMetrics = {
  soilMoistureTopPct: number; // 0-2 inches
  soilMoistureDeepPct: number; // 4-8 inches
  soilTemp2inF: number;
  soilTemp4inF: number;
  gddBase50: number; // Growing Degree Days
  frostRiskLevel: 'NONE' | 'LOW' | 'ELEVATED' | 'CRITICAL FREEZE';
  cropStressIndex: number; // 0 - 100
  droughtCategory: 'None' | 'D0 Abnormally Dry' | 'D1 Moderate' | 'D2 Severe' | 'D3 Extreme';
};

// Calculate Wet Bulb Temperature via Stull's approximation
export function calculateWetBulbF(tempF: number, humidityPct: number): number {
  const T = ((tempF - 32) * 5) / 9;
  const RH = Math.min(100, Math.max(1, humidityPct));
  const TwC =
    T * Math.atan(0.151977 * Math.pow(RH + 8.313659, 0.5)) +
    Math.atan(T + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035;
  const TwF = (TwC * 9) / 5 + 32;
  return Math.round(TwF * 10) / 10;
}

// Calculate Heat Index (Rothfusz equation)
export function calculateHeatIndexF(tempF: number, humidityPct: number): number {
  if (tempF < 80) return tempF;
  const T = tempF;
  const R = humidityPct;
  const HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R;
  return Math.round(HI);
}

// Calculate Personal Weather Risk Score (0 - 100)
export function calculatePersonalRiskScore(params: {
  hasTornadoWarning: boolean;
  hasSevereWarning: boolean;
  hasFloodWarning: boolean;
  cape: number;
  stp: number;
  shear06: number;
  precipRateMmHr: number;
}): {
  overallScore: number;
  tornadoRisk: number;
  hailRisk: number;
  windRisk: number;
  floodRisk: number;
  rating: 'LOW' | 'ELEVATED' | 'SEVERE' | 'CRITICAL TORNADIC';
} {
  let tornadoRisk = Math.min(95, Math.round(params.stp * 22 + (params.hasTornadoWarning ? 40 : 0)));
  let hailRisk = Math.min(90, Math.round((params.cape / 3500) * 70 + (params.hasSevereWarning ? 25 : 0)));
  let windRisk = Math.min(90, Math.round((params.shear06 / 60) * 60 + (params.hasSevereWarning ? 30 : 0)));
  let floodRisk = Math.min(90, Math.round(params.precipRateMmHr * 1.5 + (params.hasFloodWarning ? 40 : 0)));

  if (params.hasTornadoWarning) tornadoRisk = Math.max(92, tornadoRisk);
  if (params.hasSevereWarning) {
    hailRisk = Math.max(75, hailRisk);
    windRisk = Math.max(78, windRisk);
  }

  let overall = Math.min(
    100,
    Math.round(tornadoRisk * 0.45 + hailRisk * 0.2 + windRisk * 0.2 + floodRisk * 0.15)
  );

  // If a tornado warning is active for this location, overall risk must be critical
  if (params.hasTornadoWarning) {
    overall = Math.max(overall, 88);
  } else if (params.hasSevereWarning) {
    overall = Math.max(overall, 68);
  }

  let rating: 'LOW' | 'ELEVATED' | 'SEVERE' | 'CRITICAL TORNADIC' = 'LOW';
  if (params.hasTornadoWarning || overall >= 85) rating = 'CRITICAL TORNADIC';
  else if (overall >= 65) rating = 'SEVERE';
  else if (overall >= 35) rating = 'ELEVATED';

  return {
    overallScore: overall,
    tornadoRisk,
    hailRisk,
    windRisk,
    floodRisk,
    rating,
  };
}

// Generate 60-Minute Precipitation Forecast
export function generateMinutePrecipitationForecast(isRainingNow: boolean): {
  minutes: MinutePrecipitation[];
  summary: string;
  expectedStartMin: number | null;
  expectedEndMin: number | null;
} {
  const minutes: MinutePrecipitation[] = [];
  let expectedStartMin: number | null = isRainingNow ? 0 : 16;
  let expectedEndMin: number | null = isRainingNow ? 42 : null;

  for (let m = 0; m <= 60; m++) {
    let intensity = 0;
    let type: MinutePrecipitation['type'] = 'none';

    if (isRainingNow) {
      if (m <= 35) {
        intensity = Math.max(0, 18 - m * 0.45 + Math.sin(m * 0.3) * 4);
      } else if (m <= 50) {
        intensity = Math.max(0, 5 - (m - 35) * 0.3);
      }
    } else {
      if (m >= 15 && m <= 55) {
        intensity = Math.max(0, (m - 15) * 0.65 - Math.max(0, (m - 35) * 0.8));
      }
    }

    if (intensity > 25) type = 'heavy_rain';
    else if (intensity > 10) type = 'moderate_rain';
    else if (intensity > 0.5) type = 'light_rain';

    minutes.push({
      minute: m,
      intensityMmHr: Math.round(intensity * 10) / 10,
      probability: intensity > 0 ? Math.min(95, Math.round(60 + intensity * 2)) : 10,
      type,
    });
  }

  const summary = isRainingNow
    ? 'Moderate rain easing in ~35 minutes; brief clearing expected thereafter.'
    : 'Rain starting in ~16 minutes, peaking at ~34 minutes with heavy convective downpours.';

  return { minutes, summary, expectedStartMin, expectedEndMin };
}

// Multi-Model comparison generator
export function getModelComparisons(): WeatherModelComparison[] {
  return [
    {
      name: 'HRRR',
      tempF: 78,
      dewPointF: 68,
      capeJkg: 2450,
      windGustKt: 52,
      precipNext6hIn: 1.45,
      confidenceScore: 92,
      description: 'Convective-allowing model (3km resolution) showing aggressive discrete supercell initiation.',
    },
    {
      name: 'NAM 3km',
      tempF: 77,
      dewPointF: 69,
      capeJkg: 2700,
      windGustKt: 48,
      precipNext6hIn: 1.62,
      confidenceScore: 88,
      description: 'High instability with deep moisture pooling along frontal boundary; explosive updraft growth.',
    },
    {
      name: 'ECMWF',
      tempF: 76,
      dewPointF: 66,
      capeJkg: 2100,
      windGustKt: 44,
      precipNext6hIn: 1.15,
      confidenceScore: 86,
      description: 'Global flagship model shows widespread heavy precipitation swath with strong low-level shear.',
    },
    {
      name: 'GFS',
      tempF: 79,
      dewPointF: 67,
      capeJkg: 2300,
      windGustKt: 46,
      precipNext6hIn: 1.25,
      confidenceScore: 84,
      description: 'Consistent synoptic trough progression with strong 850mb low-level jet (45-50 kt).',
    },
    {
      name: 'ICON',
      tempF: 77,
      dewPointF: 67,
      capeJkg: 2250,
      windGustKt: 45,
      precipNext6hIn: 1.30,
      confidenceScore: 82,
      description: 'German global model aligns with ECMWF on frontal timing and severe convective placement.',
    },
  ];
}

// Decode raw aviation METAR string
export function parseMETAR(raw: string): DecodedMETAR {
  const parts = raw.trim().split(/\s+/);
  const station = parts[0] || 'KJAX';

  // Determine flight category
  let flightCategory: DecodedMETAR['flightCategory'] = 'VFR';
  let visibilitySm = 10;
  let tempC = 24;
  let dewC = 19;
  let windSpeedKt = 12;
  let windGustKt: number | undefined;
  let windDirDeg = 180;
  let altimeterInHg = 29.92;
  let clouds = 'FEW035';

  for (const part of parts) {
    // Wind: e.g. 19014G24KT
    const windMatch = part.match(/^(\d{3}|VRB)(\d{2})(?:G(\d{2}))?KT$/);
    if (windMatch) {
      windDirDeg = windMatch[1] === 'VRB' ? 180 : parseInt(windMatch[1], 10);
      windSpeedKt = parseInt(windMatch[2], 10);
      if (windMatch[3]) windGustKt = parseInt(windMatch[3], 10);
    }
    // Vis: e.g. 10SM or 3SM
    const visMatch = part.match(/^(\d+)SM$/);
    if (visMatch) {
      visibilitySm = parseInt(visMatch[1], 10);
    }
    // Temp/Dew: e.g. 24/19 or M02/M06
    const tempMatch = part.match(/^(M?\d{2})\/(M?\d{2})$/);
    if (tempMatch) {
      tempC = parseInt(tempMatch[1].replace('M', '-'), 10);
      dewC = parseInt(tempMatch[2].replace('M', '-'), 10);
    }
    // Altimeter: e.g. A2992
    const altMatch = part.match(/^A(\d{4})$/);
    if (altMatch) {
      altimeterInHg = parseInt(altMatch[1], 10) / 100;
    }
    // Clouds: OVC008, BKN015, SCT025, CLR
    if (part.match(/^(OVC|BKN|SCT|FEW)(\d{3})/)) {
      clouds = part;
    }
  }

  // Flight category logic:
  // LIFR: Ceiling < 500 ft and/or visibility < 1 mile
  // IFR: Ceiling 500 to < 1,000 ft and/or visibility 1 to < 3 miles
  // MVFR: Ceiling 1,000 to 3,000 ft and/or visibility 3 to 5 miles
  // VFR: Ceiling > 3,000 ft and visibility > 5 miles
  const ceilingMatch = clouds.match(/^(OVC|BKN)(\d{3})/);
  const ceilingFt = ceilingMatch ? parseInt(ceilingMatch[2], 10) * 100 : 99999;

  if (ceilingFt < 500 || visibilitySm < 1) {
    flightCategory = 'LIFR';
  } else if (ceilingFt < 1000 || visibilitySm < 3) {
    flightCategory = 'IFR';
  } else if (ceilingFt <= 3000 || visibilitySm <= 5) {
    flightCategory = 'MVFR';
  } else {
    flightCategory = 'VFR';
  }

  const tempF = Math.round((tempC * 9) / 5 + 32);
  const dewPointF = Math.round((dewC * 9) / 5 + 32);

  return {
    raw,
    station,
    name: getAirportName(station),
    flightCategory,
    tempC,
    dewC,
    tempF,
    dewPointF,
    altimeterInHg,
    windSpeedKt,
    windGustKt,
    windDirDeg,
    visibilitySm,
    clouds,
    remarks: 'RMK AO2 SLP132 T02440189',
  };
}

export function getAirportName(code: string): string {
  const map: Record<string, string> = {
    KLIT: 'Bill and Hillary Clinton National Airport (Little Rock, AR)',
    KOKC: 'Will Rogers World Airport (Oklahoma City, OK)',
    KDFW: 'Dallas/Fort Worth International Airport (Dallas, TX)',
    KATL: 'Hartsfield-Jackson Atlanta International (Atlanta, GA)',
    KORD: "O'Hare International Airport (Chicago, IL)",
    KDEN: 'Denver International Airport (Denver, CO)',
    KMEM: 'Memphis International Airport (Memphis, TN)',
    KMCI: 'Kansas City International Airport (Kansas City, MO)',
    KSTL: 'St. Louis Lambert International (St. Louis, MO)',
    KNEW: 'Lakefront Airport (New Orleans, LA)',
    KMIA: 'Miami International Airport (Miami, FL)',
    KJFK: 'John F. Kennedy International (New York, NY)',
  };
  return map[code] || `${code} Regional Aerodrome`;
}
