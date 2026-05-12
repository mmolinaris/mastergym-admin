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
  try {
    servizi = await fetchSheet("servizi");
  } catch(e) {
    // Riprova una volta in caso di errore temporaneo
    try {
      await new Promise(r => setTimeout(r, 500));
      servizi = await fetchSheet("servizi");
    } catch(e2) {
      console.warn("Foglio 'servizi' non trovato o errore:", e2.message);
    }
  }
  const config = Object.fromEntries(configRows.map(r => [r.chiave, r.valore]));
  return { config, clienti, schede, esercizi, libreria, servizi };
}

async function writeViaScript(action, payload) {
  const body = JSON.stringify({ action, ...payload });
  let res;
  try {
    res = await fetch(SCRIPT_URL, {
      method: "POST",
      body,
      redirect: "follow",
    });
  } catch (networkErr) {
    // Se il redirect GAS fallisce, riprova con mode no-cors come fallback
    try {
      res = await fetch(SCRIPT_URL, {
        method: "POST",
        body,
        mode: "no-cors",
      });
      // no-cors restituisce opaque response — consideriamo successo
      return { status: "ok" };
    } catch (e2) {
      throw new Error(`Errore di rete: ${networkErr.message}`);
    }
  }
  // Google Apps Script a volte restituisce redirect con status non-ok
  // ma l'operazione va comunque a buon fine
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (json.error) throw new Error(json.error);
    return json;
  } catch {
    // Se non è JSON ma la risposta è arrivata, consideriamo successo
    if (res.status >= 200 && res.status < 400) return { status: "ok" };
    throw new Error(`Errore scrittura: ${res.status} — ${text.substring(0, 200)}`);
  }
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
};

/* ─────────────────────────────────────────────
   MODAL HELPERS
   ───────────────────────────────────────────── */
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

function printCredenziali(cliente) {
  const logo = "data:image/png;base64,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";
  const qr   = "data:image/png;base64,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";
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:sans-serif; background:#fff; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .card { width:148mm; border:2px solid #FF6B00; border-radius:16px; overflow:hidden; }
    .header { background:#FF6B00; padding:14px 20px; display:flex; align-items:center; gap:12px; }
    .header img { width:44px; height:44px; border-radius:50%; object-fit:cover; }
    .name { font-size:16px; font-weight:900; color:#fff; } .sub { font-size:11px; color:rgba(255,255,255,0.8); }
    .body { padding:20px; }
    .welcome { font-size:18px; font-weight:900; color:#111; margin-bottom:4px; }
    .ws { font-size:12px; color:#888; margin-bottom:16px; }
    .creds { background:#FFF3EB; border-radius:12px; padding:16px; margin-bottom:16px; display:flex; gap:12px; }
    .cred { flex:1; text-align:center; }
    .cl { font-size:10px; font-weight:700; color:#FF6B00; letter-spacing:1px; margin-bottom:6px; }
    .cv { font-size:22px; font-weight:900; color:#111; letter-spacing:2px; border:2px dashed #FF6B00; border-radius:8px; padding:8px; }
    .cd { width:1px; background:#FFD4B0; }
    .step { display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; }
    .sn { width:20px; height:20px; border-radius:6px; background:#FF6B00; color:#fff; font-size:11px; font-weight:900; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .st { font-size:11px; color:#444; line-height:1.4; }
    .st b { color:#FF6B00; }
    .bottom { display:flex; align-items:center; gap:16px; background:#f5f5f5; border-radius:10px; padding:12px; }
    .bottom img { width:70px; height:70px; }
    .url { font-size:13px; font-weight:800; color:#FF6B00; }
    .note { font-size:10px; color:#999; margin-top:4px; }
  </style></head><body>
  <div class="card">
    <div class="header"><img src="${logo}" alt="Logo"><div><div class="name">ASD Master Gym</div><div class="sub">Via Bussinello, 73 · Canelli (AT)</div></div></div>
    <div class="body">
      <div class="welcome">Benvenuto/a ${cliente.nome}! 💪</div>
      <div class="ws">Le tue credenziali per accedere alla scheda</div>
      <div class="creds">
        <div class="cred"><div class="cl">CODICE CLIENTE</div><div class="cv">${cliente.codice}</div></div>
        <div class="cd"></div>
        <div class="cred"><div class="cl">PIN SEGRETO</div><div class="cv">${cliente.pin}</div></div>
      </div>
      <div class="step"><div class="sn">1</div><div class="st">Inquadra il QR oppure vai su <b>mastergymcanelli.vercel.app</b></div></div>
      <div class="step"><div class="sn">2</div><div class="st">Inserisci il tuo <b>Codice</b> e il tuo <b>PIN</b></div></div>
      <div class="step"><div class="sn">3</div><div class="st"><b>iPhone:</b> Condividi → Aggiungi a Home | <b>Android:</b> Menu → Aggiungi a Home</div></div>
      <div class="bottom" style="margin-top:14px"><img src="${qr}" alt="QR"><div><div class="url">mastergymcanelli.vercel.app</div><div class="note">Per assistenza parla con il tuo trainer</div></div></div>
    </div>
  </div></body></html>`;
  const w = window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
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
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onWhatsApp(cliente)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              <Send size={14} /> WhatsApp
            </button>
            <button onClick={() => printCredenziali(cliente)} style={{ display: "flex", alignItems: "center", gap: 6, background: T.primaryLight, color: T.primary, border: `1px solid ${T.primaryBorder}`, borderRadius: 9, padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              <Printer size={14} /> Credenziali
            </button>
          </div>
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
    // Ordina gli esercizi alfabeticamente all'interno di ogni gruppo muscolare
    Object.keys(g).forEach(k => {
      g[k].sort((a, b) => (a.esercizio || "").localeCompare(b.esercizio || "", "it"));
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
                      {[...libreria].sort((a, b) => (a.esercizio || "").localeCompare(b.esercizio || "", "it")).map((lib, li) => <option key={li} value={lib.esercizio} />)}
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
                    {(muscoloSel[sed] ? (libByMuscolo[muscoloSel[sed]] || []) : [...libreria].sort((a, b) => (a.esercizio || "").localeCompare(b.esercizio || "", "it"))).map((lib, li) => (
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
      resetFlow();
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
    // Ordina gli esercizi alfabeticamente all'interno di ogni gruppo muscolare
    Object.keys(g).forEach(k => {
      g[k].sort((a, b) => (a.esercizio || "").localeCompare(b.esercizio || "", "it"));
    });
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
      <div style={{ padding: "12px 20px" }}>
        {items.length === 0 ? (
          <p style={{ fontSize: 13, color: T.textMut, margin: 0 }}>Nessun elemento ancora.</p>
        ) : items.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{s.nome}</div>
              {s.descrizione && <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{s.descrizione}</div>}
              {s.contatto && <div style={{ fontSize: 12, color: T.primary, marginTop: 2, fontWeight: 600 }}>{s.contatto}</div>}
            </div>
            <button onClick={() => onDelete(s)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.dangerLight, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.danger }}>
              <Trash2 size={12} /> Elimina
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpostazioniView({ data, onRefresh }) {
  const { servizi = [] } = data;
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo: "corso", nome: "", descrizione: "", contatto: "", instagram: "" });

  const corsi = servizi.filter(s => s.tipo === "corso");
  const professionisti = servizi.filter(s => s.tipo === "professionista");

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAdd = async () => {
    if (!form.nome) { alert("Inserisci il nome"); return; }
    setSaving(true);
    setSaveSuccess(false);
    try {
      await writeViaScript("addServizio", { servizio: form });
      // Piccolo delay per dare tempo a Google Sheet di scrivere
      await new Promise(r => setTimeout(r, 1200));
      await onRefresh();
      setShowForm(false);
      setForm({ tipo: "corso", nome: "", descrizione: "", contatto: "", instagram: "" });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) { alert("Errore nel salvataggio: " + err.message + "\n\nRiprova tra qualche secondo."); }
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
      {saveSuccess && (
        <div style={{ background: T.successLight, border: `1px solid ${T.success}`, borderRadius: 10, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 700, color: T.success }}>
          <CheckCircle size={16} /> Elemento salvato con successo!
        </div>
      )}
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
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="DESCRIZIONE">
              <Input value={form.descrizione} onChange={v => setForm(p => ({ ...p, descrizione: v }))} placeholder="Descrizione..." />
            </Field>
            <Field label="INSTAGRAM"><Input value={form.instagram} onChange={v => setForm(p => ({ ...p, instagram: v }))} placeholder="Es: @nomecorso" /></Field>
          </div>
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

        {waCliente && <WAModal cliente={waCliente} onClose={() => setWaCliente(null)} />}

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
