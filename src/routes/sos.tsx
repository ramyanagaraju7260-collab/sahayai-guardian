import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useEmergencyStore } from "@/store/emergency";
import { useEffect, useState } from "react";
import { AlertTriangle, Car, Flame, HeartPulse, Swords, Waves, Zap as ElectricIcon, ShieldCheck, Phone, MapPin, Bot, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/sos")({
  head: () => ({ meta: [{ title: "SOS · SahayAI X" }] }),
  component: SOS,
});

const types = [
  { id: "accident", icon: Car, label: "Accident", color: "oklch(0.66 0.24 25)" },
  { id: "fire", icon: Flame, label: "Fire", color: "oklch(0.78 0.17 45)" },
  { id: "medical", icon: HeartPulse, label: "Medical", color: "oklch(0.85 0.18 10)" },
  { id: "violence", icon: Swords, label: "Violence", color: "oklch(0.66 0.22 350)" },
  { id: "flood", icon: Waves, label: "Flood", color: "oklch(0.70 0.18 230)" },
  { id: "electric", icon: ElectricIcon, label: "Electrical", color: "oklch(0.85 0.18 100)" },
];

const steps = [
  "Emergency detected",
  "Classifying emergency type…",
  "Severity: CRITICAL (92%)",
  "Alerting 3 emergency contacts",
  "Live GPS shared with responders",
  "Ambulance route calculating",
  "AI Guardian activated",
];

function SOS() {
  const { triggerSOS, status, sensors } = useEmergencyStore();
  const nav = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(status === "emergency");
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => { if (status === "emergency" && !activated) setActivated(true); }, [status, activated]);

  useEffect(() => {
    if (!activated) return;
    setStep(0);
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 800);
    const cd = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => { clearInterval(id); clearInterval(cd); };
  }, [activated]);

  const activate = () => {
    setProgress(100);
    triggerSOS(selected ? `SOS · ${selected}` : "SOS Manual");
    setActivated(true);
  };

  if (activated) {
    return (
      <Layout>
        <div className="px-4 lg:px-8 py-6 max-w-[1400px] mx-auto">
          <div className="panel p-6 lg:p-8 relative overflow-hidden glow-danger">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-primary animate-pulse" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-primary animate-pulse" />

            <div className="flex items-center gap-3 mono text-xs text-primary tracking-widest">
              <span className="status-dot danger" /> EMERGENCY ACTIVE · UPLINK ESTABLISHED
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mt-2 text-danger-gradient">Help is on the way.</h1>
            <p className="text-muted-foreground mt-1">Stay calm. Keep your phone with you. AI Guardian is coordinating response.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
              <div className="lg:col-span-2 space-y-2">
                {steps.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${i <= step ? "border-primary/40 bg-primary/5" : "border-border bg-white/[0.02] opacity-50"}`}>
                    <div className={`w-7 h-7 rounded-full grid place-items-center ${i <= step ? "bg-primary text-primary-foreground" : "bg-white/5"}`}>
                      {i < step ? <CheckCircle2 className="w-4 h-4" /> : <span className="mono text-xs">{i + 1}</span>}
                    </div>
                    <div className="flex-1 mono text-sm">{s}</div>
                    {i === step && <span className="mono text-[10px] text-primary animate-pulse">LIVE</span>}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="panel p-4">
                  <div className="mono text-[10px] text-muted-foreground">RESPONSE COUNTDOWN</div>
                  <div className="font-display text-5xl font-bold text-primary">{countdown}s</div>
                  <div className="mono text-[10px] text-muted-foreground mt-1">AUTO-CALL 112 IF UNRESPONSIVE</div>
                </div>
                <div className="panel p-4">
                  <div className="mono text-[10px] text-muted-foreground">LIVE COORDINATES</div>
                  <div className="mono text-sm">{sensors.gps.lat.toFixed(5)}°N</div>
                  <div className="mono text-sm">{sensors.gps.lng.toFixed(5)}°E</div>
                  <div className="mono text-[10px] text-safe mt-1">±2.4m · LOCKED</div>
                </div>
                <button onClick={() => nav({ to: "/ai-assistant" })} className="w-full py-3 rounded-xl bg-gradient-to-r from-info/30 to-info/10 border border-info/30 flex items-center justify-center gap-2 text-sm font-medium hover:bg-info/20">
                  <Bot className="w-4 h-4" /> Open AI Guardian
                </button>
                <button onClick={() => nav({ to: "/tracking" })} className="w-full py-3 rounded-xl glass text-sm font-medium hover:bg-white/5 flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" /> View Live Map
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {["Mom · Priya", "Dad · Arvind", "Friend · Neha"].map((c, i) => (
                <div key={i} className="panel p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-info/30 grid place-items-center text-xs font-bold">{c.split("·")[1].trim().charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{c}</div>
                    <div className="mono text-[10px] text-safe">DELIVERED · GPS shared</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-safe" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 max-w-[1400px] mx-auto">
        <div className="text-center mb-2 mono text-[11px] text-muted-foreground tracking-widest">
          <AlertTriangle className="w-3 h-3 inline mr-1 text-primary" /> EMERGENCY DISPATCH · TAP TO ACTIVATE
        </div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-center text-gradient">Send SOS</h1>
        <p className="text-center text-muted-foreground text-sm mt-1">Tap the button once to instantly send SOS.</p>

        <div className="grid place-items-center mt-10">
          <div className="relative w-[280px] h-[280px] grid place-items-center">
            {/* concentric rings */}
            <span className="absolute inset-0 rounded-full border border-primary/40 animate-pulse-ring pointer-events-none" />
            <span className="absolute inset-0 rounded-full border border-primary/30 animate-pulse-ring pointer-events-none" style={{ animationDelay: "0.6s" }} />
            <span className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-ring pointer-events-none" style={{ animationDelay: "1.2s" }} />

            {/* progress arc */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90 pointer-events-none">
              <circle cx="100" cy="100" r="92" fill="none" stroke="oklch(1 0 0 / 0.05)" strokeWidth="4" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="oklch(0.85 0.20 25)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 92} strokeDashoffset={2 * Math.PI * 92 * (1 - progress / 100)}
                style={{ transition: "stroke-dashoffset 300ms" }} />
            </svg>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                activate();
              }}
              className="w-[200px] h-[200px] rounded-full bg-gradient-to-br from-primary via-primary to-primary/60 grid place-items-center glow-danger active:scale-95 transition-transform shadow-2xl"
              style={{ boxShadow: "0 30px 80px -10px oklch(0.66 0.24 25 / 0.6), inset 0 -20px 40px oklch(0 0 0 / 0.3), inset 0 4px 0 oklch(1 0 0 / 0.2)" }}
            >
              <div className="text-center">
                <div className="font-display text-5xl font-extrabold text-primary-foreground tracking-tighter">SOS</div>
                <div className="mono text-[10px] text-primary-foreground/80 tracking-widest mt-1">TAP TO SEND</div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-center mono text-[11px] text-muted-foreground tracking-widest mb-3">EMERGENCY TYPE</div>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 max-w-3xl mx-auto">
            {types.map((t) => {
              const active = selected === t.id;
              return (
                <button key={t.id} onClick={() => setSelected(t.id)}
                  className={`panel p-4 flex flex-col items-center gap-2 transition-all ${active ? "scale-105" : "hover:bg-white/5"}`}
                  style={active ? { boxShadow: `0 0 0 1px ${t.color}, 0 0 30px ${t.color.replace(")", " / 0.4)")}` } : {}}>
                  <t.icon className="w-6 h-6" style={{ color: t.color }} />
                  <div className="text-xs font-medium">{t.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 panel p-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-safe" />
            <div className="flex-1">
              <div className="text-sm font-medium">Auto-SOS in {countdown}s if no response</div>
              <div className="mono text-[10px] text-muted-foreground">Triggered after fall detected at 03:42 PM</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button type="button" onClick={() => setCountdown(60)} className="py-3 rounded-xl bg-safe/15 border border-safe/30 text-safe font-semibold text-sm">I AM SAFE</button>
            <button type="button" onClick={() => { triggerSOS("Confirm SOS"); setActivated(true); }} className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> SEND SOS NOW
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
