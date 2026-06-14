import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useEmergencyStore } from "@/store/emergency";
import { History as HistoryIcon, FileDown } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Incidents · SahayAI X" }] }),
  component: History,
});

function History() {
  const { incidents } = useEmergencyStore();
  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-5">
        <div>
          <div className="mono text-[11px] text-muted-foreground tracking-widest"><HistoryIcon className="w-3 h-3 inline mr-1" /> AUDIT TRAIL</div>
          <h1 className="font-display text-3xl font-bold text-gradient">Incident History</h1>
        </div>

        <div className="panel p-2">
          {incidents.map((i, idx) => {
            const d = new Date(i.ts);
            const sevColor = i.severity === "CRITICAL" ? "oklch(0.66 0.24 25)" : i.severity === "HIGH" ? "oklch(0.78 0.17 65)" : "oklch(0.78 0.16 175)";
            return (
              <div key={i.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 relative">
                {idx !== incidents.length - 1 && <span className="absolute left-[34px] top-12 w-px h-full bg-border" />}
                <div className="w-7 h-7 rounded-full grid place-items-center shrink-0" style={{ background: `${sevColor}25`, border: `1px solid ${sevColor}` }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: sevColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{i.type}</div>
                    <span className="mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${sevColor}20`, color: sevColor }}>{i.severity}</span>
                  </div>
                  <div className="mono text-[11px] text-muted-foreground">{i.location} · {d.toLocaleString()}</div>
                </div>
                <span className="mono text-[10px] text-muted-foreground">{i.status}</span>
                <button className="px-3 py-1.5 rounded-lg glass text-xs flex items-center gap-1.5"><FileDown className="w-3.5 h-3.5" /> Report</button>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
