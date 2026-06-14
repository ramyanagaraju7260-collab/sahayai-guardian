export function EmergencyVoiceOverlay({ active, title, subtitle, severity }: { active: boolean; title: string; subtitle: string; severity: "warning" | "critical" | "safe" }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="relative max-w-3xl w-full rounded-[2rem] border border-red-400/40 bg-[#1f0408]/95 shadow-[0_0_80px_rgba(255,0,70,0.35)] p-8 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-red-800/90 to-transparent" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-red-500/20 grid place-items-center text-red-200 text-2xl font-bold">!</div>
          <div>
            <div className="mono text-[11px] text-red-300 uppercase tracking-[0.24em]">{severity === "critical" ? "FULL EMERGENCY" : "VOICE WARNING"}</div>
            <h2 className="text-3xl font-semibold text-white mt-2">{title}</h2>
          </div>
        </div>
        <p className="mt-4 text-sm text-red-200/80">{subtitle}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
            <div className="mono text-[10px] uppercase text-red-300">Live Timestamp</div>
            <div className="font-semibold mt-2 text-white">{new Date().toLocaleTimeString()}</div>
          </div>
          <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
            <div className="mono text-[10px] uppercase text-red-300">Threat</div>
            <div className="font-semibold mt-2 text-white">{severity === "critical" ? "CRITICAL" : "ELEVATED"}</div>
          </div>
          <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
            <div className="mono text-[10px] uppercase text-red-300">Action</div>
            <div className="font-semibold mt-2 text-white">Emergency mode activated</div>
          </div>
        </div>
      </div>
    </div>
  );
}
