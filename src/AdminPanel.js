 import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users, ClipboardList, LayoutDashboard, Search, ChevronRight,
  Dumbbell, Calendar, AlertCircle, ArrowLeft, X, Send,
  Plus, Trash2, Save, Check, Edit2, Clock, TrendingUp
} from "lucide-react";

const SHEET_ID    = "1ncZxiiLhlfaWlKHmqZk1qb9tg5R6CBpT3cWKKuZrBXg";
const API_KEY     = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";
const BASE_URL    = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;
const APP_URL     = "https://mastergymboard.vercel.app";
const LOGO_URL    = "https://raw.githubusercontent.com/mmolinaris/mastergymboard/main/public/icon-512.png";
const APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbyS5ibCBMpgY-IYzNM2TiQ2lluuXluS7tnv1EcNFU0Ci0vfeBQiPTHDNOLCI1768kST/exec";

async function writeRow(sheet, row) {
  await fetch(APPS_SCRIPT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "append", sheet, row }),
    mode: "no-cors",
  });
}

async function deleteRow(sheet, colIndex, value) {
  await fetch(APPS_SCRIPT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", sheet, colIndex, value }),
    mode: "no-cors",
  });
}

const T = {
  bg: "#F7F7F8", card: "#FFFFFF", border: "#E8E8EC",
  text: "#1A1A2E", textSec: "#6B7080", textMut: "#9CA3AF",
  primary: "#D32F2F", primaryLight: "#FFEBEE", primaryBorder: "#FFCDD2",
  danger: "#EF4444", dangerLight: "#FEF2F2",
  success: "#22C55E", successLight: "#F0FDF4",
  sidebar: "#1A1A1A",
};

// ─── API ───────────────────────────────────────────────────────────────────
async function fetchSheet(tab) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(tab)}?key=${API_KEY}`);
  if (!res.ok) throw new Error(`Errore: ${res.status}`);
  const d = await res.json();
  const [h, ...rows] = d.values || [];
  if (!h) return [];
  return rows.map(r => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] ?? "").toString().trim()])));
}

async function fetchAllData() {
  const [cf, cl, sc, ex] = await Promise.all([
    fetchSheet("config"), fetchSheet("clienti"), fetchSheet("schede"), fetchSheet("esercizi")
  ]);
  let libreria = [], progressi = [];
  try { libreria  = await fetchSheet("libreria_esercizi"); } catch(e) {}
  try { progressi = await fetchSheet("progressi"); } catch(e) {}
  const esercizi = ex.map(e => ({
    ...e,
    seduta:   e.seduta || e.giorno || "",
    recupero: e.recupero || e.riposo_sec || "0",
    muscolo:  e.muscolo || e.gruppo_muscolare || "",
  }));
  return {
    config:    Object.fromEntries(cf.map(r => [r.chiave, r.valore])),
    clienti:   cl,
    schede:    sc,
    esercizi,
    libreria,
    progressi,
  };
}

// ─── UTILS ─────────────────────────────────────────────────────────────────
const fmtDate   = d => { if (!d) return "—"; if (d.includes("/")) return d; const p = d.split("-"); return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:d; };
const daysUntil = d => { if (!d) return 999; return Math.ceil((new Date(d)-new Date())/86400000); };
const todayISO  = () => new Date().toISOString().split("T")[0];
const addMonths = m => { const d=new Date(); d.setMonth(d.getMonth()+m); return d.toISOString().split("T")[0]; };
const nextCode  = (list, prefix, pad=3) => {
  const nums = list.map(x => parseInt((x||"").replace(/\D/g,""))||0);
  return `${prefix}${String((nums.length?Math.max(...nums):0)+1).padStart(pad,"0")}`;
};

// ─── SIDEBAR ───────────────────────────────────────────────────────────────
function Sidebar({ active, onNavigate, config }) {
  return (
    <div style={{ width:220, minHeight:"100vh", background:T.sidebar, display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ padding:"24px 20px", borderBottom:"1px solid #2A2A2A" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", overflow:"hidden", border:"2px solid #333" }}>
            <img src={LOGO_URL} alt="Logo" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
          <div>
            <div style={{ color:"white", fontSize:13, fontWeight:800 }}>{config?.nome_palestra||"Master Gym"}</div>
            <div style={{ color:"#666", fontSize:10 }}>Pannello Gestione</div>
          </div>
        </div>
      </div>
      <div style={{ padding:"16px 12px", flex:1 }}>
        {[
          { id:"dashboard", icon:LayoutDashboard, label:"Dashboard" },
          { id:"clienti",   icon:Users,           label:"Clienti"   },
        ].map(({ id, icon:Icon, label }) => {
          const a = active===id;
          return (
            <button key={id} onClick={()=>onNavigate(id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 16px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:4, background:a?T.primary:"transparent", color:a?"white":"#888", fontWeight:a?700:500, fontSize:13 }}>
              <Icon size={18} strokeWidth={a?2.2:1.5}/>{label}
            </button>
          );
        })}
      </div>
      <div style={{ padding:"16px 20px", borderTop:"1px solid #2A2A2A" }}>
        <div style={{ color:"#555", fontSize:11 }}>GymBoard v3.0</div>
        <div style={{ color:"#444", fontSize:10, marginTop:2 }}>by Marta Molinaris</div>
      </div>
    </div>
  );
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────
function StatCard({ icon:Icon, label, value, color, bgColor }) {
  return (
    <div style={{ background:T.card, borderRadius:14, padding:20, border:`1px solid ${T.border}`, flex:1, minWidth:160 }}>
      <div style={{ width:42, height:42, borderRadius:11, background:bgColor, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
        <Icon size={20} color={color}/>
      </div>
      <div style={{ fontSize:28, fontWeight:800, color:T.text, marginBottom:2 }}>{value}</div>
      <div style={{ fontSize:13, color:T.textSec }}>{label}</div>
    </div>
  );
}

// ─── WHATSAPP MODAL ────────────────────────────────────────────────────────
function WhatsAppModal({ cliente, onClose }) {
  const msg = `🏋️ *Master Gym — La tua scheda!*\n\nCiao ${cliente.nome}! Puoi vedere la tua scheda sul telefono.\n\n📲 ${APP_URL}\n\n🔑 Codice: *${cliente.codice}*\n🔒 PIN: *${cliente.pin}*\n\n💡 Per aggiungere l'icona:\n*iPhone:* Safari → Condividi ⬆️ → Aggiungi alla schermata Home\n*Android:* Chrome → ⋮ → Aggiungi a schermata Home\n\n✅ Buon allenamento! 💪`;
  const waUrl = cliente.telefono ? `https://wa.me/${cliente.telefono.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(msg)}` : null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"white", borderRadius:16, width:"100%", maxWidth:500, maxHeight:"80vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:15, fontWeight:700, color:T.text }}>💬 Messaggio per {cliente.nome}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={20} color={T.textMut}/></button>
        </div>
        <div style={{ padding:"20px 24px", overflow:"auto", flex:1 }}>
          <div style={{ background:"#F0F0F0", borderRadius:12, padding:16, fontSize:13, lineHeight:1.6, color:"#333", whiteSpace:"pre-wrap" }}>{msg}</div>
        </div>
        <div style={{ padding:"16px 24px", borderTop:`1px solid ${T.border}`, display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={()=>navigator.clipboard.writeText(msg)} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${T.border}`, background:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>📋 Copia</button>
          {waUrl && <a href={waUrl} target="_blank" rel="noreferrer" style={{ padding:"10px 20px", borderRadius:10, border:"none", background:"#25D366", color:"white", textDecoration:"none", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}><Send size={15}/> WhatsApp</a>}
        </div>
      </div>
    </div>
  );
}

// ─── EDITOR SEDUTE (usato sia per nuovo che per modifica) ──────────────────
function SeduteEditor({ numSedute, sedute, setSedute, libreria }) {
  const emptyEx = () => ({ esercizio:"", muscolo:"", serie:"3", ripetizioni:"12", recupero:"60", peso_suggerito:"", tipo_seduta:"", note:"", video_url:"" });

  const setEx = (si, ei, key, val) => {
    setSedute(prev => {
      const next = prev.map(s=>[...s]);
      next[si][ei] = { ...next[si][ei], [key]:val };
      if (key==="esercizio") {
        const found = libreria.find(l=>l.esercizio===val);
        if (found) next[si][ei].muscolo = found.muscolo;
      }
      return next;
    });
  };
  const addEx = si => setSedute(prev => { const n=[...prev]; n[si]=[...n[si],emptyEx()]; return n; });
  const delEx = (si,ei) => setSedute(prev => { const n=[...prev]; n[si]=n[si].filter((_,i)=>i!==ei); return n; });
  const esNomi = libreria.map(l=>l.esercizio);

  return (
    <>
      {sedute.slice(0,numSedute).map((exs, si) => (
        <div key={si} style={{ marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:800, color:T.primary, marginBottom:10, padding:"6px 14px", background:T.primaryLight, borderRadius:8, display:"inline-block" }}>
            Seduta {si+1}
          </div>
          {exs.map((ex, ei) => (
            <div key={ei} style={{ background:T.bg, borderRadius:12, padding:14, marginBottom:8, border:`1px solid ${T.border}` }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto", gap:8, alignItems:"end" }}>
                <div>
                  <label style={{ display:"block", fontSize:10, fontWeight:700, color:T.textSec, marginBottom:4 }}>ESERCIZIO</label>
                  <input list={`lib-${si}-${ei}`} value={ex.esercizio}
                    onChange={e=>setEx(si,ei,"esercizio",e.target.value)}
                    placeholder="Cerca o scrivi..."
                    style={{ width:"100%", background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 10px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box" }}/>
                  <datalist id={`lib-${si}-${ei}`}>
                    {esNomi.map(n=><option key={n} value={n}/>)}
                  </datalist>
                </div>
                {[["SERIE","serie"],["REPS","ripetizioni"],["REC.(s)","recupero"],["PESO(kg)","peso_suggerito"]].map(([label,key])=>(
                  <div key={key}>
                    <label style={{ display:"block", fontSize:10, fontWeight:700, color:T.textSec, marginBottom:4 }}>{label}</label>
                    <input value={ex[key]} onChange={e=>setEx(si,ei,key,e.target.value)}
                      style={{ width:"100%", background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 10px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box" }}/>
                  </div>
                ))}
                <button onClick={()=>delEx(si,ei)} style={{ background:"none", border:"none", cursor:"pointer", color:T.danger, padding:"8px", marginBottom:2 }}>
                  <Trash2 size={16}/>
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr 2fr", gap:8, marginTop:8 }}>
                <div>
                  <label style={{ display:"block", fontSize:10, fontWeight:700, color:T.textSec, marginBottom:4 }}>MUSCOLO</label>
                  <input value={ex.muscolo} onChange={e=>setEx(si,ei,"muscolo",e.target.value)} placeholder="Auto"
                    style={{ width:"100%", background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 10px", fontSize:12, color:T.textSec, outline:"none", boxSizing:"border-box" }}/>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, fontWeight:700, color:T.textSec, marginBottom:4 }}>TIPO</label>
                  <select value={ex.tipo_seduta} onChange={e=>setEx(si,ei,"tipo_seduta",e.target.value)}
                    style={{ width:"100%", background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 10px", fontSize:12, color:T.text, outline:"none" }}>
                    <option value="">Normale</option>
                    <option value="SUPERSERIE">Superserie</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, fontWeight:700, color:T.textSec, marginBottom:4 }}>NOTE TRAINER</label>
                  <input value={ex.note} onChange={e=>setEx(si,ei,"note",e.target.value)} placeholder="Es. Schiena dritta"
                    style={{ width:"100%", background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 10px", fontSize:12, color:T.text, outline:"none", boxSizing:"border-box" }}/>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, fontWeight:700, color:T.textSec, marginBottom:4 }}>VIDEO (YouTube)</label>
                  <input value={ex.video_url} onChange={e=>setEx(si,ei,"video_url",e.target.value)} placeholder="https://youtu.be/..."
                    style={{ width:"100%", background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 10px", fontSize:12, color:T.text, outline:"none", boxSizing:"border-box" }}/>
                </div>
              </div>
            </div>
          ))}
          <button onClick={()=>addEx(si)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:`1.5px dashed ${T.border}`, borderRadius:10, padding:"8px 16px", cursor:"pointer", color:T.textSec, fontSize:12, fontWeight:600, width:"100%" }}>
            <Plus size={15}/> Aggiungi esercizio a Seduta {si+1}
          </button>
        </div>
      ))}
    </>
  );
}

// ─── FORM NUOVO CLIENTE (cliente + scheda insieme) ─────────────────────────
function NuovoClienteForm({ data, onSave, onCancel, saving }) {
  const { clienti, schede, libreria } = data;
  const emptyEx = () => ({ esercizio:"", muscolo:"", serie:"3", ripetizioni:"12", recupero:"60", peso_suggerito:"", tipo_seduta:"", note:"", video_url:"" });

  const [cliente, setCliente] = useState({
    codice:          nextCode(clienti.map(c=>c.codice), "MG-"),
    cognome:         "",
    nome:            "",
    pin:             "",
    telefono:        "",
    email:           "",
    obiettivo:       "",
    data_iscrizione: new Date().toLocaleDateString("it-IT"),
  });
  const [schedaInfo, setSchedaInfo] = useState({
    nome_scheda:    "",
    obiettivo:      "",
    durata_mesi:    "2",
    data_creazione: todayISO(),
    data_scadenza:  addMonths(2),
    note_trainer:   "",
  });
  const [numSedute, setNumSedute] = useState(3);
  const [sedute, setSedute]       = useState(Array.from({length:3},()=>[emptyEx()]));
  const [errore, setErrore]       = useState("");

  const handleNumSedute = n => {
    setNumSedute(n);
    setSedute(prev => {
      const next = [...prev];
      while(next.length < n) next.push([emptyEx()]);
      return next;
    });
  };

  const setC = (k,v) => setCliente(f=>({...f,[k]:v}));
  const setS = (k,v) => setSchedaInfo(f=>({...f,[k]:v}));

  const handleSave = () => {
    setErrore("");
    // controllo duplicati
    const dup = clienti.find(c =>
      c.nome?.toLowerCase()===cliente.nome.toLowerCase() &&
      c.cognome?.toLowerCase()===cliente.cognome.toLowerCase()
    );
    if (dup) { setErrore(`⚠️ Esiste già un cliente con questo nome: ${dup.codice}`); return; }
    if (!cliente.nome || !cliente.cognome) { setErrore("Nome e cognome sono obbligatori"); return; }
    if (cliente.pin.length !== 4) { setErrore("Il PIN deve essere di 4 cifre"); return; }
    if (!schedaInfo.nome_scheda) { setErrore("Dai un nome alla scheda"); return; }

    const schedaId = nextCode(data.schede.map(s=>s.scheda_id), "SCH-");
    const righeEx  = [];
    sedute.slice(0,numSedute).forEach((exs,si) => {
      exs.forEach(ex => {
        if (!ex.esercizio) return;
        righeEx.push({ scheda_id:schedaId, seduta:`Seduta ${si+1}`, tipo_seduta:ex.tipo_seduta||"", esercizio:ex.esercizio, ripetizioni:ex.ripetizioni, serie:ex.serie, recupero:ex.recupero, muscolo:ex.muscolo, peso_suggerito:ex.peso_suggerito, note:ex.note, tecnica:"", video_url:ex.video_url });
      });
    });

    onSave({
      cliente:  { ...cliente, scheda_attiva:schedaId, schede_passate:"" },
      scheda:   { scheda_id:schedaId, ...schedaInfo, num_sedute:String(numSedute) },
      esercizi: righeEx,
    });
  };

  return (
    <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:28, maxWidth:800 }}>
      <h2 style={{ fontSize:18, fontWeight:800, color:T.text, marginBottom:24 }}>➕ Nuovo Cliente + Scheda</h2>

      {/* DATI CLIENTE */}
      <div style={{ fontSize:11, fontWeight:800, color:T.primary, letterSpacing:"1px", marginBottom:12 }}>DATI CLIENTE</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
        {[
          ["Codice (auto)","codice","text",true],
          ["PIN (4 cifre) *","pin","text",false],
          ["Nome *","nome","text",false],
          ["Cognome *","cognome","text",false],
          ["Telefono","telefono","tel",false],
          ["Email","email","email",false],
          ["Data iscrizione","data_iscrizione","text",false],
          ["Obiettivo","obiettivo","text",false],
        ].map(([label,key,type,ro])=>(
          <div key={key}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:5 }}>{label}</label>
            <input value={cliente[key]} type={type} readOnly={ro}
              onChange={e=>{ if(key==="pin") setC(key,e.target.value.replace(/\D/g,"").slice(0,4)); else setC(key,e.target.value); }}
              style={{ width:"100%", background:ro?"#F5F5F5":T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box" }}/>
          </div>
        ))}
      </div>

      {/* DATI SCHEDA */}
      <div style={{ fontSize:11, fontWeight:800, color:T.primary, letterSpacing:"1px", marginBottom:12 }}>SCHEDA DI ALLENAMENTO</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
        {[
          ["Nome scheda *","nome_scheda"],
          ["Obiettivo scheda","obiettivo"],
          ["Data inizio","data_creazione"],
          ["Data scadenza","data_scadenza"],
        ].map(([label,key])=>(
          <div key={key}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:5 }}>{label}</label>
            <input value={schedaInfo[key]} onChange={e=>setS(key,e.target.value)}
              style={{ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box" }}/>
          </div>
        ))}
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:5 }}>Note trainer</label>
        <textarea value={schedaInfo.note_trainer} onChange={e=>setS("note_trainer",e.target.value)} rows={2}
          style={{ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box", resize:"vertical" }}/>
      </div>

      {/* NUMERO SEDUTE */}
      <div style={{ marginBottom:20 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:8 }}>NUMERO DI SEDUTE</label>
        <div style={{ display:"flex", gap:8 }}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>handleNumSedute(n)}
              style={{ width:52, height:52, borderRadius:12, border:`2px solid ${numSedute===n?T.primary:T.border}`, background:numSedute===n?T.primaryLight:"white", color:numSedute===n?T.primary:T.text, fontSize:18, fontWeight:800, cursor:"pointer" }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ESERCIZI PER SEDUTA */}
      <div style={{ fontSize:11, fontWeight:800, color:T.primary, letterSpacing:"1px", marginBottom:12 }}>ESERCIZI</div>
      <SeduteEditor numSedute={numSedute} sedute={sedute} setSedute={setSedute} libreria={libreria}/>

      {errore && <div style={{ background:T.dangerLight, border:`1px solid ${T.primaryBorder}`, borderRadius:10, padding:"10px 16px", marginBottom:12, fontSize:13, color:T.danger, fontWeight:600 }}>{errore}</div>}

      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${T.border}`, background:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>Annulla</button>
        <button onClick={handleSave} disabled={saving} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:saving?"#CCC":T.primary, color:"white", cursor:saving?"not-allowed":"pointer", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6, opacity:saving?0.7:1 }}>
          <Save size={15}/> {saving ? "Salvo su Sheets..." : "Salva cliente e scheda"}
        </button>
      </div>
    </div>
  );
}

// ─── FORM AGGIORNA SCHEDA ──────────────────────────────────────────────────
function AggiornaSchedaForm({ cliente, data, onSave, onCancel, saving }) {
  const { schede, esercizi, libreria } = data;
  const emptyEx = () => ({ esercizio:"", muscolo:"", serie:"3", ripetizioni:"12", recupero:"60", peso_suggerito:"", tipo_seduta:"", note:"", video_url:"" });

  const schedaAttuale = schede.find(s=>s.scheda_id===cliente.scheda_attiva);
  const exAttivi      = esercizi.filter(e=>e.scheda_id===cliente.scheda_attiva);
  const seduteUniche  = [...new Set(exAttivi.map(e=>e.seduta))].filter(Boolean).sort();

  // precarica esercizi esistenti
  const preload = () => {
    if (!schedaAttuale) return Array.from({length:3},()=>[emptyEx()]);
    return seduteUniche.map(sed => {
      const exs = exAttivi.filter(e=>e.seduta===sed).sort((a,b)=>parseInt(a.ordine||0)-parseInt(b.ordine||0));
      return exs.length ? exs.map(e=>({
        esercizio:      e.esercizio,
        muscolo:        e.muscolo,
        serie:          e.serie,
        ripetizioni:    e.ripetizioni,
        recupero:       e.recupero,
        peso_suggerito: e.peso_suggerito,
        tipo_seduta:    e.tipo_seduta,
        note:           e.note,
        video_url:      e.video_url,
      })) : [emptyEx()];
    });
  };

  const [schedaInfo, setSchedaInfo] = useState({
    nome_scheda:    schedaAttuale?.nome_scheda || "",
    obiettivo:      schedaAttuale?.obiettivo   || "",
    durata_mesi:    schedaAttuale?.durata_mesi || "2",
    data_creazione: todayISO(),
    data_scadenza:  addMonths(2),
    note_trainer:   schedaAttuale?.note_trainer || "",
  });
  const [numSedute, setNumSedute] = useState(seduteUniche.length || 3);
  const [sedute, setSedute]       = useState(preload);

  const handleNumSedute = n => {
    setNumSedute(n);
    setSedute(prev => {
      const next = [...prev];
      while(next.length < n) next.push([emptyEx()]);
      return next;
    });
  };

  const handleSave = () => {
    const nuovoId = nextCode(data.schede.map(s=>s.scheda_id), "SCH-");
    const righeEx = [];
    sedute.slice(0,numSedute).forEach((exs,si) => {
      exs.forEach(ex => {
        if (!ex.esercizio) return;
        righeEx.push({ scheda_id:nuovoId, seduta:`Seduta ${si+1}`, tipo_seduta:ex.tipo_seduta||"", esercizio:ex.esercizio, ripetizioni:ex.ripetizioni, serie:ex.serie, recupero:ex.recupero, muscolo:ex.muscolo, peso_suggerito:ex.peso_suggerito, note:ex.note, tecnica:"", video_url:ex.video_url });
      });
    });
    onSave({
      nuovoId,
      vecchioId:  cliente.scheda_attiva,
      scheda:     { scheda_id:nuovoId, ...schedaInfo, num_sedute:String(numSedute) },
      esercizi:   righeEx,
    });
  };

  return (
    <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:28, maxWidth:800 }}>
      <h2 style={{ fontSize:18, fontWeight:800, color:T.text, marginBottom:6 }}>✏️ Aggiorna scheda — {cliente.nome} {cliente.cognome}</h2>
      <p style={{ fontSize:13, color:T.textSec, marginBottom:24 }}>La scheda attuale verrà archiviata nello storico. Quella nuova partirà da oggi.</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
        {[
          ["Nome scheda","nome_scheda"],
          ["Obiettivo","obiettivo"],
          ["Data scadenza","data_scadenza"],
        ].map(([label,key])=>(
          <div key={key}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:5 }}>{label}</label>
            <input value={schedaInfo[key]} onChange={e=>setSchedaInfo(f=>({...f,[key]:e.target.value}))}
              style={{ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box" }}/>
          </div>
        ))}
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:5 }}>Note trainer</label>
        <textarea value={schedaInfo.note_trainer} onChange={e=>setSchedaInfo(f=>({...f,note_trainer:e.target.value}))} rows={2}
          style={{ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box", resize:"vertical" }}/>
      </div>

      <div style={{ marginBottom:20 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:8 }}>NUMERO DI SEDUTE</label>
        <div style={{ display:"flex", gap:8 }}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>handleNumSedute(n)}
              style={{ width:52, height:52, borderRadius:12, border:`2px solid ${numSedute===n?T.primary:T.border}`, background:numSedute===n?T.primaryLight:"white", color:numSedute===n?T.primary:T.text, fontSize:18, fontWeight:800, cursor:"pointer" }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize:11, fontWeight:800, color:T.primary, letterSpacing:"1px", marginBottom:12 }}>ESERCIZI (precaricati dalla scheda attuale)</div>
      <SeduteEditor numSedute={numSedute} sedute={sedute} setSedute={setSedute} libreria={libreria}/>

      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${T.border}`, background:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>Annulla</button>
        <button onClick={handleSave} disabled={saving} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:saving?"#CCC":T.primary, color:"white", cursor:saving?"not-allowed":"pointer", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6, opacity:saving?0.7:1 }}>
          <Save size={15}/> {saving ? "Salvo su Sheets..." : "Salva nuova scheda"}
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────
function DashboardView({ data, onNavigate, onSelectCliente }) {
  const { clienti, schede, esercizi } = data;
  const stats = useMemo(()=>({
    totClienti:   clienti.filter(c=>c.codice&&c.nome).length,
    schedeAttive: schede.length,
    inScadenza:   clienti.filter(c=>{ const s=schede.find(sc=>sc.scheda_id===c.scheda_attiva); return s&&daysUntil(s.data_scadenza)<=7&&daysUntil(s.data_scadenza)>0; }).length,
    totEsercizi:  esercizi.length,
  }),[clienti,schede,esercizi]);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:T.text, marginBottom:4 }}>Dashboard</h1>
        <p style={{ fontSize:14, color:T.textSec }}>Panoramica della tua palestra</p>
      </div>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:28 }}>
        <StatCard icon={Users}         label="Clienti attivi"  value={stats.totClienti}   color={T.primary} bgColor={T.primaryLight}/>
        <StatCard icon={ClipboardList} label="Schede create"   value={stats.schedeAttive} color="#6366F1"   bgColor="#EEF2FF"/>
        <StatCard icon={AlertCircle}   label="In scadenza"     value={stats.inScadenza}   color={T.danger}  bgColor={T.dangerLight}/>
        <StatCard icon={Dumbbell}      label="Esercizi totali" value={stats.totEsercizi}  color={T.success} bgColor={T.successLight}/>
      </div>
      <div style={{ background:T.card, borderRadius:14, border:`1px solid ${T.border}`, overflow:"hidden" }}>
        <div style={{ padding:"18px 22px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:15, fontWeight:700, color:T.text }}>Ultimi clienti</span>
          <button onClick={()=>onNavigate("clienti")} style={{ background:T.primaryLight, border:`1px solid ${T.primaryBorder}`, borderRadius:8, padding:"6px 14px", cursor:"pointer", color:T.primary, fontSize:12, fontWeight:700 }}>Vedi tutti →</button>
        </div>
        {clienti.filter(c=>c.codice&&c.nome).slice(0,5).map(c=>{
          const scheda=schede.find(s=>s.scheda_id===c.scheda_attiva);
          const days=scheda?daysUntil(scheda.data_scadenza):999;
          return (
            <button key={c.codice} onClick={()=>onSelectCliente(c)} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"14px 22px", border:"none", borderBottom:`1px solid ${T.border}`, background:"white", cursor:"pointer", textAlign:"left" }}>
              <div style={{ width:38, height:38, borderRadius:10, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:T.primary, flexShrink:0 }}>{c.nome?.[0]}{c.cognome?.[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:T.text }}>{c.nome} {c.cognome}</div>
                <div style={{ fontSize:12, color:T.textSec }}>{scheda?.nome_scheda||"Nessuna scheda"}</div>
              </div>
              {days<=7&&days>0 && <span style={{ fontSize:11, fontWeight:700, color:T.danger, background:T.dangerLight, padding:"3px 8px", borderRadius:6 }}>Scade {days}g</span>}
              <ChevronRight size={16} color={T.textMut}/>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── CLIENTI VIEW ──────────────────────────────────────────────────────────
function ClientiView({ data, onSelectCliente, onNuovoCliente }) {
  const [search, setSearch] = useState("");
  const { clienti, schede } = data;
  const filtered = useMemo(()=>{
    const q=search.toLowerCase();
    return clienti.filter(c=>c.codice&&c.nome&&`${c.nome} ${c.cognome} ${c.codice}`.toLowerCase().includes(q));
  },[clienti,search]);

  return (
    <div>
      <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:T.text, marginBottom:4 }}>Clienti</h1>
          <p style={{ fontSize:14, color:T.textSec }}>{filtered.length} clienti</p>
        </div>
        <button onClick={onNuovoCliente} style={{ display:"flex", alignItems:"center", gap:8, background:T.primary, border:"none", borderRadius:12, padding:"12px 20px", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus size={16}/> Nuovo cliente
        </button>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 16px", marginBottom:20 }}>
        <Search size={18} color={T.textMut}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca per nome o codice..."
          style={{ flex:1, border:"none", outline:"none", fontSize:14, color:T.text, background:"transparent" }}/>
        {search && <button onClick={()=>setSearch("")} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={16} color={T.textMut}/></button>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.map(c=>{
          const scheda=schede.find(s=>s.scheda_id===c.scheda_attiva);
          const days=scheda?daysUntil(scheda.data_scadenza):999;
          return (
            <button key={c.codice} onClick={()=>onSelectCliente(c)} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"16px 20px", border:`1px solid ${T.border}`, borderRadius:14, background:T.card, cursor:"pointer", textAlign:"left" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:T.primary, flexShrink:0 }}>{c.nome?.[0]}{c.cognome?.[0]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{c.nome} {c.cognome}</div>
                <div style={{ fontSize:12, color:T.textSec, marginTop:2 }}>{scheda?.nome_scheda||"Nessuna scheda"} · {fmtDate(c.data_iscrizione)}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                {days<=7&&days>0 && <span style={{ fontSize:11, fontWeight:700, color:T.danger, background:T.dangerLight, padding:"3px 8px", borderRadius:6 }}>Scade {days}g</span>}
                {days<=0&&scheda  && <span style={{ fontSize:11, fontWeight:700, color:T.danger, background:T.dangerLight, padding:"3px 8px", borderRadius:6 }}>Scaduta</span>}
                <span style={{ fontSize:11, color:T.textMut, background:T.bg, padding:"3px 8px", borderRadius:5 }}>{c.codice}</span>
                <ChevronRight size={16} color={T.textMut}/>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── CLIENTE DETAIL ────────────────────────────────────────────────────────
function ClienteDetail({ cliente, data, onBack, onWhatsApp, onAggiornaScheda, onElimina }) {
  const { schede, esercizi, progressi } = data;
  const scheda   = schede.find(s=>s.scheda_id===cliente.scheda_attiva);
  const schedaEx = esercizi.filter(e=>e.scheda_id===cliente.scheda_attiva);
  const sedute   = [...new Set(schedaEx.map(e=>e.seduta))].filter(Boolean);

  // storico schede passate
  const storicoIds = (cliente.schede_passate||"").split(",").map(x=>x.trim()).filter(Boolean);
  const storicoSchede = storicoIds.map(id=>schede.find(s=>s.scheda_id===id)).filter(Boolean);

  // progressi del cliente
  const miei = (progressi||[]).filter(p=>p.codice_cliente===cliente.codice);
  const byEx  = miei.reduce((acc,p)=>{ if(!acc[p.esercizio])acc[p.esercizio]=[]; acc[p.esercizio].push(p); return acc; },{});

  return (
    <div>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:T.primary, fontSize:13, fontWeight:600, marginBottom:20, padding:0 }}>
        <ArrowLeft size={16}/> Torna alla lista
      </button>

      {/* HEADER CLIENTE */}
      <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:24, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:T.primary }}>{cliente.nome?.[0]}{cliente.cognome?.[0]}</div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:20, fontWeight:800, color:T.text, margin:0 }}>{cliente.nome} {cliente.cognome}</h2>
            <div style={{ fontSize:12, color:T.textSec, marginTop:2 }}>Codice: <b>{cliente.codice}</b> · PIN: <b>{cliente.pin}</b></div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>onWhatsApp(cliente)} style={{ display:"flex", alignItems:"center", gap:6, background:"#25D366", color:"white", border:"none", borderRadius:10, padding:"10px 16px", cursor:"pointer", fontSize:13, fontWeight:700 }}>
              <Send size={15}/> WhatsApp
            </button>
            <button onClick={onAggiornaScheda} style={{ display:"flex", alignItems:"center", gap:6, background:T.primaryLight, color:T.primary, border:`1px solid ${T.primaryBorder}`, borderRadius:10, padding:"10px 16px", cursor:"pointer", fontSize:13, fontWeight:700 }}>
              <Edit2 size={15}/> Aggiorna scheda
            </button>
            <button onClick={()=>{ if(window.confirm(`Eliminare ${cliente.nome} ${cliente.cognome}?`)) onElimina(cliente); }} style={{ display:"flex", alignItems:"center", gap:6, background:T.dangerLight, color:T.danger, border:`1px solid ${T.danger}44`, borderRadius:10, padding:"10px 16px", cursor:"pointer", fontSize:13, fontWeight:700 }}>
              <Trash2 size={15}/> Elimina
            </button>
          </div>
        </div>
        {[["📞",cliente.telefono],["📧",cliente.email],["📅",`Iscritto: ${fmtDate(cliente.data_iscrizione)}`],["🎯",cliente.obiettivo]].filter(([,v])=>v).map(([icon,val],i)=>(
          <div key={i} style={{ fontSize:13, color:T.textSec, marginBottom:4 }}>{icon} {val}</div>
        ))}
      </div>

      {/* SCHEDA ATTIVA */}
      {scheda ? (
        <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden", marginBottom:16 }}>
          <div style={{ padding:"18px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:T.primary, letterSpacing:"1px", marginBottom:4 }}>SCHEDA ATTIVA</div>
              <div style={{ fontSize:17, fontWeight:800, color:T.text }}>{scheda.nome_scheda}</div>
              <div style={{ fontSize:12, color:T.textSec, marginTop:2 }}>{scheda.obiettivo} · fino al {fmtDate(scheda.data_scadenza)}</div>
            </div>
            {daysUntil(scheda.data_scadenza)<=7 && <span style={{ fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:8, color:T.danger, background:T.dangerLight }}>{daysUntil(scheda.data_scadenza)>0?`Scade tra ${daysUntil(scheda.data_scadenza)}g`:"Scaduta"}</span>}
          </div>
          {scheda.note_trainer && <div style={{ padding:"10px 24px", background:"#FFFDE7", fontSize:13, color:"#5D4037", fontStyle:"italic" }}>💡 {scheda.note_trainer}</div>}
          {sedute.map(sed=>{
            const dayExs=schedaEx.filter(e=>e.seduta===sed).sort((a,b)=>parseInt(a.ordine||0)-parseInt(b.ordine||0));
            return (
              <div key={sed} style={{ borderBottom:`1px solid ${T.border}` }}>
                <div style={{ padding:"10px 24px", background:T.bg, fontSize:13, fontWeight:700, color:T.primary }}>{sed}{dayExs[0]?.tipo_seduta?` — ${dayExs[0].tipo_seduta}`:""}</div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr>{["Esercizio","Serie","Reps","Rec.","Muscolo","Peso","Note"].map(h=><th key={h} style={{ padding:"8px 12px", fontSize:11, fontWeight:700, color:T.textMut, textAlign:"left" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {dayExs.map((ex,i)=>(
                      <tr key={i} style={{ borderBottom:`1px solid ${T.border}22` }}>
                        <td style={{ padding:"10px 12px", fontSize:13, fontWeight:600, color:T.text }}>{ex.esercizio}</td>
                        <td style={{ padding:"10px 12px", fontSize:13, color:T.text }}>{ex.serie||"—"}</td>
                        <td style={{ padding:"10px 12px", fontSize:13, color:T.text }}>{ex.ripetizioni||"—"}</td>
                        <td style={{ padding:"10px 12px", fontSize:13, color:T.text }}>{ex.recupero||"—"}</td>
                        <td style={{ padding:"10px 12px", fontSize:12, color:T.textSec }}>{ex.muscolo||"—"}</td>
                        <td style={{ padding:"10px 12px", fontSize:13, color:T.primary, fontWeight:600 }}>{ex.peso_suggerito?`${ex.peso_suggerito} kg`:"—"}</td>
                        <td style={{ padding:"10px 12px", fontSize:12, color:T.textSec }}>{ex.note||"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:40, textAlign:"center", marginBottom:16 }}>
          <ClipboardList size={40} color={T.textMut} style={{ marginBottom:12 }}/>
          <p style={{ color:T.textSec, fontSize:14 }}>Nessuna scheda assegnata</p>
          <button onClick={onAggiornaScheda} style={{ marginTop:12, background:T.primary, border:"none", borderRadius:10, padding:"10px 20px", color:"white", fontWeight:700, cursor:"pointer", fontSize:13 }}>+ Assegna scheda</button>
        </div>
      )}

      {/* PROGRESSI */}
      {Object.keys(byEx).length > 0 && (
        <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:24, marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <TrendingUp size={18} color={T.primary}/> Progressi registrati
          </div>
          {Object.entries(byEx).map(([ex,logs])=>{
            const sorted = [...logs].sort((a,b)=>a.data?.localeCompare(b.data));
            const first  = parseFloat(sorted[0]?.peso_kg)||0;
            const last   = parseFloat(sorted.at(-1)?.peso_kg)||0;
            const diff   = last - first;
            return (
              <div key={ex} style={{ marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${T.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{ex}</span>
                  {sorted.length>=2 && <span style={{ fontSize:12, fontWeight:700, color:diff>=0?"#388E3C":T.danger, background:diff>=0?"#E8F5E9":T.dangerLight, padding:"3px 10px", borderRadius:6 }}>{diff>=0?"+":""}{diff.toFixed(1)} kg</span>}
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {sorted.map((l,i)=><span key={i} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:6, padding:"3px 10px", fontSize:11, color:T.text }}>{l.data}: <b style={{ color:T.primary }}>{l.peso_kg} kg</b></span>)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STORICO SCHEDE */}
      {storicoSchede.length > 0 && (
        <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:24 }}>
          <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
            <Clock size={18} color={T.textSec}/> Storico schede precedenti
          </div>
          {storicoSchede.map(s=>(
            <div key={s.scheda_id} style={{ padding:"10px 0", borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{s.nome_scheda}</div>
              <div style={{ fontSize:12, color:T.textSec, marginTop:2 }}>{s.obiettivo} · {fmtDate(s.data_creazione)} → {fmtDate(s.data_scadenza)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SCHEDE VIEW ───────────────────────────────────────────────────────────
function SchedeView({ data, onSelectScheda }) {
  const { schede, clienti, esercizi } = data;
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:T.text, marginBottom:4 }}>Schede</h1>
        <p style={{ fontSize:14, color:T.textSec }}>{schede.length} schede create</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {schede.map(s=>{
          const numClienti=clienti.filter(c=>c.scheda_attiva===s.scheda_id).length;
          const numEx=esercizi.filter(e=>e.scheda_id===s.scheda_id).length;
          const sedute=[...new Set(esercizi.filter(e=>e.scheda_id===s.scheda_id).map(e=>e.seduta))].filter(Boolean).length;
          return (
            <button key={s.scheda_id} onClick={()=>onSelectScheda(s)} style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:20, cursor:"pointer", textAlign:"left" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:T.text }}>{s.nome_scheda}</div>
                  <div style={{ fontSize:12, color:T.textSec, marginTop:2 }}>{s.obiettivo}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:16 }}>
                {[[Users,`${numClienti} clienti`],[Calendar,`${sedute} sedute`],[Dumbbell,`${numEx} esercizi`]].map(([Icon,label],i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}><Icon size={13} color={T.textSec}/><span style={{ fontSize:12, color:T.textSec }}>{label}</span></div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCHEDA DETAIL ─────────────────────────────────────────────────────────
function SchedaDetail({ scheda, data, onBack }) {
  const { esercizi, clienti } = data;
  const schedaEx = esercizi.filter(e=>e.scheda_id===scheda.scheda_id);
  const sedute   = [...new Set(schedaEx.map(e=>e.seduta))].filter(Boolean);
  const assigned = clienti.filter(c=>c.scheda_attiva===scheda.scheda_id);
  return (
    <div>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:T.primary, fontSize:13, fontWeight:600, marginBottom:20, padding:0 }}>
        <ArrowLeft size={16}/> Torna alle schede
      </button>
      <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:24, marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:T.text, margin:0, marginBottom:8 }}>{scheda.nome_scheda}</h2>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:10 }}>
          {[["Obiettivo",scheda.obiettivo],["Creata",fmtDate(scheda.data_creazione)],["Scadenza",fmtDate(scheda.data_scadenza)]].map(([k,v])=>(
            <span key={k} style={{ fontSize:13, color:T.textSec }}>{k}: <b style={{ color:T.text }}>{v}</b></span>
          ))}
        </div>
        {assigned.length>0 && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:12, color:T.textSec }}>Assegnata a:</span>
            {assigned.map(c=><span key={c.codice} style={{ fontSize:12, fontWeight:600, background:T.primaryLight, color:T.primary, padding:"2px 8px", borderRadius:5 }}>{c.nome} {c.cognome}</span>)}
          </div>
        )}
        {scheda.note_trainer && <p style={{ marginTop:10, fontSize:13, color:T.textSec, fontStyle:"italic" }}>💡 {scheda.note_trainer}</p>}
      </div>
      {sedute.map(sed=>{
        const dayExs=schedaEx.filter(e=>e.seduta===sed).sort((a,b)=>parseInt(a.ordine||0)-parseInt(b.ordine||0));
        return (
          <div key={sed} style={{ background:T.card, borderRadius:14, border:`1px solid ${T.border}`, overflow:"hidden", marginBottom:12 }}>
            <div style={{ padding:"12px 20px", background:T.bg, borderBottom:`1px solid ${T.border}`, fontSize:13, fontWeight:700, color:T.primary }}>{sed}</div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["Esercizio","Serie","Reps","Rec.","Muscolo","Peso","Note"].map(h=><th key={h} style={{ padding:"8px 12px", fontSize:11, fontWeight:700, color:T.textMut, textAlign:"left", borderBottom:`1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {dayExs.map((ex,i)=>(
                  <tr key={i} style={{ borderBottom:`1px solid ${T.border}22` }}>
                    <td style={{ padding:"10px 12px", fontSize:13, fontWeight:600, color:T.text }}>{ex.esercizio}</td>
                    <td style={{ padding:"10px 12px", fontSize:13, color:T.text }}>{ex.serie||"—"}</td>
                    <td style={{ padding:"10px 12px", fontSize:13, color:T.text }}>{ex.ripetizioni||"—"}</td>
                    <td style={{ padding:"10px 12px", fontSize:13, color:T.text }}>{ex.recupero||"—"}</td>
                    <td style={{ padding:"10px 12px", fontSize:12, color:T.textSec }}>{ex.muscolo||"—"}</td>
                    <td style={{ padding:"10px 12px", fontSize:13, color:T.primary, fontWeight:600 }}>{ex.peso_suggerito?`${ex.peso_suggerito} kg`:"—"}</td>
                    <td style={{ padding:"10px 12px", fontSize:12, color:T.textSec }}>{ex.note||"—"}</td>
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

// ─── TOAST ─────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  return (
    <div style={{ position:"fixed", bottom:32, right:32, zIndex:2000, background:"#1A1A1A", color:"white", padding:"14px 24px", borderRadius:12, fontSize:14, fontWeight:600, display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 20px rgba(0,0,0,0.3)", maxWidth:400 }}>
      <Check size={16} color={T.success}/> {msg}
    </div>
  );
}

// ─── APP PRINCIPALE ────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [data,             setData]            = useState(null);
  const [loading,          setLoading]         = useState(true);
  const [error,            setError]           = useState(null);
  const [page,             setPage]            = useState("dashboard");
  const [selectedCliente,  setSelectedCliente] = useState(null);
  const [selectedScheda,   setSelectedScheda]  = useState(null);
  const [whatsappCliente,  setWhatsappCliente] = useState(null);
  const [showNuovoCliente, setShowNuovoCliente]= useState(false);
  const [saving, setSaving] = useState(false);
  const [showAggiornaScheda, setShowAggiornaScheda] = useState(false);
  const [toast,            setToast]           = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null), 4000); };

  const loadData = useCallback(async()=>{
    setLoading(true); setError(null);
    try { setData(await fetchAllData()); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ loadData(); },[loadData]);

  // ── Elimina cliente ─────────────────────────────────────────────────────
  const handleElimina = async (cliente) => {
    setSaving(true);
    try {
      await deleteRow('clienti', 0, cliente.codice);
      navigate('clienti');
      await loadData();
      showToast('✅ Cliente eliminato!');
    } catch(e) {
      showToast('❌ Errore: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Salva nuovo cliente + scheda su Google Sheets ────────────────────────
  const handleSaveNuovoCliente = async ({ cliente, scheda, esercizi }) => {
    setSaving(true);
    try {
      // Fetch dati freschi per codici aggiornati
      const freshData = await fetchAllData();
      const codiceCliente = nextCode(freshData.clienti.map(c=>c.codice), "MG-");
      const codiceScheda  = nextCode(freshData.schede.map(s=>s.scheda_id), "SCH-");
      
      // Controllo duplicati
      const dup = freshData.clienti.find(c => 
        c.nome?.toLowerCase()===cliente.nome.toLowerCase() && 
        c.cognome?.toLowerCase()===cliente.cognome.toLowerCase()
      );
      if(dup) { showToast('❌ ' + cliente.nome + ' ' + cliente.cognome + ' esiste già!', 'error'); return; }

      await writeRow('clienti', [codiceCliente,cliente.cognome,cliente.nome,cliente.pin,cliente.telefono,cliente.email,codiceScheda,cliente.obiettivo,cliente.data_iscrizione]);
      await writeRow('schede',  [codiceScheda,scheda.nome_scheda,'',scheda.num_sedute,'2',scheda.data_creazione,scheda.data_scadenza,'']);
      for (const ex of esercizi) {
        await writeRow('esercizi', [codiceScheda,ex.seduta,ex.tipo_seduta||'',ex.esercizio,ex.ripetizioni,ex.serie,ex.recupero,ex.muscolo,ex.peso_suggerito,ex.note||'','',ex.video_url||'']);
      }
      setShowNuovoCliente(false);
      await loadData();
      showToast('✅ ' + cliente.nome + ' ' + cliente.cognome + ' (' + codiceCliente + ') aggiunto!');
    } catch(e) {
      showToast('❌ Errore: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Aggiorna scheda cliente ─────────────────────────────────────────────
  const handleAggiornaScheda = ({ nuovoId, vecchioId, scheda, esercizi }) => {
    setData(prev => {
      // aggiorna cliente: scheda_attiva = nuovoId, aggiungi vecchioId alle passate
      const clientiUpd = prev.clienti.map(c => {
        if (c.codice !== selectedCliente.codice) return c;
        const passate = [c.schede_passate, vecchioId].filter(Boolean).join(",");
        return { ...c, scheda_attiva:nuovoId, schede_passate:passate };
      });
      return {
        ...prev,
        clienti:  clientiUpd,
        schede:   [...prev.schede, scheda],
        esercizi: [...prev.esercizi, ...esercizi],
      };
    });
    // aggiorna selectedCliente in memoria
    setSelectedCliente(prev => ({
      ...prev,
      scheda_attiva:   nuovoId,
      schede_passate:  [prev.schede_passate, vecchioId].filter(Boolean).join(","),
    }));
    setShowAggiornaScheda(false);
    showToast(`Scheda di ${selectedCliente.nome} aggiornata! La vecchia è nello storico.`);
  };

  if(loading) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
      <Dumbbell size={32} color={T.primary}/><span style={{ color:T.textSec, fontSize:15 }}>Caricamento...</span>
    </div>
  );
  if(error) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <AlertCircle size={40} color={T.danger}/>
      <p style={{ color:T.text, fontSize:16, fontWeight:700 }}>Errore di connessione</p>
      <p style={{ color:T.textSec, fontSize:13 }}>{error}</p>
      <button onClick={loadData} style={{ background:T.primary, border:"none", borderRadius:10, padding:"12px 28px", color:"white", fontWeight:700, cursor:"pointer" }}>Riprova</button>
    </div>
  );

  const navigate = p => { setPage(p); setSelectedCliente(null); setSelectedScheda(null); setShowNuovoCliente(false); setShowAggiornaScheda(false); };
  const activePage = page==="clienteDetail"?"clienti":page==="schedaDetail"?"schede":page;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,sans-serif}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#DDD;border-radius:3px}button,input,select,textarea{font-family:inherit}`}</style>
      <Sidebar active={activePage} onNavigate={navigate} config={data.config}/>
      <div style={{ flex:1, padding:"32px 40px", overflow:"auto" }}>
        {toast && <Toast msg={toast}/>}
        {whatsappCliente && <WhatsAppModal cliente={whatsappCliente} onClose={()=>setWhatsappCliente(null)}/>}

        {/* DASHBOARD */}
        {page==="dashboard" && !showNuovoCliente &&
          <DashboardView data={data} onNavigate={navigate} onSelectCliente={c=>{ setSelectedCliente(c); setPage("clienteDetail"); }}/>}

        {/* CLIENTI */}
        {page==="clienti" && !showNuovoCliente && !showAggiornaScheda &&
          <ClientiView data={data} onSelectCliente={c=>{ setSelectedCliente(c); setPage("clienteDetail"); }} onNuovoCliente={()=>setShowNuovoCliente(true)}/>}

        {/* FORM NUOVO CLIENTE */}
        {showNuovoCliente &&
          <div>
            <button onClick={()=>setShowNuovoCliente(false)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:T.primary, fontSize:13, fontWeight:600, marginBottom:20, padding:0 }}>
              <ArrowLeft size={16}/> Indietro
            </button>
            <NuovoClienteForm data={data} onSave={handleSaveNuovoCliente} onCancel={()=>setShowNuovoCliente(false)} saving={saving}/>
          </div>}

        {/* CLIENTE DETAIL */}
        {page==="clienteDetail" && selectedCliente && !showNuovoCliente && !showAggiornaScheda &&
          <ClienteDetail cliente={selectedCliente} data={data} onBack={()=>navigate("clienti")} onWhatsApp={c=>setWhatsappCliente(c)} onAggiornaScheda={()=>setShowAggiornaScheda(true)} onElimina={handleElimina}/>}

        {/* FORM AGGIORNA SCHEDA */}
        {showAggiornaScheda && selectedCliente &&
          <div>
            <button onClick={()=>setShowAggiornaScheda(false)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:T.primary, fontSize:13, fontWeight:600, marginBottom:20, padding:0 }}>
              <ArrowLeft size={16}/> Indietro
            </button>
            <AggiornaSchedaForm cliente={selectedCliente} data={data} onSave={handleAggiornaScheda} onCancel={()=>setShowAggiornaScheda(false)} saving={saving}/>
          </div>}

        {/* SCHEDE */}
        {page==="schede" && !showNuovoCliente &&
          <SchedeView data={data} onSelectScheda={s=>{ setSelectedScheda(s); setPage("schedaDetail"); }}/>}

        {/* SCHEDA DETAIL */}
        {page==="schedaDetail" && selectedScheda &&
          <SchedaDetail scheda={selectedScheda} data={data} onBack={()=>navigate("schede")}/>}
      </div>
    </div>
  );
}
