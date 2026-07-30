// ---- App state ----
let transactions = loadTransactions();
let currentType = "expense";
let filters = { type: "all", category: "all", from: "", to: "" };

// ---- Element refs ----
const typeToggle = document.getElementById("typeToggle");
const categoryInput = document.getElementById("categoryInput");
const dateInput = document.getElementById("dateInput");
const amountInput = document.getElementById("amountInput");
const noteInput = document.getElementById("noteInput");
const form = document.getElementById("transactionForm");
const formError = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");

const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const filterFrom = document.getElementById("filterFrom");
const filterTo = document.getElementById("filterTo");

// ---- Init ----
function init() {
  dateInput.value = todayISO();
  populateCategoryDropdown();
  populateFilterCategoryDropdown();
  renderAll();

  typeToggle.addEventListener("click", handleTypeToggle);
  form.addEventListener("submit", handleAddTransaction);
  document.getElementById("clearAllBtn").addEventListener("click", handleClearAll);
  document.getElementById("resetFiltersBtn").addEventListener("click", resetFilters);

  [filterType, filterCategory, filterFrom, filterTo].forEach((el) =>
    el.addEventListener("change", handleFilterChange)
  );
}

// ---- Category dropdowns ----
function populateCategoryDropdown() {
  const cats = currentType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  categoryInput.innerHTML = cats.map((c) => `<option value="${c}">${c}</option>`).join("");
}

function populateFilterCategoryDropdown() {
  const allCats = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
  filterCategory.innerHTML =
    `<option value="all">All</option>` +
    allCats.map((c) => `<option value="${c}">${c}</option>`).join("");
}

// ---- Type toggle (income/expense) ----
function handleTypeToggle(e) {
  const btn = e.target.closest(".type-btn");
  if (!btn) return;

  currentType = btn.dataset.type;
  document.querySelectorAll(".type-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  populateCategoryDropdown();
  submitBtn.textContent = `Add ${currentType}`;
}

// ---- Add transaction ----
function handleAddTransaction(e) {
  e.preventDefault();

  const amount = parseFloat(amountInput.value);
  if (!amountInput.value || isNaN(amount) || amount <= 0) {
    formError.textContent = "Enter an amount greater than 0.";
    return;
  }
  if (!dateInput.value) {
    formError.textContent = "Pick a date.";
    return;
  }

  const entry = {
    id: generateId(),
    type: currentType,
    amount,
    category: categoryInput.value,
    note: noteInput.value.trim(),
    date: dateInput.value,
  };

  transactions.unshift(entry);
  saveTransactions(transactions);

  formError.textContent = "";
  amountInput.value = "";
  noteInput.value = "";
  dateInput.value = todayISO();

  renderAll();
}

// ---- Delete transaction ----
function handleDeleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions(transactions);
  renderAll();
}

// ---- Clear all ----
function handleClearAll() {
  if (confirm("Delete all transactions? This can't be undone.")) {
    transactions = [];
    saveTransactions(transactions);
    renderAll();
  }
}

// ---- Filters ----
function handleFilterChange() {
  filters = {
    type: filterType.value,
    category: filterCategory.value,
    from: filterFrom.value,
    to: filterTo.value,
  };
  renderTransactionList();
}

function resetFilters() {
  filterType.value = "all";
  filterCategory.value = "all";
  filterFrom.value = "";
  filterTo.value = "";
  filters = { type: "all", category: "all", from: "", to: "" };
  renderTransactionList();
}

function getFilteredTransactions() {
  return transactions.filter((t) => {
    if (filters.type !== "all" && t.type !== filters.type) return false;
    if (filters.category !== "all" && t.category !== filters.category) return false;
    if (filters.from && t.date < filters.from) return false;
    if (filters.to && t.date > filters.to) return false;
    return true;
  });
}

// ---- Rendering ----
function renderAll() {
  renderSummary();
  renderTransactionList();
  renderCategoryChart(transactions);
  renderTrendChart(transactions);
}

function renderSummary() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = income - expense;

  document.getElementById("balanceValue").textContent = formatCurrency(balance);
  document.getElementById("incomeValue").textContent = formatCurrency(income);
  document.getElementById("expenseValue").textContent = formatCurrency(expense);

  const balanceEl = document.getElementById("balanceValue");
  const balanceSub = document.getElementById("balanceSub");
  balanceEl.classList.toggle("income-text", balance >= 0);
  balanceEl.classList.toggle("expense-text", balance < 0);
  balanceSub.textContent = balance >= 0 ? "in the green" : "over budget";
}

function renderTransactionList() {
  const container = document.getElementById("transactionList");
  const emptyNote = document.getElementById("listEmptyNote");
  const filtered = getFilteredTransactions();

  if (filtered.length === 0) {
    container.innerHTML = "";
    emptyNote.style.display = "block";
    return;
  }

  emptyNote.style.display = "none";

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = sorted
    .map((t) => {
      const dateLabel = new Date(t.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const sign = t.type === "income" ? "+" : "-";
      return `
        <div class="tx-row">
          <div class="tx-left">
            <span class="tx-dot ${t.type}"></span>
            <div>
              <p class="tx-note">${escapeHtml(t.note || t.category)}</p>
              <p class="tx-meta">${escapeHtml(t.category)} &middot; ${dateLabel}</p>
            </div>
          </div>
          <div class="tx-right">
            <span class="tx-amount ${t.type}">${sign}${formatCurrency(t.amount)}</span>
            <button class="tx-delete" data-id="${t.id}">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".tx-delete").forEach((btn) => {
    btn.addEventListener("click", () => handleDeleteTransaction(btn.dataset.id));
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

init();