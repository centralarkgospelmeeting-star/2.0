import React, { useState } from 'react';
import { RADAR_SITES, RadarSiteInfo, WorkstationMode } from '../lib/radar-config';

type TopPillBarProps = {
  mode: WorkstationMode;
  setMode: (mode: WorkstationMode) => void;
  radarSite: string;
  setRadarSite: (site: string) => void;
  fastScan: boolean;
  setFastScan: (fn: (prev: boolean) => boolean) => void;
  onOpenQuad: () => void;
  onOpenSounding: () => void;
  onOpenThreatMatrix: () => void;
  onOpenWeatherAssistant: () => void;
  onOpenPlacefiles: () => void;
  onOpenMetar: () => void;
  onOpenMarineAgri: () => void;
  isTelestratorActive: boolean;
  setIsTelestratorActive: (fn: (prev: boolean) => boolean) => void;
  isBroadcastMode: boolean;
  setIsBroadcastMode: (fn: (prev: boolean) => boolean) => void;
  leftSidebarOpen?: boolean;
  onToggleLeftSidebar?: () => void;
  rightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
  alertsCount?: number;
};

export function TopPillBar({
  mode,
  setMode,
  radarSite,
  setRadarSite,
  fastScan,
  setFastScan,
  onOpenQuad,
  onOpenSounding,
  onOpenThreatMatrix,
  onOpenWeatherAssistant,
  onOpenPlacefiles,
  onOpenMetar,
  onOpenMarineAgri,
  isTelestratorActive,
  setIsTelestratorActive,
  isBroadcastMode,
  setIsBroadcastMode,
  leftSidebarOpen,
  onToggleLeftSidebar,
  rightSidebarOpen,
  onToggleRightSidebar,
  alertsCount = 0,
}: TopPillBarProps) {
  const [siteSearchOpen, setSiteSearchOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const activeSite =
    RADAR_SITES.find((s) => s.id === radarSite || s.radarId === radarSite) ||
    RADAR_SITES[0];

  const filteredSites = RADAR_SITES.filter(
    (s) =>
      s.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <header className="pointer-events-none absolute left-0 right-0 top-3 z-30 flex justify-center px-2 sm:px-4">
      <nav className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto rounded-full border border-white/15 bg-slate-950/90 px-3 py-1.5 shadow-2xl backdrop-blur-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
        {/* Left Sidebar (Intel) Toggle */}
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition ${
              leftSidebarOpen
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            title="Toggle Weather Intelligence Panel"
          >
            <span>📊</span>
            <span className="hidden sm:inline">Intel</span>
          </button>
        )}

        {/* Brand */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/15">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 text-xs font-black shadow-md shadow-cyan-500/30">
            ⚡
          </span>
          <span className="text-xs font-black tracking-wider uppercase hidden sm:inline">
            MESO<span className="text-cyan-400">VORTEX</span>{' '}
            <span className="text-amber-400 font-bold text-[9px] bg-amber-400/20 px-1 rounded">PRO</span>
          </span>
        </div>

        {/* Workstation Modes */}
        <div className="flex items-center gap-1">
          {(
            [
              'Radar',
              'Composite',
              'Satellite',
              'Models',
              'Outlooks',
            ] as WorkstationMode[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`rounded-full px-2.5 sm:px-3 py-1 text-xs font-bold transition ${
                mode === tab
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Radar Site Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setSiteSearchOpen(!siteSearchOpen)}
            className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-slate-900/90 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 hover:border-cyan-400 transition"
            title="Switch NEXRAD Radar Site"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{activeSite.radarId}</span>
            <span className="text-[10px] text-slate-400 hidden md:inline">({activeSite.state})</span>
            <span className="text-[9px]">▾</span>
          </button>

          {siteSearchOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-white/15 bg-slate-950 p-2 shadow-2xl backdrop-blur-2xl z-50">
              <input
                type="text"
                placeholder="Search site, city, state..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
                autoFocus
              />
              <div className="mt-2 max-h-56 overflow-y-auto space-y-1 text-xs">
                {filteredSites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => {
                      setRadarSite(site.id);
                      setSiteSearchOpen(false);
                      setSearchFilter('');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                      site.id === radarSite
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>
                      <b className="font-mono">{site.radarId}</b> - {site.name}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">{site.state}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FastScan Low-Latency Toggle */}
        <button
          onClick={() => setFastScan((f) => !f)}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase transition ${
            fastScan
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_#10b981]'
              : 'border border-white/15 text-slate-400 hover:text-white'
          }`}
          title="Toggle FastScan Ultra-Low-Latency Polling"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${fastScan ? 'bg-slate-950 animate-ping' : 'bg-slate-500'}`} />
          FastScan
        </button>

        {/* Workstation Pro Launchers */}
        <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-white/15">
          <button
            onClick={onOpenQuad}
            className="rounded-full px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            title="Synchronized Quad 2x2 Radar View"
          >
            Quad View
          </button>
          <button
            onClick={onOpenSounding}
            className="rounded-full px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            title="Thermodynamic Skew-T Log-P Chart"
          >
            Skew-T
          </button>
          <button
            onClick={onOpenThreatMatrix}
            className="rounded-full px-2 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
            title="Severe Threat Matrix & Risk Gauge"
          >
            Threat Matrix
          </button>
          <button
            onClick={onOpenMetar}
            className="rounded-full px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            title="Aviation METAR Decoded Observations"
          >
            Aviation
          </button>
          <button
            onClick={onOpenMarineAgri}
            className="rounded-full px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            title="Marine Buoys & Agricultural Soil"
          >
            Marine/Ag
          </button>
          <button
            onClick={onOpenPlacefiles}
            className="rounded-full px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            title="GRLevelX Gibson Ridge Placefile Manager"
          >
            Placefiles
          </button>
          <button
            onClick={() => setIsTelestratorActive((t) => !t)}
            className={`rounded-full px-2 py-1 text-[11px] font-bold transition ${
              isTelestratorActive
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            title="Telestrator On-Map Annotation Pen"
          >
            ✏️ Telestrator
          </button>
          <button
            onClick={() => setIsBroadcastMode((b) => !b)}
            className={`rounded-full px-2 py-1 text-[11px] font-bold transition ${
              isBroadcastMode
                ? 'bg-red-600 text-white shadow-[0_0_10px_#ef4444]'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            title="On-Air Broadcast Studio Clean Feed"
          >
            📺 On-Air
          </button>
        </div>

        {/* AI Weather Copilot Button */}
        <button
          onClick={onOpenWeatherAssistant}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1 text-xs font-black text-white shadow-lg shadow-cyan-600/30 hover:brightness-110 transition"
          title="AI Weather Assistant & Copilot"
        >
          <span>✨</span>
          <span>AI Copilot</span>
        </button>

        {/* Right Sidebar (Layers) Toggle */}
        {onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition ${
              rightSidebarOpen
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            title="Toggle Workstation Layer Rack"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Layers</span>
          </button>
        )}

        {/* Active Warning Badge */}
        {alertsCount > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-black text-white shadow-[0_0_10px_#ef4444] animate-pulse">
            <span>🚨</span>
            <span>{alertsCount} WARN</span>
          </div>
        )}
      </nav>
    </header>
  );
}
