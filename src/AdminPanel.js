import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Users, LayoutDashboard, Dumbbell, Search, ChevronRight, ArrowLeft,
  Phone, Calendar, AlertCircle, Send, X, Plus, Trash2, Edit3,
  RefreshCw, CheckCircle, MessageCircle, ChevronDown, ChevronUp,
  Loader, History, Activity, BookOpen, Zap, Save, LogOut,
  ClipboardList, Printer, UserPlus, Eye, EyeOff, Lock, Settings, TrendingUp
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFIGURAZIONE
   ───────────────────────────────────────────── */
const SHEET_ID   = "144-i_O8EGeL51ku9oi7n44oS1KGQY2cutIrulSVDJcw";
const API_KEY    = "AIzaSyDEoQi1P3VVocd7Yokkw8by8PLWq-t1IV4";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFzrYPbupoWLKx3SslQZH7ZIToV_rf23iynPla5x09GvmG7oemtEd_O3qlraBuA9ic/exec";
const BASE_URL   = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;
const APP_URL    = "https://mastergymcanelli.vercel.app";

// Login credentials
const ADMIN_USER = "Mastergym";
const ADMIN_PASS = "1234";

/* ─────────────────────────────────────────────
   TEMPLATE SCHEDE
   ───────────────────────────────────────────── */
const TEMPLATES = [
  {
    id: "BASE1", nome: "Base 1 — Full Body", obiettivo: "Tonificazione generale",
    descrizione: "3 sedute · Principiante · Full Body", colore: "#10B981",
    sedute: ["Seduta 1 - Full Body A", "Seduta 2 - Full Body B", "Seduta 3 - Full Body C"],
    esercizi: [
      { seduta: "Seduta 1 - Full Body A", ordine: 1, muscolo: "Cardio",   esercizio: "Tappeto in salita",    ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 1 - Full Body A", ordine: 2, muscolo: "Gambe",    esercizio: "Pressa 45°",           ripetizioni: "12",    serie: "3", recupero: "60", note: "" },
      { seduta: "Seduta 1 - Full Body A", ordine: 3, muscolo: "Gambe",    esercizio: "Leg extension",        ripetizioni: "12-15", serie: "3", recupero: "60", note: "" },
      { seduta: "Seduta 1 - Full Body A", ordine: 4, muscolo: "Dorsali",  esercizio: "Lat machine",          ripetizioni: "10-12", serie: "3", recupero: "60", note: "Tira al petto" },
      { seduta: "Seduta 1 - Full Body A", ordine: 5, muscolo: "Cardio",   esercizio: "Ellittica",            ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
      { seduta: "Seduta 2 - Full Body B", ordine: 1, muscolo: "Cardio",   esercizio: "Bici",                 ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 2 - Full Body B", ordine: 2, muscolo: "Pettorali",esercizio: "Chest press",          ripetizioni: "10-12", serie: "3", recupero: "75", note: "" },
      { seduta: "Seduta 2 - Full Body B", ordine: 3, muscolo: "Spalle",   esercizio: "Alzate laterali",      ripetizioni: "12-15", serie: "3", recupero: "60", note: "Gomiti morbidi" },
      { seduta: "Seduta 2 - Full Body B", ordine: 4, muscolo: "Core",     esercizio: "Plank",                ripetizioni: "30s",   serie: "3", recupero: "45", note: "Core contratto" },
      { seduta: "Seduta 2 - Full Body B", ordine: 5, muscolo: "Cardio",   esercizio: "Step",                 ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
      { seduta: "Seduta 3 - Full Body C", ordine: 1, muscolo: "Spalle",   esercizio: "Rotatori spalle",      ripetizioni: "10",    serie: "3", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 3 - Full Body C", ordine: 2, muscolo: "Glutei",   esercizio: "Hip thrust",           ripetizioni: "12",    serie: "3", recupero: "60", note: "" },
      { seduta: "Seduta 3 - Full Body C", ordine: 3, muscolo: "Dorsali",  esercizio: "Pulley bassa triangolo",ripetizioni:"10-12", serie: "3", recupero: "60", note: "" },
      { seduta: "Seduta 3 - Full Body C", ordine: 4, muscolo: "Addome",   esercizio: "Crunch",               ripetizioni: "15",    serie: "3", recupero: "45", note: "" },
      { seduta: "Seduta 3 - Full Body C", ordine: 5, muscolo: "Cardio",   esercizio: "Tappeto in salita",    ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
    ],
  },
  {
    id: "BASE2", nome: "Base 2 — Upper/Lower", obiettivo: "Ipertrofia",
    descrizione: "4 sedute · Intermedio · Split Upper/Lower", colore: "#6366F1",
    sedute: ["Seduta 1 - Upper A", "Seduta 2 - Lower A", "Seduta 3 - Upper B", "Seduta 4 - Lower B"],
    esercizi: [
      { seduta: "Seduta 1 - Upper A", ordine: 1, muscolo: "Spalle",    esercizio: "Rotatori spalle",      ripetizioni: "10",   serie: "3", recupero: "0",   note: "Riscaldamento" },
      { seduta: "Seduta 1 - Upper A", ordine: 2, muscolo: "Pettorali", esercizio: "Panca piana bilanciere",ripetizioni: "8-10",serie: "4", recupero: "120", note: "Scapole addotte", peso_suggerito: "60" },
      { seduta: "Seduta 1 - Upper A", ordine: 3, muscolo: "Dorsali",   esercizio: "Lat machine",          ripetizioni: "8-10", serie: "4", recupero: "90",  note: "Petto verso la sbarra" },
      { seduta: "Seduta 1 - Upper A", ordine: 4, muscolo: "Bicipiti",  esercizio: "Curl bilanciere",      ripetizioni: "10",   serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 1 - Upper A", ordine: 5, muscolo: "Tricipiti", esercizio: "Pushdown corda",       ripetizioni: "12",   serie: "3", recupero: "60",  note: "Gomiti fissi" },
      { seduta: "Seduta 2 - Lower A", ordine: 1, muscolo: "Cardio",    esercizio: "Tappeto in salita",    ripetizioni: "5'",   serie: "1", recupero: "0",   note: "Riscaldamento" },
      { seduta: "Seduta 2 - Lower A", ordine: 2, muscolo: "Gambe",     esercizio: "Squat",                ripetizioni: "8-10", serie: "4", recupero: "120", note: "Full depth", peso_suggerito: "60" },
      { seduta: "Seduta 2 - Lower A", ordine: 3, muscolo: "Femorali",  esercizio: "Leg curl",             ripetizioni: "12",   serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 2 - Lower A", ordine: 4, muscolo: "Glutei",    esercizio: "Hip thrust",           ripetizioni: "12",   serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 2 - Lower A", ordine: 5, muscolo: "Addome",    esercizio: "Crunch inverso panchetta",ripetizioni:"15", serie: "3", recupero: "45",  note: "" },
      { seduta: "Seduta 3 - Upper B", ordine: 1, muscolo: "Spalle",    esercizio: "Rotatori spalle",      ripetizioni: "10",   serie: "3", recupero: "0",   note: "Riscaldamento" },
      { seduta: "Seduta 3 - Upper B", ordine: 2, muscolo: "Pettorali", esercizio: "Panca inclinata manubri",ripetizioni:"10",  serie: "4", recupero: "90",  note: "30° inclinazione" },
      { seduta: "Seduta 3 - Upper B", ordine: 3, muscolo: "Dorsali",   esercizio: "Rematore manubrio",    ripetizioni: "10",   serie: "4", recupero: "90",  note: "Un braccio per volta" },
      { seduta: "Seduta 3 - Upper B", ordine: 4, muscolo: "Spalle",    esercizio: "Alzate laterali",      ripetizioni: "12-15",serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 3 - Upper B", ordine: 5, muscolo: "Tricipiti", esercizio: "Dips panchetta",       ripetizioni: "12",   serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 4 - Lower B", ordine: 1, muscolo: "Cardio",    esercizio: "Bici",                 ripetizioni: "5'",   serie: "1", recupero: "0",   note: "Riscaldamento" },
      { seduta: "Seduta 4 - Lower B", ordine: 2, muscolo: "Gambe",     esercizio: "Pressa 45°",           ripetizioni: "10-12",serie: "4", recupero: "90",  note: "" },
      { seduta: "Seduta 4 - Lower B", ordine: 3, muscolo: "Gambe",     esercizio: "Affondi alternati",    ripetizioni: "10",   serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 4 - Lower B", ordine: 4, muscolo: "Gambe",     esercizio: "Adductor+Abductor",    ripetizioni: "15+15",serie: "3", recupero: "45",  note: "" },
      { seduta: "Seduta 4 - Lower B", ordine: 5, muscolo: "Cardio",    esercizio: "Ellittica",            ripetizioni: "10'",  serie: "1", recupero: "0",   note: "Defaticamento" },
    ],
  },
  {
    id: "BASE3", nome: "Base 3 — Circuit Training", obiettivo: "Dimagrimento",
    descrizione: "3 sedute · Intermedio · Circuito cardio+forza", colore: "#EF4444",
    sedute: ["Seduta 1 - Circuit A", "Seduta 2 - Circuit B", "Seduta 3 - Circuit C"],
    esercizi: [
      { seduta: "Seduta 1 - Circuit A", ordine: 1, muscolo: "Cardio",    esercizio: "Tappeto in salita",      ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 1 - Circuit A", ordine: 2, muscolo: "Full body",  esercizio: "Burpees",                ripetizioni: "10",    serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 1 - Circuit A", ordine: 3, muscolo: "Gambe",      esercizio: "Squat+Salto",            ripetizioni: "15",    serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 1 - Circuit A", ordine: 4, muscolo: "Core",       esercizio: "Mountain climber",       ripetizioni: "20",    serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 1 - Circuit A", ordine: 5, muscolo: "Cardio",     esercizio: "Ellittica",              ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
      { seduta: "Seduta 2 - Circuit B", ordine: 1, muscolo: "Cardio",     esercizio: "Bici",                   ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 2 - Circuit B", ordine: 2, muscolo: "Gambe",      esercizio: "Pressa 45°",             ripetizioni: "15",    serie: "4", recupero: "45", note: "Full ROM" },
      { seduta: "Seduta 2 - Circuit B", ordine: 3, muscolo: "Femorali",   esercizio: "Leg curl",               ripetizioni: "15",    serie: "3", recupero: "45", note: "" },
      { seduta: "Seduta 2 - Circuit B", ordine: 4, muscolo: "Gambe",      esercizio: "Adductor+Abductor",      ripetizioni: "15+15", serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 2 - Circuit B", ordine: 5, muscolo: "Cardio",     esercizio: "Step",                   ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
      { seduta: "Seduta 3 - Circuit C", ordine: 1, muscolo: "Spalle",     esercizio: "Rotatori spalle",        ripetizioni: "10",    serie: "3", recupero: "0",  note: "Riscaldamento" },
      { seduta: "Seduta 3 - Circuit C", ordine: 2, muscolo: "Pettorali",  esercizio: "Chest press+Croci cavi", ripetizioni: "10+10", serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 3 - Circuit C", ordine: 3, muscolo: "Dorsali",    esercizio: "Lat tb+Curl cavo basso", ripetizioni: "10+12", serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 3 - Circuit C", ordine: 4, muscolo: "Core",       esercizio: "Plank+Crunch",           ripetizioni: "30s+15",serie: "3", recupero: "30", note: "" },
      { seduta: "Seduta 3 - Circuit C", ordine: 5, muscolo: "Cardio",     esercizio: "Tappeto in salita",      ripetizioni: "10'",   serie: "1", recupero: "0",  note: "Defaticamento" },
    ],
  },
  {
    id: "BASE4", nome: "Base 4 — Forza", obiettivo: "Forza e massa",
    descrizione: "3 sedute · Avanzato · Push/Pull/Legs", colore: "#F59E0B",
    sedute: ["Seduta 1 - Push", "Seduta 2 - Pull", "Seduta 3 - Legs"],
    esercizi: [
      { seduta: "Seduta 1 - Push",  ordine: 1, muscolo: "Pettorali", esercizio: "Panca piana bilanciere",  ripetizioni: "5",     serie: "5", recupero: "180", note: "Movimento esplosivo", peso_suggerito: "80" },
      { seduta: "Seduta 1 - Push",  ordine: 2, muscolo: "Pettorali", esercizio: "Panca inclinata manubri", ripetizioni: "6-8",   serie: "4", recupero: "120", note: "" },
      { seduta: "Seduta 1 - Push",  ordine: 3, muscolo: "Spalle",    esercizio: "Lento avanti manubri",    ripetizioni: "8-10",  serie: "4", recupero: "90",  note: "" },
      { seduta: "Seduta 1 - Push",  ordine: 4, muscolo: "Spalle",    esercizio: "Alzate laterali",         ripetizioni: "12-15", serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 1 - Push",  ordine: 5, muscolo: "Tricipiti", esercizio: "Pushdown corda",          ripetizioni: "12",    serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 2 - Pull",  ordine: 1, muscolo: "Dorsali",   esercizio: "Trazioni easypower",      ripetizioni: "6-8",   serie: "4", recupero: "120", note: "" },
      { seduta: "Seduta 2 - Pull",  ordine: 2, muscolo: "Dorsali",   esercizio: "Rematore manubrio",       ripetizioni: "8",     serie: "4", recupero: "90",  note: "" },
      { seduta: "Seduta 2 - Pull",  ordine: 3, muscolo: "Dorsali",   esercizio: "Pulley bassa triangolo",  ripetizioni: "10",    serie: "3", recupero: "75",  note: "" },
      { seduta: "Seduta 2 - Pull",  ordine: 4, muscolo: "Bicipiti",  esercizio: "Curl bilanciere",         ripetizioni: "8-10",  serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 2 - Pull",  ordine: 5, muscolo: "Bicipiti",  esercizio: "Curl alternato manubri",  ripetizioni: "10",    serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 3 - Legs",  ordine: 1, muscolo: "Cardio",    esercizio: "Tappeto in salita",       ripetizioni: "5'",    serie: "1", recupero: "0",   note: "Riscaldamento" },
      { seduta: "Seduta 3 - Legs",  ordine: 2, muscolo: "Gambe",     esercizio: "Squat",                   ripetizioni: "5",     serie: "5", recupero: "180", note: "Profondità completa", peso_suggerito: "80" },
      { seduta: "Seduta 3 - Legs",  ordine: 3, muscolo: "Gambe",     esercizio: "Pressa 45°",              ripetizioni: "8-10",  serie: "4", recupero: "120", note: "" },
      { seduta: "Seduta 3 - Legs",  ordine: 4, muscolo: "Femorali",  esercizio: "Leg curl",                ripetizioni: "12",    serie: "3", recupero: "60",  note: "" },
      { seduta: "Seduta 3 - Legs",  ordine: 5, muscolo: "Glutei",    esercizio: "Hip thrust",              ripetizioni: "12",    serie: "3", recupero: "60",  note: "" },
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
  const [configRows, clienti, schede, esercizi, libreria] = await Promise.all([
    fetchSheet("config"), fetchSheet("clienti"), fetchSheet("schede"),
    fetchSheet("esercizi"), fetchSheet("libreria_esercizi"),
  ]);
  let servizi = [];
  try { servizi = await fetchSheet("servizi"); } catch(e) {}
  const config = Object.fromEntries(configRows.map(r => [r.chiave, r.valore]));
  return { config, clienti, schede, esercizi, libreria, servizi };
}

async function writeViaScript(action, payload) {
  const body = JSON.stringify({ action, ...payload });
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body,
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Errore scrittura: ${res.status}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { status: "ok" }; }
}

/* ─────────────────────────────────────────────
   UTILS
   ───────────────────────────────────────────── */
const fmt = (d) => {
  if (!d) return "—";
  const parts = d.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
};

const daysUntil = (d) => {
  if (!d) return 999;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

const genId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

const today = () => new Date().toISOString().split("T")[0];
const inMonths = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString().split("T")[0];
};

/* ─────────────────────────────────────────────
   THEME
   ───────────────────────────────────────────── */
const T = {
  bg: "#F4F4F6", card: "#FFFFFF", border: "#E5E5EB",
  text: "#111827", textSec: "#6B7280", textMut: "#9CA3AF",
  primary: "#FF6B00", primaryLight: "#FFF3EB", primaryBorder: "#FFD4B0",
  danger: "#EF4444", dangerLight: "#FEF2F2",
  success: "#10B981", successLight: "#ECFDF5",
  warning: "#F59E0B", warningLight: "#FFFBEB",
  sidebar: "#18181B", sidebarBorder: "#27272A",
/* ─────────────────────────────────────────────
   TOAST
   ───────────────────────────────────────────── */
function Toast({ message, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  const bg = type === "success" ? T.success : T.danger;
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, background: bg, color: "#fff", borderRadius: 12, padding: "14px 22px", fontSize: 14, fontWeight: 700, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10, animation: "slideUp 0.3s ease" }}>
      {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      {message}
    </div>
  );
}
function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });
  const ToastEl = toast ? <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} /> : null;
  return { showToast, ToastEl };
}

/* ─────────────────────────────────────────────
   MODAL HELPERS
function Overlay({ children, zIndex = 1000 }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {children}
    </div>
  );
}
function ModalBox({ children, maxWidth = 500, maxHeight = "82vh" }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth, maxHeight, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
      {children}
    </div>
  );
}
function ModalHeader({ title, icon, onClose, left }) {
  return (
    <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {left}{icon}
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{title}</span>
      </div>
      {onClose && <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}><X size={19} /></button>}
    </div>
  );
}
function ModalFooter({ children }) {
  return <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>{children}</div>;
}
function BtnPrimary({ onClick, children, disabled, loading }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: T.primary, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: (disabled || loading) ? 0.7 : 1, display: "flex", alignItems: "center", gap: 7 }}>
      {loading ? <><Loader size={14} /> Salvo...</> : children}
    </button>
  );
}
function BtnSecondary({ onClick, children }) {
  return <button onClick={onClick} style={{ padding: "9px 18px", borderRadius: 9, border: `1px solid ${T.border}`, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.text }}>{children}</button>;
}
function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5, letterSpacing: "0.4px" }}>{label}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }} />;
}
function Badge({ color, bg, children }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6, color, background: bg, whiteSpace: "nowrap" }}>{children}</span>;
}
function EmptyState({ icon: Icon, msg }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", color: T.textSec }}>
      <Icon size={32} color={T.textMut} style={{ marginBottom: 10 }} />
      <p style={{ fontSize: 13.5, maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>{msg}</p>
    </div>
  );
}
function SectionBox({ title, icon, badge, action, children }) {
  return (
    <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 18 }}>
      <div style={{ padding: "15px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 17 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text, flex: 1 }}>{title}</span>
        {badge && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: T.bg, color: T.textSec }}>{badge}</span>}
        {action}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <Overlay zIndex={1100}>
      <ModalBox maxWidth={380}>
        <div style={{ padding: 28 }}>
          <AlertCircle size={32} color={T.danger} style={{ marginBottom: 14 }} />
          <p style={{ fontSize: 15, color: T.text, marginBottom: 22, lineHeight: 1.5 }}>{message}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <BtnSecondary onClick={onCancel}>Annulla</BtnSecondary>
            <button onClick={onConfirm} disabled={loading} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: T.danger, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
              {loading ? "..." : "Elimina"}
            </button>
          </div>
        </div>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────
   LOGIN SCREEN
   ───────────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [user, setUser]   = useState("");
  const [pass, setPass]   = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      onLogin();
    } else {
      setError("Username o password errati");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.sidebar, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: T.card, borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Dumbbell size={28} color="#fff" strokeWidth={2.5} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>GymBoard Admin</div>
          <div style={{ fontSize: 13, color: T.textSec, marginTop: 4 }}>Accedi al pannello di gestione</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="USERNAME">
            <Input value={user} onChange={setUser} placeholder="Username" />
          </Field>
          <Field label="PASSWORD">
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Password"
              style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }}
            />
          </Field>
          {error && <p style={{ fontSize: 12, color: T.danger, textAlign: "center", margin: 0 }}>{error}</p>}
          <button onClick={handleLogin} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
            Accedi
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SIDEBAR
   ───────────────────────────────────────────── */
function Sidebar({ active, onNavigate, config, onLogout }) {
  const items = [
    { id: "dashboard",     icon: LayoutDashboard, label: "Dashboard"     },
    { id: "clienti",       icon: Users,           label: "Clienti"       },
    { id: "schede",        icon: ClipboardList,   label: "Schede"        },
    { id: "esercizi",      icon: Dumbbell,        label: "Esercizi"      },
    { id: "impostazioni",  icon: Settings,        label: "Palestra"      },
  ];
  return (
    <div style={{ width: 232, minHeight: "100vh", background: T.sidebar, display: "flex", flexDirection: "column", flexShrink: 0, borderRight: `1px solid ${T.sidebarBorder}` }}>
      <div style={{ padding: "22px 18px 18px", borderBottom: `1px solid ${T.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Dumbbell size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{config?.nome_palestra || "GymBoard"}</div>
            <div style={{ color: "#71717A", fontSize: 10, marginTop: 2 }}>Pannello Admin</div>
          </div>
        </div>
      </div>
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {items.map(({ id, icon: Icon, label }) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => onNavigate(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer", marginBottom: 3, background: on ? T.primary : "transparent", color: on ? "#fff" : "#A1A1AA", fontWeight: on ? 700 : 500, fontSize: 13.5, transition: "all 0.15s" }}>
              <Icon size={17} strokeWidth={on ? 2.5 : 1.8} />{label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${T.sidebarBorder}` }}>
        <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "#71717A", fontSize: 13.5, fontWeight: 500 }}>
          <LogOut size={17} strokeWidth={1.8} /> Esci
        </button>
        <div style={{ color: "#52525B", fontSize: 10, padding: "8px 14px 0" }}>GymBoard v5 · by Marta</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
   ───────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background: T.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${T.border}`, flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
   DASHBOARD VIEW — MODIFICATA
   ───────────────────────────────────────────── */
function DashboardView({ data, onNavigate, onSelectCliente }) {
  const { clienti, schede } = data;
  const [daGestireOpen, setDaGestireOpen] = useState(false);
  const [filtroGestire, setFiltroGestire] = useState("tutti");

  const getStato = (c) => {
    const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
    if (!scheda) return "nessuna";
    if (daysUntil(scheda.data_scadenza) <= 0) return "scaduta";
    return "ok";
  };

  const stats = useMemo(() => {
    const conScheda   = clienti.filter(c => getStato(c) === "ok").length;
    const inScadenza  = clienti.filter(c => {
      const s = schede.find(sc => sc.scheda_id === c.scheda_attiva);
      const d = daysUntil(s?.data_scadenza);
      return d <= 14 && d > 0;
    }).length;
    const scadute     = clienti.filter(c => getStato(c) === "scaduta").length;
    const senza       = clienti.filter(c => getStato(c) === "nessuna").length;
    return { totClienti: clienti.length, conScheda, inScadenza, scadute, senza };
  }, [clienti, schede]);

  // Clienti da gestire = senza scheda + scheda scaduta
  const daGestire = useMemo(() => {
    return clienti.filter(c => {
      const stato = getStato(c);
      return stato === "nessuna" || stato === "scaduta";
    }).sort((a, b) => {
      // Prima i con scheda scaduta, poi senza
      const sa = getStato(a);
      const sb = getStato(b);
      if (sa === "scaduta" && sb !== "scaduta") return -1;
      if (sb === "scaduta" && sa !== "scaduta") return 1;
      return String(a.cognome).localeCompare(String(b.cognome));
    });
  }, [clienti, schede]);

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13.5, color: T.textSec }}>Panoramica della palestra</p>
      </div>

      {/* STAT CARDS — solo 3 utili */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon={Users}       label="Clienti totali"      value={stats.totClienti}  color={T.primary} bg={T.primaryLight} />
        <StatCard icon={CheckCircle} label="Con scheda attiva"   value={stats.conScheda}   color={T.success} bg={T.successLight} />
        <StatCard icon={AlertCircle} label="Da gestire"          value={stats.daGestire?.length || (stats.scadute + stats.senza)} color={T.danger}  bg={T.dangerLight} />
      </div>

      {/* LISTA DA GESTIRE — collassabile */}
      {daGestire.length > 0 && (
        <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 20 }}>
          <button onClick={() => setDaGestireOpen(v => !v)} style={{ width: "100%", padding: "15px 20px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
            <AlertCircle size={17} color={T.danger} />
            <span style={{ fontSize: 15, fontWeight: 800, color: T.text, flex: 1 }}>Da gestire</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: T.dangerLight, color: T.danger, marginRight: 8 }}>{daGestire.length} clienti</span>
            {daGestireOpen ? <ChevronUp size={16} color={T.textMut} /> : <ChevronDown size={16} color={T.textMut} />}
          </button>
          {daGestireOpen && <div style={{ borderTop: `1px solid ${T.border}` }}>
            {/* FILTRI */}
            <div style={{ padding: "10px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8, background: T.bg }}>
              {[
                { id: "tutti",   label: `Tutti (${daGestire.length})` },
                { id: "scaduta", label: `⚠ Scaduta (${daGestire.filter(c => getStato(c) === "scaduta").length})`, color: T.danger,  bg: T.dangerLight },
                { id: "nessuna", label: `Senza scheda (${daGestire.filter(c => getStato(c) === "nessuna").length})`, color: T.warning, bg: T.warningLight },
              ].map(f => (
                <button key={f.id} onClick={() => setFiltroGestire(f.id)} style={{ padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: filtroGestire === f.id ? (f.bg || T.primaryLight) : "#fff", color: filtroGestire === f.id ? (f.color || T.primary) : T.textSec, boxShadow: filtroGestire === f.id ? `0 0 0 1.5px ${f.color || T.primary}` : `0 0 0 1px ${T.border}` }}>
                  {f.label}
                </button>
              ))}
            </div>
            {daGestire.filter(c => filtroGestire === "tutti" || getStato(c) === filtroGestire).map((c, i) => {
              const stato = getStato(c);
              const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
              return (
                <div key={c.codice} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < daGestire.length - 1 ? `1px solid ${T.border}` : "none", background: i % 2 === 0 ? "#fff" : T.bg }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: stato === "scaduta" ? T.dangerLight : T.warningLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: stato === "scaduta" ? T.danger : T.warning, flexShrink: 0 }}>
                    {c.nome?.[0]}{c.cognome?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>{c.cognome} {c.nome}</div>
                    <div style={{ fontSize: 11.5, color: T.textSec, marginTop: 1 }}>{c.codice}</div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                    color: stato === "scaduta" ? T.danger : T.warning,
                    background: stato === "scaduta" ? T.dangerLight : T.warningLight
                  }}>
                    {stato === "scaduta" ? "⚠ Scheda scaduta" : "Senza scheda"}
                  </span>
                  <button onClick={() => onSelectCliente(c)} style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.primaryLight, cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.primary, whiteSpace: "nowrap" }}>
                    Vai al cliente →
                  </button>
                </div>
              );
            })}
          </div>}
        </div>
      )}

      {daGestire.length === 0 && (
        <div style={{ background: T.successLight, border: `1px solid #A7F3D0`, borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <CheckCircle size={22} color={T.success} />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.success }}>Tutti i clienti hanno una scheda attiva! 🎉</span>
        </div>
      )}

      {/* NAVIGAZIONE RAPIDA */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <button onClick={() => onNavigate("clienti")} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 24px", cursor: "pointer", textAlign: "left", flex: "1 1 200px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={22} color={T.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Clienti</div>
            <div style={{ fontSize: 12.5, color: T.textSec, marginTop: 3 }}>{stats.totClienti} clienti registrati</div>
          </div>
          <ChevronRight size={18} color={T.textMut} />
        </button>
        <button onClick={() => onNavigate("schede")} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 24px", cursor: "pointer", textAlign: "left", flex: "1 1 200px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ClipboardList size={22} color="#6366F1" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Nuova scheda</div>
            <div style={{ fontSize: 12.5, color: T.textSec, marginTop: 3 }}>Crea da template</div>
          </div>
          <ChevronRight size={18} color={T.textMut} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WHATSAPP MODAL
   ───────────────────────────────────────────── */
function WAModal({ cliente, onClose }) {
  const [copied, setCopied] = useState(false);
  const msg = `🏋️ *${cliente.palestra || "Master Gym"} — La tua scheda!*\n\nCiao ${cliente.nome}! Da oggi puoi vedere la tua scheda dal telefono.\n\n📲 *Link:* ${APP_URL}\n🔑 Codice: *${cliente.codice}*\n🔒 PIN: *${cliente.pin}*\n\n━━━━━━━━━━━━━━━\n💡 Per averla come app: apri il link con Safari (iPhone) o Chrome (Android) → Aggiungi alla schermata Home.\n\nBuon allenamento! 💪`;
  const waUrl = cliente.telefono ? `https://wa.me/${cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}` : null;
  const copy = () => { navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <Overlay>
      <ModalBox maxWidth={500}>
        <ModalHeader title={`Messaggio per ${cliente.nome}`} icon={<MessageCircle size={19} color="#25D366" />} onClose={onClose} />
        <div style={{ padding: "18px 22px", overflow: "auto", flex: 1 }}>
          <pre style={{ background: T.bg, borderRadius: 10, padding: 16, fontSize: 13, lineHeight: 1.65, color: "#333", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{msg}</pre>
        </div>
        <ModalFooter>
          <BtnSecondary onClick={copy}>{copied ? "✅ Copiato!" : "📋 Copia"}</BtnSecondary>
          {waUrl && <a href={waUrl} target="_blank" rel="noreferrer" style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "#25D366", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><Send size={14} /> Apri WhatsApp</a>}
        </ModalFooter>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────
   CLIENTE FORM MODAL
   ───────────────────────────────────────────── */
function genCodiceCliente(clienti) {
  const nums = clienti.map(c => parseInt((c.codice || "").replace(/\D/g, ""))).filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `MG-${String(next).padStart(3, "0")}`;
}

function genPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function ClienteFormModal({ cliente, onClose, onSaved, clienti = [] }) {
  const isEdit = !!cliente;
  const [form, setForm] = useState(cliente || { codice: genCodiceCliente(clienti), nome: "", cognome: "", pin: genPin(), telefono: "", email: "", data_iscrizione: today(), scheda_attiva: "", schede_passate: "", obiettivo: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = async () => {
    if (!form.codice || !form.nome || !form.cognome) { alert("Codice, nome e cognome sono obbligatori"); return; }
    // Anti-duplicato solo per nuovi clienti
    if (!isEdit) {
      const dup = clienti.find(c =>
        c.nome.trim().toLowerCase() === form.nome.trim().toLowerCase() &&
        c.cognome.trim().toLowerCase() === form.cognome.trim().toLowerCase()
      );
      if (dup) { alert(`Attenzione: esiste già un cliente con nome "${form.nome} ${form.cognome}" (${dup.codice})`); return; }
    }
    setSaving(true);
    try {
      await writeViaScript(isEdit ? "updateCliente" : "addCliente", { cliente: form });
      await onSaved();
      onClose();
    } catch (err) { alert("Errore: " + err.message); }
    finally { setSaving(false); }
  };
  return (
    <Overlay>
      <ModalBox maxWidth={580}>
        <ModalHeader title={isEdit ? `Modifica ${form.nome} ${form.cognome}` : "Nuovo cliente"} onClose={onClose} />
        <div style={{ padding: "20px 24px", overflow: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="CODICE *"><Input value={form.codice} onChange={v => set("codice", v)} placeholder="Es: MG-006" /></Field>
            <Field label="PIN"><Input value={form.pin} onChange={v => set("pin", v)} placeholder="Es: 1234" /></Field>
            <Field label="DATA ISCRIZIONE"><Input type="date" value={form.data_iscrizione} onChange={v => set("data_iscrizione", v)} /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="NOME *"><Input value={form.nome} onChange={v => set("nome", v)} placeholder="Es: Marco" /></Field>
            <Field label="COGNOME *"><Input value={form.cognome} onChange={v => set("cognome", v)} placeholder="Es: Rossi" /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="TELEFONO"><Input value={form.telefono} onChange={v => set("telefono", v)} placeholder="+39 333 0000000" /></Field>
            <Field label="EMAIL"><Input value={form.email} onChange={v => set("email", v)} placeholder="email@esempio.com" /></Field>
          </div>
          <Field label="OBIETTIVO">
            <Input value={form.obiettivo} onChange={v => set("obiettivo", v)} placeholder="Es: Tonificazione" />
          </Field>
        </div>
        <ModalFooter>
          <BtnSecondary onClick={onClose}>Annulla</BtnSecondary>
          <BtnPrimary onClick={handleSave} loading={saving}><Save size={14} /> {isEdit ? "Salva modifiche" : "Aggiungi cliente"}</BtnPrimary>
        </ModalFooter>
      </ModalBox>
    </Overlay>
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
          <tr>{["#", "Esercizio", "Serie", "Reps", "Peso", "Rec.", "Muscolo"].map(h => <th key={h} style={{ padding: "8px 10px", fontSize: 11, fontWeight: 700, color: T.textMut, textAlign: "left" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {esercizi.map((ex, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.border}44` }}>
              <td style={{ padding: "9px 10px", color: T.textMut, width: 28 }}>{ex.ordine || i + 1}</td>
              <td style={{ padding: "9px 10px", fontWeight: 600, color: T.text }}>{ex.esercizio}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.serie || "—"}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.ripetizioni || "—"}</td>
              <td style={{ padding: "9px 10px", color: T.primary, fontWeight: 600 }}>{ex.peso_suggerito ? `${ex.peso_suggerito} kg` : "—"}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.recupero ? `${ex.recupero}s` : ex.riposo_sec ? `${ex.riposo_sec}s` : "—"}</td>
              <td style={{ padding: "9px 10px", color: T.textSec }}>{ex.muscolo || ex.gruppo_muscolare || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAMPA SCHEDA
   ───────────────────────────────────────────── */
function printScheda(scheda, esercizi, cliente) {
  const sedute = [...new Set(esercizi.map(e => e.seduta || e.giorno))].filter(Boolean).sort((a,b) => {
    const na = parseInt(a.match(/\d+/)?.[0] || 0);
    const nb = parseInt(b.match(/\d+/)?.[0] || 0);
    return na - nb;
  });
  const html = `
    <html><head><title>Scheda ${scheda.nome_scheda}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; padding: 24px 32px; color: #111; background: #fff; }
      .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 3px solid #FF6B00; margin-bottom: 20px; }
      .header-left { display: flex; align-items: center; gap: 14px; }
      .logo { width: 52px; height: 52px; border-radius: 10px; background: #FF6B00; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; font-weight: 900; }
      .palestra-nome { font-size: 18px; font-weight: 900; color: #111; }
      .palestra-sub { font-size: 11px; color: #888; margin-top: 2px; }
      .header-right { text-align: right; font-size: 11px; color: #888; line-height: 1.6; }
      .scheda-box { background: #FFF3EB; border-left: 4px solid #FF6B00; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
      .scheda-nome { font-size: 17px; font-weight: 900; color: #FF6B00; }
      .scheda-meta { font-size: 12px; color: #666; margin-top: 3px; }
      .scheda-date { font-size: 12px; color: #444; font-weight: 700; text-align: right; }
      .cliente-box { background: #f4f4f6; padding: 10px 14px; border-radius: 6px; margin-bottom: 18px; font-size: 13px; display: flex; align-items: center; gap: 10px; }
      .seduta { margin-bottom: 20px; page-break-inside: avoid; }
      .seduta-title { font-size: 13px; font-weight: 800; color: #fff; background: #FF6B00; padding: 7px 14px; border-radius: 6px; margin-bottom: 0; text-transform: uppercase; letter-spacing: 0.5px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #f4f4f6; padding: 7px 10px; text-align: left; font-weight: 700; color: #555; border-bottom: 2px solid #e5e5eb; font-size: 11px; text-transform: uppercase; }
      td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; }
      tr:last-child td { border-bottom: none; }
      tr:nth-child(even) td { background: #fafafa; }
      .num { color: #FF6B00; font-weight: 700; width: 28px; }
      .ex-name { font-weight: 700; }
      .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e5eb; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }
      @media print { body { padding: 10px 16px; } .header { margin-bottom: 14px; } }
    </style></head><body>
    <div class="header">
      <div class="header-left">
        <div class="logo">MG</div>
        <div>
          <div class="palestra-nome">ASD Master Gym</div>
          <div class="palestra-sub">Via Bussinello, 73 - Canelli (AT) · +39 366 399 1378</div>
        </div>
      </div>
      <div class="header-right">
        <div>@asd_palestra_mastergym</div>
        <div>mastergymcanelli.vercel.app</div>
      </div>
    </div>
    <div class="scheda-box">
      <div>
        <div class="scheda-nome">${scheda.nome_scheda}</div>
        <div class="scheda-meta">${scheda.obiettivo || ""}</div>
      </div>
      <div class="scheda-date">Dal ${fmt(scheda.data_creazione)}<br/>al ${fmt(scheda.data_scadenza)}</div>
    </div>
    ${cliente ? `<div class="cliente-box">👤 <b>${cliente.nome} ${cliente.cognome}</b> &nbsp;·&nbsp; Codice: <b>${cliente.codice}</b> &nbsp;·&nbsp; PIN: <b>${cliente.pin}</b></div>` : ""}
    ${sedute.map(s => {
      const exs = esercizi.filter(e => (e.seduta || e.giorno) === s).sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));
      return `<div class="seduta">
        <div class="seduta-title">${s}</div>
        <table><thead><tr><th>#</th><th>Esercizio</th><th>Serie</th><th>Reps</th><th>Peso</th><th>Rec.</th><th>Muscolo</th><th>Note</th></tr></thead>
        <tbody>${exs.map((ex, i) => `<tr>
          <td class="num">${ex.ordine || i + 1}</td>
          <td class="ex-name">${ex.esercizio}</td>
          <td>${ex.serie || "—"}</td>
          <td>${ex.ripetizioni || "—"}</td>
          <td>${ex.peso_suggerito ? ex.peso_suggerito + " kg" : "—"}</td>
          <td>${ex.recupero ? ex.recupero + "s" : "—"}</td>
          <td style="color:#888;font-size:11px">${ex.muscolo || "—"}</td>
          <td style="color:#666;font-size:11px">${ex.note || ""}</td>
        </tr>`).join("")}</tbody></table>
      </div>`;
    }).join("")}
    <div class="footer">
      <span>Scheda generata da GymBoard · ASD Master Gym</span>
      <span>Stampato il ${new Date().toLocaleDateString('it-IT')}</span>
    </div>
    </body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.print();
}

/* ─────────────────────────────────────────────
   CLIENTI VIEW
   ───────────────────────────────────────────── */
function ClientiView({ data, onSelectCliente, onRefresh }) {
  const [search, setSearch]           = useState("");
  const [filtro, setFiltro]           = useState("tutti");
  const [sortDir, setSortDir]         = useState('codice');
  const [showForm, setShowForm]       = useState(false);
  const [editCliente, setEditCliente] = useState(null);
  const [confirmDel, setConfirmDel]   = useState(null);
  const [delLoading, setDelLoading]   = useState(false);
  const { clienti, schede } = data;

  const getStato = (c) => {
    const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
    if (!scheda) return "nessuna";
    if (daysUntil(scheda.data_scadenza) <= 0) return "scaduta";
    return "ok";
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = clienti.filter(c => {
      const ms = !q || `${c.nome} ${c.cognome} ${c.codice}`.toLowerCase().includes(q);
      const stato = getStato(c);
      const mf = filtro === "tutti" ? true : filtro === "nessuna" ? stato === "nessuna" : filtro === "scaduta" ? stato === "scaduta" : stato === "ok";
      return ms && mf;
    });
    return list.sort((a, b) => {
      if (sortDir === 'codice') return String(a.codice).localeCompare(String(b.codice), undefined, {numeric: true});
      if (sortDir === 'cognome') return String(a.cognome).localeCompare(String(b.cognome));
      return String(b.cognome).localeCompare(String(a.cognome));
    });
  }, [clienti, schede, search, filtro, sortDir]);

  const scadute = clienti.filter(c => getStato(c) === "scaduta").length;
  const senza   = clienti.filter(c => getStato(c) === "nessuna").length;

  const handleDelete = async () => {
    setDelLoading(true);
    try { await writeViaScript("deleteCliente", { codice: confirmDel }); await onRefresh(); setConfirmDel(null); }
    catch (err) { alert("Errore: " + err.message); }
    finally { setDelLoading(false); }
  };

  const btnFiltro = (id, label, color, bg) => (
    <button onClick={() => setFiltro(id)} style={{ padding: "5px 14px", borderRadius: 20, border: filtro === id ? "none" : `1px solid ${T.border}`, background: filtro === id ? (color || T.primary) : (bg || "#fff"), color: filtro === id ? "#fff" : T.textSec, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {label}
    </button>
  );

  return (
    <div>
      {confirmDel && <ConfirmModal message="Eliminare questo cliente?" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} loading={delLoading} />}
      {(showForm || editCliente) && <ClienteFormModal cliente={editCliente} clienti={clienti} onClose={() => { setShowForm(false); setEditCliente(null); }} onSaved={onRefresh} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Clienti</h1>
          <p style={{ fontSize: 13.5, color: T.textSec }}>{clienti.length} clienti registrati</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>
          <UserPlus size={17} /> Aggiungi cliente
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 14px" }}>
          <Search size={15} color={T.textMut} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca per nome, cognome o codice..." style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: T.text, background: "transparent" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}><X size={13} /></button>}
        </div>
        {btnFiltro("tutti", "Tutti")}
        {btnFiltro("ok", "Con scheda", T.success)}
        {btnFiltro("nessuna", `Senza scheda (${senza})`, T.warning)}
        {btnFiltro("scaduta", `⚠ Scadute (${scadute})`, T.danger)}
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 90px 2fr 110px 60px", padding: "8px 16px", background: T.bg, borderBottom: `1px solid ${T.border}` }}>
          <button onClick={() => setSortDir(d => d === 'cognome' ? 'cognome-rev' : 'cognome')} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: sortDir.startsWith('cognome') ? T.primary : T.textSec, padding: 0, textAlign: "left" }}>
            CLIENTE {sortDir === 'cognome' ? '↑' : sortDir === 'cognome-rev' ? '↓' : ''}
          </button>
          <button onClick={() => setSortDir('codice')} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: sortDir === 'codice' ? T.primary : T.textSec, padding: 0 }}>
            CODICE {sortDir === 'codice' ? '↑' : ''}
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>SCHEDA ATTIVA</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>SCADENZA</span>
          <span></span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "32px 0", textAlign: "center", color: T.textSec, fontSize: 13 }}>Nessun cliente trovato</div>
        )}

        {filtered.map((c, i) => {
          const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
          const stato = getStato(c);
          const days = daysUntil(scheda?.data_scadenza);
          const rowBg = stato === "scaduta" ? "#FEF2F2" : stato === "nessuna" ? "#FFFBEB" : i % 2 === 0 ? "#fff" : T.bg;
          return (
            <div key={c.codice} style={{ display: "grid", gridTemplateColumns: "2fr 90px 2fr 110px 60px", padding: "11px 16px", alignItems: "center", borderBottom: `1px solid ${T.border}`, background: rowBg }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: T.primary, flexShrink: 0 }}>
                  {c.nome?.[0]}{c.cognome?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>{c.cognome} {c.nome}</div>
                  <div style={{ fontSize: 11, color: T.textMut }}>PIN: {c.pin}</div>
                </div>
              </div>
              <span style={{ fontSize: 12, color: T.textSec }}>{c.codice}</span>
              <span style={{ fontSize: 13, color: stato === "nessuna" ? T.textMut : T.text, fontStyle: stato === "nessuna" ? "italic" : "normal" }}>
                {scheda?.nome_scheda || "Nessuna scheda"}
              </span>
              <span style={{ fontSize: 12, color: stato === "scaduta" ? T.danger : stato === "nessuna" ? T.textMut : T.textSec, fontWeight: stato === "scaduta" ? 700 : 400 }}>
                {stato === "scaduta" ? "⚠ " : ""}{scheda ? fmt(scheda.data_scadenza) : "—"}
              </span>
              <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                <button onClick={() => onSelectCliente(c)} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.primaryLight, cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.primary }}>Apri →</button>
                <button onClick={e => { e.stopPropagation(); setConfirmDel(c.codice); }} style={{ padding: "5px 8px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.dangerLight, cursor: "pointer", color: T.danger }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROGRESSI CLIENTE — caricamento lazy per cliente
   ───────────────────────────────────────────── */
function ProgressiCliente({ codice }) {
  const [progressi, setProgressi] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selEx, setSelEx]         = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchSheet("progressi")
      .then(rows => {
        setProgressi(rows.filter(p => String(p.codice_cliente).trim() === String(codice).trim()));
      })
      .catch(() => setProgressi([]))
      .finally(() => setLoading(false));
  }, [codice]);

  const esercizi = useMemo(() =>
    [...new Set(progressi.map(p => p.esercizio).filter(Boolean))].sort(),
    [progressi]
  );

  const dataPerEx = useMemo(() => {
    if (!selEx) return [];
    return progressi
      .filter(p => p.esercizio === selEx && p.peso_kg)
      .sort((a, b) => {
        const da = a.data.split("/").reverse().join("-");
        const db = b.data.split("/").reverse().join("-");
        return da.localeCompare(db);
      });
  }, [progressi, selEx]);

  const ultimo = useMemo(() => {
    if (!progressi.length) return null;
    return [...progressi].sort((a, b) => {
      const da = a.data.split("/").reverse().join("-");
      const db = b.data.split("/").reverse().join("-");
      return db.localeCompare(da);
    })[0];
  }, [progressi]);

  if (loading) return (
    <div style={{ padding: "16px 0", textAlign: "center", color: T.textSec, fontSize: 13 }}>
      <Loader size={18} style={{ animation: "spin 0.8s linear infinite", marginBottom: 6 }} color={T.primary} />
      <p>Caricamento progressi...</p>
    </div>
  );

  if (progressi.length === 0) return (
    <EmptyState icon={Activity} msg="Nessun progresso registrato ancora. Il cliente deve salvare i pesi dall'app." />
  );

  return (
    <div>
      {ultimo && (
        <div style={{ background: T.bg, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12.5, color: T.textSec }}>
          Ultimo aggiornamento: <b style={{ color: T.text }}>{ultimo.data}</b> — {ultimo.esercizio} <b style={{ color: T.primary }}>{ultimo.peso_kg} kg</b>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {esercizi.map(ex => (
          <button key={ex} onClick={() => setSelEx(selEx === ex ? null : ex)}
            style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: selEx === ex ? T.primary : T.bg, color: selEx === ex ? "#fff" : T.textSec }}>
            {ex}
          </button>
        ))}
      </div>
      {selEx && (
        <div style={{ background: T.bg, borderRadius: 12, padding: "16px", border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 12 }}>{selEx}</div>
          {dataPerEx.length === 0 ? (
            <p style={{ fontSize: 13, color: T.textSec }}>Nessun dato per questo esercizio.</p>
          ) : (
            <>
              {/* GRAFICO A LINEA */}
              {(() => {
                const pts = dataPerEx.slice(-12);
                const vals = pts.map(d => parseFloat(d.peso_kg) || 0);
                const minV = Math.min(...vals);
                const maxV = Math.max(...vals);
                const range = maxV - minV || 1;
                const W = 100, H = 80;
                const pad = 8;
                const xStep = pts.length > 1 ? (W - pad * 2) / (pts.length - 1) : 0;
                const yPos = v => H - pad - ((v - minV) / range) * (H - pad * 2);
                const points = pts.map((d, i) => ({
                  x: pad + i * xStep,
                  y: yPos(parseFloat(d.peso_kg) || 0),
                  val: d.peso_kg,
                  date: d.data.slice(0, 5),
                }));
                const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                const areaD = `${pathD} L ${points.at(-1).x} ${H - pad} L ${points[0].x} ${H - pad} Z`;
                return (
                  <div style={{ marginBottom: 12 }}>
                    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 160, overflow: "visible" }}>
                      {/* Area fill */}
                      <defs>
                        <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={T.primary} stopOpacity="0.18" />
                          <stop offset="100%" stopColor={T.primary} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaD} fill="url(#progGrad)" />
                      {/* Linea */}
                      <path d={pathD} fill="none" stroke={T.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Punti + etichette */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="2.5" fill="#fff" stroke={T.primary} strokeWidth="1.5" />
                          <text x={p.x} y={p.y - 5} textAnchor="middle" fontSize="4.5" fontWeight="700" fill={T.text}>{p.val} kg</text>
                          <text x={p.x} y={H - 1} textAnchor="middle" fontSize="4" fill={T.textMut}>{p.date}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                );
              })()}
              {dataPerEx.length >= 2 && (() => {
                const diff = (parseFloat(dataPerEx.at(-1).peso_kg) || 0) - (parseFloat(dataPerEx[0].peso_kg) || 0);
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: diff >= 0 ? T.success : T.danger, fontSize: 13, fontWeight: 700 }}>
                    <TrendingUp size={15} />
                    {diff >= 0 ? "+" : ""}{diff.toFixed(1)} kg dal primo log
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CLIENTE DETAIL — MODIFICATA (rimosso "Nuova scheda")
   ───────────────────────────────────────────── */
function ClienteDetail({ cliente, data, onBack, onWhatsApp, onRefresh }) {
  const { schede, esercizi } = data;
  const schedaAttiva = schede.find(s => s.scheda_id === cliente.scheda_attiva);
  const schedePassate = useMemo(() => {
    if (!cliente.schede_passate) return [];
    return cliente.schede_passate.split(",").map(id => id.trim()).filter(Boolean).map(id => schede.find(s => s.scheda_id === id)).filter(Boolean);
  }, [cliente.schede_passate, schede]);

  const exForScheda = id => esercizi.filter(e => e.scheda_id === id).sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));
  const [openGiorni,  setOpenGiorni]  = useState({});
  const [openPassate, setOpenPassate] = useState({});
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [delLoading,  setDelLoading]  = useState(false);
  const [editMode,    setEditMode]    = useState(false);
  const [savingEdit,  setSavingEdit]  = useState(false);

  const handleDeletePassata = async () => {
    setDelLoading(true);
    try { await writeViaScript("deleteSchedaPassata", { codiceCliente: cliente.codice, schedaId: confirmDel }); await onRefresh(); setConfirmDel(null); }
    catch (err) { alert("Errore: " + err.message); }
    finally { setDelLoading(false); }
  };

  const handleSaveEdit = async (info, exs) => {
    if (!schedaAttiva) return;
    setSavingEdit(true);
    try {
      await writeViaScript("updateScheda", {
        scheda: {
          scheda_id: schedaAttiva.scheda_id,
          nome_scheda: info.nome_scheda,
          obiettivo: info.obiettivo,
          data_creazione: info.data_inizio,
          data_scadenza: info.data_scadenza,
          note_trainer: info.note_trainer,
        }
      });
      await writeViaScript("deleteSchedaEsercizi", { schedaId: schedaAttiva.scheda_id });
      await writeViaScript("addEserciziMultipli", {
        esercizi: exs.map(({ _id, ...e }) => ({ ...e, scheda_id: schedaAttiva.scheda_id }))
      });
      await onRefresh();
      setEditMode(false);
    } catch (err) { alert("Errore salvataggio: " + err.message); }
    finally { setSavingEdit(false); }
  };

  const days = daysUntil(schedaAttiva?.data_scadenza);

  return (
    <div>
      {confirmDel && <ConfirmModal message={`Eliminare la scheda "${schede.find(s => s.scheda_id === confirmDel)?.nome_scheda}"?`} onConfirm={handleDeletePassata} onCancel={() => setConfirmDel(null)} loading={delLoading} />}

      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> Torna alla lista
      </button>

      <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: "22px 24px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 54, height: 54, borderRadius: 13, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 800, color: T.primary, flexShrink: 0 }}>{cliente.nome?.[0]}{cliente.cognome?.[0]}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: 0 }}>{cliente.nome} {cliente.cognome}</h2>
            <div style={{ fontSize: 12.5, color: T.textSec, marginTop: 3 }}>Codice: <b style={{ color: T.text }}>{cliente.codice}</b> · PIN: <b style={{ color: T.text }}>{cliente.pin}</b></div>
          </div>
          <button onClick={() => onWhatsApp(cliente)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            <Send size={14} /> WhatsApp
          </button>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {cliente.telefono && <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Phone size={13} color={T.textSec} /><span style={{ fontSize: 13, color: T.textSec }}>{cliente.telefono}</span></div>}
          {cliente.data_iscrizione && <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Calendar size={13} color={T.textSec} /><span style={{ fontSize: 13, color: T.textSec }}>Iscritto: {fmt(cliente.data_iscrizione)}</span></div>}
        </div>
      </div>

      {/* SCHEDA ATTIVA — senza tasto "Nuova scheda", solo Modifica e Stampa */}
      <SectionBox title="Scheda attiva" icon="🟢"
        action={
          schedaAttiva ? (
            <div style={{ display: "flex", gap: 8 }}>
              {!editMode && (
                <button onClick={() => setEditMode(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: T.primaryLight, color: T.primary, border: `1px solid ${T.primaryBorder}`, borderRadius: 9, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  <Edit3 size={14} /> Modifica
                </button>
              )}
              <button onClick={() => printScheda(schedaAttiva, exForScheda(schedaAttiva.scheda_id), cliente)} style={{ display: "flex", alignItems: "center", gap: 6, background: T.bg, color: T.textSec, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                <Printer size={14} /> Stampa
              </button>
            </div>
          ) : null
        }
      >
        {editMode && schedaAttiva ? (
          <EditorScheda
            scheda={schedaAttiva}
            esercizi={exForScheda(schedaAttiva.scheda_id)}
            libreria={data.libreria || []}
            clienti={data.clienti}
            cliente={cliente}
            onSave={handleSaveEdit}
            onCancel={() => setEditMode(false)}
            saving={savingEdit}
          />
        ) : schedaAttiva ? (
          <div>
            <div style={{ background: T.bg, borderRadius: 10, padding: "13px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{schedaAttiva.nome_scheda}</div>
                <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>{schedaAttiva.obiettivo} · {fmt(schedaAttiva.data_creazione)} → {fmt(schedaAttiva.data_scadenza)}</div>
              </div>
              {days <= 14 && <Badge color={days > 0 ? T.warning : T.danger} bg={days > 0 ? T.warningLight : T.dangerLight}>{days > 0 ? `Scade tra ${days} giorni` : "Scaduta"}</Badge>}
            </div>
            {[...new Set(exForScheda(schedaAttiva.scheda_id).map(e => e.seduta || e.giorno))].filter(Boolean).map(g => {
              const dayEx = exForScheda(schedaAttiva.scheda_id).filter(e => (e.seduta || e.giorno) === g);
              const open = openGiorni[g];
              return (
                <div key={g} style={{ border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                  <button onClick={() => setOpenGiorni(p => ({ ...p, [g]: !p[g] }))} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: T.bg, border: "none", cursor: "pointer" }}>
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
          <EmptyState icon={BookOpen} msg="Nessuna scheda attiva. Vai in Schede per crearne una nuova da template e assegnarla a questo cliente." />
        )}
      </SectionBox>

      <SectionBox title="Schede passate" icon="🔘" badge={schedePassate.length > 0 ? `${schedePassate.length}` : undefined}>
        {schedePassate.length === 0 ? <EmptyState icon={History} msg="Nessuna scheda passata." /> : schedePassate.map(s => (
          <div key={s.scheda_id} style={{ border: `1px solid ${T.border}`, borderRadius: 11, marginBottom: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: T.bg }}>
              <button onClick={() => setOpenPassate(p => ({ ...p, [s.scheda_id]: !p[s.scheda_id] }))} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", flex: 1, textAlign: "left" }}>
                {openPassate[s.scheda_id] ? <ChevronUp size={16} color={T.textMut} /> : <ChevronDown size={16} color={T.textMut} />}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{s.nome_scheda}</div>
                  <div style={{ fontSize: 11.5, color: T.textSec }}>{s.obiettivo} · {fmt(s.data_creazione)} → {fmt(s.data_scadenza)}</div>
                </div>
              </button>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => printScheda(s, exForScheda(s.scheda_id), cliente)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.bg, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.textSec }}><Printer size={12} /></button>
                <button onClick={() => setConfirmDel(s.scheda_id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.dangerLight, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.danger }}><Trash2 size={12} /> Elimina</button>
              </div>
            </div>
            {openPassate[s.scheda_id] && <div style={{ padding: "14px 16px" }}><EserciziTable esercizi={exForScheda(s.scheda_id)} /></div>}
          </div>
        ))}
      </SectionBox>

      <SectionBox title="Progressi" icon="📈">
        <ProgressiCliente codice={cliente.codice} />
      </SectionBox>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TEMPLATE MODAL
   ───────────────────────────────────────────── */
function TemplateModal({ cliente, onClose, onSaved }) {
  const [step, setStep] = useState("pick");
  const [selTpl, setSelTpl] = useState(null);
  const [saving, setSaving] = useState(false);
  const today2 = new Date().toISOString().split("T")[0];
  const in2m = new Date(Date.now() + 60 * 24 * 3600000).toISOString().split("T")[0];
  const [info, setInfo] = useState({ nome_scheda: "", obiettivo: "", data_inizio: today2, data_scadenza: in2m, note_trainer: "" });
  const [exs, setExs] = useState([]);

  const pickTemplate = (t) => {
    setSelTpl(t);
    setInfo(p => ({ ...p, nome_scheda: t.nome, obiettivo: t.obiettivo }));
    setExs(t.esercizi.map((e, i) => ({ ...e, _id: i })));
    setStep("edit");
  };

  const updateEx = (id, field, value) => setExs(prev => prev.map(e => e._id === id ? { ...e, [field]: value } : e));
  const removeEx = id => setExs(prev => prev.filter(e => e._id !== id));

  const handleSave = async () => {
    if (!info.nome_scheda) { alert("Inserisci il nome della scheda"); return; }
    setSaving(true);
    try {
      const schedaId = genId("SCH");
      await writeViaScript("creaSchedaDaTemplate", {
        cliente_codice: cliente.codice,
        scheda_attiva_old: cliente.scheda_attiva || "",
        scheda: { scheda_id: schedaId, nome_scheda: info.nome_scheda, obiettivo: info.obiettivo, data_creazione: info.data_inizio, data_scadenza: info.data_scadenza, note_trainer: info.note_trainer },
        esercizi: exs.map(({ _id, ...e }) => ({ ...e, scheda_id: schedaId })),
      });
      await onSaved();
      onClose();
    } catch (err) { alert("Errore: " + err.message); }
    finally { setSaving(false); }
  };

  return (
    <Overlay zIndex={1200}>
      <ModalBox maxWidth={820} maxHeight="90vh">
        <ModalHeader
          title={step === "pick" ? "Scegli un template" : `Personalizza: ${selTpl?.nome}`}
          onClose={onClose}
          left={step === "edit" && (
            <button onClick={() => setStep("pick")} style={{ background: "none", border: "none", cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <ArrowLeft size={14} /> Cambia
            </button>
          )}
        />
        <div style={{ overflow: "auto", flex: 1, padding: "20px 24px" }}>
          {step === "pick" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => pickTemplate(t)} style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, padding: "20px 22px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.colore; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
                >
                  {/* MODIFICA 4: icona manubrio invece delle frecce */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: t.colore + "22", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Dumbbell size={22} color={t.colore} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{t.nome}</div>
                    <div style={{ fontSize: 13, color: T.textSec, marginTop: 3 }}>{t.descrizione}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.colore, background: t.colore + "15", padding: "4px 12px", borderRadius: 8 }}>{t.esercizi.length} esercizi</div>
                  <ChevronRight size={18} color={T.textMut} />
                </button>
              ))}
            </div>
          )}
          {step === "edit" && (
            <div>
              <div style={{ background: T.bg, borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <Field label="NOME SCHEDA *"><Input value={info.nome_scheda} onChange={v => setInfo(p => ({ ...p, nome_scheda: v }))} placeholder="Es: Scheda Mario" /></Field>
                  <Field label="OBIETTIVO"><Input value={info.obiettivo} onChange={v => setInfo(p => ({ ...p, obiettivo: v }))} placeholder="Es: Tonificazione" /></Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <Field label="DATA INIZIO"><Input type="date" value={info.data_inizio} onChange={v => setInfo(p => ({ ...p, data_inizio: v }))} /></Field>
                  <Field label="DATA SCADENZA"><Input type="date" value={info.data_scadenza} onChange={v => setInfo(p => ({ ...p, data_scadenza: v }))} /></Field>
                  <Field label="NOTE"><Input value={info.note_trainer} onChange={v => setInfo(p => ({ ...p, note_trainer: v }))} placeholder="Note..." /></Field>
                </div>
              </div>
              {[...new Set(exs.map(e => e.seduta))].map(sed => (
                <div key={sed} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: selTpl?.colore || T.primary, marginBottom: 8, textTransform: "uppercase" }}>{sed}</div>
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                    {exs.filter(e => e.seduta === sed).map((ex, ri) => (
                      <div key={ex._id} style={{ display: "grid", gridTemplateColumns: "2fr 55px 70px 70px 60px 1fr 28px", gap: 6, padding: "8px 14px", alignItems: "center", borderTop: ri > 0 ? `1px solid ${T.border}` : "none" }}>
                        {["esercizio","serie","ripetizioni","peso_suggerito","recupero","note"].map((f, fi) => (
                          <input key={f} value={ex[f] || ""} onChange={e => updateEx(ex._id, f, e.target.value)}
                            style={{ border: "1px solid transparent", borderRadius: 5, padding: "4px 6px", fontSize: 12, color: T.text, outline: "none", background: "transparent", width: "100%", fontWeight: fi === 0 ? 700 : 400 }}
                            onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.background = "#fff"; }}
                            onBlur={e => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
                          />
                        ))}
                        <button onClick={() => removeEx(ex._id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.danger }}><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {step === "edit" && (
          <ModalFooter>
            <BtnSecondary onClick={onClose}>Annulla</BtnSecondary>
            <BtnPrimary onClick={handleSave} loading={saving}><Save size={14} /> Salva e assegna a {cliente.nome}</BtnPrimary>
          </ModalFooter>
        )}
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────
   EDITOR SCHEDA
   ───────────────────────────────────────────── */
function EditorScheda({ scheda, esercizi: esErca, libreria, clienti, cliente, onSave, onCancel, saving }) {
  const today2 = new Date().toISOString().split("T")[0];
  const in2m   = new Date(Date.now() + 60 * 24 * 3600000).toISOString().split("T")[0];

  const nomeAuto = scheda?.nome_scheda
    || (cliente ? `${scheda?.obiettivo ? scheda.obiettivo + " — " : "Scheda — "}${cliente.cognome} ${cliente.nome}` : "");

  const [info, setInfo] = useState({
    nome_scheda:    nomeAuto,
    obiettivo:      scheda?.obiettivo     || "",
    data_inizio:    scheda?.data_creazione || today2,
    data_scadenza:  scheda?.data_scadenza  || in2m,
    note_trainer:   scheda?.note_trainer   || "",
    cliente_codice: cliente?.codice        || "",
  });

  const [exs, setExs] = useState(() =>
    (esErca || []).map((e, i) => ({ ...e, seduta: e.seduta || e.giorno || "Seduta 1", _id: i }))
  );
  const [muscoloSel, setMuscoloSel] = useState({}); 
  const [addInput, setAddInput] = useState({});

  const addEsercizioLibero = (sed, nome) => {
    if (!nome.trim()) return;
    const found = libreria.find(l => l.esercizio.toLowerCase() === nome.trim().toLowerCase());
    const inSed = exs.filter(e => e.seduta === sed);
    setExs(prev => [...prev, {
      esercizio: nome.trim(), muscolo: found?.muscolo || "", seduta: sed,
      serie: "3", ripetizioni: "10-12", recupero: "60", peso_suggerito: "", note: "",
      ordine: inSed.length + 1, _id: Date.now() + Math.random()
    }]);
    setAddInput(p => ({ ...p, [sed]: "" }));
  };

  const sedute = useMemo(() => {
    const s = [...new Set(exs.map(e => e.seduta))].filter(Boolean);
    return s.sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || 0);
      const nb = parseInt(b.match(/\d+/)?.[0] || 0);
      return na - nb;
    });
  }, [exs]);

  const libByMuscolo = useMemo(() => {
    const g = {};
    libreria.forEach(e => {
      const k = e.muscolo || "Altro";
      if (!g[k]) g[k] = [];
      g[k].push(e);
    });
    return g;
  }, [libreria]);

  const updateEx = (id, field, value) => setExs(prev => prev.map(e => e._id === id ? { ...e, [field]: value } : e));
  const removeEx = id => setExs(prev => prev.filter(e => e._id !== id));

  const moveEx = (id, dir) => {
    setExs(prev => {
      const sed = prev.find(e => e._id === id)?.seduta;
      const others = prev.filter(e => e.seduta !== sed);
      const inSed = [...prev.filter(e => e.seduta === sed)].sort((a,b) => parseInt(a.ordine||0) - parseInt(b.ordine||0));
      const idx = inSed.findIndex(e => e._id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= inSed.length) return prev;
      [inSed[idx], inSed[newIdx]] = [inSed[newIdx], inSed[idx]];
      const reordered = inSed.map((e, i) => ({ ...e, ordine: i + 1 }));
      return [...others, ...reordered];
    });
  };

  const addFromLib = (ex, sedutaTarget) => {
    const target = sedutaTarget || sedute[0] || "Seduta 1";
    const inSed = exs.filter(e => e.seduta === target);
    const newEx = {
      esercizio: ex.esercizio, muscolo: ex.muscolo, seduta: target,
      serie: "3", ripetizioni: "10-12", recupero: "60", peso_suggerito: "", note: "",
      ordine: inSed.length + 1, _id: Date.now() + Math.random()
    };
    setExs(prev => [...prev, newEx]);
  };

  const addSeduta = () => {
    const n = sedute.length + 1;
    setExs(prev => [...prev, {
      esercizio: "Nuovo esercizio", muscolo: "", seduta: `Seduta ${n}`,
      serie: "3", ripetizioni: "10-12", recupero: "60", peso_suggerito: "", note: "",
      ordine: 1, _id: Date.now()
    }]);
  };

  const removeSeduta = (sed) => {
    if (!window.confirm(`Eliminare "${sed}" con tutti i suoi esercizi?`)) return;
    setExs(prev => {
      const remaining = prev.filter(e => e.seduta !== sed);
      const sedRimanenti = [...new Set(remaining.map(e => e.seduta))].filter(Boolean);
      return remaining.map(e => {
        const idx = sedRimanenti.indexOf(e.seduta);
        return { ...e, seduta: `Seduta ${idx + 1}` };
      });
    });
  };

  return (
    <div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.textSec, letterSpacing: "0.5px", marginBottom: 14 }}>INFO SCHEDA</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="NOME SCHEDA *"><Input value={info.nome_scheda} onChange={v => setInfo(p => ({ ...p, nome_scheda: v }))} placeholder="Es: Tonificazione Marco" /></Field>
          <Field label="OBIETTIVO"><Input value={info.obiettivo} onChange={v => setInfo(p => ({ ...p, obiettivo: v }))} placeholder="Es: Tonificazione" /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="DATA INIZIO"><Input type="date" value={info.data_inizio} onChange={v => setInfo(p => ({ ...p, data_inizio: v }))} /></Field>
          <Field label="DATA SCADENZA"><Input type="date" value={info.data_scadenza} onChange={v => setInfo(p => ({ ...p, data_scadenza: v }))} /></Field>
          <Field label="NOTE TRAINER"><Input value={info.note_trainer} onChange={v => setInfo(p => ({ ...p, note_trainer: v }))} placeholder="Note generali..." /></Field>
        </div>
        {!cliente && (
          <Field label="ASSEGNA A CLIENTE *">
            <select value={info.cliente_codice} onChange={e => setInfo(p => ({ ...p, cliente_codice: e.target.value }))}
              style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }}>
              <option value="">Seleziona cliente...</option>
              {clienti.map(c => <option key={c.codice} value={c.codice}>{c.nome} {c.cognome} ({c.codice})</option>)}
            </select>
          </Field>
        )}
      </div>

      {sedute.map(sed => {
        const sedExs = exs.filter(e => e.seduta === sed).sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));
        return (
          <div key={sed} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.primary, letterSpacing: "0.5px", textTransform: "uppercase" }}>{sed}</div>
              <button onClick={() => removeSeduta(sed)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.dangerLight, cursor: "pointer", fontSize: 11, fontWeight: 600, color: T.danger }}>
                <Trash2 size={11} /> Rimuovi seduta
              </button>
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "24px 24px 2fr 55px 70px 70px 60px 1fr 28px", gap: 4, padding: "8px 12px", background: T.bg, fontSize: 10, fontWeight: 700, color: T.textMut }}>
                <span></span><span>#</span><span>ESERCIZIO</span><span style={{textAlign:"center"}}>SERIE</span><span style={{textAlign:"center"}}>REPS</span><span style={{textAlign:"center"}}>KG</span><span style={{textAlign:"center"}}>REC.</span><span>NOTE</span><span></span>
              </div>
              {sedExs.map((ex, ri) => (
                <div key={ex._id} style={{ display: "grid", gridTemplateColumns: "24px 24px 2fr 55px 70px 70px 60px 1fr 28px", gap: 4, padding: "6px 12px", alignItems: "center", borderTop: `1px solid ${T.border}`, background: ri % 2 === 0 ? "#fff" : T.bg + "88" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <button onClick={() => moveEx(ex._id, -1)} disabled={ri === 0} style={{ background: "none", border: "none", cursor: ri === 0 ? "default" : "pointer", color: ri === 0 ? T.textMut : T.primary, padding: 0, fontSize: 10, lineHeight: 1 }}>▲</button>
                    <button onClick={() => moveEx(ex._id, 1)} disabled={ri === sedExs.length - 1} style={{ background: "none", border: "none", cursor: ri === sedExs.length - 1 ? "default" : "pointer", color: ri === sedExs.length - 1 ? T.textMut : T.primary, padding: 0, fontSize: 10, lineHeight: 1 }}>▼</button>
                  </div>
                  <span style={{ fontSize: 11, color: T.textMut, fontWeight: 700 }}>{ri + 1}</span>
                  <div style={{ position: "relative" }}>
                    <input
                      value={ex.esercizio || ""}
                      onChange={e => {
                        const val = e.target.value;
                        updateEx(ex._id, "esercizio", val);
                        const found = libreria.find(l => l.esercizio.toLowerCase() === val.toLowerCase());
                        if (found) updateEx(ex._id, "muscolo", found.muscolo);
                      }}
                      list={`lib-${ex._id}`}
                      placeholder="Esercizio..."
                      style={{ border: "1px solid transparent", borderRadius: 5, padding: "4px 6px", fontSize: 12, color: T.text, outline: "none", background: "transparent", width: "100%", fontWeight: 700 }}
                      onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
                    />
                    <datalist id={`lib-${ex._id}`}>
                      {libreria.map((lib, li) => <option key={li} value={lib.esercizio} />)}
                    </datalist>
                  </div>
                  {["serie","ripetizioni","peso_suggerito","recupero","note"].map((f, fi) => (
                    <input key={f} value={ex[f] || ""} onChange={e => updateEx(ex._id, f, e.target.value)}
                      style={{ border: "1px solid transparent", borderRadius: 5, padding: "4px 6px", fontSize: 12, color: T.text, outline: "none", background: "transparent", width: "100%", textAlign: fi < 4 ? "center" : "left" }}
                      onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = "transparent"; e.target.style.background = "transparent"; }}
                    />
                  ))}
                  <button onClick={() => removeEx(ex._id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.danger, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
                </div>
              ))}
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, background: T.bg + "44" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textSec, marginBottom: 8 }}>+ AGGIUNGI ESERCIZIO</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={muscoloSel[sed] || ""}
                    onChange={e => setMuscoloSel(p => ({ ...p, [sed]: e.target.value }))}
                    style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 10px", fontSize: 12, color: T.text, outline: "none", background: "#fff", cursor: "pointer" }}
                  >
                    <option value="">Tutti i muscoli</option>
                    {Object.keys(libByMuscolo).sort().map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value=""
                    onChange={e => {
                      const val = e.target.value;
                      if (!val) return;
                      const found = libreria.find(l => l.esercizio === val);
                      if (found) addFromLib(found, sed);
                    }}
                    style={{ flex: 2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 10px", fontSize: 12, color: T.text, outline: "none", background: "#fff", cursor: "pointer" }}
                  >
                    <option value="">Seleziona esercizio...</option>
                    {(muscoloSel[sed] ? (libByMuscolo[muscoloSel[sed]] || []) : libreria).map((lib, li) => (
                      <option key={li} value={lib.esercizio}>{lib.esercizio}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button onClick={addSeduta} style={{ display: "flex", alignItems: "center", gap: 7, background: T.bg, color: T.textSec, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 20, width: "100%", justifyContent: "center" }}>
        <Plus size={15} /> Aggiungi nuova seduta
      </button>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <BtnSecondary onClick={onCancel}>Annulla</BtnSecondary>
        <BtnPrimary onClick={() => onSave(info, exs)} loading={saving}><Save size={14} /> Salva scheda</BtnPrimary>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCHEDE VIEW — nuovo flusso 3 step
   Step 1: Seleziona cliente (+ crea nuovo)
   Step 2: Template o Da zero
   Step 3: Editor
   ───────────────────────────────────────────── */
function SchedeView({ data, onRefresh }) {
  const { clienti, libreria } = data;
  const [step, setStep] = useState("cliente");
  const [clienteSel, setClienteSel] = useState(null);
  const [tipoScheda, setTipoScheda] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showNuovoCliente, setShowNuovoCliente] = useState(false);
  const [searchCliente, setSearchCliente] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("tutti");

  const getStatoCliente = (c) => {
    const scheda = data.schede?.find(s => s.scheda_id === c.scheda_attiva);
    if (!scheda) return "nessuna";
    if (daysUntil(scheda.data_scadenza) <= 0) return "scaduta";
    return "ok";
  };

  const clientiFiltrati = useMemo(() => {
    const q = searchCliente.toLowerCase().trim();
    return clienti.filter(c => {
      const ms = !q || `${c.nome} ${c.cognome} ${c.codice}`.toLowerCase().includes(q);
      const stato = getStatoCliente(c);
      const mf = filtroCliente === "tutti" ? true
        : filtroCliente === "nessuna" ? stato === "nessuna"
        : filtroCliente === "scaduta" ? stato === "scaduta"
        : true;
      return ms && mf;
    }).sort((a, b) => String(a.cognome).localeCompare(String(b.cognome)));
  }, [clienti, searchCliente, filtroCliente, data.schede]);

  const resetFlow = () => { setStep("cliente"); setClienteSel(null); setTipoScheda(null); setSearchCliente(""); setFiltroCliente("tutti"); };

  const handleSave = async (info, exs) => {
    if (!info.nome_scheda) { alert("Inserisci il nome della scheda"); return; }
    setSaving(true);
    try {
      await writeViaScript("creaSchedaDaTemplate", {
        cliente_codice: clienteSel.codice,
        scheda_attiva_old: clienteSel.scheda_attiva || "",
        scheda: { scheda_id: "", nome_scheda: info.nome_scheda, obiettivo: info.obiettivo, data_creazione: info.data_inizio, data_scadenza: info.data_scadenza, note_trainer: info.note_trainer },
        esercizi: exs.map(({ _id, ...e }) => ({ ...e, scheda_id: "" })),
      });
      await onRefresh();
      resetFlow(); showToast("✅ Scheda salvata con successo!");
    } catch (err) { alert("Errore: " + err.message); }
    finally { setSaving(false); }
  };

  // ── STEP 3: EDITOR ──
  if (step === "editor") {
    const isTemplate = tipoScheda !== "zero";
    const esIniziali = isTemplate ? tipoScheda.esercizi.map((e, i) => ({ ...e, _id: i })) : [
      { esercizio: "", muscolo: "", seduta: "Seduta 1", serie: "3", ripetizioni: "", recupero: "60", peso_suggerito: "", note: "", ordine: 1, _id: Date.now() }
    ];
    const schedaIniziale = isTemplate
      ? { nome_scheda: tipoScheda.nome, obiettivo: tipoScheda.obiettivo }
      : { nome_scheda: `Scheda — ${clienteSel.cognome} ${clienteSel.nome}`, obiettivo: "" };
    return (
      <div>
        <button onClick={() => setStep("tipo")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
          <ArrowLeft size={16} /> Cambia tipo
        </button>
        {/* BANNER CLIENTE SELEZIONATO */}
        <div style={{ background: T.primaryLight, border: `1px solid ${T.primaryBorder}`, borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {clienteSel.nome?.[0]}{clienteSel.cognome?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{clienteSel.nome} {clienteSel.cognome}</div>
            <div style={{ fontSize: 11.5, color: T.textSec }}>{clienteSel.codice} · {isTemplate ? `Template: ${tipoScheda.nome}` : "Scheda da zero"}</div>
          </div>
          <button onClick={resetFlow} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut, fontSize: 12 }}>✕ Ricomincia</button>
        </div>
        <EditorScheda
          scheda={schedaIniziale}
          esercizi={esIniziali}
          libreria={libreria || []}
          clienti={clienti}
          cliente={clienteSel}
          onSave={handleSave}
          onCancel={resetFlow}
          saving={saving}
        />
      </div>
    );
  }

  // ── STEP 2: TIPO SCHEDA ──
  if (step === "tipo") return (
    <div>
      <button onClick={() => setStep("cliente")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={16} /> Cambia cliente
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Tipo di scheda</h1>
      <p style={{ fontSize: 13.5, color: T.textSec, marginBottom: 24 }}>Per <b>{clienteSel.nome} {clienteSel.cognome}</b> — come vuoi creare la scheda?</p>

      {/* DA ZERO */}
      <button onClick={() => { setTipoScheda("zero"); setStep("editor"); }} style={{ width: "100%", background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, padding: "22px 24px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16, marginBottom: 14, transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.boxShadow = `0 4px 20px ${T.primary}22`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
      >
        <div style={{ width: 56, height: 56, borderRadius: 14, background: T.primaryLight, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Edit3 size={26} color={T.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>✏️ Da zero</div>
          <div style={{ fontSize: 13, color: T.textSec, marginTop: 4 }}>Foglio bianco — scrivi tu tutto, esercizio per esercizio</div>
          <div style={{ fontSize: 12, color: T.textMut, marginTop: 4 }}>Ideale per trainer esperti con scheda già in mente</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, background: T.primaryLight, padding: "5px 14px", borderRadius: 8 }}>Scegli →</div>
      </button>

      {/* DIVISORE */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: T.border }} />
        <span style={{ fontSize: 12, color: T.textMut, fontWeight: 600 }}>oppure parti da un template</span>
        <div style={{ flex: 1, height: 1, background: T.border }} />
      </div>

      {/* TEMPLATE */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => { setTipoScheda(t); setStep("editor"); }} style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, padding: "20px 24px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.colore; e.currentTarget.style.boxShadow = `0 4px 20px ${t.colore}22`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: t.colore + "22", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dumbbell size={22} color={t.colore} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{t.nome}</div>
              <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>{t.descrizione}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.colore, background: t.colore + "15", padding: "4px 12px", borderRadius: 8 }}>Usa →</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── STEP 1: SELEZIONE CLIENTE ──
  return (
    <div>
      {showNuovoCliente && (
        <ClienteFormModal
          clienti={clienti}
          onClose={() => setShowNuovoCliente(false)}
          onSaved={async () => { await onRefresh(); setShowNuovoCliente(false); }}
        />
      )}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Nuova scheda</h1>
        <p style={{ fontSize: 13.5, color: T.textSec }}>Prima seleziona il cliente, poi scegli il tipo di scheda</p>
      </div>

      {/* BARRA RICERCA + NUOVO CLIENTE */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px" }}>
          <Search size={15} color={T.textMut} />
          <input value={searchCliente} onChange={e => setSearchCliente(e.target.value)} placeholder="Cerca cliente per nome o codice..." style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: T.text, background: "transparent" }} />
          {searchCliente && <button onClick={() => setSearchCliente("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}><X size={13} /></button>}
        </div>
        <button onClick={() => setShowNuovoCliente(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
          <UserPlus size={15} /> Nuovo cliente
        </button>
      </div>

      {/* FILTRI */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { id: "tutti",   label: `Tutti (${clienti.length})` },
          { id: "ok",      label: `Con scheda (${clienti.filter(c => getStatoCliente(c) === "ok").length})`,      color: T.success, bg: T.successLight },
          { id: "nessuna", label: `Senza scheda (${clienti.filter(c => getStatoCliente(c) === "nessuna").length})`, color: T.warning, bg: T.warningLight },
          { id: "scaduta", label: `⚠ Scaduta (${clienti.filter(c => getStatoCliente(c) === "scaduta").length})`,   color: T.danger,  bg: T.dangerLight },
        ].map(f => (
          <button key={f.id} onClick={() => setFiltroCliente(f.id)} style={{ padding: "5px 14px", borderRadius: 20, border: filtroCliente === f.id ? "none" : `1px solid ${T.border}`, background: filtroCliente === f.id ? (f.bg || T.primaryLight) : "#fff", color: filtroCliente === f.id ? (f.color || T.primary) : T.textSec, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* LISTA CLIENTI */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
        {clientiFiltrati.length === 0 && (
          <div style={{ padding: "32px 0", textAlign: "center", color: T.textSec, fontSize: 13 }}>Nessun cliente trovato</div>
        )}
        {clientiFiltrati.map((c, i) => {
          const stato = getStatoCliente(c);
          const badgeLabel = stato === "scaduta" ? "⚠ Scaduta" : stato === "nessuna" ? "Senza scheda" : "Ha scheda";
          const badgeColor = stato === "scaduta" ? T.danger : stato === "nessuna" ? T.warning : T.success;
          const badgeBg    = stato === "scaduta" ? T.dangerLight : stato === "nessuna" ? T.warningLight : T.successLight;
          return (
            <button key={c.codice} onClick={() => { setClienteSel(c); setStep("tipo"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderBottom: i < clientiFiltrati.length - 1 ? `1px solid ${T.border}` : "none", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: T.primary, flexShrink: 0 }}>
                {c.nome?.[0]}{c.cognome?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{c.cognome} {c.nome}</div>
                <div style={{ fontSize: 11.5, color: T.textMut, marginTop: 1 }}>{c.codice}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6, color: badgeColor, background: badgeBg }}>
                {badgeLabel}
              </span>
              <ChevronRight size={16} color={T.textMut} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ESERCIZI VIEW — MODIFICATA: punta a libreria_esercizi
   ───────────────────────────────────────────── */
function EserciziView({ data, onRefresh }) {
  // MODIFICA 3: usa libreria invece di esercizi
  const { libreria } = data;
  const [search, setSearch] = useState("");
  const [filterMuscolo, setFilterMuscolo] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editEx, setEditEx] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ esercizio: "", muscolo: "" });

  const muscoli = useMemo(() => {
    return [...new Set(libreria.map(e => e.muscolo).filter(Boolean))].sort();
  }, [libreria]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return libreria.filter(e => {
      const ms = !q || `${e.esercizio} ${e.muscolo}`.toLowerCase().includes(q);
      const mm = filterMuscolo === "all" || e.muscolo === filterMuscolo;
      return ms && mm;
    });
  }, [libreria, search, filterMuscolo]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(e => { const k = e.muscolo || "Altro"; if (!g[k]) g[k] = []; g[k].push(e); });
    // ✅ Ordine alfabetico dentro ogni gruppo
    Object.keys(g).forEach(k => g[k].sort((a, b) => a.esercizio.localeCompare(b.esercizio)));
    return g;
  }, [filtered]);

  const handleAdd = async () => {
    if (!form.esercizio) { alert("Inserisci il nome dell'esercizio"); return; }
    setSaving(true);
    try {
      await writeViaScript("addLibreriaEsercizio", { esercizio: form });
      await onRefresh();
      setShowForm(false);
      setForm({ esercizio: "", muscolo: "" });
    } catch (err) { alert("Errore: " + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await writeViaScript("deleteLibreriaEsercizio", { esercizio: confirmDel.esercizio });
      await onRefresh();
      setConfirmDel(null);
    } catch (err) { alert("Errore: " + err.message); }
    finally { setDelLoading(false); }
  };

  return (
    <div>
      {confirmDel && <ConfirmModal message={`Eliminare "${confirmDel.esercizio}" dalla libreria?`} onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} loading={delLoading} />}

      {editEx && (
        <Overlay zIndex={1100}>
          <ModalBox maxWidth={400}>
            <ModalHeader title="Modifica esercizio" onClose={() => setEditEx(null)} />
            <div style={{ padding: "20px 24px", overflow: "auto", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Field label="NOME *"><Input value={editEx.esercizio || ""} onChange={v => setEditEx(p => ({ ...p, esercizio: v }))} /></Field>
                <Field label="MUSCOLO"><Input value={editEx.muscolo || ""} onChange={v => setEditEx(p => ({ ...p, muscolo: v }))} /></Field>
              </div>
            </div>
            <ModalFooter>
              <BtnSecondary onClick={() => setEditEx(null)}>Annulla</BtnSecondary>
              <BtnPrimary onClick={async () => {
                setSaving(true);
                try {
                  await writeViaScript("updateLibreriaEsercizio", { esercizio: editEx });
                  await onRefresh();
                  setEditEx(null);
                } catch (err) { alert(err.message); }
                finally { setSaving(false); }
              }} loading={saving}><Save size={14} /> Salva</BtnPrimary>
            </ModalFooter>
          </ModalBox>
        </Overlay>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Libreria Esercizi</h1>
          <p style={{ fontSize: 13.5, color: T.textSec }}>{libreria.length} esercizi disponibili</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ display: "flex", alignItems: "center", gap: 7, background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>
          <Plus size={17} /> Aggiungi esercizio
        </button>
      </div>

      {showForm && (
        <div style={{ background: T.card, border: `1px solid ${T.primaryBorder}`, borderRadius: 14, padding: "22px 24px", marginBottom: 22, boxShadow: "0 4px 20px rgba(255,107,0,0.08)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 18 }}>➕ Nuovo esercizio in libreria</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 18 }}>
            <Field label="NOME ESERCIZIO *"><Input value={form.esercizio} onChange={v => setForm(p => ({ ...p, esercizio: v }))} placeholder="Es: Panca piana bilanciere" /></Field>
            <Field label="MUSCOLO">
              <input
                list="muscoli-list"
                value={form.muscolo}
                onChange={e => setForm(p => ({ ...p, muscolo: e.target.value }))}
                placeholder="Es: Pettorali"
                style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }}
              />
              <datalist id="muscoli-list">
                {muscoli.map(m => <option key={m} value={m} />)}
              </datalist>
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <BtnSecondary onClick={() => setShowForm(false)}>Annulla</BtnSecondary>
            <BtnPrimary onClick={handleAdd} loading={saving}><Plus size={14} /> Aggiungi alla libreria</BtnPrimary>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px" }}>
          <Search size={16} color={T.textMut} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca esercizio..." style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: T.text, background: "transparent" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}><X size={14} /></button>}
        </div>
        <select value={filterMuscolo} onChange={e => setFilterMuscolo(e.target.value)} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: T.text, background: T.card, outline: "none", cursor: "pointer" }}>
          <option value="all">Tutti i muscoli</option>
          {muscoli.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {Object.entries(grouped).length === 0
        ? <EmptyState icon={Dumbbell} msg="Nessun esercizio trovato." />
        : Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([muscolo, exs]) => (
          <div key={muscolo} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.primary, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
              {muscolo} <span style={{ color: T.textMut, fontWeight: 600 }}>({exs.length})</span>
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              {exs.map((ex, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 18px", borderBottom: i < exs.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: T.primaryLight, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: T.primary }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: T.text }}>{ex.esercizio}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setEditEx({ ...ex })} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: "#EEF2FF", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#6366F1" }}><Edit3 size={12} /> Modifica</button>
                    <button onClick={() => setConfirmDel(ex)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.dangerLight, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.danger }}><Trash2 size={12} /> Elimina</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ─────────────────────────────────────────────
   IMPOSTAZIONI
   ───────────────────────────────────────────── */
function ServiceCard({ items, title, emoji, onDelete }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{title}</span>
        <span style={{ marginLeft: 4, fontSize: 11.5, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: T.bg, color: T.textSec }}>{items.length}</span>
      </div>
      <div style={{ padding: "12px 12px", borderTop: `1px solid ${T.border}`, background: "#FAFAFA" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      value={addInput[sed] || ""}
                      onChange={e => setAddInput(p => ({ ...p, [sed]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter" && (addInput[sed] || "").trim()) { addEsercizioLibero(sed, addInput[sed]); } }}
                      list={`add-lib-${sed}`}
                      placeholder="🔍 Scrivi o cerca un esercizio..."
                      style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, color: T.text, outline: "none", background: "#fff" }}
                      onFocus={e => e.target.style.borderColor = T.primary}
                      onBlur={e => e.target.style.borderColor = T.border}
                    />
                    <datalist id={`add-lib-${sed}`}>
                      {[...libreria].sort((a,b) => a.esercizio.localeCompare(b.esercizio)).map((lib, li) => <option key={li} value={lib.esercizio} />)}
                    </datalist>
                  </div>
                  <button
                    onClick={() => addEsercizioLibero(sed, addInput[sed] || "")}
                    disabled={!(addInput[sed] || "").trim()}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: (addInput[sed] || "").trim() ? T.primary : T.bg, color: (addInput[sed] || "").trim() ? "#fff" : T.textMut, border: "none", borderRadius: 9, padding: "9px 18px", cursor: (addInput[sed] || "").trim() ? "pointer" : "default", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.15s" }}
                  >
                    <Plus size={15} /> Aggiungi
                  </button>
                </div>
                <div style={{ fontSize: 11, color: T.textMut, marginTop: 6 }}>Scrivi libero o scegli dalla libreria — premi Invio o il pulsante</div>
              </div>
  );
}

function ImpostazioniView({ data, onRefresh }) {
  const { servizi = [] } = data;
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo: "corso", nome: "", descrizione: "", contatto: "" });

  const corsi = servizi.filter(s => s.tipo === "corso");
  const professionisti = servizi.filter(s => s.tipo === "professionista");

  const handleAdd = async () => {
    if (!form.nome) { alert("Inserisci il nome"); return; }
    setSaving(true);
    try {
      await writeViaScript("addServizio", { servizio: form });
      await onRefresh();
      setShowForm(false);
      setForm({ tipo: "corso", nome: "", descrizione: "", contatto: "" });
    } catch (err) { alert("Errore: " + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await writeViaScript("deleteServizio", { servizio: confirmDel });
      await onRefresh();
      setConfirmDel(null);
    } catch (err) { alert("Errore: " + err.message); }
    finally { setDelLoading(false); }
  };

  return (
    <div>
      {confirmDel && <ConfirmModal message={`Eliminare "${confirmDel.nome}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} loading={delLoading} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>La Palestra</h1>
          <p style={{ fontSize: 13.5, color: T.textSec }}>Gestisci corsi e professionisti</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ display: "flex", alignItems: "center", gap: 7, background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>
          <Plus size={17} /> Aggiungi
        </button>
      </div>
      {showForm && (
        <div style={{ background: T.card, border: `1px solid ${T.primaryBorder}`, borderRadius: 14, padding: "22px 24px", marginBottom: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 18 }}>➕ Nuovo elemento</div>
          <div style={{ marginBottom: 12 }}>
            <Field label="TIPO">
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%" }}>
                <option value="corso">Corso</option>
                <option value="professionista">Professionista</option>
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="NOME *"><Input value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} placeholder={form.tipo === "corso" ? "Es: Pilates" : "Es: Dott. Rossi"} /></Field>
            <Field label="CONTATTO"><Input value={form.contatto} onChange={v => setForm(p => ({ ...p, contatto: v }))} placeholder="Es: 333 0000000" /></Field>
          </div>
          <Field label="DESCRIZIONE">
            <Input value={form.descrizione} onChange={v => setForm(p => ({ ...p, descrizione: v }))} placeholder="Descrizione..." />
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <BtnSecondary onClick={() => setShowForm(false)}>Annulla</BtnSecondary>
            <BtnPrimary onClick={handleAdd} loading={saving}><Plus size={14} /> Salva</BtnPrimary>
          </div>
        </div>
      )}
      <ServiceCard items={corsi} title="I nostri corsi" emoji="💪" onDelete={setConfirmDel} />
      <ServiceCard items={professionisti} title="I nostri professionisti" emoji="🏥" onDelete={setConfirmDel} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING / ERROR
   ───────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><Dumbbell size={24} color="#fff" /></div>
      <div><div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>GymBoard Admin</div><div style={{ fontSize: 13, color: T.textSec, marginTop: 2 }}>Caricamento...</div></div>
    </div>
  );
}
function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <AlertCircle size={44} color={T.danger} />
      <p style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Errore di connessione</p>
      <p style={{ fontSize: 13, color: T.textSec, maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>{error}</p>
      <button onClick={onRetry} style={{ background: T.primary, border: "none", borderRadius: 10, padding: "11px 26px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}><RefreshCw size={16} /> Riprova</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT
   ───────────────────────────────────────────── */
export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(() => {
    try { return localStorage.getItem("gym_admin_logged") === "true"; } catch { return false; }
  });
  const [data,            setData]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [page,            setPage]            = useState("dashboard");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [waCliente,       setWaCliente]       = useState(null);
  const { showToast, ToastEl } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetchAllData()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (loggedIn) loadData(); }, [loggedIn, loadData]);

  if (!loggedIn) return <LoginScreen onLogin={() => {
    setLoggedIn(true);
    try { localStorage.setItem("gym_admin_logged", "true"); } catch {}
  }} />;
  if (loading)   return <LoadingScreen />;
  if (error)     return <ErrorScreen error={error} onRetry={loadData} />;

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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <Sidebar active={sidebarActive} onNavigate={navigate} config={data.config} onLogout={() => {
        setLoggedIn(false); setPage("dashboard");
        try { localStorage.removeItem("gym_admin_logged"); } catch {}
      }} />

      <div style={{ flex: 1, padding: "32px 36px", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <button onClick={loadData} style={{ display: "flex", alignItems: "center", gap: 7, background: T.card, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 14px", cursor: "pointer", fontSize: 12.5, color: T.textSec, fontWeight: 600 }}>
            <RefreshCw size={14} /> Aggiorna dati
          </button>
        </div>

        {loading && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "28px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${T.primaryLight}`, borderTop: `3px solid ${T.primary}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Caricamento...</div>
            </div>
          </div>
        )}

        {ToastEl}{waCliente && <WAModal cliente={waCliente} onClose={() => setWaCliente(null)} />}

        {page === "dashboard"     && <DashboardView data={data} onNavigate={navigate} onSelectCliente={openCliente} />}
        {page === "clienti"       && <ClientiView   data={data} onSelectCliente={openCliente} onRefresh={loadData} />}
        {page === "clienteDetail" && selectedCliente && <ClienteDetail cliente={selectedCliente} data={data} onBack={() => navigate("clienti")} onWhatsApp={setWaCliente} onRefresh={loadData} />}
        {page === "schede"        && <SchedeView    data={data} onRefresh={loadData} />}
        {page === "esercizi"      && <EserciziView  data={data} onRefresh={loadData} />}
        {page === "impostazioni"  && <ImpostazioniView data={data} onRefresh={loadData} />}
      </div>
    </div>
  );
}
