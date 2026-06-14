import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Heart, Phone, Stethoscope, Pill, AlertCircle, QrCode, ShieldCheck, Edit2, Save, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Medical ID · SahayAI Pro" }] }),
  component: Profile,
});

interface MedicalData {
  name: string;
  age: string;
  gender: string;
  city: string;
  bloodType: string;
  organDonor: boolean;
  allergies: string;
  chronic: string;
  medications: string;
  doctor: string;
  doctorPhone: string;
  emergencyContacts: Array<{ name: string; relation: string; phone: string; priority: number }>;
  healthInsurance: string;
  accidentCover: string;
  travelInsurance: string;
}

function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [medicalData, setMedicalData] = useState<MedicalData>({
    name: "Rohan Joshi",
    age: "28",
    gender: "Male",
    city: "Bengaluru",
    bloodType: "B+",
    organDonor: true,
    allergies: "Penicillin, Peanuts",
    chronic: "Mild Asthma",
    medications: "Salbutamol inhaler",
    doctor: "Dr. Mehta",
    doctorPhone: "+91 98765 43213",
    emergencyContacts: [
      { name: "Priya Joshi", relation: "Mother", phone: "+91 98765 43210", priority: 1 },
      { name: "Arvind Joshi", relation: "Father", phone: "+91 98765 43211", priority: 2 },
      { name: "Neha Verma", relation: "Best Friend", phone: "+91 98765 43212", priority: 3 },
      { name: "Dr. R. Mehta", relation: "Primary Care", phone: "+91 98765 43213", priority: 4 },
    ],
    healthInsurance: "Star Health · #SH-44321",
    accidentCover: "ICICI Lombard · ₹20L",
    travelInsurance: "Bajaj Allianz · Active",
  });

  const [tempData, setTempData] = useState<MedicalData>(medicalData);
  const [newContact, setNewContact] = useState({ name: "", relation: "", phone: "" });
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("medicalData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setMedicalData(parsed);
      setTempData(parsed);
    }
  }, []);

  const handleSave = () => {
    setMedicalData(tempData);
    localStorage.setItem("medicalData", JSON.stringify(tempData));
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempData(medicalData);
    setEditMode(false);
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const updated = {
        ...tempData,
        emergencyContacts: [
          ...tempData.emergencyContacts,
          { ...newContact, priority: tempData.emergencyContacts.length + 1 },
        ],
      };
      setTempData(updated);
      setNewContact({ name: "", relation: "", phone: "" });
    }
  };

  const handleRemoveContact = (index: number) => {
    const updated = {
      ...tempData,
      emergencyContacts: tempData.emergencyContacts.filter((_, i) => i !== index),
    };
    setTempData(updated);
  };

  const initials = medicalData.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("");

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="mono text-[11px] text-muted-foreground tracking-widest">
              <ShieldCheck className="w-3 h-3 inline mr-1 text-safe" /> EMERGENCY MEDICAL IDENTITY
            </div>
            <h1 className="font-display text-3xl font-bold text-gradient">Medical ID</h1>
          </div>
          <button
            onClick={() => {
              setEditMode(!editMode);
              setTempData(medicalData);
            }}
            className="px-4 py-2 rounded-xl glass flex items-center gap-2 hover:bg-white/10 transition"
          >
            {editMode ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Main card */}
        <div className="panel p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          {editMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Name</label>
                  <input
                    type="text"
                    value={tempData.name}
                    onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  />
                </div>
                <div>
                  <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Blood Type</label>
                  <input
                    type="text"
                    value={tempData.bloodType}
                    onChange={(e) => setTempData({ ...tempData, bloodType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Age</label>
                  <input
                    type="number"
                    value={tempData.age}
                    onChange={(e) => setTempData({ ...tempData, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  />
                </div>
                <div>
                  <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Gender</label>
                  <select
                    value={tempData.gender}
                    onChange={(e) => setTempData({ ...tempData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">City</label>
                  <input
                    type="text"
                    value={tempData.city}
                    onChange={(e) => setTempData({ ...tempData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempData.organDonor}
                    onChange={(e) => setTempData({ ...tempData, organDonor: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Organ Donor</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Allergies</label>
                  <input
                    type="text"
                    value={tempData.allergies}
                    onChange={(e) => setTempData({ ...tempData, allergies: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  />
                </div>
                <div>
                  <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Chronic Conditions</label>
                  <input
                    type="text"
                    value={tempData.chronic}
                    onChange={(e) => setTempData({ ...tempData, chronic: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Current Medications</label>
                  <input
                    type="text"
                    value={tempData.medications}
                    onChange={(e) => setTempData({ ...tempData, medications: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  />
                </div>
                <div>
                  <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Primary Doctor</label>
                  <input
                    type="text"
                    value={tempData.doctor}
                    onChange={(e) => setTempData({ ...tempData, doctor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Doctor Phone</label>
                <input
                  type="text"
                  value={tempData.doctorPhone}
                  onChange={(e) => setTempData({ ...tempData, doctorPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/40 to-info/30 grid place-items-center font-display text-3xl font-bold">
                  {initials}
                </div>
                <div>
                  <div className="mono text-[10px] text-muted-foreground tracking-widest">VERIFIED · SAHAYAI ID #00471</div>
                  <h2 className="font-display text-2xl font-bold mt-1">{medicalData.name}</h2>
                  <div className="text-sm text-muted-foreground">
                    Age {medicalData.age} · {medicalData.gender} · {medicalData.city}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/30 mono text-xs font-bold text-primary">
                      {medicalData.bloodType}
                    </span>
                    {medicalData.organDonor && (
                      <span className="px-3 py-1 rounded-full glass mono text-[11px]">Organ donor ✓</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                {[
                  { icon: AlertCircle, label: "ALLERGIES", val: medicalData.allergies, color: "oklch(0.78 0.17 65)" },
                  { icon: Heart, label: "CHRONIC", val: medicalData.chronic, color: "oklch(0.66 0.24 25)" },
                  { icon: Pill, label: "MEDICATIONS", val: medicalData.medications, color: "oklch(0.78 0.16 175)" },
                  {
                    icon: Stethoscope,
                    label: "PRIMARY DOCTOR",
                    val: `${medicalData.doctor} · ${medicalData.doctorPhone}`,
                    color: "oklch(0.70 0.18 250)",
                  },
                ].map((c, i) => (
                  <div key={i} className="glass p-3 rounded-xl">
                    <div className="flex items-center gap-2 mono text-[10px] text-muted-foreground tracking-widest">
                      <c.icon className="w-3 h-3" style={{ color: c.color }} /> {c.label}
                    </div>
                    <div className="text-sm mt-1">{c.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 panel p-5">
            <h3 className="font-display text-base font-semibold">Emergency Contacts</h3>
            <p className="mono text-[10px] text-muted-foreground mb-4">PRIORITY ORDER · AUTO-NOTIFIED ON SOS</p>

            {editMode ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {tempData.emergencyContacts.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 rounded-xl glass">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={c.name}
                          placeholder="Name"
                          onChange={(e) => {
                            const updated = [...tempData.emergencyContacts];
                            updated[idx].name = e.target.value;
                            setTempData({ ...tempData, emergencyContacts: updated });
                          }}
                          className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-sm mb-1"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={c.relation}
                            placeholder="Relation"
                            onChange={(e) => {
                              const updated = [...tempData.emergencyContacts];
                              updated[idx].relation = e.target.value;
                              setTempData({ ...tempData, emergencyContacts: updated });
                            }}
                            className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-xs"
                          />
                          <input
                            type="text"
                            value={c.phone}
                            placeholder="Phone"
                            onChange={(e) => {
                              const updated = [...tempData.emergencyContacts];
                              updated[idx].phone = e.target.value;
                              setTempData({ ...tempData, emergencyContacts: updated });
                            }}
                            className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-xs"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveContact(idx)}
                        className="p-2 rounded-lg hover:bg-danger/20 transition"
                      >
                        <Trash2 className="w-4 h-4 text-danger" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-3">
                  <p className="text-xs text-muted-foreground mb-2">Add New Contact</p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Relation"
                        value={newContact.relation}
                        onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                      />
                    </div>
                    <button
                      onClick={handleAddContact}
                      className="w-full py-2 rounded-lg bg-primary/20 text-primary text-sm hover:bg-primary/30 transition"
                    >
                      + Add Contact
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {medicalData.emergencyContacts.map((c) => (
                  <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl glass">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/40 to-info/30 grid place-items-center font-bold text-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="mono text-[11px] text-muted-foreground">
                        {c.relation} · {c.phone}
                      </div>
                    </div>
                    <div className="mono text-[10px] px-2 py-1 rounded-md bg-white/5">P{c.priority}</div>
                    <button className="w-9 h-9 rounded-xl bg-safe/15 grid place-items-center">
                      <Phone className="w-4 h-4 text-safe" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel p-5 flex flex-col items-center text-center">
            <div className="mono text-[10px] text-primary tracking-widest font-bold flex items-center gap-1.5">
              <span className="status-dot danger" /> EMERGENCY MEDICAL DATA
            </div>
            <div className="mt-4 p-4 rounded-2xl bg-white border-2 border-primary glow-danger">
              {/* fake QR */}
              <div className="w-40 h-40 grid grid-cols-12 gap-px">
                {Array.from({ length: 144 }).map((_, i) => (
                  <span key={i} style={{ background: Math.random() > 0.45 ? "#000" : "#fff" }} />
                ))}
              </div>
            </div>
            <div className="text-xs mt-3 text-muted-foreground">Scan for instant medical access</div>
            <div className="mono text-[10px] text-safe mt-1">OFFLINE · ENCRYPTED · SHARABLE</div>
            <button className="mt-3 px-4 py-2 rounded-xl glass text-xs flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" /> Save to wallet
            </button>
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="font-display text-base font-semibold">Insurance & Policies</h3>
          {editMode ? (
            <div className="grid grid-cols-1 gap-3 mt-3">
              <div>
                <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Health Insurance</label>
                <input
                  type="text"
                  value={tempData.healthInsurance}
                  onChange={(e) => setTempData({ ...tempData, healthInsurance: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Accident Cover</label>
                <input
                  type="text"
                  value={tempData.accidentCover}
                  onChange={(e) => setTempData({ ...tempData, accidentCover: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                />
              </div>
              <div>
                <label className="mono text-[10px] text-muted-foreground tracking-widest block mb-2">Travel Insurance</label>
                <input
                  type="text"
                  value={tempData.travelInsurance}
                  onChange={(e) => setTempData({ ...tempData, travelInsurance: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              {[
                { k: "HEALTH INSURANCE", v: medicalData.healthInsurance },
                { k: "ACCIDENT COVER", v: medicalData.accidentCover },
                { k: "TRAVEL INSURANCE", v: medicalData.travelInsurance },
              ].map((p) => (
                <div key={p.k} className="glass p-3 rounded-xl">
                  <div className="mono text-[10px] text-muted-foreground tracking-widest">{p.k}</div>
                  <div className="text-sm mt-1">{p.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
