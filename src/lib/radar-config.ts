export type RadarProduct =
  | 'ref'
  | 'vel'
  | 'srvel'
  | 'cc'
  | 'zdr'
  | 'kdp'
  | 'mesh'
  | 'azshear'
  | 'tops'
  | 'vil';

export type ElevationTilt = '0.5' | '0.9' | '1.3' | '1.8';
export type WorkstationMode =
  | 'Radar'
  | 'Composite'
  | 'Satellite'
  | 'Models'
  | 'Outlooks'
  | 'Aviation & Marine'
  | 'Agriculture';

export type PalettePreset = 'nws' | 'radarscope' | 'cod' | 'smooth' | 'couplet' | 'palFile';

export type RadarSiteInfo = {
  id: string;
  radarId: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  state: string;
};

export const RADAR_SITES: RadarSiteInfo[] = [
  // Arkansas & Mid-South
  { id: 'KLZK', radarId: 'LZK', name: 'Little Rock / North Little Rock', lat: 34.836, lon: -92.262, elevation: 570, state: 'AR' },
  { id: 'KSRX', radarId: 'SRX', name: 'Fort Smith / Western Arkansas', lat: 35.290, lon: -94.362, elevation: 640, state: 'AR' },
  { id: 'KNQA', radarId: 'NQA', name: 'Memphis / Millington', lat: 35.345, lon: -89.873, elevation: 280, state: 'TN' },
  { id: 'KPAH', radarId: 'PAH', name: 'Paducah', lat: 37.068, lon: -88.772, elevation: 360, state: 'KY' },
  { id: 'KSGF', radarId: 'SGF', name: 'Springfield / Ozarks', lat: 37.235, lon: -93.401, elevation: 1278, state: 'MO' },
  
  // Southern Plains & Tornado Alley
  { id: 'KTLX', radarId: 'TLX', name: 'Oklahoma City / Norman', lat: 35.333, lon: -97.278, elevation: 370, state: 'OK' },
  { id: 'KOUN', radarId: 'OUN', name: 'Norman (NSSL Research Radar)', lat: 35.236, lon: -97.462, elevation: 1170, state: 'OK' },
  { id: 'KFDR', radarId: 'FDR', name: 'Frederick / Southwest OK', lat: 34.362, lon: -98.976, elevation: 1260, state: 'OK' },
  { id: 'KINX', radarId: 'INX', name: 'Tulsa / Inola', lat: 36.175, lon: -95.564, elevation: 668, state: 'OK' },
  { id: 'KFWS', radarId: 'FWS', name: 'Dallas / Fort Worth', lat: 32.573, lon: -97.303, elevation: 683, state: 'TX' },
  { id: 'KAMA', radarId: 'AMA', name: 'Amarillo / Texas Panhandle', lat: 35.233, lon: -101.709, elevation: 3585, state: 'TX' },
  { id: 'KLBB', radarId: 'LBB', name: 'Lubbock / South Plains', lat: 33.654, lon: -101.814, elevation: 3255, state: 'TX' },
  { id: 'KMAF', radarId: 'MAF', name: 'Midland / Odessa', lat: 31.943, lon: -102.189, elevation: 2860, state: 'TX' },
  { id: 'KSJT', radarId: 'SJT', name: 'San Angelo', lat: 31.371, lon: -100.492, elevation: 1890, state: 'TX' },
  { id: 'KDYX', radarId: 'DYX', name: 'Abilene / Dyess AFB', lat: 32.538, lon: -99.254, elevation: 1510, state: 'TX' },
  { id: 'KEWX', radarId: 'EWX', name: 'Austin / San Antonio', lat: 29.704, lon: -98.028, elevation: 630, state: 'TX' },
  { id: 'KHGX', radarId: 'HGX', name: 'Houston / Galveston', lat: 29.472, lon: -95.079, elevation: 18, state: 'TX' },
  { id: 'KCRP', radarId: 'CRP', name: 'Corpus Christi', lat: 27.784, lon: -97.511, elevation: 46, state: 'TX' },

  // Central Plains & Midwest
  { id: 'KICT', radarId: 'ICT', name: 'Wichita', lat: 37.654, lon: -97.443, elevation: 1333, state: 'KS' },
  { id: 'KDDC', radarId: 'DDC', name: 'Dodge City', lat: 37.761, lon: -99.969, elevation: 2590, state: 'KS' },
  { id: 'KTOP', radarId: 'TOP', name: 'Topeka', lat: 38.997, lon: -95.271, elevation: 880, state: 'KS' },
  { id: 'KEAX', radarId: 'EAX', name: 'Kansas City / Pleasant Hill', lat: 38.810, lon: -94.264, elevation: 995, state: 'MO' },
  { id: 'KLSX', radarId: 'LSX', name: 'St. Louis', lat: 38.699, lon: -90.683, elevation: 608, state: 'MO' },
  { id: 'KLOT', radarId: 'LOT', name: 'Chicago / Romeoville', lat: 41.604, lon: -88.085, elevation: 663, state: 'IL' },
  { id: 'KILX', radarId: 'ILX', name: 'Lincoln / Central Illinois', lat: 40.151, lon: -89.337, elevation: 580, state: 'IL' },
  { id: 'KIND', radarId: 'IND', name: 'Indianapolis', lat: 39.708, lon: -86.280, elevation: 790, state: 'IN' },
  { id: 'KDMX', radarId: 'DMX', name: 'Des Moines', lat: 41.731, lon: -93.723, elevation: 981, state: 'IA' },
  { id: 'KOAX', radarId: 'OAX', name: 'Omaha / Valley', lat: 41.320, lon: -96.366, elevation: 1140, state: 'NE' },
  { id: 'KUEX', radarId: 'UEX', name: 'Hastings', lat: 40.321, lon: -98.442, elevation: 1970, state: 'NE' },

  // Southeast & Dixie Alley
  { id: 'KBMX', radarId: 'BMX', name: 'Birmingham / Shelby County', lat: 33.172, lon: -86.770, elevation: 645, state: 'AL' },
  { id: 'KHTX', radarId: 'HTX', name: 'Huntsville / Hytop', lat: 34.931, lon: -86.084, elevation: 1760, state: 'AL' },
  { id: 'KMOB', radarId: 'MOB', name: 'Mobile', lat: 30.679, lon: -88.240, elevation: 208, state: 'AL' },
  { id: 'KGWX', radarId: 'GWX', name: 'Columbus AFB / Golden Triangle', lat: 33.897, lon: -88.329, elevation: 490, state: 'MS' },
  { id: 'KDGX', radarId: 'DGX', name: 'Jackson / Brandon', lat: 32.280, lon: -89.984, elevation: 380, state: 'MS' },
  { id: 'KFFC', radarId: 'FFC', name: 'Atlanta / Peachtree City', lat: 33.363, lon: -84.566, elevation: 866, state: 'GA' },
  { id: 'KJAX', radarId: 'JAX', name: 'Jacksonville', lat: 30.485, lon: -81.702, elevation: 40, state: 'FL' },
  { id: 'KTBW', radarId: 'TBW', name: 'Tampa Bay Area / Ruskin', lat: 27.705, lon: -82.402, elevation: 29, state: 'FL' },
  { id: 'KAMX', radarId: 'AMX', name: 'Miami', lat: 25.611, lon: -80.413, elevation: 14, state: 'FL' },

  // Northeast & Mid-Atlantic
  { id: 'KOKX', radarId: 'OKX', name: 'New York City / Upton', lat: 40.865, lon: -72.864, elevation: 84, state: 'NY' },
  { id: 'KDIX', radarId: 'DIX', name: 'Philadelphia / Mt Holly', lat: 39.947, lon: -74.411, elevation: 149, state: 'NJ' },
  { id: 'KLWX', radarId: 'LWX', name: 'Washington DC / Sterling', lat: 38.976, lon: -77.487, elevation: 290, state: 'VA' },
  { id: 'KBOX', radarId: 'BOX', name: 'Boston / Taunton', lat: 41.956, lon: -71.137, elevation: 125, state: 'MA' },

  // West & Rockies
  { id: 'KFTG', radarId: 'FTG', name: 'Denver / Front Range', lat: 39.787, lon: -104.546, elevation: 5500, state: 'CO' },
  { id: 'KABX', radarId: 'ABX', name: 'Albuquerque', lat: 35.150, lon: -106.824, elevation: 5870, state: 'NM' },
  { id: 'KPHX', radarId: 'PHX', name: 'Phoenix', lat: 33.289, lon: -111.670, elevation: 1380, state: 'AZ' },
  { id: 'KVTX', radarId: 'VTX', name: 'Los Angeles / Sulpher Mtn', lat: 34.412, lon: -119.320, elevation: 2710, state: 'CA' },
  { id: 'KMUX', radarId: 'MUX', name: 'San Francisco Bay / Mt Umunhum', lat: 37.155, lon: -121.898, elevation: 3480, state: 'CA' },
  { id: 'KATX', radarId: 'ATX', name: 'Seattle / Camano Island', lat: 48.195, lon: -122.496, elevation: 494, state: 'WA' },
];

export const RADAR_PRODUCTS_CONFIG: {
  key: RadarProduct;
  name: string;
  category: 'Reflectivity' | 'Velocity' | 'Dual-Pol' | 'Algorithmic';
  unit: string;
  code: string;
  description: string;
}[] = [
  { key: 'ref', name: 'Super-Res Reflectivity (Z)', category: 'Reflectivity', unit: 'dBZ', code: 'N0B', description: 'Precipitation intensity and core structure' },
  { key: 'vel', name: 'Base Velocity (V)', category: 'Velocity', unit: 'kt', code: 'N0U', description: 'Doppler wind speed towards/away from radar' },
  { key: 'srvel', name: 'Storm Relative Motion (SRM)', category: 'Velocity', unit: 'kt', code: 'N0S', description: 'Wind field relative to storm cell motion (couplet detection)' },
  { key: 'cc', name: 'Correlation Coefficient (CC)', category: 'Dual-Pol', unit: 'ratio', code: 'N0C', description: 'Uniformity of particles; drops <0.80 indicate Tornado Debris (TDS)' },
  { key: 'zdr', name: 'Differential Reflectivity (ZDR)', category: 'Dual-Pol', unit: 'dB', code: 'N0X', description: 'Hydrometeor shape; hail tumble produces ~0 dB with high dBZ' },
  { key: 'kdp', name: 'Specific Diff Phase (KDP)', category: 'Dual-Pol', unit: '°/km', code: 'N0K', description: 'Liquid water content and heavy rain/flash flood rate' },
  { key: 'mesh', name: 'Maximum Size of Hail (MESH)', category: 'Algorithmic', unit: 'in', code: 'MESH', description: 'MRMS 60-minute maximum hail diameter swath' },
  { key: 'azshear', name: 'Azimuthal Shear (AzShear)', category: 'Algorithmic', unit: 's⁻¹', code: 'AZSHEAR', description: 'MRMS low-level 0-2km rotation tracks and tornado paths' },
  { key: 'tops', name: 'Enhanced Echo Tops (EET)', category: 'Algorithmic', unit: 'kft', code: 'EET', description: 'Storm top altitude in thousands of feet' },
  { key: 'vil', name: 'Vertically Integrated Liquid (DVL)', category: 'Algorithmic', unit: 'kg/m²', code: 'DVL', description: 'Total water mass column (hail core & downburst indicator)' },
];
