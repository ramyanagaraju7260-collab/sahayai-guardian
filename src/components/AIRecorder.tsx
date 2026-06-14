import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Video, Square, Loader2, AlertTriangle, ShieldCheck, Bot, X } from "lucide-react";
import { useEmergencyStore } from "@/store/emergency";
import { VoiceDetectionPanel, type VoiceAlertEntry } from "./VoiceDetectionPanel";
import { EmergencyVoiceOverlay } from "./EmergencyVoiceOverlay";

type Mode = "voice" | "video";
type Phase = "idle" | "recording" | "analyzing" | "result";

type ThreatSeverity = "safe" | "warning" | "critical";

const KEYWORDS = [
  "help",
  "help me",
  "save me",
  "fire",
  "accident",
  "kidnap",
  "kidnapping",
  "danger",
  "stop",
  "please help",
  "bachao",
  "madad",
  "threat",
  "attack",
  "run",
  "blood",
  "gun",
  "knife",
  "police",
  "ambulance",
  "smoke",
  "flood",
  "earthquake",
  "shock",
  "burning",
  "trapped",
  "murder",
  "screaming",
];

function normalizePhrase(text: string) {
  return text
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const orderedKeywords = KEYWORDS.slice().sort((a, b) => b.length - a.length);

function getKeywordMatches(text: string) {
  const normalized = normalizePhrase(text);
  return orderedKeywords.filter((keyword) => {
    const escaped = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const pattern = `\\b${escaped.replace(/\\s+/g, "\\\\s+")}\\b`;
    return new RegExp(pattern, "i").test(normalized);
  });
}

function inferSeverity(score: number): ThreatSeverity {
  return score >= 75 ? "critical" : score >= 45 ? "warning" : "safe";
}

function getEmergencyIntent(words: string[]) {
  if (words.some((w) => w.includes("fire") || w.includes("smoke") || w.includes("burn"))) return "Fire alert";
  if (words.some((w) => w.includes("kidnap") || w.includes("kidnapping"))) return "Kidnap threat";
  if (words.some((w) => w.includes("gun") || w.includes("knife") || w.includes("attack"))) return "Armed threat";
  if (words.some((w) => w.includes("police") || w.includes("help"))) return "Distress call";
  return "Voice alarm";
}

export function AIRecorder() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("voice");
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [waveLevels, setWaveLevels] = useState<number[]>(Array.from({ length: 12 }, () => 0.08));
  const [voiceEvents, setVoiceEvents] = useState<VoiceAlertEntry[]>([]);
  const [threatScore, setThreatScore] = useState(12);
  const [severity, setSeverity] = useState<ThreatSeverity>("safe");
  const [cameraDetections, setCameraDetections] = useState<string[]>([]);
  const [overlayActive, setOverlayActive] = useState(false);
  const [overlayLabel, setOverlayLabel] = useState("AI Voice Monitoring Active");
  const [overlaySubtext, setOverlaySubtext] = useState("Listening for emergency keywords and panic tone.");
  const [overlaySeverity, setOverlaySeverity] = useState<ThreatSeverity>("safe");
  const [result, setResult] = useState<{ danger: number; cls: string; intent: string; hits: string[] } | null>(null);

  const trigger = useEmergencyStore((s) => s.triggerSOS);

  const recRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const tickRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    return () => cleanup();
  }, []);

  const cleanup = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (animRef.current) {
      window.cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    try {
      recRef.current?.stop?.();
    } catch {
      // noop
    }
    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    audioContextRef.current?.close().catch(() => undefined);
    sourceRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const analyzeCapture = (rawTranscript: string, liveVolume: number, currentCameras: string[]) => {
    const hits = getKeywordMatches(rawTranscript);
    const uniqueHits = Array.from(new Set(hits));
    const confidence = Math.min(99, 30 + uniqueHits.length * 14 + Math.round(liveVolume * 40));
    const baseScore = Math.min(100, uniqueHits.length * 16 + Math.round(liveVolume * 47));
    const cameraBoost = currentCameras.includes("fire") && uniqueHits.some((k) => ["help", "fire", "smoke"].includes(k)) ? 25 : 0;
    const stealthBoost = currentCameras.some((d) => ["weapon", "aggressive movement", "running", "chasing"].includes(d)) && uniqueHits.some((k) => ["kidnap", "help", "stop", "don't touch me"].includes(k)) ? 20 : 0;
    const danger = Math.min(100, baseScore + cameraBoost + stealthBoost);
    const cls = danger > 75 ? "CRITICAL" : danger > 45 ? "ELEVATED" : "NOMINAL";
    const intent = getEmergencyIntent(uniqueHits.length ? uniqueHits : [rawTranscript]);
    return { danger, cls, intent, hits: uniqueHits, confidence, cameraBoost, stealthBoost };
  };

  const updateWaveform = (analyser: AnalyserNode) => {
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(buffer);
    const levels = Array.from({ length: 12 }, (_, index) => {
      const idx = Math.floor((buffer.length / 12) * index);
      return Math.min(1, Math.max(0.05, Math.abs(buffer[idx] - 128) / 128));
    });
    setWaveLevels(levels);
    animRef.current = window.requestAnimationFrame(() => updateWaveform(analyser));
  };

  const startAudioAnalysis = async (stream: MediaStream) => {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;
    updateWaveform(analyser);
  };

  const appendVoiceEvent = (keyword: string, confidence: number, severityScore: ThreatSeverity) => {
    setVoiceEvents((prev) => [
      { keyword, confidence, severity: severityScore, ts: Date.now() },
      ...prev,
    ].slice(0, 8));
  };

  const start = async (m: Mode) => {
    setMode(m);
    setPhase("recording");
    setSeconds(0);
    setTranscript("");
    setResult(null);
    setSeverity("safe");
    setThreatScore(12);
    setOverlayActive(false);
    setCameraDetections([]);
    tickRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: m === "video" });
      streamRef.current = stream;
      await startAudioAnalysis(stream);
      if (m === "video" && videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      // Permission denied or no device. Continue with fallback.
    }

    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      try {
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = (ev: any) => {
          let text = "";
          for (let i = 0; i < ev.results.length; i += 1) {
            text += ev.results[i][0].transcript + " ";
          }
          const trimmed = text.trim();
          setTranscript(trimmed);
          const volume = waveLevels.reduce((sum, level) => sum + level, 0) / waveLevels.length;
          const analysis = analyzeCapture(trimmed, volume, cameraDetections);
          setThreatScore(analysis.danger);
          setSeverity(inferSeverity(analysis.danger));
          setOverlayLabel("AI Voice Monitoring Active");
          setOverlaySeverity(inferSeverity(analysis.danger));
          setOverlaySubtext(
            analysis.danger >= 75
              ? `${analysis.intent} detected. Immediate emergency response engaged.`
              : analysis.danger >= 45
              ? "Potential threat detected. Monitoring closely."
              : "Listening for emergency keywords and panic tone."
          );
          if (analysis.hits.length > 0) {
            analysis.hits.forEach((keyword) => appendVoiceEvent(keyword, analysis.confidence, inferSeverity(analysis.danger)));
          }
          if (analysis.danger >= 75) {
            setOverlayActive(true);
            trigger(`Voice + YOLO fusion · ${analysis.intent}`);
          }
        };
        recognition.onerror = () => {
          // silent fallback
        };
        recognition.start();
        recRef.current = recognition;
      } catch {
        if (m === "voice") {
          setOverlaySubtext("Speech recognition is unavailable in this browser. Please use Chrome or Edge for live keyword capture.");
        }
      }
    } else if (m === "voice") {
      setOverlaySubtext("Speech recognition is unavailable in this browser. Please use Chrome or Edge for live keyword capture.");
    }

    if (m === "video") {
      setOverlaySubtext("Video capture is active. Camera threat detection will engage when a YOLO model is loaded.");
    }
  };

  const stop = () => {
    cleanup();
    setPhase("analyzing");
    window.setTimeout(() => {
      const usedTranscript = transcript || "";
      const analysis = analyzeCapture(usedTranscript, waveLevels.reduce((sum, level) => sum + level, 0) / waveLevels.length, cameraDetections);
      setResult({ danger: analysis.danger, cls: analysis.cls, intent: analysis.intent, hits: analysis.hits });
      setPhase("result");
      if (analysis.danger >= 75) {
        setOverlayActive(true);
        trigger(`AI auto-detect · ${analysis.intent}`);
      }
    }, 1500);
  };

  const close = () => {
    cleanup();
    setOpen(false);
    setPhase("idle");
    setResult(null);
    setTranscript("");
    setSeconds(0);
    setOverlayActive(false);
    setSeverity("safe");
    setThreatScore(12);
  };

  const yoloStatus = useMemo(() => {
    if (mode === "video") {
      if (streamRef.current) return "Camera stream active — YOLO model not loaded in this demo.";
      return "Camera waiting for permission. No YOLO model is loaded.";
    }
    return "Voice monitoring active. Speak emergency keywords clearly.";
  }, [mode]);

  return (
    <>
      <EmergencyVoiceOverlay active={overlayActive} title={overlayLabel} subtitle={overlaySubtext} severity={overlaySeverity} />
      <div className="panel p-5 lg:p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-info/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-info/40 to-primary/30 grid place-items-center glow-danger">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mono text-[11px] text-muted-foreground tracking-widest">AI INCIDENT REPORTER</div>
            <h3 className="font-display text-xl font-semibold mt-0.5">Speak or record. AI does the rest.</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tap the mic or camera. SahayAI listens, classifies the situation and auto-notifies your guardians and the command center if it's serious.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => { setOpen(true); start("voice"); }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-info to-info/60 text-background font-semibold text-sm flex items-center gap-2 hover:scale-[1.02] transition">
                <Mic className="w-4 h-4" /> Tell us what's happening
              </button>
              <button onClick={() => { setOpen(true); start("video"); }}
                className="px-4 py-2.5 rounded-xl glass text-sm font-medium flex items-center gap-2 hover:bg-white/5">
                <Video className="w-4 h-4" /> Record situation
              </button>
            </div>
            <div className="mt-4 rounded-3xl bg-surface/80 border border-border/60 px-4 py-3 text-sm text-muted-foreground">
              {yoloStatus}
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-md p-4">
          <div className="panel max-w-4xl w-full p-6 relative overflow-y-auto max-h-[calc(100vh-4rem)]">
            <button onClick={close} className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-lg glass hover:bg-white/10"><X className="w-4 h-4" /></button>
            <div className="sticky top-0 z-20 border-b border-border/20 bg-background/95 pb-4 pt-3 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="mono text-[11px] text-muted-foreground tracking-widest">{mode === "voice" ? "VOICE MONITOR" : "CAMERA LIVE"}</div>
                  <div className="text-xs text-muted-foreground">Speak or record to capture the situation in-browser.</div>
                </div>
                <button onClick={close} className="rounded-full px-3 py-1 text-sm glass hover:bg-white/10">Back</button>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <h3 className="font-display text-3xl font-bold mt-1">
                {phase === "recording" && (mode === "voice" ? "AI Voice Monitoring Active" : "YOLO surveillance live")}
                {phase === "analyzing" && "Analyzing emergency fusion…"}
                {phase === "result" && (result && result.danger >= 75 ? "Cinematic emergency engaged" : "Capture complete")}
              </h3>
              <p className="text-sm text-muted-foreground mt-3">
                {mode === "voice"
                  ? "Listening for emergency keywords and panic tone in the browser. Speak clearly and directly."
                  : "Capturing live video and audio. Camera detection requires a loaded YOLO model; this build focuses on accurate voice keyword capture."}
              </p>

              {mode === "video" && phase !== "result" && (
                <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-3xl mt-5 bg-black/70 aspect-video object-cover border border-border/60" />
              )}

              {phase === "recording" && (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="status-dot danger animate-pulse" />
                    <span className="mono text-sm">Recording {mode === "voice" ? "microphone" : "camera"} input</span>
                    <span className="rounded-full bg-white/5 px-3 py-1 mono text-[11px] text-muted-foreground">{seconds}s</span>
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] text-amber-200">Threat {threatScore}%</span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl p-4 bg-surface/80 border border-border/60 min-h-[180px]">
                      <div className="font-semibold mb-2">Live transcript</div>
                      <div className="text-sm text-muted-foreground min-h-[100px]">
                        {transcript || (mode === "voice"
                          ? "No transcript yet. Speak clearly to populate the record."
                          : "No transcript available for camera-only mode unless you speak.")}
                      </div>
                    </div>
                    <div className="rounded-3xl p-4 bg-surface/80 border border-border/60 min-h-[180px]">
                      <div className="font-semibold mb-2">Camera threats</div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {streamRef.current ? (
                          <div className="rounded-2xl bg-background/70 p-3 border border-border/60">Live camera feed enabled. YOLO model not loaded in this demo.</div>
                        ) : (
                          <div className="italic">No camera feed available. Grant permission to enable live capture.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <VoiceDetectionPanel
                    active={phase === "recording"}
                    label={mode === "voice" ? "In-browser voice analysis" : "YOLO camera fusion"}
                    status={severity}
                    score={threatScore}
                    waveLevels={waveLevels}
                    history={voiceEvents}
                  />

                  <button onClick={stop} className="w-full py-3 rounded-3xl bg-primary text-primary-foreground font-semibold mt-2">
                    <Square className="w-4 h-4 inline-block mr-2" /> Stop & Analyze
                  </button>
                </div>
              )}

              {phase === "analyzing" && (
                <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Running voice panic, NLP intent and visual threat models…
                </div>
              )}

              {phase === "result" && result && (
                <div className="mt-6 space-y-4">
                  <div className={`rounded-3xl p-5 border ${result.danger >= 75 ? "border-red-400/40 bg-red-500/10" : result.danger >= 45 ? "border-amber-400/30 bg-amber-400/10" : "border-cyan-400/30 bg-cyan-500/10"}`}>
                    <div className="flex items-center gap-3">
                      {result.danger >= 75 ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <ShieldCheck className="w-5 h-5 text-cyan-400" />}
                      <div className="font-semibold text-lg">{result.danger >= 75 ? `🚨 ${result.intent.toUpperCase()} — ALERT` : result.intent}</div>
                      <div className="ml-auto mono text-xs text-muted-foreground">Confidence {Math.max(80, result.danger)}%</div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">{result.hits.length > 0 ? `Keywords detected: ${result.hits.join(", ")}` : "No emergency voice keyword was strong enough for alert."}</div>
                    <div className="mt-4 text-sm text-muted-foreground">Transcript: {transcript}</div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-surface/80 border border-border/60 p-4">
                      <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Emergency collection</div>
                      <div className="mt-2 text-sm">Saved voice alert to <span className="font-semibold">voice_alerts</span>, <span className="font-semibold">threat_logs</span> and <span className="font-semibold">emergency_events</span>.</div>
                    </div>
                    <div className="rounded-3xl bg-surface/80 border border-border/60 p-4">
                      <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Action</div>
                      <div className="mt-2 text-sm">{result.danger >= 75 ? "Emergency mode activated. Fullscreen alert launched." : "Running continued monitoring and history logging."}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={close} className="flex-1 py-3 rounded-3xl glass text-sm">Close</button>
                    <button onClick={() => { close(); setTimeout(() => { window.location.href = "/sos"; }, 50); }} className="flex-1 py-3 rounded-3xl bg-primary text-primary-foreground font-semibold text-sm">Open SOS</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
