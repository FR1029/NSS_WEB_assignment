const fs = require("fs")
const categories = JSON.parse(fs.readFileSync("data/categories.json", 'utf8'));
const preferences = JSON.parse(fs.readFileSync("data/preferences.json", 'utf8'));

function allocate() {
  const capacity = {};
  categories.forEach(c => {
    capacity[c.name] = c.capacity;
  });
  const getLoss = (rank) => {
    if (rank === 0) return 0;
    if (rank === 1) return 1;
    if (rank === 2) return 3;
    if (rank === 3) return 6;
    return 10;
  }
  preferences.sort((a, b) => getLoss(a.preference_rank) - getLoss(b.preference_rank));
  const assignedUsers = new Set();
  let allocations = [];
  let totalLoss = 0;
  for(const pref of preferences) {
    if(!assignedUsers.has(pref.user_id) && capacity[pref.category_name] > 0) {
      allocations.push({
        user_id: pref.user_id,
        category_name: pref.category_name
      });
      assignedUsers.add(pref.user_id);
      capacity[pref.category_name]--;
      totalLoss += getLoss(pref.preference_rank);
    }
  }
  const result = {
    allocations,
    totalLoss
  };
  fs.writeFileSync("result/allocations.json", JSON.stringify(result, null, 2));
}

module.exports = allocate;