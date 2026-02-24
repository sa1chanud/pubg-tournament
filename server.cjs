const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, "players.json");

app.use(cors());
app.use(express.json());

// ── Helper: read players from file ──
function readPlayers() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// ── Helper: write players to file ──
function writePlayers(players) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
}

// ── GET /players — fetch all players ──
app.get("/players", (req, res) => {
  try {
    const players = readPlayers();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: "Failed to read players" });
  }
});

// ── POST /players — add a new player ──
app.post("/players", (req, res) => {
  try {
    const players = readPlayers();
    const newPlayer = {
      id: Date.now(),
      ...req.body,
      registeredAt: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    // Check for duplicate username
    const duplicate = players.find(
      (p) => p.username.toLowerCase() === newPlayer.username.toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({ error: "Username already registered" });
    }

    players.push(newPlayer);
    writePlayers(players);
    res.status(201).json(newPlayer);
  } catch (err) {
    res.status(500).json({ error: "Failed to save player" });
  }
});

// ── DELETE /players — clear all players ──
app.delete("/players", (req, res) => {
  try {
    writePlayers([]);
    res.json({ message: "All players cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear players" });
  }
});

app.listen(PORT, () => {
  console.log(`\n🎯 BATTLEGROUND SERVER RUNNING`);
  console.log(`   API:  http://localhost:${PORT}`);
  console.log(`   Data: ${DATA_FILE}\n`);
});
