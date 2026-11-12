# Expense & Budget Visualizer — Project Requirements

## Project Overview

A mobile-friendly web app that helps users track their daily spending. It displays total balance, a history of all transactions, and a visual chart of spending by category. Built as a standalone web page that works well on mobile and desktop browsers.

---

## Functional Requirements

### FR-1: Input Form

| ID | Requirement |
|----|-------------|
| FR-1.1 | The form must include three fields: **Item Name**, **Amount**, and **Category** |
| FR-1.2 | Category options must include at minimum: **Food**, **Transport**, **Fun** |
| FR-1.3 | Submitting the form must add the transaction to the transaction list |
| FR-1.4 | All fields must be validated before submission — empty fields must show an error message |
| FR-1.5 | Amount must be a positive number greater than zero |
| FR-1.6 | After a successful submission, the Item Name and Amount fields must be cleared |

### FR-2: Transaction List

| ID | Requirement |
|----|-------------|
| FR-2.1 | The list must display all added transactions |
| FR-2.2 | Each item must show: item name, amount (in Rp), and category |
| FR-2.3 | Each item must show the date it was added |
| FR-2.4 | Each item must have a **Delete** button that removes it from the list |
| FR-2.5 | The list must be scrollable when it contains many items |
| FR-2.6 | When no transactions exist, an empty state message must be shown |

### FR-3: Total Balance

| ID | Requirement |
|----|-------------|
| FR-3.1 | Total balance must be displayed prominently at the top of the page |
| FR-3.2 | Balance must automatically recalculate whenever a transaction is added or deleted |
| FR-3.3 | Balance represents the total sum of all transaction amounts |

### FR-4: Visual Chart

| ID | Requirement |
|----|-------------|
| FR-4.1 | A pie chart must show spending distribution broken down by category |
| FR-4.2 | The chart must update automatically whenever transactions are added or deleted |
| FR-4.3 | Each category must be represented with a distinct colour |
| FR-4.4 | Tooltips must show the amount and percentage for each category slice |
| FR-4.5 | When no transactions exist, a placeholder message must replace the chart |

---

## Optional Feature Requirements (3 of 5 implemented)

### OFR-1: Dark / Light Mode Toggle

| ID | Requirement |
|----|-------------|
| OFR-1.1 | A toggle button in the header must switch between dark and light mode |
| OFR-1.2 | The selected theme must persist in `localStorage` across sessions |
| OFR-1.3 | The chart colours must update to match the active theme |

### OFR-2: Sort Transactions

| ID | Requirement |
|----|-------------|
| OFR-2.1 | A sort control must allow the user to re-order the transaction list |
| OFR-2.2 | Sort options must include: Newest First, Oldest First, Amount (high→low), Amount (low→high), By Category |
| OFR-2.3 | The list must re-render immediately when the sort option changes |

### OFR-3: Highlight Spending Over a Set Limit

| ID | Requirement |
|----|-------------|
| OFR-3.1 | The form must include an optional **Spending Limit** field |
| OFR-3.2 | When the total balance exceeds the spending limit, a visible warning banner must appear |
| OFR-3.3 | The balance display must change colour to indicate the over-limit state |
| OFR-3.4 | The spending limit must persist in `localStorage` across sessions |

### OFR-4: Custom Categories (Bonus)

| ID | Requirement |
|----|-------------|
| OFR-4.1 | Users must be able to add custom category names beyond the three defaults |
| OFR-4.2 | Custom categories must be available in the category dropdown immediately after being added |
| OFR-4.3 | Custom categories and their assigned colours must persist in `localStorage` |
| OFR-4.4 | Duplicate category names (case-insensitive) must be rejected with an error message |

---

## Technical Constraints

### TC-1: Technology Stack

- **HTML** for structure
- **CSS** for styling
- **Vanilla JavaScript** — no frameworks (React, Vue, Angular, etc.)
- No backend server required
- Chart.js (CDN) is the only permitted external library

### TC-2: Data Storage

- Use the **browser LocalStorage API** exclusively
- All data stored client-side only
- No cookies, IndexedDB, or server-side storage

### TC-3: File Structure

- Exactly **1 CSS file** inside `css/` → `css/style.css`
- Exactly **1 JavaScript file** inside `js/` → `js/app.js`
- Main entry point: `index.html` at the project root

### TC-4: Browser Compatibility

- Must work in modern browsers: **Chrome, Firefox, Edge, Safari**
- Must function as a standalone web page (no build step required)

---

## Non-Functional Requirements

### NFR-1: Simplicity

- Clean, minimal interface with no unnecessary complexity
- Easy to understand and use without instructions
- No test setup required
- No build process required — open `index.html` directly in a browser

### NFR-2: Performance

- Fast load time — no heavy dependencies beyond Chart.js
- UI interactions (add, delete, sort, theme switch) must feel instant
- No noticeable lag when the transaction list grows

### NFR-3: Visual Design

- User-friendly aesthetic with clear visual hierarchy
- Readable typography at all sizes
- Mobile-first responsive design — works well on screens from 360px wide
- Accessible: form labels, ARIA attributes, and keyboard-navigable controls

### NFR-4: Security

- All user-supplied text must be HTML-escaped before being rendered to the DOM to prevent XSS
- No external data transmission — all processing happens in the browser

---

## Data Model

Each transaction stored in `localStorage` follows this structure:

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

## Deployment

- Source code hosted on **GitHub**
- Site published via **GitHub Pages** (no build step needed)
- The `.kiro/` folder must be present in the repository for submission
