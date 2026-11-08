import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

if (typeof window !== 'undefined' && (maplibregl as any).setWorkerUrl) {
  try {
    (maplibregl as any).setWorkerUrl('/maplibre-gl-worker.mjs');
  } catch (e) {}
}
import { RADAR_SITES } from '../lib/radar-config';

type QuadProps = {
  radarSite: string;
  onClose: () => void;
};

const QUAD_PRODUCTS = [
  { key: 'N0B', label: 'Super-Res Reflectivity (0.5°)', code: 'ref', badge: 'Z' },
  { key: 'N0U', label: 'Base Velocity (0.5°)', code: 'vel', badge: 'V' },
  { key: 'N0C', label: 'Correlation Coefficient (CC)', code: 'cc', badge: 'CC' },
  { key: 'N0S', label: 'Storm Relative Motion (SRM)', code: 'srvel', badge: 'SRM' },
];

export function SynchronizedQuadView({ radarSite, onClose }: QuadProps) {
  const containerRefs = [
    useRef<HTMLDivElement | null>(null),
    useRef<HTMLDivElement | null>(null),
    useRef<HTMLDivElement | null>(null),
    useRef<HTMLDivElement | null>(null),
  ];
  const mapsRef = useRef<(maplibregl.Map | null)[]>([null, null, null, null]);
  const isSyncingRef = useRef(false);

  const site =
    RADAR_SITES.find((s) => s.id === radarSite || s.radarId === radarSite) ||
    RADAR_SITES[0];

  useEffect(() => {
    QUAD_PRODUCTS.forEach((prod, index) => {
      const container = containerRefs[index].current;
      if (!container) return;

      const map = new maplibregl.Map({
        container,
        style: {
          version: 8,
          sources: {
            carto: {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
            },
            radar: {
              type: 'raster',
              tiles: [
                `/api/radar-tile?product=${prod.code}&site=${site.radarId}&tilt=0.5&z={z}&x={x}&y={y}`,
              ],
              tileSize: 256,
              scheme: 'xyz',
            },
          },
          layers: [
            { id: 'base-carto', type: 'raster', source: 'carto' },
            {
              id: 'radar-layer',
              type: 'raster',
              source: 'radar',
              paint: { 'raster-opacity': 0.88 },
            },
          ],
        },
        center: [site.lon, site.lat],
        zoom: 7.6,
        attributionControl: false,
      });

      mapsRef.current[index] = map;

      map.on('error', (e) => {
        const err = e?.error as any;
        if (!err || err.status === 503 || err.status === 404 || err.name === 'AbortError') {
          return;
        }
        console.warn('Quad map notice:', e);
      });

      // Camera synchronizer across all 4 quadrants
      map.on('move', () => {
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bearing = map.getBearing();
        const pitch = map.getPitch();

        mapsRef.current.forEach((otherMap, otherIdx) => {
          if (otherMap && otherIdx !== index) {
            otherMap.jumpTo({ center, zoom, bearing, pitch });
          }
        });
        isSyncingRef.current = false;
      });
    });

    return () => {
      mapsRef.current.forEach((m) => m?.remove());
      mapsRef.current = [null, null, null, null];
    };
  }, [site.radarId, site.lat, site.lon]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070b13] select-none">
      {/* Top Header */}
      <div className="flex h-12 items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-600/30 text-cyan-400 font-bold text-xs">
            ⚡
          </span>
          <span className="rounded bg-cyan-600/30 px-2 py-0.5 text-xs font-bold text-cyan-400">
            QUAD SYNCHRO RADAR
          </span>
          <span className="text-sm font-semibold text-white">
            NEXRAD {site.radarId} — {site.name} ({site.state})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Zoom / pan any quadrant to synchronize all 4 cameras simultaneously
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            ✕ Exit Quad
          </button>
        </div>
      </div>

      {/* 2x2 Synced Screen Grid */}
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1 bg-black p-1">
        {QUAD_PRODUCTS.map((prod, idx) => (
          <div
            key={prod.key}
            className="relative h-full w-full overflow-hidden rounded-xl border border-slate-800"
          >
            <div ref={containerRefs[idx]} className="h-full w-full" />
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-xl bg-slate-950/85 px-3 py-1.5 text-xs font-bold tracking-wide text-cyan-300 backdrop-blur-md border border-white/10 shadow-lg">
              <span className="rounded bg-cyan-500/20 px-1 text-[10px] text-cyan-400 font-mono">
                {prod.badge}
              </span>
              <span>{prod.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
