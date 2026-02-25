import { useState, useEffect } from "react";

const REGISTRATION_DEADLINE = new Date("2026-03-15T23:59:59");
const API = "https://pubg-tournament-api.onrender.com";
const ADMIN_PASSWORD = "pubg@admin2026";

const TEAM_CODENAMES = [
  "Iron Wolves","Shadow Vipers","Ghost Reapers","Steel Phantoms","Death Ravens",
  "Dark Hunters","Neon Jackals","Crimson Hawks","Void Stalkers","Blood Eagles",
  "Storm Foxes","Cold Cobras","Silent Tigers","Wild Bisons","Frost Bears",
  "Blaze Panthers","Night Falcons","Sand Sharks","Thunder Lynx","Red Dingoes",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function smartBuildTeams(playerNames) {
  const shuffled = shuffle(playerNames);
  const n = shuffled.length;
  if (n < 3) return [];
  let best = null;
  for (let a = Math.floor(n / 4); a >= 0; a--) {
    const rem = n - 4 * a;
    if (rem % 3 === 0) { best = { fours: a, threes: rem / 3 }; break; }
  }
  if (!best) best = { fours: 0, threes: Math.floor(n / 3) };
  const squads = [];
  let idx = 0, nameIdx = 0;
  for (let i = 0; i < best.fours; i++) {
    squads.push({ id: squads.length + 1, name: TEAM_CODENAMES[nameIdx++ % TEAM_CODENAMES.length], players: shuffled.slice(idx, idx + 4) });
    idx += 4;
  }
  for (let i = 0; i < best.threes; i++) {
    squads.push({ id: squads.length + 1, name: TEAM_CODENAMES[nameIdx++ % TEAM_CODENAMES.length], players: shuffled.slice(idx, idx + 3) });
    idx += 3;
  }
  return squads;
}

function getPreview(n) {
  if (n < 3) return null;
  for (let a = Math.floor(n / 4); a >= 0; a--) {
    const rem = n - 4 * a;
    if (rem % 3 === 0) return { fours: a, threes: rem / 3 };
  }
  return { fours: 0, threes: Math.floor(n / 3) };
}

async function apiLoadPlayers() {
  const res = await fetch(`${API}/players`);
  if (!res.ok) throw new Error("Failed to load");
  return res.json();
}

async function apiAddPlayer(player) {
  const res = await fetch(`${API}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(player),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save");
  return data;
}

async function apiClearPlayers() {
  const res = await fetch(`${API}/players`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear");
}

// ─────────────────────────────────────────────
// STYLES — mobile-first
// ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body { background: #0B0C10; font-family: 'Barlow', sans-serif; color: #E2E8F0; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #F5A623; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.35; } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes shimmer  { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes slideUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes glow     { 0%,100% { box-shadow: 0 0 20px rgba(245,166,35,.3); } 50% { box-shadow: 0 0 40px rgba(245,166,35,.6); } }

  .fu0  { animation: fadeUp .5s ease both; }
  .fu1  { animation: fadeUp .5s .1s ease both; }
  .fu2  { animation: fadeUp .5s .2s ease both; }
  .fu3  { animation: fadeUp .5s .3s ease both; }
  .fu4  { animation: fadeUp .5s .4s ease both; }
  .fu5  { animation: fadeUp .5s .5s ease both; }
  .slide-up { animation: slideUp .3s ease both; }
  .pulse-anim { animation: pulse 2s infinite; }

  /* ── BUTTONS ── */
  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: #F5A623; color: #0B0C10;
    font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
    border: none; padding: 14px 28px; cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: all .2s; width: 100%;
  }
  .btn-primary:hover:not(:disabled) { background: #FFB84D; transform: translateY(-1px); }
  .btn-primary:disabled { background: #2D3748; color: #4A5568; cursor: not-allowed; clip-path: none; }

  .btn-outline {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    background: transparent; border: 1.5px solid #F5A623; color: #F5A623;
    font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 10px 18px; cursor: pointer; transition: all .2s; white-space: nowrap;
  }
  .btn-outline:hover { background: rgba(245,166,35,.12); }

  .btn-ghost {
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent; border: 1.5px solid #2D3748; color: #718096;
    font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    padding: 8px 14px; cursor: pointer; transition: all .2s; white-space: nowrap;
  }
  .btn-ghost:hover { border-color: #4A5568; color: #A0AEC0; }

  .btn-danger {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    background: transparent; border: 1.5px solid #FC8181; color: #FC8181;
    font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    padding: 8px 14px; cursor: pointer; transition: all .2s; white-space: nowrap;
  }
  .btn-danger:hover { background: rgba(252,129,129,.1); }

  .btn-secondary {
    display: inline-flex; align-items: center; justify-content: center;
    background: rgba(245,166,35,.08); border: 1.5px solid rgba(245,166,35,.25); color: #F5A623;
    font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 11px 20px; cursor: pointer; transition: all .2s; width: 100%;
  }
  .btn-secondary:hover { background: rgba(245,166,35,.15); }

  /* ── FORM ── */
  .field-label {
    font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; color: #718096; display: block; margin-bottom: 6px;
  }
  .field-input {
    width: 100%; background: #141720; border: 1.5px solid #1E2533;
    color: #E2E8F0; font-family: 'Barlow', sans-serif; font-size: 16px; padding: 13px 14px;
    outline: none; transition: border-color .2s; border-radius: 2px;
    -webkit-appearance: none;
  }
  .field-input:focus { border-color: #F5A623; }

  /* ── MODAL ── */
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.85);
    display: flex; align-items: flex-end; justify-content: center;
    z-index: 200; backdrop-filter: blur(4px);
  }
  @media (min-width: 640px) {
    .overlay { align-items: center; }
  }
  .modal-sheet {
    background: #111318; width: 100%; max-width: 520px;
    border-top: 3px solid #F5A623; padding: 28px 20px 36px;
    max-height: 92vh; overflow-y: auto; position: relative;
    border-radius: 0;
  }
  @media (min-width: 640px) {
    .modal-sheet { border: 1px solid #1E2533; border-top: 3px solid #F5A623; padding: 32px; max-height: 88vh; }
  }
  .modal-sheet::before {
    content: ''; display: block; width: 40px; height: 4px;
    background: #2D3748; border-radius: 2px; margin: 0 auto 24px;
  }
  @media (min-width: 640px) { .modal-sheet::before { display: none; } }

  .confirm-sheet {
    background: #111318; width: calc(100% - 32px); max-width: 380px;
    border: 1.5px solid #FC8181; padding: 24px; border-radius: 4px;
  }

  /* ── TABS ── */
  .tab-bar {
    display: flex; overflow-x: auto; border-bottom: 1px solid #1E2533;
    scrollbar-width: none; -ms-overflow-style: none;
  }
  .tab-bar::-webkit-scrollbar { display: none; }
  .tab-item {
    flex-shrink: 0; background: none; border: none; cursor: pointer;
    font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; color: #4A5568;
    padding: 14px 16px; position: relative; transition: color .2s; white-space: nowrap;
  }
  .tab-item.active { color: #F5A623; }
  .tab-item.active::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: #F5A623;
  }
  .tab-item:hover { color: #A0AEC0; }

  /* ── CARDS ── */
  .squad-card {
    background: #111318; border: 1px solid #1E2533; padding: 16px;
    transition: border-color .2s;
  }
  .squad-card:hover { border-color: rgba(245,166,35,.3); }

  .feature-card {
    background: #111318; border: 1px solid #1E2533;
    padding: 20px 16px; display: flex; gap: 14px; align-items: flex-start;
    transition: border-color .2s, transform .2s;
  }
  .feature-card:hover { border-color: rgba(245,166,35,.25); transform: translateY(-2px); }

  /* ── PLAYER ROW ── */
  .player-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-bottom: 1px solid #0F1117;
    transition: background .15s;
  }
  .player-row:hover { background: #141720; }
  .player-row:last-child { border-bottom: none; }

  /* ── MISC ── */
  .notice { background: #0F1117; border-left: 3px solid #F5A623; padding: 12px 14px; }
  .error-msg { color: #FC8181; font-size: 12px; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 1px; margin-top: 6px; }
  .badge-4 { background: #0D2A10; border: 1px solid #166534; color: #86EFAC; font-size: 10px; padding: 2px 8px; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 1px; font-weight: 700; }
  .badge-3 { background: #1A2540; border: 1px solid #1E3A8A; color: #93C5FD; font-size: 10px; padding: 2px 8px; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 1px; font-weight: 700; }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #F56565; display: inline-block; margin-right: 5px; }
  .spinner { width: 18px; height: 18px; border: 2px solid #1E2533; border-top-color: #F5A623; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, #1E2533, transparent); margin: 24px 0; }
  .gold { color: #F5A623; }
  .muted { color: #4A5568; }
  .heading { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
  .empty-box { text-align: center; padding: 56px 20px; color: #2D3748; }

  /* ── COUNTER ── */
  .counter-tile {
    background: #111318; border: 1px solid #1E2533;
    padding: 16px 12px; text-align: center; flex: 1; min-width: 64px;
  }
  .counter-num { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 8vw, 44px); font-weight: 800; color: #F5A623; line-height: 1; }
  .counter-lbl { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #4A5568; margin-top: 4px; }

  /* ── SHIMMER ── */
  .shimmer { background: linear-gradient(90deg, #F5A623, #FFD580, #F5A623); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }

  /* ── STICKY HEADER ── */
  .sticky-header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(11,12,16,.95); backdrop-filter: blur(12px);
    border-bottom: 1px solid #1E2533;
  }

  /* ── RESPONSIVE GRID ── */
  .squad-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
  @media (min-width: 480px) { .squad-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 800px) { .squad-grid { grid-template-columns: repeat(3, 1fr); } }

  .feature-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
  @media (min-width: 600px) { .feature-grid { grid-template-columns: repeat(2, 1fr); } }

  /* ── PLAYER TABLE responsive ── */
  .ptable-head, .ptable-row {
    display: grid;
    grid-template-columns: 32px 1fr 80px;
    align-items: center;
    padding: 10px 14px;
    gap: 8px;
  }
  @media (min-width: 560px) {
    .ptable-head, .ptable-row { grid-template-columns: 36px 1fr 110px 90px; }
  }
  @media (min-width: 760px) {
    .ptable-head, .ptable-row { grid-template-columns: 40px 1fr 130px 100px 84px; }
  }
  .ptable-col-email { display: none; }
  .ptable-col-date  { display: none; }
  @media (min-width: 560px) { .ptable-col-email { display: block; } }
  @media (min-width: 760px) { .ptable-col-date  { display: block; } }
`;

// ─────────────────────────────────────────────
// FIELD — defined outside modals (prevents focus loss)
// ─────────────────────────────────────────────
function Field({ form, setForm, setError, label, field, placeholder, type = "text", optional = false }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="field-label">
        {label}{optional && <span style={{ color: "#2D3748", marginLeft: 6, fontSize: 10 }}>(optional)</span>}
      </label>
      <input
        className="field-input"
        type={type}
        placeholder={placeholder}
        value={form[field]}
        onChange={e => { setForm({ ...form, [field]: e.target.value }); setError(""); }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────
function LandingPage({ onEnter, onRegister, players, regOpen, deadline }) {
  const [t, setT] = useState({ d: "00", h: "00", m: "00", s: "00" });

  useEffect(() => {
    const tick = () => {
      const diff = deadline - new Date();
      if (diff <= 0) { setT({ d: "00", h: "00", m: "00", s: "00" }); return; }
      setT({
        d: String(Math.floor(diff / 86400000)).padStart(2, "0"),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
      });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const features = [
    { icon: "📋", title: "Structured registration", desc: "Collect team rosters, IDs, and substitutes with centralized forms." },
    { icon: "📅", title: "Match day clarity", desc: "Publish schedules, share room details, and avoid confusion." },
    { icon: "🗂️", title: "Plan your format", desc: "Pick stages, rules, and scoring to match your tournament goals." },
    { icon: "⚡", title: "Run matches", desc: "Track results in real time and keep standings up to date." },
    { icon: "🏆", title: "Publish winners", desc: "Share final standings and match results with one link." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10" }}>
      {/* Nav bar */}
      <div style={{ padding: "0 16px", borderBottom: "1px solid #1E2533", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "#F5A623", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🎯</div>
          <span className="heading" style={{ fontSize: 16, color: "#F5A623", letterSpacing: 3 }}>BATTLEGROUND</span>
        </div>
        <button className="btn-ghost" onClick={onEnter} style={{ fontSize: 11, padding: "7px 12px" }}>Dashboard →</button>
      </div>

      {/* Hero */}
      <div style={{ padding: "48px 16px 40px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div className="fu0" style={{ display: "inline-block", background: "rgba(245,166,35,.1)", border: "1px solid rgba(245,166,35,.25)", padding: "4px 14px", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#F5A623" }}>PUBG TOURNAMENT 2026</span>
        </div>

        <h1 className="fu1 shimmer heading" style={{ fontSize: "clamp(36px, 10vw, 64px)", lineHeight: 1, marginBottom: 16, letterSpacing: 1 }}>
          COMPETE.<br />DOMINATE.<br />WIN.
        </h1>

        <p className="fu2" style={{ fontSize: 16, color: "#718096", lineHeight: 1.7, marginBottom: 32, maxWidth: 420, margin: "0 auto 32px" }}>
          Register solo, get auto-assigned to a squad. The ultimate PUBG tournament — organized, fair, and live-tracked.
        </p>

        {/* Countdown */}
        <div className="fu3" style={{ marginBottom: 36 }}>
          {regOpen ? (
            <>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#4A5568", marginBottom: 12, textTransform: "uppercase" }}>Registration closes in</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {[["DAYS", t.d], ["HRS", t.h], ["MIN", t.m], ["SEC", t.s]].map(([label, val]) => (
                  <div key={label} className="counter-tile">
                    <div className="counter-num">{val}</div>
                    <div className="counter-lbl">{label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 800, color: "#FC8181", letterSpacing: 3, padding: "14px 24px", border: "1.5px solid rgba(252,129,129,.3)", display: "inline-block" }}>
              ⛔ REGISTRATION CLOSED
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="fu4" style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320, margin: "0 auto" }}>
          {regOpen ? (
            <>
              <button className="btn-primary" style={{ fontSize: 16, padding: "16px 28px" }} onClick={onRegister}>⚡ REGISTER NOW</button>
              <button className="btn-secondary" onClick={onEnter}>View Dashboard</button>
            </>
          ) : (
            <button className="btn-primary" style={{ fontSize: 16, padding: "16px 28px" }} onClick={onEnter}>VIEW TOURNAMENT →</button>
          )}
        </div>

        {players.length > 0 && (
          <div className="fu5" style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 8, background: "#111318", border: "1px solid #1E2533", padding: "8px 16px" }}>
            <span className="live-dot pulse-anim" />
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#F5A623" }}>{players.length} PLAYERS REGISTERED</span>
          </div>
        )}
      </div>

      <div className="divider" style={{ maxWidth: 600, margin: "0 auto" }} />

      {/* Features */}
      <div style={{ padding: "32px 16px 56px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="heading" style={{ fontSize: 11, color: "#4A5568", letterSpacing: 4, marginBottom: 8 }}>WHAT YOU GET</div>
          <div className="heading" style={{ fontSize: 26, color: "#E2E8F0" }}>Everything to run your tournament</div>
        </div>
        <div className="feature-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card fu1" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
              <div>
                <div className="heading" style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 5 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#718096", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1E2533", padding: "16px", textAlign: "center" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: "#2D3748", letterSpacing: 2 }}>BATTLEGROUND PUBG TOURNAMENT · 2026</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REGISTRATION MODAL
// ─────────────────────────────────────────────
function RegModal({ players, onClose, onSuccess }) {
  const [form, setForm] = useState({ username: "", pubgId: "", fullName: "", phone: "", email: "", experience: "beginner" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.username.trim()) { setError("PUBG username is required."); return; }
    if (!form.fullName.trim()) { setError("Full name is required."); return; }
    if (!form.email.trim() || !form.email.includes("@")) { setError("Valid email is required."); return; }
    setSaving(true);
    try {
      const p = await apiAddPlayer({ username: form.username.trim(), pubgId: form.pubgId.trim(), fullName: form.fullName.trim(), phone: form.phone.trim(), email: form.email.trim(), experience: form.experience });
      onSuccess(p); setSuccess(true);
    } catch (e) { setError(e.message || "Failed. Is the server running?"); }
    finally { setSaving(false); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet slide-up">
        {success ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎯</div>
            <div className="heading" style={{ fontSize: 22, color: "#68D391", marginBottom: 10 }}>YOU'RE IN!</div>
            <p style={{ fontSize: 14, color: "#718096", lineHeight: 1.7, marginBottom: 24 }}>
              Welcome, <strong style={{ color: "#F5A623" }}>{form.username}</strong>!<br />
              Squad assignment happens after the deadline.
            </p>
            <button className="btn-primary" onClick={onClose} style={{ maxWidth: 200, margin: "0 auto" }}>CLOSE</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div className="heading" style={{ fontSize: 20, color: "#F5A623" }}>PLAYER REGISTRATION</div>
                <div style={{ fontSize: 12, color: "#4A5568", marginTop: 3 }}>{players.length} player{players.length !== 1 ? "s" : ""} already registered</div>
              </div>
              <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 14 }} onClick={onClose}>✕</button>
            </div>

            <div className="notice" style={{ marginBottom: 20, fontSize: 13, color: "#718096", lineHeight: 1.6 }}>
              Teams randomly assigned after <strong style={{ color: "#F5A623" }}>March 15, 2026</strong>. Register solo — we handle the rest.
            </div>

            <Field form={form} setForm={setForm} setError={setError} label="PUBG Username *" field="username" placeholder="Your in-game username" />
            <Field form={form} setForm={setForm} setError={setError} label="PUBG ID" field="pubgId" placeholder="e.g. Player#1234" optional />
            <Field form={form} setForm={setForm} setError={setError} label="Full Name *" field="fullName" placeholder="Your real name" />
            <Field form={form} setForm={setForm} setError={setError} label="Email *" field="email" placeholder="you@example.com" type="email" />
            <Field form={form} setForm={setForm} setError={setError} label="Phone" field="phone" placeholder="+1 (555) 000-0000" optional />

            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Experience Level</label>
              <select className="field-input" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} style={{ background: "#141720", cursor: "pointer" }}>
                <option value="beginner">🟢 Beginner — Just started PUBG</option>
                <option value="intermediate">🟡 Intermediate — Regular player</option>
                <option value="advanced">🟠 Advanced — Competitive player</option>
                <option value="pro">🔴 Pro — Tournament experience</option>
              </select>
            </div>

            {error && <div className="error-msg">⚠ {error}</div>}

            <div style={{ marginTop: 20 }}>
              <button className="btn-primary" onClick={submit} disabled={saving || !form.username.trim() || !form.fullName.trim() || !form.email.trim()} style={{ fontSize: 15, padding: "15px" }}>
                {saving ? <><span className="spinner" /> SAVING...</> : "CONFIRM REGISTRATION"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN LOGIN MODAL
// ─────────────────────────────────────────────
function AdminLoginModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (password === ADMIN_PASSWORD) { onSuccess(); onClose(); }
    else { setError("Incorrect password."); setPassword(""); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="confirm-sheet slide-up" style={{ border: "1.5px solid rgba(245,166,35,.4)" }}>
        <div className="heading" style={{ fontSize: 16, color: "#F5A623", marginBottom: 6 }}>🔐 ADMIN ACCESS</div>
        <p style={{ fontSize: 13, color: "#4A5568", marginBottom: 18 }}>Enter your admin password to unlock controls.</p>
        <input className="field-input" type="password" placeholder="Admin password" value={password} autoFocus
          onChange={e => { setPassword(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && submit()} />
        {error && <div className="error-msg">⚠ {error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button className="btn-primary" style={{ flex: 1, padding: "12px" }} onClick={submit}>UNLOCK</button>
          <button className="btn-ghost" style={{ flex: 1, padding: "12px" }} onClick={onClose}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function Dashboard({ players, setPlayers, regOpen, timeLeft, serverOnline }) {
  const [tab, setTab] = useState("players");
  const [teams, setTeams] = useState([]);
  const [teamsReady, setTeamsReady] = useState(false);
  const [showReg, setShowReg] = useState(false);
  const [showGen, setShowGen] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const preview = getPreview(players.length);

  const genTeams = () => {
    setTeams(smartBuildTeams(players.map(p => p.username)));
    setTeamsReady(true); setShowGen(false); setTab("teams");
  };

  const clearAll = async () => {
    await apiClearPlayers();
    setPlayers([]); setTeams([]); setTeamsReady(false); setShowClear(false);
  };

  const expColor = { beginner: "#86EFAC", intermediate: "#FCD34D", advanced: "#FB923C", pro: "#FC8181" };
  const expBg = { beginner: "#0D2A10", intermediate: "#2A2010", advanced: "#2A1A0D", pro: "#2A0D0D" };

  const tabs = [
    { key: "players", label: "Players", count: players.length },
    { key: "teams", label: "Teams", count: teamsReady ? teams.length : null },
    { key: "schedule", label: "Schedule" },
    { key: "live", label: "Live" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10" }}>
      {/* Sticky header */}
      <div className="sticky-header">
        <div style={{ padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, background: "#F5A623", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>🎯</div>
            <span className="heading" style={{ fontSize: 15, color: "#F5A623", letterSpacing: 3 }}>BATTLEGROUND</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!serverOnline && (
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#FC8181", letterSpacing: 1 }}>⚠ OFFLINE</span>
            )}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: "#4A5568", letterSpacing: 2 }}>{regOpen ? "CLOSES IN" : "REGISTRATION"}</div>
              <div className="heading" style={{ fontSize: 12, color: regOpen ? "#F5A623" : "#FC8181" }} >{timeLeft}</div>
            </div>
            {regOpen && (
              <button className="btn-outline" style={{ fontSize: 11, padding: "8px 12px" }} onClick={() => setShowReg(true)}>+ JOIN</button>
            )}
          </div>
        </div>
        <div className="tab-bar">
          {tabs.map(t => (
            <button key={t.key} className={`tab-item ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}{t.count != null && <span style={{ marginLeft: 5, color: "#F5A623", fontSize: 10 }}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Offline banner */}
      {!serverOnline && (
        <div style={{ background: "#1A0A0A", borderBottom: "1px solid rgba(252,129,129,.2)", padding: "10px 16px", textAlign: "center" }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#FC8181", letterSpacing: 1 }}>⚠ Server offline — run <strong>node server.cjs</strong> to enable saving</span>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 48px" }}>

        {/* ── PLAYERS TAB ── */}
        {tab === "players" && (
          <div className="slide-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div className="heading" style={{ fontSize: 22, color: "#E2E8F0" }}>Registered Players</div>
                <div style={{ fontSize: 12, color: "#4A5568", marginTop: 2 }}>
                  {preview
                    ? `${players.length} players → ${preview.fours > 0 ? `${preview.fours}×4` : ""}${preview.fours > 0 && preview.threes > 0 ? " + " : ""}${preview.threes > 0 ? `${preview.threes}×3` : ""} squads`
                    : `${players.length} player${players.length !== 1 ? "s" : ""} — need 3+ to form teams`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {isAdmin ? (
                  players.length > 0 && <button className="btn-danger" onClick={() => setShowClear(true)}>🗑 Clear All</button>
                ) : (
                  <button className="btn-ghost" onClick={() => setShowAdminLogin(true)}>🔐 Admin</button>
                )}
                {players.length >= 3 && (
                  <button className="btn-outline" onClick={() => setShowGen(true)}>⚡ Pick Teams</button>
                )}
              </div>
            </div>

            {players.length > 0 && (
              <div className="notice" style={{ marginBottom: 16, fontSize: 13, color: "#718096" }}>
                Teams are randomly assigned after the <strong style={{ color: "#F5A623" }}>March 15, 2026</strong> deadline.
                {players.length >= 3 && <> Preview anytime using <strong style={{ color: "#F5A623" }}>Pick Teams</strong>.</>}
              </div>
            )}

            <div style={{ background: "#111318", border: "1px solid #1E2533" }}>
              <div className="ptable-head" style={{ borderBottom: "1px solid #1E2533" }}>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4A5568", letterSpacing: 2 }}>#</span>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4A5568", letterSpacing: 2 }}>PLAYER</span>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4A5568", letterSpacing: 2 }}>LEVEL</span>
                <span className="ptable-col-email" style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4A5568", letterSpacing: 2 }}>EMAIL</span>
                <span className="ptable-col-date" style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4A5568", letterSpacing: 2 }}>DATE</span>
              </div>
              {players.map((p, i) => (
                <div key={p.id} className="ptable-row player-row">
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#4A5568" }}>#{i + 1}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${(p.username.charCodeAt(0) * 37) % 360},30%,20%)`, border: `1.5px solid hsl(${(p.username.charCodeAt(0) * 37) % 360},30%,32%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#F5A623", flexShrink: 0 }}>
                      {p.username[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.username}</div>
                      {p.fullName && <div style={{ fontSize: 11, color: "#4A5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.fullName}</div>}
                    </div>
                  </div>
                  <div>
                    <span style={{ padding: "2px 8px", fontSize: 10, fontFamily: "'Barlow Condensed'", fontWeight: 700, background: expBg[p.experience], color: expColor[p.experience] }}>
                      {p.experience?.toUpperCase()}
                    </span>
                  </div>
                  <div className="ptable-col-email" style={{ fontSize: 11, color: "#4A5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>
                  <div className="ptable-col-date" style={{ fontSize: 11, color: "#4A5568", fontFamily: "'Barlow Condensed'" }}>{p.registeredAt}</div>
                </div>
              ))}
              {players.length === 0 && (
                <div className="empty-box">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🪂</div>
                  <div className="heading" style={{ fontSize: 14, letterSpacing: 2, color: "#2D3748" }}>NO PLAYERS YET</div>
                  <div style={{ fontSize: 13, color: "#2D3748", marginTop: 6 }}>Be the first to register!</div>
                  {regOpen && (
                    <button className="btn-outline" style={{ marginTop: 20 }} onClick={() => setShowReg(true)}>⚡ REGISTER NOW</button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TEAMS TAB ── */}
        {tab === "teams" && (
          <div className="slide-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div className="heading" style={{ fontSize: 22, color: "#E2E8F0" }}>Auto-Picked Teams</div>
                {teamsReady && <div style={{ fontSize: 12, color: "#4A5568", marginTop: 2 }}>{teams.length} squads · {teams.filter(t => t.players.length === 4).length}×4 + {teams.filter(t => t.players.length === 3).length}×3</div>}
              </div>
              {teamsReady && <button className="btn-ghost" onClick={() => setTeams(smartBuildTeams(players.map(p => p.username)))}>🔀 Re-shuffle</button>}
            </div>

            {!teamsReady ? (
              <div className="empty-box">
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <div className="heading" style={{ fontSize: 14, letterSpacing: 2, color: "#2D3748" }}>TEAMS NOT ASSIGNED YET</div>
                <div style={{ fontSize: 13, color: "#2D3748", marginTop: 6, marginBottom: 20 }}>Players randomly shuffled into squads after deadline.</div>
                {players.length >= 3
                  ? <button className="btn-outline" onClick={() => setShowGen(true)}>⚡ GENERATE NOW</button>
                  : <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#FC8181", letterSpacing: 1 }}>NEED AT LEAST 3 PLAYERS</div>}
              </div>
            ) : (
              <div className="squad-grid">
                {teams.map(team => (
                  <div key={team.id} className="squad-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4A5568", letterSpacing: 2, marginBottom: 3 }}>SQUAD {String(team.id).padStart(3, "0")}</div>
                        <div className="heading" style={{ fontSize: 16, color: "#E2E8F0" }}>{team.name}</div>
                      </div>
                      <span className={team.players.length === 4 ? "badge-4" : "badge-3"}>{team.players.length} MAN</span>
                    </div>
                    <div style={{ borderTop: "1px solid #1E2533", paddingTop: 12 }}>
                      {team.players.map((p, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: `hsl(${(p.charCodeAt(0) * 37) % 360},30%,20%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#F5A623", flexShrink: 0 }}>{p[0].toUpperCase()}</div>
                          <span style={{ fontSize: 14, fontWeight: j === 0 ? 700 : 500, color: j === 0 ? "#F5A623" : "#A0AEC0", flex: 1 }}>{p}</span>
                          {j === 0 && <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: "#4A5568", letterSpacing: 1 }}>CPT</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab === "schedule" && (
          <div className="slide-up">
            <div className="heading" style={{ fontSize: 22, color: "#E2E8F0", marginBottom: 16 }}>Match Schedule</div>

            <div className="notice" style={{ marginBottom: 20, fontSize: 13, color: "#718096", lineHeight: 1.7 }}>
              📅 Schedules and room details will be published here before each match day. Check back closer to the tournament date.
            </div>

            {[
              { phase: "QUALIFIER", date: "March 20, 2026", time: "18:00 UTC", map: "Erangel", status: "UPCOMING" },
              { phase: "SEMI-FINAL", date: "March 22, 2026", time: "18:00 UTC", map: "Miramar", status: "UPCOMING" },
              { phase: "GRAND FINAL", date: "March 25, 2026", time: "18:00 UTC", map: "Erangel", status: "UPCOMING" },
            ].map((m, i) => (
              <div key={i} style={{ background: "#111318", border: "1px solid #1E2533", padding: "16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4A5568", letterSpacing: 2, marginBottom: 4 }}>{m.phase}</div>
                  <div className="heading" style={{ fontSize: 16, color: "#E2E8F0" }}>{m.date} · {m.time}</div>
                  <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>Map: {m.map}</div>
                </div>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#4A5568", border: "1px solid #1E2533", padding: "4px 10px" }}>{m.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── LIVE TAB ── */}
        {tab === "live" && (
          <div className="slide-up">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div className="heading" style={{ fontSize: 22, color: "#E2E8F0" }}>Live Matches</div>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#FC8181", border: "1px solid rgba(252,129,129,.3)", padding: "2px 8px" }}>LIVE</span>
            </div>

            {[
              { map: "Erangel", phase: "Zone 5", alive: 12, time: "32:14", status: "LIVE" },
              { map: "Miramar", phase: "Ended", alive: 0, time: "45:22", status: "ENDED" },
            ].map((m, i) => (
              <div key={i} style={{ background: "#111318", border: `1px solid ${m.status === "LIVE" ? "rgba(245,166,35,.3)" : "#1E2533"}`, padding: "16px", marginBottom: 10, position: "relative", overflow: "hidden" }}>
                {m.status === "LIVE" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#F5A623,transparent)" }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div className="heading" style={{ fontSize: 18, color: "#E2E8F0" }}>{m.map}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {m.status === "LIVE" && <span className="live-dot pulse-anim" />}
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: m.status === "LIVE" ? "#FC8181" : "#4A5568" }}>{m.status}</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {[["ALIVE", m.alive, m.status === "LIVE" ? "#F5A623" : "#4A5568"], ["PHASE", m.phase, "#718096"], ["TIME", m.time, "#A0AEC0"]].map(([lbl, val, col]) => (
                    <div key={lbl} style={{ background: "#0B0C10", padding: "10px 8px", textAlign: "center" }}>
                      <div className="heading" style={{ fontSize: 18, color: col }}>{val}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: "#4A5568", letterSpacing: 2, marginTop: 3 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ background: "#111318", border: "1px solid #1E2533", padding: "20px 16px", marginTop: 20, textAlign: "center" }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4A5568", letterSpacing: 3 }}>NEXT MATCH</div>
              <div className="heading" style={{ fontSize: 24, color: "#F5A623", margin: "8px 0 4px" }}>GRAND FINAL</div>
              <div style={{ fontSize: 13, color: "#718096" }}>Top 2 Squads · Erangel</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#4A5568", letterSpacing: 2, marginTop: 8 }}>MARCH 25, 2026 · 18:00 UTC</div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showReg && <RegModal players={players} onClose={() => setShowReg(false)} onSuccess={p => { setPlayers(prev => [...prev, p]); setShowReg(false); }} />}

      {showGen && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowGen(false)}>
          <div className="confirm-sheet slide-up" style={{ border: "1.5px solid rgba(245,166,35,.3)" }}>
            <div className="heading" style={{ fontSize: 16, color: "#F5A623", marginBottom: 8 }}>⚡ GENERATE TEAMS</div>
            <p style={{ fontSize: 13, color: "#718096", lineHeight: 1.7, marginBottom: 6 }}>
              Randomly assign <strong style={{ color: "#E2E8F0" }}>{players.length} players</strong> into squads.
            </p>
            {preview && <p style={{ fontSize: 13, color: "#F5A623", marginBottom: 16 }}>
              {preview.fours > 0 ? `${preview.fours} squad${preview.fours !== 1 ? "s" : ""} of 4` : ""}{preview.fours > 0 && preview.threes > 0 ? " + " : ""}{preview.threes > 0 ? `${preview.threes} squad${preview.threes !== 1 ? "s" : ""} of 3` : ""}
            </p>}
            {teamsReady && <p style={{ fontSize: 12, color: "#FC8181", marginBottom: 14 }}>⚠ This overwrites the current draw.</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" style={{ flex: 1, padding: "12px" }} onClick={genTeams}>CONFIRM</button>
              <button className="btn-ghost" style={{ flex: 1, padding: "12px" }} onClick={() => setShowGen(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {showClear && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowClear(false)}>
          <div className="confirm-sheet slide-up">
            <div className="heading" style={{ fontSize: 16, color: "#FC8181", marginBottom: 8 }}>🗑 CLEAR ALL PLAYERS</div>
            <p style={{ fontSize: 13, color: "#718096", lineHeight: 1.7, marginBottom: 6 }}>
              Permanently delete all <strong style={{ color: "#E2E8F0" }}>{players.length} registered players</strong>.
            </p>
            <p style={{ fontSize: 12, color: "#FC8181", marginBottom: 18 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-danger" style={{ flex: 1, padding: "12px" }} onClick={clearAll}>DELETE ALL</button>
              <button className="btn-ghost" style={{ flex: 1, padding: "12px" }} onClick={() => setShowClear(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {showAdminLogin && <AdminLoginModal onClose={() => setShowAdminLogin(false)} onSuccess={() => setIsAdmin(true)} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const now = new Date();
  const regStillOpen = now < REGISTRATION_DEADLINE;

  const [screen, setScreen] = useState(regStillOpen ? "landing" : "dashboard");
  const [showRegOnLanding, setShowRegOnLanding] = useState(false);
  const [players, setPlayers] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [regOpen, setRegOpen] = useState(regStillOpen);
  const [dbLoaded, setDbLoaded] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    apiLoadPlayers()
      .then(data => { setPlayers(data); setServerOnline(true); })
      .catch(() => setServerOnline(false))
      .finally(() => setDbLoaded(true));
  }, []);

  useEffect(() => {
    const tick = () => {
      const diff = REGISTRATION_DEADLINE - new Date();
      if (diff <= 0) { setRegOpen(false); setTimeLeft("CLOSED"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  if (!dbLoaded) return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight: "100vh", background: "#0B0C10", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, background: "#F5A623", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎯</div>
        <div className="spinner" style={{ width: 24, height: 24 }} />
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: "#4A5568", letterSpacing: 4 }}>LOADING...</div>
      </div>
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {screen === "landing" ? (
        <>
          <LandingPage onEnter={() => setScreen("dashboard")} onRegister={() => setShowRegOnLanding(true)} players={players} regOpen={regOpen} deadline={REGISTRATION_DEADLINE} />
          {showRegOnLanding && (
            <RegModal players={players} onClose={() => setShowRegOnLanding(false)}
              onSuccess={p => { setPlayers(prev => [...prev, p]); setShowRegOnLanding(false); }} />
          )}
        </>
      ) : (
        <Dashboard players={players} setPlayers={setPlayers} regOpen={regOpen} timeLeft={timeLeft} serverOnline={serverOnline} />
      )}
    </>
  );
}