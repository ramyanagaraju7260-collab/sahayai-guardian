import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, ArrowRight, Camera, Mic, MapPin, Bell } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome · SahayAI X" }] }),
  component: Onboarding,
});

function Onboarding() {
  return (
    <div className="app-bg min-h-screen relative grid place-items-center px-4 py-10">
      <div className="max-w-2xl w-full relative z-10 text-center">
        <div className="inline-flex relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/40 grid place-items-center glow-danger">
          <Shield className="w-10 h-10 text-primary-foreground" strokeWidth={2.5} />
          <span className="absolute inset-0 rounded-3xl border border-primary/40 animate-pulse-ring" />
          <span className="absolute inset-0 rounded-3xl border border-primary/30 animate-pulse-ring" style={{ animationDelay: "0.7s" }} />
        </div>
        <div className="mono text-[11px] text-muted-foreground tracking-widest mt-6">AUTONOMOUS EMERGENCY INTELLIGENCE</div>
        <h1 className="font-display text-5xl lg:text-6xl font-extrabold mt-2 text-gradient">SahayAI <span className="text-danger-gradient">X</span></h1>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">An AI guardian that detects, predicts, and responds to emergencies before you can even ask for help.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
          {[
            { i: MapPin, l: "Location" }, { i: Mic, l: "Microphone" }, { i: Camera, l: "Camera" }, { i: Bell, l: "Notifications" },
          ].map((p) => (
            <div key={p.l} className="panel p-4 text-left">
              <p.i className="w-4 h-4 text-safe" />
              <div className="text-sm mt-2">{p.l}</div>
              <div className="mono text-[10px] text-safe mt-0.5">GRANTED</div>
            </div>
          ))}
        </div>

        <Link to="/dashboard" className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/70 text-primary-foreground font-semibold glow-danger">
          Enter Command Center <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
