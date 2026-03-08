const express = require("express");
const cors = require("cors");
const fs = require("fs");
const runAllocation = require("./allocate");
runAllocation()
const app = express();
app.use(cors());
app.use(express.json());

const DEADLINE = new Date("2026-03-08T22:08:00"); 

app.post("/submit", async (req, res) => {
  if (new Date() > DEADLINE) {
    return res.status(403).json({ message: "Submission closed. The deadline has passed." });
  }

  const { username, preferences } = req.body;
  try {
    const prefData = JSON.parse(fs.readFileSync("data/preferences.json", 'utf8'));
    const alreadySubmitted = prefData.some(p => p.username.toLowerCase() === username.toLowerCase());
    if(alreadySubmitted) {
      return res.status(400).json({ error: "User already submitted preferences!"});
    }
    let userId = 0;
    prefData.forEach(pref => {
      userId = Math.max(pref.user_id, userId);
    });
    userId++;
    preferences.forEach((name, i) => {
      prefData.push({
        user_id: userId,
        username: username,
        category_name: name,
        preference_rank: i
      });
    });
    fs.writeFileSync("data/preferences.json", JSON.stringify(prefData, null, 2));
    res.json({ message: "Preference submitted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5001, () => {
  console.log("Server running on http://localhost:5001");
});