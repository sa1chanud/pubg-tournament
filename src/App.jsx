import { useState, useEffect } from "react";

const REGISTRATION_DEADLINE = new Date("2026-03-15T23:59:59");

// ── Backend API on Render — update this with your Render URL ──
const API = "https://pubg-tournament-api.onrender.com";

// ── Change this to your own secret admin password ──
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
    squads.push({ id: squads.length + 1, name: TEAM_CODENAMES[nameIdx++ % TEAM_CODENAMES.length], players: shuffled.slice(idx, idx + 4), kills: 0, points: 0 });
    idx += 4;
  }
  for (let i = 0; i < best.threes; i++) {
    squads.push({ id: squads.length + 1, name: TEAM_CODENAMES[nameIdx++ % TEAM_CODENAMES.length], players: shuffled.slice(idx, idx + 3), kills: 0, points: 0 });
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

// ─────────────────────────────────────────────
// 💾 API HELPERS — talks to local server.js
// Data is saved to players.json on your PC
// ─────────────────────────────────────────────
async function apiLoadPlayers() {
  const res = await fetch(`${API}/players`);
  if (!res.ok) throw new Error("Failed to load players");
  return res.json();
}

async function apiAddPlayer(player) {
  const res = await fetch(`${API}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(player),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save player");
  return data;
}

async function apiClearPlayers() {
  const res = await fetch(`${API}/players`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear players");
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0f14}::-webkit-scrollbar-thumb{background:#C8A84B}
  body{background:#060A0F}

  @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes scanline{0%{top:-10%}100%{top:110%}}
  @keyframes slideIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes countPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
  @keyframes spin{to{transform:rotate(360deg)}}

  .fade-up{animation:fadeUp .7s ease both}
  .fade-up-1{animation:fadeUp .7s .1s ease both}
  .fade-up-2{animation:fadeUp .7s .2s ease both}
  .fade-up-3{animation:fadeUp .7s .35s ease both}
  .fade-up-4{animation:fadeUp .7s .5s ease both}
  .fade-up-5{animation:fadeUp .7s .65s ease both}
  .pulse{animation:pulse 2s infinite}
  .float{animation:float 3s ease-in-out infinite}
  .slide-in{animation:slideIn .35s ease}

  .join-btn{background:linear-gradient(135deg,#C8A84B,#a8883b);border:none;color:#060A0F;font-family:'Orbitron',monospace;font-size:13px;letter-spacing:3px;padding:16px 48px;cursor:pointer;font-weight:900;clip-path:polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%);transition:all .3s}
  .join-btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(200,168,75,.5)}
  .join-btn:disabled{background:#2a3a4a;color:#4a5a6a;cursor:not-allowed;clip-path:none;transform:none;box-shadow:none}

  .skip-btn{background:transparent;border:1px solid #2a3a4a;color:#5a7080;font-family:'Orbitron',monospace;font-size:10px;letter-spacing:2px;padding:10px 24px;cursor:pointer;transition:all .3s}
  .skip-btn:hover{border-color:#C8A84B55;color:#7a9ab0}

  .reg-btn{background:linear-gradient(135deg,#C8A84B,#a8883b);border:none;color:#060A0F;font-family:'Orbitron',monospace;font-size:11px;letter-spacing:2px;padding:13px 24px;cursor:pointer;font-weight:700;transition:all .3s}
  .reg-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 25px rgba(200,168,75,.4)}
  .reg-btn:disabled{background:#2a3a4a;color:#4a5a6a;cursor:not-allowed}

  .outline-btn{background:transparent;border:1px solid #C8A84B;color:#C8A84B;font-family:'Orbitron',monospace;font-size:10px;letter-spacing:2px;padding:9px 18px;cursor:pointer;transition:all .3s}
  .outline-btn:hover{background:#C8A84B22}

  .danger-btn{background:transparent;border:1px solid #f87171;color:#f87171;font-family:'Orbitron',monospace;font-size:10px;letter-spacing:2px;padding:9px 18px;cursor:pointer;transition:all .3s}
  .danger-btn:hover{background:#f8717122}

  .close-btn{background:none;border:1px solid #2a3a4a;color:#7a9ab0;cursor:pointer;padding:6px 12px;font-family:'Orbitron',monospace;font-size:10px;transition:all .3s}
  .close-btn:hover{border-color:#C8A84B;color:#C8A84B}

  .tab-btn{background:none;border:none;cursor:pointer;font-family:'Orbitron',monospace;font-size:11px;letter-spacing:3px;padding:12px 18px;color:#5a6470;transition:all .3s;text-transform:uppercase;position:relative;white-space:nowrap}
  .tab-btn.active{color:#C8A84B}.tab-btn.active::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:#C8A84B}
  .tab-btn:hover{color:#E8DCC8}

  .input-field{background:#0d1520;border:1px solid #1e2d3d;color:#E8DCC8;font-family:'Rajdhani',sans-serif;font-size:15px;padding:12px 14px;width:100%;outline:none;transition:border-color .3s}
  .input-field:focus{border-color:#C8A84B}
  .input-label{font-size:10px;color:#4a6070;font-family:'Orbitron',monospace;letter-spacing:2px;margin-bottom:7px;display:block}

  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(4px)}
  .modal{background:#0d1520;border:1px solid #C8A84B55;padding:30px;width:460px;max-width:95vw;position:relative;max-height:90vh;overflow-y:auto}
  .modal::before{content:'';position:absolute;top:-1px;left:20px;right:20px;height:2px;background:linear-gradient(90deg,transparent,#C8A84B,transparent)}

  .confirm-modal{background:#0d1520;border:1px solid #f87171;padding:28px;width:380px;max-width:95vw}

  .team-card{background:linear-gradient(135deg,#0d1520,#111d2b);border:1px solid #1e2d3d;padding:20px;transition:border-color .3s}
  .team-card:hover{border-color:#C8A84B55}

  .badge-4{background:#0d2a10;border:1px solid #166534;color:#86efac;font-size:10px;padding:3px 9px;font-family:'Orbitron',monospace;letter-spacing:1px}
  .badge-3{background:#1a2540;border:1px solid #1e3a8a;color:#93c5fd;font-size:10px;padding:3px 9px;font-family:'Orbitron',monospace;letter-spacing:1px}

  .notice-bar{background:linear-gradient(90deg,#0d1a10,#0d1520);border:1px solid #C8A84B22;padding:14px 18px;margin-bottom:22px;display:flex;align-items:center;gap:12px}
  .error-text{color:#f87171;font-size:11px;margin-top:5px;font-family:'Orbitron',monospace}
  .empty-state{text-align:center;padding:70px 20px;color:#3a4a5a}
  .live-dot{width:8px;height:8px;border-radius:50%;background:#ff3333;display:inline-block;margin-right:6px}
  .hex-tag{clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%);background:#C8A84B22;border:1px solid #C8A84B44;padding:2px 10px;font-size:10px;color:#C8A84B;font-family:'Orbitron',monospace;letter-spacing:1px}

  .counter-box{background:linear-gradient(135deg,#0d1520,#111d2b);border:1px solid #1e2d3d;padding:20px 24px;text-align:center;min-width:90px}
  .counter-num{font-family:'Orbitron',monospace;font-size:36px;font-weight:900;color:#C8A84B;line-height:1;animation:countPulse 1s ease infinite}
  .counter-label{font-family:'Orbitron',monospace;font-size:9px;color:#4a6070;letter-spacing:3px;margin-top:6px}

  .feature-card{background:linear-gradient(135deg,#0d1520,#0a1018);border:1px solid #1e2d3d;padding:24px;transition:border-color .3s,transform .3s}
  .feature-card:hover{border-color:#C8A84B33;transform:translateY(-4px)}

  .shimmer-text{background:linear-gradient(90deg,#C8A84B,#ffd700,#C8A84B);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}
  .scanline{position:absolute;width:100%;height:2px;background:linear-gradient(90deg,transparent,rgba(200,168,75,.15),transparent);animation:scanline 4s linear infinite;pointer-events:none}

  .db-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid #1a3a1a;background:#0a1a0a;font-family:'Orbitron',monospace;font-size:9px;letter-spacing:2px;color:#4ade80}
  .db-badge.error{border-color:#3a1a1a;background:#1a0a0a;color:#f87171}
  .db-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:pulse 2s infinite}
  .db-dot.error{background:#f87171}
  .spinner{width:14px;height:14px;border:2px solid #1e2d3d;border-top-color:#C8A84B;border-radius:50%;animation:spin .7s linear infinite}
`;

// ─────────────────────────────────────────────
// FIELD — outside RegModal to prevent focus loss
// ─────────────────────────────────────────────
function Field({ form, setForm, setError, label, field, placeholder, type = "text", optional = false }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="input-label">
        {label}{optional && <span style={{ color: "#3a4a5a", marginLeft: 6 }}>(OPTIONAL)</span>}
      </label>
      <input
        className="input-field"
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
  const [timeUnits, setTimeUnits] = useState({ d: "00", h: "00", m: "00", s: "00" });

  useEffect(() => {
    const tick = () => {
      const diff = deadline - new Date();
      if (diff <= 0) { setTimeUnits({ d: "00", h: "00", m: "00", s: "00" }); return; }
      setTimeUnits({
        d: String(Math.floor(diff / 86400000)).padStart(2, "0"),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#060A0F", fontFamily: "'Rajdhani',sans-serif", color: "#E8DCC8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(#1e2d3d22 1px,transparent 1px),linear-gradient(90deg,#1e2d3d22 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
      <div className="scanline" />
      <div style={{ position: "fixed", top: "20%", left: "10%", width: 300, height: 300, background: "radial-gradient(circle,rgba(200,168,75,.08) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "20%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle,rgba(200,168,75,.05) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 780, width: "100%", position: "relative", zIndex: 1 }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 12 }}>
          <div className="float" style={{ display: "inline-flex", width: 70, height: 70, background: "linear-gradient(135deg,#C8A84B,#8a6830)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎯</div>
        </div>
        <div className="fade-up-1" style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(28px,6vw,52px)", fontWeight: 900, letterSpacing: 6, lineHeight: 1 }} className="shimmer-text">BATTLEGROUND</div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(10px,2vw,13px)", color: "#5a7080", letterSpacing: 8, marginTop: 8 }}>PUBG TOURNAMENT 2026</div>
        </div>
        <div className="fade-up-2" style={{ display: "flex", alignItems: "center", gap: 16, margin: "28px 0" }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#C8A84B44)" }} />
          <div style={{ width: 8, height: 8, background: "#C8A84B", transform: "rotate(45deg)" }} />
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#C8A84B44,transparent)" }} />
        </div>

        <div className="fade-up-2" style={{ textAlign: "center", marginBottom: 32 }}>
          {regOpen ? (
            <>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#5a7080", letterSpacing: 4, marginBottom: 16 }}>REGISTRATION CLOSES IN</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                {[["DAYS", timeUnits.d], ["HOURS", timeUnits.h], ["MINS", timeUnits.m], ["SECS", timeUnits.s]].map(([label, val]) => (
                  <div key={label} className="counter-box">
                    <div className="counter-num">{val}</div>
                    <div className="counter-label">{label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, color: "#f87171", letterSpacing: 4, padding: "16px 32px", border: "1px solid #f8717144", display: "inline-block" }}>
              ⛔ REGISTRATION CLOSED
            </div>
          )}
        </div>

        <div className="fade-up-3" style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 17, color: "#9ab0c0", lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
            The ultimate PUBG squad showdown. Register individually — we'll randomly build your team. Squads of <strong style={{ color: "#C8A84B" }}>4 players</strong>, adjusted to <strong style={{ color: "#C8A84B" }}>3</strong> where needed.
          </div>
        </div>

        <div className="fade-up-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 40 }}>
          {[
            { icon: "🎮", title: "SOLO SIGN-UP", desc: "Register alone, get assigned to a squad" },
            { icon: "🎲", title: "AUTO TEAMS", desc: "Random fair draw after deadline closes" },
            { icon: "🏆", title: "LIVE SCORES", desc: "Track kills, points and standings live" },
            { icon: "💾", title: "LOCAL FILE DB", desc: "Saved to players.json on your PC forever" },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#C8A84B", letterSpacing: 2, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#5a7080", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {players.length > 0 && (
          <div className="fade-up-4" style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#0d1520", border: "1px solid #C8A84B22", padding: "10px 24px" }}>
              <span className="live-dot pulse" />
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: "#C8A84B" }}>{players.length} PLAYERS REGISTERED</span>
            </div>
          </div>
        )}

        <div className="fade-up-5" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {regOpen ? (
            <>
              <button className="join-btn" onClick={onRegister}>⚡ REGISTER TO PLAY</button>
              <button className="skip-btn" onClick={onEnter}>View Tournament Dashboard →</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, color: "#5a7080", fontFamily: "'Orbitron',monospace", letterSpacing: 2 }}>Registration is now closed.</div>
              <button className="join-btn" style={{ fontSize: 12, padding: "14px 36px" }} onClick={onEnter}>VIEW TOURNAMENT →</button>
            </>
          )}
        </div>

        <div className="fade-up-5" style={{ textAlign: "center", marginTop: 40, fontSize: 11, color: "#3a4a5a", fontFamily: "'Orbitron',monospace", letterSpacing: 2 }}>
          BATTLEGROUND PUBG TOURNAMENT · 2026 · ALL RIGHTS RESERVED
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
    if (!form.email.trim() || !form.email.includes("@")) { setError("A valid email is required."); return; }

    setSaving(true);
    try {
      const newPlayer = await apiAddPlayer({
        username: form.username.trim(),
        pubgId: form.pubgId.trim() || form.username.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        experience: form.experience,
      });
      onSuccess(newPlayer);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to register. Is the server running?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal slide-in">
        {success ? (
          <div style={{ textAlign: "center", padding: "44px 0" }}>
            <div style={{ fontSize: 56 }}>🎯</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, color: "#4ade80", marginTop: 18, letterSpacing: 3 }}>YOU'RE REGISTERED!</div>
            <div style={{ fontSize: 13, color: "#7a9ab0", marginTop: 8, lineHeight: 1.7 }}>
              Welcome, <strong style={{ color: "#C8A84B" }}>{form.username}</strong>!<br />
              Your squad will be randomly assigned after the deadline.<br />
              <span style={{ fontSize: 11, color: "#4ade8066" }}>✓ Saved to players.json on your PC</span>
            </div>
            <button className="reg-btn" style={{ marginTop: 24 }} onClick={onClose}>CLOSE</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 900, letterSpacing: 3, color: "#C8A84B" }}>PLAYER REGISTRATION</div>
                <div style={{ fontSize: 11, color: "#4a6070", marginTop: 4 }}>Fill in your details to join the tournament</div>
              </div>
              <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div style={{ background: "#0a1018", border: "1px solid #1e2d3d", padding: "12px 16px", marginBottom: 22, display: "flex", gap: 10 }}>
              <div style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</div>
              <div style={{ fontSize: 12, color: "#7a9ab0", lineHeight: 1.7 }}>
                Registering as a <strong style={{ color: "#C8A84B" }}>solo player</strong>. Teams randomly assigned after <strong style={{ color: "#C8A84B" }}>March 15, 2026</strong>. Data saved permanently to <strong style={{ color: "#C8A84B" }}>players.json</strong> on your PC.
              </div>
            </div>

            <Field form={form} setForm={setForm} setError={setError} label="PUBG IN-GAME USERNAME *" field="username" placeholder="Your exact PUBG username" />
            <Field form={form} setForm={setForm} setError={setError} label="PUBG ID" field="pubgId" placeholder="e.g. ArclightX#1234" optional />
            <Field form={form} setForm={setForm} setError={setError} label="FULL NAME *" field="fullName" placeholder="Your real full name" />
            <Field form={form} setForm={setForm} setError={setError} label="EMAIL ADDRESS *" field="email" placeholder="you@example.com" type="email" />
            <Field form={form} setForm={setForm} setError={setError} label="PHONE NUMBER" field="phone" placeholder="+91 XXXXX XXXXX" optional />

            <div style={{ marginBottom: 22 }}>
              <label className="input-label">EXPERIENCE LEVEL</label>
              <select className="input-field" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                style={{ background: "#0d1520", appearance: "none", cursor: "pointer" }}>
                <option value="beginner">🟢 Beginner — Just started PUBG</option>
                <option value="intermediate">🟡 Intermediate — Regular player</option>
                <option value="advanced">🟠 Advanced — Competitive player</option>
                <option value="pro">🔴 Pro — Tournament experience</option>
              </select>
            </div>

            {error && <div className="error-text" style={{ marginBottom: 14 }}>⚠ {error}</div>}

            <div style={{ fontSize: 11, color: "#3a4a5a", marginBottom: 16, lineHeight: 1.7 }}>
              By registering you agree to participate fairly and follow all tournament rules. {players.length} player{players.length !== 1 ? "s" : ""} already registered.
            </div>

            <button className="reg-btn" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
              onClick={submit}
              disabled={saving || !form.username.trim() || !form.fullName.trim() || !form.email.trim()}>
              {saving ? <><div className="spinner" /> SAVING...</> : "CONFIRM REGISTRATION"}
            </button>
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
  const [activeTab, setActiveTab] = useState("players");
  const [teams, setTeams] = useState([]);
  const [teamsGenerated, setTeamsGenerated] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showConfirmGen, setShowConfirmGen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const preview = getPreview(players.length);

  const liveMatches = [
    { id: 1, map: "Erangel", phase: "Zone 5", alive: 12, time: "32:14", status: "LIVE" },
    { id: 2, map: "Miramar", phase: "Ended", alive: 0, time: "45:22", status: "ENDED" },
  ];

  const tabs = [
    { key: "players", label: "PLAYERS", count: players.length },
    { key: "teams", label: "TEAMS", count: teamsGenerated ? teams.length : null },
    { key: "leaderboard", label: "LEADERBOARD" },
    { key: "live", label: "LIVE" },
  ];

  const handleGenerateTeams = () => {
    setTeams(smartBuildTeams(players.map(p => p.username)));
    setTeamsGenerated(true);
    setShowConfirmGen(false);
    setActiveTab("teams");
  };

  const handleClearAll = async () => {
    await apiClearPlayers();
    setPlayers([]);
    setTeams([]);
    setTeamsGenerated(false);
    setShowClearConfirm(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060A0F", fontFamily: "'Rajdhani',sans-serif", color: "#E8DCC8" }}>
      <div style={{ background: "linear-gradient(180deg,#0a1520,#060A0F)", borderBottom: "1px solid #1e2d3d", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#C8A84B,#8a6830)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🎯</div>
              <div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, color: "#C8A84B", letterSpacing: 4 }}>BATTLEGROUND</div>
                <div style={{ fontSize: 9, color: "#5a7080", letterSpacing: 3, fontFamily: "'Orbitron',monospace" }}>PUBG TOURNAMENT 2026</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div className={`db-badge ${serverOnline ? "" : "error"}`}>
                <div className={`db-dot ${serverOnline ? "" : "error"}`} />
                {serverOnline ? "💾 players.json" : "⚠ SERVER OFFLINE"}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "#5a7080", fontFamily: "'Orbitron',monospace", letterSpacing: 2 }}>{regOpen ? "REG CLOSES IN" : "REGISTRATION"}</div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: regOpen ? "#C8A84B" : "#f87171", fontWeight: 700 }} className={regOpen ? "pulse" : ""}>{timeLeft}</div>
              </div>
              {players.length >= 3 && <button className="outline-btn" onClick={() => setShowConfirmGen(true)}>⚡ PICK TEAMS</button>}
              <button className="reg-btn" disabled={!regOpen || !serverOnline} onClick={() => setShowRegModal(true)} style={{ fontSize: 10, padding: "9px 18px" }}>
                {regOpen ? "+ REGISTER" : "CLOSED"}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", borderTop: "1px solid #1e2d3d", overflowX: "auto" }}>
            {tabs.map(t => (
              <button key={t.key} className={`tab-btn ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
                {t.count != null && <span style={{ marginLeft: 6, fontSize: 9, color: "#C8A84B" }}>{t.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Server offline warning */}
      {!serverOnline && (
        <div style={{ background: "#1a0a0a", borderBottom: "1px solid #f8717133", padding: "10px 20px", textAlign: "center" }}>
          <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#f87171", letterSpacing: 2 }}>
            ⚠ SERVER OFFLINE — Run <strong>node server.js</strong> in your terminal to enable saving
          </span>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

        {activeTab === "players" && (
          <div className="slide-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, letterSpacing: 4, color: "#C8A84B" }}>REGISTERED PLAYERS</div>
                <div style={{ fontSize: 12, color: "#5a7080", marginTop: 4 }}>Saved permanently to players.json on your PC</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {isAdmin ? (
                  players.length > 0 && (
                    <button className="danger-btn" style={{ fontSize: 9, padding: "6px 14px" }} onClick={() => setShowClearConfirm(true)}>🗑 CLEAR ALL</button>
                  )
                ) : (
                  <button className="close-btn" style={{ fontSize: 9, padding: "6px 14px" }} onClick={() => setShowAdminLogin(true)}>🔐 ADMIN</button>
                )}
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 32, fontWeight: 900, color: "#C8A84B" }}>{players.length}</div>
              </div>
            </div>

            <div className="notice-bar">
              <div style={{ fontSize: 22 }}>📋</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {preview
                    ? `${players.length} players → ${preview.fours > 0 ? `${preview.fours} squad${preview.fours > 1 ? "s" : ""} of 4` : ""}${preview.fours > 0 && preview.threes > 0 ? " + " : ""}${preview.threes > 0 ? `${preview.threes} squad${preview.threes > 1 ? "s" : ""} of 3` : ""}`
                    : `${players.length} player${players.length !== 1 ? "s" : ""} — need at least 3 to form a team`}
                </div>
                <div style={{ fontSize: 11, color: "#7a9ab0", marginTop: 3 }}>Teams auto-picked after March 15, 2026 deadline.</div>
              </div>
              {players.length >= 3 && <button className="outline-btn" style={{ fontSize: 10, whiteSpace: "nowrap" }} onClick={() => setShowConfirmGen(true)}>PREVIEW TEAMS</button>}
            </div>

            <div style={{ background: "linear-gradient(135deg,#0d1520,#111d2b)", border: "1px solid #1e2d3d" }}>
              <div style={{ display: "grid", gridTemplateColumns: "46px 1fr 120px 100px 90px", padding: "10px 18px", borderBottom: "1px solid #1e2d3d", fontSize: 10, color: "#4a6070", fontFamily: "'Orbitron',monospace", letterSpacing: 2 }}>
                <span>#</span><span>PLAYER</span><span>EMAIL</span><span>EXPERIENCE</span><span>DATE</span>
              </div>
              {players.map((p, i) => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "46px 1fr 120px 100px 90px", alignItems: "center", padding: "11px 18px", borderBottom: "1px solid #0d1520", transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0d1a25"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#4a6070" }}>#{i + 1}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: `hsl(${(p.username.charCodeAt(0) * 37) % 360},35%,22%)`, border: `1px solid hsl(${(p.username.charCodeAt(0) * 37) % 360},35%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#C8A84B", flexShrink: 0 }}>
                      {p.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.username}</div>
                      {p.fullName && <div style={{ fontSize: 11, color: "#4a6070" }}>{p.fullName}</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#5a7080", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>
                  <div>
                    <span style={{ padding: "2px 8px", borderRadius: 2, fontSize: 10, fontFamily: "'Orbitron',monospace", background: { beginner: "#0d2a10", intermediate: "#2a2010", advanced: "#2a1a0d", pro: "#2a0d0d" }[p.experience], color: { beginner: "#86efac", intermediate: "#fcd34d", advanced: "#fb923c", pro: "#f87171" }[p.experience] }}>
                      {p.experience?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "#4a6070", fontFamily: "'Orbitron',monospace" }}>{p.registeredAt}</div>
                </div>
              ))}
              {players.length === 0 && (
                <div className="empty-state">
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🪂</div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, letterSpacing: 3 }}>NO PLAYERS YET</div>
                  <div style={{ fontSize: 13, marginTop: 8 }}>Be the first to register!</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "teams" && (
          <div className="slide-in">
            {!teamsGenerated ? (
              <div className="empty-state">
                <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, letterSpacing: 3, color: "#C8A84B" }}>TEAMS NOT YET ASSIGNED</div>
                <div style={{ fontSize: 13, color: "#5a7080", marginTop: 10, maxWidth: 380, margin: "10px auto 0", lineHeight: 1.7 }}>
                  All {players.length} players will be randomly shuffled into squads after registration closes.
                </div>
                {players.length >= 3
                  ? <button className="outline-btn" style={{ marginTop: 28 }} onClick={() => setShowConfirmGen(true)}>⚡ GENERATE TEAMS NOW</button>
                  : <div style={{ marginTop: 20, color: "#f87171", fontSize: 11, fontFamily: "'Orbitron',monospace" }}>NEED AT LEAST 3 PLAYERS</div>}
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, letterSpacing: 4, color: "#C8A84B" }}>AUTO-PICKED TEAMS</div>
                    <div style={{ fontSize: 12, color: "#5a7080", marginTop: 4 }}>
                      {teams.length} squads · {teams.filter(t => t.players.length === 4).length > 0 && `${teams.filter(t => t.players.length === 4).length}×4`}
                      {teams.filter(t => t.players.length === 3).length > 0 && ` ${teams.filter(t => t.players.length === 3).length}×3`}
                    </div>
                  </div>
                  <button className="danger-btn" onClick={() => setTeams(smartBuildTeams(players.map(p => p.username)))}>🔀 RE-SHUFFLE</button>
                </div>
                <div className="notice-bar"><div>🎲</div><div style={{ fontSize: 12, color: "#7a9ab0" }}>Players randomly distributed. Squads of 3 fill remainders. Re-shuffle for a new draw.</div></div>
                <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
                  {teams.map(team => (
                    <div key={team.id} className="team-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#4a6070", fontFamily: "'Orbitron',monospace", letterSpacing: 2 }}>SQUAD {team.id.toString().padStart(3, "0")}</div>
                          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{team.name}</div>
                        </div>
                        <span className={team.players.length === 4 ? "badge-4" : "badge-3"}>{team.players.length} MAN</span>
                      </div>
                      <div style={{ borderTop: "1px solid #1e2d3d", paddingTop: 12 }}>
                        {team.players.map((p, j) => (
                          <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${(p.charCodeAt(0) * 37) % 360},35%,22%)`, border: `1px solid hsl(${(p.charCodeAt(0) * 37) % 360},35%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#C8A84B", flexShrink: 0 }}>{p[0].toUpperCase()}</div>
                            <span style={{ fontSize: 14, fontWeight: j === 0 ? 700 : 500, color: j === 0 ? "#C8A84B" : "#E8DCC8", flex: 1 }}>{p}</span>
                            {j === 0 && <span style={{ fontSize: 9, color: "#C8A84B66", fontFamily: "'Orbitron',monospace" }}>CPT</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="slide-in">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, letterSpacing: 4, color: "#C8A84B" }}>LEADERBOARD</div>
              <div className="hex-tag">LIVE</div>
            </div>
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 14 }}>🏆</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, letterSpacing: 2 }}>AWAITING TOURNAMENT START</div>
              <div style={{ fontSize: 13, color: "#5a7080", marginTop: 8 }}>Leaderboard populates once teams are assigned and matches begin.</div>
            </div>
          </div>
        )}

        {activeTab === "live" && (
          <div className="slide-in">
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, letterSpacing: 4, color: "#C8A84B", marginBottom: 20 }}>LIVE MATCHES</div>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", marginBottom: 32 }}>
              {liveMatches.map(match => (
                <div key={match.id} style={{ background: "linear-gradient(135deg,#0d1520,#111d2b)", border: `1px solid ${match.status === "LIVE" ? "#C8A84B55" : "#1e2d3d"}`, padding: 22, position: "relative", overflow: "hidden" }}>
                  {match.status === "LIVE" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#C8A84B,transparent)" }} />}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, letterSpacing: 2 }}>{match.map}</div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {match.status === "LIVE" && <span className="live-dot pulse" />}
                      <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, color: match.status === "LIVE" ? "#ff4444" : "#4a6070", letterSpacing: 2 }}>{match.status}</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center" }}>
                    {[["ALIVE", match.alive, match.status === "LIVE" ? "#C8A84B" : "#3a4a5a", 22], ["PHASE", match.phase, "#7a9ab0", 14], ["TIME", match.time, "#E8DCC8", 16]].map(([label, val, col, fs]) => (
                      <div key={label} style={{ background: "#060A0F", padding: 10 }}>
                        <div style={{ fontSize: fs, fontFamily: "'Orbitron',monospace", fontWeight: 700, color: col }}>{val}</div>
                        <div style={{ fontSize: 9, color: "#4a6070", marginTop: 4, letterSpacing: 1 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 24, background: "#0d1520", border: "1px solid #1e2d3d", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#4a6070", fontFamily: "'Orbitron',monospace", letterSpacing: 3 }}>NEXT MATCH</div>
              <div style={{ fontSize: 26, fontFamily: "'Orbitron',monospace", fontWeight: 900, color: "#C8A84B", marginTop: 8 }}>GRAND FINAL</div>
              <div style={{ fontSize: 13, color: "#7a9ab0", marginTop: 8 }}>Top 2 Squads — Erangel</div>
              <div style={{ marginTop: 14, display: "inline-block", padding: "8px 22px", border: "1px solid #C8A84B33", fontSize: 11, fontFamily: "'Orbitron',monospace", color: "#C8A84B", letterSpacing: 2 }}>MARCH 20, 2026 — 18:00 UTC</div>
            </div>
          </div>
        )}
      </div>

      {showRegModal && (
        <RegModal players={players} onClose={() => setShowRegModal(false)}
          onSuccess={(player) => setPlayers(prev => [...prev, player])} />
      )}

      {showConfirmGen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowConfirmGen(false)}>
          <div className="confirm-modal slide-in">
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 900, color: "#f87171", letterSpacing: 3, marginBottom: 14 }}>⚡ GENERATE TEAMS</div>
            <div style={{ fontSize: 13, color: "#7a9ab0", lineHeight: 1.8, marginBottom: 20 }}>
              Randomly assign all <strong style={{ color: "#E8DCC8" }}>{players.length} players</strong> into squads.<br />
              {preview && <span style={{ color: "#C8A84B" }}>Result: {preview.fours > 0 ? `${preview.fours} squad${preview.fours !== 1 ? "s" : ""} of 4` : ""}{preview.fours > 0 && preview.threes > 0 ? " + " : ""}{preview.threes > 0 ? `${preview.threes} squad${preview.threes !== 1 ? "s" : ""} of 3` : ""}</span>}
              {teamsGenerated && <><br /><span style={{ color: "#f87171", fontSize: 12 }}>This overwrites the current draw.</span></>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="reg-btn" style={{ flex: 1 }} onClick={handleGenerateTeams}>CONFIRM</button>
              <button className="close-btn" style={{ flex: 1 }} onClick={() => setShowConfirmGen(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowClearConfirm(false)}>
          <div className="confirm-modal slide-in">
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 900, color: "#f87171", letterSpacing: 3, marginBottom: 14 }}>🗑 CLEAR ALL PLAYERS</div>
            <div style={{ fontSize: 13, color: "#7a9ab0", lineHeight: 1.8, marginBottom: 20 }}>
              This will permanently delete all <strong style={{ color: "#E8DCC8" }}>{players.length} registered players</strong> from players.json.<br />
              <span style={{ color: "#f87171", fontSize: 12 }}>This action cannot be undone.</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="danger-btn" style={{ flex: 1, padding: "12px" }} onClick={handleClearAll}>DELETE ALL</button>
              <button className="close-btn" style={{ flex: 1 }} onClick={() => setShowClearConfirm(false)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onSuccess={() => setIsAdmin(true)}
        />
      )}
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
    if (password === ADMIN_PASSWORD) {
      onSuccess();
      onClose();
    } else {
      setError("Incorrect password.");
      setPassword("");
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="confirm-modal slide-in" style={{ border: "1px solid #C8A84B55" }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 900, color: "#C8A84B", letterSpacing: 3, marginBottom: 6 }}>🔐 ADMIN ACCESS</div>
        <div style={{ fontSize: 12, color: "#5a7080", marginBottom: 20 }}>Enter admin password to unlock controls.</div>
        <input
          className="input-field"
          type="password"
          placeholder="Enter admin password"
          value={password}
          autoFocus
          onChange={e => { setPassword(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && submit()}
        />
        {error && <div className="error-text" style={{ marginTop: 8 }}>⚠ {error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button className="reg-btn" style={{ flex: 1 }} onClick={submit}>UNLOCK</button>
          <button className="close-btn" style={{ flex: 1 }} onClick={onClose}>CANCEL</button>
        </div>
      </div>
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

  // 💾 Load players from server on startup
  useEffect(() => {
    apiLoadPlayers()
      .then(data => { setPlayers(data); setServerOnline(true); })
      .catch(() => { setServerOnline(false); })
      .finally(() => setDbLoaded(true));
  }, []);

  // Countdown timer
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
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  if (!dbLoaded) {
    return (
      <>
        <style>{STYLES}</style>
        <div style={{ minHeight: "100vh", background: "#060A0F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#C8A84B,#8a6830)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎯</div>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#4a6070", letterSpacing: 4 }}>LOADING DATABASE...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      {screen === "landing" ? (
        <>
          <LandingPage
            onEnter={() => setScreen("dashboard")}
            onRegister={() => setShowRegOnLanding(true)}
            players={players}
            regOpen={regOpen}
            deadline={REGISTRATION_DEADLINE}
          />
          {showRegOnLanding && (
            <RegModal
              players={players}
              onClose={() => setShowRegOnLanding(false)}
              onSuccess={(player) => { setPlayers(prev => [...prev, player]); setShowRegOnLanding(false); }}
            />
          )}
        </>
      ) : (
        <Dashboard players={players} setPlayers={setPlayers} regOpen={regOpen} timeLeft={timeLeft} serverOnline={serverOnline} />
      )}
    </>
  );
}