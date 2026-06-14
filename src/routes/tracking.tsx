import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useEmergencyStore } from "@/store/emergency";
import { MapContainer, TileLayer, Marker, Circle, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Navigation, Hospital, Shield, Flame, Share2, Route as RouteIcon, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/tracking")({
  head: () => ({ meta: [{ title: "Live Tracking · SahayAI Pro" }] }),
  component: Tracking,
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:24px;height:24px;">
    <span style="position:absolute;inset:0;border-radius:50%;background:oklch(0.66 0.24 25);box-shadow:0 0 20px oklch(0.66 0.24 25);"></span>
    <span style="position:absolute;inset:-10px;border-radius:50%;border:2px solid oklch(0.66 0.24 25);animation:pulse-ring 2s infinite;"></span>
  </div>`,
  iconSize: [24, 24],
});

const poiIcon = (color: string, letter: string) => L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;border-radius:8px;background:${color};display:grid;place-items:center;color:white;font-weight:700;font-family:JetBrains Mono;font-size:12px;box-shadow:0 4px 12px ${color}80;border:2px solid oklch(1 0 0 / 0.2);">${letter}</div>`,
  iconSize: [30, 30],
});

function Recenter({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(pos, map.getZoom()); }, [pos, map]);
  return null;
}

function Tracking() {
  const { status } = useEmergencyStore();
  const center: [number, number] = [13.2979166, 77.5220675];
  const [trail, setTrail] = useState<[number, number][]>([center]);
  const [copyLabel, setCopyLabel] = useState("Copy Coordinates");
  const mapsUrl = `https://www.google.com/maps?q=${center[0]},${center[1]}`;

  useEffect(() => {
    setTrail((t) => [...t.slice(-19), center]);
  }, [center]);

  const copyCoords = async () => {
    try {
      await navigator.clipboard.writeText(`${center[0].toFixed(6)}, ${center[1].toFixed(6)}`);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy Coordinates"), 1800);
    } catch {
      setCopyLabel("Copy failed");
      setTimeout(() => setCopyLabel("Copy Coordinates"), 1800);
    }
  };

  const pois = [
    { name: "Sarathi Putta Reddy Hospital", type: "hospital", pos: [center[0] + 0.005, center[1] + 0.004] as [number, number], dist: "1.2 km", icon: Hospital, color: "oklch(0.66 0.24 25)", letter: "H" },
    { name: "Sri Satya Sai Hospital", type: "hospital", pos: [center[0] - 0.006, center[1] - 0.003] as [number, number], dist: "2.1 km", icon: Hospital, color: "oklch(0.66 0.24 25)", letter: "S" },
    { name: "Doddaballapura Town Police Station", type: "police", pos: [center[0] + 0.003, center[1] - 0.005] as [number, number], dist: "0.8 km", icon: Shield, color: "oklch(0.55 0.22 250)", letter: "P" },
    { name: "Doddaballapur Fire Station", type: "fire", pos: [center[0] - 0.004, center[1] + 0.006] as [number, number], dist: "1.5 km", icon: Flame, color: "oklch(0.78 0.17 45)", letter: "F" },
  ];

  const dangerZones = [
    { pos: [center[0] + 0.01, center[1] + 0.012] as [number, number], r: 400, label: "Accident hotspot" },
    { pos: [center[0] - 0.012, center[1] - 0.008] as [number, number], r: 300, label: "Crime hotspot" },
  ];

  return (
    <Layout>
      <div className="px-4 lg:px-8 py-6 max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="mono text-[11px] text-muted-foreground tracking-widest"><Navigation className="w-3 h-3 inline mr-1" /> LIVE GPS TELEMETRY</div>
            <h1 className="font-display text-3xl font-bold text-gradient">Tracking & Response Map</h1>
          </div>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
            <Share2 className="w-4 h-4" /> Open Shared Location
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 panel overflow-hidden h-[520px] relative">
            <MapContainer center={center} zoom={15} className="w-full h-full" zoomControl={false} attributionControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Recenter pos={center} />
              <Marker position={center} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
              <Circle center={center} radius={300} pathOptions={{ color: "oklch(0.78 0.16 175)", weight: 1, fillOpacity: 0.05 }} />
              {pois.map((p, i) => (
                <Marker key={i} position={p.pos} icon={poiIcon(p.color, p.letter)}>
                  <Popup><strong>{p.name}</strong><br />{p.dist}</Popup>
                </Marker>
              ))}
              {dangerZones.map((z, i) => (
                <Circle key={i} center={z.pos} radius={z.r} pathOptions={{ color: "oklch(0.66 0.24 25)", fillColor: "oklch(0.66 0.24 25)", fillOpacity: 0.15, weight: 1 }}>
                  <Popup>{z.label}</Popup>
                </Circle>
              ))}
              {trail.length > 1 && (
                <Polyline positions={trail} pathOptions={{ color: "oklch(0.78 0.16 175)", weight: 2, dashArray: "4 6" }} />
              )}
              {/* Route to nearest hospital */}
              <Polyline positions={[center, pois[0].pos]} pathOptions={{ color: "oklch(0.66 0.24 25)", weight: 3 }} />
            </MapContainer>

            <div className="absolute top-3 left-3 panel px-3 py-2 mono text-[11px] flex items-center gap-2 z-[500]">
              <span className="status-dot danger" /> AMBULANCE EN ROUTE · ETA 4 MIN
            </div>
            <div className="absolute top-3 right-3 panel px-3 py-2 mono text-[10px] z-[500]">
              {center[0].toFixed(5)}°N · {center[1].toFixed(5)}°E
            </div>
          </div>

          <div className="space-y-3">
            <div className="panel p-4">
              <div className="mono text-[10px] text-muted-foreground tracking-widest">CURRENT ADDRESS</div>
              <div className="font-display text-lg font-semibold mt-1">RL Jalappa Institute of Technology</div>
              <div className="text-sm text-muted-foreground">Devanahalli Highway, Kodigehalli, Doddaballapura, Karnataka</div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex-1 min-w-[120px] py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold text-center">Open Shared Link</a>
                <button type="button" onClick={copyCoords} className="flex-1 min-w-[120px] py-2 rounded-lg glass text-xs">{copyLabel}</button>
              </div>
            </div>

            <div className="panel p-4">
              <div className="mono text-[10px] text-muted-foreground tracking-widest mb-3">NEAREST RESPONDERS</div>
              <div className="space-y-2">
                {pois.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                      <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: `${p.color.replace(")", " / 0.2)")}` }}>
                        <Icon className="w-4 h-4" style={{ color: p.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{p.name}</div>
                        <div className="mono text-[10px] text-muted-foreground">{p.dist} away</div>
                      </div>
                      <RouteIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel p-4 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 text-primary mono text-[10px] tracking-widest">
                <AlertTriangle className="w-3 h-3" /> DANGER ZONE NEARBY
              </div>
              <div className="text-sm mt-1">Accident hotspot · 200m NE</div>
              <div className="mono text-[10px] text-muted-foreground mt-1">8 incidents reported · last 24h</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
