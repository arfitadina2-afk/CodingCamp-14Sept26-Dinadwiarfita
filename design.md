---
inclusion: always
---

# Design Document — Expense & Budget Visualizer

## 1. Architecture Overview

This is a single-page client-side application with no backend. All state lives in the browser.

```
┌─────────────────────────────────────────────────────┐
│                    index.html                        │
│  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │  Header    │  │  Balance   │  │  Limit Alert  │  │
│  │ (theme btn)│  │   Card     │  │  (conditional)│  │
│  └────────────┘  └────────────┘  └───────────────┘  │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Input Form Card                    │ │
│  │  name · amount · category · limit · custom cat  │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌──────────────────────┐  ┌────────────────────────┐│
│  │  Transaction List    │  │    Pie Chart Card      ││
│  │  (sort + scroll)     │  │    (Chart.js)          ││
│  └──────────────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────┘
         ↕ reads/writes
┌─────────────────────────────────────────────────────┐
│                  js/app.js                           │
│  State: transactions[], customCategories[],          │
│         spendingLimit, chartInstance                 │
│                                                      │
│  Core flow:                                          │
│  form submit → validate → addTransaction()           │
│                              → saveToStorage()       │
│                              → refresh()             │
│                                → updateBalance()     │
│                                → renderTransactions()│
│                                → renderChart()       │
└─────────────────────────────────────────────────────┘
         ↕ persists
┌─────────────────────────────────────────────────────┐
│              Browser localStorage                    │
└─────────────────────────────────────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 Header
- Fixed/sticky at the top
- Contains app title and theme toggle button (`🌙 / ☀️`)
- Theme state toggled via `data-theme` attribute on `<body>`

### 2.2 Balance Card
- Gradient background (primary colour)
- Displays sum of all `transaction.amount` values formatted as `Rp X.XXX`
- Turns yellow (`color: #fde68a`) when spending limit is exceeded

### 2.3 Limit Alert Banner
- Hidden by default (`class="hidden"`)
- Shown when `calcTotal() > spendingLimit > 0`
- Plays a CSS shake animation on appearance

### 2.4 Input Form
- Fields: `itemName` (text), `amount` (number), `category` (select), `spendingLimit` (number, optional)
- Inline field-level error messages below each input
- Expandable `<details>` section for adding custom categories
- On valid submit: calls `addTransaction()`, clears name + amount fields

### 2.5 Transaction List
- Rendered as `<ul>` with delegated click listener for delete buttons
- Sort dropdown re-renders list without touching the `transactions[]` array order
- Scrollable (`max-height: 420px; overflow-y: auto`)
- Empty state `<p>` shown when list is empty
- Items animate in with `fadeIn` keyframe

### 2.6 Pie Chart
- Chart.js `pie` type, CDN loaded
- Single `chartInstance` singleton — updated via `.update()`, not recreated on each change
- Recreated only when going from 0 → 1+ transactions
- Legend at bottom, tooltips show `Rp X.XXX (X.X%)`
- Colours sync with theme on `data-theme` attribute mutation (MutationObserver)

---

## 3. State Management

All state is module-level in `app.js`. No classes, no global `window` variables.

```
transactions[]        ← source of truth for list + chart + balance
customCategories[]    ← extra dropdown options beyond the 3 defaults
spendingLimit         ← number, 0 = disabled
chartInstance         ← Chart.js instance or null
```

**Mutation rule:** every state change must be followed by `saveToStorage()` then `refresh()`.

---

## 4. Data Persistence

All state is serialised to `localStorage` on every mutation:

```
bt_transactions     → JSON.stringify(transactions)
bt_customCategories → JSON.stringify(customCategories)
bt_spendingLimit    → String(spendingLimit)
bt_theme            → "light" | "dark"
bt_colorIndex       → String(colorPoolIndex)
bt_customColors     → JSON.stringify({ CategoryName: "#hexcolor", ... })
```

On page load, `init()` calls `loadFromStorage()` which deserialises all keys and restores state before first render.

---

## 5. Colour System

Default category colours are hardcoded in `CATEGORY_COLORS`:

| Category  | Colour    |
|-----------|-----------|
| Food      | `#f97316` |
| Transport | `#3b82f6` |
| Fun       | `#a855f7` |

Custom categories are assigned from `COLOR_POOL` (8 colours) in round-robin order tracked by `colorPoolIndex`. Once assigned, the mapping is saved to `bt_customColors` so the same colour survives page refresh.

---

## 6. Theme System

| Attribute | Value |
|-----------|-------|
| `<body data-theme="light">` | Default |
| `<body data-theme="dark">` | Dark mode |

All visual tokens are CSS custom properties. Switching theme = one `setAttribute` call. A `MutationObserver` on `<body>` watches for `data-theme` changes and calls `refreshChartTheme()` to sync Chart.js legend + border colours.

---

## 7. Sorting Logic

Sorting is presentation-only — it never mutates `transactions[]`.

`getSortedTransactions()` returns a sorted copy based on `sortSelect.value`:

| Option | Sort key |
|--------|----------|
| `newest` | `date` DESC |
| `oldest` | `date` ASC |
| `amount-desc` | `amount` DESC |
| `amount-asc` | `amount` ASC |
| `category` | `category` A→Z |

---

## 8. Validation Rules

| Field | Rule |
|-------|------|
| Item Name | Required, non-empty string |
| Amount | Required, numeric, > 0 |
| Category | Required, must select a non-placeholder option |

Errors are shown in `<span class="field-error">` elements directly below each input. All errors are cleared on each new submission attempt before re-validating.

---

## 9. Security

- All user-supplied strings rendered to the DOM pass through `escapeHTML()` which replaces `& < > " '` with HTML entities
- No `innerHTML` with raw user input anywhere
- No external API calls — all data stays in the browser
- `novalidate` on `<form>` disables browser-native validation in favour of the custom JS validation

---

## 10. CSS Architecture

```
style.css
├── CSS Variables         :root (light) + [data-theme="dark"]
├── Reset & Base          *, html, body
├── Layout                .container
├── Header                .app-header, .btn-icon
├── Cards                 .card (base), .balance-card, .chart-card
├── Limit Alert           .limit-alert + @keyframes shake
├── Form                  .form-group, label, input, select, .field-error
├── Custom Category       .custom-category-toggle, .custom-category-form
├── Buttons               .btn, .btn-primary, .btn-secondary, .btn-delete
├── Sort Controls         .list-header, .sort-controls
├── Transaction List      .transaction-list, .transaction-item, .tx-*
├── Empty State           .empty-state
├── Chart                 .chart-wrapper
├── Footer                .app-footer
├── Utilities             .hidden
└── Responsive            @media (min-width: 600px)
```

Mobile-first: base styles are for 360px+ screens. The single breakpoint at `600px` widens layout for tablets and desktops.

---

## 11. File Reference

#[[file:index.html]]
#[[file:css/style.css]]
#[[file:js/app.js]]
