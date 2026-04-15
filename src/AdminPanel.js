import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users, ClipboardList, LayoutDashboard, Search, ChevronRight,
  Dumbbell, Calendar, AlertCircle, ArrowLeft, X, Send,
  Plus, Trash2, Save, ChevronDown, Check, BookOpen
} from "lucide-react";

// ─── CONFIGURAZIONE ────────────────────────────────────────────────────────
const SHEET_ID = "1ncZxiiLhlfaWlKHmqZk1qb9tg5R6CBpT3cWKKuZrBXg";
const API_KEY  = "AIzaSyAJAb5dT3e8TVCB8LO11C6fi0b72qHFmmg";
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;
const APP_URL  = "https://mastergymboard.vercel.app";
const LOGO_URL = "https://raw.githubusercontent.com/mmolinaris/mastergymboard/main/public/icon-512.png";

// ─── COLORI ────────────────────────────────────────────────────────────────
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
    seduta:   e.seduta   || e.giorno || "",
    recupero: e.recupero || e.riposo_sec || "0",
    muscolo:  e.muscolo  || e.gruppo_muscolare || "",
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
const fmtDate  = d => { if (!d) return "—"; if (d.includes("/")) return d; const p = d.split("-"); return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:d; };
const daysUntil = d => { if (!d) return 999; return Math.ceil((new Date(d)-new Date())/86400000); };
const today = () => new Date().toLocaleDateString("it-IT");
const addMonths = (m) => { const d=new Date(); d.setMonth(d.getMonth()+m); return d.toISOString().split("T")[0]; };

// ─── SIDEBAR ───────────────────────────────────────────────────────────────
function Sidebar({ active, onNavigate, config }) {
  const items = [
    { id:"dashboard", icon:LayoutDashboard, label:"Dashboard" },
    { id:"clienti",   icon:Users,           label:"Clienti"   },
    { id:"schede",    icon:ClipboardList,   label:"Schede"    },
  ];
  return (
    <div style={{ width:220, minHeight:"100vh", background:T.sidebar, display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ padding:"24px 20px", borderBottom:"1px solid #2A2A2A" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", overflow:"hidden", border:"2px solid #333" }}>
            <img src={LOGO_URL} alt="Logo" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
          <div>
            <div style={{ color:"white", fontSize:13, fontWeight:800 }}>{config?.nome_palestra||"Master Gym"}</div>
            <div style={{ color:"#666", fontSize:10 }}>Pannello Gestione</div>
          </div>
        </div>
      </div>
      <div style={{ padding:"16px 12px", flex:1 }}>
        {items.map(({ id, icon:Icon, label }) => {
          const a = active===id;
          return (
            <button key={id} onClick={()=>onNavigate(id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 16px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:4, background:a?T.primary:"transparent", color:a?"white":"#888", fontWeight:a?700:500, fontSize:13 }}>
              <Icon size={18} strokeWidth={a?2.2:1.5}/>{label}
            </button>
          );
        })}
      </div>
      <div style={{ padding:"16px 20px", borderBottom:"1px solid #2A2A2A" }}>
        <div style={{ color:"#555", fontSize:11 }}>GymBoard v2.0</div>
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

// ─── FORM NUOVO CLIENTE ────────────────────────────────────────────────────
function NuovoClienteForm({ data, onSave, onCancel }) {
  const { clienti, schede } = data;

  // calcola prossimo codice
  const nextCodice = useMemo(() => {
    const nums = clienti.map(c => parseInt(c.codice?.replace(/\D/g,""))||0);
    const max  = nums.length ? Math.max(...nums) : 0;
    return `MG-${String(max+1).padStart(3,"0")}`;
  }, [clienti]);

  const [form, setForm] = useState({
    codice:        nextCodice,
    cognome:       "",
    nome:          "",
    pin:           "",
    telefono:      "",
    email:         "",
    scheda_attiva: "",
    obiettivo:     "",
    data_iscrizione: today(),
  });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const valid = form.nome && form.cognome && form.pin.length===4;

  return (
    <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:28, maxWidth:560 }}>
      <h2 style={{ fontSize:18, fontWeight:800, color:T.text, marginBottom:20 }}>➕ Nuovo Cliente</h2>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {[
          ["Codice (auto)", "codice", "text", true],
          ["PIN (4 cifre) *", "pin", "text", false],
          ["Nome *", "nome", "text", false],
          ["Cognome *", "cognome", "text", false],
          ["Telefono", "telefono", "tel", false],
          ["Email", "email", "email", false],
          ["Data iscrizione", "data_iscrizione", "text", false],
          ["Obiettivo", "obiettivo", "text", false],
        ].map(([label, key, type, readOnly]) => (
          <div key={key}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:5 }}>{label}</label>
            <input
              value={form[key]} type={type} readOnly={readOnly}
              onChange={e => { if(key==="pin") set(key, e.target.value.replace(/\D/g,"").slice(0,4)); else set(key, e.target.value); }}
              style={{ width:"100%", background:readOnly?"#F5F5F5":T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box" }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop:14 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:5 }}>Scheda assegnata</label>
        <select value={form.scheda_attiva} onChange={e=>set("scheda_attiva",e.target.value)}
          style={{ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none" }}>
          <option value="">— Nessuna scheda per ora —</option>
          {schede.map(s=><option key={s.scheda_id} value={s.scheda_id}>{s.scheda_id} — {s.nome_scheda}</option>)}
        </select>
      </div>

      {!valid && <p style={{ fontSize:12, color:T.danger, marginTop:12 }}>⚠️ Nome, cognome e PIN (4 cifre) sono obbligatori</p>}

      <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${T.border}`, background:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>Annulla</button>
        <button onClick={()=>valid&&onSave(form)} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:valid?T.primary:"#CCC", color:"white", cursor:valid?"pointer":"default", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
          <Save size={15}/> Salva cliente
        </button>
      </div>
    </div>
  );
}

// ─── FORM NUOVA SCHEDA ─────────────────────────────────────────────────────
function NuovaSchedaForm({ data, onSave, onCancel }) {
  const { schede, libreria } = data;

  const nextId = useMemo(() => {
    const nums = schede.map(s=>parseInt(s.scheda_id?.replace(/\D/g,""))||0);
    const max  = nums.length?Math.max(...nums):0;
    return `SCH-${String(max+1).padStart(3,"0")}`;
  }, [schede]);

  const [step, setStep]       = useState(1); // 1=info generali, 2=esercizi
  const [numSedute, setNumSedute] = useState(3);
  const [info, setInfo] = useState({
    scheda_id:      nextId,
    nome_scheda:    "",
    obiettivo:      "",
    durata_mesi:    "2",
    data_creazione: new Date().toISOString().split("T")[0],
    data_scadenza:  addMonths(2),
    note_trainer:   "",
  });

  // sedute[i] = array di esercizi
  const emptyEx = () => ({ esercizio:"", muscolo:"", serie:"3", ripetizioni:"12", recupero:"60", peso_suggerito:"", tipo_seduta:"", note:"", video_url:"" });
  const [sedute, setSedute] = useState(Array.from({length:3},()=>[emptyEx()]));

  // aggiorna numero sedute
  const handleNumSedute = (n) => {
    setNumSedute(n);
    setSedute(prev => {
      const next = [...prev];
      while(next.length < n) next.push([emptyEx()]);
      return next.slice(0,n);
    });
  };

  const setEx = (si, ei, key, val) => {
    setSedute(prev => {
      const next = prev.map(s=>[...s]);
      next[si][ei] = {...next[si][ei], [key]:val};
      // auto-popola muscolo dalla libreria
      if(key==="esercizio") {
        const found = libreria.find(l=>l.esercizio===val);
        if(found) next[si][ei].muscolo = found.muscolo;
      }
      return next;
    });
  };
  const addEx  = (si) => setSedute(prev=>{ const n=[...prev]; n[si]=[...n[si],emptyEx()]; return n; });
  const delEx  = (si,ei) => setSedute(prev=>{ const n=[...prev]; n[si]=n[si].filter((_,i)=>i!==ei); return n; });

  const validInfo = info.nome_scheda && info.obiettivo;

  const handleSave = () => {
    // costruisce le righe esercizi
    const righe = [];
    sedute.forEach((exs, si) => {
      exs.forEach(ex => {
        if(!ex.esercizio) return;
        righe.push({
          scheda_id:      info.scheda_id,
          seduta:         `Seduta ${si+1}`,
          tipo_seduta:    ex.tipo_seduta||"",
          esercizio:      ex.esercizio,
          ripetizioni:    ex.ripetizioni,
          serie:          ex.serie,
          recupero:       ex.recupero,
          muscolo:        ex.muscolo,
          peso_suggerito: ex.peso_suggerito,
          note:           ex.note,
          tecnica:        "",
          video_url:      ex.video_url,
        });
      });
    });
    onSave({ info:{ ...info, num_sedute:String(numSedute) }, esercizi:righe });
  };

  const muscoli = [...new Set(libreria.map(l=>l.muscolo))].sort();
  const esNomi  = libreria.map(l=>l.esercizio);

  return (
    <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:28, maxWidth:760 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:T.text, flex:1 }}>
          {step===1?"📋 Nuova Scheda — Info generali":"💪 Nuova Scheda — Esercizi"}
        </h2>
        <div style={{ display:"flex", gap:6 }}>
          {[1,2].map(s=>(
            <div key={s} style={{ width:28, height:28, borderRadius:"50%", background:step>=s?T.primary:T.border, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>{s}</div>
          ))}
        </div>
      </div>

      {step===1 && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[
              ["ID Scheda (auto)","scheda_id",true],
              ["Nome scheda *","nome_scheda",false],
              ["Obiettivo *","obiettivo",false],
              ["Durata (mesi)","durata_mesi",false],
              ["Data inizio","data_creazione",false],
              ["Data scadenza","data_scadenza",false],
            ].map(([label,key,ro])=>(
              <div key={key}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:5 }}>{label}</label>
                <input value={info[key]} readOnly={ro}
                  onChange={e=>setInfo(f=>({...f,[key]:e.target.value}))}
                  style={{ width:"100%", background:ro?"#F5F5F5":T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box" }}/>
              </div>
            ))}
          </div>

          <div style={{ marginTop:14 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:8 }}>Numero di sedute</label>
            <div style={{ display:"flex", gap:8 }}>
              {[1,2,3,4].map(n=>(
                <button key={n} onClick={()=>handleNumSedute(n)}
                  style={{ width:52, height:52, borderRadius:12, border:`2px solid ${numSedute===n?T.primary:T.border}`, background:numSedute===n?T.primaryLight:"white", color:numSedute===n?T.primary:T.text, fontSize:18, fontWeight:800, cursor:"pointer" }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop:14 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.textSec, marginBottom:5 }}>Note trainer</label>
            <textarea value={info.note_trainer} onChange={e=>setInfo(f=>({...f,note_trainer:e.target.value}))} rows={2}
              style={{ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box", resize:"vertical" }}/>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
            <button onClick={onCancel} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${T.border}`, background:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>Annulla</button>
            <button onClick={()=>validInfo&&setStep(2)} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:validInfo?T.primary:"#CCC", color:"white", cursor:validInfo?"pointer":"default", fontSize:13, fontWeight:700 }}>
              Avanti → Esercizi
            </button>
          </div>
        </>
      )}

      {step===2 && (
        <>
          {sedute.map((exs, si)=>(
            <div key={si} style={{ marginBottom:24 }}>
              <div style={{ fontSize:13, fontWeight:800, color:T.primary, marginBottom:10, padding:"6px 12px", background:T.primaryLight, borderRadius:8, display:"inline-block" }}>
                Seduta {si+1}
              </div>

              {exs.map((ex, ei)=>(
                <div key={ei} style={{ background:T.bg, borderRadius:12, padding:14, marginBottom:8, border:`1px solid ${T.border}` }}>
                  <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto", gap:8, alignItems:"end" }}>

                    {/* esercizio con datalist */}
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

                    {[
                      ["SERIE","serie","2"],
                      ["REPS","ripetizioni","12"],
                      ["RECUPERO (s)","recupero","60"],
                      ["PESO (kg)","peso_suggerito",""],
                    ].map(([label,key,ph])=>(
                      <div key={key}>
                        <label style={{ display:"block", fontSize:10, fontWeight:700, color:T.textSec, marginBottom:4 }}>{label}</label>
                        <input value={ex[key]} onChange={e=>setEx(si,ei,key,e.target.value)} placeholder={ph}
                          style={{ width:"100%", background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 10px", fontSize:13, color:T.text, outline:"none", boxSizing:"border-box" }}/>
                      </div>
                    ))}

                    <button onClick={()=>delEx(si,ei)} style={{ background:"none", border:"none", cursor:"pointer", color:T.danger, padding:"8px", marginBottom:2 }}>
                      <Trash2 size={16}/>
                    </button>
                  </div>

                  {/* seconda riga: muscolo, tipo, note, video */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr 2fr", gap:8, marginTop:8 }}>
                    <div>
                      <label style={{ display:"block", fontSize:10, fontWeight:700, color:T.textSec, marginBottom:4 }}>MUSCOLO</label>
                      <input value={ex.muscolo} onChange={e=>setEx(si,ei,"muscolo",e.target.value)}
                        placeholder="Auto dalla libreria"
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
                      <label style={{ display:"block", fontSize:10, fontWeight:700, color:T.textSec, marginBottom:4 }}>VIDEO URL (YouTube)</label>
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

          <div style={{ display:"flex", gap:10, marginTop:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setStep(1)} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${T.border}`, background:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>← Indietro</button>
            <button onClick={onCancel} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${T.border}`, background:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>Annulla</button>
            <button onClick={handleSave} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:T.primary, color:"white", cursor:"pointer", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
              <Save size={15}/> Salva scheda
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────
function DashboardView({ data, onNavigate, onSelectCliente }) {
  const { clienti, schede, esercizi } = data;
  const stats = useMemo(()=>({
    totClienti:  clienti.filter(c=>c.codice&&c.nome).length,
    schedeAttive: schede.length,
    inScadenza:  clienti.filter(c=>{ const s=schede.find(sc=>sc.scheda_id===c.scheda_attiva); return s&&daysUntil(s.data_scadenza)<=7&&daysUntil(s.data_scadenza)>0; }).length,
    totEsercizi: esercizi.length,
  }),[clienti,schede,esercizi]);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:T.text, marginBottom:4 }}>Dashboard</h1>
        <p style={{ fontSize:14, color:T.textSec }}>Panoramica della tua palestra</p>
      </div>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:28 }}>
        <StatCard icon={Users}         label="Clienti attivi"  value={stats.totClienti}   color={T.primary}  bgColor={T.primaryLight}/>
        <StatCard icon={ClipboardList} label="Schede create"   value={stats.schedeAttive} color="#6366F1"    bgColor="#EEF2FF"/>
        <StatCard icon={AlertCircle}   label="In scadenza"     value={stats.inScadenza}   color={T.danger}   bgColor={T.dangerLight}/>
        <StatCard icon={Dumbbell}      label="Esercizi totali" value={stats.totEsercizi}  color={T.success}  bgColor={T.successLight}/>
      </div>
      <div style={{ background:T.card, borderRadius:14, border:`1px solid ${T.border}`, overflow:"hidden" }}>
        <div style={{ padding:"18px 22px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:15, fontWeight:700, color:T.text }}>Ultimi clienti</span>
          <button onClick={()=>onNavigate("clienti")} style={{ background:T.primaryLight, border:`1px solid ${T.primaryBorder}`, borderRadius:8, padding:"6px 14px", cursor:"pointer", color:T.primary, fontSize:12, fontWeight:700 }}>Vedi tutti →</button>
        </div>
        {clienti.filter(c=>c.codice&&c.nome).slice(0,5).map(c=>{
          const scheda=schede.find(s=>s.scheda_id===c.scheda_attiva);
          return (
            <button key={c.codice} onClick={()=>onSelectCliente(c)} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"14px 22px", border:"none", borderBottom:`1px solid ${T.border}`, background:"white", cursor:"pointer", textAlign:"left" }}>
              <div style={{ width:38, height:38, borderRadius:10, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:T.primary, flexShrink:0 }}>{c.nome?.[0]}{c.cognome?.[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:T.text }}>{c.nome} {c.cognome}</div>
                <div style={{ fontSize:12, color:T.textSec }}>{scheda?.nome_scheda||"Nessuna scheda"}</div>
              </div>
              <span style={{ fontSize:11, color:T.textMut, background:T.bg, padding:"3px 8px", borderRadius:5, fontWeight:600 }}>{c.codice}</span>
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
function ClienteDetail({ cliente, data, onBack, onWhatsApp }) {
  const { schede, esercizi, progressi } = data;
  const scheda    = schede.find(s=>s.scheda_id===cliente.scheda_attiva);
  const schedaEx  = esercizi.filter(e=>e.scheda_id===cliente.scheda_attiva);
  const sedute    = [...new Set(schedaEx.map(e=>e.seduta))].filter(Boolean);
  const miei      = (progressi||[]).filter(p=>p.codice_cliente===cliente.codice);

  return (
    <div>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:T.primary, fontSize:13, fontWeight:600, marginBottom:20, padding:0 }}>
        <ArrowLeft size={16}/> Torna alla lista
      </button>

      <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:24, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:T.primary }}>{cliente.nome?.[0]}{cliente.cognome?.[0]}</div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:20, fontWeight:800, color:T.text, margin:0 }}>{cliente.nome} {cliente.cognome}</h2>
            <div style={{ fontSize:12, color:T.textSec, marginTop:2 }}>Codice: <b>{cliente.codice}</b> · PIN: <b>{cliente.pin}</b></div>
          </div>
          <button onClick={()=>onWhatsApp(cliente)} style={{ display:"flex", alignItems:"center", gap:6, background:"#25D366", color:"white", border:"none", borderRadius:10, padding:"10px 18px", cursor:"pointer", fontSize:13, fontWeight:700 }}>
            <Send size={15}/> WhatsApp
          </button>
        </div>
        {[["📞",cliente.telefono],["📧",cliente.email],["📅",`Iscritto: ${fmtDate(cliente.data_iscrizione)}`],["🎯",cliente.obiettivo]].filter(([,v])=>v).map(([icon,val],i)=>(
          <div key={i} style={{ fontSize:13, color:T.textSec, marginBottom:4 }}>{icon} {val}</div>
        ))}
      </div>

      {scheda ? (
        <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden", marginBottom:16 }}>
          <div style={{ padding:"18px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:T.primary, letterSpacing:"1px", marginBottom:4 }}>SCHEDA ATTIVA</div>
              <div style={{ fontSize:17, fontWeight:800, color:T.text }}>{scheda.nome_scheda}</div>
              <div style={{ fontSize:12, color:T.textSec, marginTop:2 }}>{scheda.obiettivo} · {fmtDate(scheda.data_creazione)} → {fmtDate(scheda.data_scadenza)}</div>
            </div>
            {daysUntil(scheda.data_scadenza)<=7 && <span style={{ fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:8, color:T.danger, background:T.dangerLight }}>{daysUntil(scheda.data_scadenza)>0?`Scade tra ${daysUntil(scheda.data_scadenza)}g`:"Scaduta"}</span>}
          </div>
          {sedute.map(sed=>{
            const dayExs=schedaEx.filter(e=>e.seduta===sed).sort((a,b)=>parseInt(a.ordine||0)-parseInt(b.ordine||0));
            return (
              <div key={sed} style={{ borderBottom:`1px solid ${T.border}` }}>
                <div style={{ padding:"10px 24px", background:T.bg, fontSize:13, fontWeight:700, color:T.primary }}>{sed}{dayExs[0]?.tipo_seduta?` — ${dayExs[0].tipo_seduta}`:""}</div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr>{["Esercizio","Serie","Reps","Rec.","Muscolo","Peso"].map(h=><th key={h} style={{ padding:"8px 12px", fontSize:11, fontWeight:700, color:T.textMut, textAlign:"left" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {dayExs.map((ex,i)=>(
                      <tr key={i} style={{ borderBottom:`1px solid ${T.border}22` }}>
                        <td style={{ padding:"10px 12px", fontSize:13, fontWeight:600, color:T.text }}>{ex.esercizio}</td>
                        <td style={{ padding:"10px 12px", fontSize:13, color:T.text }}>{ex.serie||"—"}</td>
                        <td style={{ padding:"10px 12px", fontSize:13, color:T.text }}>{ex.ripetizioni||"—"}</td>
                        <td style={{ padding:"10px 12px", fontSize:13, color:T.text }}>{ex.recupero||"—"}</td>
                        <td style={{ padding:"10px 12px", fontSize:12, color:T.textSec }}>{ex.muscolo||"—"}</td>
                        <td style={{ padding:"10px 12px", fontSize:13, color:T.primary, fontWeight:600 }}>{ex.peso_suggerito?`${ex.peso_suggerito} kg`:"—"}</td>
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
        </div>
      )}

      {miei.length>0 && (
        <div style={{ background:T.card, borderRadius:16, border:`1px solid ${T.border}`, padding:24 }}>
          <div style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:12 }}>📈 Progressi registrati</div>
          {Object.entries(miei.reduce((acc,p)=>{ if(!acc[p.esercizio])acc[p.esercizio]=[]; acc[p.esercizio].push(p); return acc; },{})).map(([ex,logs])=>(
            <div key={ex} style={{ marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:6 }}>{ex}</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {logs.map((l,i)=><span key={i} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:T.text }}>{l.data}: <b style={{ color:T.primary }}>{l.peso_kg} kg</b></span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SCHEDE VIEW ───────────────────────────────────────────────────────────
function SchedeView({ data, onSelectScheda, onNuovaScheda }) {
  const { schede, clienti, esercizi } = data;
  return (
    <div>
      <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:T.text, marginBottom:4 }}>Schede</h1>
          <p style={{ fontSize:14, color:T.textSec }}>{schede.length} schede create</p>
        </div>
        <button onClick={onNuovaScheda} style={{ display:"flex", alignItems:"center", gap:8, background:T.primary, border:"none", borderRadius:12, padding:"12px 20px", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus size={16}/> Nuova scheda
        </button>
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
                <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:6, background:T.primaryLight, color:T.primary }}>{s.scheda_id}</span>
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
            <div style={{ padding:"12px 20px", background:T.bg, borderBottom:`1px solid ${T.border}`, fontSize:13, fontWeight:700, color:T.primary }}>{sed}{dayExs[0]?.tipo_seduta?` — ${dayExs[0].tipo_seduta}`:""}</div>
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
function Toast({ msg, type }) {
  return (
    <div style={{ position:"fixed", bottom:32, right:32, zIndex:2000, background:type==="ok"?"#1A1A1A":T.danger, color:"white", padding:"14px 24px", borderRadius:12, fontSize:14, fontWeight:600, display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>
      {type==="ok"?<Check size={16}/>:<AlertCircle size={16}/>} {msg}
    </div>
  );
}

// ─── APP PRINCIPALE ────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [data,              setData]             = useState(null);
  const [loading,           setLoading]          = useState(true);
  const [error,             setError]            = useState(null);
  const [page,              setPage]             = useState("dashboard");
  const [selectedCliente,   setSelectedCliente]  = useState(null);
  const [selectedScheda,    setSelectedScheda]   = useState(null);
  const [whatsappCliente,   setWhatsappCliente]  = useState(null);
  const [showNuovoCliente,  setShowNuovoCliente] = useState(false);
  const [showNuovaScheda,   setShowNuovaScheda]  = useState(false);
  const [toast,             setToast]            = useState(null);
  const [saving,            setSaving]           = useState(false);

  const showToast = (msg, type="ok") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3500);
  };

  const loadData = useCallback(async()=>{
    setLoading(true); setError(null);
    try { setData(await fetchAllData()); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ loadData(); },[loadData]);

  // ── SALVA CLIENTE (simula scrittura su Sheets) ─────────────────────────
  // NOTA: Per scrivere su Google Sheets serve il Service Account OAuth.
  // Per ora salviamo in stato locale e mostriamo istruzioni.
  const handleSaveCliente = (form) => {
    setSaving(true);
    // Aggiunge il cliente in locale
    setData(prev=>({
      ...prev,
      clienti: [...prev.clienti, form]
    }));
    setShowNuovoCliente(false);
    setSaving(false);
    showToast(`✅ Cliente ${form.nome} ${form.cognome} aggiunto! Copia i dati su Google Sheets.`);
  };

  // ── SALVA SCHEDA ───────────────────────────────────────────────────────
  const handleSaveScheda = ({ info, esercizi }) => {
    setSaving(true);
    setData(prev=>({
      ...prev,
      schede:   [...prev.schede, info],
      esercizi: [...prev.esercizi, ...esercizi],
    }));
    setShowNuovaScheda(false);
    setSaving(false);
    showToast(`✅ Scheda ${info.nome_scheda} creata con ${esercizi.length} esercizi!`);
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

  const navigate = p => { setPage(p); setSelectedCliente(null); setSelectedScheda(null); setShowNuovoCliente(false); setShowNuovaScheda(false); };
  const activePage = page==="clienteDetail"?"clienti":page==="schedaDetail"?"schede":page;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,sans-serif}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#DDD;border-radius:3px}button{font-family:inherit}input,select,textarea{font-family:inherit}`}</style>

      <Sidebar active={activePage} onNavigate={navigate} config={data.config}/>

      <div style={{ flex:1, padding:"32px 40px", overflow:"auto", maxWidth:1100 }}>
        {toast && <Toast msg={toast.msg} type={toast.type}/>}
        {whatsappCliente && <WhatsAppModal cliente={whatsappCliente} onClose={()=>setWhatsappCliente(null)}/>}

        {/* DASHBOARD */}
        {page==="dashboard" && !showNuovoCliente && !showNuovaScheda &&
          <DashboardView data={data} onNavigate={navigate} onSelectCliente={c=>{ setSelectedCliente(c); setPage("clienteDetail"); }}/>}

        {/* CLIENTI */}
        {page==="clienti" && !showNuovoCliente &&
          <ClientiView data={data} onSelectCliente={c=>{ setSelectedCliente(c); setPage("clienteDetail"); }} onNuovoCliente={()=>setShowNuovoCliente(true)}/>}

        {/* FORM NUOVO CLIENTE */}
        {showNuovoCliente &&
          <div>
            <button onClick={()=>setShowNuovoCliente(false)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:T.primary, fontSize:13, fontWeight:600, marginBottom:20, padding:0 }}>
              <ArrowLeft size={16}/> Torna ai clienti
            </button>
            <NuovoClienteForm data={data} onSave={handleSaveCliente} onCancel={()=>setShowNuovoCliente(false)}/>
          </div>}

        {/* CLIENTE DETAIL */}
        {page==="clienteDetail" && selectedCliente && !showNuovoCliente &&
          <ClienteDetail cliente={selectedCliente} data={data} onBack={()=>navigate("clienti")} onWhatsApp={c=>setWhatsappCliente(c)}/>}

        {/* SCHEDE */}
        {page==="schede" && !showNuovaScheda &&
          <SchedeView data={data} onSelectScheda={s=>{ setSelectedScheda(s); setPage("schedaDetail"); }} onNuovaScheda={()=>setShowNuovaScheda(true)}/>}

        {/* FORM NUOVA SCHEDA */}
        {showNuovaScheda &&
          <div>
            <button onClick={()=>setShowNuovaScheda(false)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:T.primary, fontSize:13, fontWeight:600, marginBottom:20, padding:0 }}>
              <ArrowLeft size={16}/> Torna alle schede
            </button>
            <NuovaSchedaForm data={data} onSave={handleSaveScheda} onCancel={()=>setShowNuovaScheda(false)}/>
          </div>}

        {/* SCHEDA DETAIL */}
        {page==="schedaDetail" && selectedScheda && !showNuovaScheda &&
          <SchedaDetail scheda={selectedScheda} data={data} onBack={()=>navigate("schede")}/>}
      </div>
    </div>
  );
}
