import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users, LayoutDashboard, Dumbbell, Search, ChevronRight, ArrowLeft,
  Phone, Calendar, AlertCircle, Send, X, Plus, Trash2, Edit3,
  RefreshCw, CheckCircle, Clock, MessageCircle, Eye, ChevronDown,
  ChevronUp, Loader, History, Activity, BookOpen, Star
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFIGURAZIONE
   ───────────────────────────────────────────── */
const SHEET_ID   = "1ncZxiiLhlfaWlKHmqZk1qb9tg5R6CBpT3cWKKuZrBXg";
const API_KEY    = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyS5ibCBMpgY-IYzNM2TiQ2lluuXluS7tnv1EcNFU0Ci0vfeBQiPTHDNOLCI1768kST/exec";
const BASE_URL   = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;
const APP_URL    = "https://mastergymcanelli.vercel.app";

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
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

const daysUntil = (d) => {
  if (!d) return 999;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
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
      {/* Brand */}
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

      {/* Nav */}
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
              fontSize: 13.5,
              transition: "all 0.15s",
            }}>
              <Icon size={17} strokeWidth={on ? 2.5 : 1.8} />
              {label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.sidebarBorder}` }}>
        <div style={{ color: "#52525B", fontSize: 10 }}>GymBoard v3 · by Marta</div>
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
      border: `1px solid ${T.border}`, flex: "1 1 180px",
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
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 500,
        maxHeight: "82vh", overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <MessageCircle size={19} color="#25D366" />
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
              Messaggio per {cliente.nome}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}>
            <X size={19} />
          </button>
        </div>

        <div style={{ padding: "18px 22px", overflow: "auto", flex: 1 }}>
          <pre style={{
            background: "#F4F4F6", borderRadius: 10, padding: 16, fontSize: 13,
            lineHeight: 1.65, color: "#333", whiteSpace: "pre-wrap", fontFamily: "inherit",
          }}>{msg}</pre>
        </div>

        <div style={{
          padding: "14px 22px", borderTop: `1px solid ${T.border}`,
          display: "flex", gap: 10, justifyContent: "flex-end",
        }}>
          <button onClick={copy} style={{
            padding: "9px 18px", borderRadius: 9, border: `1px solid ${T.border}`,
            background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
            color: copied ? T.success : T.text,
          }}>
            {copied ? "✅ Copiato!" : "📋 Copia"}
          </button>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noreferrer" style={{
              padding: "9px 18px", borderRadius: 9, border: "none",
              background: "#25D366", color: "#fff", textDecoration: "none",
              fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
            }}>
              <Send size={14} /> Apri WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONFIRM MODAL
   ───────────────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28, maxWidth: 380, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        <AlertCircle size={32} color={T.danger} style={{ marginBottom: 14 }} />
        <p style={{ fontSize: 15, color: T.text, marginBottom: 22, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            padding: "9px 18px", borderRadius: 9, border: `1px solid ${T.border}`,
            background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.text,
          }}>Annulla</button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: "9px 18px", borderRadius: 9, border: "none",
            background: T.danger, color: "#fff", cursor: "pointer",
            fontSize: 13, fontWeight: 700, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "..." : "Elimina"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD VIEW
   ───────────────────────────────────────────── */
function DashboardView({ data, onNavigate, onSelectCliente }) {
  const { clienti, schede, esercizi } = data;

  const stats = useMemo(() => {
    const inScadenza = clienti.filter(c => {
      const s = schede.find(sc => sc.scheda_id === c.scheda_attiva);
      const d = daysUntil(s?.data_scadenza);
      return d <= 7 && d > 0;
    }).length;
    return {
      totClienti:   clienti.length,
      inScadenza,
      schedeAttive: schede.length,
      totEsercizi:  esercizi.length,
    };
  }, [clienti, schede, esercizi]);

  const recenti = useMemo(() =>
    [...clienti]
      .sort((a, b) => (b.data_iscrizione || "").localeCompare(a.data_iscrizione || ""))
      .slice(0, 6),
    [clienti]
  );

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13.5, color: T.textSec }}>Panoramica della palestra</p>
      </div>

      {/* 4 STAT CARDS */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon={Users}       label="Clienti attivi"   value={stats.totClienti}   color={T.primary}  bg={T.primaryLight} />
        <StatCard icon={AlertCircle} label="Schede in scadenza" value={stats.inScadenza} color={T.danger}   bg={T.dangerLight} />
        <StatCard icon={BookOpen}    label="Schede create"    value={stats.schedeAttive}  color="#6366F1"    bg="#EEF2FF" />
        <StatCard icon={Dumbbell}    label="Esercizi totali"  value={stats.totEsercizi}   color={T.success}  bg={T.successLight} />
      </div>

      {/* ULTIMI CLIENTI */}
      <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{
          padding: "16px 22px", borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Ultimi clienti iscritti</span>
          <button onClick={() => onNavigate("clienti")} style={{
            background: T.primaryLight, border: `1px solid ${T.primaryBorder}`,
            borderRadius: 8, padding: "5px 13px", cursor: "pointer",
            color: T.primary, fontSize: 12, fontWeight: 700,
          }}>Vedi tutti →</button>
        </div>

        {recenti.map((c, i) => {
          const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
          const days   = daysUntil(scheda?.data_scadenza);
          return (
            <button key={c.codice} onClick={() => onSelectCliente(c)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14,
              padding: "13px 22px", border: "none",
              borderBottom: i < recenti.length - 1 ? `1px solid ${T.border}` : "none",
              background: "#fff", cursor: "pointer", textAlign: "left",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: T.primaryLight, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: T.primary,
              }}>{c.nome?.[0]}{c.cognome?.[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{c.nome} {c.cognome}</div>
                <div style={{ fontSize: 12, color: T.textSec }}>{scheda?.nome_scheda || "Nessuna scheda"}</div>
              </div>
              {days <= 7 && days > 0 && (
                <Badge color={T.danger} bg={T.dangerLight}>Scade tra {days}g</Badge>
              )}
              {days <= 0 && scheda && (
                <Badge color={T.danger} bg={T.dangerLight}>Scaduta</Badge>
              )}
              <span style={{
                fontSize: 11.5, fontWeight: 600, color: T.textMut,
                background: T.bg, padding: "4px 10px", borderRadius: 6,
              }}>{c.codice}</span>
              <ChevronRight size={15} color={T.textMut} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CLIENTI VIEW — griglia card
   ───────────────────────────────────────────── */
function ClientiView({ data, onSelectCliente }) {
  const [search, setSearch] = useState("");
  const { clienti, schede } = data;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return clienti;
    return clienti.filter(c =>
      `${c.nome} ${c.cognome} ${c.codice} ${c.email}`.toLowerCase().includes(q)
    );
  }, [clienti, search]);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Clienti</h1>
        <p style={{ fontSize: 13.5, color: T.textSec }}>{clienti.length} clienti registrati</p>
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 11,
        padding: "10px 16px", marginBottom: 20,
      }}>
        <Search size={17} color={T.textMut} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per nome, cognome o codice..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: T.text, background: "transparent" }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* GRIGLIA CARD */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14,
      }}>
        {filtered.map(c => {
          const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
          const days   = daysUntil(scheda?.data_scadenza);
          const expired  = days <= 0 && scheda;
          const expiring = days > 0 && days <= 7;

          return (
            <button key={c.codice} onClick={() => onSelectCliente(c)} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: "18px 20px", cursor: "pointer", textAlign: "left",
              transition: "box-shadow 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              {/* Avatar + nome */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12, background: T.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: T.primary, flexShrink: 0,
                }}>{c.nome?.[0]}{c.cognome?.[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 2 }}>
                    {c.nome} {c.cognome}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.textMut, fontWeight: 600 }}>{c.codice}</div>
                </div>
                {expiring && <Badge color={T.warning} bg={T.warningLight}>{days}g</Badge>}
                {expired  && <Badge color={T.danger}  bg={T.dangerLight}>Scaduta</Badge>}
              </div>

              {/* Scheda info */}
              <div style={{
                background: T.bg, borderRadius: 9, padding: "10px 12px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
                    {scheda?.nome_scheda || "Nessuna scheda"}
                  </div>
                  {scheda && (
                    <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
                      Scade: {fmt(scheda.data_scadenza)}
                    </div>
                  )}
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
   CLIENTE DETAIL — 3 box: attiva / passate / progressi
   ───────────────────────────────────────────── */
function ClienteDetail({ cliente, data, onBack, onWhatsApp, onRefresh }) {
  const { schede, esercizi } = data;

  // Scheda attiva
  const schedaAttiva = schede.find(s => s.scheda_id === cliente.scheda_attiva);

  // Schede passate (campo schede_passate = IDs separati da virgola)
  const schedePassate = useMemo(() => {
    if (!cliente.schede_passate) return [];
    return cliente.schede_passate
      .split(",")
      .map(id => id.trim())
      .filter(Boolean)
      .map(id => schede.find(s => s.scheda_id === id))
      .filter(Boolean);
  }, [cliente.schede_passate, schede]);

  // Esercizi per una scheda
  const exForScheda = (schedaId) =>
    esercizi
      .filter(e => e.scheda_id === schedaId)
      .sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));

  // Espansione giorni nella scheda attiva
  const [openGiorni, setOpenGiorni] = useState({});
  const toggleGiorno = (g) => setOpenGiorni(prev => ({ ...prev, [g]: !prev[g] }));

  // Espansione schede passate
  const [openPassate, setOpenPassate] = useState({});
  const togglePassata = (id) => setOpenPassate(prev => ({ ...prev, [id]: !prev[id] }));

  // Eliminazione scheda passata
  const [confirmDel, setConfirmDel] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [editMode,   setEditMode]   = useState(null); // per future estensioni

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await writeViaScript("deleteSchedaPassata", {
        codiceCliente: cliente.codice,
        schedaId: confirmDel,
      });
      await onRefresh();
      setConfirmDel(null);
    } catch (err) {
      alert("Errore eliminazione: " + err.message);
    } finally {
      setDelLoading(false);
    }
  };

  // Progressi (stub — da estendere con foglio "progressi")
  const hasProgressi = false; // set true quando il foglio progressi è disponibile

  const days = daysUntil(schedaAttiva?.data_scadenza);

  return (
    <div>
      {confirmDel && (
        <ConfirmModal
          message={`Sei sicura di voler eliminare la scheda "${schede.find(s => s.scheda_id === confirmDel)?.nome_scheda}"?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
          loading={delLoading}
        />
      )}

      {/* Torna indietro */}
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
        cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0,
      }}>
        <ArrowLeft size={16} /> Torna alla lista
      </button>

      {/* Header cliente */}
      <div style={{
        background: T.card, borderRadius: 14, border: `1px solid ${T.border}`,
        padding: "22px 24px", marginBottom: 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 13, background: T.primaryLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 19, fontWeight: 800, color: T.primary, flexShrink: 0,
          }}>{cliente.nome?.[0]}{cliente.cognome?.[0]}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: T.text, margin: 0 }}>
              {cliente.nome} {cliente.cognome}
            </h2>
            <div style={{ fontSize: 12.5, color: T.textSec, marginTop: 3 }}>
              Codice: <b style={{ color: T.text }}>{cliente.codice}</b>
              &nbsp;·&nbsp;PIN: <b style={{ color: T.text }}>{cliente.pin}</b>
            </div>
          </div>
          <button onClick={() => onWhatsApp(cliente)} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#25D366", color: "#fff", border: "none",
            borderRadius: 9, padding: "9px 16px", cursor: "pointer",
            fontSize: 13, fontWeight: 700,
          }}>
            <Send size={14} /> WhatsApp
          </button>
        </div>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {cliente.telefono && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Phone size={13} color={T.textSec} />
              <span style={{ fontSize: 13, color: T.textSec }}>{cliente.telefono}</span>
            </div>
          )}
          {cliente.data_iscrizione && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Calendar size={13} color={T.textSec} />
              <span style={{ fontSize: 13, color: T.textSec }}>Iscritto: {fmt(cliente.data_iscrizione)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── BOX 1: SCHEDA ATTIVA 🟢 ─── */}
      <SectionBox
        title="Scheda attiva"
        icon="🟢"
        badge={schedaAttiva ? undefined : "Nessuna scheda"}
      >
        {schedaAttiva ? (
          <SchedaExpandable
            scheda={schedaAttiva}
            esercizi={exForScheda(schedaAttiva.scheda_id)}
            openGiorni={openGiorni}
            onToggle={toggleGiorno}
            days={days}
            showActions={false}
          />
        ) : (
          <EmptyState icon={BookOpen} msg="Nessuna scheda attiva assegnata a questo cliente." />
        )}
      </SectionBox>

      {/* ─── BOX 2: SCHEDE PASSATE 🔘 ─── */}
      <SectionBox title="Schede passate" icon="🔘" badge={schedePassate.length > 0 ? `${schedePassate.length}` : undefined}>
        {schedePassate.length === 0 ? (
          <EmptyState icon={History} msg="Nessuna scheda passata registrata." />
        ) : (
          schedePassate.map(s => (
            <div key={s.scheda_id} style={{
              border: `1px solid ${T.border}`, borderRadius: 11, marginBottom: 10, overflow: "hidden",
            }}>
              {/* Header scheda passata */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", background: T.bg,
              }}>
                <button onClick={() => togglePassata(s.scheda_id)} style={{
                  display: "flex", alignItems: "center", gap: 10, background: "none",
                  border: "none", cursor: "pointer", flex: 1, textAlign: "left",
                }}>
                  {openPassate[s.scheda_id]
                    ? <ChevronUp size={16} color={T.textMut} />
                    : <ChevronDown size={16} color={T.textMut} />}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{s.nome_scheda}</div>
                    <div style={{ fontSize: 11.5, color: T.textSec }}>
                      {s.obiettivo} · {fmt(s.data_creazione)} → {fmt(s.data_scadenza)}
                    </div>
                  </div>
                </button>

                {/* Azioni: Vedi / Modifica / Elimina */}
                <div style={{ display: "flex", gap: 6 }}>
                  <ActionBtn
                    icon={Eye} label="Vedi"
                    onClick={() => togglePassata(s.scheda_id)}
                    color={T.textSec} bg={T.card}
                  />
                  <ActionBtn
                    icon={Edit3} label="Modifica"
                    onClick={() => alert("Modifica: apri il Google Sheet per cambiare i dati della scheda " + s.scheda_id)}
                    color="#6366F1" bg="#EEF2FF"
                  />
                  <ActionBtn
                    icon={Trash2} label="Elimina"
                    onClick={() => setConfirmDel(s.scheda_id)}
                    color={T.danger} bg={T.dangerLight}
                  />
                </div>
              </div>

              {/* Dettaglio espandibile */}
              {openPassate[s.scheda_id] && (
                <div style={{ padding: "14px 16px" }}>
                  <EserciziTable esercizi={exForScheda(s.scheda_id)} />
                </div>
              )}
            </div>
          ))
        )}
      </SectionBox>

      {/* ─── BOX 3: PROGRESSI ─── */}
      <SectionBox title="Progressi" icon="📈">
        {hasProgressi ? (
          <div>/* Grafici progressi — da implementare quando il foglio "progressi" è disponibile */</div>
        ) : (
          <EmptyState
            icon={Activity}
            msg="I progressi vengono salvati localmente sull'app del cliente. Nessun dato disponibile qui per ora."
          />
        )}
      </SectionBox>
    </div>
  );
}

/* Componenti helper per ClienteDetail */
function SectionBox({ title, icon, badge, children }) {
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
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{title}</span>
        {badge && (
          <span style={{
            marginLeft: 4, fontSize: 11.5, fontWeight: 700, padding: "2px 8px",
            borderRadius: 5, background: T.bg, color: T.textSec,
          }}>{badge}</span>
        )}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, color, bg }) {
  return (
    <button onClick={onClick} title={label} style={{
      display: "flex", alignItems: "center", gap: 5, padding: "6px 11px",
      borderRadius: 8, border: `1px solid ${T.border}`, background: bg,
      cursor: "pointer", fontSize: 12, fontWeight: 600, color,
    }}>
      <Icon size={13} /> {label}
    </button>
  );
}

function EmptyState({ icon: Icon, msg }) {
  return (
    <div style={{ padding: "20px 0", textAlign: "center", color: T.textSec }}>
      <Icon size={32} color={T.textMut} style={{ marginBottom: 10 }} />
      <p style={{ fontSize: 13.5, maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>{msg}</p>
    </div>
  );
}

function SchedaExpandable({ scheda, esercizi, openGiorni, onToggle, days }) {
  const giorni = [...new Set(esercizi.map(e => e.giorno || e.seduta))].filter(Boolean);

  return (
    <div>
      {/* Info scheda */}
      <div style={{
        background: T.bg, borderRadius: 10, padding: "13px 16px", marginBottom: 14,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{scheda.nome_scheda}</div>
          <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>
            {scheda.obiettivo} · {fmt(scheda.data_creazione)} → {fmt(scheda.data_scadenza)}
          </div>
        </div>
        {days <= 7 && (
          <Badge color={days > 0 ? T.warning : T.danger} bg={days > 0 ? T.warningLight : T.dangerLight}>
            {days > 0 ? `Scade tra ${days} giorni` : "Scaduta"}
          </Badge>
        )}
      </div>

      {/* Giorni */}
      {giorni.map(g => {
        const dayEx = esercizi
          .filter(e => (e.giorno || e.seduta) === g)
          .sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));
        const isOpen = openGiorni[g];

        return (
          <div key={g} style={{
            border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 8, overflow: "hidden",
          }}>
            <button onClick={() => onToggle(g)} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 14px", background: T.bg, border: "none", cursor: "pointer",
            }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: T.primary }}>{g}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11.5, color: T.textMut }}>{dayEx.length} esercizi</span>
                {isOpen ? <ChevronUp size={15} color={T.textMut} /> : <ChevronDown size={15} color={T.textMut} />}
              </div>
            </button>
            {isOpen && (
              <div style={{ padding: "10px 14px" }}>
                <EserciziTable esercizi={dayEx} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EserciziTable({ esercizi }) {
  if (!esercizi.length) return <p style={{ fontSize: 13, color: T.textSec }}>Nessun esercizio.</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: T.bg }}>
            {["#", "Esercizio", "Serie", "Reps", "Peso", "Riposo", "Muscolo"].map(h => (
              <th key={h} style={{
                padding: "8px 10px", fontSize: 11, fontWeight: 700, color: T.textMut,
                textAlign: "left", letterSpacing: "0.4px",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {esercizi.map((ex, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.border}22` }}>
              <td style={{ padding: "9px 10px", color: T.textMut, width: 30 }}>{ex.ordine || i + 1}</td>
              <td style={{ padding: "9px 10px", fontWeight: 600, color: T.text }}>{ex.esercizio}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.serie || "—"}</td>
              <td style={{ padding: "9px 10px", color: T.text }}>{ex.ripetizioni || "—"}</td>
              <td style={{ padding: "9px 10px", color: T.primary, fontWeight: 600 }}>
                {ex.peso_suggerito ? `${ex.peso_suggerito} kg` : "—"}
              </td>
              <td style={{ padding: "9px 10px", color: T.text }}>
                {ex.riposo_sec ? `${ex.riposo_sec}s` : ex.recupero || "—"}
              </td>
              <td style={{ padding: "9px 10px", color: T.textSec }}>
                {ex.gruppo_muscolare || ex.muscolo || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ESERCIZI VIEW — libreria + aggiunta
   ───────────────────────────────────────────── */
function EserciziView({ data, onRefresh }) {
  const { esercizi, schede } = data;
  const [search,      setSearch]      = useState("");
  const [filterScheda, setFilterScheda] = useState("all");
  const [showForm,    setShowForm]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [form, setForm] = useState({
    scheda_id: "", giorno: "", ordine: "", gruppo_muscolare: "",
    esercizio: "", serie: "", ripetizioni: "", peso_suggerito: "",
    riposo_sec: "", note: "", video_url: "",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return esercizi.filter(e => {
      const matchSearch = !q || `${e.esercizio} ${e.gruppo_muscolare || e.muscolo}`.toLowerCase().includes(q);
      const matchScheda = filterScheda === "all" || e.scheda_id === filterScheda;
      return matchSearch && matchScheda;
    });
  }, [esercizi, search, filterScheda]);

  // Raggruppati per muscolo
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(e => {
      const key = e.gruppo_muscolare || e.muscolo || "Altro";
      if (!g[key]) g[key] = [];
      g[key].push(e);
    });
    return g;
  }, [filtered]);

  const handleSubmit = async () => {
    if (!form.esercizio || !form.scheda_id) {
      alert("Compila almeno: Scheda e Nome esercizio");
      return;
    }
    setSaving(true);
    try {
      await writeViaScript("addEsercizio", { esercizio: form });
      await onRefresh();
      setShowForm(false);
      setForm({
        scheda_id: "", giorno: "", ordine: "", gruppo_muscolare: "",
        esercizio: "", serie: "", ripetizioni: "", peso_suggerito: "",
        riposo_sec: "", note: "", video_url: "",
      });
    } catch (err) {
      alert("Errore salvataggio: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = (field, placeholder, type = "text") => (
    <input
      type={type} placeholder={placeholder} value={form[field]}
      onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
      style={{
        border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px",
        fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%",
      }}
    />
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>Esercizi</h1>
          <p style={{ fontSize: 13.5, color: T.textSec }}>{esercizi.length} esercizi in libreria</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{
          display: "flex", alignItems: "center", gap: 7,
          background: T.primary, color: "#fff", border: "none",
          borderRadius: 10, padding: "10px 18px", cursor: "pointer",
          fontSize: 13.5, fontWeight: 700,
        }}>
          <Plus size={17} /> Aggiungi esercizio
        </button>
      </div>

      {/* FORM AGGIUNTA */}
      {showForm && (
        <div style={{
          background: T.card, border: `1px solid ${T.primaryBorder}`, borderRadius: 14,
          padding: "22px 24px", marginBottom: 22,
          boxShadow: "0 4px 20px rgba(255,107,0,0.08)",
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 18 }}>
            ➕ Nuovo esercizio
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {/* Scheda */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5 }}>
                SCHEDA *
              </label>
              <select
                value={form.scheda_id}
                onChange={e => setForm(prev => ({ ...prev, scheda_id: e.target.value }))}
                style={{
                  border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px",
                  fontSize: 13, color: T.text, outline: "none", background: "#fff", width: "100%",
                }}
              >
                <option value="">Seleziona scheda...</option>
                {schede.map(s => (
                  <option key={s.scheda_id} value={s.scheda_id}>
                    {s.scheda_id} — {s.nome_scheda}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5 }}>
                GIORNO/SEDUTA
              </label>
              {inp("giorno", "Es: Giorno 1 - Petto e Tricipiti")}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5 }}>
                NOME ESERCIZIO *
              </label>
              {inp("esercizio", "Es: Panca piana")}
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5 }}>
                MUSCOLO
              </label>
              {inp("gruppo_muscolare", "Es: Petto")}
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5 }}>
                ORDINE
              </label>
              {inp("ordine", "Es: 1", "number")}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[
              ["serie",          "SERIE",    "Es: 4"],
              ["ripetizioni",    "REPS",     "Es: 8-10"],
              ["peso_suggerito", "PESO (kg)","Es: 80"],
              ["riposo_sec",     "RIPOSO (s)","Es: 90"],
            ].map(([field, label, ph]) => (
              <div key={field}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5 }}>
                  {label}
                </label>
                {inp(field, ph)}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5 }}>
                NOTE TRAINER
              </label>
              {inp("note", "Es: Scendere fino al petto")}
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: T.textSec, display: "block", marginBottom: 5 }}>
                VIDEO URL (YouTube)
              </label>
              {inp("video_url", "https://youtube.com/watch?v=...")}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowForm(false)} style={{
              padding: "9px 18px", borderRadius: 9, border: `1px solid ${T.border}`,
              background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.text,
            }}>Annulla</button>
            <button onClick={handleSubmit} disabled={saving} style={{
              padding: "9px 22px", borderRadius: 9, border: "none",
              background: T.primary, color: "#fff", cursor: "pointer",
              fontSize: 13, fontWeight: 700, opacity: saving ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 7,
            }}>
              {saving ? <><Loader size={14} /> Salvataggio...</> : <><Plus size={14} /> Salva esercizio</>}
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
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cerca esercizio..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: T.text, background: "transparent" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMut }}>
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={filterScheda}
          onChange={e => setFilterScheda(e.target.value)}
          style={{
            border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px",
            fontSize: 13, color: T.text, background: T.card, outline: "none", cursor: "pointer",
          }}
        >
          <option value="all">Tutte le schede</option>
          {schede.map(s => (
            <option key={s.scheda_id} value={s.scheda_id}>{s.scheda_id} — {s.nome_scheda}</option>
          ))}
        </select>
      </div>

      {/* LIBRERIA RAGGRUPPATA */}
      {Object.entries(grouped).length === 0 ? (
        <EmptyState icon={Dumbbell} msg="Nessun esercizio trovato." />
      ) : (
        Object.entries(grouped).map(([muscolo, exs]) => (
          <div key={muscolo} style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 12, fontWeight: 800, color: T.primary, letterSpacing: "1px",
              textTransform: "uppercase", marginBottom: 10, padding: "0 2px",
            }}>{muscolo}</div>

            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden",
            }}>
              {exs.map((ex, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                  borderBottom: i < exs.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: T.primaryLight,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: T.primary, flexShrink: 0,
                  }}>{ex.ordine || i + 1}</div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{ex.esercizio}</div>
                    <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                      {ex.serie}×{ex.ripetizioni}
                      {ex.peso_suggerito ? ` · ${ex.peso_suggerito}kg` : ""}
                      {ex.riposo_sec ? ` · ${ex.riposo_sec}s riposo` : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <span style={{
                      fontSize: 11, background: T.bg, color: T.textMut,
                      padding: "3px 9px", borderRadius: 6, fontWeight: 600,
                    }}>{ex.scheda_id}</span>

                    {ex.video_url && (
                      <a href={ex.video_url} target="_blank" rel="noreferrer" style={{
                        fontSize: 11, fontWeight: 700, color: "#EF4444",
                        background: "#FEF2F2", padding: "3px 9px", borderRadius: 6,
                        textDecoration: "none",
                      }}>▶ Video</a>
                    )}

                    {ex.note && (
                      <span title={ex.note} style={{ cursor: "help", fontSize: 15 }}>📝</span>
                    )}
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
    <div style={{
      minHeight: "100vh", background: T.bg,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 11, background: T.primary,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
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
    <div style={{
      minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14,
    }}>
      <AlertCircle size={44} color={T.danger} />
      <p style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Errore di connessione</p>
      <p style={{ fontSize: 13, color: T.textSec, maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>{error}</p>
      <button onClick={onRetry} style={{
        background: T.primary, border: "none", borderRadius: 10,
        padding: "11px 26px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <RefreshCw size={16} /> Riprova
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP PRINCIPALE
   ───────────────────────────────────────────── */
export default function AdminPanel() {
  const [data,            setData]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [page,            setPage]            = useState("dashboard");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [waCliente,       setWaCliente]       = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchAllData();
      setData(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen error={error} onRetry={loadData} />;

  const navigate = (p) => {
    setPage(p);
    setSelectedCliente(null);
  };

  const openCliente = (c) => {
    setSelectedCliente(c);
    setPage("clienteDetail");
  };

  // Sidebar active highlight
  const sidebarActive =
    page === "clienteDetail" ? "clienti" : page;

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
        {/* Refresh bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <button onClick={loadData} style={{
            display: "flex", alignItems: "center", gap: 7,
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 9,
            padding: "7px 14px", cursor: "pointer", fontSize: 12.5, color: T.textSec, fontWeight: 600,
          }}>
            <RefreshCw size={14} /> Aggiorna dati
          </button>
        </div>

        {/* WhatsApp modal */}
        {waCliente && (
          <WAModal cliente={waCliente} onClose={() => setWaCliente(null)} />
        )}

        {/* PAGINE */}
        {page === "dashboard" && (
          <DashboardView data={data} onNavigate={navigate} onSelectCliente={openCliente} />
        )}
        {page === "clienti" && (
          <ClientiView data={data} onSelectCliente={openCliente} />
        )}
        {page === "clienteDetail" && selectedCliente && (
          <ClienteDetail
            cliente={selectedCliente}
            data={data}
            onBack={() => navigate("clienti")}
            onWhatsApp={setWaCliente}
            onRefresh={loadData}
          />
        )}
        {page === "esercizi" && (
          <EserciziView data={data} onRefresh={loadData} />
        )}
      </div>
    </div>
  );
}
