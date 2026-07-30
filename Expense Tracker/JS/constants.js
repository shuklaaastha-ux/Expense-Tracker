// Fixed category lists. Kept separate for income vs expense since they
// don't really overlap (you don't "categorize" salary as Food).
const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Allowance",
  "Gift",
  "Other",
];

// Used for the pie chart slices — picked manually instead of a random
// palette so colors stay consistent between renders/filters.
const CATEGORY_COLORS = {
  Food: "#B5533C",
  Transport: "#E8B33D",
  Shopping: "#7C5CBF",
  Bills: "#3B7A57",
  Entertainment: "#3B82B5",
  Health: "#C2478A",
  Education: "#5B6B62",
  Other: "#8A8A8A",
  Salary: "#3B7A57",
  Freelance: "#3B82B5",
  Allowance: "#E8B33D",
  Gift: "#C2478A",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}