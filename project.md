---
inclusion: always
---

# Project: Expense & Budget Visualizer

## File Map

This project has exactly 3 source files. Always edit these and only these:

| File | Role |
|------|------|
| `index.html` | App structure — all HTML markup, Chart.js CDN `<script>`, links to CSS and JS |
| `css/style.css` | All styling — CSS variables for light/dark theme, layout, components |
| `js/app.js` | All logic — LocalStorage, CRUD, validation, chart rendering, sort, theme |

**Rules:**
- Only 1 file in `css/` → `css/style.css`
- Only 1 file in `js/` → `js/app.js`
- No additional JS or CSS files may be created
- No frameworks, no build tools, no npm packages

## Key Conventions in app.js

- All DOM IDs are declared as `const` at the top under `// ─── DOM References ───`
- `refresh()` is the master update function — always call it after any data change
- `saveToStorage()` must be called after every mutation to `transactions[]`, `customCategories[]`, or `spendingLimit`
- User input rendered to the DOM must go through `escapeHTML()` to prevent XSS
- Chart is a module-level singleton stored in `chartInstance` — update it via `chartInstance.update()`, destroy and recreate only when needed

## localStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `bt_transactions` | JSON array | All transaction objects |
| `bt_customCategories` | JSON array | User-added category names |
| `bt_spendingLimit` | string (number) | Spending limit in Rp |
| `bt_theme` | `"light"` \| `"dark"` | Active theme |
| `bt_colorIndex` | string (number) | Colour pool index for custom categories |
| `bt_customColors` | JSON object | category → hex colour mapping |

## Transaction Shape

```json
{
  "id": "1726123456789",
  "name": "string (HTML-escaped on render)",
  "amount": 25000,
  "category": "Food | Transport | Fun | <custom>",
  "date": "ISO 8601 string"
}
```

## CSS Conventions

- All colours and sizing use CSS custom properties defined in `:root` (light) and `[data-theme="dark"]`
- Theme transitions use `var(--transition)` → `.2s ease`
- Mobile-first: base styles target mobile, `@media (min-width: 600px)` for tablet+
- New components should use existing variables — do not hardcode colours

#[[file:index.html]]
#[[file:css/style.css]]
#[[file:js/app.js]]
