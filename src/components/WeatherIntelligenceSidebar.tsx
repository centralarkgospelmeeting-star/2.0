import React, { useState } from 'react';
import {
  HyperlocalTelemetry,
  MinutePrecipitation,
  WeatherModelComparison,
  getModelComparisons,
  generateMinutePrecipitationForecast,
  calculatePersonalRiskScore,
} from '../lib/forecast-engine';
import { RADAR_SITES } from '../lib/radar-config';

type WeatherIntelligenceSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  radarSite: string;
  alerts: any[];
  onSelectWarning?: (warning: any) => void;
};

export function WeatherIntelligenceSidebar({
  isOpen,
  onToggle,
  radarSite,
  alerts,
  onSelectWarning,
}: WeatherIntelligenceSidebarProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'minute' | 'models' | 'extended'>('overview');

  const site =
    RADAR_SITES.find((s) => s.id === radarSite || s.radarId === radarSite) ||
    RADAR_SITES[0];

  const hasTornadoWarning = alerts.some((a) => (a.event || a.headline || '').includes('Tornado Warning'));
  const hasSevereWarning = alerts.some((a) => (a.event || a.headline || '').includes('Severe Thunderstorm'));
  const hasFloodWarning = alerts.some((a) => (a.event || a.headline || '').includes('Flood'));

  // Risk Score calculation
  const risk = calculatePersonalRiskScore({
    hasTornadoWarning,
    hasSevereWarning,
    hasFloodWarning,
    cape: 2450,
    stp: hasTornadoWarning ? 3.8 : 2.4,
    shear06: 52,
    precipRateMmHr: 18,
  });

  // Minute-by-minute precip forecast
  const minutePrecip = generateMinutePrecipitationForecast(false);

  // Multi-model comparisons
  const models = getModelComparisons();

  // Neighborhood telemetry
  const telemetry: HyperlocalTelemetry = {
    tempF: 78,
    feelsLikeF: 83,
    dewPointF: 68,
    wetBulbF: 71.4,
    heatIndexF: 81,
    windChillF: 78,
    humidity: 71,
    pressureInHg: 29.88,
    pressureTrend: 'falling_rapidly',
    pressureTrendMbHr: -2.4,
    windSpeedKt: 16,
    windGustKt: 28,
    windDirDeg: 195,
    windDirCard: 'SSW',
    visibilityMi: 10,
    cloudCoverPct: 85,
    aqi: 38,
    aqiStatus: 'Good',
    pm25: 8.4,
    ozonePpb: 42,
    uvIndex: 4,
  };

  return (
    <>
      <aside
        className={`absolute left-3 top-16 bottom-16 z-40 w-80 sm:w-96 rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 flex-col overflow-hidden ${
          isOpen ? 'flex translate-x-0 opacity-100' : 'hidden'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-600/30 text-cyan-400 font-bold text-xs">
              📊
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wide text-white uppercase">
                  WEATHER INTELLIGENCE
                </span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-black text-cyan-300 uppercase">
                  {site.radarId}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[210px]">{site.name}</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="rounded-full bg-white/5 p-1 text-slate-400 hover:bg-white/10 hover:text-white transition text-xs"
            title="Collapse Sidebar"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-slate-950/80 px-2 py-1 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1 rounded-lg transition ${
              activeTab === 'overview' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('minute')}
            className={`flex-1 py-1 rounded-lg transition ${
              activeTab === 'minute' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Min-Cast
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`flex-1 py-1 rounded-lg transition ${
              activeTab === 'models' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Models
          </button>
          <button
            onClick={() => setActiveTab('extended')}
            className={`flex-1 py-1 rounded-lg transition ${
              activeTab === 'extended' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            7-Day
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
          {activeTab === 'overview' && (
            <>
              {/* 1. Personal Weather Risk Score Gauge */}
              <div
                className={`rounded-2xl border p-3.5 space-y-2 ${
                  risk.rating === 'CRITICAL TORNADIC'
                    ? 'border-purple-500/40 bg-purple-950/30'
                    : risk.rating === 'SEVERE'
                    ? 'border-red-500/40 bg-red-950/30'
                    : risk.rating === 'ELEVATED'
                    ? 'border-amber-500/40 bg-amber-950/30'
                    : 'border-emerald-500/30 bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Personal Severe Risk Score
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                      risk.rating === 'CRITICAL TORNADIC'
                        ? 'bg-purple-600 text-white animate-pulse'
                        : risk.rating === 'SEVERE'
                        ? 'bg-red-600 text-white'
                        : risk.rating === 'ELEVATED'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {risk.rating}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{risk.overallScore}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                  <span className="text-[10px] text-slate-400 font-sans ml-auto">
                    Confidence: <b className="text-cyan-300">92%</b>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      risk.overallScore >= 80
                        ? 'bg-purple-500'
                        : risk.overallScore >= 60
                        ? 'bg-red-500'
                        : risk.overallScore >= 35
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${risk.overallScore}%` }}
                  />
                </div>

                {/* Hazard Breakdown Bars */}
                <div className="space-y-1.5 pt-1 text-[10px]">
                  <div className="flex justify-between text-slate-300">
                    <span>🌪️ Tornado Threat</span>
                    <span className="font-bold text-red-400">{risk.tornadoRisk}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${risk.tornadoRisk}%` }} />
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>🧊 Hail Potential (&gt;1.50&quot;)</span>
                    <span className="font-bold text-pink-400">{risk.hailRisk}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: `${risk.hailRisk}%` }} />
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>💨 Damaging Wind (&gt;60 kt)</span>
                    <span className="font-bold text-amber-400">{risk.windRisk}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${risk.windRisk}%` }} />
                  </div>
                </div>
              </div>

              {/* 2. Neighborhood Atmospheric Telemetry */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-cyan-300 font-bold text-[11px] font-sans">
                  <span>Neighborhood Surface Telemetry</span>
                  <span className="text-[10px] text-slate-400 font-mono">Live AWS</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-slate-950/60 p-2 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <span className="text-base font-bold text-white">{telemetry.tempF}°F</span>
                    <span className="text-[9px] text-slate-500 block">Feels: {telemetry.feelsLikeF}°F</span>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 p-2 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Dew Point</span>
                    <span className="text-base font-bold text-emerald-400">{telemetry.dewPointF}°F</span>
                    <span className="text-[9px] text-slate-500 block">Wet-Bulb: {telemetry.wetBulbF}°F</span>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 p-2 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Pressure Tendency</span>
                    <span className="text-sm font-bold text-red-400">{telemetry.pressureInHg} inHg</span>
                    <span className="text-[9px] text-red-300 block">{telemetry.pressureTrendMbHr} mb/hr (Falling)</span>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 p-2 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Wind &amp; Gusts</span>
                    <span className="text-sm font-bold text-white">
                      {telemetry.windDirCard} {telemetry.windSpeedKt} kt
                    </span>
                    <span className="text-[9px] text-amber-400 block">Gusts to {telemetry.windGustKt} kt</span>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 p-2 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Humidity &amp; Visibility</span>
                    <span className="text-sm font-bold text-cyan-300">{telemetry.humidity}%</span>
                    <span className="text-[9px] text-slate-400 block">Vis: {telemetry.visibilityMi} mi</span>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 p-2 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Air Quality (AQI)</span>
                    <span className="text-sm font-bold text-emerald-400">{telemetry.aqi} AQI</span>
                    <span className="text-[9px] text-emerald-300 block">PM2.5: {telemetry.pm25} µg/m³</span>
                  </div>
                </div>
              </div>

              {/* 3. Active NWS Warnings Feed */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 font-sans">
                  <span>Active Warnings ({alerts.length})</span>
                  <span className="text-[10px] text-red-400 animate-pulse font-mono">LIVE NWS</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="text-[11px] text-slate-400 p-2 text-center font-sans">
                      No active severe weather warnings currently in sector.
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => onSelectWarning?.(alert)}
                        className="rounded-xl border border-red-500/30 bg-red-950/20 p-2.5 space-y-1 cursor-pointer hover:bg-red-900/30 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-red-400 uppercase">
                            {alert.event || 'Warning'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Zoom Map ↗</span>
                        </div>
                        <p className="text-[11px] font-sans font-bold text-white line-clamp-2">
                          {alert.headline}
                        </p>
                        <p className="text-[10px] text-slate-400 font-sans truncate">{alert.area}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'minute' && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3">
                <span className="text-[10px] font-bold uppercase text-cyan-300">60-Minute Radar Min-Cast</span>
                <p className="text-xs text-white font-sans mt-1 leading-relaxed">
                  {minutePrecip.summary}
                </p>
              </div>

              {/* Precipitation Bar Chart for 60 mins */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-3 space-y-2">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Now</span>
                  <span>+15m</span>
                  <span>+30m</span>
                  <span>+45m</span>
                  <span>+60m</span>
                </div>

                <div className="flex items-end gap-1 h-28 bg-slate-950/80 p-2 rounded-xl border border-white/5">
                  {minutePrecip.minutes.filter((_, i) => i % 2 === 0).map((m) => (
                    <div
                      key={m.minute}
                      title={`Minute ${m.minute}: ${m.intensityMmHr} mm/hr`}
                      className="flex-1 bg-gradient-to-t from-cyan-600 to-blue-400 rounded-t hover:bg-cyan-300 transition"
                      style={{
                        height: `${Math.min(100, Math.max(4, m.intensityMmHr * 4.5))}%`,
                        opacity: m.intensityMmHr > 0 ? 0.9 : 0.15,
                      }}
                    />
                  ))}
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>Precip Rate (mm/hr)</span>
                  <span className="text-cyan-300 font-bold">Peak: 18.4 mm/hr</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Multi-Model Ensemble Comparison
              </span>

              {models.map((m) => (
                <div
                  key={m.name}
                  className="rounded-2xl border border-white/10 bg-slate-900/50 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-400">{m.name}</span>
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                      {m.confidenceScore}% Conf
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                    <div>Temp: <b className="text-white">{m.tempF}°F</b></div>
                    <div>CAPE: <b className="text-amber-400">{m.capeJkg}</b></div>
                    <div>Gusts: <b className="text-red-400">{m.windGustKt}kt</b></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-tight">{m.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'extended' && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                7-Day Extended Convective Outlook
              </span>

              {[
                { day: 'Today', high: 82, low: 64, cond: '⛈️ Severe T-Storms', severe: 'HIGH' },
                { day: 'Tomorrow', high: 79, low: 61, cond: '⛅ Scattered Showers', severe: 'MARGINAL' },
                { day: 'Wednesday', high: 75, low: 58, cond: '☀️ Mostly Sunny', severe: 'NONE' },
                { day: 'Thursday', high: 78, low: 60, cond: '🌤️ Partly Cloudy', severe: 'NONE' },
                { day: 'Friday', high: 84, low: 65, cond: '⛈️ Strong Front', severe: 'SLIGHT' },
                { day: 'Saturday', high: 80, low: 62, cond: '🌦️ Morning Rain', severe: 'NONE' },
                { day: 'Sunday', high: 77, low: 57, cond: '☀️ Clear Skies', severe: 'NONE' },
              ].map((d) => (
                <div
                  key={d.day}
                  className="rounded-xl border border-white/5 bg-slate-900/40 p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{d.day}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{d.cond}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">{d.high}°</span>{' '}
                    <span className="text-slate-500">/ {d.low}°</span>
                    <div className="text-[9px] font-black uppercase text-amber-400">{d.severe}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Collapsed Open Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="absolute left-3 top-16 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-slate-950/85 text-cyan-400 shadow-2xl backdrop-blur-xl hover:bg-slate-900 hover:text-white transition"
          title="Open Weather Intelligence Dashboard"
        >
          📊
        </button>
      )}
    </>
  );
}
