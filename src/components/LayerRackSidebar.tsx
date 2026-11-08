import React from 'react';
import {
  RadarProduct,
  ElevationTilt,
  PalettePreset,
  RADAR_PRODUCTS_CONFIG,
} from '../lib/radar-config';
import { MapBaseStyle } from './RadarMap';

type LayerRackSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  product: RadarProduct;
  setProduct: (p: RadarProduct) => void;
  tilt: ElevationTilt;
  setTilt: (t: ElevationTilt) => void;
  palette: PalettePreset;
  setPalette: (p: PalettePreset) => void;
  baseStyle: MapBaseStyle;
  setBaseStyle: (b: MapBaseStyle) => void;
  showWarnings: boolean;
  setShowWarnings: (fn: (v: boolean) => boolean) => void;
  showOutlooks: boolean;
  setShowOutlooks: (fn: (v: boolean) => boolean) => void;
  showWatches: boolean;
  setShowWatches: (fn: (v: boolean) => boolean) => void;
  showLightning: boolean;
  setShowLightning: (fn: (v: boolean) => boolean) => void;
  showMetars: boolean;
  setShowMetars: (fn: (v: boolean) => boolean) => void;
  showLSR: boolean;
  setShowLSR: (fn: (v: boolean) => boolean) => void;
  showRadarPills: boolean;
  setShowRadarPills: (fn: (v: boolean) => boolean) => void;
  showSpotters: boolean;
  setShowSpotters: (fn: (v: boolean) => boolean) => void;
  onOpenColorPaletteModal?: () => void;
};

export function LayerRackSidebar({
  isOpen,
  onToggle,
  product,
  setProduct,
  tilt,
  setTilt,
  palette,
  setPalette,
  baseStyle,
  setBaseStyle,
  showWarnings,
  setShowWarnings,
  showOutlooks,
  setShowOutlooks,
  showWatches,
  setShowWatches,
  showLightning,
  setShowLightning,
  showMetars,
  setShowMetars,
  showLSR,
  setShowLSR,
  showRadarPills,
  setShowRadarPills,
  showSpotters,
  setShowSpotters,
  onOpenColorPaletteModal,
}: LayerRackSidebarProps) {
  const activeProduct = RADAR_PRODUCTS_CONFIG.find((p) => p.key === product) || RADAR_PRODUCTS_CONFIG[0];

  return (
    <>
      <aside
        className={`absolute right-3 top-16 bottom-16 z-40 w-72 sm:w-80 rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 flex-col overflow-hidden ${
          isOpen ? 'flex translate-x-0 opacity-100' : 'hidden'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-600/30 text-cyan-400 font-bold text-xs">
              ⚙️
            </span>
            <span className="text-xs font-black tracking-wide text-white uppercase">
              WORKSTATION LAYERS
            </span>
          </div>
          <button
            onClick={onToggle}
            className="rounded-full bg-white/5 p-1 text-slate-400 hover:bg-white/10 hover:text-white transition text-xs"
            title="Collapse Layers"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* 1. Radar Products Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Radar &amp; Dual-Pol Products
              </span>
              <span className="text-[9px] font-mono text-cyan-300 font-bold">{activeProduct.unit}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 font-bold text-[11px]">
              {RADAR_PRODUCTS_CONFIG.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setProduct(p.key)}
                  className={`rounded-xl py-2 px-2.5 text-left flex flex-col transition border ${
                    product === p.key
                      ? 'border-cyan-400 bg-cyan-600/30 text-white shadow-md'
                      : 'border-white/5 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="font-mono text-xs">{p.key.toUpperCase()}</span>
                  <span className="text-[9px] text-slate-400 font-sans truncate">{p.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-tight pt-1">
              {activeProduct.description}
            </p>
          </div>

          {/* 2. Elevation Tilt Slices */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Elevation Angle (VCP Tilt)
            </span>
            <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
              {(['0.5', '0.9', '1.3', '1.8'] as ElevationTilt[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTilt(t)}
                  className={`rounded-xl py-1.5 font-bold transition border ${
                    tilt === t
                      ? 'border-cyan-400 bg-cyan-500 text-slate-950 shadow-md'
                      : 'border-white/5 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {t}°
                </button>
              ))}
            </div>
          </div>

          {/* 3. Color Palette Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Color Palette Curve
              </span>
              <button
                onClick={onOpenColorPaletteModal}
                className="text-[9px] text-cyan-400 hover:underline"
              >
                Custom .PAL ↗
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
              {[
                { id: 'nws', label: 'NWS 88D' },
                { id: 'radarscope', label: 'Scope Pro' },
                { id: 'cod', label: 'COD Nex' },
                { id: 'smooth', label: 'Smooth' },
                { id: 'couplet', label: 'Couplet' },
                { id: 'palFile', label: 'Custom' },
              ].map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => setPalette(pal.id as PalettePreset)}
                  className={`rounded-xl py-1.5 transition border text-center ${
                    palette === pal.id
                      ? 'border-cyan-400 bg-cyan-600 text-white shadow'
                      : 'border-white/5 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {pal.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Base Map Style */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Base Cartography
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
              {[
                { id: 'dark', label: '🌙 Dark Matter' },
                { id: 'satellite', label: '🛰️ ESRI Satellite' },
                { id: 'terrain', label: '⛰️ Topo Terrain' },
                { id: 'street', label: '🗺️ Street Map' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setBaseStyle(style.id as MapBaseStyle)}
                  className={`rounded-xl py-1.5 px-2 text-left transition border ${
                    baseStyle === style.id
                      ? 'border-cyan-400 bg-cyan-600/30 text-white'
                      : 'border-white/5 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Meteorological Overlays Toggles */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Severe Weather Overlays
            </span>

            {[
              {
                label: 'NWS Active Warning Polygons',
                state: showWarnings,
                setter: setShowWarnings,
                color: 'text-red-400',
              },
              {
                label: 'SPC Day 1 Convective Outlook',
                state: showOutlooks,
                setter: setShowOutlooks,
                color: 'text-amber-400',
              },
              {
                label: 'Severe Watch Boxes',
                state: showWatches,
                setter: setShowWatches,
                color: 'text-blue-400',
              },
              {
                label: 'Real-Time Lightning Strikes',
                state: showLightning,
                setter: setShowLightning,
                color: 'text-yellow-400',
              },
              {
                label: 'Surface METAR Plots',
                state: showMetars,
                setter: setShowMetars,
                color: 'text-cyan-400',
              },
              {
                label: 'Local Storm Reports (LSR)',
                state: showLSR,
                setter: setShowLSR,
                color: 'text-pink-400',
              },
              {
                label: 'Radar Tower Marker Pills',
                state: showRadarPills,
                setter: setShowRadarPills,
                color: 'text-emerald-400',
              },
              {
                label: 'Spotter Network Reports',
                state: showSpotters,
                setter: setShowSpotters,
                color: 'text-orange-400',
              },
            ].map((layer) => (
              <label
                key={layer.label}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-white/5 cursor-pointer text-xs transition"
              >
                <span className={`font-semibold ${layer.color}`}>{layer.label}</span>
                <input
                  type="checkbox"
                  checked={layer.state}
                  onChange={() => layer.setter((v) => !v)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 h-4 w-4"
                />
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Collapsed Open Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="absolute right-3 top-16 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-slate-950/85 text-cyan-400 shadow-2xl backdrop-blur-xl hover:bg-slate-900 hover:text-white transition"
          title="Open Layer Rack"
        >
          ⚙️
        </button>
      )}
    </>
  );
}
