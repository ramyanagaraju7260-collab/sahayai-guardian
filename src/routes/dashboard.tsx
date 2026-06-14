import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sparkline } from "@/components/Sparkline";
import { AIRecorder } from "@/components/AIRecorder";
import { useEmergencyStore } from "@/store/emergency";
import { useLanguageStore, t } from "@/store/language";
import { Activity, Compass, Mic, Camera, Heart, Gauge, ShieldCheck, ShieldAlert, Wifi, BatteryFull, MapPin, Sparkles, Play, Users, Baby, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · SahayAI Pro" }] }),
  component: Dashboard,
});

const insights = [
  "All sensors nominal — You are safe.",
  "GPS accuracy: HIGH — Location locked.",
  "No anomalies detected in last 30 minutes.",
  "Behavioral baseline: stable. Stress index 0.12.",
  "Voice envelope: calm · 28dB ambient.",
  "Multi-modal fusion engine: 6/6 streams active.",
];

function StatusRing({ status, score }: { status: string; score: number }) {
  const color = status === "emergency" ? "var(--color-danger)" : status === "alert" ? "var(--color-warn)" : "var(--color-safe)";
  const pct = score / 100;
  const c = 2 * Math.PI * 42;
  return (
    <div className="relative w-28 h-28 grid place-items-center">
      <span className="absolute inset-0 rounded-full animate-pulse-ring border" style={{ borderColor: color }} />
      <span className="absolute inset-2 rounded-full animate-pulse-ring border" style={{ borderColor: color, animationDelay: "0.7s" }} />
      <svg viewBox="0 0 100 100" className="absolute inset-0">
        <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="3" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 600ms ease, stroke 300ms" }} />
      </svg>
      <div className="text-center">
        <div className="font-display text-2xl font-bold" style={{ color }}>{score}</div>
        <div className="mono text-[10px] text-muted-foreground">INTEGRITY</div>
      </div>
    </div>
  );
}

function SensorCard({ icon: Icon, name, value, unit, status, history, color }: any) {
  const dotClass = status === "danger" ? "danger" : status === "warn" ? "warn" : "safe";
  return (
    <div className="panel p-4 relative overflow-hidden group hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg glass grid place-items-center">
            <Icon className="w-4 h-4 opacity-80" />
          </div>
          <div>
            <div className="mono text-[10px] text-muted-foreground tracking-wider">{name}</div>
            <div className="font-display text-xl font-semibold leading-none">
              {value}<span className="mono text-xs text-muted-foreground ml-1 font-normal">{unit}</span>
            </div>
          </div>
        </div>
        <span className={`status-dot ${dotClass} mt-2`} />
      </div>
      <div className="mt-3 -mx-1">
        <Sparkline data={history} color={color} height={28} />
      </div>
    </div>
  );
}

function Dashboard() {
  const { sensors, status, safetyScore, emergencyProb, triggerSOS, setDemo, demoMode } = useEmergencyStore();
  const { language } = useLanguageStore();
  const [insight, setInsight] = useState(insights[0]);
  const nav = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setInsight(insights[Math.floor(Math.random() * insights.length)]), 6000);
    return () => clearInterval(id);
  }, []);

  // Demo mode scripted sequence
  useEffect(() => {
    if (!demoMode) return;
    const t1 = setTimeout(() => triggerSOS("Auto-detected accident"), 3000);
    const t2 = setTimeout(() => nav({ to: "/sos" }), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [demoMode, nav, triggerSOS]);

  const topIdeas = [
    {
      title: "Silent Distress AI",
      description: "Detects silent danger from grip, gesture, breathing and hidden panic before SOS is triggered.",
    },
    {
      title: "Disaster Internet Without Internet",
      description: "Phone mesh networks and Bluetooth relay chains keep rescue messages alive when towers fail.",
    },
    {
      title: "AI Stampede Prevention",
      description: "Real-time crowd flow prediction from CCTV and drones to stop disasters before they start.",
    },
    {
      title: "Missing Child Prediction",
      description: "Predicts separation risk using movement gap, crowd density and sudden deviation detection.",
    },
    {
      title: "Women Safety Environment AI",
      description: "Scores area risk using crime history, lighting, crowd patterns and route safety in real time.",
    },
  ];

  const featureBuckets = [
    {
      title: "AI Emergency Detection",
      items: ["Accident, fall, fire, smoke, flood", "trauma, blood, weapon, seizure", "danger scoring and false-alarm reduction"],
    },
    {
      title: "Smart SOS Systems",
      items: ["Silent SOS, secret gestures, auto-call", "offline mesh and relay communication", "live rescue tracking and location sharing"],
    },
    {
      title: "Safety for People",
      items: ["Women, elderly, child and crowd protection", "heart, sleep and emotional wellness", "environmental risk prediction"],
    },
    {
      title: "Futuristic AI Ecosystem",
      items: ["Drone rescue support", "IoT safety network", "disaster heatmaps and smart city integration"],
    },
  ];

  const aiAgentFeatures = [
    { title: "Silent Distress Agent", description: "Predicts silent danger using motion, grip, breathing, and behavioral hesitation." },
    { title: "Crowd Safety Agent", description: "Prevents stampedes with crowd flow analysis and drone-assisted monitoring." },
    { title: "Missing Child Agent", description: "Detects separation risk before the child is actually lost." },
    { title: "Environment Risk Agent", description: "Scores route safety using crime history, lighting, and crowd dynamics." },
    { title: "Trauma Companion Agent", description: "Delivers calming AI first aid voice and trauma-safe guidance." },
  ];

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 max-w-[1400px] mx-auto space-y-6">
        {/* Hero status */}
        <section className="panel p-5 lg:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <StatusRing status={status} score={safetyScore} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mono text-[11px] text-muted-foreground tracking-wider">
                <Sparkles className="w-3 h-3 text-primary" /> PREMIUM COMMAND CENTER · MONITORING 6 STREAMS
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold mt-1 text-gradient">
                {status === "emergency" ? "Emergency response engaged" : "Premium protection active"}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">{insight}</p>

              <div className="flex flex-wrap gap-2 mt-4 mono text-[11px]">
                <span className="px-2.5 py-1 rounded-md glass flex items-center gap-1.5"><MapPin className="w-3 h-3 text-info" /> Bengaluru, IN</span>
                <span className="px-2.5 py-1 rounded-md glass flex items-center gap-1.5"><Wifi className="w-3 h-3 text-safe" /> 5G · -64dBm</span>
                <span className="px-2.5 py-1 rounded-md glass flex items-center gap-1.5"><BatteryFull className="w-3 h-3 text-safe" /> 87% · Optimized</span>
                <span className="px-2.5 py-1 rounded-md glass flex items-center gap-1.5">
                  {status === "safe" ? <ShieldCheck className="w-3 h-3 text-safe" /> : <ShieldAlert className="w-3 h-3 text-primary" />}
                  THREAT INDEX {emergencyProb}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full lg:w-auto">
              <button onClick={() => { triggerSOS("Dashboard SOS"); nav({ to: "/sos" }); }} className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/70 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 glow-danger hover:scale-[1.02] transition">
                <ShieldAlert className="w-4 h-4" /> ACTIVATE PROTOCOL
              </button>
              <button onClick={() => setDemo(!demoMode)} className="px-4 py-2 rounded-xl glass text-xs mono flex items-center justify-center gap-2 hover:bg-white/5">
                <Play className="w-3 h-3" /> {demoMode ? "SIMULATION RUNNING…" : "SIMULATE"}
              </button>
            </div>
          </div>
        </section>

        {/* AI recorder */}
        <section>
          <AIRecorder />
        </section>

        {/* Sensor grid */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="font-display text-xl font-semibold">Operational Telemetry</h2>
              <p className="mono text-[11px] text-muted-foreground">REAL-TIME DATA FUSION</p>
            </div>
            <div className="mono text-[11px] text-muted-foreground">UPDATE 1.5s</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
            <SensorCard icon={Gauge} name="ACCELEROMETER" value={sensors.accel.toFixed(2)} unit="G" status={sensors.accel > 4 ? "danger" : "safe"} history={sensors.history.accel} color="oklch(0.78 0.16 175)" />
            <SensorCard icon={Compass} name="GYROSCOPE" value={sensors.gyro.toFixed(1)} unit="°/s" status="safe" history={sensors.history.accel.map(v => v * 5)} color="oklch(0.70 0.18 250)" />
            <SensorCard icon={MapPin} name="GPS LOCK" value={sensors.gps.lat.toFixed(4)} unit={sensors.gps.lng.toFixed(4)} status="safe" history={sensors.history.bpm} color="oklch(0.78 0.17 65)" />
            <SensorCard icon={Mic} name="VOICE ENVELOPE" value={Math.round(sensors.voice)} unit="dB" status={sensors.voice > 70 ? "warn" : "safe"} history={sensors.history.voice} color="oklch(0.66 0.24 25)" />
            <SensorCard icon={Camera} name="CV ENGINE" value={sensors.cv.toFixed(1)} unit="% RDY" status="safe" history={sensors.history.bpm.map(v => v / 2)} color="oklch(0.78 0.16 175)" />
            <SensorCard icon={Heart} name="HEART RATE" value={Math.round(sensors.bpm)} unit="BPM" status={sensors.bpm > 120 ? "danger" : sensors.bpm > 100 ? "warn" : "safe"} history={sensors.history.bpm} color="oklch(0.66 0.24 25)" />
          </div>
        </section>

        {/* Modes & fusion */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="panel p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Multi-Modal Fusion</h3>
                <p className="mono text-[11px] text-muted-foreground">EMERGENCY PROBABILITY ENGINE</p>
              </div>
              <div className="text-right">
                <div className="font-display text-3xl font-bold" style={{ color: emergencyProb > 70 ? "var(--color-danger)" : emergencyProb > 40 ? "var(--color-warn)" : "var(--color-safe)" }}>
                  {emergencyProb}%
                </div>
                <div className="mono text-[10px] text-muted-foreground">CONFIDENCE</div>
              </div>
            </div>

            <svg viewBox="0 0 400 140" className="w-full mt-3">
              {[
                { y: 20, label: "ACCEL", v: Math.min(100, sensors.accel * 12) },
                { y: 45, label: "VOICE", v: sensors.voice },
                { y: 70, label: "BPM", v: Math.min(100, (sensors.bpm - 50) * 1.5) },
                { y: 95, label: "GYRO", v: sensors.gyro * 2 },
                { y: 120, label: "CV", v: sensors.cv },
              ].map((s, i) => (
                <g key={i}>
                  <text x="0" y={s.y + 4} fill="oklch(0.7 0.018 260)" fontSize="9" fontFamily="JetBrains Mono">{s.label}</text>
                  <rect x="50" y={s.y - 3} width="200" height="6" rx="3" fill="oklch(1 0 0 / 0.05)" />
                  <rect x="50" y={s.y - 3} width={s.v * 2} height="6" rx="3" fill="url(#fg)" />
                  <path d={`M 250 ${s.y} Q 320 ${s.y}, 360 70`} fill="none" stroke="oklch(0.66 0.24 25 / 0.4)" strokeWidth="1" strokeDasharray="3 3">
                    <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite" />
                  </path>
                </g>
              ))}
              <defs>
                <linearGradient id="fg" x1="0" x2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 175)" />
                  <stop offset="100%" stopColor="oklch(0.66 0.24 25)" />
                </linearGradient>
              </defs>
              <circle cx="370" cy="70" r="14" fill="oklch(0.66 0.24 25 / 0.2)" stroke="oklch(0.66 0.24 25)" />
              <text x="370" y="73" textAnchor="middle" fill="white" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">{emergencyProb}</text>
            </svg>
          </div>

          <div className="panel p-5">
            <h3 className="font-display text-lg font-semibold">Security Suites</h3>
            <p className="mono text-[11px] text-muted-foreground mb-3">PREMIUM SECURITY CONFIG</p>
            <div className="space-y-2">
              {[
                { icon: UserRound, name: "Women Safety Shield", desc: "Stealth · Auto-record · Guardian", color: "oklch(0.85 0.18 340)" },
                { icon: Users, name: "Elderly Guardian", desc: "Fall · Inactivity · Heart anomaly", color: "oklch(0.78 0.16 175)" },
                { icon: Baby, name: "Child Safety", desc: "Geo-fence · Stranger alert · Live", color: "oklch(0.78 0.17 65)" },
                { icon: Activity, name: "Disaster Mode", desc: "Mesh relay · Offline SMS · Beacon", color: "oklch(0.70 0.18 250)" },
              ].map((m, i) => (
                <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 transition text-left">
                  <div className="w-9 h-9 rounded-lg grid place-items-center" style={{ background: `${m.color.replace(")", " / 0.15)")}` }}>
                    <m.icon className="w-4 h-4" style={{ color: m.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="mono text-[10px] text-muted-foreground truncate">{m.desc}</div>
                  </div>
                  <div className="w-9 h-5 rounded-full bg-white/5 relative">
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-muted-foreground/50" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Hackathon vision & ecosystem */}
        <section className="panel p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="mono text-[11px] text-muted-foreground tracking-widest">JUDGES-READY VISION</div>
              <h2 className="font-display text-3xl font-bold mt-2">SahayAI X: The Ultimate Emergency Intelligence Ecosystem</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl">A futuristic, emotionally powerful platform that predicts danger, supports trauma survivors, prevents disasters, protects vulnerable people, and keeps rescue communication alive even without the internet.</p>
            </div>
          </div>

          <div className="grid gap-4 mt-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-3">
                {featureBuckets.map((bucket) => (
                  <div key={bucket.title} className="rounded-3xl bg-background p-4 border border-border/60">
                    <div className="font-semibold">{bucket.title}</div>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {bucket.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="status-dot safe" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-surface/90 to-background p-5 border border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 grid place-items-center text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="mono text-[11px] text-muted-foreground tracking-widest">AI AGENT LAB</div>
                  <div className="font-display text-2xl font-semibold mt-1">Unique Agent Features</div>
                </div>
              </div>
              <div className="grid gap-3 mt-6 text-sm text-muted-foreground">
                {aiAgentFeatures.map((agent) => (
                  <div key={agent.title} className="rounded-3xl bg-background/80 p-4 border border-border/50">
                    <div className="font-semibold">{agent.title}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{agent.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
