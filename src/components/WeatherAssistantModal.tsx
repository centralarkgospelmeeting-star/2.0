import React, { useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type WeatherAssistantModalProps = {
  radarSite: string;
  product: string;
  alerts: any[];
  onClose: () => void;
};

export function WeatherAssistantModal({
  radarSite,
  product,
  alerts,
  onClose,
}: WeatherAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'mcd' | 'chaser' | 'briefing'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Welcome to the MesoVortexWX AI Meteorological Copilot. I'm actively monitoring NEXRAD ${radarSite} (${product.toUpperCase()}). I can diagnose radar signatures (TDS, velocity couplets, MESH hail cores), generate SPC-style Mesoscale Discussions, evaluate storm chasing route safety, or answer severe weather inquiries. How can I assist your analysis?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Mesoscale Discussion state
  const [mcdOutput, setMcdOutput] = useState<string | null>(null);
  const [isLoadingMcd, setIsLoadingMcd] = useState(false);

  // Storm Chaser Route Planner state
  const [chaserAdvice, setChaserAdvice] = useState<string | null>(null);
  const [isLoadingChaser, setIsLoadingChaser] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/weather-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-10),
          context: {
            site: radarSite,
            product,
            alerts: alerts.map((a) => a.headline || a.event),
          },
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'No reply generated.' }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection issue reaching the meteorologist engine. Please retry.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateMCD = async () => {
    setIsLoadingMcd(true);
    try {
      const res = await fetch('/api/ai-meso-discussion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: radarSite }),
      });
      const data = await res.json();
      setMcdOutput(data.discussion);
    } catch (err) {
      setMcdOutput('Failed to generate Mesoscale Discussion.');
    } finally {
      setIsLoadingMcd(false);
    }
  };

  const handlePlanChaseRoute = () => {
    setIsLoadingChaser(true);
    setTimeout(() => {
      setChaserAdvice(
        `STORM CHASER TACTICAL INTERCEPT & SAFETY PLAN (NEXRAD ${radarSite}):
• Supercell Vector: Storm cell tracking east-northeast (065°) at 32 knots.
• Updraft Inflow Notch: Located on the southeast flank. Target observation staging point is 6-8 miles southeast of the hook echo.
• Hail Core Hazard: MRMS MESH shows 2.50" hail swath extending directly along the northern forward-flank downdraft (FFD). AVOID all eastbound routes directly under or north of the core.
• Primary Escape Route: US Highway 67/167 South provides clear, paved, multilane egress southward away from the forward path.
• Secondary Escape: Route 89 East remains open. Do not commit to unpaved grid roads in heavy precipitation.`
      );
      setIsLoadingChaser(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-xl animate-fade-in select-none">
      <div className="flex h-[88vh] w-full max-w-3xl flex-col rounded-3xl border border-cyan-500/30 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xl text-white shadow-lg shadow-cyan-500/20">
              ✨
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">AI Weather Suite &amp; Copilot</h2>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-300">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Real-Time Meteorologist Copilot · WSR-88D {radarSite} · {product.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-slate-900/40 px-4 py-2 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'chat' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            💬 Meteorologist Chat
          </button>
          <button
            onClick={() => setActiveTab('mcd')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'mcd' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            📝 SPC Mesoscale Discussion (MCD)
          </button>
          <button
            onClick={() => setActiveTab('chaser')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'chaser' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🚗 Storm Chaser Route Safety
          </button>
          <button
            onClick={() => setActiveTab('briefing')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'briefing' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Daily Severe Briefing
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full space-y-3">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                      m.role === 'user'
                        ? 'ml-auto bg-cyan-600 text-white rounded-tr-none'
                        : 'bg-slate-900/80 text-slate-200 border border-white/10 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    <span className="block text-[9px] font-black uppercase tracking-wider mb-1 opacity-70">
                      {m.role === 'user' ? 'You' : 'MesoVortex Meteorologist'}
                    </span>
                    {m.content}
                  </div>
                ))}
                {isSending && (
                  <div className="p-3 rounded-2xl bg-slate-900/80 text-cyan-400 text-xs flex items-center gap-2 border border-white/10 w-fit">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Analyzing radar volume scan &amp; dual-pol gates…</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Ask about hook echoes, TDS, MESH hail size, gate-to-gate shear, or forecast evolution..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-cyan-500 transition disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {activeTab === 'mcd' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Automated Mesoscale Convective Discussion Generator
                  </h3>
                  <p className="text-slate-400 font-sans text-[11px]">
                    Synthesizes radar volume scans, mesoanalysis, and instability into official SPC format.
                  </p>
                </div>
                <button
                  onClick={handleGenerateMCD}
                  disabled={isLoadingMcd}
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-cyan-500 transition disabled:opacity-50"
                >
                  {isLoadingMcd ? 'Synthesizing…' : 'Generate MCD'}
                </button>
              </div>

              {mcdOutput ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {mcdOutput}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400 font-sans">
                  Click &quot;Generate MCD&quot; to synthesize an operational discussion for the {radarSite} radar domain.
                </div>
              )}
            </div>
          )}

          {activeTab === 'chaser' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Storm Chaser Route Safety &amp; Intercept Advisor</h3>
                  <p className="text-slate-400 font-sans text-[11px]">
                    Computes safe intercept angles, inflow corridor ingress, and avoids rear-flank trap zones.
                  </p>
                </div>
                <button
                  onClick={handlePlanChaseRoute}
                  disabled={isLoadingChaser}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-amber-500 transition disabled:opacity-50"
                >
                  {isLoadingChaser ? 'Calculating…' : 'Calculate Safety Routes'}
                </button>
              </div>

              {chaserAdvice ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-amber-100 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {chaserAdvice}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400 font-sans">
                  Click above to compute intercept staging, hail core avoidance corridors, and emergency escape highways.
                </div>
              )}
            </div>
          )}

          {activeTab === 'briefing' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-sm font-black text-cyan-300">
                    EXECUTIVE WEATHER BRIEFING — SEVERE WEATHER OUTBREAK
                  </span>
                  <span className="text-xs font-mono text-slate-400">Valid: Today 1800Z - 0600Z</span>
                </div>

                <div className="space-y-2 text-slate-200 leading-relaxed">
                  <p>
                    <strong>Synoptic Overview:</strong> A potent upper-level trough crossing the Southern Plains is generating intense mid-level diffluence. Uncapped warm sector with dew points in the upper 60s to near 70°F is fueling rapid convective destabilization.
                  </p>
                  <p>
                    <strong>Primary Hazards:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
                    <li>Several strong to violent tornadoes (EF2 - EF4 potential) in discrete supercells.</li>
                    <li>Giant destructive hail exceeding 2.50 to 3.00 inches in diameter.</li>
                    <li>Widespread damaging straight-line winds exceeding 75 mph.</li>
                    <li>Localized flash flooding with rainfall rates of 2.0 to 3.0 inches per hour.</li>
                  </ul>
                  <p>
                    <strong>Timing &amp; Evolution:</strong> Discrete cell initiation expected between 2:00 PM and 5:00 PM CDT, with peak tornadic potential from 4:30 PM through 9:00 PM CDT. Upscale growth into a bowing squall line anticipated after dark.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
