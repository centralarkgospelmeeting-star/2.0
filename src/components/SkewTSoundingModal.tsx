import React, { useState } from 'react';
import { SoundingProfile } from '../lib/skewt-engine';

type SkewTSoundingModalProps = {
  sounding: SoundingProfile;
  onClose: () => void;
};

export function SkewTSoundingModal({ sounding, onClose }: SkewTSoundingModalProps) {
  const { indices, levels } = sounding;
  const [aiDiagnosis, setAiDiagnosis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const fetchAiDiagnosis = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai-sounding-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indices, station: sounding.station }),
      });
      const data = await res.json();
      setAiDiagnosis(data.analysis || 'Analysis unavailable.');
    } catch (err) {
      setAiDiagnosis('Could not generate AI thermodynamic analysis.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-xl animate-fade-in select-none">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-cyan-500/30 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 text-xl text-cyan-400 border border-cyan-500/30">
              📈
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Atmospheric Sounding &amp; Hodograph
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                    indices.hazardRating === 'EXTREME TORNADIC'
                      ? 'bg-purple-600 text-white animate-pulse'
                      : indices.hazardRating === 'SEVERE'
                      ? 'bg-red-600 text-white'
                      : indices.hazardRating === 'ELEVATED'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {indices.hazardRating}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                RAP / HRRR Mesoanalysis · {sounding.lat.toFixed(3)}°N, {sounding.lon.toFixed(3)}°W
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAiDiagnosis}
              disabled={isLoadingAi}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-lg hover:brightness-110 transition disabled:opacity-50"
            >
              <span>✨</span>
              <span>{isLoadingAi ? 'Diagnosing…' : 'AI Diagnosis'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Diagnosis Panel (when loaded) */}
          {aiDiagnosis && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-cyan-300 font-bold">
                <span>✨ AI Thermodynamic Sounding Assessment</span>
                <button
                  onClick={() => setAiDiagnosis(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-200 whitespace-pre-line font-sans leading-relaxed">
                {aiDiagnosis}
              </p>
            </div>
          )}

          {/* 1. Severe Index Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <span className="text-[10px] text-slate-400">SBCAPE</span>
              <div className="text-lg font-black text-white">
                {indices.sbcape.toLocaleString()}{' '}
                <span className="text-xs text-cyan-400 font-normal">J/kg</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <span className="text-[10px] text-slate-400">0-1km SRH</span>
              <div className="text-lg font-black text-white">
                {indices.srh01}{' '}
                <span className="text-xs text-emerald-400 font-normal">m²/s²</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <span className="text-[10px] text-slate-400">0-6km Shear</span>
              <div className="text-lg font-black text-white">
                {indices.shear06}{' '}
                <span className="text-xs text-amber-400 font-normal">kt</span>
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-3">
              <span className="text-[10px] text-cyan-300">STP (Tornado)</span>
              <div className="text-lg font-black text-cyan-300">
                {indices.stp}{' '}
                <span className="text-xs text-slate-400 font-normal">sig</span>
              </div>
            </div>
          </div>

          {/* 2. Interactive Skew-T & Hodograph SVG Diagrams */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Skew-T Diagram */}
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-slate-900/50 p-4 flex flex-col items-center justify-center min-h-[300px]">
              <span className="text-xs font-bold text-slate-300 mb-2 self-start font-sans">
                Skew-T Log-P Thermodynamic Chart
              </span>
              <svg
                className="w-full h-64 border border-white/5 rounded-xl bg-[#030712] p-2"
                viewBox="0 0 400 240"
              >
                {/* Pressure Isobars */}
                {[200, 400, 600, 800, 1000].map((p, i) => (
                  <g key={p}>
                    <line
                      x1="30"
                      y1={30 + i * 45}
                      x2="380"
                      y2={30 + i * 45}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <text x="5" y={34 + i * 45} fill="#64748b" fontSize="9" fontFamily="monospace">
                      {p}
                    </text>
                  </g>
                ))}
                {/* Temperature Curve (Red) */}
                <path
                  d="M 120 220 Q 160 170 210 130 T 310 30"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />
                {/* Dew Point Curve (Green) */}
                <path
                  d="M 90 220 Q 110 170 140 130 T 210 30"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
                {/* CAPE Area Shading */}
                <polygon
                  points="120,220 160,170 210,130 310,30 260,30 180,120 120,220"
                  fill="#ef4444"
                  fillOpacity="0.18"
                />
              </svg>
              <div className="flex flex-wrap gap-4 mt-2 text-[10px] font-mono">
                <span className="text-red-400 font-bold">■ Temperature Profile</span>
                <span className="text-emerald-400 font-bold">■ Dewpoint Profile</span>
                <span className="text-red-300/80 font-bold">■ Positive CAPE Area</span>
              </div>
            </div>

            {/* Hodograph Curve */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 flex flex-col items-center justify-between min-h-[300px]">
              <span className="text-xs font-bold text-slate-300 self-start font-sans">
                Hodograph (0-6km Shear)
              </span>
              <svg
                className="w-full h-56 border border-white/5 rounded-xl bg-[#030712] p-2"
                viewBox="0 0 200 200"
              >
                {/* Velocity Range Rings (20kt, 40kt, 60kt) */}
                <circle cx="100" cy="100" r="30" fill="none" stroke="#1e293b" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#1e293b" strokeWidth="1" />
                <circle cx="100" cy="100" r="85" fill="none" stroke="#1e293b" strokeWidth="1" />
                {/* Crosshairs */}
                <line x1="100" y1="10" x2="100" y2="190" stroke="#1e293b" strokeWidth="1" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="#1e293b" strokeWidth="1" />
                {/* Hodograph Curve (Amber) */}
                <path
                  d="M 95 140 Q 140 120 155 65"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                />
                <circle cx="95" cy="140" r="4.5" fill="#10b981" />
                <circle cx="155" cy="65" r="4.5" fill="#ef4444" />
              </svg>
              <div className="flex justify-between w-full text-[10px] font-mono text-slate-400 px-2">
                <span>0km (Sfc)</span>
                <span className="text-amber-400 font-bold">Clockwise Curvature</span>
                <span>6km</span>
              </div>
            </div>
          </div>

          {/* 3. Isobaric Table Data */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-sans">
              Atmospheric Sounding Levels
            </h3>
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-400 border-b border-white/5">
                  <tr>
                    <th className="p-3">Pressure</th>
                    <th className="p-3">Height</th>
                    <th className="p-3">Temp</th>
                    <th className="p-3">Dewpoint</th>
                    <th className="p-3">Wind</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {levels.map((lvl) => (
                    <tr key={lvl.pressureMb} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-white">{lvl.pressureMb} mb</td>
                      <td className="p-3">{lvl.heightM.toLocaleString()} m</td>
                      <td className="p-3 text-red-400">{lvl.tempC}°C</td>
                      <td className="p-3 text-emerald-400">{lvl.dewC}°C</td>
                      <td className="p-3">
                        {lvl.windDirDeg}° @ {lvl.windSpdKt} kt
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
