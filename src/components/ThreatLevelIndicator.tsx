export function ThreatLevelIndicator({ score, label, severity }: { score: number; label: string; severity: "safe" | "warning" | "critical" }) {
  const color = severity === "critical" ? "bg-gradient-to-r from-red-500 to-rose-500" : severity === "warning" ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-cyan-400 to-teal-500";
  const ring = severity === "critical" ? "border-red-500/30" : severity === "warning" ? "border-amber-400/30" : "border-cyan-500/30";
  return (
    <div className={`rounded-3xl border ${ring} p-4 bg-background/80`}> 
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="mono text-[11px] text-muted-foreground uppercase tracking-[0.22em]">{label}</div>
          <div className="text-2xl font-semibold mt-2">{score}%</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[11px] font-medium ${severity === "critical" ? "bg-red-500/15 text-red-300" : severity === "warning" ? "bg-amber-400/15 text-amber-300" : "bg-cyan-400/15 text-cyan-300"}`}> {severity.toUpperCase()} </div>
      </div>
      <div className="mt-4 h-3 rounded-full bg-white/5 overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width: `${Math.min(100, Math.max(0, score))}%`, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}
