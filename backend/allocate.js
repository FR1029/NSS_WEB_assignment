const pool = require("./config/db");

async function runAllocation() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute("DELETE FROM allocations");
    const [categories] = await connection.execute("SELECT * FROM categories");
    const capacity = {};
    categories.forEach(c => {
      capacity[c.id] = c.capacity;
    });
    const [preferences] = await connection.execute(`SELECT p.user_id, p.category_id, p.preference_rank FROM preferences p`);
    const getLoss = (rank) => {
      if (rank === 0) return 0;
      if (rank === 1) return 1;
      if (rank === 2) return 3;
      if (rank === 3) return 6;
      return 10;
    };
    preferences.sort((a, b) => getLoss(a.preference_rank) - getLoss(b.preference_rank));
    const assignedUsers = new Set();
    let totalLoss = 0;
    // The Greedy Allocation Loop
    for (const pref of preferences) {
      if (!assignedUsers.has(pref.user_id) && capacity[pref.category_id] > 0) {
        await connection.execute(
          "INSERT INTO allocations (user_id, category_id) VALUES (?, ?)",
          [pref.user_id, pref.category_id]
        );
        assignedUsers.add(pref.user_id);
        capacity[pref.category_id]--;
        totalLoss += getLoss(pref.preference_rank);
      }
    }
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    console.error("Error during allocation:", err.message);
  }
}

runAllocation();