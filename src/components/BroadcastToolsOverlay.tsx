import React from 'react';

type BroadcastToolsOverlayProps = {
  isBroadcastMode: boolean;
  setIsBroadcastMode: (v: boolean) => void;
  isTelestratorActive: boolean;
  setIsTelestratorActive: (v: boolean) => void;
  telestratorColor: string;
  setTelestratorColor: (c: string) => void;
  radarSite: string;
};

export function BroadcastToolsOverlay({
  isBroadcastMode,
  setIsBroadcastMode,
  isTelestratorActive,
  setIsTelestratorActive,
  telestratorColor,
  setTelestratorColor,
  radarSite,
}: BroadcastToolsOverlayProps) {
  if (!isBroadcastMode && !isTelestratorActive) return null;

  return (
    <>
      {/* 1. Telestrator Floating Palette Toolbar */}
      {isTelestratorActive && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-amber-500/40 bg-slate-950/90 px-4 py-2 shadow-2xl backdrop-blur-xl text-xs select-none">
          <span className="font-bold text-amber-400">✏️ Telestrator:</span>

          {/* Color buttons */}
          {[
            { color: '#ef4444', label: 'Red' },
            { color: '#eab308', label: 'Yellow' },
            { color: '#06b6d4', label: 'Cyan' },
            { color: '#10b981', label: 'Green' },
            { color: '#ffffff', label: 'White' },
          ].map((c) => (
            <button
              key={c.color}
              onClick={() => setTelestratorColor(c.color)}
              className={`h-5 w-5 rounded-full border-2 transition ${
                telestratorColor === c.color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70'
              }`}
              style={{ backgroundColor: c.color }}
              title={c.label}
            />
          ))}

          <span className="text-slate-500 pl-1">|</span>
          <span className="text-[10px] text-slate-400">Draw directly on radar</span>

          <button
            onClick={() => setIsTelestratorActive(false)}
            className="ml-2 rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 hover:text-white"
          >
            Done
          </button>
        </div>
      )}

      {/* 2. On-Air Broadcast Clean Feed Lower-Third Banner */}
      {isBroadcastMode && (
        <div className="pointer-events-none absolute bottom-6 left-6 right-6 z-30 select-none animate-slide-up">
          <div className="rounded-2xl border-2 border-red-500/60 bg-gradient-to-r from-slate-950/95 via-red-950/90 to-slate-950/95 p-4 shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 pr-4 border-r border-white/20">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white font-black text-sm animate-pulse">
                  ⚡
                </span>
                <div>
                  <div className="text-sm font-black tracking-wider text-white">
                    MESO<span className="text-cyan-400">VORTEX</span>{' '}
                    <span className="text-red-400 font-bold">LIVE ON-AIR</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    NEXRAD {radarSite} · DOPPLER 88D DUAL-POL
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-black uppercase text-red-400 tracking-wider">
                  SEVERE WEATHER COVERAGE · ROTATION TRACKS ACTIVE
                </div>
                <div className="text-sm font-bold text-white">
                  Intense tornadic couplet tracking east-northeast at 35 MPH. Take immediate shelter!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pointer-events-auto">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                LIVE RADAR FEED
              </span>
              <button
                onClick={() => setIsBroadcastMode(false)}
                className="rounded-xl bg-slate-800/80 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                ✕ Exit On-Air
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
