#!/usr/bin/env node
/**
 * sync-test-cases.js
 *
 * Automatically keeps TEST_CASES.html in sync with the Cypress test suite.
 *
 * What it does:
 *   • Scans all *.cy.js files under cypress/e2e/customer-api/
 *   • For existing files already in the HTML → appends rows for any NEW it() blocks
 *   • For brand-new files not yet in the HTML → creates a new accordion section
 *   • Updates all count badges and header stats
 *   • Never removes or overwrites existing rows (preserves your descriptions)
 *
 * Usage:
 *   node cypress/docs/sync-test-cases.js
 *   npm run sync-docs
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────────────────────
const ROOT      = path.join(__dirname, '..', '..');
const HTML_FILE = path.join(__dirname, 'TEST_CASES.html');
const E2E_DIR   = path.join(ROOT, 'cypress', 'e2e');

// ── Tab → folder mapping (order must match the HTML) ────────────────────────
const TABS = [
  { id: 'tab1',  folder: 'customer-api/01-orders'              },
  { id: 'tab2',  folder: 'customer-api/02-customers'           },
  { id: 'tab3',  folder: 'customer-api/03-invoices'            },
  { id: 'tab4',  folder: 'customer-api/04-payments'            },
  { id: 'tab5',  folder: 'customer-api/05-subscriptions'       },
  { id: 'tab6',  folder: 'customer-api/06-deliveries'          },
  { id: 'tab7',  folder: 'customer-api/07-draft-orders'        },
  { id: 'tab8',  folder: 'customer-api/08-transactions'        },
  { id: 'tab9',  folder: 'customer-api/09-recurring-payments'  },
  { id: 'tab10', folder: 'customer-api/10-product-tracking'    },
  { id: 'tab11', folder: 'customer-api/11-product-variants'    },
  { id: 'tab12', folder: 'customer-api/12-retailers'           },
  { id: 'tab13', folder: 'customer-api/13-vouchers'            },
  { id: 'tab14', folder: 'customer-api/14-css'                 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extract all it('…') titles from a test file (handles ', ", ` delimiters). */
function extractItTitles(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const re  = /\bit\s*\(\s*(['"`])([\s\S]*?)\1\s*,/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) out.push(m[2].trim());
  return out;
}

/** Escape HTML special characters. */
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Build a single <tr> for a new (auto-synced) test case. */
function makeRow(num, title, statusKey) {
  return `            <tr><td class="num">${num}</td><td class="testcase">${esc(title)}</td>` +
    `<td class="verify">—</td><td><span class="db-no">No</span></td>` +
    `<td><span class="status-badge not-run" onclick="cycleStatus(this,'${statusKey}')">Not Run</span></td></tr>`;
}

/** Build a complete accordion section for a brand-new file. */
function makeAccSection(fileName, specPath, titles, tabId, fileIndex) {
  const n     = titles.length;
  const label = `${n} test${n !== 1 ? 's' : ''}`;
  const rows  = titles
    .map((t, i) => makeRow(i + 1, t, `${tabId}-f${fileIndex}-${i + 1}`))
    .join('\n');

  return (
    `\n      <div class="acc-section" data-file="${fileName}" data-spec="${specPath}">\n` +
    `        <div class="acc-header" onclick="toggleAcc(this)">\n` +
    `          <span class="acc-arrow">▶</span>\n` +
    `          <span class="acc-filename">${fileName}</span>\n` +
    `          <span class="acc-count">${label}</span>\n` +
    `          <button class="btn-run" onclick="runInCypress(event,this,'${specPath}')">▶ Run in Cypress</button>\n` +
    `        </div>\n` +
    `        <div class="acc-body">\n` +
    `          <table class="sheet"><thead><tr><th>#</th><th>Test Case</th><th>What is Verified</th><th>DB Verified</th><th>Last Run Status</th></tr></thead>\n` +
    `          <tbody>\n` +
    rows + '\n' +
    `          </tbody></table>\n` +
    `        </div>\n` +
    `      </div>`
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

function sync() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error(`❌ Cannot find ${HTML_FILE}`);
    process.exit(1);
  }

  let html    = fs.readFileSync(HTML_FILE, 'utf8');
  let changed = false;
  let added   = 0;

  for (const tab of TABS) {
    const folderPath = path.join(E2E_DIR, tab.folder);
    if (!fs.existsSync(folderPath)) continue;

    // All .cy.js files in this folder, alphabetically sorted
    const files = fs.readdirSync(folderPath)
      .filter(f => f.endsWith('.cy.js'))
      .sort();

    // Collect filenames already present in this tab's accordion
    const accOpen  = `id="acc-${tab.id}"`;
    const accClose = `<!-- /acc-${tab.id} -->`;
    const openIdx  = html.indexOf(accOpen);
    const closeIdx = html.indexOf(accClose);

    if (openIdx === -1 || closeIdx === -1) {
      console.warn(`  ⚠  Could not locate accordion for ${tab.id} — skipping`);
      continue;
    }

    const tabSlice = html.slice(openIdx, closeIdx);

    // All file names already in this tab (in order)
    const existingFiles = [];
    const dfRe = /data-file="([^"]+)"/g;
    let dfm;
    while ((dfm = dfRe.exec(tabSlice)) !== null) existingFiles.push(dfm[1]);

    for (const fileName of files) {
      const filePath = path.join(folderPath, fileName);
      const specPath = `cypress/e2e/${tab.folder}/${fileName}`;
      const titles   = extractItTitles(filePath);

      const existIdx = existingFiles.indexOf(fileName);

      // ── Case A: new file not yet in the HTML ──────────────────────────────
      if (existIdx === -1) {
        const newFileIdx = existingFiles.length + 1;
        existingFiles.push(fileName);

        const newSection = makeAccSection(fileName, specPath, titles, tab.id, newFileIdx);

        // Insert just before  <!-- /acc-tabN -->
        html    = html.slice(0, closeIdx) + newSection + '\n\n    ' + html.slice(closeIdx);
        changed = true;
        added  += titles.length;

        console.log(`  + New file: ${tab.folder}/${fileName}  (${titles.length} tests)`);
        continue;
      }

      // ── Case B: file exists — check for new it() blocks ──────────────────
      const sectionAnchor = `data-file="${fileName}"`;
      const secStart = html.indexOf(sectionAnchor);
      if (secStart === -1) { console.warn(`  ⚠  Cannot find section for ${fileName}`); continue; }

      // If the section is locked, skip auto-sync for this file
      const sectionTagEnd = html.indexOf('>', secStart);
      const sectionTag    = html.slice(secStart - 10, sectionTagEnd);
      if (sectionTag.includes('data-sync-locked')) {
        const chunk       = html.slice(secStart, html.indexOf('</tbody>', secStart));
        const lockedCount = (chunk.match(/<td class="num">\d+<\/td>/g) || []).length;
        console.log(`  🔒 ${fileName}: ${lockedCount} tests — locked (sync skipped)`);
        continue;
      }

      // Find this section's </tbody>
      const tbodyClose = html.indexOf('</tbody>', secStart);
      if (tbodyClose === -1) { console.warn(`  ⚠  Cannot find </tbody> for ${fileName}`); continue; }

      // Count existing rows
      const sectionChunk  = html.slice(secStart, tbodyClose);
      const existingCount = (sectionChunk.match(/<td class="num">\d+<\/td>/g) || []).length;
      const newCount      = titles.length;

      if (newCount > existingCount) {
        const toAdd     = titles.slice(existingCount);
        const fileIdx   = existIdx + 1;
        const newRows   = toAdd.map((t, i) => {
          const rowNum = existingCount + i + 1;
          return makeRow(rowNum, t, `${tab.id}-f${fileIdx}-${rowNum}`);
        }).join('\n');

        // Insert before </tbody>
        html    = html.slice(0, tbodyClose) + newRows + '\n          ' + html.slice(tbodyClose);
        changed = true;
        added  += toAdd.length;

        // Update acc-count badge for this section
        const oldBadge = `<span class="acc-count">${existingCount} test${existingCount !== 1 ? 's' : ''}</span>`;
        const newBadge = `<span class="acc-count">${newCount} test${newCount !== 1 ? 's' : ''}</span>`;
        const badgeFrom = html.indexOf(oldBadge, html.indexOf(sectionAnchor));
        if (badgeFrom !== -1) {
          html = html.slice(0, badgeFrom) + newBadge + html.slice(badgeFrom + oldBadge.length);
        }

        console.log(`  + ${fileName}: +${toAdd.length} new test${toAdd.length > 1 ? 's' : ''} (${existingCount} → ${newCount})`);
      } else {
        const status = newCount < existingCount
          ? `${existingCount} rows, ${newCount} it() blocks (extra rows preserved)`
          : `${existingCount} tests — up to date`;
        console.log(`  ✓ ${fileName}: ${status}`);
      }
    }
  }

  // ── Update header stats ───────────────────────────────────────────────────
  const totalTests = (html.match(/<td class="num">\d+<\/td>/g) || []).length;
  const totalFiles = (html.match(/class="acc-section"/g) || []).length;

  html = html.replace(
    /<div class="num" id="total-count">\d+<\/div>/,
    `<div class="num" id="total-count">${totalTests}</div>`
  );

  html = html.replace(
    /(<div class="stat-box"><div class="num">)\d+(<\/div><div class="lbl">Test Files<\/div><\/div>)/,
    `$1${totalFiles}$2`
  );

  html = html.replace(
    /<strong>\d+ test files<\/strong>/,
    `<strong>${totalFiles} test files</strong>`
  );
  html = html.replace(
    /(<strong id="footer-total">)\d+(<\/strong>)/,
    `$1${totalTests}$2`
  );

  // Per-tab badge counts
  for (const tab of TABS) {
    const aOpen  = html.indexOf(`id="acc-${tab.id}"`);
    const aClose = html.indexOf(`<!-- /acc-${tab.id} -->`);
    if (aOpen === -1 || aClose === -1) continue;

    const slice    = html.slice(aOpen, aClose);
    const tabCount = (slice.match(/<td class="num">\d+<\/td>/g) || []).length;

    html = html.replace(
      new RegExp(`(<span class="badge" id="badge-${tab.id}">)\\d+(<\\/span>)`),
      `$1${tabCount}$2`
    );
  }

  // ── Write file ────────────────────────────────────────────────────────────
  const original = fs.readFileSync(HTML_FILE, 'utf8');
  if (html !== original) {
    fs.writeFileSync(HTML_FILE, html, 'utf8');
    if (added > 0) {
      console.log(`\n✅  TEST_CASES.html updated — ${added} new test case(s) added`);
    } else {
      console.log('\n✅  TEST_CASES.html updated — counts corrected');
    }
  } else {
    console.log('\n✅  TEST_CASES.html is already up to date — no changes needed');
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────
console.log('🔄  Syncing TEST_CASES.html with Cypress test files…\n');
try {
  sync();
} catch (err) {
  console.error('❌  Sync failed:', err.message);
  console.error(err.stack);
  process.exit(1);
}
