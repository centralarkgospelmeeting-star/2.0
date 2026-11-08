import React, { useState } from 'react';

type PalColorTableModalProps = {
  onClose: () => void;
  onApplyPalette: (paletteName: string) => void;
};

export function PalColorTableModal({ onClose, onApplyPalette }: PalColorTableModalProps) {
  const [selectedPreset, setSelectedPreset] = useState('radarscope');
  const [customPalText, setCustomPalText] = useState(
    `; MesoVortexWX Custom .PAL Reflectivity Table
; Format: Color: <dBZ_Threshold> <Red> <Green> <Blue>
Color: 5 150 150 150
Color: 15 100 180 255
Color: 25 30 200 80
Color: 35 240 240 30
Color: 45 255 140 0
Color: 55 230 0 0
Color: 65 255 0 255
Color: 70 255 255 255`
  );

  const presets = [
    {
      id: 'nws',
      name: 'NWS WSR-88D Official 16-Color',
      desc: 'Standard National Weather Service operational radar color scale.',
      gradient: 'from-[#00e400] via-[#ffff00] via-[#ff7e00] to-[#99004c]',
    },
    {
      id: 'radarscope',
      name: 'RadarScope Professional Classic',
      desc: 'Modern high-contrast curve optimized for severe hail cores and TVS detection.',
      gradient: 'from-[#0066ff] via-[#00cc00] via-[#ffff00] via-[#ff0000] to-[#ff00ff]',
    },
    {
      id: 'cod',
      name: 'College of DuPage (COD) Nexlab',
      desc: 'Smooth academic meteorological gradient with distinct cold-temperature tint.',
      gradient: 'from-[#0099ff] via-[#00ffcc] via-[#ffcc00] to-[#cc0000]',
    },
    {
      id: 'couplet',
      name: 'Velocity Couplet High-Definition',
      desc: 'Inbound green / outbound red high-gain threshold for gate-to-gate shear.',
      gradient: 'from-[#10b981] via-[#0284c7] via-[#ef4444] to-[#ec4899]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 shadow-2xl space-y-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <div>
              <h3 className="text-base font-extrabold text-white">Color Table &amp; .PAL Manager</h3>
              <p className="text-xs text-slate-400 font-mono">GRLevelX .PAL Compatible Color Tables</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Presets */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pre-Configured Meteorology Tables
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPreset(p.id);
                  onApplyPalette(p.id);
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  selectedPreset === p.id
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : 'border-white/5 bg-slate-900/40 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">{p.name}</span>
                  {selectedPreset === p.id && (
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  )}
                </div>
                {/* Gradient swatch */}
                <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${p.gradient} mb-1.5 shadow`} />
                <p className="text-[10px] text-slate-400 leading-tight">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom .PAL File Editor */}
        <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Custom .PAL Script Editor
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Gibson Ridge Standard</span>
          </div>

          <textarea
            rows={5}
            value={customPalText}
            onChange={(e) => setCustomPalText(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 p-3 font-mono text-[11px] text-cyan-300 focus:border-cyan-500 focus:outline-none"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => {
                onApplyPalette('palFile');
                onClose();
              }}
              className="rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-500 transition shadow"
            >
              Apply Custom .PAL Curve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
