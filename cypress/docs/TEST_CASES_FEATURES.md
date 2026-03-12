# E2E Test Dashboard — Feature Specification & AI Replication Guide

> **Purpose**: Complete feature specification of `TEST_CASES.html` and its supporting infrastructure.
> Use this document as an AI prompt/instruction to replicate this dashboard for any Cypress E2E project.

---

## Architecture Overview

- **Single-file SPA**: One self-contained HTML file with inline CSS and JS (no build step, no bundling, no external CSS framework)
- **Backend**: Lightweight Node.js HTTP server (`sync-server.js`) — no frameworks, pure `http` module
- **Data Source**: Hardcoded `TABS` array in the HTML defines all test modules, files, and test cases
- **Report Engine**: Mochawesome reporter parsed from Cypress HTML output
- **PDF Library**: jsPDF (CDN with fallback)
- **Persistence**: Browser `localStorage` for test status tracking
- **Communication**: Server-Sent Events (SSE) for real-time streaming

---

## 1. UI Layout & Design

### Dark Theme
| Token             | Hex       | Usage                         |
|-------------------|-----------|-------------------------------|
| Body BG           | `#1a1b2e` | Page background               |
| Panel/Card BG     | `#222540` | Header, cards, modals         |
| Border            | `#353860` | Dividers, card borders        |
| Primary text      | `#d4d8f0` | Body text                     |
| Accent (purple)   | `#6c7bf0` | Buttons, links, highlights    |
| Success (green)   | `#4ade80` | Pass badges, run buttons      |
| Error (red)       | `#f87171` | Fail badges, stop button      |
| Warning (yellow)  | `#fbbf24` | Blocked badges, running state |
| Muted text        | `#8890b5` | Secondary text, inactive tabs |
| Header gradient   | `linear-gradient(135deg, #222540 0%, #1e2040 100%)` | Header bar |

### Font Stack
- Primary: `'Segoe UI', system-ui, -apple-system, sans-serif`
- Monospace (log panel, errors): `'Consolas', 'Fira Code', 'Courier New', monospace`

### Full-Height Flexbox Layout
- `body`: `display: flex; flex-direction: column; min-height: 100vh`
- Header, tab bar, footer: `flex-shrink: 0`
- Main split area: `flex: 1; overflow: hidden`

### Split-Panel Layout
- Left panel: `flex: 1; overflow-y: auto` (test case tabs + accordions)
- Right panel: `width: 50%; min-width: 380px; flex-shrink: 0` (live log output)

### Custom Scrollbars (WebKit)
- Track: `#1a1b2e`, Thumb: `#353860`, Thumb hover: `#4a4f80`, border-radius: 4px

### Responsive Behavior
- No media queries — uses `flex-wrap: wrap` on header, stats row, tab bar
- Reports grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`

---

## 2. Header Section

### Elements
1. **Title**: `"<ProjectName> - E2E Test Dashboard"` with accent-colored keyword
2. **Server Status Indicator**: Pill badge with glowing dot, polled every 10 seconds via `GET /ping`
3. **Sync Button**: Triggers `GET /sync` to resync test case definitions from disk
4. **Run All Headed Button**: Primary style, runs all specs with visible browser
5. **Run All Headless Button**: Secondary style, runs all specs headlessly
6. **Stop Button**: Danger style, hidden by default, shown during runs

### Stat Boxes (5 boxes, dynamically computed)
| Box           | Source                            | Style          |
|---------------|-----------------------------------|----------------|
| Total Tests   | `TABS.reduce(sum of all tests)`   | Default        |
| Test Files    | `TABS.reduce(sum of all files)`   | Default        |
| API Modules   | `TABS.length`                     | Default        |
| Passed        | Real-time from run + localStorage | Green accent   |
| Failed        | Real-time from run + localStorage | Red accent     |

### Server Health Check
```
Interval: 10 seconds
Endpoint: GET /ping
Timeout: 3 seconds (AbortSignal.timeout)
Online: green dot with glow + "Server Online"
Offline: red dot with glow + "Server Offline"
```

---

## 3. Tab Navigation System

### Tab Construction
- One tab per API module from `TABS` array
- Each tab shows badge with test count: `tab.files.reduce((s, f) => s + f.tests.length, 0)`
- Extra "Reports" tab appended at the end with `"..."` badge

### Tab Switching
- Active tab: bottom border `2px solid accent`, accent text, accent badge bg
- Inactive: transparent bg, muted text, dark badge
- Reports tab triggers `loadReports()` on activation

---

## 4. Test Case Display

### Accordion File Groups
- Each test file = one collapsible accordion (starts open)
- Toggle: `element.classList.toggle('open')`
- Chevron: `&#9654;` right-pointing triangle, rotates 90deg when open via CSS `transform`

### Accordion Header Content
- Chevron icon
- File name (e.g., `01-orders/orders.cy.js`)
- Counters: `"X/Y passed"` + optional `"Z failed"`
- Two run buttons: **Headed** (green) + **Headless** (purple), both use `event.stopPropagation()`

### Test Row Table
| Column      | Width  | Content                                 |
|-------------|--------|-----------------------------------------|
| `#`         | 40px   | Row number (1-based)                    |
| Test Case   | flex   | Test title from TABS                    |
| DB Verified | 90px   | "Yes" (green badge) / "No" (gray badge) |
| Status      | 100px  | Clickable status badge                  |

### Status Badge — Click-to-Cycle
```
Cycle order: Not Run -> Pass -> Fail -> Blocked -> Skip -> Not Run
Storage: localStorage key "status:{tabId}-f{fileIndex}-t{testIndex}"
Badges: uppercase, letter-spacing 0.5px, cursor pointer, scale(1.05) on hover
```
| Status  | Badge Class     | BG        | Text      |
|---------|-----------------|-----------|-----------|
| Not Run | `badge-notrun`  | `#2d3050` | `#8890b5` |
| Pass    | `badge-pass`    | `#1a3a2a` | `#4ade80` |
| Fail    | `badge-fail`    | `#3a1a1a` | `#f87171` |
| Blocked | `badge-blocked` | `#3a2f1a` | `#fbbf24` |
| Skip    | `badge-skip`    | `#2d3050` | `#6c7bf0` |

---

## 5. Test Execution (Run System)

### Run Modes
- **Headed**: `npx cypress run --browser chrome --headed --spec <path>`
- **Headless**: `npx cypress run --browser chrome --spec <path>`

### Run-Per-File
- Clears log, resets stats for that file
- Button transitions: Default -> "Running..." (yellow) -> "Passed"/"Failed" (5s) -> revert

### Run-All
- Spec pattern: `cypress/e2e/customer-api/**/*.cy.js`
- Calls `resetStats()` first: clears all localStorage status keys, resets all badges to "NOT RUN", zeros counters
- Concurrent run prevention: checks `runningSource` global variable

### Stop Mechanism
- Client: closes `EventSource` connection
- Server: `req.on('close')` handler kills Cypress child process (`child.kill()`)
- Note: No dedicated `/stop` endpoint needed — the SSE connection close triggers cleanup

### EventSource SSE Protocol
```
URL: /run?spec=<path>&mode=headed|headless
Content-Type: text/event-stream
Frame format: data: {JSON}\n\n

Events received:
  { status: 'starting', spec, mode }         — run started
  { status: 'file-start', file }             — spec file started running
  { status: 'spec-done', file, total, pass, fail, specTotal, specPasses, specFailures }
  { status: 'log', text }                    — raw Cypress CLI output line
  { status: 'done', ok, exitCode, report }   — run complete with full report
  { status: 'error', message }               — spawn failure
```

### Real-Time Progress
- `specCount / totalSpecs * 100` for progress bar
- `totalRunPassed` / `totalRunFailed` accumulated from `spec-done` events
- Stat boxes updated in real-time during run

---

## 6. Live Log Panel

### Structure
1. **Header bar**: "Live Log" title + Clear button
2. **Progress bar**: 6px height, gradient `linear-gradient(90deg, #6c7bf0, #4ade80)`, `transition: width 0.3s ease`
3. **Error summary**: Red-themed box listing failed tests with error messages (monospace)
4. **Log body**: Monospace scrollable area, auto-scrolls on append

### Log Color Classes
| Class       | Color     | Usage               |
|-------------|-----------|---------------------|
| `log-pass`  | `#4ade80` | Pass messages       |
| `log-fail`  | `#f87171` | Fail messages       |
| `log-info`  | `#6c7bf0` | File start messages |
| `log-warn`  | `#fbbf24` | Warnings            |
| `log-bold`  | `#d4d8f0` | Bold emphasis       |

### ANSI Stripping (Server-Side)
```javascript
str.replace(/\x1B\[[0-9;]*[mGKHFJA-Za-z]/g, '')
```

---

## 7. Status Tracking & Persistence

### localStorage Schema
```
Key:   "status:{tabId}-f{fileIndex}-t{testIndex}"
Value: "notrun" | "pass" | "fail" | "blocked" | "skip"
```

### Status Update Sources
1. **Manual**: Click-to-cycle on badge -> writes to localStorage
2. **Automated**: `applyReportToRows()` after run completion -> writes to localStorage
3. Both sources write to the same keys

### Accordion Counter Updates
- `updateAccordionCounters(accId)`: reads all badge statuses within accordion, counts pass/fail, updates counter display

### Global Stats Update
- `updateGlobalStats()`: iterates ALL tabs > files > tests, reads localStorage, counts pass/fail totals

### Reset on New Run
- `resetStats()`: removes all localStorage status keys, resets all badge DOM elements, zeros all counters and stat boxes

---

## 8. Reports System

### Report Storage
- Directory: `cypress/docs/run-history/`
- Filename: `YYYY-MM-DDTHH-MM-SS_<safe-spec-name>.json`
- Auto-pruning: keeps only latest 10 reports (configurable)

### Report JSON Schema
```json
{
  "label": "filename.cy.js",
  "spec": "cypress/e2e/customer-api/01-orders/orders.cy.js",
  "time": "3/12/2026, 10:30:00 AM",
  "ok": true,
  "passes": 12,
  "failures": 0,
  "total": 12,
  "duration": 45000,
  "detail": {
    "passes": [{ "title": "Test title", "file": "path/to/spec.cy.js", "duration": 1500 }],
    "failures": [{ "title": "Test title", "file": "path", "duration": 800, "err": { "message": "...", "stack": "..." }}],
    "stats": { "...mochawesome stats..." },
    "specTotal": 12,
    "specPasses": 12,
    "specFailures": 0
  }
}
```

### Report Cards (Grid Layout)
- `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- Each card: title, timestamp, pass/fail counts, selection checkbox, View Report button, PDF button
- Hover effect: `translateY(-2px)` + box-shadow
- Selection: checkbox toggles `.selected` class, tracks in `selectedReports` Set

### Report Tab Actions
1. **Refresh**: re-fetches report list
2. **Download PDF**: downloads selected (or all) reports as PDF
3. **Delete Selected**: POST to `/reports/delete` with file list

### View Report Modal
- Overlay: click outside to close
- Groups tests by source file
- Each file section: header bar with filename + pass/fail counts
- Pass tests: green badge + title
- Fail tests: red badge + title + error message (monospace)
- Footer: Download PDF + Close buttons

### PDF Export (jsPDF)
```
Library: jsPDF 2.5.2
CDN: cdnjs with unpkg fallback
Format: A4 portrait

Structure:
1. Dark header bar: title "E2E Test Report", subtitle, timestamp
2. Summary boxes: Total (purple), Passed (green), Failed (red)
3. File sections: dark header bar + test rows with pass/fail badges
4. Footer: horizontal line + centered attribution text
5. Auto page-break: checkPage(need) adds page if y + need > 275
```

---

## 9. Server (sync-server.js)

### Configuration
```javascript
PORT: 7357
HOST: 127.0.0.1
ROOT: path.join(__dirname, '..', '..')  // project root
```

### Endpoints
| Method | Path             | Description                                          |
|--------|------------------|------------------------------------------------------|
| GET    | `/ping`          | Health check, returns `{ ok: true }`                 |
| GET    | `/sync`          | Runs sync-test-cases.js, returns output              |
| GET    | `/run`           | SSE stream: runs Cypress spec, streams output        |
| GET    | `/reports`       | Lists all report JSONs (newest first)                |
| GET    | `/reports/get`   | Returns full JSON of a specific report               |
| POST   | `/reports/delete`| Deletes specified report files                       |

### `/run` Query Parameters
| Param | Values              | Default  |
|-------|---------------------|----------|
| `spec`| Cypress spec path   | Required |
| `mode`| `headed`, `headless`| `headed` |

### Cypress Spawn
```javascript
const args = ['cypress', 'run', '--browser', 'chrome'];
if (mode === 'headed') args.push('--headed');
args.push('--spec', spec);
spawn('npx', args, { cwd: ROOT, shell: true });
```

### Line Processing (Real-Time)
- Buffers chunks, splits on `\n`, processes complete lines
- Detects `"Running: <file>.cy.js"` -> `file-start` event
- Detects spec table rows (checkmark + filename + stats) -> `spec-done` event
- Everything else -> `log` event

### Mochawesome Report Parsing
1. Reads `cypress/reports/html/index.html`
2. Extracts JSON from `<body data-raw="...">` attribute
3. HTML-decodes: `&quot;` -> `"`, `&#x27;` -> `'`, `&amp;` -> `&`, etc.
4. Recursively walks `results[].suites[].tests[]` to flatten into pass/fail arrays

### Port Conflict Auto-Resolution (Windows)
```javascript
// On EADDRINUSE:
powershell -Command "Get-NetTCPConnection -LocalPort <port> | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"
// Then retry after 500ms
```

### Client Disconnect Handling
```javascript
req.on('close', () => {
  if (child.exitCode === null) child.kill();
});
```

### Auto-Pruning
```javascript
function pruneRunHistory(keep) {
  // Sorts files newest-first (timestamp-based filenames)
  // Deletes all beyond the keep limit
}
// Called after each run with keep=10
```

### CORS
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
OPTIONS -> 204 (preflight)
```

---

## 10. TABS Data Architecture

### Structure
```javascript
const TABS = [
  {
    id: 'orders',                    // unique identifier (used in localStorage keys)
    label: 'Orders',                 // tab display label
    num: '01',                       // module number prefix
    files: [{
      name: '01-orders/orders.cy.js',                            // display name
      spec: 'cypress/e2e/customer-api/01-orders/orders.cy.js',   // full Cypress spec path
      tests: [
        { title: 'Human-readable test description', db: false },
        { title: 'Test with DB verification', db: true },
      ]
    }]
  },
  // ... more modules
];
```

### ID Conventions
- Tab ID: `tabId` (e.g., `orders`, `customers`)
- Accordion ID: `{tabId}-f{fileIndex}` (e.g., `orders-f0`)
- Status key: `status:{tabId}-f{fileIndex}-t{testIndex}`
- Run button ID: `runbtn-headed-{accId}`, `runbtn-headless-{accId}`

---

## 11. Title Matching (Report -> Dashboard)

### Problem
Mochawesome reports include full suite chain in titles:
`"Customer API Orders Test 1: Return a paginated list of orders"`

But TABS only stores the `it()` block text:
`"Return a paginated list of orders"`

### Solution: `extractTestCore(title)`
```javascript
function extractTestCore(title) {
  const s = (title || '');
  const m = s.match(/Test\s+\d+:\s*(.*)/i);
  return (m ? m[1] : s).trim().toLowerCase();
}
```

### Matching Algorithm (`applyReportToRows`)
Three-way fuzzy match (any one triggers a match):
1. Exact: `reportCore === tabCore`
2. Report contains tab: `reportCore.includes(tabCore)`
3. Tab contains report: `tabCore.includes(reportCore)`

---

## 12. Toast Notifications

### Behavior
- Top-right corner, fixed position
- Multiple toasts stack vertically (`flex-direction: column; gap: 8px`)
- Auto-dismiss after 3 seconds

### Types
| Type    | BG        | Text      | Border    |
|---------|-----------|-----------|-----------|
| success | `#1a3a2a` | `#4ade80` | `#2a5a3a` |
| error   | `#3a1a1a` | `#f87171` | `#5a2020` |
| info    | `#222540` | `#6c7bf0` | `#353860` |

### Animation
- Entry: slide from right (`translateX(40px)` -> 0) over 0.3s
- Exit: fade up (`translateY(-10px)` + opacity 0) over 0.3s, starts at 2.7s

---

## 13. UX Details

- **Modal close**: Click outside overlay OR click Close button (no Escape key handler)
- **Accordion toggle**: Click header; run buttons use `event.stopPropagation()`
- **Auto-scroll**: Log body scrolls to bottom on each append
- **Button state restoration**: Temporary pass/fail state reverts after 5 seconds
- **Concurrent run prevention**: Global `runningSource` check; error toast if run in progress
- **Report selection**: Checkbox in card corner; `event.stopPropagation()` prevents card open

---

## 14. Sync System (sync-test-cases.js)

### Purpose
Scans `*.cy.js` files on disk and syncs the HTML test case definitions.

### How It Works
1. Scans all `*.cy.js` files under `cypress/e2e/customer-api/`
2. Extracts `it('...')` titles via regex: `/\bit\s*\(\s*(['"\`])([\s\S]*?)\1\s*,/g`
3. Appends new test rows for any NEW `it()` blocks found
4. Creates full accordion sections for brand-new files
5. Respects `data-sync-locked` attribute (skips locked sections)
6. Updates all badge counts and totals
7. Idempotent: no file write if no changes

### Triggering
- CLI: `node cypress/docs/sync-test-cases.js`
- Dashboard: Sync button -> `GET /sync` -> server executes the script

---

## How to Replicate for Another Project

### Step 1: Copy Files
Copy these 3 files to your project's `cypress/docs/` folder:
- `TEST_CASES.html` — the dashboard
- `sync-server.js` — the backend server
- `sync-test-cases.js` — the sync utility

### Step 2: Update TABS Array
Replace the `TABS` array in `TEST_CASES.html` with your project's test modules:
```javascript
const TABS = [
  {
    id: 'your-module',
    label: 'Your Module',
    num: '01',
    files: [{
      name: '01-your-module/yourTests.cy.js',
      spec: 'cypress/e2e/your-project/01-your-module/yourTests.cy.js',
      tests: [
        { title: 'Your test description from it() block', db: false },
      ]
    }]
  },
];
```

### Step 3: Update Server Paths
In `sync-server.js`, update:
- `ROOT` — path to your project root
- `REPORT_HTML` — path to your mochawesome HTML report
- `SYNC_SCRIPT` — path to your sync script
- Port conflict resolution command (if not Windows)

### Step 4: Update Title & Branding
In `TEST_CASES.html`:
- Change the `<title>` and `<h1>` text
- Update footer text

### Step 5: Add npm Script
```json
{
  "scripts": {
    "sync-server": "node cypress/docs/sync-server.js"
  }
}
```

### Step 6: Ensure Mochawesome Reporter
In `cypress.config.js`:
```javascript
reporter: 'cypress-mochawesome-reporter',
reporterOptions: {
  reportDir: 'cypress/reports/html',
  overwrite: true,
  html: true,
  json: false
}
```

---

## Dependencies

| Dependency               | Type    | Purpose                    |
|--------------------------|---------|----------------------------|
| Node.js                  | Runtime | Server execution           |
| Cypress                  | Dev dep | Test runner                |
| cypress-mochawesome-reporter | Dev dep | HTML report generation |
| jsPDF 2.5.2             | CDN     | PDF export                 |
| Browser localStorage     | Built-in| Status persistence         |

No other npm packages required for the dashboard itself.
