import React, { useState } from 'react';
import { PLACEFILE_NATION_CATALOG, PlacefileMeta, ActivePlacefile } from '../lib/placefile-catalog';

type PlacefileManagerModalProps = {
  activePlacefiles: ActivePlacefile[];
  setActivePlacefiles: React.Dispatch<React.SetStateAction<ActivePlacefile[]>>;
  onClose: () => void;
};

export function PlacefileManagerModal({
  activePlacefiles,
  setActivePlacefiles,
  onClose,
}: PlacefileManagerModalProps) {
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const handleToggle = (meta: PlacefileMeta) => {
    setActivePlacefiles((prev) => {
      const exists = prev.find((p) => p.id === meta.id);
      if (exists) {
        return prev.map((p) => (p.id === meta.id ? { ...p, enabled: !p.enabled } : p));
      }
      return [
        ...prev,
        {
          id: meta.id,
          name: meta.name,
          url: meta.url,
          category: meta.category,
          enabled: true,
        },
      ];
    });
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const newId = `custom-${Date.now()}`;
    setActivePlacefiles((prev) => [
      ...prev,
      {
        id: newId,
        name: customName || 'Custom GR Placefile',
        url: customUrl.trim(),
        category: 'Severe & Warnings',
        enabled: true,
      },
    ]);
    setCustomName('');
    setCustomUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 shadow-2xl space-y-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗂️</span>
            <div>
              <h3 className="text-base font-extrabold text-white">
                GRLevelX &amp; Gibson Ridge Placefile Manager
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Placefile Nation Integration · Live Vector Overlays
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Add custom placefile */}
        <form onSubmit={handleAddCustom} className="flex gap-2 text-xs">
          <input
            type="text"
            placeholder="Placefile Label (e.g. Local Skywarn Chasers)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
          <input
            type="url"
            placeholder="https://.../placefile.txt"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none font-mono"
          />
          <button
            type="submit"
            className="rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-500 transition"
          >
            + Add
          </button>
        </form>

        {/* Catalog */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {PLACEFILE_NATION_CATALOG.map((meta) => {
            const active = activePlacefiles.find((p) => p.id === meta.id);
            const isEnabled = active ? active.enabled : false;

            return (
              <div
                key={meta.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                  isEnabled
                    ? 'border-cyan-500/40 bg-cyan-950/20'
                    : 'border-white/5 bg-slate-900/40 hover:bg-slate-900'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{meta.name}</span>
                    <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-mono text-cyan-300">
                      {meta.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{meta.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(meta)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    isEnabled
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'border border-white/15 bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {isEnabled ? 'Active' : 'Load'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
