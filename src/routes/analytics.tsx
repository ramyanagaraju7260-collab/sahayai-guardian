import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, AlertTriangle, Clock, HeartHandshake, TrendingUp } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useEmergencyStore } from "@/store/emergency";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Intel | SahayAI X" }] }),
  component: Analytics,
});

const typeData = [
  { name: "Accidents", value: 34, color: "oklch(0.66 0.24 25)" },
  { name: "Medical", value: 28, color: "oklch(0.66 0.22 350)" },
  { name: "Fire", value: 18, color: "oklch(0.78 0.17 45)" },
  { name: "Violence", value: 12, color: "oklch(0.55 0.22 280)" },
  { name: "Other", value: 8, color: "oklch(0.78 0.16 175)" },
];

const hourly = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}h`,
  count: Math.round(20 + Math.sin(h / 3) * 15 + Math.random() * 10 + (h >= 17 && h <= 22 ? 25 : 0)),
}));

const accuracyData = [87, 89, 91, 93, 90, 94, 96].map((v, i) => ({ day: `D${i + 1}`, acc: v }));

const tooltipStyle = {
  background: "oklch(0.18 0.014 255)",
  border: "1px solid oklch(1 0 0 / 0.1)",
  borderRadius: 12,
  fontSize: 12,
};

const axisTick = {
  fill: "oklch(0.7 0.018 260)",
  fontSize: 10,
  fontFamily: "JetBrains Mono",
};

function Analytics() {
  const { incidents } = useEmergencyStore();
  const [feed, setFeed] = useState(incidents);

  useEffect(() => {
    const id = setInterval(() => {
      const samples = ["Accident detected", "Fall detected", "Voice panic", "Fire alert", "Medical alert"];
      const places = ["Indiranagar", "HSR Layout", "Whitefield", "Koramangala", "MG Road", "Jayanagar"];
      const sev = ["HIGH", "CRITICAL", "MEDIUM"] as const;

      setFeed((current) => [
        {
          id: crypto.randomUUID(),
          type: samples[Math.floor(Math.random() * samples.length)],
          location: `${places[Math.floor(Math.random() * places.length)]}, Bengaluru`,
          severity: sev[Math.floor(Math.random() * sev.length)],
          status: "ACTIVE" as const,
          ts: Date.now(),
        },
        ...current,
      ].slice(0, 18));
    }, 7000);

    return () => clearInterval(id);
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 lg:px-8">
        <div>
          <div className="mono text-[11px] tracking-widest text-muted-foreground">
            <Activity className="mr-1 inline h-3 w-3 text-safe" /> EMERGENCY INTELLIGENCE COMMAND
          </div>
          <h1 className="font-display text-3xl font-bold text-gradient lg:text-4xl">War Room | Live</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Emergencies Today", val: "127", trend: "+12%", icon: AlertTriangle, color: "oklch(0.66 0.24 25)" },
            { label: "Avg Response", val: "4.2 min", trend: "-8%", icon: Clock, color: "oklch(0.78 0.16 175)" },
            { label: "Lives Impacted", val: "89", trend: "+23%", icon: HeartHandshake, color: "oklch(0.85 0.18 340)" },
            { label: "Active SOS", val: "3", trend: "LIVE", icon: TrendingUp, color: "oklch(0.66 0.24 25)", live: true },
          ].map((metric, index) => (
            <div key={index} className="panel relative overflow-hidden p-4">
              {metric.live && <span className="glow-danger absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-primary" />}
              <metric.icon className="h-5 w-5" style={{ color: metric.color }} />
              <div className="mt-3 font-display text-3xl font-bold">{metric.val}</div>
              <div className="mono mt-1 text-[10px] tracking-widest text-muted-foreground">{metric.label}</div>
              <div className="mono mt-1 text-[10px]" style={{ color: metric.color }}>
                {metric.trend}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="panel p-5">
            <h3 className="font-display text-base font-semibold">Type Distribution</h3>
            <p className="mono mb-2 text-[10px] text-muted-foreground">LAST 24H</p>
            <div className="h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={typeData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {typeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {typeData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-sm" style={{ background: entry.color }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="mono ml-auto">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5 lg:col-span-2">
            <h3 className="font-display text-base font-semibold">Hourly Frequency</h3>
            <p className="mono mb-2 text-[10px] text-muted-foreground">PEAK HOURS HIGHLIGHTED</p>
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={hourly}>
                  <XAxis dataKey="hour" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "oklch(1 0 0 / 0.04)" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {hourly.map((entry, index) => (
                      <Cell key={index} fill={entry.count > 50 ? "oklch(0.66 0.24 25)" : "oklch(0.55 0.18 250)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="panel p-5">
            <h3 className="font-display text-base font-semibold">AI Detection Accuracy</h3>
            <p className="mono mb-2 text-[10px] text-muted-foreground">7 DAY TREND</p>
            <div className="h-52">
              <ResponsiveContainer>
                <AreaChart data={accuracyData}>
                  <defs>
                    <linearGradient id="acc" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.16 175)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="oklch(0.78 0.16 175)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="acc" stroke="oklch(0.78 0.16 175)" strokeWidth={2} fill="url(#acc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mono mt-2 text-[10px] text-safe">+9pts | false positives down 34%</div>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Live Emergency Feed</h3>
            <div className="mono flex items-center gap-1.5 text-[10px]">
              <span className="status-dot danger" /> STREAMING
            </div>
          </div>
          <div className="mt-3 max-h-80 space-y-1.5 overflow-y-auto">
            {feed.map((incident) => {
              const ago = Math.max(1, Math.round((Date.now() - incident.ts) / 60000));
              const sevColor =
                incident.severity === "CRITICAL"
                  ? "oklch(0.66 0.24 25)"
                  : incident.severity === "HIGH"
                    ? "oklch(0.78 0.17 65)"
                    : "oklch(0.78 0.16 175)";

              return (
                <div
                  key={incident.id}
                  className="flex items-center gap-3 rounded-lg border border-transparent p-2.5 hover:border-border/50 hover:bg-white/5"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: sevColor, boxShadow: `0 0 8px ${sevColor}` }} />
                  <span className="mono w-14 text-[10px] text-muted-foreground">{ago}m ago</span>
                  <span className="text-sm font-medium">{incident.type}</span>
                  <span className="mono text-[11px] text-muted-foreground">| {incident.location}</span>
                  <span
                    className="mono ml-auto rounded-full px-2 py-0.5 text-[10px]"
                    style={{ background: `${sevColor}25`, color: sevColor }}
                  >
                    {incident.severity}
                  </span>
                  <span className="mono text-[10px] text-muted-foreground">{incident.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
