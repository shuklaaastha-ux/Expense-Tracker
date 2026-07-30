let categoryChartInstance = null;
let trendChartInstance = null;

function renderCategoryChart(transactions) {
  const canvas = document.getElementById("categoryChart");
  const emptyNote = document.getElementById("categoryEmptyNote");

  const expenseData = transactions.filter((t) => t.type === "expense");
  const totals = {};
  expenseData.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
  });

  const labels = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
  const values = labels.map((l) => totals[l]);

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
    categoryChartInstance = null;
  }

  if (labels.length === 0) {
    canvas.style.display = "none";
    emptyNote.style.display = "block";
    return;
  }

  canvas.style.display = "block";
  emptyNote.style.display = "none";

  categoryChartInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((l) => CATEGORY_COLORS[l] || "#8A8A8A"),
          borderWidth: 2,
          borderColor: "#FFFFFF",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { size: 12 }, color: "#5B6B62", padding: 12 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}`,
          },
        },
      },
    },
  });
}

function renderTrendChart(transactions) {
  const canvas = document.getElementById("trendChart");
  const emptyNote = document.getElementById("trendEmptyNote");

  // Group by year-month so bars stay in chronological order regardless
  // of the order transactions were added in.
  const buckets = {};
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) buckets[key] = { income: 0, expense: 0 };
    buckets[key][t.type] += Number(t.amount);
  });

  const keys = Object.keys(buckets).sort();

  if (trendChartInstance) {
    trendChartInstance.destroy();
    trendChartInstance = null;
  }

  if (keys.length === 0) {
    canvas.style.display = "none";
    emptyNote.style.display = "block";
    return;
  }

  canvas.style.display = "block";
  emptyNote.style.display = "none";

  const labels = keys.map((k) =>
    new Date(`${k}-01`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
  );
  const incomeValues = keys.map((k) => buckets[k].income);
  const expenseValues = keys.map((k) => buckets[k].expense);

  trendChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Income", data: incomeValues, backgroundColor: "#3B7A57", borderRadius: 3 },
        { label: "Expense", data: expenseValues, backgroundColor: "#B5533C", borderRadius: 3 },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 12 }, color: "#5B6B62" } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 12 }, color: "#5B6B62" } },
        y: { grid: { color: "#D9DCD3" }, ticks: { font: { size: 12 }, color: "#5B6B62" } },
      },
    },
  });
}