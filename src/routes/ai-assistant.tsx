import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Mic, Phone, AlertCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({ meta: [{ title: "AI Guardian · SahayAI X" }] }),
  component: AIAssistant,
});

type Msg = { role: "user" | "ai"; content: string; severity?: "info" | "warn" | "critical" };

const quickPrompts = [
  "I had an accident",
  "Someone collapsed near me",
  "There is fire nearby",
  "I feel unsafe",
  "How to do CPR?",
  "Heart attack signs?",
];

const aiResponses: Record<string, { text: string; severity: "info" | "warn" | "critical"; steps?: string[] }> = {
  accident: {
    severity: "critical",
    text: "Stay calm. I am with you. Do not move if you feel pain in your neck or back.",
    steps: ["Check yourself for bleeding", "Stay where you are if mobile", "I have shared your live GPS with paramedics", "Ambulance ETA: 4 minutes"],
  },
  collapse: {
    severity: "critical",
    text: "Check if the person is breathing. If not, begin CPR immediately.",
    steps: ["Tap shoulder, shout to check response", "Place heel of hand on center of chest", "Push hard and fast — 100-120/min", "Don't stop until help arrives"],
  },
  fire: {
    severity: "critical",
    text: "Get out NOW. Do not collect belongings. Stay low under smoke.",
    steps: ["Cover nose with cloth — wet if possible", "Crawl to nearest exit", "Close doors behind you", "Once safe, do not re-enter"],
  },
  unsafe: {
    severity: "warn",
    text: "I'm activating Stealth Guardian. Live location shared with your trusted contacts. Recording started silently.",
    steps: ["Walk towards a populated area", "Keep me on screen — I will alert at any anomaly", "Press volume button 3x for instant SOS"],
  },
  cpr: {
    severity: "info",
    text: "CPR for adults — keep this rhythm: push hard, push fast.",
    steps: ["30 chest compressions (rate 100-120/min, depth 5cm)", "2 rescue breaths (head tilted back)", "Repeat 30:2 cycle", "Continue until trained help arrives"],
  },
  heart: {
    severity: "warn",
    text: "Recognize a heart attack — every second matters.",
    steps: ["Chest pressure / squeezing pain", "Pain radiating to arm, jaw, back", "Shortness of breath, cold sweat", "Nausea or lightheadedness"],
  },
  default: {
    severity: "info",
    text: "I'm SahayAI, your emergency guardian. Tell me what's happening — I'll guide you step by step. Help is on the way. Stay with me.",
  },
};

function classify(input: string): keyof typeof aiResponses {
  const i = input.toLowerCase();
  if (i.includes("accident") || i.includes("crash")) return "accident";
  if (i.includes("collapse") || i.includes("unconscious") || i.includes("breathing")) return "collapse";
  if (i.includes("fire") || i.includes("smoke")) return "fire";
  if (i.includes("unsafe") || i.includes("follow") || i.includes("scared")) return "unsafe";
  if (i.includes("cpr")) return "cpr";
  if (i.includes("heart")) return "heart";
  return "default";
}

function AIAssistant() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", content: aiResponses.default.text, severity: "info" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [streamed, setStreamed] = useState<{ text: string; full: string; steps?: string[]; severity?: any } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamed]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    const key = classify(text);
    const r = aiResponses[key];
    const full = r.text + (r.steps ? "\n\n" + r.steps.map((s, i) => `${i + 1}. ${s}`).join("\n") : "") + "\n\nHelp is on the way. Stay with me.";

    setTimeout(() => {
      setTyping(false);
      let i = 0;
      setStreamed({ text: "", full, steps: r.steps, severity: r.severity });
      const id = setInterval(() => {
        i += 3;
        if (i >= full.length) {
          clearInterval(id);
          setMessages((m) => [...m, { role: "ai", content: full, severity: r.severity }]);
          setStreamed(null);
        } else {
          setStreamed((s) => s ? { ...s, text: full.slice(0, i) } : null);
        }
      }, 18);
    }, 700);
  };

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/60 to-info/40 grid place-items-center glow-danger">
            <Bot className="w-6 h-6 text-primary-foreground" />
            <span className="absolute inset-0 rounded-2xl border border-primary/40 animate-pulse-ring" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">SahayAI Guardian</h1>
            <div className="mono text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="status-dot safe" /> ONLINE · MULTILINGUAL · CONTEXT-AWARE
            </div>
          </div>
          <button className="px-3 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-semibold flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Call 112
          </button>
        </div>

        <div className="flex-1 panel p-4 overflow-y-auto space-y-4">
          {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
          {streamed && (
            <div className="flex gap-3">
              <AvatarAI />
              <div className="max-w-[80%] glass p-3.5 rounded-2xl rounded-tl-sm">
                <pre className="font-sans text-sm whitespace-pre-wrap leading-relaxed">{streamed.text}<span className="inline-block w-1.5 h-4 bg-primary ml-0.5 align-middle animate-pulse" /></pre>
              </div>
            </div>
          )}
          {typing && (
            <div className="flex gap-3">
              <AvatarAI />
              <div className="glass p-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1">
                {[0, 0.2, 0.4].map((d, i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-foreground/60" style={{ animation: "typing 1.4s ease-in-out infinite", animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {quickPrompts.map((q) => (
            <button key={q} onClick={() => send(q)} className="shrink-0 px-3 py-1.5 rounded-full glass text-xs hover:bg-white/10 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-safe" /> {q}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 panel p-2 flex items-center gap-2">
          <button type="button" className="w-10 h-10 rounded-xl glass grid place-items-center hover:bg-white/10">
            <Mic className="w-4 h-4" />
          </button>
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your emergency…"
            className="flex-1 bg-transparent outline-none px-2 text-sm placeholder:text-muted-foreground"
          />
          <button type="submit" className="w-10 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center glow-danger">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </Layout>
  );
}

function AvatarAI() {
  return (
    <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-primary/60 to-info/30 grid place-items-center">
      <Bot className="w-4 h-4 text-primary-foreground" />
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-info/20 border border-info/30 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm">{msg.content}</div>
      </div>
    );
  }
  const sevColor = msg.severity === "critical" ? "border-primary/40 bg-primary/5" : msg.severity === "warn" ? "border-warn/40 bg-warn/5" : "border-border";
  return (
    <div className="flex gap-3">
      <AvatarAI />
      <div className={`max-w-[80%] glass border ${sevColor} p-3.5 rounded-2xl rounded-tl-sm`}>
        {msg.severity === "critical" && (
          <div className="flex items-center gap-1.5 mono text-[10px] text-primary mb-2 tracking-widest">
            <AlertCircle className="w-3 h-3" /> CRITICAL GUIDANCE
          </div>
        )}
        <pre className="font-sans text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</pre>
      </div>
    </div>
  );
}
