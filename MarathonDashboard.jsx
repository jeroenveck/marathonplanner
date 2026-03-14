import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";

const FONT_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap";

const REAL_NOW = 25;

const SESSION_COLORS = {
  "Easy run": "#22c55e", "Easy": "#22c55e", "Recovery": "#22c55e",
  "Tempo": "#f97316", "Steady run": "#8b5cf6", "Steady": "#8b5cf6",
  "Interval": "#ef4444", "Long run": "#3b82f6", "Duur": "#3b82f6",
  "Herstel": "#a3a3a3", "Shake-out": "#94a3b8", "MARATHON": "#dc2626",
  "Easy + strides": "#22c55e",
};
const zoneColor = z => ({
  "Zone 2":"#eff6ff","Zone 3":"#fff7ed","Zone 4":"#fef2f2","Zone 5":"#fdf2f8",
  "Z1–2":"#f0fdf4","Z1–Z2":"#f0fdf4","Z2":"#eff6ff","Z2–3":"#eff6ff",
  "Z2–Z3":"#eff6ff","Z3":"#fff7ed","Z4":"#fef2f2","Z4–5":"#fef2f2","Z5":"#fdf2f8",
  "Z1":"#f0fdf4","Z2→Z3":"#fff7ed","Z2–lage Z3":"#fff7ed",
})[z] || "#f8fafc";

// ─── ALL 34 WEEKS ────────────────────────────────────────────────────────────

const ALL_WEEKS = [
  { gw:1,  fase:"Basis",  fw:1,  label:"Basisopbouw start",   type:"build", totalKm:20,
    sessions:[{dag:"Ma",type:"Easy run",dist:"5 km",    zone:"Zone 2",km:5},
              {dag:"Wo",type:"Tempo",   dist:"20 min",  zone:"Zone 3",km:null},
              {dag:"Vr",type:"Interval",dist:"6×400m",  zone:"Zone 4",km:null},
              {dag:"Zo",type:"Long run",dist:"8 km",    zone:"Zone 2",km:8}]},
  { gw:2,  fase:"Basis",  fw:2,  label:"Volume opbouwen",     type:"build", totalKm:23,
    sessions:[{dag:"Ma",type:"Easy run",dist:"6 km",    zone:"Zone 2",km:6},
              {dag:"Wo",type:"Tempo",   dist:"25 min",  zone:"Zone 3",km:null},
              {dag:"Vr",type:"Interval",dist:"6×500m",  zone:"Zone 4",km:null},
              {dag:"Zo",type:"Long run",dist:"9 km",    zone:"Zone 2",km:9}]},
  { gw:3,  fase:"Basis",  fw:3,  label:"Tempoprikkel",        type:"build", totalKm:25,
    sessions:[{dag:"Ma",type:"Easy run",dist:"6 km",    zone:"Zone 2",km:6},
              {dag:"Wo",type:"Tempo",   dist:"30 min",  zone:"Zone 3",km:null},
              {dag:"Vr",type:"Interval",dist:"7×400m",  zone:"Zone 4",km:null},
              {dag:"Zo",type:"Long run",dist:"10 km",   zone:"Zone 2",km:10}]},
  { gw:4,  fase:"Basis",  fw:4,  label:"Volume doortrekken",  type:"build", totalKm:28,
    sessions:[{dag:"Ma",type:"Easy run",dist:"7 km",    zone:"Zone 2",km:7},
              {dag:"Wo",type:"Tempo",   dist:"30 min",  zone:"Zone 3",km:null},
              {dag:"Vr",type:"Interval",dist:"8×400m",  zone:"Zone 4",km:null},
              {dag:"Zo",type:"Long run",dist:"11 km",   zone:"Zone 2",km:11}]},
  { gw:5,  fase:"Basis",  fw:5,  label:"Interval uitbreiden", type:"build", totalKm:30,
    sessions:[{dag:"Ma",type:"Easy run",dist:"7 km",    zone:"Zone 2",km:7},
              {dag:"Wo",type:"Tempo",   dist:"35 min",  zone:"Zone 3",km:null},
              {dag:"Vr",type:"Interval",dist:"6×600m",  zone:"Zone 4",km:null},
              {dag:"Zo",type:"Long run",dist:"12 km",   zone:"Zone 2",km:12}]},
  { gw:6,  fase:"Basis",  fw:6,  label:"Lange duur groeit",   type:"build", totalKm:32,
    sessions:[{dag:"Ma",type:"Easy run",dist:"7 km",    zone:"Zone 2",km:7},
              {dag:"Wo",type:"Tempo",   dist:"35 min",  zone:"Zone 3",km:null},
              {dag:"Vr",type:"Interval",dist:"7×500m",  zone:"Zone 4",km:null},
              {dag:"Zo",type:"Long run",dist:"13 km",   zone:"Zone 2",km:13}]},
  { gw:7,  fase:"Basis",  fw:7,  label:"Oplopende intensiteit",type:"build", totalKm:34,
    sessions:[{dag:"Ma",type:"Easy run",dist:"7 km",    zone:"Zone 2",km:7},
              {dag:"Wo",type:"Tempo",   dist:"40 min",  zone:"Zone 3",km:null},
              {dag:"Vr",type:"Interval",dist:"6×800m",  zone:"Zone 4",km:null},
              {dag:"Zo",type:"Long run",dist:"14 km",   zone:"Zone 2",km:14}]},
  { gw:8,  fase:"Basis",  fw:8,  label:"Basisblok afsluiting", type:"build", totalKm:36,
    sessions:[{dag:"Ma",type:"Easy run",dist:"7 km",    zone:"Zone 2",km:7},
              {dag:"Wo",type:"Tempo",   dist:"40 min",  zone:"Zone 3",km:null},
              {dag:"Vr",type:"Interval",dist:"8×500m",  zone:"Zone 4",km:null},
              {dag:"Zo",type:"Long run",dist:"15 km",   zone:"Zone 2",km:15}]},
  { gw:9,  fase:"Fundering", fw:1,  label:"Aerobe basis",       type:"build", totalKm:28,
    sessions:[{dag:"Ma",type:"Easy run",  dist:"5 km",          zone:"Z1–2",  km:5},
              {dag:"Wo",type:"Steady run",dist:"6 km",          zone:"Z2",    km:6},
              {dag:"Vr",type:"Interval",  dist:"4×400m",        zone:"Z4",    km:null},
              {dag:"Zo",type:"Long run",  dist:"12 km",         zone:"Z2",    km:12}]},
  { gw:10, fase:"Fundering", fw:2,  label:"Tempo introductie",  type:"build", totalKm:34,
    sessions:[{dag:"Ma",type:"Easy run",  dist:"6 km",          zone:"Z1–2",  km:6},
              {dag:"Wo",type:"Tempo",     dist:"8 km (3 Z3)",   zone:"Z3",    km:8},
              {dag:"Vr",type:"Interval",  dist:"6×500m",        zone:"Z4–5",  km:null},
              {dag:"Zo",type:"Long run",  dist:"14 km",         zone:"Z2",    km:14}]},
  { gw:11, fase:"Fundering", fw:3,  label:"Herstelweek",        type:"rest",  totalKm:37,
    sessions:[{dag:"Ma",type:"Recovery",  dist:"6 km",          zone:"Z1–2",  km:6},
              {dag:"Wo",type:"Tempo",     dist:"9 km (2×2 Z3)", zone:"Z3",    km:9},
              {dag:"Vr",type:"Interval",  dist:"7×600m",        zone:"Z4",    km:null},
              {dag:"Zo",type:"Long run",  dist:"16 km",         zone:"Z2–3",  km:16}]},
  { gw:12, fase:"Fundering", fw:4,  label:"Volume opbouwen",    type:"build", totalKm:40,
    sessions:[{dag:"Ma",type:"Easy",      dist:"6 km",          zone:"Z1–2",  km:6},
              {dag:"Wo",type:"Tempo",     dist:"10 km (4 Z3)",  zone:"Z3",    km:10},
              {dag:"Vr",type:"Interval",  dist:"8×400m",        zone:"Z4–5",  km:null},
              {dag:"Zo",type:"Long run",  dist:"18 km",         zone:"Z2",    km:18}]},
  { gw:13, fase:"Fundering", fw:5,  label:"Duurverlenging",     type:"build", totalKm:42,
    sessions:[{dag:"Ma",type:"Easy",      dist:"6 km",          zone:"Z1–2",  km:6},
              {dag:"Wo",type:"Tempo",     dist:"10 km (2×3)",   zone:"Z3",    km:10},
              {dag:"Vr",type:"Interval",  dist:"6×800m",        zone:"Z4",    km:null},
              {dag:"Zo",type:"Long run",  dist:"20 km",         zone:"Z2–3",  km:20}]},
  { gw:14, fase:"Fundering", fw:6,  label:"Lang en stabiel",    type:"build", totalKm:46,
    sessions:[{dag:"Ma",type:"Easy",      dist:"7 km",          zone:"Z1–2",  km:7},
              {dag:"Wo",type:"Tempo",     dist:"11 km (5 Z3)",  zone:"Z3",    km:11},
              {dag:"Vr",type:"Interval",  dist:"5×1 km",        zone:"Z4",    km:null},
              {dag:"Zo",type:"Long run",  dist:"22 km",         zone:"Z2–3",  km:22}]},
  { gw:15, fase:"Fundering", fw:7,  label:"Herstelweek",        type:"rest",  totalKm:46,
    sessions:[{dag:"Ma",type:"Recovery",  dist:"6 km",          zone:"Z1–2",  km:6},
              {dag:"Wo",type:"Steady",    dist:"10 km",         zone:"Z2–3",  km:10},
              {dag:"Vr",type:"Interval",  dist:"10×400m",       zone:"Z5",    km:null},
              {dag:"Zo",type:"Long run",  dist:"24 km",         zone:"Z2",    km:24}]},
  { gw:16, fase:"Fundering", fw:8,  label:"Piekaanloop",        type:"build", totalKm:50,
    sessions:[{dag:"Ma",type:"Easy",      dist:"7 km",          zone:"Z1–2",  km:7},
              {dag:"Wo",type:"Tempo",     dist:"12 km (3×3)",   zone:"Z3",    km:12},
              {dag:"Vr",type:"Interval",  dist:"6×800m",        zone:"Z4",    km:null},
              {dag:"Zo",type:"Long run",  dist:"25 km",         zone:"Z2–3",  km:25}]},
  { gw:17, fase:"Fundering", fw:9,  label:"Langste duur Funde", type:"peak",  totalKm:52,
    sessions:[{dag:"Ma",type:"Easy",      dist:"6 km",          zone:"Z1–2",  km:6},
              {dag:"Wo",type:"Steady",    dist:"12 km",         zone:"Z2–3",  km:12},
              {dag:"Vr",type:"Interval",  dist:"8×600m",        zone:"Z4–5",  km:null},
              {dag:"Zo",type:"Long run",  dist:"27 km",         zone:"Z2",    km:27}]},
  { gw:18, fase:"Fundering", fw:10, label:"Afsluiting fundering",type:"build", totalKm:51,
    sessions:[{dag:"Ma",type:"Recovery",  dist:"7 km",          zone:"Z1–2",  km:7},
              {dag:"Wo",type:"Tempo",     dist:"12 km (4 Z3)",  zone:"Z3",    km:12},
              {dag:"Vr",type:"Interval",  dist:"5×1 km",        zone:"Z4",    km:null},
              {dag:"Zo",type:"Long run",  dist:"26 km",         zone:"Z2–3",  km:26}]},
  { gw:19, fase:"Transitie", fw:1, label:"Herstel & onderhoud", type:"rest",  totalKm:28,
    sessions:[{dag:"Di",type:"Easy run",     dist:"8 km",         zone:"Z1–Z2", km:8,  toelichting:"Rustig starten, herstelgericht"},
              {dag:"Do",type:"Easy + strides",dist:"6 km + 4×20s",zone:"Z1–Z2",km:6,  toelichting:"Souplesse, geen vermoeidheid"},
              {dag:"Za",type:"Long run",      dist:"14 km",        zone:"Z2",   km:14, toelichting:"Lage hartslag, ontspannen"}]},
  { gw:20, fase:"Transitie", fw:2, label:"Aerobe consolidatie", type:"build", totalKm:35,
    sessions:[{dag:"Di",type:"Steady run",   dist:"10 km",        zone:"Z2",   km:10, toelichting:"Constante aerobe prikkel"},
              {dag:"Do",type:"Easy run",      dist:"8 km",         zone:"Z1–Z2",km:8,  toelichting:"Herstel"},
              {dag:"Za",type:"Long run",      dist:"17 km",        zone:"Z2",   km:17, toelichting:"Ontspannen duur"}]},
  { gw:21, fase:"Transitie", fw:3, label:"Lichte tempoprikkel", type:"build", totalKm:36,
    sessions:[{dag:"Di",type:"Tempo",        dist:"10 km (2×2)",  zone:"Z3",   km:10, toelichting:"Lichte tempoprikkel"},
              {dag:"Do",type:"Easy run",      dist:"8 km",         zone:"Z1–Z2",km:8,  toelichting:"Herstel"},
              {dag:"Za",type:"Long run",      dist:"18 km",        zone:"Z2",   km:18, toelichting:"Laatste 2 km iets steviger"}]},
  { gw:22, fase:"Transitie", fw:4, label:"Brug naar marathon",  type:"build", totalKm:40,
    sessions:[{dag:"Di",type:"Steady run",   dist:"12 km",        zone:"Z2–lage Z3",km:12,toelichting:"Brug naar marathonspecifiek"},
              {dag:"Do",type:"Easy + strides",dist:"8 km + 4×20s",zone:"Z1–Z2", km:8, toelichting:"Souplesse"},
              {dag:"Za",type:"Long run",      dist:"20 km",        zone:"Z2",   km:20, toelichting:"Fris eindigen"}]},
  { gw:23, fase:"Marathonspecifiek", fw:1,  label:"Intro marathontempo",      type:"build", totalKm:50,
    sessions:[{dag:"Di",type:"Tempo",   dist:"12 km (2×3)", zone:"Z3",    km:12, toelichting:"Intro marathontempo"},
              {dag:"Do",type:"Easy",    dist:"8 km",        zone:"Z1–Z2", km:8,  toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"22 km",       zone:"Z2",    km:22, toelichting:"Lange rustige duur"},
              {dag:"Zo",type:"Herstel", dist:"8 km",        zone:"Z1",    km:8,  toelichting:"Actief herstel"}]},
  { gw:24, fase:"Marathonspecifiek", fw:2,  label:"Tempo verlengen",          type:"build", totalKm:55,
    sessions:[{dag:"Di",type:"Tempo",   dist:"13 km (4 km)",zone:"Z3",    km:13, toelichting:"Tempo verlengen"},
              {dag:"Do",type:"Easy",    dist:"8 km",        zone:"Z1–Z2", km:8,  toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"24 km",       zone:"Z2",    km:24, toelichting:"Duurverlenging"},
              {dag:"Zo",type:"Herstel", dist:"10 km",       zone:"Z1",    km:10, toelichting:"Herstel"}]},
  { gw:25, fase:"Marathonspecifiek", fw:3,  label:"Tempo onder vermoeidheid", type:"build", totalKm:58,
    sessions:[{dag:"Di",type:"Tempo",   dist:"14 km (3×3)", zone:"Z3",    km:14, toelichting:"Tempo onder vermoeidheid"},
              {dag:"Do",type:"Easy",    dist:"8 km",        zone:"Z1–Z2", km:8,  toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"25 km",       zone:"Z2",    km:25, toelichting:"Rustige lange duur"},
              {dag:"Zo",type:"Herstel", dist:"11 km",       zone:"Z1",    km:11, toelichting:"Actief herstel"}]},
  { gw:26, fase:"Marathonspecifiek", fw:4,  label:"Ontlastweek",              type:"rest",  totalKm:46,
    sessions:[{dag:"Di",type:"Steady",  dist:"10 km",       zone:"Z2",    km:10, toelichting:"Ontlastweek"},
              {dag:"Do",type:"Easy",    dist:"8 km",        zone:"Z1–Z2", km:8,  toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"20 km",       zone:"Z2",    km:20, toelichting:"Verkorte duur"},
              {dag:"Zo",type:"Herstel", dist:"8 km",        zone:"Z1",    km:8,  toelichting:"Herstel"}]},
  { gw:27, fase:"Marathonspecifiek", fw:5,  label:"Duurverlenging",           type:"build", totalKm:60,
    sessions:[{dag:"Di",type:"Tempo",   dist:"15 km (5 Z3)",zone:"Z3",    km:15, toelichting:"Tempo uitbreiden"},
              {dag:"Do",type:"Easy",    dist:"10 km",       zone:"Z1–Z2", km:10, toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"27 km",       zone:"Z2",    km:27, toelichting:"Duurverlenging"},
              {dag:"Zo",type:"Herstel", dist:"8 km",        zone:"Z1",    km:8,  toelichting:"Herstel"}]},
  { gw:28, fase:"Marathonspecifiek", fw:6,  label:"Langere tempoblokken",     type:"build", totalKm:62,
    sessions:[{dag:"Di",type:"Tempo",   dist:"15 km (2×4)", zone:"Z3",    km:15, toelichting:"Langere tempoblokken"},
              {dag:"Do",type:"Easy",    dist:"10 km",       zone:"Z1–Z2", km:10, toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"28 km",       zone:"Z2",    km:28, toelichting:"Duurverlenging"},
              {dag:"Zo",type:"Herstel", dist:"9 km",        zone:"Z1",    km:9,  toelichting:"Herstel"}]},
  { gw:29, fase:"Marathonspecifiek", fw:7,  label:"Tempo stabiliseren",       type:"peak",  totalKm:64,
    sessions:[{dag:"Di",type:"Tempo",   dist:"16 km (6 Z3)",zone:"Z3",    km:16, toelichting:"Tempo stabiliseren"},
              {dag:"Do",type:"Easy",    dist:"10 km",       zone:"Z1–Z2", km:10, toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"29 km",       zone:"Z2",    km:29, toelichting:"Lange duur"},
              {dag:"Zo",type:"Herstel", dist:"9 km",        zone:"Z1",    km:9,  toelichting:"Herstel"}]},
  { gw:30, fase:"Marathonspecifiek", fw:8,  label:"Ontlastweek",              type:"rest",  totalKm:50,
    sessions:[{dag:"Di",type:"Steady",  dist:"12 km",       zone:"Z2",    km:12, toelichting:"Ontlastweek"},
              {dag:"Do",type:"Easy",    dist:"8 km",        zone:"Z1–Z2", km:8,  toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"22 km",       zone:"Z2",    km:22, toelichting:"Verkorte duur"},
              {dag:"Zo",type:"Herstel", dist:"8 km",        zone:"Z1",    km:8,  toelichting:"Herstel"}]},
  { gw:31, fase:"Marathonspecifiek", fw:9,  label:"Piekweek",                 type:"peak",  totalKm:66,
    sessions:[{dag:"Di",type:"Tempo",   dist:"16 km (3×4)", zone:"Z3",    km:16, toelichting:"Piekweek"},
              {dag:"Do",type:"Easy",    dist:"10 km",       zone:"Z1–Z2", km:10, toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"30 km",       zone:"Z2",    km:30, toelichting:"Langste duur"},
              {dag:"Zo",type:"Herstel", dist:"10 km",       zone:"Z1",    km:10, toelichting:"Herstel"}]},
  { gw:32, fase:"Marathonspecifiek", fw:10, label:"Marathon-simulatie",       type:"peak",  totalKm:61,
    sessions:[{dag:"Di",type:"Tempo",   dist:"14 km (6 Z3)",zone:"Z3",    km:14, toelichting:"Consolidatie"},
              {dag:"Do",type:"Easy",    dist:"10 km",       zone:"Z1–Z2", km:10, toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"28 km (Z2→Z3)",zone:"Z2→Z3",km:28, toelichting:"Marathon-simulatie"},
              {dag:"Zo",type:"Herstel", dist:"9 km",        zone:"Z1",    km:9,  toelichting:"Herstel"}]},
  { gw:33, fase:"Marathonspecifiek", fw:11, label:"Start taper",              type:"taper", totalKm:46,
    sessions:[{dag:"Di",type:"Tempo",   dist:"12 km (4 Z3)",zone:"Z3",    km:12, toelichting:"Start taper"},
              {dag:"Do",type:"Easy",    dist:"8 km",        zone:"Z1–Z2", km:8,  toelichting:"Herstel"},
              {dag:"Za",type:"Duur",    dist:"20 km",       zone:"Z2",    km:20, toelichting:"Belasting omlaag"},
              {dag:"Zo",type:"Herstel", dist:"6 km",        zone:"Z1",    km:6,  toelichting:"Herstel"}]},
  { gw:34, fase:"Marathonspecifiek", fw:12, label:"Race week",                type:"race",  totalKm:59.2,
    sessions:[{dag:"Di",type:"Tempo",      dist:"8 km (2 Z3)", zone:"Z3",   km:8,    toelichting:"Spanning behouden"},
              {dag:"Do",type:"Easy",        dist:"6 km",        zone:"Z1",   km:6,    toelichting:"Ontspannen"},
              {dag:"Za",type:"Shake-out",   dist:"3 km",        zone:"Z1",   km:3,    toelichting:"Loslopen"},
              {dag:"Zo",type:"MARATHON",    dist:"42.2 km",     zone:"Z2–Z3",km:42.2, toelichting:"Wedstrijd 🏁"}]},
];

const PHASE_META = {
  "Basis":            { color:"#64748b", bg:"#f8fafc",  border:"#e2e8f0", range:[1,8]  },
  "Fundering":        { color:"#0f172a", bg:"#f1f5f9",  border:"#cbd5e1", range:[9,18] },
  "Transitie":        { color:"#c2410c", bg:"#fff7ed",  border:"#fed7aa", range:[19,22]},
  "Marathonspecifiek":{ color:"#1d4ed8", bg:"#eff6ff",  border:"#bfdbfe", range:[23,34]},
};

const TYPE_META = {
  build: { label:"opbouw",    color:"#1d4ed8", bg:"#eff6ff" },
  rest:  { label:"rust",      color:"#f97316", bg:"#fff7ed" },
  peak:  { label:"piek",      color:"#dc2626", bg:"#fef2f2" },
  taper: { label:"taper",     color:"#8b5cf6", bg:"#f5f3ff" },
  race:  { label:"wedstrijd", color:"#dc2626", bg:"#fef2f2" },
};

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 800);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

function makeChart(selGw) {
  return ALL_WEEKS.map(w => {
    const longRun = w.sessions.find(s => ["Long run","Duur","MARATHON"].includes(s.type));
    const km = longRun?.km ?? null;
    return {
      week:     w.gw,
      fase:     w.fase,
      km,
      afgerond: w.gw <  selGw ? km : w.gw === selGw ? km : null,
      gepland:  w.gw >  selGw ? km : null,
      selected: w.gw === selGw,
    };
  });
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: accent ? "#0f172a" : "#fff", border: accent ? "none" : "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", display:"flex", flexDirection:"column", gap:3 }}>
      <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.09em", color: accent ? "#94a3b8" : "#64748b", textTransform:"uppercase" }}>{label}</span>
      <span style={{ fontSize:21, fontWeight:700, color: accent ? "#fff" : "#0f172a", letterSpacing:"-0.02em", lineHeight:1.1 }}>{value}</span>
      {sub && <span style={{ fontSize:11, color: accent ? "#64748b" : "#94a3b8", marginTop:1 }}>{sub}</span>}
    </div>
  );
}

function SessionCard({ dag, type, dist, zone, toelichting, km }) {
  const color = SESSION_COLORS[type] || "#94a3b8";
  return (
    <div style={{ border:"1px solid #e2e8f0", borderRadius:10, overflow:"hidden" }}>
      <div style={{ padding:"12px 14px", borderLeft:`4px solid ${color}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
          <div>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.09em", color:"#94a3b8", textTransform:"uppercase" }}>{dag}</span>
            <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", marginTop:1 }}>{type}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            {km != null
              ? <><div style={{ fontSize:19, fontWeight:700, color, fontFamily:"DM Mono, monospace", lineHeight:1 }}>{km}</div><div style={{ fontSize:9, color:"#94a3b8" }}>km</div></>
              : <div style={{ fontSize:13, fontWeight:700, color, fontFamily:"DM Mono, monospace" }}>{dist}</div>
            }
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:11, color:"#475569", flexShrink:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{toelichting || dist}</span>
          <span style={{ fontSize:10, fontWeight:600, padding:"2px 5px", borderRadius:4, background:zoneColor(zone), color, fontFamily:"DM Mono, monospace", flexShrink:0 }}>{zone}</span>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const km = d?.afgerond ?? d?.gepland;
  if (!km) return null;
  const pm = PHASE_META[d.fase];
  return (
    <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, padding:"10px 14px", fontSize:13, boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight:700, color:"#0f172a" }}>Week {d.week}</div>
      <div style={{ color: pm?.color ?? "#64748b", fontSize:11, fontWeight:600 }}>{d.fase}</div>
      <div style={{ fontSize:18, fontWeight:700, color:"#1d4ed8", marginTop:4, fontFamily:"DM Mono, monospace" }}>{km} <span style={{ fontSize:12, fontWeight:500 }}>km long</span></div>
      {d.selected && <div style={{ fontSize:10, color:"#f97316", fontWeight:700, marginTop:3 }}>◀ GESELECTEERD</div>}
    </div>
  );
};

export default function MarathonDashboard() {
  const [sel, setSel] = useState(REAL_NOW);
  const width = useWindowWidth();
  const isMobile = width < 640;
  const px = isMobile ? 16 : 28;

  useEffect(() => {
    const link = document.createElement("link");
    link.href = FONT_URL; link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const wd       = ALL_WEEKS[sel - 1];
  const isNow    = sel === REAL_NOW;
  const isPast   = sel < REAL_NOW;
  const isFut    = sel > REAL_NOW;
  const tm       = TYPE_META[wd.type];
  const pm       = PHASE_META[wd.fase];
  const chart    = makeChart(sel);
  const longRun  = wd.sessions.find(s => ["Long run","Duur","MARATHON"].includes(s.type));
  const refColor = isNow ? "#dc2626" : isFut ? "#3b82f6" : "#f97316";
  const nextWeeks = ALL_WEEKS.slice(sel, Math.min(sel + 3, 34));

  const NavBtn = ({ dir }) => {
    const disabled = dir === -1 ? sel === 1 : sel === 34;
    return (
      <button onClick={() => setSel(s => s + dir)} disabled={disabled}
        style={{ width:36, height:36, borderRadius:8, border:"1px solid #e2e8f0",
          background: disabled ? "#f8fafc" : "#fff", cursor: disabled ? "not-allowed" : "pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          color: disabled ? "#cbd5e1" : "#0f172a", fontSize:20, transition:"all 0.15s",
          flexShrink:0 }}
      >{dir === -1 ? "‹" : "›"}</button>
    );
  };

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:"#fff", minHeight:"100vh" }}>

      {/* TOP BAR */}
      <div style={{ borderBottom:"1px solid #e2e8f0", padding: isMobile ? "12px 16px" : "13px 28px", display:"flex", flexDirection: isMobile ? "column" : "row", justifyContent:"space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 10 : 0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Marathon 2026</div>
            <div style={{ fontSize:10, color:"#94a3b8" }}>Rotterdam · 12 april 2026</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-end" }}>
          {!isMobile && (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>Huidige positie</div>
              <div style={{ fontSize:12, fontWeight:600, color:"#0f172a" }}>Marathonspecifiek — Week 3 van 12</div>
            </div>
          )}
          {isMobile && <div style={{ fontSize:12, fontWeight:600, color:"#0f172a" }}>MS Week 3/12</div>}
          <div style={{ background:"#fee2e2", color:"#dc2626", borderRadius:8, padding:"5px 12px", fontSize:13, fontWeight:700, fontFamily:"DM Mono, monospace", flexShrink:0 }}>30 dgn</div>
        </div>
      </div>

      {/* PHASE PROGRESS BAR */}
      <div style={{ padding:`14px ${px}px 0`, borderBottom:"1px solid #f1f5f9" }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:7 }}>
          Programma · week {sel}/34
        </div>
        <div style={{ display:"flex", gap:3, height:4, borderRadius:6, overflow:"hidden", marginBottom:8 }}>
          {[{name:"Basis",w:8},{name:"Fundering",w:10},{name:"Transitie",w:4},{name:"Marathonspecifiek",w:12}].map((p,i) => {
            const startGw = [1,9,19,23][i];
            const endGw   = startGw + p.w - 1;
            const allDone = sel > endGw;
            const partialFill = sel >= startGw && sel <= endGw ? ((sel - startGw + 1) / p.w) * 100 : 0;
            const bgColor = PHASE_META[p.name].color;
            return (
              <div key={p.name} style={{ width:`${(p.w/34)*100}%`, background:"#e2e8f0", borderRadius:3, overflow:"hidden" }}>
                <div style={{ width: allDone ? "100%" : `${partialFill}%`, height:"100%", background: bgColor, transition:"width 0.35s ease" }} />
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:3, marginBottom:14 }}>
          {[{name:"Basis",period:"sep–okt",short:"Basis",w:8},{name:"Fundering",period:"nov–jan",short:"Fund.",w:10},{name:"Transitie",period:"feb",short:"Trans.",w:4},{name:"Marathonspecifiek",period:"mrt–apr",short:"MS",w:12}].map(p => {
            const pm2 = PHASE_META[p.name];
            const isActive = wd.fase === p.name;
            return (
              <div key={p.name} style={{ width:`${(p.w/34)*100}%`, overflow:"hidden" }}>
                <div style={{ fontSize: isMobile ? 9 : 10, fontWeight: isActive ? 700 : 500, color: isActive ? pm2.color : "#94a3b8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{isMobile ? p.short : p.name}</div>
                {!isMobile && <div style={{ fontSize:9, color:"#cbd5e1", fontFamily:"DM Mono, monospace" }}>{p.period}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* WEEK NAVIGATOR */}
      <div style={{ padding:`12px ${px}px`, borderBottom:"1px solid #f1f5f9" }}>
        {/* Phase tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:10, overflowX:"auto", WebkitOverflowScrolling:"touch", scrollbarWidth:"none" }}>
          {Object.entries(PHASE_META).map(([name, meta]) => {
            const [start] = meta.range;
            const isActive = wd.fase === name;
            const shortNames = { "Basis":"Basis", "Fundering":"Fund.", "Transitie":"Trans.", "Marathonspecifiek":"MS" };
            return (
              <button key={name} onClick={() => setSel(start)}
                style={{ padding: isMobile ? "5px 10px" : "5px 12px", borderRadius:6, border:"1px solid",
                  borderColor: isActive ? meta.color : "#e2e8f0",
                  background: isActive ? meta.bg : "#fff",
                  color: isActive ? meta.color : "#94a3b8",
                  fontSize:11, fontWeight: isActive ? 700 : 500, cursor:"pointer",
                  transition:"all 0.15s", whiteSpace:"nowrap", flexShrink:0 }}
              >{isMobile ? shortNames[name] : name}</button>
            );
          })}
        </div>

        {/* Week selector row */}
        <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 8 : 10, justifyContent:"space-between", flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flex: isMobile ? "1 1 100%" : "0 0 auto", justifyContent: isMobile ? "space-between" : "flex-start" }}>
            <NavBtn dir={-1} />
            <div style={{ textAlign:"center", flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
                <span style={{ fontSize: isMobile ? 15 : 17, fontWeight:700, color:"#0f172a" }}>
                  {wd.fase === "Marathonspecifiek" ? `MS Week ${wd.fw}` : wd.fase === "Transitie" ? `Transitie W${wd.fw}` : `${wd.fase} Week ${wd.fw}`}
                </span>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, background:tm.bg, color:tm.color, fontFamily:"DM Mono, monospace" }}>{tm.label}</span>
                {isNow && <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, background:"#0f172a", color:"#fff", letterSpacing:"0.04em" }}>NU</span>}
                {isPast && <span style={{ fontSize:10, color:"#94a3b8", fontWeight:500 }}>voltooid</span>}
                {isFut  && <span style={{ fontSize:10, color:"#3b82f6", fontWeight:600 }}>gepland</span>}
              </div>
              <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{wd.label}</div>
            </div>
            <NavBtn dir={1} />
          </div>

          {/* Week pills */}
          <div style={{ display:"flex", gap:3, flexWrap:"wrap", maxWidth: isMobile ? "100%" : 340, flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
            {ALL_WEEKS.filter(w => w.fase === wd.fase).map(w => {
              const isSel = w.gw === sel;
              const isCur = w.gw === REAL_NOW;
              const wtm   = TYPE_META[w.type];
              const wpm   = PHASE_META[w.fase];
              return (
                <button key={w.gw} onClick={() => setSel(w.gw)}
                  title={`Week ${w.fw} · ${w.label}`}
                  style={{ width:28, height:28, borderRadius:6,
                    border: isCur && !isSel ? `2px solid ${wpm.color}` : "1px solid transparent",
                    background: isSel ? "#0f172a" : w.gw < REAL_NOW ? "#f1f5f9" : wtm.bg,
                    color: isSel ? "#fff" : w.gw < REAL_NOW ? "#94a3b8" : wtm.color,
                    fontSize:10, fontWeight:700, cursor:"pointer",
                    fontFamily:"DM Mono, monospace", transition:"all 0.15s" }}
                >{w.fw}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div style={{ padding:`14px ${px}px`, display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap:10 }}>
        <KpiCard label="Week volume" value={`${wd.totalKm} km`} sub="Geplande km" accent />
        <KpiCard label="Long run" value={longRun ? `${longRun.km ?? longRun.dist}${longRun.km ? " km" : ""}` : "–"} sub={longRun?.toelichting?.split("·")[0] || longRun?.dist} />
        <KpiCard label={`Week in ${wd.fase === "Marathonspecifiek" ? "MS" : wd.fase}`} value={`${wd.fw} / ${[8,10,4,12][["Basis","Fundering","Transitie","Marathonspecifiek"].indexOf(wd.fase)]}`} sub={wd.fase} />
        <KpiCard label="Bloktype" value={tm.label} sub={wd.label} />
      </div>

      {/* SESSIONS + UPCOMING */}
      <div style={{ padding:`0 ${px}px 18px`, display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr", gap:18 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>Trainingen</span>
            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:4, background:pm.bg, color:pm.color, border:`1px solid ${pm.border}`, fontWeight:600 }}>{wd.fase}</span>
            {isNow && <span style={{ fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4, background:"#dcfce7", color:"#16a34a" }}>LOPEND</span>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns: isMobile && wd.sessions.length <= 3 ? "1fr" : "1fr 1fr", gap:8 }}>
            {wd.sessions.map(s => <SessionCard key={s.dag} {...s} />)}
          </div>
        </div>

        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#0f172a", marginBottom:10 }}>
            {sel < 34 ? "Volgende weken" : "Finish 🏁"}
          </div>
          {nextWeeks.length > 0 ? (
            <div style={{ border:"1px solid #e2e8f0", borderRadius:10, overflow:"hidden" }}>
              {nextWeeks.map((w, i) => {
                const wtm = TYPE_META[w.type];
                const wpm = PHASE_META[w.fase];
                const isNewPhase = i > 0 ? w.fase !== nextWeeks[i-1].fase : w.fase !== wd.fase;
                return (
                  <div key={w.gw}>
                    {i > 0 && <div style={{ height:1, background:"#f1f5f9" }} />}
                    {(i === 0 && w.fase !== wd.fase) || isNewPhase ? (
                      <div style={{ padding:"6px 14px 4px", background:wpm.bg, borderBottom:`1px solid ${wpm.border}` }}>
                        <span style={{ fontSize:9, fontWeight:700, color:wpm.color, textTransform:"uppercase", letterSpacing:"0.06em" }}>▶ {w.fase}</span>
                      </div>
                    ) : null}
                    <div style={{ padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}
                      onClick={() => setSel(w.gw)}
                      onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background=""}>
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
                          <span style={{ fontSize:10, fontWeight:700, color:"#94a3b8", fontFamily:"DM Mono, monospace" }}>W{w.fw}</span>
                          <span style={{ fontSize:11, fontWeight:600, color:"#0f172a" }}>{w.label}</span>
                          <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:3, background:wtm.bg, color:wtm.color }}>{wtm.label}</span>
                        </div>
                        <div style={{ fontSize:10, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{w.sessions.map(s => `${s.type} ${s.km != null ? s.km+"km" : s.dist}`).join(" · ")}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
                        <div style={{ fontSize:15, fontWeight:700, color:"#0f172a", fontFamily:"DM Mono, monospace" }}>{w.totalKm}</div>
                        <div style={{ fontSize:9, color:"#94a3b8" }}>km</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ border:"1px solid #e2e8f0", borderRadius:10, padding:"28px 16px", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🏁</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Rotterdam · 12 april 2026</div>
              <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>Last dance. Ren 'm!</div>
            </div>
          )}
        </div>
      </div>

      {/* CHART */}
      <div style={{ padding:`0 ${px}px 28px` }}>
        <div style={{ border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:`16px ${isMobile ? 14 : 22}px 0`, display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>Long run progressie · 34 weken</div>
              {!isMobile && <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>Klik op een punt om naar die week te springen</div>}
            </div>
            <div style={{ display:"flex", gap: isMobile ? 8 : 12, flexWrap:"wrap" }}>
              {[["#0f172a","Afgerond"],["#93c5fd","Gepland"],["#f97316","Geselecteerd"]].map(([c,l]) => (
                <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:c }} />
                  <span style={{ fontSize:10, color:"#64748b" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: isMobile ? 160 : 210, padding:"10px 4px 0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top:8, right:8, left: isMobile ? -28 : -20, bottom:0 }}
                onClick={e => { if (e?.activePayload?.[0]) setSel(e.activePayload[0].payload.week); }}>
                <defs>
                  <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0f172a" stopOpacity={0.10}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <ReferenceArea x1={1}  x2={8}  fill="#f8fafc" fillOpacity={0.7}/>
                <ReferenceArea x1={9}  x2={18} fill="#f1f5f9" fillOpacity={0.6}/>
                <ReferenceArea x1={19} x2={22} fill="#fff7ed" fillOpacity={0.5}/>
                <ReferenceArea x1={23} x2={34} fill="#eff6ff" fillOpacity={0.4}/>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="week" tick={{ fontSize:9, fill:"#94a3b8", fontFamily:"DM Mono, monospace" }} axisLine={false} tickLine={false} interval={isMobile ? 7 : 3}/>
                <YAxis tick={{ fontSize:9, fill:"#94a3b8", fontFamily:"DM Mono, monospace" }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />}/>
                {[8.5,18.5,22.5].map(at => <ReferenceLine key={at} x={at} stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 2"/>)}
                <ReferenceLine x={REAL_NOW} stroke="#dc2626" strokeWidth={1} strokeDasharray="3 2"
                  label={{ value:"Nu", position:"top", fontSize:8, fill:"#dc2626", fontWeight:700, fontFamily:"DM Mono, monospace" }}/>
                {sel !== REAL_NOW && (
                  <ReferenceLine x={sel} stroke={refColor} strokeWidth={2}
                    label={{ value:`W${sel}`, position:"top", fontSize:9, fill:refColor, fontWeight:700, fontFamily:"DM Mono, monospace" }}/>
                )}
                <Area type="monotone" dataKey="afgerond" stroke="#0f172a" strokeWidth={2} fill="url(#gD)"
                  dot={props => {
                    const d = props.payload;
                    if (d.selected) return <circle key={`s${d.week}`} cx={props.cx} cy={props.cy} r={5} fill="#f97316" stroke="#fff" strokeWidth={2}/>;
                    return <circle key={`d${d.week}`} cx={props.cx} cy={props.cy} r={0}/>;
                  }}
                  connectNulls={false} activeDot={{ r:4, fill:"#0f172a" }}/>
                <Area type="monotone" dataKey="gepland" stroke="#93c5fd" strokeWidth={2} strokeDasharray="5 3"
                  fill="url(#gP)" dot={false} connectNulls={false} activeDot={{ r:4, fill:"#3b82f6" }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"8fr 10fr 4fr 12fr", padding:`5px ${isMobile ? 10 : 26}px 12px` }}>
            {[["Basis","#64748b"],["Fundering","#0f172a"],["Trans.","#c2410c"],["MS","#1d4ed8"]].map(([n,c]) => (
              <div key={n} style={{ textAlign:"center", fontSize: isMobile ? 8 : 9, fontWeight:700, color:c, letterSpacing:"0.04em", textTransform:"uppercase" }}>{n}</div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop:"1px solid #f1f5f9", padding:`10px ${px}px`, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:4 }}>
        <span style={{ fontSize:10, color:"#cbd5e1" }}>Marathon Rotterdam · april 2026</span>
        <span style={{ fontSize:10, fontFamily:"DM Mono, monospace", color:"#cbd5e1" }}>week {sel}/34 · {wd.fase} W{wd.fw}</span>
      </div>
    </div>
  );
}
