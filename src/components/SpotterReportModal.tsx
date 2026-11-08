import React, { useState } from 'react';
import { SpotterPin } from './RadarMap';

type SpotterReportModalProps = {
  currentCoords: [number, number];
  onClose: () => void;
  onSubmit: (report: SpotterPin) => void;
};

export function SpotterReportModal({ currentCoords, onClose, onSubmit }: SpotterReportModalProps) {
  const [hazard, setHazard] = useState('Tornado');
  const [hailSize, setHailSize] = useState('1.75" (Golf Ball)');
  const [description, setDescription] = useState('');
  const [callsign, setCallsign] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: `spotter-${Date.now()}`,
      hazardType: hazard,
      description,
      hailSize: hazard === 'Large Hail' ? hailSize : undefined,
      lat: currentCoords[1],
      lon: currentCoords[0],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      callsign: callsign.trim() || `SKYWARN-${Math.floor(100 + Math.random() * 900)}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📡</span>
            <h3 className="text-base font-extrabold text-white">Broadcast Spotter Network Report</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Hazard Observed
            </label>
            <select
              value={hazard}
              onChange={(e) => setHazard(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white font-semibold focus:border-cyan-500 focus:outline-none"
            >
              <option value="Tornado">🌪️ Tornado on Ground</option>
              <option value="Wall Cloud">☁️ Rotating Wall Cloud / Funnel</option>
              <option value="Large Hail">🧊 Severe Hail</option>
              <option value="Damaging Wind">💨 Damaging Wind (&gt;65 mph)</option>
              <option value="Flash Flood">🌊 Flash Flooding</option>
            </select>
          </div>

          {hazard === 'Large Hail' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Estimated Hail Diameter
              </label>
              <select
                value={hailSize}
                onChange={(e) => setHailSize(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value='1.00" (Quarter)'>1.00&quot; (Quarter - Severe Threshold)</option>
                <option value='1.75" (Golf Ball)'>1.75&quot; (Golf Ball)</option>
                <option value='2.50" (Tennis Ball)'>2.50&quot; (Tennis Ball)</option>
                <option value='3.00" (Teacup)'>3.00&quot; (Teacup / Giant Hail)</option>
                <option value='4.00" (Softball)'>4.00&quot; (Softball / Destructive)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Spotter Call Sign / Chaser Handle
            </label>
            <input
              type="text"
              placeholder="e.g. AR-CHASER-09 or NWS-SPOTTER-84"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Field Observations &amp; Damage Details
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Condensation funnel to the ground, power flashes, roof damage..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-slate-900/80 p-2.5 font-mono text-[11px] text-cyan-400 border border-white/5">
            Geographic Coordinates: {currentCoords[1].toFixed(4)}°N, {currentCoords[0].toFixed(4)}°W
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-slate-800 py-2.5 font-bold text-slate-300 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-cyan-600 py-2.5 font-bold text-white shadow-lg hover:bg-cyan-500 transition"
            >
              Broadcast Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
