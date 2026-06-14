import { create } from "zustand";

export type Status = "safe" | "alert" | "emergency";

export type SensorReading = {
  accel: number;
  gyro: number;
  bpm: number;
  voice: number;
  gps: { lat: number; lng: number };
  cv: number;
  history: { accel: number[]; bpm: number[]; voice: number[] };
};

export type Incident = {
  id: string;
  type: string;
  location: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "ACTIVE" | "RESPONDING" | "RESOLVED";
  ts: number;
};

type State = {
  status: Status;
  safetyScore: number;
  emergencyProb: number;
  sensors: SensorReading;
  incidents: Incident[];
  demoMode: boolean;
  triggerSOS: (type?: string) => void;
  clearSOS: () => void;
  setDemo: (v: boolean) => void;
  pushIncident: (i: Incident) => void;
  tick: () => void;
};

const seedHistory = (n: number, base: number, jitter: number) =>
  Array.from({ length: n }, () => base + (Math.random() - 0.5) * jitter);

export const useEmergencyStore = create<State>((set, get) => ({
  status: "safe",
  safetyScore: 94,
  emergencyProb: 8,
  sensors: {
    accel: 1.0,
    gyro: 2.4,
    bpm: 76,
    voice: 28,
    gps: { lat: 12.9352, lng: 77.6245 },
    cv: 99,
    history: {
      accel: seedHistory(20, 1, 0.4),
      bpm: seedHistory(20, 76, 6),
      voice: seedHistory(20, 28, 14),
    },
  },
  incidents: [
    { id: "1", type: "Accident detected", location: "Koramangala, Bengaluru", severity: "CRITICAL", status: "ACTIVE", ts: Date.now() - 120000 },
    { id: "2", type: "Fall detected", location: "HSR Layout", severity: "HIGH", status: "RESOLVED", ts: Date.now() - 300000 },
    { id: "3", type: "Fire alert", location: "Whitefield", severity: "CRITICAL", status: "RESPONDING", ts: Date.now() - 480000 },
    { id: "4", type: "Voice panic", location: "Indiranagar", severity: "HIGH", status: "RESPONDING", ts: Date.now() - 720000 },
  ],
  demoMode: false,
  triggerSOS: (type = "Manual SOS") => {
    set({ status: "emergency", emergencyProb: 96, safetyScore: 22 });
    get().pushIncident({
      id: crypto.randomUUID(),
      type,
      location: "Live location",
      severity: "CRITICAL",
      status: "ACTIVE",
      ts: Date.now(),
    });
  },
  clearSOS: () => set({ status: "safe", emergencyProb: 8, safetyScore: 94 }),
  setDemo: (v) => set({ demoMode: v }),
  pushIncident: (i) => set((s) => ({ incidents: [i, ...s.incidents].slice(0, 30) })),
  tick: () => {
    const s = get().sensors;
    const status = get().status;
    const drift = (Math.random() - 0.5) * 0.3;
    const accel = Math.max(0.4, Math.min(status === "emergency" ? 9 : 1.6, s.accel + drift));
    const bpm = Math.max(50, Math.min(status === "emergency" ? 160 : 95, s.bpm + (Math.random() - 0.5) * 4));
    const voice = Math.max(10, Math.min(status === "emergency" ? 95 : 55, s.voice + (Math.random() - 0.5) * 12));
    const gyro = Math.max(0, Math.min(45, s.gyro + (Math.random() - 0.5) * 3));
    const gps = {
      lat: s.gps.lat + (Math.random() - 0.5) * 0.0002,
      lng: s.gps.lng + (Math.random() - 0.5) * 0.0002,
    };
    const prob = Math.round(
      Math.max(0, Math.min(100,
        (accel / 9) * 35 + ((bpm - 60) / 100) * 25 + (voice / 100) * 25 + (status === "emergency" ? 30 : 0)
      ))
    );
    const score = Math.max(0, Math.min(100, 100 - prob + (status === "safe" ? 4 : 0)));
    set({
      sensors: {
        ...s, accel, bpm, voice, gyro, gps, cv: 95 + Math.random() * 5,
        history: {
          accel: [...s.history.accel.slice(-19), accel],
          bpm: [...s.history.bpm.slice(-19), bpm],
          voice: [...s.history.voice.slice(-19), voice],
        },
      },
      emergencyProb: prob,
      safetyScore: status === "emergency" ? Math.min(40, score) : score,
    });
  },
}));
