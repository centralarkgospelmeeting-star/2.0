export type PlacefileCategory =
  | 'Surface & Mesonets'
  | 'Lightning & mPING'
  | 'Severe & Warnings'
  | 'SPC Outlooks & Fire'
  | 'Marine, Tropical & Hydro'
  | 'Infrastructure & Geohazards';

export type PlacefileMeta = {
  id: string;
  name: string;
  category: PlacefileCategory;
  url: string;
  description: string;
  defaultEnabled?: boolean;
};

export type ActivePlacefile = {
  id: string;
  name: string;
  url: string;
  category: PlacefileCategory;
  enabled: boolean;
};

export const PLACEFILE_NATION_CATALOG: PlacefileMeta[] = [
  // 1. Surface & Mesonets
  {
    id: 'pfn-metars',
    name: 'METAR Station Plots',
    category: 'Surface & Mesonets',
    url: 'https://placefilenation.com/Placefiles/metars.php',
    description: 'Full surface METAR airport station observation plots with wind barbs and flight ceiling.',
    defaultEnabled: true,
  },
  {
    id: 'pfn-conditions',
    name: 'Weather Conditions',
    category: 'Surface & Mesonets',
    url: 'https://placefilenation.com/Placefiles/conditions.php',
    description: 'Current weather condition icons (rain, snow, fog, thunderstorms).',
  },
  {
    id: 'pfn-temps',
    name: 'Surface Temperatures',
    category: 'Surface & Mesonets',
    url: 'https://placefilenation.com/Placefiles/temps.php',
    description: 'Current ambient air temperature readings (°F).',
  },
  {
    id: 'pfn-dewpoints',
    name: 'Surface Dewpoints',
    category: 'Surface & Mesonets',
    url: 'https://placefilenation.com/Placefiles/dewpoints.php',
    description: 'Surface dewpoint analysis to locate drylines and moist inflow tongues.',
  },
  {
    id: 'pfn-windgusts',
    name: 'Peak Wind Gusts',
    category: 'Surface & Mesonets',
    url: 'https://placefilenation.com/Placefiles/gusts.php',
    description: 'Observed maximum wind gusts in knots.',
  },

  // 2. Lightning & mPING
  {
    id: 'pfn-lightning',
    name: 'GOES GLM Lightning Strikes',
    category: 'Lightning & mPING',
    url: 'https://placefilenation.com/Placefiles/lightning.php',
    description: 'Real-time in-cloud and cloud-to-ground lightning flashes with polarity.',
    defaultEnabled: true,
  },
  {
    id: 'pfn-mping',
    name: 'mPING Crowdsourced Precipitation',
    category: 'Lightning & mPING',
    url: 'https://placefilenation.com/Placefiles/mping.php',
    description: 'NSSL mPING crowdsourced ground-truth reports (hail diameter, rain/snow mix).',
  },

  // 3. Severe & Warnings
  {
    id: 'pfn-spotternetwork',
    name: 'SpotterNetwork Live Chasers & Reports',
    category: 'Severe & Warnings',
    url: 'https://placefilenation.com/Placefiles/spotternetwork.php',
    description: 'Verified storm chaser GPS positions and severe storm spotter hazard reports.',
    defaultEnabled: true,
  },
  {
    id: 'pfn-lsr',
    name: 'Local Storm Reports (LSR)',
    category: 'Severe & Warnings',
    url: 'https://placefilenation.com/Placefiles/lsr.php',
    description: 'Official NWS Local Storm Reports including tornado damage, wind, and hail.',
    defaultEnabled: true,
  },
  {
    id: 'pfn-mrms-mesh',
    name: 'MRMS MESH Hail Swaths',
    category: 'Severe & Warnings',
    url: 'https://placefilenation.com/Placefiles/mesh.php',
    description: 'Maximum Expected Size of Hail 60-minute cumulative swath contours.',
  },
  {
    id: 'pfn-mrms-azshear',
    name: 'MRMS AzShear Rotation Tracks',
    category: 'Severe & Warnings',
    url: 'https://placefilenation.com/Placefiles/azshear.php',
    description: '0-2km azimuthal shear accumulation to identify tornado tracks.',
  },

  // 4. SPC Outlooks & Fire
  {
    id: 'pfn-spc-day1',
    name: 'SPC Day 1 Convective Outlook',
    category: 'SPC Outlooks & Fire',
    url: 'https://placefilenation.com/Placefiles/spc_day1.php',
    description: 'NOAA Storm Prediction Center Day 1 severe risk categories (TSTM to HIGH).',
    defaultEnabled: true,
  },
  {
    id: 'pfn-spc-mcd',
    name: 'SPC Mesoscale Discussions (MCD)',
    category: 'SPC Outlooks & Fire',
    url: 'https://placefilenation.com/Placefiles/spc_mcd.php',
    description: 'Active SPC Mesoscale Discussions with watch probabilities.',
  },
  {
    id: 'pfn-spc-watches',
    name: 'SPC Tornado & Severe Watches',
    category: 'SPC Outlooks & Fire',
    url: 'https://placefilenation.com/Placefiles/watches.php',
    description: 'Active Tornado Watch and Severe Thunderstorm Watch boxes.',
    defaultEnabled: true,
  },
];
