import { AlertTriangle, Sparkles } from "lucide-react";

type Entry = {
  keyword: string;
  confidence: number;
  severity: "safe" | "warning" | "critical";
  ts: number;
};

export function EmergencyKeywordFeed({ entries }: { entries: Entry[] }) {
  return (
    <div className="rounded-3xl bg-background/90 border border-border/70 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="mono text-[11px] text-muted-foreground tracking-[0.22em] uppercase">Emergency keyword feed</div>
          <div className="font-semibold mt-1 text-sm">Live voice alert tracker</div>
        </div>
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-sm text-muted-foreground">No keywords detected yet. SahayAI is listening for HELP, FIRE, KIDNAP, and other danger signals.</div>
        ) : (
          entries.map((entry) => (
            <div key={`${entry.keyword}-${entry.ts}`} className="rounded-2xl p-3 border border-border/50 bg-surface/80 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium capitalize">{entry.keyword}</div>
                <div className="mono text-[11px] text-muted-foreground">{new Date(entry.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{entry.confidence}%</div>
                <div className={`mono text-[11px] ${entry.severity === "critical" ? "text-primary" : entry.severity === "warning" ? "text-amber-400" : "text-muted-foreground"}`}> {entry.severity.toUpperCase()}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <AlertTriangle className="w-4 h-4 text-warning" /> Voice stream is processed entirely in-browser; no backend inference.
      </div>
    </div>
  );
}
