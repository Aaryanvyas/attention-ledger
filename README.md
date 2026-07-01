# The Attention Ledger

A focus/time-tracking app framed as double-entry bookkeeping for your attention.
Instead of a generic pomodoro timer, every work session gets **posted as a ledger
entry**: deep work and learning are *credits* (hours that compound), meetings and
distraction are *debits* (hours that get spent). A running balance shows whether
your day is "in the black" or "in the red."

## Why this project (not another todo app)

Most junior frontend portfolios have a todo list, a weather widget, or a Netflix
clone. This project is built around one small, opinionated idea — "what if your
calendar was an accounting ledger" — executed with real UI craft:

- A genuine **two-column double-entry ledger** (Debit / Credit / running Balance),
  not just a list of cards.
- A **live stopwatch** that posts real elapsed time, plus a manual-entry path for
  logging time after the fact.
- **Derived state**, not stored state: the running balance, per-category totals,
  and account bar widths are all computed with `useMemo` from a single source of
  truth (the `entries` array) — a good talking point for a frontend interview
  about state design.
- A distinct visual identity (ledger-book layout, slab serif + monospace type,
  stamped "posted" animation) instead of a generic dashboard template.

## Tech stack

- React 18 + Vite (fast, minimal, easy for anyone to `npm install && npm run dev`)
- No UI libraries, no CSS framework — every style is hand-written, which is
  actually a plus for an entry-level frontend interview: it shows you understand
  CSS, not just how to wire up Tailwind/MUI.

## Running it locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Deploying it (so you have a live link to put on your resume today)

Fastest path — Vercel:

1. Push this folder to a new GitHub repo.
2. Go to vercel.com → "Add New Project" → import the repo.
3. Framework preset: Vite. No config needed. Click Deploy.
4. You'll have a live `https://your-project.vercel.app` URL in under a minute.

(Netlify works the same way — "Import from Git", build command `npm run build`,
publish directory `dist`.)

## What to say about it in an interview

- **The idea**: "I noticed every focus-tracker looks the same, so I built one
  around a metaphor — treating time like money in a ledger — because it made the
  data model more interesting: every session is either a credit or a debit, and
  the balance is derived, not stored."
- **State management**: entries are the single source of truth; everything else
  (balance, totals, bar chart widths) is computed with `useMemo` so the UI never
  gets out of sync.
- **What you'd add next** (good for "how would you extend this" questions):
  - Persist entries to `localStorage` or a small backend (this is a natural
    full-stack extension if you're also applying for the full-stack role).
  - Weekly/monthly views with a real chart library.
  - Auth + multi-device sync.
  - Export entries as an actual CSV "statement."

## Project structure

```
attention-ledger/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx      # React entry point
    ├── App.jsx        # All app logic + UI
    └── index.css      # Ledger-book design system
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

