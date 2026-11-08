import React, { useState, useEffect } from 'react';

type DecodedStation = {
  station: string;
  name: string;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  raw: string;
  tempF: number;
  dewPointF: number;
  windSpeedKt: number;
  windGustKt?: number;
  windDirDeg: number;
  visibilitySm: number;
  altimeterInHg: number;
  ceiling: string;
};

type METARPanelProps = {
  onClose: () => void;
};

export function METARPanel({ onClose }: METARPanelProps) {
  const [stations, setStations] = useState<DecodedStation[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/metar')
      .then((res) => res.json())
      .then((data) => setStations(data.stations || []))
      .catch((err) => console.warn('METAR fetch notice:', err));
  }, []);

  const filtered = stations.filter(
    (s) =>
      s.station.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 shadow-2xl space-y-4 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <div>
              <h3 className="text-base font-extrabold text-white">Aviation METAR &amp; TAF Station Observations</h3>
              <p className="text-xs text-slate-400 font-mono">Flight Categories · VFR · MVFR · IFR · LIFR</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <input
          type="text"
          placeholder="Filter airport station code (e.g. KLIT, KOKC, KDFW, KORD)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none font-mono"
        />

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-mono">
          {filtered.map((station) => (
            <div
              key={station.station}
              className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2 hover:bg-slate-900 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white">{station.station}</span>
                  <span className="text-[11px] text-slate-400 font-sans ml-2">{station.name}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    station.flightCategory === 'VFR'
                      ? 'bg-emerald-600 text-white'
                      : station.flightCategory === 'MVFR'
                      ? 'bg-blue-600 text-white'
                      : station.flightCategory === 'IFR'
                      ? 'bg-red-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  {station.flightCategory}
                </span>
              </div>

              {/* Raw METAR */}
              <div className="rounded-xl bg-slate-950 p-2.5 text-[11px] text-cyan-300 font-mono border border-white/5 overflow-x-auto">
                {station.raw}
              </div>

              {/* Decoded Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div>Temp: <b className="text-white">{station.tempF}°F</b></div>
                <div>Dew Point: <b className="text-emerald-400">{station.dewPointF}°F</b></div>
                <div>
                  Wind: <b className="text-white">{station.windDirDeg}° @ {station.windSpeedKt}kt</b>
                  {station.windGustKt && <span className="text-amber-400"> (G{station.windGustKt}kt)</span>}
                </div>
                <div>Altimeter: <b className="text-slate-300">{station.altimeterInHg} inHg</b></div>
                <div>Visibility: <b className="text-white">{station.visibilitySm} SM</b></div>
                <div className="col-span-2">Ceiling: <b className="text-cyan-400">{station.ceiling}</b></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
