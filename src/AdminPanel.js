import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users, LayoutDashboard, Dumbbell, Search, ChevronRight, ArrowLeft,
  Phone, Calendar, AlertCircle, Send, X, Plus, Trash2, Edit3,
  RefreshCw, CheckCircle, MessageCircle, Eye, ChevronDown,
  ChevronUp, Loader, History, Activity, BookOpen, Zap, Save
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFIGURAZIONE
   ───────────────────────────────────────────── */
const SHEET_ID   = "144-i_O8EGeL51ku9oi7n44oS1KGQY2cutIrulSVDJcw";
const API_KEY    = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxuES51WybE5hNT-OYm0isO7zhDM2ElEC9mb1lBZyF764F5dX-75_WFTI5069sERAqa/exec";
const BASE_URL   = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;
const APP_URL    = "https://mastergymcanelli.vercel.app";

/* ─────────────────────────────────────────────
   TEMPLATE SCHEDE
   Modificabili dallo Sheet — qui sono i default
   ───────────────────────────────────────────── */
const TEMPLATES = [
  {
    id: "BASE1",
    nome: "Base 1 — Full Body",
    obiettivo: "Tonificazione generale",
    descrizione: "3 giorni · Principiante · Full Body",
    colore: "#10B981",
    esercizi: [
      { giorno: "Giorno 1 - Full Body A", ordine: 1, gruppo_muscolare: "Gambe",   esercizio: "Squat con bilanciere",      serie: "3", ripetizioni: "10-12", peso_suggerito: "40",  riposo_sec: "90",  note: "Schiena dritta, scendi a 90°" },
      { giorno: "Giorno 1 - Full Body A", ordine: 2, gruppo_muscolare: "Petto",   esercizio: "Panca piana manubri",        serie: "3", ripetizioni: "10-12", peso_suggerito: "14",  riposo_sec: "90",  note: "" },
      { giorno: "Giorno 1 - Full Body A", ordine: 3, gruppo_muscolare: "Schiena", esercizio: "Lat machine presa larga",   serie: "3", ripetizioni: "10-12", peso_suggerito: "40",  riposo_sec: "90",  note: "Tira al petto" },
      { giorno: "Giorno 1 - Full Body A", ordine: 4, gruppo_muscolare: "Spalle",  esercizio: "Shoulder press manubri",    serie: "3", ripetizioni: "12",    peso_suggerito: "10",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 1 - Full Body A", ordine: 5, gruppo_muscolare: "Cardio",  esercizio: "Tapis roulant",             serie: "1", ripetizioni: "20 min",peso_suggerito: "",    riposo_sec: "0",   note: "Passo sostenuto" },
      { giorno: "Giorno 2 - Full Body B", ordine: 1, gruppo_muscolare: "Gambe",   esercizio: "Leg press",                 serie: "3", ripetizioni: "12",    peso_suggerito: "80",  riposo_sec: "90",  note: "" },
      { giorno: "Giorno 2 - Full Body B", ordine: 2, gruppo_muscolare: "Petto",   esercizio: "Croci ai cavi bassi",       serie: "3", ripetizioni: "12-15", peso_suggerito: "10",  riposo_sec: "60",  note: "Squeeze al centro" },
      { giorno: "Giorno 2 - Full Body B", ordine: 3, gruppo_muscolare: "Schiena", esercizio: "Rematore con manubrio",     serie: "3", ripetizioni: "10-12", peso_suggerito: "18",  riposo_sec: "60",  note: "Un braccio per volta" },
      { giorno: "Giorno 2 - Full Body B", ordine: 4, gruppo_muscolare: "Bicipiti",esercizio: "Curl bilanciere EZ",        serie: "3", ripetizioni: "12",    peso_suggerito: "20",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 2 - Full Body B", ordine: 5, gruppo_muscolare: "Cardio",  esercizio: "Tapis roulant",             serie: "1", ripetizioni: "20 min",peso_suggerito: "",    riposo_sec: "0",   note: "" },
      { giorno: "Giorno 3 - Full Body C", ordine: 1, gruppo_muscolare: "Gambe",   esercizio: "Affondi con manubri",       serie: "3", ripetizioni: "10 per gamba", peso_suggerito: "12", riposo_sec: "90", note: "" },
      { giorno: "Giorno 3 - Full Body C", ordine: 2, gruppo_muscolare: "Spalle",  esercizio: "Alzate laterali",           serie: "3", ripetizioni: "15",    peso_suggerito: "6",   riposo_sec: "60",  note: "Gomiti morbidi" },
      { giorno: "Giorno 3 - Full Body C", ordine: 3, gruppo_muscolare: "Tricipiti",esercizio: "Push down ai cavi",        serie: "3", ripetizioni: "12-15", peso_suggerito: "15",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 3 - Full Body C", ordine: 4, gruppo_muscolare: "Addome",  esercizio: "Plank",                     serie: "3", ripetizioni: "30-45 sec", peso_suggerito: "", riposo_sec: "45", note: "Core contratto" },
      { giorno: "Giorno 3 - Full Body C", ordine: 5, gruppo_muscolare: "Cardio",  esercizio: "Cyclette",                  serie: "1", ripetizioni: "20 min",peso_suggerito: "",    riposo_sec: "0",   note: "" },
    ],
  },
  {
    id: "BASE2",
    nome: "Base 2 — Upper/Lower",
    obiettivo: "Ipertrofia",
    descrizione: "4 giorni · Intermedio · Upper/Lower split",
    colore: "#6366F1",
    esercizi: [
      { giorno: "Giorno 1 - Upper A",  ordine: 1, gruppo_muscolare: "Petto",    esercizio: "Panca piana bilanciere",    serie: "4", ripetizioni: "8-10",  peso_suggerito: "70",  riposo_sec: "120", note: "Scapole addotte" },
      { giorno: "Giorno 1 - Upper A",  ordine: 2, gruppo_muscolare: "Schiena",  esercizio: "Trazioni alla sbarra",      serie: "4", ripetizioni: "6-8",   peso_suggerito: "corpo", riposo_sec: "120", note: "Presa prona" },
      { giorno: "Giorno 1 - Upper A",  ordine: 3, gruppo_muscolare: "Spalle",   esercizio: "Military press bilanciere", serie: "3", ripetizioni: "8-10",  peso_suggerito: "40",  riposo_sec: "90",  note: "" },
      { giorno: "Giorno 1 - Upper A",  ordine: 4, gruppo_muscolare: "Bicipiti", esercizio: "Curl bilanciere",           serie: "3", ripetizioni: "10",    peso_suggerito: "25",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 1 - Upper A",  ordine: 5, gruppo_muscolare: "Tricipiti",esercizio: "French press bilanciere",  serie: "3", ripetizioni: "10-12", peso_suggerito: "20",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 2 - Lower A",  ordine: 1, gruppo_muscolare: "Gambe",    esercizio: "Squat bilanciere",          serie: "4", ripetizioni: "8-10",  peso_suggerito: "80",  riposo_sec: "120", note: "Full depth" },
      { giorno: "Giorno 2 - Lower A",  ordine: 2, gruppo_muscolare: "Gambe",    esercizio: "Romanian deadlift",         serie: "3", ripetizioni: "10",    peso_suggerito: "60",  riposo_sec: "90",  note: "Schiena neutra" },
      { giorno: "Giorno 2 - Lower A",  ordine: 3, gruppo_muscolare: "Gambe",    esercizio: "Leg curl",                  serie: "3", ripetizioni: "12",    peso_suggerito: "30",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 2 - Lower A",  ordine: 4, gruppo_muscolare: "Polpacci", esercizio: "Calf raise in piedi",       serie: "4", ripetizioni: "15",    peso_suggerito: "50",  riposo_sec: "45",  note: "" },
      { giorno: "Giorno 2 - Lower A",  ordine: 5, gruppo_muscolare: "Addome",   esercizio: "Crunch al cavo",            serie: "3", ripetizioni: "15",    peso_suggerito: "15",  riposo_sec: "45",  note: "" },
      { giorno: "Giorno 3 - Upper B",  ordine: 1, gruppo_muscolare: "Petto",    esercizio: "Panca inclinata manubri",   serie: "4", ripetizioni: "8-10",  peso_suggerito: "22",  riposo_sec: "90",  note: "30° inclinazione" },
      { giorno: "Giorno 3 - Upper B",  ordine: 2, gruppo_muscolare: "Schiena",  esercizio: "Rematore bilanciere",       serie: "4", ripetizioni: "8-10",  peso_suggerito: "60",  riposo_sec: "90",  note: "" },
      { giorno: "Giorno 3 - Upper B",  ordine: 3, gruppo_muscolare: "Spalle",   esercizio: "Alzate laterali manubri",   serie: "3", ripetizioni: "12-15", peso_suggerito: "8",   riposo_sec: "60",  note: "" },
      { giorno: "Giorno 3 - Upper B",  ordine: 4, gruppo_muscolare: "Bicipiti", esercizio: "Curl manubri alternati",    serie: "3", ripetizioni: "10",    peso_suggerito: "12",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 3 - Upper B",  ordine: 5, gruppo_muscolare: "Tricipiti",esercizio: "Dips alle parallele",      serie: "3", ripetizioni: "8-12",  peso_suggerito: "corpo", riposo_sec: "60", note: "" },
      { giorno: "Giorno 4 - Lower B",  ordine: 1, gruppo_muscolare: "Gambe",    esercizio: "Leg press",                 serie: "4", ripetizioni: "10-12", peso_suggerito: "120", riposo_sec: "90",  note: "" },
      { giorno: "Giorno 4 - Lower B",  ordine: 2, gruppo_muscolare: "Gambe",    esercizio: "Affondi bulgari",           serie: "3", ripetizioni: "10 per gamba", peso_suggerito: "16", riposo_sec: "90", note: "" },
      { giorno: "Giorno 4 - Lower B",  ordine: 3, gruppo_muscolare: "Gambe",    esercizio: "Leg extension",             serie: "3", ripetizioni: "12-15", peso_suggerito: "40",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 4 - Lower B",  ordine: 4, gruppo_muscolare: "Polpacci", esercizio: "Calf raise seduto",         serie: "3", ripetizioni: "20",    peso_suggerito: "30",  riposo_sec: "45",  note: "" },
      { giorno: "Giorno 4 - Lower B",  ordine: 5, gruppo_muscolare: "Cardio",   esercizio: "Tapis roulant",             serie: "1", ripetizioni: "15 min",peso_suggerito: "",    riposo_sec: "0",   note: "" },
    ],
  },
  {
    id: "BASE3",
    nome: "Base 3 — Push/Pull/Legs",
    obiettivo: "Forza e massa",
    descrizione: "3 giorni · Avanzato · PPL split",
    colore: "#EF4444",
    esercizi: [
      { giorno: "Giorno 1 - Push",     ordine: 1, gruppo_muscolare: "Petto",    esercizio: "Panca piana bilanciere",    serie: "5", ripetizioni: "5",     peso_suggerito: "90",  riposo_sec: "180", note: "Movimento esplosivo" },
      { giorno: "Giorno 1 - Push",     ordine: 2, gruppo_muscolare: "Petto",    esercizio: "Panca inclinata bilanciere",serie: "4", ripetizioni: "6-8",   peso_suggerito: "70",  riposo_sec: "120", note: "" },
      { giorno: "Giorno 1 - Push",     ordine: 3, gruppo_muscolare: "Spalle",   esercizio: "Military press",            serie: "4", ripetizioni: "6-8",   peso_suggerito: "50",  riposo_sec: "120", note: "" },
      { giorno: "Giorno 1 - Push",     ordine: 4, gruppo_muscolare: "Spalle",   esercizio: "Alzate laterali",           serie: "3", ripetizioni: "12-15", peso_suggerito: "10",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 1 - Push",     ordine: 5, gruppo_muscolare: "Tricipiti",esercizio: "Push down cavo",            serie: "3", ripetizioni: "12",    peso_suggerito: "20",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 2 - Pull",     ordine: 1, gruppo_muscolare: "Schiena",  esercizio: "Stacco da terra",           serie: "5", ripetizioni: "5",     peso_suggerito: "120", riposo_sec: "180", note: "Il re degli esercizi" },
      { giorno: "Giorno 2 - Pull",     ordine: 2, gruppo_muscolare: "Schiena",  esercizio: "Trazioni sbarra",           serie: "4", ripetizioni: "6-8",   peso_suggerito: "corpo", riposo_sec: "120", note: "" },
      { giorno: "Giorno 2 - Pull",     ordine: 3, gruppo_muscolare: "Schiena",  esercizio: "Rematore bilanciere",       serie: "4", ripetizioni: "8",     peso_suggerito: "70",  riposo_sec: "90",  note: "" },
      { giorno: "Giorno 2 - Pull",     ordine: 4, gruppo_muscolare: "Bicipiti", esercizio: "Curl bilanciere",           serie: "3", ripetizioni: "8-10",  peso_suggerito: "30",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 2 - Pull",     ordine: 5, gruppo_muscolare: "Bicipiti", esercizio: "Curl martello",             serie: "3", ripetizioni: "10",    peso_suggerito: "14",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 3 - Legs",     ordine: 1, gruppo_muscolare: "Gambe",    esercizio: "Squat bilanciere",          serie: "5", ripetizioni: "5",     peso_suggerito: "100", riposo_sec: "180", note: "Profondità completa" },
      { giorno: "Giorno 3 - Legs",     ordine: 2, gruppo_muscolare: "Gambe",    esercizio: "Leg press",                 serie: "4", ripetizioni: "8-10",  peso_suggerito: "160", riposo_sec: "120", note: "" },
      { giorno: "Giorno 3 - Legs",     ordine: 3, gruppo_muscolare: "Gambe",    esercizio: "Romanian deadlift",         serie: "3", ripetizioni: "10",    peso_suggerito: "70",  riposo_sec: "90",  note: "" },
      { giorno: "Giorno 3 - Legs",     ordine: 4, gruppo_muscolare: "Gambe",    esercizio: "Leg curl",                  serie: "3", ripetizioni: "12",    peso_suggerito: "40",  riposo_sec: "60",  note: "" },
      { giorno: "Giorno 3 - Legs",     ordine: 5, gruppo_muscolare: "Polpacci", esercizio: "Calf raise",                serie: "4", ripetizioni: "15-20", peso_suggerito: "60",  riposo_sec: "45",  note: "" },
    ],
  },
];

/* ─────────────────────────────────────────────
   DATA FETCHING
   ───────────────────────────────────────────── */
async function fetchSheet(tabName) {
  const url = `${BASE_URL}/${encodeURIComponent(tabName)}?key=${API_KEY}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Errore ${res.status} sul foglio "${tabName}"`);
  const json = await res.json();
  const [headers, ...rows] = json.values || [];
  if (!headers) return [];
  return rows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""])));
}

async function fetchAllData() {
  const [configRows, clienti, schede, esercizi] = await Promise.all([
    fetchSheet("config"), fetchSheet("clienti"), fetchSheet("schede"), fetchSheet("esercizi"),
  ]);
  const config = Object.fromEntries(configRows.map(r => [r.chiave, r.valore]));
  return { config, clienti, schede, esercizi };
}

async function writeViaScript(action, payload) {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error(`Errore scrittura: ${res.status}`);
  return res.json();
}

/* ─────────────────────────────────────────────
   UTILS
   ───────────────────────────────────────────── */
const fmt = (d) => {
  if (!d) return "—";
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const daysUntil = (d) => {
  if (!d) return 999;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

const genSchedaId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  return `SCHEDA-${ts}`;
};

/* ─────────────────────────────────────────────
   THEME
   ───────────────────────────────────────────── */
const T = {
  bg:           "#F4F4F6",
  card:         "#FFFFFF",
  border:       "#E5E5EB",
  text:         "#111827",
  textSec:      "#6B7280",
  textMut:      "#9CA3AF",
  primary:      "#FF6B00",
  primaryLight: "#FFF3EB",
  primaryBorder:"#FFD4B0",
  danger:       "#EF4444",
  dangerLight:  "#FEF2F2",
  success:      "#10B981",
  successLight: "#ECFDF5",
  warning:      "#F59E0B",
  warningLight: "#FFFBEB",
  sidebar:      "#18181B",
  sidebarBorder:"#27272A",
};

/* ─────────────────────────────────────────────
   SIDEBAR
   ───────────────────────────────────────────── */
function Sidebar({ active, onNavigate, config }) {
  const items = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "clienti",   icon: Users,           label: "Clienti"   },
    { id: "esercizi",  icon: Dumbbell,        label: "Esercizi"  },
  ];
  return (
    <div style={{
      width: 232, minHeight: "100vh", background: T.sidebar,
      display: "flex", flexDirection: "column", flexShrink: 0,
      borderRight: `1px solid ${T.sidebarBorder}`,
    }}>
      <div style={{ padding: "22px 18px 18px", borderBottom: `1px solid ${T.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9, background: T.primary,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Dumbbell size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>
              {config?.nome_palestra || "GymBoard"}
            </div>
            <div style={{ color: "#71717A", fontSize: 10, marginTop: 2 }}>Pannello Admin</div>
          </div>
        </div>
      </div>
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {items.map(({ id, icon: Icon, label }) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => onNavigate(id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer",
              marginBottom: 3,
              background: on ? T.primary : "transparent",
              color:      on ? "#fff"    : "#A1A1AA",
              fontWeight: on ? 700       : 500,
              fontSize: 13.5, transition: "all 0.15s",
            }}>
              <Icon size={17} strokeWidth={on ? 2.5 : 1.8} />
              {label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.sidebarBorder}` }}>
        <div style={{ color: "#52525B", fontSize: 10 }}>GymBoard v4 · by Marta</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
   ───────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{
      background: T.card, borderRadius: 14, padding: "20px 22px",
      border: `1px solid ${T.border}`, flex: "1 1 160px",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={19} color={color} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: T.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: T.textSec, marginTop: 5 }}>{label}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAV CARD (per dashboard)
   ───────────────────────────────────────────── */
function NavCard({ icon: Icon, label, sub, color, bg, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: "28px 30px", cursor: "pointer", textAlign: "left",
      flex: "1 1 220px", transition: "all 0.15s",
      display: "flex", alignItems: "center", gap: 20,
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: bg, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={26} color={color} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{label}</div>
        <div style={{ fontSize: 13, color: T.textSec, marginTop: 4 }}>{sub}</div>
      </div>
      <ChevronRight size={20} color={T.textMut} style={{ marginLeft: "auto" }} />
    </button>
  );
}

/* ─────────────────────────────────────────────
   BADGE
   ───────────────────────────────────────────── */
function Badge({ color, bg, children }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
      color, background: bg, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

/* ─────────────────────────────────────────────
   WHATSAPP MODAL
   ───────────────────────────────────────────── */
function WAModal({ cliente, onClose }) {
  const [copied, setCopied] = useState(false);
  const msg = `🏋️ *Master Gym — La tua scheda!*

Ciao ${cliente.nome}! Da oggi puoi vedere la tua scheda dal telefono.

📲 *Link:* ${APP_URL}
🔑 Codice: *${cliente.codice}*
🔒 PIN: *${cliente.pin}*

━━━━━━━━━━━━━━━
💡 Per averla come app: apri il link con Safari (iPhone) o Chrome (Android) → Aggiungi alla schermata Home.

Buon allenamento! 💪`;

  const waUrl = cliente.telefono
    ? `https://wa.me/${cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`
    : null;

  const copy = () => {
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Overlay>
      <ModalBox maxWidth={500}>
        <ModalHeader title={`Messaggio per ${cliente.nome}`} icon={<MessageCircle size={19} color="#25D366" />} onClose={onClose} />
        <div style={{ padding: "18px 22px", overflow: "auto", flex: 1 }}>
          <pre style={{
            background: T.bg, borderRadius: 10, padding: 16, fontSize: 13,
            lineHeight: 1.65, color: "#333", whiteSpace: "pre-wrap", fontFamily: "inherit",
          }}>{msg}</pre>
        </div>
        <ModalFooter>
          <BtnSecondary onClick={copy}>{copied ? "✅ Copiato!" : "📋 Copia"}</BtnSecondary>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noreferrer" style={{
              padding: "9px 18px", borderRadius: 9, border: "none",
              background: "#25D366", color: "#fff", textDecoration: "none",
              fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
            }}>
              <Send size={14} /> Apri WhatsApp
            </a>
          )}
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────
   CONFIRM MODAL
   ───────────────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <Overlay zIndex={1100}>
      <ModalBox maxWidth={380}>
        <div style={{ padding: 28 }}>
          <AlertCircle size={32} color={T.danger} style={{ marginBottom: 14 }} />
          <p style={{ fontSize: 15, color: T.text, marginBottom: 22, lineHeight: 1.5 }}>{message}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <BtnSecondary onClick={onCancel}>Annulla</BtnSecondary>
            <button onClick={onConfirm} disabled={loading} style={{
              padding: "9px 18px", borderRadius: 9, border: "none",
              background: T.danger, color: "#fff", cursor: "pointer",
              fontSize: 13, fontWeight: 700, opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "..." : "Elimina"}
            </button>
          </div>
        </div>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────
   TEMPLATE MODAL — scelta + personalizzazione
   ───────────────────────────────────────────── */
function TemplateModal({ cliente, onClose, onSaved }) {
  const [step, setStep]     = useState("pick"); // "pick" | "edit"
  const [tpl,  setTpl]      = useState(null);
  const [saving, setSaving] = useState(false);

  // Dati scheda personalizzabili
  const today = new Date().toISOString().split("T")[0];
  const in2m  = new Date(Date.now() + 60 * 24 * 3600000).toISOString().split("T")[0];
  const [info, setInfo] = useState({ nome_scheda: "", obiettivo: "", data_inizio: today, data_scadenza: in2m, note_trainer: "" });

  // Esercizi modificabili (copia locale del template)
  const [exs, setExs] = useState([]);

  const pickTemplate = (t) => {
    setTpl(t);
    setInfo(prev => ({ ...prev, nome_scheda: t.nome, obiettivo: t.obiettivo }));
    setExs(t.esercizi.map((e, i) => ({ ...e, _id: i })));
    setStep("edit");
  };

  const updateEx = (id, field, value) => {
    setExs(prev => prev.map(e => e._id === id ? { ...e, [field]: value } : e));
  };

  const removeEx = (id) => {
    setExs(prev => prev.filter(e => e._id !== id));
  };

  const handleSave = async () => {
    if (!info.nome_scheda) { alert("Inserisci il nome della scheda"); return; }
    setSaving(true);
    try {
      const schedaId = genSchedaId();
      await writeViaScript("creaSchedaDaTemplate", {
        cliente_codice:    cliente.codice,
        scheda_attiva_old: cliente.scheda_attiva,
        scheda: {
          scheda_id:     schedaId,
          nome_scheda:   info.nome_scheda,
          obiettivo:     info.obiettivo,
          data_creazione: info.data_inizio,
          data_scadenza:  info.data_scadenza,
          note_trainer:   info.note_trainer,
        },
        esercizi: exs.map(({ _id, ...e }) => ({ ...e, scheda_id: schedaId })),
      });
      await onSaved();
      onClose();
    } catch (err) {
      alert("Errore salvataggio: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay zIndex={1200}>
      <ModalBox maxWidth={820} maxHeight="90vh">
        <ModalHeader
          title={step === "pick" ? "Scegli un template" : `Personalizza: ${tpl?.nome}`}
          onClose={onClose}
          left={step === "edit" && (
            <button onClick={() => setStep("pick")} style={{
              background: "none", border: "none", cursor: "pointer",
              color: T.primary, fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <ArrowLeft size={14} /> Scegli altro
            </button>
          )}
        />

        <div style={{ overflow: "auto", flex: 1, padding: "20px 24px" }}>
          {/* STEP 1 — SCELTA TEMPLATE */}
          {step === "pick" && (
            <div>
              <p style={{ fontSize: 13.5, color: T.textSec, marginBottom: 20 }}>
                Scegli il template base da assegnare a <b style={{ color: T.text }}>{cliente.nome} {cliente.cognome}</b>.
                Potrai modificare tutti gli esercizi prima di salvare.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => pickTemplate(t)} style={{
                    background: T.card, border: `2px solid ${T.border}`, borderRadius: 14,
                    padding: "20px 22px", cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.colore; e.currentTarget.style.boxShadow = `0 4px 20px ${t.colore}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, background: t.colore + "22", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Dumbbell size={22} color={t.colore} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{t.nome}</div>
                      <div style={{ fontSize: 13, color: T.textSec, marginTop: 3 }}>{t.descrizione}</div>
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: t.colore,
                      background: t.colore + "15", padding: "4px 12px", borderRadius: 8,
                    }}>{t.esercizi.length} esercizi</div>
                    <ChevronRight size={18} color={T.textMut} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — PERSONALIZZAZIONE */}
          {step === "edit" && (
            <div>
              {/* Info scheda */}
              <div style={{
                background: T.bg, borderRadius: 12, padding: "18px 20px", marginBottom: 22,
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.textSec, letterSpacing: "0.5px", marginBottom: 14 }}>
                  INFO SCHEDA
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <Field label="Nome scheda *">
                    <Input value={info.nome_scheda} onChange={v => setInfo(p => ({ ...p, nome_scheda: v }))} placeholder="Es: Massa Marco Rossi" />
                  </Field>
                  <Field label="Obiettivo">
                    <Input value={info.obiettivo} onChange={v => setInfo(p => ({ ...p, obiettivo: v }))} placeholder="Es: Ipertrofia" />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <Field label="Data inizio">
                    <Input type="date" value={info.data_inizio} onChange={v => setInfo(p => ({ ...p, data_inizio: v }))} />
                  </Field>
                  <Field label="Data scadenza">
                    <Input type="date" value={info.data_scadenza} onChange={v => setInfo(p => ({ ...p, data_scadenza: v }))} />
                  </Field>
                  <Field label="Note trainer">
                    <Input value={info.note_trainer} onChange={v => setInfo(p => ({ ...p, note_trainer: v }))} placeholder="Note generali..." />
                  </Field>
                </div>
              </div>

              {/* Esercizi per giorno */}
              {[...new Set(exs.map(e => e.giorno))].map(giorno => (
                <div key={giorno} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 800, color: tpl.colore,
                    letterSpacing: "0.5px", marginBottom: 8, textTransform: "uppercase",
                  }}>{giorno}</div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                    {exs.filter(e => e.giorno === giorno).map((ex, ri) => {
                      const dayExs = exs.filter(e => e.giorno === giorno);
                      return (
                        <div key={ex._id} style={{
                          display: "grid", gridTemplateColumns: "28px 2fr 60px 70px 70px 60px 1fr 32px",
                          gap: 8, padding: "10px 14px", alignItems: "center",
                          borderBottom: ri < dayExs.length - 1 ? `1px solid ${T.border}` : "none",
                          background: ri % 2 === 0 ? "#fff" : T.bg + "88",
                        }}>
                          <span style={{ fontSize: 11, color: T.textMut, fontWeight: 700 }}>{ex.ordine}</span>
                          <InlineInput value={ex.esercizio}       onChange={v => updateEx(ex._id, "esercizio", v)}       placeholder="Esercizio" bold />
                          <InlineInput value={ex.serie}           onChange={v => updateEx(ex._id, "serie", v)}           placeholder="Serie" center />
                          <InlineInput value={ex.ripetizioni}     onChange={v => updateEx(ex._id, "ripetizioni", v)}     placeholder="Reps" center />
                          <InlineInput value={ex.peso_suggerito}  onChange={v => updateEx(ex._id, "peso_suggerito", v)}  placeholder="Kg" center />
                          <InlineInput value={ex.riposo_sec}      onChange={v => updateEx(ex._id, "riposo_sec", v)}      placeholder="Sec" center />
                          <InlineInput value={ex.note}            onChange={v => updateEx(ex._id, "note", v)}            placeholder="Note..." />
                          <button onClick={() => removeEx(ex._id)} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: T.danger, padding: 4, borderRadius: 6,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <p style={{ fontSize: 12, color: T.textMut, marginTop: 8 }}>
                💡 Modifica direttamente i campi. Clicca × per rimuovere un esercizio.
              </p>
            </div>
          )}
        </div>

        {step === "edit" && (
          <ModalFooter>
            <BtnSecondary onClick={onClose}>Annulla</BtnSecondary>
            <button onClick={handleSave} disabled={saving} style={{
              padding: "10px 24px", borderRadius: 9, border: "none",
              background: T.primary, color: "#fff", cursor: "pointer",
              fontSize: 13.5, fontWeight: 700, opacity: saving ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {saving
                ? <><Loader size={15} /> Salvataggio...</>
                : <><Save size={15} /> Salva e assegna a {cliente.nome}</>}
            </button>
          </ModalFooter>
        )}
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────
   EDIT ESERCIZIO MODAL
   ───────────────────────────────────────────── */
function EditEsercizioModal({ esercizio, onClose, onSaved }) {
  const [form, setForm] = useState({ ...esercizio });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.esercizio) { alert("Inserisci il nome dell'esercizio"); return; }
    setSaving(true);
    try {
      await writeViaScript("updateEsercizio", { esercizio: form });
      await onSaved();
      onClose();
    } catch (err) {
      alert("Errore: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay zIndex={1100}>
      <ModalBox maxWidth={560}>
        <ModalHeader title="Modifica esercizio" onClose={onClose} />
        <div style={{ padding: "20px 24px", overflow: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Nome esercizio *">
              <Input value={form.esercizio || ""} onChange={v => setForm(p => ({ ...p, esercizio: v }))} placeholder="Es: Panca piana" />
            </Field>
            <Field label="Gruppo muscolare">
              <Input value={form.gruppo_muscolare || form.muscolo || ""} onChange={v => setForm(p => ({ ...p, gruppo_muscolare: v }))} placeholder="Es: Petto" />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[["serie","Serie"],["ripetizioni","Reps"],["peso_suggerito","Peso (kg)"],["riposo_sec","Riposo (s)"]].map(([f,l]) => (
              <Field key={f} label={l}>
                <Input value={form[f] || ""} onChange={v => setForm(p => ({ ...p, [f]: v }))} placeholder="—" />
              </Field>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Note trainer">
              <Input value={form.note || ""} onChange={v => setForm(p => ({ ...p, note: v }))} placeholder="Note..." />
            </Field>
            <Field label="Video URL">
              <Input value={form.video_url || ""} onChange={v => setForm(p => ({ ...p, video_url: v }))} placeholder="https://youtube.com/..." />
            </Field>
          </div>
        </div>
        <ModalFooter>
          <BtnSecondary onClick={onClose}>Annulla</BtnSecondary>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "9px 22px", borderRadius: 9, border: "none",
            background: T.primary, color: "#fff", cursor: saving ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1,
            display: "flex", alignItems: "center", gap: 7,
          }}>
            {saving ? <><Loader size={14} /> Salvo...</> : <><Save size={14} /> Salva</>}
          </button>
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────
   MODAL HELPERS
   ───────────────────────────────────────────── */
function Overlay({ children, zIndex = 1000 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>{children}</div>
  );
}

function ModalBox({ children, maxWidth = 500, maxHeight = "82vh" }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 18, width: "100%", maxWidth,
      maxHeight, overflow: "hidden", display: "flex", flexDirection: "column",
      boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
    }}>{children}</div>
  );
}

function ModalHeader({ title, icon, onClose, left }) {
  return (
    <div style={{
      padding: "18px 22px", borderBottom: `1px solid ${T.border}`,
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {left}
        {icon}
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{title}</span>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}>
        <X size={19} />
      </button>
    </div>
  );
}

function ModalFooter({ children }) {
  return (
    <div style={{
      padding: "14px 22px", borderTop: `1px solid ${T.border}`,
      display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0,
    }}>{children}</div>
  );
}

function BtnSecondary({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 18px", borderRadius: 9, border: `1px solid ${T.border}`,
      background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.text,
    }}>{children}</button>
  );
}

/* ─────────────────────────────────────────────
   FORM HELPERS
   ───────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5, letterSpacing: "0.4px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px",
        fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%",
      }}
    />
  );
}

function InlineInput({ value, onChange, placeholder, bold, center }) {
  return (
    <input
      value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        border: `1px solid transparent`, borderRadius: 6, padding: "5px 7px",
        fontSize: 12.5, color: T.text, outline: "none", background: "transparent",
        width: "100%", fontWeight: bold ? 700 : 400,
        textAlign: center ? "center" : "left",
        transition: "border-color 0.15s, background 0.15s",
      }}
      onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.background = "#fff"; }}
      onBlur={e  => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
    />
  );
}

/* ─────────────────────────────────────────────
   ACTION BTN
   ───────────────────────────────────────────── */
function ActionBtn({ icon: Icon, label, onClick, color, bg }) {
  return (
    <button onClick={onClick} title={label} style={{
      display: "flex", alignItems: "center", gap: 5, padding: "6px 11px",
      borderRadius: 8, border: `1px solid ${T.border}`, background: bg || T.card,
      cursor: "pointer", fontSize: 12, fontWeight: 600, color,
    }}>
      <Icon size={13} /> {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   EMPTY STATE
   ───────────────────────────────────────────── */
function EmptyState({ icon: Icon, msg }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", color: T.textSec }}>
      <Icon size={32} color={T.textMut} style={{ marginBottom: 10 }} />
      <p style={{ fontSize: 13.5, maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>{msg}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION BOX
   ───────────────────────────────────────────── */
function SectionBox({ title, icon, badge, action, children }) {
  return (
    <div style={{
      background: T.card, borderRadius: 14, border: `1px solid ${T.border}`,
      overflow: "hidden", marginBottom: 18,
    }}>
      <div style={{
        padding: "15px 20px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 17 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text, flex: 1 }}>{title}</span>
        {badge && (
          <span style={{
            fontSize: 11.5, fontWeight: 700, padding: "2px 8px",
            borderRadius: 5, background: T.bg, color: T.textSec,
          }}>{badge}</span>
        )}
        {action}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ESERCIZI TABLE
   ───────────────────────────────────────────── */
function EserciziTable({ esercizi }) {
  if (!esercizi.length) return <p style={{ fontSize: 13, color: T.textSec }}>Nessun esercizio.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["#","Esercizio","Serie","Reps","Peso","Riposo","Muscolo"].map(h => (
              <th key={h} style={{ padding: "8px 10px", fontSize: 11, fontWeight: 700, color: T.textMut, textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {esercizi.map((ex, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.border}44` }}>
              <td style={{ padding: "9px 10px", color: T.textMut, width: 28 }}>{ex.ordine || i + 1}</td>
              <td style={{ padding: "9px 10px", fontWeight: 600, color: T.text }}>{ex.esercizio}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.serie || "—"}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.ripetizioni || "—"}</td>
              <td style={{ padding: "9px 10px", color: T.primary, fontWeight: 600 }}>{ex.peso_suggerito ? `${ex.peso_suggerito} kg` : "—"}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.riposo_sec ? `${ex.riposo_sec}s` : ex.recupero || "—"}</td>
              <td style={{ padding: "9px 10px", color: T.textSec }}>{ex.gruppo_muscolare || ex.muscolo || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD VIEW
   ───────────────────────────────────────────── */
function DashboardView({ data, onNavigate }) {
  const { clienti, schede, esercizi } = data;
  const stats = useMemo(() => {
    const inScadenza = clienti.filter(c => {
      const s = schede.find(sc => sc.scheda_id === c.scheda_attiva);
      const d = daysUntil(s?.data_scadenza);
      return d <= 7 && d > 0;
    }).length;
    return { totClienti: clienti.length, inScadenza, schedeAttive: schede.length, totEsercizi: esercizi.length };
  }, [clienti, schede, esercizi]);

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13.5, color: T.textSec }}>Panoramica della palestra</p>
      </div>

      {/* 4 STAT CARDS */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard icon={Users}       label="Clienti attivi"    value={stats.totClienti}   color={T.primary} bg={T.primaryLight} />
        <StatCard icon={AlertCircle} label="Schede in scadenza" value={stats.inScadenza}  color={T.danger}  bg={T.dangerLight} />
        <StatCard icon={BookOpen}    label="Schede create"     value={stats.schedeAttive}  color="#6366F1"   bg="#EEF2FF" />
        <StatCard icon={Dumbbell}    label="Esercizi totali"   value={stats.totEsercizi}   color={T.success} bg={T.successLight} />
      </div>

      {/* 2 NAV CARDS */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <NavCard
          icon={Users} label="Clienti" color={T.primary} bg={T.primaryLight}
          sub={`${stats.totClienti} clienti registrati`}
          onClick={() => onNavigate("clienti")}
        />
        <NavCard
          icon={Dumbbell} label="Esercizi" color={T.success} bg={T.successLight}
          sub={`${stats.totEsercizi} esercizi in libreria`}
          onClick={() => onNavigate("esercizi")}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CLIENTI VIEW
   ───────────────────────────────────────────── */
function ClientiView({ data, onSelectCliente }) {
  const [search, setSearch] = useState("");
  const { clienti, schede } = data;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return clienti;
    return clienti.filter(c => `${c.nome} ${c.cognome} ${c.codice}`.toLowerCase().includes(q));
  }, [clienti, search]);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Clienti</h1>
        <p style={{ fontSize: 13.5, color: T.textSec }}>{clienti.length} clienti registrati</p>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 11,
        padding: "10px 16px", marginBottom: 20,
      }}>
        <Search size={17} color={T.textMut} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per nome, cognome o codice..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: T.text, background: "transparent" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}><X size={15} /></button>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map(c => {
          const scheda   = schede.find(s => s.scheda_id === c.scheda_attiva);
          const days     = daysUntil(scheda?.data_scadenza);
          const expired  = days <= 0 && scheda;
          const expiring = days > 0 && days <= 7;
          return (
            <button key={c.codice} onClick={() => onSelectCliente(c)} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: "18px 20px", cursor: "pointer", textAlign: "left", transition: "box-shadow 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12, background: T.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: T.primary, flexShrink: 0,
                }}>{c.nome?.[0]}{c.cognome?.[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{c.nome} {c.cognome}</div>
                  <div style={{ fontSize: 11.5, color: T.textMut, fontWeight: 600 }}>{c.codice}</div>
                </div>
                {expiring && <Badge color={T.warning} bg={T.warningLight}>{days}g</Badge>}
                {expired  && <Badge color={T.danger}  bg={T.dangerLight}>Scaduta</Badge>}
              </div>
              <div style={{
                background: T.bg, borderRadius: 9, padding: "10px 12px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{scheda?.nome_scheda || "Nessuna scheda"}</div>
                  {scheda && <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>Scade: {fmt(scheda.data_scadenza)}</div>}
                </div>
                {scheda && <CheckCircle size={16} color={expired ? T.danger : T.success} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CLIENTE DETAIL
   ───────────────────────────────────────────── */
function ClienteDetail({ cliente, data, onBack, onWhatsApp, onRefresh }) {
  const { schede, esercizi } = data;

  const schedaAttiva = schede.find(s => s.scheda_id === cliente.scheda_attiva);
  const schedePassate = useMemo(() => {
    if (!cliente.schede_passate) return [];
    return cliente.schede_passate.split(",").map(id => id.trim()).filter(Boolean)
      .map(id => schede.find(s => s.scheda_id === id)).filter(Boolean);
  }, [cliente.schede_passate, schede]);

  const exForScheda = (id) => esercizi.filter(e => e.scheda_id === id).sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));

  const [openGiorni,  setOpenGiorni]  = useState({});
  const [openPassate, setOpenPassate] = useState({});
  const [showTemplate, setShowTemplate] = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [delLoading,  setDelLoading]  = useState(false);

  const toggleGiorno  = g  => setOpenGiorni(p  => ({ ...p, [g]:  !p[g]  }));
  const togglePassata = id => setOpenPassate(p => ({ ...p, [id]: !p[id] }));

  const handleDeletePassata = async () => {
    setDelLoading(true);
    try {
      await writeViaScript("deleteSchedaPassata", { codiceCliente: cliente.codice, schedaId: confirmDel });
      await onRefresh();
      setConfirmDel(null);
    } catch (err) { alert("Errore: " + err.message); }
    finally { setDelLoading(false); }
  };

  const days = daysUntil(schedaAttiva?.data_scadenza);

  return (
    <div>
      {confirmDel && (
        <ConfirmModal
          message={`Eliminare la scheda "${schede.find(s => s.scheda_id === confirmDel)?.nome_scheda}"?`}
          onConfirm={handleDeletePassata} onCancel={() => setConfirmDel(null)} loading={delLoading}
        />
      )}
      {showTemplate && (
        <TemplateModal
          cliente={cliente}
          onClose={() => setShowTemplate(false)}
          onSaved={onRefresh}
        />
      )}

      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
        cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0,
      }}>
        <ArrowLeft size={16} /> Torna alla lista
      </button>

      {/* Header */}
      <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: "22px 24px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 13, background: T.primaryLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 19, fontWeight: 800, color: T.primary, flexShrink: 0,
          }}>{cliente.nome?.[0]}{cliente.cognome?.[0]}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: 0 }}>{cliente.nome} {cliente.cognome}</h2>
            <div style={{ fontSize: 12.5, color: T.textSec, marginTop: 3 }}>
              Codice: <b style={{ color: T.text }}>{cliente.codice}</b> · PIN: <b style={{ color: T.text }}>{cliente.pin}</b>
            </div>
          </div>
          <button onClick={() => onWhatsApp(cliente)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff",
            border: "none", borderRadius: 9, padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700,
          }}>
            <Send size={14} /> WhatsApp
          </button>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {cliente.telefono && <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Phone size={13} color={T.textSec} /><span style={{ fontSize: 13, color: T.textSec }}>{cliente.telefono}</span></div>}
          {cliente.data_iscrizione && <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Calendar size={13} color={T.textSec} /><span style={{ fontSize: 13, color: T.textSec }}>Iscritto: {fmt(cliente.data_iscrizione)}</span></div>}
        </div>
      </div>

      {/* BOX 1: SCHEDA ATTIVA */}
      <SectionBox
        title="Scheda attiva" icon="🟢"
        action={
          <button onClick={() => setShowTemplate(true)} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: T.primary, color: "#fff", border: "none",
            borderRadius: 9, padding: "8px 16px", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
          }}>
            <Zap size={14} /> Nuova scheda da template
          </button>
        }
      >
        {schedaAttiva ? (
          <div>
            <div style={{
              background: T.bg, borderRadius: 10, padding: "13px 16px", marginBottom: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{schedaAttiva.nome_scheda}</div>
                <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>
                  {schedaAttiva.obiettivo} · {fmt(schedaAttiva.data_creazione)} → {fmt(schedaAttiva.data_scadenza)}
                </div>
              </div>
              {days <= 7 && (
                <Badge color={days > 0 ? T.warning : T.danger} bg={days > 0 ? T.warningLight : T.dangerLight}>
                  {days > 0 ? `Scade tra ${days} giorni` : "Scaduta"}
                </Badge>
              )}
            </div>
            {[...new Set(exForScheda(schedaAttiva.scheda_id).map(e => e.giorno || e.seduta))].filter(Boolean).map(g => {
              const dayEx = exForScheda(schedaAttiva.scheda_id).filter(e => (e.giorno || e.seduta) === g);
              const open  = openGiorni[g];
              return (
                <div key={g} style={{ border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                  <button onClick={() => toggleGiorno(g)} style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "11px 14px", background: T.bg, border: "none", cursor: "pointer",
                  }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: T.primary }}>{g}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11.5, color: T.textMut }}>{dayEx.length} esercizi</span>
                      {open ? <ChevronUp size={15} color={T.textMut} /> : <ChevronDown size={15} color={T.textMut} />}
                    </div>
                  </button>
                  {open && <div style={{ padding: "10px 14px" }}><EserciziTable esercizi={dayEx} /></div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <EmptyState icon={BookOpen} msg="Nessuna scheda attiva. Clicca 'Nuova scheda da template' per crearne una." />
          </div>
        )}
      </SectionBox>

      {/* BOX 2: SCHEDE PASSATE */}
      <SectionBox title="Schede passate" icon="🔘" badge={schedePassate.length > 0 ? `${schedePassate.length}` : undefined}>
        {schedePassate.length === 0 ? (
          <EmptyState icon={History} msg="Nessuna scheda passata." />
        ) : (
          schedePassate.map(s => (
            <div key={s.scheda_id} style={{ border: `1px solid ${T.border}`, borderRadius: 11, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: T.bg }}>
                <button onClick={() => togglePassata(s.scheda_id)} style={{
                  display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", flex: 1, textAlign: "left",
                }}>
                  {openPassate[s.scheda_id] ? <ChevronUp size={16} color={T.textMut} /> : <ChevronDown size={16} color={T.textMut} />}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{s.nome_scheda}</div>
                    <div style={{ fontSize: 11.5, color: T.textSec }}>{s.obiettivo} · {fmt(s.data_creazione)} → {fmt(s.data_scadenza)}</div>
                  </div>
                </button>
                <div style={{ display: "flex", gap: 6 }}>
                  <ActionBtn icon={Eye}    label="Vedi"     onClick={() => togglePassata(s.scheda_id)} color={T.textSec} />
                  <ActionBtn icon={Edit3}  label="Modifica" onClick={() => alert(`Apri Google Sheet e modifica la scheda ${s.scheda_id}`)} color="#6366F1" bg="#EEF2FF" />
                  <ActionBtn icon={Trash2} label="Elimina"  onClick={() => setConfirmDel(s.scheda_id)} color={T.danger}  bg={T.dangerLight} />
                </div>
              </div>
              {openPassate[s.scheda_id] && (
                <div style={{ padding: "14px 16px" }}><EserciziTable esercizi={exForScheda(s.scheda_id)} /></div>
              )}
            </div>
          ))
        )}
      </SectionBox>

      {/* BOX 3: PROGRESSI */}
      <SectionBox title="Progressi" icon="📈">
        <EmptyState icon={Activity} msg="I progressi vengono salvati localmente nell'app del cliente." />
      </SectionBox>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ESERCIZI VIEW
   ───────────────────────────────────────────── */
function EserciziView({ data, onRefresh }) {
  const { esercizi, schede } = data;
  const [search,       setSearch]       = useState("");
  const [filterScheda, setFilterScheda] = useState("all");
  const [showForm,     setShowForm]     = useState(false);
  const [editEx,       setEditEx]       = useState(null);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [delLoading,   setDelLoading]   = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [form, setForm] = useState({
    scheda_id: "", giorno: "", ordine: "", gruppo_muscolare: "",
    esercizio: "", serie: "", ripetizioni: "", peso_suggerito: "",
    riposo_sec: "", note: "", video_url: "",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return esercizi.filter(e => {
      const ms = !q || `${e.esercizio} ${e.gruppo_muscolare || e.muscolo}`.toLowerCase().includes(q);
      const msc = filterScheda === "all" || e.scheda_id === filterScheda;
      return ms && msc;
    });
  }, [esercizi, search, filterScheda]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(e => {
      const k = e.gruppo_muscolare || e.muscolo || "Altro";
      if (!g[k]) g[k] = [];
      g[k].push(e);
    });
    return g;
  }, [filtered]);

  const handleAdd = async () => {
    if (!form.esercizio) { alert("Inserisci il nome dell'esercizio"); return; }
    setSaving(true);
    try {
      await writeViaScript("addEsercizio", { esercizio: form });
      await onRefresh();
      setShowForm(false);
      setForm({ scheda_id: "", giorno: "", ordine: "", gruppo_muscolare: "", esercizio: "", serie: "", ripetizioni: "", peso_suggerito: "", riposo_sec: "", note: "", video_url: "" });
    } catch (err) { alert("Errore: " + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await writeViaScript("deleteEsercizio", { esercizio: confirmDel });
      await onRefresh();
      setConfirmDel(null);
    } catch (err) { alert("Errore: " + err.message); }
    finally { setDelLoading(false); }
  };

  return (
    <div>
      {confirmDel && (
        <ConfirmModal
          message={`Eliminare l'esercizio "${confirmDel.esercizio}"?`}
          onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} loading={delLoading}
        />
      )}
      {editEx && (
        <EditEsercizioModal esercizio={editEx} onClose={() => setEditEx(null)} onSaved={onRefresh} />
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Esercizi</h1>
          <p style={{ fontSize: 13.5, color: T.textSec }}>{esercizi.length} esercizi in libreria</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{
          display: "flex", alignItems: "center", gap: 7, background: T.primary, color: "#fff",
          border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13.5, fontWeight: 700,
        }}>
          <Plus size={17} /> Aggiungi esercizio
        </button>
      </div>

      {/* FORM AGGIUNTA */}
      {showForm && (
        <div style={{
          background: T.card, border: `1px solid ${T.primaryBorder}`, borderRadius: 14,
          padding: "22px 24px", marginBottom: 22, boxShadow: "0 4px 20px rgba(255,107,0,0.08)",
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 18 }}>➕ Nuovo esercizio</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="SCHEDA (opzionale)">
              <select value={form.scheda_id} onChange={e => setForm(p => ({ ...p, scheda_id: e.target.value }))}
                style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }}>
                <option value="">Nessuna scheda (libero)</option>
                {schede.map(s => <option key={s.scheda_id} value={s.scheda_id}>{s.scheda_id} — {s.nome_scheda}</option>)}
              </select>
            </Field>
            <Field label="GIORNO/SEDUTA">
              <Input value={form.giorno} onChange={v => setForm(p => ({ ...p, giorno: v }))} placeholder="Es: Giorno 1 - Petto" />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 60px", gap: 12, marginBottom: 12 }}>
            <Field label="NOME ESERCIZIO *">
              <Input value={form.esercizio} onChange={v => setForm(p => ({ ...p, esercizio: v }))} placeholder="Es: Panca piana" />
            </Field>
            <Field label="MUSCOLO">
              <Input value={form.gruppo_muscolare} onChange={v => setForm(p => ({ ...p, gruppo_muscolare: v }))} placeholder="Es: Petto" />
            </Field>
            <Field label="ORDINE">
              <Input type="number" value={form.ordine} onChange={v => setForm(p => ({ ...p, ordine: v }))} placeholder="1" />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[["serie","SERIE","4"],["ripetizioni","REPS","8-10"],["peso_suggerito","PESO (kg)","80"],["riposo_sec","RIPOSO (s)","90"]].map(([f,l,ph]) => (
              <Field key={f} label={l}><Input value={form[f]} onChange={v => setForm(p => ({ ...p, [f]: v }))} placeholder={ph} /></Field>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <Field label="NOTE TRAINER"><Input value={form.note} onChange={v => setForm(p => ({ ...p, note: v }))} placeholder="Note tecniche..." /></Field>
            <Field label="VIDEO URL"><Input value={form.video_url} onChange={v => setForm(p => ({ ...p, video_url: v }))} placeholder="https://youtube.com/..." /></Field>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <BtnSecondary onClick={() => setShowForm(false)}>Annulla</BtnSecondary>
            <button onClick={handleAdd} disabled={saving} style={{
              padding: "9px 22px", borderRadius: 9, border: "none", background: T.primary,
              color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 7,
            }}>
              {saving ? <><Loader size={14} /> Salvo...</> : <><Plus size={14} /> Salva</>}
            </button>
          </div>
        </div>
      )}

      {/* FILTRI */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200,
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px",
        }}>
          <Search size={16} color={T.textMut} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca esercizio..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: T.text, background: "transparent" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}><X size={14} /></button>}
        </div>
        <select value={filterScheda} onChange={e => setFilterScheda(e.target.value)}
          style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: T.text, background: T.card, outline: "none", cursor: "pointer" }}>
          <option value="all">Tutte le schede</option>
          {schede.map(s => <option key={s.scheda_id} value={s.scheda_id}>{s.scheda_id} — {s.nome_scheda}</option>)}
        </select>
      </div>

      {/* LIBRERIA */}
      {Object.entries(grouped).length === 0 ? (
        <EmptyState icon={Dumbbell} msg="Nessun esercizio trovato." />
      ) : (
        Object.entries(grouped).map(([muscolo, exs]) => (
          <div key={muscolo} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.primary, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
              {muscolo}
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              {exs.map((ex, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                  borderBottom: i < exs.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: T.primaryLight, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: T.primary,
                  }}>{ex.ordine || i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{ex.esercizio}</div>
                    <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                      {[ex.serie && `${ex.serie} serie`, ex.ripetizioni && `${ex.ripetizioni} reps`, ex.peso_suggerito && `${ex.peso_suggerito}kg`].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    {ex.scheda_id && <span style={{ fontSize: 11, background: T.bg, color: T.textMut, padding: "3px 9px", borderRadius: 6, fontWeight: 600 }}>{ex.scheda_id}</span>}
                    {ex.video_url && <a href={ex.video_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 700, color: T.danger, background: T.dangerLight, padding: "3px 9px", borderRadius: 6, textDecoration: "none" }}>▶ Video</a>}
                    {ex.note && <span title={ex.note} style={{ cursor: "help", fontSize: 15 }}>📝</span>}
                    {/* MODIFICA */}
                    <button onClick={() => setEditEx(ex)} title="Modifica" style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "5px 10px",
                      borderRadius: 7, border: `1px solid ${T.border}`, background: "#EEF2FF",
                      cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#6366F1",
                    }}>
                      <Edit3 size={12} /> Modifica
                    </button>
                    {/* CANCELLA */}
                    <button onClick={() => setConfirmDel(ex)} title="Elimina" style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "5px 10px",
                      borderRadius: 7, border: `1px solid ${T.border}`, background: T.dangerLight,
                      cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.danger,
                    }}>
                      <Trash2 size={12} /> Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING / ERROR
   ───────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Dumbbell size={24} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>GymBoard Admin</div>
        <div style={{ fontSize: 13, color: T.textSec, marginTop: 2 }}>Caricamento dati...</div>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <AlertCircle size={44} color={T.danger} />
      <p style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Errore di connessione</p>
      <p style={{ fontSize: 13, color: T.textSec, maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>{error}</p>
      <button onClick={onRetry} style={{
        background: T.primary, border: "none", borderRadius: 10, padding: "11px 26px",
        color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <RefreshCw size={16} /> Riprova
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT
   ───────────────────────────────────────────── */
export default function AdminPanel() {
  const [data,            setData]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [page,            setPage]            = useState("dashboard");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [waCliente,       setWaCliente]       = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetchAllData()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen error={error} onRetry={loadData} />;

  const navigate = (p) => { setPage(p); setSelectedCliente(null); };
  const openCliente = (c) => { setSelectedCliente(c); setPage("clienteDetail"); };
  const sidebarActive = page === "clienteDetail" ? "clienti" : page;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Sora', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDD; border-radius: 3px; }
        button, input, select, textarea { font-family: inherit; }
        input::placeholder { color: #9CA3AF; }
      `}</style>

      <Sidebar active={sidebarActive} onNavigate={navigate} config={data.config} />

      <div style={{ flex: 1, padding: "32px 36px", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <button onClick={loadData} style={{
            display: "flex", alignItems: "center", gap: 7, background: T.card,
            border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 14px",
            cursor: "pointer", fontSize: 12.5, color: T.textSec, fontWeight: 600,
          }}>
            <RefreshCw size={14} /> Aggiorna dati
          </button>
        </div>

        {waCliente && <WAModal cliente={waCliente} onClose={() => setWaCliente(null)} />}

        {page === "dashboard"    && <DashboardView data={data} onNavigate={navigate} />}
        {page === "clienti"      && <ClientiView   data={data} onSelectCliente={openCliente} />}
        {page === "clienteDetail" && selectedCliente && (
          <ClienteDetail
            cliente={selectedCliente} data={data}
            onBack={() => navigate("clienti")}
            onWhatsApp={setWaCliente}
            onRefresh={loadData}
          />
        )}
        {page === "esercizi" && <EserciziView data={data} onRefresh={loadData} />}
      </div>
    </div>
  );
}
