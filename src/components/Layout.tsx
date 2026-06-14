import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Activity, AlertTriangle, BarChart3, Bot, History, Map as MapIcon, Settings, Shield, User, Zap, Bell, Building2 } from "lucide-react";
import { useEffect } from "react";
import { useEmergencyStore } from "@/store/emergency";
import { languageCodes, languageOptions, translateTextNode, useLanguageStore, t } from "@/store/language";

const nav = [
  { to: "/dashboard", label: "Overview", icon: Activity },
  { to: "/sos", label: "SOS", icon: AlertTriangle },
  { to: "/tracking", label: "Tracking", icon: MapIcon },
  { to: "/ai-assistant", label: "Insights", icon: Bot },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/history", label: "History", icon: History },
  { to: "/authority-dashboard", label: "Command", icon: Building2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Layout({ children }: { children?: React.ReactNode }) {
  const loc = useLocation();
  const { status, tick, safetyScore } = useEmergencyStore();
  const { language } = useLanguageStore();

  useEffect(() => {
    const id = setInterval(() => tick(), 1500);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    document.documentElement.lang = languageCodes[language];
    const translate = () => {
      const root = document.querySelector("[data-sahayai-shell]");
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent || parent.closest("script,style,textarea,input,select,[data-no-translate]")) return NodeFilter.FILTER_REJECT;
          return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      nodes.forEach((node) => { node.textContent = translateTextNode(node.textContent || "", language); });
    };
    requestAnimationFrame(translate);
    const observer = new MutationObserver(() => requestAnimationFrame(translate));
    const shell = document.querySelector("[data-sahayai-shell]");
    if (shell) observer.observe(shell, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  const statusLabel = status === "safe" ? t("SECURE", language) : status === "alert" ? t("ALERT", language) : t("EMERGENCY", language);

  return (
    <div data-sahayai-shell className="app-bg min-h-screen text-foreground relative">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/40 backdrop-blur-xl">
        <div className="flex items-center gap-4 px-4 lg:px-6 h-16">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/40 grid place-items-center glow-danger">
                <Shield className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="absolute inset-0 rounded-xl border border-primary/40 animate-pulse-ring" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-base tracking-tight">SahayAI <span className="text-primary">Pro</span></div>
              <div className="mono text-[10px] text-muted-foreground -mt-0.5">PREMIUM DASHBOARD · v2.0</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full glass">
            <span className={`status-dot ${status === "safe" ? "safe" : status === "alert" ? "warn" : "danger"}`} />
            <span className="mono text-xs tracking-wider">{statusLabel}</span>
            <span className="text-muted-foreground">·</span>
            <span className="mono text-xs text-muted-foreground">{t("INTEGRITY", language)} {safetyScore}/100</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass mono text-xs">
              <Zap className="w-3 h-3 text-primary" />
              <span>{t("REAL-TIME ANALYTICS", language)}</span>
            </div>
            <select
              value={language}
              onChange={(e) => useLanguageStore.getState().setLanguage(e.target.value as any)}
              className="hidden sm:block px-2.5 py-1.5 rounded-full glass mono text-xs bg-background/40 border border-border/60 focus:outline-none"
              aria-label="Language"
            >
              {languageOptions.map((l) => (
                <option key={l} value={l} className="bg-background">{l}</option>
              ))}
            </select>
            <button className="w-9 h-9 grid place-items-center rounded-xl glass hover:bg-white/5">
              <Bell className="w-4 h-4" />
              <span className="absolute mt-[-14px] ml-[14px] w-2 h-2 rounded-full bg-primary glow-danger" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-info/40 to-safe/30 grid place-items-center mono text-xs font-bold">RJ</div>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <div className="hidden lg:flex items-center gap-2 px-4 lg:px-6 py-3 border-b border-border/60 bg-background/40 backdrop-blur-xl overflow-x-auto">
          {nav.map((n) => {
            const active = loc.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(n.label, language)}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-40 glass-strong rounded-2xl px-2 py-2 flex items-center justify-between">
        {[
          { to: "/dashboard", label: "Home", icon: Activity },
          { to: "/tracking", label: "Map", icon: MapIcon },
          { to: "/sos", label: "SOS", icon: AlertTriangle, primary: true },
          { to: "/ai-assistant", label: "Insight", icon: Bot },
          { to: "/profile", label: "Me", icon: User },
        ].map((n) => {
          const active = loc.pathname === n.to;
          const Icon = n.icon;
          if (n.primary) return (
            <Link key={n.to} to={n.to} className="-mt-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center glow-danger relative">
                <span className="absolute inset-0 rounded-full border border-primary/50 animate-pulse-ring" />
                <Icon className="w-7 h-7 text-primary-foreground" />
              </div>
            </Link>
          );
          return (
            <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl ${active ? "text-foreground" : "text-muted-foreground"}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mono">{t(n.label, language)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
