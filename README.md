# BoxScore

A lightweight, mobile-friendly basketball stat tracker. Add players, tap a row to log made/missed shots and assists, and see live box-score totals — all persisted in your browser's `localStorage`.

## Project Structure

```
src/
├── multi-file/
│   ├── index.html      # Markup
│   ├── style.css       # Styles
│   └── script.js       # Logic
└── single-file/
    └── index.html      # Everything inlined for simple distribution
```

Two build flavors are shipped:

- **`src/multi-file/`** — the canonical source split into HTML, CSS, and JS.
- **`src/single-file/index.html`** — the same app consolidated into one self-contained file (HTML + CSS + JS).

> **Why two versions?** The single-file build exists mainly as a reliability fallback: in some environments the linked `style.css` and `script.js` aren't detected or loaded correctly from `index.html` (e.g. when opened via `file://`, embedded in restrictive viewers, or served from paths that break relative references). Inlining everything removes those external dependencies so the app always renders and runs as expected.

> Both versions persist data under the same `localStorage` key (`playerV1`), so stats carry over between them.

## Features

- **Roster management** — add and remove players by name.
- **NBA-style box score table** with columns for FG, 3P, FG%, PTS, and AST, plus a live **TOTALS** footer row.
- **Bottom-sheet stat editor** — tap any player row to open a slide-up panel with big, thumb-friendly buttons:
  - 2-pointers: **+ Convertido** (counts an attempt), **+ Errado**, and **−1** undo.
  - 3-pointers: same made/miss/undo flow.
  - Assists: increment and decrement.
- **Undo logic** — the `−1` button removes a made shot (and its attempt) first, then falls back to removing a missed attempt.
- **Auto-calculated stats** — FG% is derived from makes/attempts; PTS from 2P and 3P makes.
- **Session reset** — zero out all stats while keeping the roster.
- **Persistence** — everything is saved to `localStorage` on every change.
- **Mobile-first** — fixed bottom sheet, safe-area padding, no zoom on input focus, tabular numerals.

## Getting Started

### Single-file version (most reliable)

Open `src/single-file/index.html` directly in any modern browser. No build step, server, or external asset loading required — this is the recommended option if the multi-file version fails to load its CSS/JS.

### Multi-file version

Open `src/multi-file/index.html` in a browser, or serve the folder with any static file server, e.g.:

```bash
# from the repo root
npx serve src/multi-file
# or
python3 -m http.server --directory src/multi-file
```

Serving over HTTP (rather than opening via `file://`) avoids most cases where the browser fails to resolve `style.css` and `script.js`.

## How to Use

1. Type a player's name and press **Add** (or hit Enter).
2. Tap a player's row to open the stat sheet.
3. Use **+ Convertido** / **+ Errado** to record makes and misses, and **+ Assistência** for assists. Use **−1** to correct mistakes.
4. Close the sheet to see updated totals in the main table.
5. Use **Reiniciar Sessão** to reset all stats to zero (players are kept).

## Data Model

Each player is stored as:

```js
{
  id: string,                     // timestamp + random suffix
  name: string,
  twoPointersMade: number,
  twoPointersAttempted: number,
  threePointersMade: number,
  threePointersAttempted: number,
  assists: number
}
```

Derived values:

- `FG` = `twoPointersMade + threePointersMade` / `twoPointersAttempted + threePointersAttempted`
- `FG%` = `FG made / FG attempted × 100` (one decimal, or `0.0`)
- `PTS` = `2 × twoPointersMade + 3 × threePointersMade`

Stored in `localStorage` under the key `playerV1` as a JSON array.

## Tech Stack

Plain HTML, CSS, and vanilla JavaScript — no frameworks, no dependencies, no build tooling.
