import React, { useState, useEffect } from 'react';

type RadarFrame = {
  time: string;
  label: string;
  tileUrl: string;
  ageMinutes: number;
};

type PlaybackTimelineBarProps = {
  frames: RadarFrame[];
  currentFrameIndex: number;
  setCurrentFrameIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (fn: (prev: boolean) => boolean) => void;
};

export function PlaybackTimelineBar({
  frames = [],
  currentFrameIndex,
  setCurrentFrameIndex,
  isPlaying,
  setIsPlaying,
}: PlaybackTimelineBarProps) {
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;
    const intervalMs = 1200 / speed;
    const timer = setInterval(() => {
      setCurrentFrameIndex((prevIndex: number) => {
        if (prevIndex >= frames.length - 1) {
          return 0; // loop back to oldest frame
        }
        return prevIndex + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speed, frames.length, setCurrentFrameIndex]);

  const currentFrame = frames[currentFrameIndex] || frames[frames.length - 1];

  const handleStepBack = () => {
    setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1));
  };

  const handleStepForward = () => {
    setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1));
  };

  const handleToggleSpeed = () => {
    if (speed === 1) setSpeed(2);
    else if (speed === 2) setSpeed(4);
    else setSpeed(1);
  };

  return (
    <footer className="pointer-events-none absolute bottom-3 left-0 right-0 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 rounded-full border border-white/15 bg-slate-950/92 px-4 py-2 shadow-2xl backdrop-blur-2xl text-xs select-none">
        {/* Step back */}
        <button
          onClick={handleStepBack}
          disabled={currentFrameIndex <= 0}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 transition"
          title="Step Backward"
        >
          ‹
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-white font-bold transition shadow-md ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'
          }`}
          title={isPlaying ? 'Pause Radar Loop' : 'Play Radar Loop'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Step forward */}
        <button
          onClick={handleStepForward}
          disabled={currentFrameIndex >= frames.length - 1}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 transition"
          title="Step Forward"
        >
          ›
        </button>

        {/* Scrubber track */}
        <div className="flex items-center gap-2 px-2">
          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={currentFrameIndex}
            onChange={(e) => setCurrentFrameIndex(parseInt(e.target.value, 10))}
            className="w-32 sm:w-56 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Speed toggle */}
        <button
          onClick={handleToggleSpeed}
          className="rounded-full bg-slate-900 border border-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 hover:bg-slate-800 transition"
          title="Loop Playback Speed"
        >
          {speed}x
        </button>

        {/* Timestamp and Live status */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <span className="font-mono text-[11px] font-bold text-white whitespace-nowrap">
            {currentFrame?.label || 'LIVE'}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE · 3s
          </span>
        </div>
      </div>
    </footer>
  );
}
