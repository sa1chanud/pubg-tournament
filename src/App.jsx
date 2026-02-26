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

async function apiUpdatePlayer(id, player) {
  const res = await fetch(`${API}/players/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(player),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update");
  return data;
}

async function apiDeletePlayer(id) {
  const res = await fetch(`${API}/players/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete player");
}

async function apiLoadSchedule() {
  const res = await fetch(`${API}/schedule`);
  if (!res.ok) throw new Error("Failed to load schedule");
  return res.json();
}

async function apiAddSchedule(entry) {
  const res = await fetch(`${API}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save");
  return data;
}

async function apiUpdateSchedule(id, entry) {
  const res = await fetch(`${API}/schedule/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update");
  return data;
}

async function apiDeleteSchedule(id) {
  const res = await fetch(`${API}/schedule/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
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
      <div style={{ borderTop: "1px solid #1E2533", padding: "16px 16px 20px", textAlign: "center" }}>
        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: "#2D3748", letterSpacing: 2 }}>BATTLEGROUND PUBG TOURNAMENT · 2026</span>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <a
            href="mailto:saichandu.janga5@gmail.com?subject=Feedback%20%2F%20Suggestion%20-%20PUBG%20Tournament&body=Hi%2C%0A%0AI%20have%20the%20following%20feedback%20or%20suggestion%3A%0A%0A"
            style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#F5A623", letterSpacing: 1, textDecoration: "none", borderBottom: "1px solid #F5A62355", paddingBottom: 1 }}
          >
            💬 FEEDBACK / SUGGESTIONS
          </a>
          <a
            href="mailto:saichandu.janga5@gmail.com?subject=Contact%20Admin%20-%20PUBG%20Tournament&body=Hi%20Admin%2C%0A%0A"
            style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: "#A0AEC0", letterSpacing: 1, textDecoration: "none", borderBottom: "1px solid #A0AEC055", paddingBottom: 1 }}
          >
            📧 CONTACT ADMIN
          </a>
        </div>
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
// EDIT PLAYER MODAL (admin only)
// ─────────────────────────────────────────────
function EditPlayerModal({ player, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    username: player.username || "",
    pubgId: player.pubgId || "",
    fullName: player.fullName || "",
    email: player.email || "",
    phone: player.phone || "",
    experience: player.experience || "beginner",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!form.username.trim()) { setError("Username is required."); return; }
    if (!form.fullName.trim()) { setError("Full name is required."); return; }
    if (!form.email.trim() || !form.email.includes("@")) { setError("Valid email is required."); return; }
    setSaving(true);
    try {
      const updated = await apiUpdatePlayer(player.id, form);
      onSave(updated);
      onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const del = async () => {
    setDeleting(true);
    try {
      await apiDeletePlayer(player.id);
      onDelete(player.id);
      onClose();
    } catch (e) { setError(e.message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet slide-up">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div className="heading" style={{ fontSize: 18, color: "#F5A623" }}>EDIT PLAYER</div>
            <div style={{ fontSize: 12, color: "#4A5568", marginTop: 2 }}>Admin · Editing {player.username}</div>
          </div>
          <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 14 }} onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="field-label">PUBG Username *</label>
          <input className="field-input" value={form.username} onChange={e => { setForm({ ...form, username: e.target.value }); setError(""); }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="field-label">PUBG ID <span style={{ color: "#2D3748", fontSize: 10 }}>(optional)</span></label>
          <input className="field-input" value={form.pubgId} onChange={e => setForm({ ...form, pubgId: e.target.value })} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Full Name *</label>
          <input className="field-input" value={form.fullName} onChange={e => { setForm({ ...form, fullName: e.target.value }); setError(""); }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Email *</label>
          <input className="field-input" type="email" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setError(""); }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="field-label">Phone <span style={{ color: "#2D3748", fontSize: 10 }}>(optional)</span></label>
          <input className="field-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="field-label">Experience Level</label>
          <select className="field-input" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} style={{ background: "#141720", cursor: "pointer" }}>
            <option value="beginner">🟢 Beginner</option>
            <option value="intermediate">🟡 Intermediate</option>
            <option value="advanced">🟠 Advanced</option>
            <option value="pro">🔴 Pro</option>
          </select>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 14 }}>⚠ {error}</div>}

        <button className="btn-primary" style={{ fontSize: 14, padding: "13px", marginBottom: 10 }} onClick={save} disabled={saving}>
          {saving ? <><span className="spinner" /> SAVING...</> : "SAVE CHANGES"}
        </button>

        {!confirmDelete ? (
          <button className="btn-danger" style={{ width: "100%", padding: "11px", justifyContent: "center" }} onClick={() => setConfirmDelete(true)}>
            🗑 DELETE THIS PLAYER
          </button>
        ) : (
          <div style={{ background: "rgba(252,129,129,.08)", border: "1px solid rgba(252,129,129,.3)", padding: "14px", marginTop: 4 }}>
            <div style={{ fontSize: 13, color: "#FC8181", marginBottom: 12 }}>Are you sure? This cannot be undone.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-danger" style={{ flex: 1, padding: "10px" }} onClick={del} disabled={deleting}>
                {deleting ? "DELETING..." : "YES, DELETE"}
              </button>
              <button className="btn-ghost" style={{ flex: 1, padding: "10px" }} onClick={() => setConfirmDelete(false)}>CANCEL</button>
            </div>
          </div>
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
// SCHEDULE EDIT MODAL
// ─────────────────────────────────────────────
const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Karakin", "Nusa", "Rondo", "Room"];
const STATUSES = ["UPCOMING", "LIVE", "COMPLETED", "CANCELLED"];

// ─────────────────────────────────────────────
// SCORE MODAL
// ─────────────────────────────────────────────
function ScoreModal({ match, isAdmin, onSave, onClose }) {
  const [authed, setAuthed] = useState(isAdmin);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");

  // Build initial team rows: for room → rounds × 2 teams; for others → 2 teams
  const buildRows = () => {
    if (match.scores) {
      try { return JSON.parse(match.scores); } catch {}
    }
    const isRoom = match.matchType === "room";
    const rounds = isRoom ? parseInt(match.rounds || 1) : 1;
    return Array.from({ length: rounds }, (_, i) => ({
      round: isRoom ? i + 1 : null,
      team1: { name: "Team 1", score: "" },
      team2: { name: "Team 2", score: "" },
    }));
  };

  const [rows, setRows] = useState(buildRows);
  const [saving, setSaving] = useState(false);

  const updateRow = (ri, side, field, val) => {
    setRows(prev => prev.map((r, i) => i !== ri ? r : { ...r, [side]: { ...r[side], [field]: val } }));
  };

  const unlock = () => {
    if (password === ADMIN_PASSWORD) { setAuthed(true); setPwError(""); }
    else { setPwError("Incorrect password."); setPassword(""); }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(JSON.stringify(rows));
    setSaving(false);
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="confirm-sheet slide-up" style={{ border: "1.5px solid rgba(245,166,35,.3)", maxWidth: 440, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="heading" style={{ fontSize: 16, color: "#F5A623", marginBottom: 6 }}>🏆 ENTER SCORES</div>
        <div style={{ fontSize: 12, color: "#4A5568", fontFamily: "'Barlow Condensed'", letterSpacing: 1, marginBottom: 18 }}>{match.phase} · {match.date}</div>

        {!authed ? (
          <>
            <p style={{ fontSize: 13, color: "#4A5568", marginBottom: 18 }}>Enter admin password to update scores.</p>
            <input className="field-input" type="password" placeholder="Admin password" value={password} autoFocus
              onChange={e => { setPassword(e.target.value); setPwError(""); }}
              onKeyDown={e => e.key === "Enter" && unlock()} />
            {pwError && <div className="error-msg">⚠ {pwError}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="btn-primary" style={{ flex: 1, padding: "12px" }} onClick={unlock}>UNLOCK</button>
              <button className="btn-ghost" style={{ flex: 1, padding: "12px" }} onClick={onClose}>CANCEL</button>
            </div>
          </>
        ) : (
          <>
            {rows.map((row, ri) => (
              <div key={ri} style={{ marginBottom: 14, background: "#0B0C10", border: "1px solid #1E2533", padding: "12px", borderRadius: 4 }}>
                {row.round && (
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4A5568", letterSpacing: 2, marginBottom: 10 }}>ROUND {row.round}</div>
                )}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label className="field-label">Team 1 Name</label>
                    <input className="field-input" value={row.team1.name}
                      onChange={e => updateRow(ri, "team1", "name", e.target.value)} style={{ marginBottom: 6 }} />
                    <label className="field-label">Score</label>
                    <input className="field-input" type="number" min="0" placeholder="0" value={row.team1.score}
                      onChange={e => updateRow(ri, "team1", "score", e.target.value)} />
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, color: "#4A5568", fontWeight: 700, paddingBottom: 8 }}>VS</div>
                  <div style={{ flex: 1 }}>
                    <label className="field-label">Team 2 Name</label>
                    <input className="field-input" value={row.team2.name}
                      onChange={e => updateRow(ri, "team2", "name", e.target.value)} style={{ marginBottom: 6 }} />
                    <label className="field-label">Score</label>
                    <input className="field-input" type="number" min="0" placeholder="0" value={row.team2.score}
                      onChange={e => updateRow(ri, "team2", "score", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button className="btn-primary" style={{ flex: 1, padding: "12px" }} onClick={handleSave} disabled={saving}>
                {saving ? "SAVING..." : "SAVE SCORES"}
              </button>
              <button className="btn-ghost" style={{ flex: 1, padding: "12px" }} onClick={onClose}>CANCEL</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCHEDULE ADMIN GATE MODAL
// ─────────────────────────────────────────────
function ScheduleAdminGate({ onSuccess, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (password === ADMIN_PASSWORD) { onSuccess(); }
    else { setError("Incorrect password."); setPassword(""); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="confirm-sheet slide-up" style={{ border: "1.5px solid rgba(245,166,35,.4)" }}>
        <div className="heading" style={{ fontSize: 16, color: "#F5A623", marginBottom: 6 }}>🔐 ADMIN ACCESS</div>
        <p style={{ fontSize: 13, color: "#4A5568", marginBottom: 18 }}>Enter admin password to manage the schedule.</p>
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
// SCHEDULE EDIT MODAL
// ─────────────────────────────────────────────
const MATCH_TYPES = [
  { key: "1v1", label: "1 v 1", icon: "⚔️" },
  { key: "2v2", label: "2 v 2", icon: "👥" },
  { key: "3v3", label: "3 v 3", icon: "🔱" },
  { key: "4v4", label: "4 v 4", icon: "🛡️" },
  { key: "wow", label: "WOW", icon: "🌟" },
  { key: "room", label: "Room", icon: "🏠" },
];

function ScheduleEditModal({ match, saving, error, onSave, onClose }) {
  const inferType = () => {
    if (!match) return null;
    if (match.matchType) return match.matchType;
    return null;
  };

  const inferWowSub = () => {
    if (!match?.matchType) return null;
    if (match.matchType.startsWith("wow-")) return match.matchType.replace("wow-", "");
    return null;
  };

  const [matchType, setMatchType] = useState(inferType());
  const [wowSub, setWowSub] = useState(inferWowSub()); // null | "1v1"|"2v2"|"3v3"|"4v4"
  const [form, setForm] = useState({
    phase: match?.phase || "",
    date: match?.date || "",
    time: match?.time || "",
    map: match?.map || "Erangel",
    status: match?.status || "UPCOMING",
    roomId: match?.roomId || "",
    roomPass: match?.roomPass || "",
    rounds: match?.rounds || "1",
    playersPerTeam: match?.playersPerTeam || "4",
    matchType: match?.matchType || "",
  });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const isRoom = matchType === "room";
  const isWow = matchType === "wow";

  // Label shown in header
  const typeLabel = () => {
    if (!matchType) return null;
    if (isWow && wowSub) return `WOW · ${wowSub.toUpperCase()}`;
    return MATCH_TYPES.find(t => t.key === matchType)?.label;
  };

  // Back button behaviour
  const goBack = () => {
    if (isWow && wowSub) { setWowSub(null); }
    else { setMatchType(null); setWowSub(null); f("matchType", ""); }
  };

  // Show form when: non-wow type selected, OR wow + sub selected
  const showForm = matchType && !isWow || (isWow && wowSub);

  const WOW_SUBS = [
    { key: "1v1", label: "1 v 1", icon: "⚔️" },
    { key: "2v2", label: "2 v 2", icon: "👥" },
    { key: "3v3", label: "3 v 3", icon: "🔱" },
    { key: "4v4", label: "4 v 4", icon: "🛡️" },
  ];

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="confirm-sheet slide-up" style={{ border: "1.5px solid rgba(245,166,35,.3)", maxWidth: 420, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          {(matchType) && <button onClick={goBack} style={{ background: "none", border: "none", color: "#A0AEC0", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>←</button>}
          <div className="heading" style={{ fontSize: 16, color: "#F5A623" }}>
            {match ? "✏ EDIT MATCH" : "＋ ADD MATCH"}
            {typeLabel() && <span style={{ color: "#A0AEC0", fontWeight: 400, fontSize: 12, marginLeft: 8 }}>· {typeLabel()}</span>}
          </div>
        </div>

        {/* STEP 1 — Pick match type */}
        {!matchType && (
          <>
            <p style={{ fontSize: 12, color: "#4A5568", fontFamily: "'Barlow Condensed'", letterSpacing: 2, marginBottom: 14 }}>SELECT MATCH TYPE</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {MATCH_TYPES.map(t => (
                <button key={t.key} onClick={() => { setMatchType(t.key); f("matchType", t.key); }}
                  style={{ background: "#0B0C10", border: "1.5px solid #1E2533", borderRadius: 4, padding: "18px 10px", cursor: "pointer", textAlign: "center", transition: "border-color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#F5A623"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1E2533"}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "#E2E8F0" }}>{t.label}</div>
                </button>
              ))}
            </div>
            <button className="btn-ghost" style={{ width: "100%", marginTop: 14, padding: "11px" }} onClick={onClose}>CANCEL</button>
          </>
        )}

        {/* STEP 1b — WOW sub-type picker */}
        {isWow && !wowSub && (
          <>
            <p style={{ fontSize: 12, color: "#4A5568", fontFamily: "'Barlow Condensed'", letterSpacing: 2, marginBottom: 14 }}>SELECT WOW FORMAT</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {WOW_SUBS.map(t => (
                <button key={t.key} onClick={() => { setWowSub(t.key); f("matchType", `wow-${t.key}`); }}
                  style={{ background: "#0B0C10", border: "1.5px solid #1E2533", borderRadius: 4, padding: "18px 10px", cursor: "pointer", textAlign: "center", transition: "border-color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#F5A623"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1E2533"}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "#E2E8F0" }}>{t.label}</div>
                </button>
              ))}
            </div>
            <button className="btn-ghost" style={{ width: "100%", marginTop: 14, padding: "11px" }} onClick={onClose}>CANCEL</button>
          </>
        )}

        {/* STEP 2 — Standard match form (1v1 / 2v2 / 3v3 / 4v4 / wow-*) */}
        {showForm && !isRoom && (
          <>
            <label className="field-label">Phase / Round *</label>
            <input className="field-input" placeholder="e.g. QUALIFIER, SEMI-FINAL" value={form.phase}
              onChange={e => f("phase", e.target.value)} style={{ marginBottom: 10 }} />

            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">Date *</label>
                <input className="field-input" placeholder="e.g. March 20, 2026" value={form.date}
                  onChange={e => f("date", e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">Time *</label>
                <input className="field-input" placeholder="e.g. 18:00 UTC" value={form.time}
                  onChange={e => f("time", e.target.value)} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              {!isWow && (
                <div style={{ flex: 1 }}>
                  <label className="field-label">Map</label>
                  <select className="field-input" value={form.map} onChange={e => f("map", e.target.value)}>
                    {MAPS.filter(m => m !== "Room").map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <label className="field-label">Status</label>
                <select className="field-input" value={form.status} onChange={e => f("status", e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {error && <div className="error-msg" style={{ marginBottom: 10 }}>⚠ {error}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button className="btn-primary" style={{ flex: 1, padding: "12px" }}
                disabled={saving || !form.phase.trim() || !form.date.trim() || !form.time.trim()}
                onClick={() => onSave(form)}>
                {saving ? "SAVING..." : "SAVE"}
              </button>
              <button className="btn-ghost" style={{ flex: 1, padding: "12px" }} onClick={onClose}>CANCEL</button>
            </div>
          </>
        )}

        {/* STEP 2 — Room match form */}
        {matchType && isRoom && (
          <>
            <label className="field-label">Phase / Round *</label>
            <input className="field-input" placeholder="e.g. QUALIFIER, SEMI-FINAL" value={form.phase}
              onChange={e => f("phase", e.target.value)} style={{ marginBottom: 10 }} />

            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">Date *</label>
                <input className="field-input" placeholder="e.g. March 20, 2026" value={form.date}
                  onChange={e => f("date", e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">Time *</label>
                <input className="field-input" placeholder="e.g. 18:00 UTC" value={form.time}
                  onChange={e => f("time", e.target.value)} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">No. of Rounds</label>
                <input className="field-input" type="number" min="1" max="20" placeholder="e.g. 3" value={form.rounds}
                  onChange={e => f("rounds", e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">Players per Team</label>
                <input className="field-input" type="number" min="1" max="4" placeholder="e.g. 4" value={form.playersPerTeam}
                  onChange={e => f("playersPerTeam", e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label className="field-label">Status</label>
              <select className="field-input" value={form.status} onChange={e => f("status", e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <label className="field-label">Room ID</label>
            <input className="field-input" placeholder="Optional" value={form.roomId}
              onChange={e => f("roomId", e.target.value)} style={{ marginBottom: 10 }} />

            <label className="field-label">Room Password</label>
            <input className="field-input" placeholder="Optional" value={form.roomPass}
              onChange={e => f("roomPass", e.target.value)} style={{ marginBottom: 10 }} />

            {error && <div className="error-msg" style={{ marginBottom: 10 }}>⚠ {error}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button className="btn-primary" style={{ flex: 1, padding: "12px" }}
                disabled={saving || !form.phase.trim() || !form.date.trim() || !form.time.trim()}
                onClick={() => onSave(form)}>
                {saving ? "SAVING..." : "SAVE"}
              </button>
              <button className="btn-ghost" style={{ flex: 1, padding: "12px" }} onClick={onClose}>CANCEL</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GENERATE TEAMS MODAL (admin password gate)
// ─────────────────────────────────────────────
function GenTeamsModal({ players, preview, teamsReady, isAdmin, onConfirm, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(isAdmin);

  const unlock = () => {
    if (password === ADMIN_PASSWORD) { setAuthed(true); setError(""); }
    else { setError("Incorrect password."); setPassword(""); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="confirm-sheet slide-up" style={{ border: "1.5px solid rgba(245,166,35,.3)" }}>
        <div className="heading" style={{ fontSize: 16, color: "#F5A623", marginBottom: 8 }}>⚡ GENERATE TEAMS</div>

        {!authed ? (
          <>
            <p style={{ fontSize: 13, color: "#4A5568", marginBottom: 18 }}>Enter admin password to generate teams.</p>
            <input className="field-input" type="password" placeholder="Admin password" value={password} autoFocus
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && unlock()} />
            {error && <div className="error-msg">⚠ {error}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="btn-primary" style={{ flex: 1, padding: "12px" }} onClick={unlock}>UNLOCK</button>
              <button className="btn-ghost" style={{ flex: 1, padding: "12px" }} onClick={onClose}>CANCEL</button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#718096", lineHeight: 1.7, marginBottom: 6 }}>
              Randomly assign <strong style={{ color: "#E2E8F0" }}>{players.length} players</strong> into squads.
            </p>
            {preview && <p style={{ fontSize: 13, color: "#F5A623", marginBottom: 16 }}>
              {preview.fours > 0 ? `${preview.fours} squad${preview.fours !== 1 ? "s" : ""} of 4` : ""}{preview.fours > 0 && preview.threes > 0 ? " + " : ""}{preview.threes > 0 ? `${preview.threes} squad${preview.threes !== 1 ? "s" : ""} of 3` : ""}
            </p>}
            {teamsReady && <p style={{ fontSize: 12, color: "#FC8181", marginBottom: 14 }}>⚠ This overwrites the current draw.</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" style={{ flex: 1, padding: "12px" }} onClick={onConfirm}>CONFIRM</button>
              <button className="btn-ghost" style={{ flex: 1, padding: "12px" }} onClick={onClose}>CANCEL</button>
            </div>
          </>
        )}
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
  const [editingPlayer, setEditingPlayer] = useState(null);

  // Schedule state
  const [schedule, setSchedule] = useState([]);
  const [schedLoading, setSchedLoading] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);   // null | "new" | {match object}
  const [schedSaving, setSchedSaving] = useState(false);
  const [schedError, setSchedError] = useState("");
  const [schedAdminPending, setSchedAdminPending] = useState(null); // null | { action: "add"|"edit"|"delete", match? }
  const [scoreMatch, setScoreMatch] = useState(null);

  useEffect(() => {
    if (tab === "schedule") {
      setSchedLoading(true);
      apiLoadSchedule().then(data => { setSchedule(data); setSchedLoading(false); }).catch(() => setSchedLoading(false));
    }
  }, [tab]);

  const preview = getPreview(players.length);

  const genTeams = () => {
    setTeams(smartBuildTeams(players.map(p => p.username)));
    setTeamsReady(true); setShowGen(false); setTab("teams");
  };

  // Schedule admin gate: if already admin, act immediately; otherwise prompt password first
  const schedAction = (action, match = null) => {
    if (isAdmin) {
      if (action === "add") { setEditingMatch("new"); setSchedError(""); }
      else if (action === "edit") { setEditingMatch(match); setSchedError(""); }
      else if (action === "delete") { handleSchedDelete(match); }
      else if (action === "score") { setScoreMatch(match); }
    } else {
      setSchedAdminPending({ action, match });
    }
  };

  const handleSchedDelete = async (match) => {
    if (!confirm("Delete this match?")) return;
    await apiDeleteSchedule(match.id);
    setSchedule(s => s.filter(x => x.id !== match.id));
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
                {isAdmin && players.length >= 3 && (
                  <button className="btn-outline" onClick={() => setShowGen(true)}>⚡ Pick Teams</button>
                )}
              </div>
            </div>

            {players.length > 0 && (
              <div className="notice" style={{ marginBottom: 16, fontSize: 13, color: "#718096" }}>
                Teams are randomly assigned after the <strong style={{ color: "#F5A623" }}>March 15, 2026</strong> deadline.
                {isAdmin && players.length >= 3 && <> Use <strong style={{ color: "#F5A623" }}>Pick Teams</strong> to preview team assignments.</>}
                {isAdmin && <> As admin, <strong style={{ color: "#F5A623" }}>tap any row</strong> to edit or delete that player.</>}
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
                <div key={p.id} className="ptable-row player-row" style={{ cursor: isAdmin ? "pointer" : "default" }} onClick={() => isAdmin && setEditingPlayer(p)}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ padding: "2px 8px", fontSize: 10, fontFamily: "'Barlow Condensed'", fontWeight: 700, background: expBg[p.experience], color: expColor[p.experience] }}>
                      {p.experience?.toUpperCase()}
                    </span>
                    {isAdmin && (
                      <span style={{ fontSize: 11, color: "#4A5568", opacity: 0.6 }}>✏️</span>
                    )}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div className="heading" style={{ fontSize: 22, color: "#E2E8F0" }}>Match Schedule</div>
              <button className="btn-outline" onClick={() => schedAction("add")}>＋ Add Match</button>
            </div>

            {schedLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#4A5568", fontFamily: "'Barlow Condensed'", letterSpacing: 2 }}>LOADING...</div>
            ) : schedule.length === 0 ? (
              <div className="empty-box">
                <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
                <div className="heading" style={{ fontSize: 14, letterSpacing: 2, color: "#2D3748" }}>NO MATCHES SCHEDULED YET</div>
                <div style={{ fontSize: 13, color: "#2D3748", marginTop: 6 }}>
                  {isAdmin ? "Click \"+ Add Match\" to publish the first match." : "Check back closer to the tournament date."}
                </div>
              </div>
            ) : (
              schedule.map((m) => {
                const statusColor = { UPCOMING: "#4A5568", LIVE: "#F5A623", COMPLETED: "#86EFAC", CANCELLED: "#FC8181" }[m.status] || "#4A5568";
                const statusBorder = { UPCOMING: "#1E2533", LIVE: "rgba(245,166,35,.4)", COMPLETED: "rgba(134,239,172,.2)", CANCELLED: "rgba(252,129,129,.2)" }[m.status] || "#1E2533";
                return (
                  <div key={m.id} style={{ background: "#111318", border: `1px solid ${statusBorder}`, padding: "16px", marginBottom: 10, position: "relative" }}>
                    {m.status === "LIVE" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#F5A623,transparent)" }} />}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: "#4A5568", letterSpacing: 2 }}>{m.phase}</div>
                        {m.matchType && (
                            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#A78BFA", border: "1px solid rgba(167,139,250,.3)", padding: "1px 6px" }}>
                              {m.matchType === "room" ? "🏠 ROOM"
                                : m.matchType.startsWith("wow-") ? `🌟 WOW · ${m.matchType.replace("wow-", "").toUpperCase()}`
                                : m.matchType.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="heading" style={{ fontSize: 16, color: "#E2E8F0" }}>{m.date} · {m.time}</div>
                        <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>Map: {m.map}</div>
                        {m.matchType === "room" && (m.rounds || m.playersPerTeam) && (
                          <div style={{ marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
                            {m.rounds && <div style={{ fontSize: 12 }}><span style={{ color: "#4A5568" }}>Rounds: </span><span style={{ color: "#E2E8F0", fontWeight: 600 }}>{m.rounds}</span></div>}
                            {m.playersPerTeam && <div style={{ fontSize: 12 }}><span style={{ color: "#4A5568" }}>Players/Team: </span><span style={{ color: "#E2E8F0", fontWeight: 600 }}>{m.playersPerTeam}</span></div>}
                          </div>
                        )}
                        {(m.roomId || m.roomPass) && (
                          <div style={{ marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
                            {m.roomId && <div style={{ fontSize: 12 }}><span style={{ color: "#4A5568" }}>Room ID: </span><span style={{ color: "#F5A623", fontWeight: 600 }}>{m.roomId}</span></div>}
                            {m.roomPass && <div style={{ fontSize: 12 }}><span style={{ color: "#4A5568" }}>Password: </span><span style={{ color: "#F5A623", fontWeight: 600 }}>{m.roomPass}</span></div>}
                          </div>
                        )}
                        {/* Score display */}
                        {m.scores && (() => {
                          try {
                            const rows = JSON.parse(m.scores);
                            return (
                              <div style={{ marginTop: 10, borderTop: "1px solid #1E2533", paddingTop: 10 }}>
                                {rows.map((row, ri) => (
                                  <div key={ri} style={{ marginBottom: ri < rows.length - 1 ? 8 : 0 }}>
                                    {row.round && <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: "#4A5568", letterSpacing: 2, marginBottom: 4 }}>ROUND {row.round}</div>}
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontSize: 13, color: "#E2E8F0", flex: 1, fontWeight: 600 }}>{row.team1.name}</span>
                                      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 800, color: row.team1.score > row.team2.score ? "#F5A623" : "#E2E8F0", minWidth: 24, textAlign: "center" }}>{row.team1.score || 0}</span>
                                      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: "#4A5568" }}>:</span>
                                      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 800, color: row.team2.score > row.team1.score ? "#F5A623" : "#E2E8F0", minWidth: 24, textAlign: "center" }}>{row.team2.score || 0}</span>
                                      <span style={{ fontSize: 13, color: "#E2E8F0", flex: 1, textAlign: "right", fontWeight: 600 }}>{row.team2.name}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          } catch { return null; }
                        })()}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: statusColor, border: `1px solid ${statusBorder}`, padding: "4px 10px" }}>{m.status}</span>
                        <>
                          <button onClick={() => schedAction("score", m)} style={{ background: "none", border: "1px solid rgba(245,166,35,.3)", color: "#F5A623", padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "'Barlow Condensed'", letterSpacing: 1 }}>🏆 SCORE</button>
                          <button onClick={() => schedAction("edit", m)} style={{ background: "none", border: "1px solid #1E2533", color: "#A0AEC0", padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "'Barlow Condensed'", letterSpacing: 1 }}>✏ EDIT</button>
                          <button onClick={() => schedAction("delete", m)} style={{ background: "none", border: "1px solid rgba(252,129,129,.3)", color: "#FC8181", padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "'Barlow Condensed'", letterSpacing: 1 }}>🗑</button>
                        </>
                      </div>
                    </div>
                  </div>
                );
              })
            )}


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
        <GenTeamsModal
          players={players}
          preview={preview}
          teamsReady={teamsReady}
          isAdmin={isAdmin}
          onConfirm={() => { genTeams(); setIsAdmin(true); }}
          onClose={() => setShowGen(false)}
        />
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

      {/* Schedule modals - rendered at root level for proper overlay */}
      {editingMatch && (
        <ScheduleEditModal
          match={editingMatch === "new" ? null : editingMatch}
          saving={schedSaving}
          error={schedError}
          onSave={async (form) => {
            setSchedSaving(true); setSchedError("");
            try {
              if (editingMatch === "new") {
                const created = await apiAddSchedule(form);
                setSchedule(s => [...s, created]);
              } else {
                const updated = await apiUpdateSchedule(editingMatch.id, form);
                setSchedule(s => s.map(x => x.id === updated.id ? updated : x));
              }
              setEditingMatch(null);
            } catch (e) { setSchedError(e.message); }
            setSchedSaving(false);
          }}
          onClose={() => setEditingMatch(null)}
        />
      )}

      {schedAdminPending && (
        <ScheduleAdminGate
          onSuccess={() => {
            setIsAdmin(true);
            const { action, match } = schedAdminPending;
            setSchedAdminPending(null);
            if (action === "add") { setEditingMatch("new"); setSchedError(""); }
            else if (action === "edit") { setEditingMatch(match); setSchedError(""); }
            else if (action === "delete") { handleSchedDelete(match); }
            else if (action === "score") { setScoreMatch(match); }
          }}
          onClose={() => setSchedAdminPending(null)}
        />
      )}

      {scoreMatch && (
        <ScoreModal
          match={scoreMatch}
          isAdmin={isAdmin}
          onSave={async (scores) => {
            const updated = await apiUpdateSchedule(scoreMatch.id, { ...scoreMatch, scores });
            setSchedule(s => s.map(x => x.id === updated.id ? updated : x));
            setScoreMatch(null);
          }}
          onClose={() => setScoreMatch(null)}
        />
      )}

      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSave={updated => setPlayers(prev => prev.map(p => p.id === updated.id ? updated : p))}
          onDelete={id => setPlayers(prev => prev.filter(p => p.id !== id))}
        />
      )}
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
