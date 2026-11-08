import React, { useState } from 'react';
import { MarineBuoy, AgriculturalMetrics } from '../lib/forecast-engine';

type MarineAgriModalProps = {
  onClose: () => void;
};

export function MarineAgriModal({ onClose }: MarineAgriModalProps) {
  const [activeTab, setActiveTab] = useState<'marine' | 'agri'>('marine');

  const buoys: MarineBuoy[] = [
    {
      stationId: '42019',
      name: 'Freeport, TX - 60 NM South of Freeport',
      waveHeightFt: 6.2,
      dominantPeriodSec: 7,
      swellDir: 'ESE (110°)',
      waterTempF: 75.2,
      airTempF: 78.4,
      tideFeet: 1.8,
      tideTrend: 'Rising',
      nextTideTime: 'High Tide 8:42 PM CDT (+2.4 ft)',
    },
    {
      stationId: '42002',
      name: 'Western Gulf of Mexico - 207 NM East of Brownsville',
      waveHeightFt: 8.5,
      dominantPeriodSec: 9,
      swellDir: 'SE (135°)',
      waterTempF: 78.8,
      airTempF: 80.1,
      tideFeet: 0.9,
      tideTrend: 'Falling',
      nextTideTime: 'Low Tide 11:15 PM CDT (+0.4 ft)',
    },
    {
      stationId: '41009',
      name: 'Canaveral, FL - 20 NM East of Cape Canaveral',
      waveHeightFt: 4.8,
      dominantPeriodSec: 6,
      swellDir: 'ENE (070°)',
      waterTempF: 77.0,
      airTempF: 76.5,
      tideFeet: 3.2,
      tideTrend: 'Slack High',
      nextTideTime: 'High Tide 6:30 PM EDT (+3.4 ft)',
    },
  ];

  const agri: AgriculturalMetrics = {
    soilMoistureTopPct: 68,
    soilMoistureDeepPct: 82,
    soilTemp2inF: 66,
    soilTemp4inF: 64,
    gddBase50: 1420,
    frostRiskLevel: 'NONE',
    cropStressIndex: 18,
    droughtCategory: 'None',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-3xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 shadow-2xl space-y-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌊🌱</span>
            <div>
              <h3 className="text-base font-extrabold text-white">Marine Buoys &amp; Agricultural Intelligence</h3>
              <p className="text-xs text-slate-400 font-mono">Offshore Wave Physics · Tidal Trends · Soil Moisture &amp; GDD</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 bg-slate-900/40 p-1.5 rounded-xl text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('marine')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'marine' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🌊 Marine Weather &amp; Tides
          </button>
          <button
            onClick={() => setActiveTab('agri')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'agri' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🌱 Agricultural Soil &amp; Crops
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1 font-mono">
          {activeTab === 'marine' ? (
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                NOAA National Data Buoy Center (NDBC) Telemetry
              </span>

              {buoys.map((buoy) => (
                <div
                  key={buoy.stationId}
                  className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2.5 hover:bg-slate-900 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-cyan-300">Buoy #{buoy.stationId}</span>
                      <p className="text-[11px] text-slate-300 font-sans mt-0.5">{buoy.name}</p>
                    </div>
                    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400">
                      Tide: {buoy.tideTrend}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="rounded-xl bg-slate-950 p-2 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Wave Height</span>
                      <span className="text-base font-bold text-white">{buoy.waveHeightFt} ft</span>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Period &amp; Swell</span>
                      <span className="text-base font-bold text-cyan-300">{buoy.dominantPeriodSec}s</span>
                      <span className="text-[9px] text-slate-400 block">{buoy.swellDir}</span>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Water Temp</span>
                      <span className="text-base font-bold text-emerald-400">{buoy.waterTempF}°F</span>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Air Temp</span>
                      <span className="text-base font-bold text-white">{buoy.airTempF}°F</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/80 p-2.5 text-[11px] text-slate-300 border border-white/5 flex items-center justify-between font-sans">
                    <span>📅 Tidal Prediction: <b>{buoy.nextTideTime}</b></span>
                    <span className="text-emerald-400 font-mono text-[10px]">Tide Height: +{buoy.tideFeet} ft</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                USDA &amp; Mesonet Agricultural Indicators
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <span className="text-[10px] text-slate-400">0-2&quot; Soil Moisture</span>
                  <div className="text-xl font-bold text-emerald-400">{agri.soilMoistureTopPct}%</div>
                  <span className="text-[9px] text-slate-400 font-sans">Adequate Root Zone</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <span className="text-[10px] text-slate-400">4-8&quot; Subsoil Moisture</span>
                  <div className="text-xl font-bold text-emerald-400">{agri.soilMoistureDeepPct}%</div>
                  <span className="text-[9px] text-slate-400 font-sans">Deep Saturation</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <span className="text-[10px] text-slate-400">2&quot; Soil Temp</span>
                  <div className="text-xl font-bold text-white">{agri.soilTemp2inF}°F</div>
                  <span className="text-[9px] text-slate-400 font-sans">Optimum for Planting</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <span className="text-[10px] text-slate-400">Growing Degree Days</span>
                  <div className="text-xl font-bold text-cyan-300">{agri.gddBase50}</div>
                  <span className="text-[9px] text-slate-400 font-sans">Base 50°F</span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 font-sans">Crop Frost &amp; Freeze Risk</span>
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                    {agri.frostRiskLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Surface temperatures will remain comfortably above 55°F overnight. No frost or freezing risk for tender vegetation, corn emergence, or winter wheat.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
