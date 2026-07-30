const STORAGE_KEY = "expense-tracker.transactions";

// Some browsers only expose crypto.randomUUID() on https/localhost, not on
// a page opened directly as a local file. This fallback keeps things working
// either way.
function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

// A few starter entries so the dashboard doesn't look empty on first load.
// Feel free to delete these from the UI once you've added your own.
const SEED_DATA = [
  { id: generateId(), type: "income", amount: 15000, category: "Salary", note: "Part-time internship stipend", date: "2026-07-01" },
  { id: generateId(), type: "expense", amount: 450, category: "Food", note: "Groceries", date: "2026-07-03" },
  { id: generateId(), type: "expense", amount: 1200, category: "Bills", note: "Mobile recharge + electricity", date: "2026-07-05" },
  { id: generateId(), type: "expense", amount: 250, category: "Transport", note: "Auto fare", date: "2026-07-08" },
  { id: generateId(), type: "expense", amount: 899, category: "Entertainment", note: "Movie + dinner", date: "2026-07-12" },
  { id: generateId(), type: "expense", amount: 600, category: "Education", note: "Course notes printout + book", date: "2026-06-20" },
  { id: generateId(), type: "income", amount: 3000, category: "Freelance", note: "Small landing page project", date: "2026-06-18" },
  { id: generateId(), type: "expense", amount: 320, category: "Food", note: "Canteen", date: "2026-06-22" },
];

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read saved transactions, starting fresh.", err);
  }
  return SEED_DATA;
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}