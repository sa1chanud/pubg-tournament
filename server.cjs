const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3001;

const SUPABASE_URL = "https://foufqtzmxpnsezycjguz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdWZxdHpteHBuc2V6eWNqZ3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjQyNjksImV4cCI6MjA4NzU0MDI2OX0.oFCzT7fdxZU3NJAaTomO1UxYjNvLVWqsWpewBpVglbI";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors({ origin: "*" }));
app.use(express.json());

function format(data) {
  return {
    id: data.id,
    username: data.username,
    pubgId: data.pubg_id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    experience: data.experience,
    registeredAt: data.registered_at,
    createdAt: data.created_at,
  };
}

// GET /players
app.get("/players", async (req, res) => {
  const { data, error } = await supabase.from("players").select("*").order("created_at", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(format));
});

// POST /players
app.post("/players", async (req, res) => {
  const { username, pubgId, fullName, email, phone, experience } = req.body;
  const { data: existing } = await supabase.from("players").select("id").ilike("username", username).single();
  if (existing) return res.status(409).json({ error: "Username already registered" });
  const { data, error } = await supabase.from("players").insert([{ username, pubg_id: pubgId, full_name: fullName, email, phone, experience }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(format(data));
});

// PATCH /players/:id — edit a player
app.patch("/players/:id", async (req, res) => {
  const { id } = req.params;
  const { username, pubgId, fullName, email, phone, experience } = req.body;
  const { data, error } = await supabase
    .from("players")
    .update({ username, pubg_id: pubgId, full_name: fullName, email, phone, experience })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(format(data));
});

// DELETE /players/:id — delete one player
app.delete("/players/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Player deleted" });
});

// DELETE /players — clear all
app.delete("/players", async (req, res) => {
  const { error } = await supabase.from("players").delete().neq("id", 0);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "All players cleared" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🎯 BATTLEGROUND SERVER`);
  console.log(`   Port: ${PORT}`);
  console.log(`   DB: Supabase\n`);
});
