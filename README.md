# 💰 Expense & Budget Visualizer

A mobile-friendly web app for tracking daily spending. Built with plain HTML, CSS, and Vanilla JavaScript — no frameworks, no build step.

🔗 **Live Site:** [GitHub Pages URL here after deployment]  
📁 **Repository:** [GitHub Repo URL here]

---

## ✨ Features

### MVP Features
- **Input Form** — Add transactions with Item Name, Amount, and Category (Food, Transport, Fun)
- **Transaction List** — Scrollable history with name, amount, category, date, and delete button
- **Total Balance** — Auto-updates at the top whenever items are added or removed
- **Pie Chart** — Visual spending breakdown by category (Chart.js), updates automatically

### Optional Challenges (3 of 5)
- 🌙 **Dark / Light Mode** — Toggle button in the header, preference saved to localStorage
- 🔃 **Sort Transactions** — Sort by newest, oldest, amount (high/low), or category
- ⚠️ **Spending Limit Highlight** — Set a limit; balance turns yellow and a banner appears when exceeded

### Bonus
- 🏷️ **Custom Categories** — Add your own categories beyond the three defaults, with auto-assigned colours

---

## 📁 Project Structure

```
CodingCamp-14Sept26-Dinadwiarfita/
├── index.html              # Main entry point — open this in a browser
├── css/
│   └── style.css           # All styling (light & dark theme, responsive)
├── js/
│   └── app.js              # All application logic (CRUD, chart, localStorage)
├── .kiro/
│   ├── steering/
│   │   └── requirements.md # Project requirements document
│   └── settings/
│       └── mcp.json        # Kiro IDE configuration
└── README.md               # This file
```

---

## 🚀 How to Run Locally

No installation or build step needed.

1. Clone or download this repository
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
3. Done — the app works immediately

```bash
# Or with a simple local server (optional)
npx serve .
```

---

## 🗂 How It Works

### Data Flow

```
User fills form → Validation → addTransaction()
                                     ↓
                              transactions[] array
                                     ↓
                    ┌────────────────┼─────────────────┐
                    ↓                ↓                  ↓
             localStorage      renderList()        renderChart()
                                     ↓                  ↓
                              updateBalance()       Chart.js pie
```

### localStorage Keys

| Key | Value |
|-----|-------|
| `bt_transactions` | JSON array of all transactions |
| `bt_customCategories` | JSON array of custom category names |
| `bt_spendingLimit` | Number (spending limit in Rp) |
| `bt_theme` | `"light"` or `"dark"` |
| `bt_colorIndex` | Number (tracks colour pool index) |
| `bt_customColors` | JSON object of custom category → colour mappings |

### Transaction Data Model

```json
{
  "id": "1726123456789",
  "name": "Lunch at warung",
  "amount": 25000,
  "category": "Food",
  "date": "2026-09-17T08:30:00.000Z"
}
```

---

## 🔧 Technical Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | CSS3 (CSS Variables, Flexbox, media queries) |
| Logic | Vanilla JavaScript (ES6+) |
| Chart | [Chart.js 4.4.0](https://www.chartjs.org/) via CDN |
| Storage | Browser `localStorage` |
| Hosting | GitHub Pages |

---

## 📋 Requirements

See [`.kiro/steering/requirements.md`](.kiro/steering/requirements.md) for the full requirements document covering:
- Functional Requirements (FR-1 to FR-4)
- Optional Feature Requirements (OFR-1 to OFR-4)
- Technical Constraints (TC-1 to TC-4)
- Non-Functional Requirements (NFR-1 to NFR-4)

---

## 🌐 Deployment (GitHub Pages)

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select `main` branch → `/ (root)` folder
4. Click **Save** — your site will be live at `https://<username>.github.io/<repo-name>/`

---

## 👤 Author

**Dinadwiarfita**  
CodingCamp · September 2026
