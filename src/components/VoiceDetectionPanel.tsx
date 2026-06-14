import { LiveWaveform } from "./LiveWaveform";
import { EmergencyKeywordFeed } from "./EmergencyKeywordFeed";
import { ThreatLevelIndicator } from "./ThreatLevelIndicator";

export type VoiceAlertEntry = {
  keyword: string;
  confidence: number;
  severity: "safe" | "warning" | "critical";
  ts: number;
};

export function VoiceDetectionPanel({
  active,
  label,
  status,
  score,
  waveLevels,
  history,
}: {
  active: boolean;
  label: string;
  status: "safe" | "warning" | "critical";
  score: number;
  waveLevels: number[];
  history: VoiceAlertEntry[];
}) {
  return (
    <div className="mt-6 rounded-[2rem] border border-border/70 bg-background/90 p-5 shadow-xl shadow-slate-950/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Voice monitoring</div>
          <div className="mt-2 text-2xl font-semibold">{active ? "AI Voice Monitoring Active" : label}</div>
          <div className="text-sm text-muted-foreground mt-1">Realtime emergency keyword detection and panic analysis from microphone audio.</div>
        </div>
        <ThreatLevelIndicator score={score} label={status === "critical" ? "CRITICAL" : status === "warning" ? "WARNING" : "SAFE"} severity={status} />
      </div>
      <div className="grid gap-4 mt-5 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <LiveWaveform levels={waveLevels} />
          <div className="mt-3 prose prose-sm text-muted-foreground">
            <p>Live waveform visualizes microphone input. The AI engine is listening for keywords like HELP, FIRE, KIDNAP, POLICE, and SMOKE.</p>
          </div>
        </div>
        <EmergencyKeywordFeed entries={history} />
      </div>
    </div>
  );
}
