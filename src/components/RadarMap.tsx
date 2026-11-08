import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Configure MapLibre worker using local same-origin bundle
if (typeof window !== 'undefined' && (maplibregl as any).setWorkerUrl) {
  try {
    (maplibregl as any).setWorkerUrl('/maplibre-gl-worker.mjs');
  } catch (e) {
    // ignore
  }
}
import { RADAR_SITES, RadarSiteInfo, RadarProduct, ElevationTilt, PalettePreset } from '../lib/radar-config';
import { calculatePolarCoordinates, calculateBeamHeight, classifyStormGate, RadarSampling } from '../lib/radar-physics';
import { SoundingProfile, generateThermodynamicSounding } from '../lib/skewt-engine';

export type MapBaseStyle = 'dark' | 'satellite' | 'terrain' | 'street';

export type SpotterPin = {
  id: string;
  hazardType: string;
  description: string;
  hailSize?: string;
  lat: number;
  lon: number;
  timestamp: string;
  callsign: string;
};

type RadarMapProps = {
  product: RadarProduct;
  radarSite: string;
  tilt: ElevationTilt;
  palette: PalettePreset;
  baseStyle: MapBaseStyle;
  activeFrameUrl?: string;
  fastScan?: boolean;
  showWarnings?: boolean;
  showOutlooks?: boolean;
  showWatches?: boolean;
  showLightning?: boolean;
  showMetars?: boolean;
  showLSR?: boolean;
  showRadarPills?: boolean;
  showSpotters?: boolean;
  spotterReports?: SpotterPin[];
  isTelestratorActive?: boolean;
  telestratorColor?: string;
  onSelectSite?: (siteId: string) => void;
  onOpenSounding?: (profile: SoundingProfile) => void;
  onOpenSpotterForm?: (coords: [number, number]) => void;
};

const RADAR_SOURCE_ID = 'mesovortex-nexrad';
const RADAR_LAYER_ID = 'mesovortex-nexrad-layer';
const WARNINGS_SOURCE_ID = 'nws-warnings';
const WARNINGS_FILL_ID = 'nws-warnings-fill';
const WARNINGS_LINE_ID = 'nws-warnings-line';
const OUTLOOKS_SOURCE_ID = 'spc-outlooks';
const OUTLOOKS_FILL_ID = 'spc-outlooks-fill';
const OUTLOOKS_LINE_ID = 'spc-outlooks-line';
const WATCHES_SOURCE_ID = 'spc-watches';
const WATCHES_FILL_ID = 'spc-watches-fill';
const WATCHES_LINE_ID = 'spc-watches-line';
const LSR_SOURCE_ID = 'nws-lsr';
const LSR_CIRCLE_ID = 'nws-lsr-circle';
const LSR_LABEL_ID = 'nws-lsr-label';

function getMapLibreStyle(baseStyle: MapBaseStyle): StyleSpecification {
  let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  let attribution = '© ESRI Dark Canvas | © OpenStreetMap';

  if (baseStyle === 'satellite') {
    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    attribution = '© ESRI World Imagery';
  } else if (baseStyle === 'terrain') {
    tileUrl = 'https://tile.opentopomap.org/{z}/{x}/{y}.png';
    attribution = '© OpenTopoMap';
  } else if (baseStyle === 'street') {
    tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    attribution = '© OpenStreetMap contributors';
  }

  return {
    version: 8,
    sources: {
      baseRaster: {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        attribution,
      },
    },
    layers: [
      {
        id: 'base-tiles',
        type: 'raster',
        source: 'baseRaster',
        paint: {
          'raster-opacity': 1.0,
          'raster-contrast': baseStyle === 'dark' ? 0.1 : 0.0,
        },
      },
    ],
  };
}

export function RadarMap({
  product,
  radarSite,
  tilt,
  palette,
  baseStyle,
  activeFrameUrl,
  fastScan = true,
  showWarnings = true,
  showOutlooks = true,
  showWatches = true,
  showLightning = true,
  showMetars = true,
  showLSR = true,
  showRadarPills = true,
  showSpotters = true,
  spotterReports = [],
  isTelestratorActive = false,
  telestratorColor = '#ef4444',
  onSelectSite,
  onOpenSounding,
  onOpenSpotterForm,
}: RadarMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const siteMarkersRef = useRef<maplibregl.Marker[]>([]);
  const spotterMarkersRef = useRef<maplibregl.Marker[]>([]);
  const lightningCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const telestratorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [telemetry, setTelemetry] = useState<RadarSampling | null>(null);
  const [lightningStrikes, setLightningStrikes] = useState<{ x: number; y: number; time: number }[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const activeSite: RadarSiteInfo =
    RADAR_SITES.find((s) => s.id === radarSite || s.radarId === radarSite) ||
    RADAR_SITES[0];

  // Helper to safely add layer
  const safeAddLayer = (map: MapLibreMap, layer: any, beforeId?: string) => {
    try {
      if (!map.getLayer(layer.id)) {
        const validBefore = beforeId && map.getLayer(beforeId) ? beforeId : undefined;
        map.addLayer(layer, validBefore);
      }
    } catch (e) {
      console.warn(`Layer notice (${layer.id}):`, e);
    }
  };

  // Determine radar tile URL with zero-503 resilient proxying
  const getRadarTileUrl = useCallback(() => {
    if (activeFrameUrl) return activeFrameUrl;
    return `/api/radar-tile?product=${product}&site=${activeSite.radarId}&tilt=${tilt}&z={z}&x={x}&y={y}`;
  }, [activeFrameUrl, product, tilt, activeSite.radarId]);

  // Install or update Radar Tile Layer
  const updateRadarLayer = useCallback(
    (map: MapLibreMap) => {
      const tileUrl = getRadarTileUrl();
      try {
        if (map.getLayer(RADAR_LAYER_ID)) map.removeLayer(RADAR_LAYER_ID);
        if (map.getSource(RADAR_SOURCE_ID)) map.removeSource(RADAR_SOURCE_ID);

        map.addSource(RADAR_SOURCE_ID, {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
          scheme: 'xyz',
          attribution: 'NOAA NEXRAD & MRMS',
        });

        // Palette tone adjustments
        let contrast = 0.2;
        let saturation = 0.4;
        let hueRotate = 0;

        if (palette === 'radarscope') {
          contrast = 0.5;
          saturation = 0.8;
          hueRotate = 10;
        } else if (palette === 'couplet') {
          contrast = 0.7;
          saturation = 0.9;
          hueRotate = 140;
        } else if (palette === 'smooth') {
          contrast = 0.1;
          saturation = 0.35;
        } else if (palette === 'cod') {
          contrast = 0.4;
          saturation = 0.6;
          hueRotate = -20;
        }

        safeAddLayer(map, {
          id: RADAR_LAYER_ID,
          type: 'raster',
          source: RADAR_SOURCE_ID,
          paint: {
            'raster-opacity': 0.85,
            'raster-contrast': contrast,
            'raster-saturation': saturation,
            'raster-hue-rotate': hueRotate,
            'raster-fade-duration': 0,
          },
        });
      } catch (err) {
        console.warn('Radar update notice:', err);
      }
    },
    [getRadarTileUrl, palette]
  );

  // Install Warning Polygons Layer
  const updateWarningLayer = useCallback((map: MapLibreMap) => {
    fetch('/api/warnings')
      .then((res) => res.json())
      .then((data) => {
        if (!map.getSource(WARNINGS_SOURCE_ID)) {
          map.addSource(WARNINGS_SOURCE_ID, { type: 'geojson', data });
          safeAddLayer(map, {
            id: WARNINGS_FILL_ID,
            type: 'fill',
            source: WARNINGS_SOURCE_ID,
            paint: {
              'fill-color': [
                'match',
                ['get', 'event'],
                'Tornado Warning', '#ef4444',
                'Severe Thunderstorm Warning', '#f59e0b',
                'Flash Flood Warning', '#10b981',
                'Special Marine Warning', '#06b6d4',
                '#3b82f6',
              ],
              'fill-opacity': 0.28,
            },
            layout: { visibility: showWarnings ? 'visible' : 'none' },
          });
          safeAddLayer(map, {
            id: WARNINGS_LINE_ID,
            type: 'line',
            source: WARNINGS_SOURCE_ID,
            paint: {
              'line-color': [
                'match',
                ['get', 'event'],
                'Tornado Warning', '#ff2222',
                'Severe Thunderstorm Warning', '#fbbf24',
                'Flash Flood Warning', '#34d399',
                '#60a5fa',
              ],
              'line-width': 2.8,
            },
            layout: { visibility: showWarnings ? 'visible' : 'none' },
          });
        } else {
          (map.getSource(WARNINGS_SOURCE_ID) as maplibregl.GeoJSONSource).setData(data);
          if (map.getLayer(WARNINGS_FILL_ID)) {
            map.setLayoutProperty(WARNINGS_FILL_ID, 'visibility', showWarnings ? 'visible' : 'none');
          }
          if (map.getLayer(WARNINGS_LINE_ID)) {
            map.setLayoutProperty(WARNINGS_LINE_ID, 'visibility', showWarnings ? 'visible' : 'none');
          }
        }
      })
      .catch((err) => console.warn('Warnings notice:', err));
  }, [showWarnings]);

  // Install SPC Convective Outlook Layer
  const updateOutlooksLayer = useCallback((map: MapLibreMap) => {
    fetch('/api/spc/outlooks')
      .then((res) => res.json())
      .then((data) => {
        if (!map.getSource(OUTLOOKS_SOURCE_ID)) {
          map.addSource(OUTLOOKS_SOURCE_ID, { type: 'geojson', data });
          safeAddLayer(map, {
            id: OUTLOOKS_FILL_ID,
            type: 'fill',
            source: OUTLOOKS_SOURCE_ID,
            paint: {
              'fill-color': [
                'match',
                ['get', 'LABEL'],
                'TSTM', '#81c784',
                'MRGL', '#4caf50',
                'SLGT', '#fbc02d',
                'ENH', '#f57c00',
                'MDT', '#d32f2f',
                'HIGH', '#aa00ff',
                'rgba(0,0,0,0)',
              ],
              'fill-opacity': 0.22,
            },
            layout: { visibility: showOutlooks ? 'visible' : 'none' },
          });
          safeAddLayer(map, {
            id: OUTLOOKS_LINE_ID,
            type: 'line',
            source: OUTLOOKS_SOURCE_ID,
            paint: {
              'line-color': [
                'match',
                ['get', 'LABEL'],
                'TSTM', '#81c784',
                'MRGL', '#4caf50',
                'SLGT', '#fbc02d',
                'ENH', '#f57c00',
                'MDT', '#d32f2f',
                'HIGH', '#aa00ff',
                '#ffffff',
              ],
              'line-width': 2,
              'line-dasharray': [3, 2],
            },
            layout: { visibility: showOutlooks ? 'visible' : 'none' },
          });
        } else {
          if (map.getLayer(OUTLOOKS_FILL_ID)) {
            map.setLayoutProperty(OUTLOOKS_FILL_ID, 'visibility', showOutlooks ? 'visible' : 'none');
          }
          if (map.getLayer(OUTLOOKS_LINE_ID)) {
            map.setLayoutProperty(OUTLOOKS_LINE_ID, 'visibility', showOutlooks ? 'visible' : 'none');
          }
        }
      })
      .catch((err) => console.warn('SPC outlook notice:', err));
  }, [showOutlooks]);

  // Install Watch Boxes Layer
  const updateWatchesLayer = useCallback((map: MapLibreMap) => {
    fetch('/api/watches')
      .then((res) => res.json())
      .then((data) => {
        if (!map.getSource(WATCHES_SOURCE_ID)) {
          map.addSource(WATCHES_SOURCE_ID, { type: 'geojson', data });
          safeAddLayer(map, {
            id: WATCHES_FILL_ID,
            type: 'fill',
            source: WATCHES_SOURCE_ID,
            paint: {
              'fill-color': [
                'match',
                ['get', 'event'],
                'Tornado Watch', '#ef4444',
                'Severe Thunderstorm Watch', '#eab308',
                '#3b82f6',
              ],
              'fill-opacity': 0.12,
            },
            layout: { visibility: showWatches ? 'visible' : 'none' },
          });
          safeAddLayer(map, {
            id: WATCHES_LINE_ID,
            type: 'line',
            source: WATCHES_SOURCE_ID,
            paint: {
              'line-color': [
                'match',
                ['get', 'event'],
                'Tornado Watch', '#ef4444',
                'Severe Thunderstorm Watch', '#facc15',
                '#60a5fa',
              ],
              'line-width': 2.5,
              'line-dasharray': [4, 3],
            },
            layout: { visibility: showWatches ? 'visible' : 'none' },
          });
        } else {
          if (map.getLayer(WATCHES_FILL_ID)) {
            map.setLayoutProperty(WATCHES_FILL_ID, 'visibility', showWatches ? 'visible' : 'none');
          }
          if (map.getLayer(WATCHES_LINE_ID)) {
            map.setLayoutProperty(WATCHES_LINE_ID, 'visibility', showWatches ? 'visible' : 'none');
          }
        }
      })
      .catch((err) => console.warn('Watches notice:', err));
  }, [showWatches]);

  // Install Local Storm Reports (LSR)
  const updateLSRLayer = useCallback((map: MapLibreMap) => {
    fetch('/api/lsr')
      .then((res) => res.json())
      .then((data) => {
        if (!map.getSource(LSR_SOURCE_ID)) {
          map.addSource(LSR_SOURCE_ID, { type: 'geojson', data });
          safeAddLayer(map, {
            id: LSR_CIRCLE_ID,
            type: 'circle',
            source: LSR_SOURCE_ID,
            paint: {
              'circle-radius': 6,
              'circle-color': [
                'match',
                ['get', 'type'],
                'TORNADO', '#dc2626',
                'HAIL', '#0284c7',
                'TSTM WND DMG', '#eab308',
                '#10b981',
              ],
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff',
            },
            layout: { visibility: showLSR ? 'visible' : 'none' },
          });
          safeAddLayer(map, {
            id: LSR_LABEL_ID,
            type: 'symbol',
            source: LSR_SOURCE_ID,
            layout: {
              'text-field': ['get', 'magnitude'],
              'text-size': 10,
              'text-offset': [0, 1.2],
              'text-anchor': 'top',
              visibility: showLSR ? 'visible' : 'none',
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#020617',
              'text-halo-width': 1.5,
            },
          });
        } else {
          if (map.getLayer(LSR_CIRCLE_ID)) {
            map.setLayoutProperty(LSR_CIRCLE_ID, 'visibility', showLSR ? 'visible' : 'none');
          }
          if (map.getLayer(LSR_LABEL_ID)) {
            map.setLayoutProperty(LSR_LABEL_ID, 'visibility', showLSR ? 'visible' : 'none');
          }
        }
      })
      .catch((err) => console.warn('LSR notice:', err));
  }, [showLSR]);

  // Render WeatherWise Radar Site Tower Marker Pills
  const renderSitePills = useCallback((map: MapLibreMap) => {
    siteMarkersRef.current.forEach((m) => m.remove());
    siteMarkersRef.current = [];
    if (!showRadarPills) return;

    RADAR_SITES.forEach((site) => {
      const isActive = site.id === radarSite || site.radarId === radarSite;
      const pill = document.createElement('div');
      pill.className = `group flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider cursor-pointer transition shadow-lg backdrop-blur-md ${
        isActive
          ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950'
          : 'bg-slate-950/80 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/40 hover:text-white'
      }`;
      pill.title = `${site.name} (${site.id})`;
      pill.innerHTML = `
        <span class="h-1.5 w-1.5 rounded-full ${isActive ? 'bg-slate-950 animate-ping' : 'bg-cyan-400'}"></span>
        <span>${site.radarId}</span>
      `;
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectSite?.(site.id);
      });

      const marker = new maplibregl.Marker({ element: pill })
        .setLngLat([site.lon, site.lat])
        .addTo(map);
      siteMarkersRef.current.push(marker);
    });
  }, [radarSite, showRadarPills, onSelectSite]);

  // Render Spotter Pins
  const renderSpotterPins = useCallback((map: MapLibreMap) => {
    spotterMarkersRef.current.forEach((m) => m.remove());
    spotterMarkersRef.current = [];
    if (!showSpotters) return;

    spotterReports.forEach((spotter) => {
      const el = document.createElement('div');
      el.className = 'flex flex-col items-center cursor-pointer pointer-events-auto';
      el.innerHTML = `
        <div class="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase shadow-lg border border-white/20 whitespace-nowrap">
          ${spotter.hazardType} ${spotter.hailSize ? `(${spotter.hailSize})` : ''}
        </div>
        <div class="text-[9px] font-mono text-cyan-300 font-bold bg-slate-950/80 px-1 rounded mt-0.5">${spotter.callsign}</div>
      `;
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([spotter.lon, spotter.lat])
        .addTo(map);
      spotterMarkersRef.current.push(marker);
    });
  }, [showSpotters, spotterReports]);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;
    setMapReady(false);

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapLibreStyle(baseStyle),
      center: [activeSite.lon, activeSite.lat],
      zoom: 7.6,
      attributionControl: { compact: true },
    });
    map.on('error', (e) => {
      // Absorb transient 503/404/Abort errors so they do not crash or throw unhandled exceptions
      const err = e?.error as any;
      if (!err || err.status === 503 || err.status === 404 || err.name === 'AbortError') {
        return;
      }
      console.warn('Map notice:', e);
    });

    map.on('load', () => {
      setMapReady(true);
      updateRadarLayer(map);
      updateWarningLayer(map);
      updateOutlooksLayer(map);
      updateWatchesLayer(map);
      updateLSRLayer(map);
      renderSitePills(map);
      renderSpotterPins(map);
    });

    // Real-Time Radar Beam Physics Sampling on Mousemove
    map.on('mousemove', (e) => {
      const { distanceKm, distanceNm, azimuthDeg } = calculatePolarCoordinates(
        activeSite.lat,
        activeSite.lon,
        e.lngLat.lat,
        e.lngLat.lng
      );
      const tiltAngle = parseFloat(tilt) || 0.5;
      const beamHeightFt = calculateBeamHeight(distanceKm, tiltAngle, activeSite.elevation || 200);

      // Deterministic gate response based on distance, azimuth, and active storm signatures
      let simulatedVal = 0;
      let unit = 'dBZ';

      if (product === 'mesh') {
        simulatedVal = Math.max(0.5, Math.min(3.5, Math.round((3.8 - distanceNm * 0.04) * 10) / 10));
        unit = 'in (Hail)';
      } else if (product === 'azshear') {
        simulatedVal = Math.round(Math.abs(Math.sin((azimuthDeg * Math.PI) / 180)) * 25) / 1000;
        unit = 's⁻¹';
      } else if (product === 'ref') {
        simulatedVal = Math.max(10, Math.min(72, Math.round(72 - distanceNm * 0.35 + Math.sin(azimuthDeg) * 8)));
      } else if (product === 'vel' || product === 'srvel') {
        simulatedVal = Math.round(Math.sin((azimuthDeg * Math.PI) / 180) * 58);
        unit = 'kt';
      } else if (product === 'cc') {
        simulatedVal = distanceNm < 25 && Math.abs(azimuthDeg - 215) < 30 ? 0.68 : 0.98;
        unit = 'CC';
      } else if (product === 'zdr') {
        simulatedVal = 0.2;
        unit = 'dB';
      } else {
        simulatedVal = 35;
      }

      const classification = classifyStormGate(product, simulatedVal);
      setTelemetry({
        distanceKm,
        distanceNm,
        azimuthDeg,
        beamHeightFt,
        estimatedValue: simulatedVal,
        unit,
        signatureBadge: classification.badge,
        hazardLevel: classification.hazardLevel,
      });
    });

    // Map Click: Sample Sounding at clicked coordinates or submit spotter report
    map.on('click', (e) => {
      if (isTelestratorActive) return; // Handled by telestrator
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      if (e.originalEvent.shiftKey) {
        onOpenSpotterForm?.(coords);
      } else {
        const sounding = generateThermodynamicSounding(coords[1], coords[0]);
        onOpenSounding?.(sounding);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [baseStyle, activeSite.radarId]); // Recreate on base style or primary radar site change

  // Synchronize dynamic layers when map is ready and props update
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    updateRadarLayer(map);
  }, [mapReady, updateRadarLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    updateWarningLayer(map);
  }, [mapReady, showWarnings, updateWarningLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    updateOutlooksLayer(map);
  }, [mapReady, showOutlooks, updateOutlooksLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    updateWatchesLayer(map);
  }, [mapReady, showWatches, updateWatchesLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    updateLSRLayer(map);
  }, [mapReady, showLSR, updateLSRLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    renderSitePills(map);
  }, [mapReady, renderSitePills]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    renderSpotterPins(map);
  }, [mapReady, renderSpotterPins]);

  // Recenter map smoothly when radarSite prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.flyTo({
      center: [activeSite.lon, activeSite.lat],
      zoom: 7.6,
      speed: 1.4,
    });
  }, [radarSite]);

  // Simulated Lightning Flashes
  useEffect(() => {
    if (!showLightning) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 80 + 20;
        const x = window.innerWidth / 2 + Math.cos(angle) * radius;
        const y = window.innerHeight / 2 + Math.sin(angle) * radius;
        setLightningStrikes((prev) => [...prev.slice(-15), { x, y, time: Date.now() }]);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [showLightning]);

  // Telestrator Drawing Mechanics
  const isDrawingRef = useRef(false);
  const handleTelestratorMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isTelestratorActive) return;
    const canvas = telestratorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = telestratorColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const handleTelestratorMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isTelestratorActive) return;
    const canvas = telestratorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const handleTelestratorMouseUp = () => {
    isDrawingRef.current = false;
  };

  return (
    <div className="relative h-full w-full overflow-hidden select-none bg-[#070b13]">
      {/* 1. Primary MapLibre Container */}
      <div ref={containerRef} className="h-full w-full" />

      {/* 2. Telestrator Drawing Canvas Overlay (when enabled) */}
      {isTelestratorActive && (
        <canvas
          ref={telestratorCanvasRef}
          width={typeof window !== 'undefined' ? window.innerWidth : 1440}
          height={typeof window !== 'undefined' ? window.innerHeight : 900}
          onMouseDown={handleTelestratorMouseDown}
          onMouseMove={handleTelestratorMouseMove}
          onMouseUp={handleTelestratorMouseUp}
          className="absolute inset-0 z-20 cursor-crosshair"
        />
      )}

      {/* 3. Lightning Flash Overlay */}
      {showLightning && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {lightningStrikes.map((s) => (
            <div
              key={s.time}
              style={{ left: s.x, top: s.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-ping"
            >
              <span className="text-yellow-300 text-lg drop-shadow-[0_0_8px_#fde047]">⚡</span>
            </div>
          ))}
        </div>
      )}

      {/* 4. Real-Time Radar Beam Physics HUD Telemetry (WeatherWise Pro Gate Sampling) */}
      {telemetry && (
        <div className="pointer-events-none absolute bottom-16 left-4 z-20 flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-2.5 font-mono text-xs shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-bold text-white tracking-wider">
                {activeSite.radarId} GATE SAMPLE
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${
                telemetry.hazardLevel === 'tornadic'
                  ? 'bg-purple-600 text-white animate-pulse'
                  : telemetry.hazardLevel === 'severe'
                  ? 'bg-red-600 text-white'
                  : telemetry.hazardLevel === 'elevated'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-cyan-300'
              }`}
            >
              {telemetry.signatureBadge || 'Gate Echo'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-1 text-[11px]">
            <div>
              <span className="text-slate-400">Range:</span>{' '}
              <span className="font-bold text-white">{telemetry.distanceNm} nm</span>{' '}
              <span className="text-[10px] text-slate-500">({telemetry.distanceKm} km)</span>
            </div>
            <div>
              <span className="text-slate-400">Azimuth:</span>{' '}
              <span className="font-bold text-white">{telemetry.azimuthDeg}°</span>
            </div>
            <div>
              <span className="text-slate-400">Beam Height:</span>{' '}
              <span className="font-bold text-cyan-300">
                {telemetry.beamHeightFt.toLocaleString()} ft AGL
              </span>
            </div>
            <div>
              <span className="text-slate-400">Value:</span>{' '}
              <span className="font-bold text-amber-300">
                {telemetry.estimatedValue} {telemetry.unit}
              </span>
            </div>
          </div>
          <div className="pt-1 text-[9px] text-slate-400 flex items-center justify-between border-t border-white/5">
            <span>Click map for Skew-T Sounding</span>
            <span>Shift+Click to Report Spotter</span>
          </div>
        </div>
      )}

      {/* 5. FastScan Low Latency Radar Indicator */}
      <div className="pointer-events-none absolute top-16 right-4 z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md">
        <span className={`h-2 w-2 rounded-full ${fastScan ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300">
          WSR-88D {activeSite.radarId} · TILT {tilt}° · {product.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
