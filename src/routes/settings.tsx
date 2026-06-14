import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Sliders, Languages, Plus } from "lucide-react";
import { languageOptions, useLanguageStore, t, type Language } from "@/store/language";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · SahayAI Pro" }] }),
  component: Settings,
});

function Slider({ label, defaultValue }: { label: string; defaultValue: number }) {
  const [v, setV] = useState(defaultValue);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="mono text-xs text-primary">{v}</span>
      </div>
      <input type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)}
        className="w-full mt-2 accent-[oklch(0.66_0.24_25)]" />
    </div>
  );
}

function Toggle({ label, defaultOn, desc }: { label: string; defaultOn?: boolean; desc?: string }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <button onClick={() => setOn(!on)} className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 text-left">
      <div className="flex-1">
        <div className="text-sm">{label}</div>
        {desc && <div className="mono text-[10px] text-muted-foreground">{desc}</div>}
      </div>
      <div className={`w-10 h-6 rounded-full transition relative ${on ? "bg-primary glow-danger" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </div>
    </button>
  );
}

function Settings() {
  const { language, setLanguage } = useLanguageStore();
  const [contacts, setContacts] = useState([
    { name: "Priya Joshi", relation: "Mother", phone: "+91 98765 43210" },
    { name: "Arvind Joshi", relation: "Father", phone: "+91 91234 56789" },
    { name: "Neha Verma", relation: "Friend", phone: "+91 99876 54321" },
  ]);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const addContact = () => {
    if (!newName.trim() || !newRelation.trim() || !newPhone.trim()) return;
    setContacts((prev) => [...prev, { name: newName.trim(), relation: newRelation.trim(), phone: newPhone.trim() }]);
    setNewName("");
    setNewRelation("");
    setNewPhone("");
  };

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-5">
        <div>
          <div className="mono text-[11px] text-muted-foreground tracking-widest"><Sliders className="w-3 h-3 inline mr-1" /> SYSTEM CONFIGURATION</div>
          <h1 className="font-display text-3xl font-bold text-gradient">{t("System Settings", language)}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel p-5 space-y-4">
            <h3 className="font-display text-base font-semibold">AI Sensitivity</h3>
            <Slider label="Accident Detection" defaultValue={75} />
            <Slider label="Fall Detection Threshold" defaultValue={80} />
            <Slider label="Voice Panic Detection" defaultValue={70} />
            <Slider label="False Alarm Tolerance" defaultValue={60} />
            <div>
              <div className="text-sm mb-2">Auto-SOS Countdown</div>
              <div className="flex gap-2">
                {["5s", "10s", "15s", "30s"].map((c, i) => (
                  <button key={c} className={`flex-1 py-2 rounded-lg mono text-xs ${i === 1 ? "bg-primary text-primary-foreground" : "glass"}`}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="panel p-5 space-y-2">
            <h3 className="font-display text-base font-semibold mb-2">Modes</h3>
            <Toggle label="Background AI Monitoring" defaultOn desc="Always-on sensor fusion" />
            <Toggle label="Auto-SOS" defaultOn desc="Auto-trigger on critical events" />
            <Toggle label="Silent SOS Mode" desc="No sound · stealth alert" />
            <Toggle label="Women Safety Shield" defaultOn desc="Stealth + auto-record + guardian" />
            <Toggle label="Elderly Guardian Mode" desc="Fall + heart anomaly priority" />
            <Toggle label="Child Safety Mode" desc="Geo-fence + stranger alert" />
            <Toggle label="Offline SMS Fallback" defaultOn desc="Mesh + SMS when no internet" />
            <Toggle label="Evidence Auto-Recording" desc="Camera + mic on critical SOS" />
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="font-display text-base font-semibold mb-3"><Languages className="w-4 h-4 inline mr-1.5" /> {t("Preferred Language", language)}</h3>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l as Language)}
                className={`px-4 py-2 rounded-xl text-sm ${language === l ? "bg-primary text-primary-foreground" : "glass hover:bg-white/5"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="mono text-[10px] text-muted-foreground mt-3">{t("Selected language", language)}: {language}</div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display text-base font-semibold">{t("Emergency Contacts", language)}</h3>
              <div className="mono text-[10px] text-muted-foreground">{t("Add trusted contacts for quick SOS alerts.", language)}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mb-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full mt-2 rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary/50" placeholder="Contact name" />
              </div>
              <div>
                <label className="text-sm font-medium">Relation</label>
                <input value={newRelation} onChange={(e) => setNewRelation(e.target.value)} className="w-full mt-2 rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary/50" placeholder="Relation (e.g. Mother)" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full mt-2 rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary/50" placeholder="+91 98765 43210" />
              </div>
              <button type="button" onClick={addContact} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Add Contact</button>
            </div>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={`${contact.name}-${contact.phone}`} className="p-3 rounded-xl glass text-sm">
                  <div className="font-medium">{contact.name}</div>
                  <div className="mono text-[10px] text-muted-foreground">{contact.relation} · {contact.phone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
