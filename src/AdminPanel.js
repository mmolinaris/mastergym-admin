import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users, ClipboardList, LayoutDashboard, Search, ChevronRight,
  Phone, Instagram, MapPin, Dumbbell, Calendar, Target, RefreshCw,
  MessageCircle, Eye, ArrowLeft, Timer, Video, AlertCircle,
  UserPlus, FileText, Send, X, ChevronDown, ChevronUp,
  Loader, LogOut, Settings, Zap, Award, Clock, Hash
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFIGURAZIONE GOOGLE SHEETS
   ───────────────────────────────────────────── */
const SHEET_ID = "1No3lEcFiI6nuLuAeMjmD5YFyfgp50mzJp4XSh1CcOxY";
const API_KEY = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;
const APP_URL = "https://mastergymcanelli.vercel.app";

async function fetchSheet(tabName) {
  const url = `${BASE_URL}/${encodeURIComponent(tabName)}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Errore: ${res.status}`);
  const data = await res.json();
  const [headers, ...rows] = data.values || [];
  return rows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""])));
}

async function fetchAllData() {
  const [configRows, clienti, schede, esercizi] = await Promise.all([
    fetchSheet("config"), fetchSheet("clienti"), fetchSheet("schede"), fetchSheet("esercizi"),
  ]);
  const config = Object.fromEntries(configRows.map(r => [r.chiave, r.valore]));
  return { config, clienti, schede, esercizi };
}

const formatDate = (d) => {
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
  bg: "#F7F7F8",
  card: "#FFFFFF",
  border: "#E8E8EC",
  text: "#1A1A2E",
  textSec: "#6B7080",
  textMut: "#9CA3AF",
  primary: "#FF6B00",
  primaryLight: "#FFF3EB",
  primaryBorder: "#FFD4B0",
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  success: "#22C55E",
  successLight: "#F0FDF4",
  sidebar: "#1A1A2E",
  sidebarHover: "#2A2A42",
  sidebarActive: "#FF6B00",
};

/* ─────────────────────────────────────────────
   SIDEBAR
   ───────────────────────────────────────────── */
function Sidebar({ active, onNavigate, config }) {
  const items = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "clienti", icon: Users, label: "Clienti" },
    { id: "schede", icon: ClipboardList, label: "Schede" },
  ];

  return (
    <div style={{
      width: 240, minHeight: "100vh", background: T.sidebar,
      display: "flex", flexDirection: "column", flexShrink: 0,
      borderRight: "1px solid #2A2A42"
    }}>
      {/* Brand */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid #2A2A42" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: T.primary,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Dumbbell size={22} color="white" />
          </div>
          <div>
            <div style={{ color: "white", fontSize: 15, fontWeight: 800 }}>
              {config?.nome_palestra || "GymBoard"}
            </div>
            <div style={{ color: "#888", fontSize: 11 }}>Pannello Gestione</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ padding: "16px 12px", flex: 1 }}>
        {items.map(item => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer",
              marginBottom: 4,
              background: isActive ? T.sidebarActive : "transparent",
              color: isActive ? "white" : "#AAB",
              fontWeight: isActive ? 700 : 500, fontSize: 14,
              transition: "all 0.15s"
            }}>
              <Icon size={19} strokeWidth={isActive ? 2.2 : 1.5} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #2A2A42" }}>
        <div style={{ color: "#666", fontSize: 11 }}>GymBoard v1.0</div>
        <div style={{ color: "#555", fontSize: 10, marginTop: 2 }}>by Marta Molinaris</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
   ───────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div style={{
      background: T.card, borderRadius: 14, padding: "20px",
      border: `1px solid ${T.border}`, flex: 1, minWidth: 180
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11, background: bgColor,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, color: T.textSec }}>{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WHATSAPP MESSAGE MODAL
   ───────────────────────────────────────────── */
function WhatsAppModal({ cliente, onClose }) {
  const msg = `🏋️ *Master Gym — La tua scheda di allenamento!*

Ciao ${cliente.nome}! Da oggi puoi vedere la tua scheda direttamente sul telefono.

📲 *Apri questo link:*
${APP_URL}

🔑 Il tuo codice: ${cliente.codice}
🔒 Il tuo PIN: ${cliente.pin}

━━━━━━━━━━━━━━━

💡 *Vuoi l'icona sul telefono come un'app vera?*

*Se hai iPhone:*
1. Apri il link con *Safari* (non da WhatsApp!)
2. Tocca *Condividi* (il quadrato con la freccia ⬆️ in basso)
3. Scorri e tocca *"Aggiungi alla schermata Home"*
4. Tocca *"Aggiungi"*

*Se hai Android:*
1. Apri il link con *Chrome*
2. Tocca i tre puntini ⋮ in alto a destra
3. Tocca *"Aggiungi a schermata Home"*
4. Tocca *"Aggiungi"*

✅ Fatto! Buon allenamento! 💪`;

  const whatsappUrl = cliente.telefono
    ? `https://wa.me/${cliente.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`
    : null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: "white", borderRadius: 16, width: "100%", maxWidth: 520,
        maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column"
      }}>
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MessageCircle size={20} color="#25D366" />
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Messaggio per {cliente.nome}</span>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", color: T.textMut
          }}><X size={20} /></button>
        </div>

        <div style={{ padding: "20px 24px", overflow: "auto", flex: 1 }}>
          <div style={{
            background: "#F0F0F0", borderRadius: 12, padding: 16,
            fontSize: 13, lineHeight: 1.6, color: "#333",
            whiteSpace: "pre-wrap", fontFamily: "system-ui"
          }}>
            {msg}
          </div>
        </div>

        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${T.border}`,
          display: "flex", gap: 10, justifyContent: "flex-end"
        }}>
          <button onClick={() => navigator.clipboard.writeText(msg)} style={{
            padding: "10px 20px", borderRadius: 10, border: `1px solid ${T.border}`,
            background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.text
          }}>
            📋 Copia testo
          </button>
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: "#25D366", color: "white", textDecoration: "none",
              fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6
            }}>
              <Send size={15} /> Apri WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD
   ───────────────────────────────────────────── */
function DashboardView({ data, onNavigate, onSelectCliente }) {
  const { clienti, schede, esercizi } = data;

  const stats = useMemo(() => {
    const expiring = clienti.filter(c => {
      const s = schede.find(sc => sc.scheda_id === c.scheda_attiva);
      return s && daysUntil(s.data_scadenza) <= 7 && daysUntil(s.data_scadenza) > 0;
    });
    return {
      totClienti: clienti.length,
      schedeAttive: schede.length,
      inScadenza: expiring.length,
      totEsercizi: esercizi.length,
    };
  }, [clienti, schede, esercizi]);

  const recentClienti = useMemo(() =>
    [...clienti].sort((a, b) => (b.data_iscrizione || "").localeCompare(a.data_iscrizione || "")).slice(0, 5),
    [clienti]
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: T.textSec }}>Panoramica della tua palestra</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon={Users} label="Clienti attivi" value={stats.totClienti} color={T.primary} bgColor={T.primaryLight} />
        <StatCard icon={ClipboardList} label="Schede create" value={stats.schedeAttive} color="#6366F1" bgColor="#EEF2FF" />
        <StatCard icon={AlertCircle} label="In scadenza" value={stats.inScadenza} color={T.danger} bgColor={T.dangerLight} />
        <StatCard icon={Dumbbell} label="Esercizi totali" value={stats.totEsercizi} color={T.success} bgColor={T.successLight} />
      </div>

      {/* Recent clients */}
      <div style={{
        background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: "hidden"
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Ultimi clienti</span>
          <button onClick={() => onNavigate("clienti")} style={{
            background: T.primaryLight, border: `1px solid ${T.primaryBorder}`,
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            color: T.primary, fontSize: 12, fontWeight: 700
          }}>Vedi tutti →</button>
        </div>
        {recentClienti.map(c => {
          const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
          return (
            <button key={c.codice} onClick={() => onSelectCliente(c)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14,
              padding: "14px 22px", border: "none", borderBottom: `1px solid ${T.border}`,
              background: "white", cursor: "pointer", textAlign: "left"
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: T.primaryLight,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: T.primary
              }}>{c.nome?.[0]}{c.cognome?.[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{c.nome} {c.cognome}</div>
                <div style={{ fontSize: 12, color: T.textSec }}>{scheda?.nome_scheda || "Nessuna scheda"}</div>
              </div>
              <div style={{
                fontSize: 11, color: T.textMut, background: T.bg,
                padding: "4px 10px", borderRadius: 6, fontWeight: 600
              }}>{c.codice}</div>
              <ChevronRight size={16} color={T.textMut} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CLIENTI LIST
   ───────────────────────────────────────────── */
function ClientiView({ data, onSelectCliente }) {
  const [search, setSearch] = useState("");
  const { clienti, schede } = data;

  const filtered = useMemo(() => {
    if (!search.trim()) return clienti;
    const q = search.toLowerCase();
    return clienti.filter(c =>
      `${c.nome} ${c.cognome} ${c.codice} ${c.email}`.toLowerCase().includes(q)
    );
  }, [clienti, search]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 4 }}>Clienti</h1>
        <p style={{ fontSize: 14, color: T.textSec }}>{clienti.length} clienti registrati</p>
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
        padding: "10px 16px", marginBottom: 20
      }}>
        <Search size={18} color={T.textMut} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per nome, cognome o codice..."
          style={{
            flex: 1, border: "none", outline: "none", fontSize: 14,
            color: T.text, background: "transparent"
          }} />
        {search && (
          <button onClick={() => setSearch("")} style={{
            background: "none", border: "none", cursor: "pointer", color: T.textMut
          }}><X size={16} /></button>
        )}
      </div>

      {/* Client cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(c => {
          const scheda = schede.find(s => s.scheda_id === c.scheda_attiva);
          const days = scheda ? daysUntil(scheda.data_scadenza) : 999;
          const expiring = days <= 7 && days > 0;
          const expired = days <= 0;

          return (
            <button key={c.codice} onClick={() => onSelectCliente(c)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14,
              padding: "16px 20px", border: `1px solid ${T.border}`, borderRadius: 14,
              background: T.card, cursor: "pointer", textAlign: "left"
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12, background: T.primaryLight,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 800, color: T.primary, flexShrink: 0
              }}>{c.nome?.[0]}{c.cognome?.[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{c.nome} {c.cognome}</div>
                <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                  {scheda?.nome_scheda || "Nessuna scheda"} • Iscritto: {formatDate(c.data_iscrizione)}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {expiring && <span style={{
                  fontSize: 11, fontWeight: 700, color: T.danger, background: T.dangerLight,
                  padding: "3px 8px", borderRadius: 6
                }}>Scade tra {days}g</span>}
                {expired && <span style={{
                  fontSize: 11, fontWeight: 700, color: T.danger, background: T.dangerLight,
                  padding: "3px 8px", borderRadius: 6
                }}>Scaduta</span>}
                <span style={{
                  fontSize: 12, fontWeight: 600, color: T.textMut, background: T.bg,
                  padding: "4px 10px", borderRadius: 6
                }}>{c.codice}</span>
                <ChevronRight size={16} color={T.textMut} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CLIENT DETAIL
   ───────────────────────────────────────────── */
function ClienteDetail({ cliente, data, onBack, onWhatsApp }) {
  const { schede, esercizi } = data;
  const scheda = schede.find(s => s.scheda_id === cliente.scheda_attiva);
  const schedaExercises = esercizi.filter(e => e.scheda_id === cliente.scheda_attiva);
  const giorni = [...new Set(schedaExercises.map(e => e.giorno || e.seduta))].filter(Boolean);

  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, background: "none",
        border: "none", cursor: "pointer", color: T.primary, fontSize: 13,
        fontWeight: 600, marginBottom: 20, padding: 0
      }}>
        <ArrowLeft size={16} /> Torna alla lista
      </button>

      {/* Header */}
      <div style={{
        background: T.card, borderRadius: 16, border: `1px solid ${T.border}`,
        padding: "24px", marginBottom: 20
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: T.primaryLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: T.primary
          }}>{cliente.nome?.[0]}{cliente.cognome?.[0]}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>
              {cliente.nome} {cliente.cognome}
            </h2>
            <div style={{ fontSize: 13, color: T.textSec, marginTop: 2 }}>
              Codice: <b>{cliente.codice}</b> • PIN: <b>{cliente.pin}</b>
            </div>
          </div>
          <button onClick={() => onWhatsApp(cliente)} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#25D366", color: "white", border: "none",
            borderRadius: 10, padding: "10px 18px", cursor: "pointer",
            fontSize: 13, fontWeight: 700
          }}>
            <Send size={15} /> WhatsApp
          </button>
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            [Phone, cliente.telefono],
            [Calendar, `Iscritto: ${formatDate(cliente.data_iscrizione)}`],
          ].filter(([_, v]) => v).map(([Icon, val], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon size={15} color={T.textSec} />
              <span style={{ fontSize: 13, color: T.textSec }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active workout card */}
      {scheda ? (
        <div style={{
          background: T.card, borderRadius: 16, border: `1px solid ${T.border}`,
          overflow: "hidden"
        }}>
          <div style={{
            padding: "18px 24px", borderBottom: `1px solid ${T.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: "1px", marginBottom: 4 }}>
                SCHEDA ATTIVA
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{scheda.nome_scheda}</div>
              <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
                {scheda.obiettivo} • {formatDate(scheda.data_creazione)} → {formatDate(scheda.data_scadenza)}
              </div>
            </div>
            {daysUntil(scheda.data_scadenza) <= 7 && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8,
                color: T.danger, background: T.dangerLight
              }}>
                {daysUntil(scheda.data_scadenza) > 0
                  ? `Scade tra ${daysUntil(scheda.data_scadenza)}g`
                  : "Scaduta"}
              </span>
            )}
          </div>

          {/* Exercises by day */}
          {giorni.map(g => {
            const dayExs = schedaExercises
              .filter(e => (e.giorno || e.seduta) === g)
              .sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));

            return (
              <div key={g} style={{ borderBottom: `1px solid ${T.border}` }}>
                <div style={{
                  padding: "12px 24px", background: T.bg,
                  fontSize: 13, fontWeight: 700, color: T.primary
                }}>{g} {dayExs[0]?.tipo_seduta ? `— ${dayExs[0].tipo_seduta}` : ""}</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: T.bg }}>
                      {["#", "Esercizio", "Reps", "Serie", "Rec.", "Muscolo"].map(h => (
                        <th key={h} style={{
                          padding: "8px 12px", fontSize: 11, fontWeight: 700,
                          color: T.textMut, textAlign: "left", letterSpacing: "0.5px"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dayExs.map((ex, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.border}22` }}>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: T.textMut, width: 36 }}>{ex.ordine}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: T.text }}>{ex.esercizio}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.ripetizioni || ex.ripetizioni || "—"}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.serie || "—"}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.recupero || ex.riposo_sec ? `${ex.riposo_sec}s` : "—"}</td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: T.textSec }}>{ex.muscolo || ex.gruppo_muscolare || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          background: T.card, borderRadius: 16, border: `1px solid ${T.border}`,
          padding: 40, textAlign: "center"
        }}>
          <ClipboardList size={40} color={T.textMut} style={{ marginBottom: 12 }} />
          <p style={{ color: T.textSec, fontSize: 14 }}>Nessuna scheda assegnata a questo cliente</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCHEDE VIEW
   ───────────────────────────────────────────── */
function SchedeView({ data, onSelectScheda }) {
  const { schede, clienti, esercizi } = data;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 4 }}>Schede</h1>
        <p style={{ fontSize: 14, color: T.textSec }}>{schede.length} schede create</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {schede.map(s => {
          const numClienti = clienti.filter(c => c.scheda_attiva === s.scheda_id).length;
          const numEx = esercizi.filter(e => e.scheda_id === s.scheda_id).length;
          const giorni = [...new Set(esercizi.filter(e => e.scheda_id === s.scheda_id).map(e => e.giorno || e.seduta))].length;
          const days = daysUntil(s.data_scadenza);

          return (
            <button key={s.scheda_id} onClick={() => onSelectScheda(s)} style={{
              width: "100%", background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 14, padding: "20px", cursor: "pointer", textAlign: "left"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{s.nome_scheda}</div>
                  <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{s.obiettivo}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                  background: T.primaryLight, color: T.primary
                }}>{s.scheda_id}</span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Users size={14} color={T.textSec} />
                  <span style={{ fontSize: 12, color: T.textSec }}>{numClienti} clienti</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Calendar size={14} color={T.textSec} />
                  <span style={{ fontSize: 12, color: T.textSec }}>{giorni} sedute</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Dumbbell size={14} color={T.textSec} />
                  <span style={{ fontSize: 12, color: T.textSec }}>{numEx} esercizi</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCHEDA DETAIL
   ───────────────────────────────────────────── */
function SchedaDetail({ scheda, data, onBack }) {
  const { esercizi, clienti } = data;
  const schedaEx = esercizi.filter(e => e.scheda_id === scheda.scheda_id);
  const giorni = [...new Set(schedaEx.map(e => e.giorno || e.seduta))].filter(Boolean);
  const assignedClienti = clienti.filter(c => c.scheda_attiva === scheda.scheda_id);

  return (
    <div>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, background: "none",
        border: "none", cursor: "pointer", color: T.primary, fontSize: 13,
        fontWeight: 600, marginBottom: 20, padding: 0
      }}>
        <ArrowLeft size={16} /> Torna alle schede
      </button>

      <div style={{
        background: T.card, borderRadius: 16, border: `1px solid ${T.border}`,
        padding: 24, marginBottom: 20
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, marginBottom: 8 }}>
          {scheda.nome_scheda}
        </h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: T.textSec }}>Obiettivo: <b>{scheda.obiettivo}</b></span>
          <span style={{ fontSize: 13, color: T.textSec }}>Creata: <b>{formatDate(scheda.data_creazione)}</b></span>
          <span style={{ fontSize: 13, color: T.textSec }}>Scadenza: <b>{formatDate(scheda.data_scadenza)}</b></span>
        </div>
        {assignedClienti.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: T.textSec }}>Assegnata a:</span>
            {assignedClienti.map(c => (
              <span key={c.codice} style={{
                fontSize: 12, fontWeight: 600, background: T.primaryLight,
                color: T.primary, padding: "2px 8px", borderRadius: 5
              }}>{c.nome} {c.cognome}</span>
            ))}
          </div>
        )}
      </div>

      {giorni.map(g => {
        const dayExs = schedaEx
          .filter(e => (e.giorno || e.seduta) === g)
          .sort((a, b) => parseInt(a.ordine || 0) - parseInt(b.ordine || 0));

        return (
          <div key={g} style={{
            background: T.card, borderRadius: 14, border: `1px solid ${T.border}`,
            overflow: "hidden", marginBottom: 12
          }}>
            <div style={{
              padding: "14px 20px", background: T.bg, borderBottom: `1px solid ${T.border}`,
              fontSize: 14, fontWeight: 700, color: T.primary
            }}>{g} {dayExs[0]?.tipo_seduta ? `— ${dayExs[0].tipo_seduta}` : ""}</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["#", "Esercizio", "Reps", "Serie", "Rec.", "Muscolo", "Peso sug.", "Note"].map(h => (
                    <th key={h} style={{
                      padding: "10px 12px", fontSize: 11, fontWeight: 700,
                      color: T.textMut, textAlign: "left", borderBottom: `1px solid ${T.border}`
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayExs.map((ex, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}22` }}>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: T.textMut }}>{ex.ordine}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: T.text }}>{ex.esercizio}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.ripetizioni || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.serie || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: T.text }}>{ex.recupero || (ex.riposo_sec ? `${ex.riposo_sec}s` : "—")}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: T.textSec }}>{ex.muscolo || ex.gruppo_muscolare || "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: T.primary, fontWeight: 600 }}>{ex.peso_suggerito ? `${ex.peso_suggerito} kg` : "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: T.textSec }}>{ex.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING / ERROR
   ───────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", background: T.bg, display: "flex",
      alignItems: "center", justifyContent: "center", gap: 12
    }}>
      <Dumbbell size={32} color={T.primary} />
      <span style={{ color: T.textSec, fontSize: 15 }}>Caricamento pannello...</span>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{
      minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16
    }}>
      <AlertCircle size={40} color={T.danger} />
      <p style={{ color: T.text, fontSize: 16, fontWeight: 700 }}>Errore di connessione</p>
      <p style={{ color: T.textSec, fontSize: 13, maxWidth: 300, textAlign: "center" }}>{error}</p>
      <button onClick={onRetry} style={{
        background: T.primary, border: "none", borderRadius: 10,
        padding: "12px 28px", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer"
      }}>Riprova</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP PRINCIPALE
   ───────────────────────────────────────────── */
export default function AdminPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedScheda, setSelectedScheda] = useState(null);
  const [whatsappCliente, setWhatsappCliente] = useState(null);

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
  if (error) return <ErrorScreen error={error} onRetry={loadData} />;

  const navigate = (p) => {
    setPage(p);
    setSelectedCliente(null);
    setSelectedScheda(null);
  };

  const handleSelectCliente = (c) => {
    setSelectedCliente(c);
    setPage("clienteDetail");
  };

  const handleSelectScheda = (s) => {
    setSelectedScheda(s);
    setPage("schedaDetail");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDD; border-radius: 3px; }
        button { font-family: inherit; }
        table { font-family: inherit; }
      `}</style>

      <Sidebar active={page === "clienteDetail" ? "clienti" : page === "schedaDetail" ? "schede" : page}
        onNavigate={navigate} config={data.config} />

      <div style={{ flex: 1, padding: "32px 40px", maxWidth: 1100, overflow: "auto" }}>
        {whatsappCliente && (
          <WhatsAppModal cliente={whatsappCliente} onClose={() => setWhatsappCliente(null)} />
        )}

        {page === "dashboard" && (
          <DashboardView data={data} onNavigate={navigate} onSelectCliente={handleSelectCliente} />
        )}
        {page === "clienti" && (
          <ClientiView data={data} onSelectCliente={handleSelectCliente} />
        )}
        {page === "clienteDetail" && selectedCliente && (
          <ClienteDetail cliente={selectedCliente} data={data}
            onBack={() => navigate("clienti")}
            onWhatsApp={(c) => setWhatsappCliente(c)} />
        )}
        {page === "schede" && (
          <SchedeView data={data} onSelectScheda={handleSelectScheda} />
        )}
        {page === "schedaDetail" && selectedScheda && (
          <SchedaDetail scheda={selectedScheda} data={data}
            onBack={() => navigate("schede")} />
        )}
      </div>
    </div>
  );
}
