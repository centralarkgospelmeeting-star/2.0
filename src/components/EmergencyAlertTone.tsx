import React, { useState } from 'react';

// Generates the official 1050 Hz NOAA Weather Radio Alert Tone
export function play1050HzSiren(durationSeconds = 2.5) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // 1050 Hz is the standard NOAA Weather Radio warning tone
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1050, ctx.currentTime);

    // Smooth envelope ramp to prevent speaker popping
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSeconds);
  } catch (err) {
    console.warn('Audio playback notice:', err);
  }
}

type EmergencyAlertProps = {
  alerts: any[];
};

export function EmergencyAlertTone({ alerts }: EmergencyAlertProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const topAlert = alerts[0];

  const handleTestTone = () => {
    setIsPlaying(true);
    play1050HzSiren(2.0);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  if (!topAlert) return null;

  const isTornado = (topAlert.event || topAlert.headline || '').includes('Tornado');

  return (
    <div
      className={`relative z-40 border-b px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xl transition select-none ${
        isTornado
          ? 'bg-red-700 text-white border-red-500 animate-pulse'
          : 'bg-amber-600 text-slate-950 border-amber-400 font-semibold'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          🚨
        </span>
        <span className="font-black uppercase tracking-wider">
          {topAlert.event || 'Severe Weather Warning'}
        </span>
        <span className="opacity-90 hidden sm:inline truncate max-w-xl">
          {topAlert.headline}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleTestTone}
          disabled={isPlaying}
          className="rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-bold text-white hover:bg-black/40 transition"
          title="Test official 1050 Hz NOAA Weather Radio alert chime"
        >
          {isPlaying ? '🔊 Sounding 1050Hz…' : '🔔 Test EAS 1050Hz'}
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
            soundEnabled ? 'bg-white text-slate-950 shadow' : 'bg-black/20 text-white'
          }`}
        >
          {soundEnabled ? 'Auto-Audio ON' : 'Audio Muted'}
        </button>
      </div>
    </div>
  );
}
