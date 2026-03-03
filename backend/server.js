const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const runAllocation = require("./allocate");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/categories", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT name FROM categories");
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const DEADLINE = new Date("2026-03-03T21:55:00"); 

app.post("/submit", async (req, res) => {
  if (new Date() > DEADLINE) {
    return res.status(403).json({ message: "Submission closed. The deadline has passed." });
  }

  const { username, preferences } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [userResult] = await connection.execute("INSERT INTO users (username) VALUES (?)", [username]);

    const userId = userResult.insertId;

    for (let i = 0; i < preferences.length; i++) {
      const [cat] = await connection.execute("SELECT id FROM categories WHERE name = ?", [preferences[i]]);
      if (!cat.length) throw new Error("Invalid category");
      await connection.execute("INSERT INTO preferences (user_id, category_id, preference_rank) VALUES (?, ?, ?)", [userId, cat[0].id, i]);
    }
    await connection.commit();
    res.json({ message: "Saved successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

const now = Date.now();
const timeUntilDeadline = DEADLINE - now;
if (timeUntilDeadline > 0) {
  setTimeout(async () => {
    await runAllocation();
  }, timeUntilDeadline);
}

app.get("/results", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT u.username, c.name as category
      FROM allocations a
      JOIN users u ON a.user_id = u.id
      JOIN categories c ON a.category_id = c.id
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

app.listen(5001, () => {
  console.log("Server running on http://localhost:5001");
});