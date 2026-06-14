import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useEmergencyStore } from "@/store/emergency";
import { Building2, Radio, Users, Ambulance, ShieldAlert, Activity } from "lucide-react";

export const Route = createFileRoute("/authority-dashboard")({
  head: () => ({ meta: [{ title: "Operations · SahayAI Pro" }] }),
  component: Authority,
});

function Authority() {
  const { incidents } = useEmergencyStore();
  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 max-w-[1500px] mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="mono text-[11px] text-muted-foreground tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3 h-3" /> PREMIUM OPERATIONS COMMAND CENTER
            </div>
            <h1 className="font-display text-3xl font-bold text-gradient">Operations Command</h1>
          </div>
          <div className="hidden lg:flex items-center gap-2 mono text-[11px]">
            <span className="status-dot safe" /> SECURE LINK · BENGALURU EOC
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { l: "Active Incidents", v: "23", c: "oklch(0.66 0.24 25)", i: ShieldAlert },
            { l: "Units Deployed", v: "47", c: "oklch(0.78 0.16 175)", i: Ambulance },
            { l: "Volunteers Online", v: "1,284", c: "oklch(0.70 0.18 250)", i: Users },
            { l: "Mesh Nodes", v: "326", c: "oklch(0.85 0.18 100)", i: Radio },
          ].map((m) => (
            <div key={m.l} className="panel p-4">
              <m.i className="w-5 h-5" style={{ color: m.c }} />
              <div className="font-display text-3xl font-bold mt-2">{m.v}</div>
              <div className="mono text-[10px] text-muted-foreground tracking-widest">{m.l}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="panel p-5 lg:col-span-2">
            <h3 className="font-display text-base font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Active Operations</h3>
            <div className="mt-4 space-y-2">
              {incidents.slice(0, 6).map((i) => {
                const sev = i.severity === "CRITICAL" ? "oklch(0.66 0.24 25)" : "oklch(0.78 0.17 65)";
                return (
                  <div key={i.id} className="p-3 rounded-xl glass border-l-2" style={{ borderLeftColor: sev }}>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">{i.type}</div>
                      <span className="mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${sev}20`, color: sev }}>{i.severity}</span>
                      <span className="ml-auto mono text-[10px] text-muted-foreground">{i.status}</span>
                    </div>
                    <div className="mono text-[11px] text-muted-foreground mt-0.5">{i.location}</div>
                    <div className="mt-2 flex gap-2">
                      <button className="px-3 py-1 rounded-md mono text-[10px] bg-primary/15 text-primary border border-primary/30">DISPATCH</button>
                      <button className="px-3 py-1 rounded-md mono text-[10px] glass">RELAY TO HOSPITAL</button>
                      <button className="px-3 py-1 rounded-md mono text-[10px] glass">ESCALATE</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="panel p-5">
              <h3 className="font-display text-base font-semibold mb-3">Public Broadcast</h3>
              <textarea
                placeholder="Compose city-wide emergency alert…"
                className="w-full h-24 bg-transparent border border-border rounded-xl p-3 text-sm resize-none outline-none focus:border-primary/50"
              />
              <div className="flex gap-2 mt-2">
                <button className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground mono text-xs font-bold">BROADCAST</button>
                <button className="px-3 py-2 rounded-lg glass mono text-xs">PREVIEW</button>
              </div>
              <div className="mono text-[10px] text-muted-foreground mt-2">Reach: 2.4M devices · 387 districts</div>
            </div>

            <div className="panel p-5">
              <h3 className="font-display text-base font-semibold mb-3">Forecast</h3>
              {[
                { l: "Stampede risk · MG Road", p: 78, c: "oklch(0.66 0.24 25)" },
                { l: "Flood probability · Bellandur", p: 54, c: "oklch(0.78 0.17 65)" },
                { l: "Traffic accident hotspot · ORR", p: 41, c: "oklch(0.78 0.16 175)" },
              ].map((p) => (
                <div key={p.l} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs">
                    <span>{p.l}</span><span className="mono" style={{ color: p.c }}>{p.p}%</span>
                  </div>
                  <div className="h-1.5 mt-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.p}%`, background: p.c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
