/**
 * Expense & Budget Visualizer
 * Vanilla JS · LocalStorage · Chart.js
 */

// ─── State ────────────────────────────────────────────────────────────────────

let transactions = [];
let customCategories = [];
let spendingLimit = 0;
let chartInstance = null;

// ─── DOM References ───────────────────────────────────────────────────────────

const form            = document.getElementById('transactionForm');
const itemNameInput   = document.getElementById('itemName');
const amountInput     = document.getElementById('amount');
const categorySelect  = document.getElementById('category');
const spendingLimitInput = document.getElementById('spendingLimit');
const transactionList = document.getElementById('transactionList');
const emptyState      = document.getElementById('emptyState');
const totalBalanceEl  = document.getElementById('totalBalance');
const limitAlert      = document.getElementById('limitAlert');
const sortSelect      = document.getElementById('sortSelect');
const themeToggle     = document.getElementById('themeToggle');
const chartCanvas     = document.getElementById('spendingChart');
const chartEmpty      = document.getElementById('chartEmpty');

// Custom category elements
const customCategoryInput = document.getElementById('customCategoryInput');
const addCustomCategoryBtn = document.getElementById('addCustomCategory');
const customCategoryError  = document.getElementById('customCategoryError');

// Field error elements
const itemNameError  = document.getElementById('itemNameError');
const amountError    = document.getElementById('amountError');
const categoryError  = document.getElementById('categoryError');

// ─── Category Config ──────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

/** Category colours — extended for custom ones */
const CATEGORY_COLORS = {
  Food:      '#f97316',
  Transport: '#3b82f6',
  Fun:       '#a855f7',
};

const COLOR_POOL = [
  '#10b981', '#ef4444', '#f59e0b', '#14b8a6',
  '#ec4899', '#6366f1', '#84cc16', '#0ea5e9',
];
let colorPoolIndex = 0;

function getCategoryColor(category) {
  if (!CATEGORY_COLORS[category]) {
    CATEGORY_COLORS[category] = COLOR_POOL[colorPoolIndex % COLOR_POOL.length];
    colorPoolIndex++;
  }
  return CATEGORY_COLORS[category];
}

// ─── LocalStorage Helpers ─────────────────────────────────────────────────────

function saveToStorage() {
  localStorage.setItem('bt_transactions', JSON.stringify(transactions));
  localStorage.setItem('bt_customCategories', JSON.stringify(customCategories));
  localStorage.setItem('bt_spendingLimit', String(spendingLimit));
  localStorage.setItem('bt_colorIndex', String(colorPoolIndex));
  // Persist any custom colour mappings
  const customColors = {};
  customCategories.forEach(c => {
    if (CATEGORY_COLORS[c]) customColors[c] = CATEGORY_COLORS[c];
  });
  localStorage.setItem('bt_customColors', JSON.stringify(customColors));
}

function loadFromStorage() {
  const savedTx = localStorage.getItem('bt_transactions');
  transactions = savedTx ? JSON.parse(savedTx) : [];

  const savedCats = localStorage.getItem('bt_customCategories');
  customCategories = savedCats ? JSON.parse(savedCats) : [];

  spendingLimit = parseFloat(localStorage.getItem('bt_spendingLimit')) || 0;
  colorPoolIndex = parseInt(localStorage.getItem('bt_colorIndex'), 10) || 0;

  const savedColors = localStorage.getItem('bt_customColors');
  if (savedColors) {
    Object.assign(CATEGORY_COLORS, JSON.parse(savedColors));
  }
}

// ─── Theme ────────────────────────────────────────────────────────────────────

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('bt_theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('bt_theme') || 'light';
  applyTheme(saved);
}

themeToggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ─── Custom Categories ────────────────────────────────────────────────────────

function renderCategoryOptions() {
  // Keep the default placeholder + defaults, append custom ones
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  // Remove all options except the placeholder (first one)
  while (categorySelect.options.length > 1) {
    categorySelect.remove(1);
  }

  const EMOJI = { Food: '🍔', Transport: '🚌', Fun: '🎮' };

  allCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = (EMOJI[cat] || '🏷️') + ' ' + cat;
    categorySelect.appendChild(option);
  });
}

addCustomCategoryBtn.addEventListener('click', () => {
  const val = customCategoryInput.value.trim();
  customCategoryError.textContent = '';

  if (!val) {
    customCategoryError.textContent = 'Please enter a category name.';
    return;
  }

  const allExisting = [...DEFAULT_CATEGORIES, ...customCategories].map(c => c.toLowerCase());
  if (allExisting.includes(val.toLowerCase())) {
    customCategoryError.textContent = 'Category already exists.';
    return;
  }

  customCategories.push(val);
  getCategoryColor(val); // assign colour now
  saveToStorage();
  renderCategoryOptions();
  customCategoryInput.value = '';
  // Pre-select the new category
  categorySelect.value = val;
});

// ─── Validation ───────────────────────────────────────────────────────────────

function clearErrors() {
  itemNameError.textContent = '';
  amountError.textContent   = '';
  categoryError.textContent = '';
}

function validateForm() {
  clearErrors();
  let valid = true;

  if (!itemNameInput.value.trim()) {
    itemNameError.textContent = 'Item name is required.';
    itemNameInput.focus();
    valid = false;
  }

  const amt = parseFloat(amountInput.value);
  if (!amountInput.value || isNaN(amt) || amt <= 0) {
    amountError.textContent = 'Please enter a valid amount greater than 0.';
    if (valid) amountInput.focus();
    valid = false;
  }

  if (!categorySelect.value) {
    categoryError.textContent = 'Please select a category.';
    if (valid) categorySelect.focus();
    valid = false;
  }

  return valid;
}

// ─── Transactions CRUD ────────────────────────────────────────────────────────

function addTransaction(name, amount, category) {
  const tx = {
    id: Date.now().toString(),
    name,
    amount,
    category,
    date: new Date().toISOString(),
  };
  transactions.unshift(tx); // newest first in the array
  saveToStorage();
  refresh();
}

function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveToStorage();
  refresh();
}

// ─── Balance & Limit ─────────────────────────────────────────────────────────

function calcTotal() {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

function updateBalance() {
  const total = calcTotal();
  totalBalanceEl.textContent = formatCurrency(total);

  // Spending limit highlight (Optional Challenge #3)
  if (spendingLimit > 0 && total > spendingLimit) {
    limitAlert.classList.remove('hidden');
    totalBalanceEl.classList.add('over-limit');
  } else {
    limitAlert.classList.add('hidden');
    totalBalanceEl.classList.remove('over-limit');
  }
}

function updateSpendingLimitDisplay() {
  if (spendingLimit > 0) {
    spendingLimitInput.value = spendingLimit;
  }
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

function getSortedTransactions() {
  const copy = [...transactions];
  const mode = sortSelect.value;

  switch (mode) {
    case 'newest':
      return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
    case 'oldest':
      return copy.sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'amount-desc':
      return copy.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':
      return copy.sort((a, b) => a.amount - b.amount);
    case 'category':
      return copy.sort((a, b) => a.category.localeCompare(b.category));
    default:
      return copy;
  }
}

// ─── Render Transaction List ─────────────────────────────────────────────────

function formatCurrency(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderTransactions() {
  transactionList.innerHTML = '';
  const sorted = getSortedTransactions();

  if (sorted.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  sorted.forEach(tx => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.setAttribute('data-id', tx.id);

    const color = getCategoryColor(tx.category);

    li.innerHTML = `
      <span class="tx-color-bar" style="background:${color}"></span>
      <div class="tx-info">
        <span class="tx-name">${escapeHTML(tx.name)}</span>
        <span class="tx-meta">
          <span class="tx-category" style="color:${color}">${escapeHTML(tx.category)}</span>
          · <span class="tx-date">${formatDate(tx.date)}</span>
        </span>
      </div>
      <span class="tx-amount">${formatCurrency(tx.amount)}</span>
      <button class="btn-delete" data-id="${tx.id}" aria-label="Delete ${escapeHTML(tx.name)}">🗑️</button>
    `;

    transactionList.appendChild(li);
  });
}

// Prevent XSS from user input
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Delegated delete handler
transactionList.addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete');
  if (btn) {
    deleteTransaction(btn.dataset.id);
  }
});

// ─── Chart ────────────────────────────────────────────────────────────────────

function getCategoryTotals() {
  const totals = {};
  transactions.forEach(tx => {
    totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
  });
  return totals;
}

function renderChart() {
  const totals = getCategoryTotals();
  const labels = Object.keys(totals);
  const data   = Object.values(totals);
  const colors = labels.map(getCategoryColor);

  if (labels.length === 0) {
    chartEmpty.classList.remove('hidden');
    chartCanvas.classList.add('hidden');
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  chartEmpty.classList.add('hidden');
  chartCanvas.classList.remove('hidden');

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data   = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.update();
    return;
  }

  const isDark = document.body.getAttribute('data-theme') === 'dark';

  chartInstance = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: isDark ? '#1e1e2e' : '#ffffff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            font: { size: 13 },
            color: isDark ? '#e2e8f0' : '#334155',
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((val / total) * 100).toFixed(1);
              return ` ${formatCurrency(val)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

// Re-render chart colours when theme changes
function refreshChartTheme() {
  if (!chartInstance) return;
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  chartInstance.data.datasets[0].borderColor = isDark ? '#1e1e2e' : '#ffffff';
  chartInstance.options.plugins.legend.labels.color = isDark ? '#e2e8f0' : '#334155';
  chartInstance.update();
}

// Watch for theme changes to update chart colours
const themeObserver = new MutationObserver(() => refreshChartTheme());
themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

// ─── Master Refresh ───────────────────────────────────────────────────────────

function refresh() {
  updateBalance();
  renderTransactions();
  renderChart();
}

// ─── Form Submit ──────────────────────────────────────────────────────────────

form.addEventListener('submit', e => {
  e.preventDefault();

  if (!validateForm()) return;

  const name     = itemNameInput.value.trim();
  const amount   = parseFloat(amountInput.value);
  const category = categorySelect.value;

  // Update spending limit if set
  const limitVal = parseFloat(spendingLimitInput.value);
  if (!isNaN(limitVal) && limitVal >= 0) {
    spendingLimit = limitVal;
    saveToStorage();
  }

  addTransaction(name, amount, category);

  // Reset form fields (keep limit & category for convenience)
  itemNameInput.value = '';
  amountInput.value   = '';
  clearErrors();
});

// ─── Sort Change ──────────────────────────────────────────────────────────────

sortSelect.addEventListener('change', () => renderTransactions());

// ─── Spending Limit Live Update ───────────────────────────────────────────────

spendingLimitInput.addEventListener('change', () => {
  const val = parseFloat(spendingLimitInput.value);
  spendingLimit = (!isNaN(val) && val >= 0) ? val : 0;
  saveToStorage();
  updateBalance();
});

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  loadFromStorage();
  initTheme();
  renderCategoryOptions();
  updateSpendingLimitDisplay();
  refresh();
}

init();
