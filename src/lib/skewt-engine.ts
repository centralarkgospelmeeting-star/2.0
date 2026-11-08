export type SoundingIndices = {
  sbcape: number;
  mlcape: number;
  mucape: number;
  cin: number;
  srh01: number;
  srh03: number;
  shear06: number;
  liftedIndex: number;
  lclHeightM: number;
  lfcHeightM: number;
  pwat: number;
  stp: number; // Significant Tornado Parameter (fixed-layer)
  scp: number; // Supercell Composite Parameter
  hazardRating: 'LOW' | 'ELEVATED' | 'SEVERE' | 'EXTREME TORNADIC';
};

export type SoundingLevel = {
  pressureMb: number;
  heightM: number;
  tempC: number;
  dewC: number;
  windSpdKt: number;
  windDirDeg: number;
};

export type SoundingProfile = {
  station: string;
  lat: number;
  lon: number;
  elevationM: number;
  timestamp: string;
  indices: SoundingIndices;
  levels: SoundingLevel[];
};

// Significant Tornado Parameter (STP) formulation:
// STP = (SBCAPE / 1500) * ((2000 - LCL) / 1000) * (0-1km SRH / 150) * (0-6km Shear / 20)
// LCL term is capped between 0 and 1 (when LCL < 1000m, term = 1; when LCL > 2000m, term = 0)
export function computeSignificantTornadoParameter(
  cape: number,
  srh01: number,
  shear06: number,
  lclHeightM = 850
): number {
  const capeTerm = cape / 1500;
  let lclTerm = (2000 - lclHeightM) / 1000;
  if (lclHeightM < 1000) lclTerm = 1.0;
  if (lclHeightM > 2000) lclTerm = 0.0;
  const srhTerm = srh01 / 150;
  let shearTerm = shear06 / 20;
  if (shear06 < 12.5) shearTerm = 0;
  if (shear06 > 30) shearTerm = 1.5;

  const stp = Math.max(0, capeTerm * lclTerm * srhTerm * shearTerm);
  return Math.round(stp * 10) / 10;
}

// Supercell Composite Parameter (SCP)
export function computeSupercellCompositeParameter(
  mucape: number,
  srh03: number,
  shear06: number
): number {
  const capeTerm = mucape / 1000;
  const srhTerm = srh03 / 50;
  const shearTerm = Math.min(1.5, Math.max(0, (shear06 - 10) / 10));
  const scp = Math.max(0, capeTerm * srhTerm * shearTerm);
  return Math.round(scp * 10) / 10;
}

// Calculate Lifted Condensation Level (LCL) height in meters via Espy's approximation
export function calculateLiftedCondensationLevel(tempC: number, dewC: number): number {
  const depression = Math.max(0, tempC - dewC);
  // ~125 meters per degree C spread
  return Math.round(depression * 125);
}

// Generate realistic thermodynamic sounding profile for given location
export function generateThermodynamicSounding(lat: number, lon: number): SoundingProfile {
  // Synthesize realistic atmospheric instability parameters
  const seasonalMultiplier = 1.2;
  const sbcape = Math.round((2200 + Math.sin(lat * 0.12) * 1100 + Math.cos(lon * 0.08) * 800) * seasonalMultiplier);
  const mlcape = Math.round(sbcape * 0.76);
  const mucape = Math.round(sbcape * 1.15);
  const cin = Math.round(-15 - Math.abs(Math.sin(lat + lon)) * 45);

  const srh01 = Math.round(210 + Math.abs(Math.sin(lon * 0.1)) * 140);
  const srh03 = Math.round(srh01 * 1.6);
  const shear06 = Math.round(48 + Math.cos(lat * 0.15) * 14);

  const lclHeightM = calculateLiftedCondensationLevel(27, 21); // 750m
  const lfcHeightM = lclHeightM + 600;

  const stp = computeSignificantTornadoParameter(sbcape, srh01, shear06, lclHeightM);
  const scp = computeSupercellCompositeParameter(mucape, srh03, shear06);

  let hazardRating: SoundingIndices['hazardRating'] = 'LOW';
  if (stp >= 3.0) hazardRating = 'EXTREME TORNADIC';
  else if (stp >= 1.0) hazardRating = 'SEVERE';
  else if (sbcape > 1500) hazardRating = 'ELEVATED';

  // Standard pressure levels from surface 1000 mb to tropopause 200 mb
  const pressureLevels = [1000, 925, 850, 700, 500, 400, 300, 250, 200];
  const levels: SoundingLevel[] = pressureLevels.map((p, idx) => {
    const heightM = Math.round(120 + idx * 1320);
    const tempC = Math.round(26 - idx * 8.5);
    const dewC = Math.round(20 - idx * 12.2);
    const windSpdKt = Math.round(14 + idx * 8.5);
    const windDirDeg = Math.round((190 + idx * 11) % 360);
    return { pressureMb: p, heightM, tempC, dewC, windSpdKt, windDirDeg };
  });

  return {
    station: `SND-${lat > 0 ? lat.toFixed(1) + 'N' : Math.abs(lat).toFixed(1) + 'S'}/${lon > 0 ? lon.toFixed(1) + 'E' : Math.abs(lon).toFixed(1) + 'W'}`,
    lat,
    lon,
    elevationM: 180,
    timestamp: new Date().toISOString(),
    indices: {
      sbcape,
      mlcape,
      mucape,
      cin,
      srh01,
      srh03,
      shear06,
      liftedIndex: -6.2,
      lclHeightM,
      lfcHeightM,
      pwat: 1.62,
      stp,
      scp,
      hazardRating,
    },
    levels,
  };
}
