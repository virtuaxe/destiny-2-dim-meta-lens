/**
 * Verifies bulk tagging drives DIM's own UI correctly: for each matched weapon
 * it opens the item popup, fires the documented Shift+<digit> tag shortcut, and
 * closes the popup -- writing nothing to storage directly.
 *
 * We simulate DIM: clicking a tile opens a fake .item-popup; a keydown of
 * Shift+3 while the popup is open records a "Junk" tag against the item shown;
 * Escape closes the popup. Then we assert every matched weapon got tagged and
 * non-matches did not.
 */
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const read = (f) => readFile(new URL(`../${f}`, import.meta.url), 'utf8');

const shell = `<!doctype html><html><head></head><body>
  <div class="store-row store-header"><div class="store-cell"><div>Vault</div></div></div>
  <div class="store-row"><div class="store-cell">
    <div class="sub-bucket" aria-label="Kinetic Weapons" id="bucket"></div>
  </div></div>
</body></html>`;

const dom = new JSDOM(shell, { pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;
const doc = window.document;
window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
window.Element.prototype.scrollIntoView = function () {};

// --- populate: a few ranked pulses, mix of ranks so a filter splits them ---
const bucket = doc.getElementById('bucket');
const items = [
  { id: 'a', name: 'Mint Retrograde' }, // cat #1  -> top tier
  { id: 'b', name: 'Cold Denial' }, // low/none
  { id: 'c', name: 'Autumn Wind' },
  { id: 'd', name: 'Nightshade' },
];
for (const it of items) {
  const wrap = doc.createElement('div');
  wrap.className = 'item-drag-container';
  wrap.innerHTML =
    `<div id="${it.id}" title="${it.name}\nPulse Rifle" class="item">` +
    `<div class="SLO2oppG"><div title="Void"></div><span class="COfeaEwS">550</span></div>` +
    `</div>`;
  bucket.appendChild(wrap);
}

// --- fake DIM tagging behaviour -------------------------------------------
const applied = {}; // itemId -> tag label
let currentPopupItem = null;

doc.addEventListener('click', (e) => {
  const tile = e.target.closest?.('.item');
  if (!tile) return;
  // Open a popup that names the item.
  currentPopupItem = tile.id;
  if (!doc.querySelector('.item-popup')) {
    const p = doc.createElement('div');
    p.className = 'item-popup';
    doc.body.appendChild(p);
  }
});

doc.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    doc.querySelector('.item-popup')?.remove();
    currentPopupItem = null;
    return;
  }
  // DIM's Junk shortcut: Shift+3, only meaningful with a popup open.
  if (e.shiftKey && e.key === '3' && doc.querySelector('.item-popup') && currentPopupItem) {
    applied[currentPopupItem] = 'Junk';
  }
});

for (const f of ['ranks.js', 'exotics.js', 'tiers.js', 'content.js', 'panel.js']) window.eval(await read(f));
const tick = (ms = 120) => new Promise((r) => setTimeout(r, ms));
await tick(200);

const CORE = window.LGGCore;
let pass = 0, fail = 0;
const check = (label, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? `  -- ${detail}` : ''}`);
  cond ? pass++ : fail++;
};

check('all four weapons indexed', CORE.total() === 4, `${CORE.total()}`);

// Filter to the "worst": not top 25 in category. This should exclude Mint
// Retrograde (cat #1) and include the lower-ranked ones.
CORE.reset();
const worstCount = CORE.setFilter({ quality: 'belowTop25' });
const worstNames = new Set(CORE.results('category').map((m) => m.name));
console.log(`worst filter -> ${worstCount}: ${[...worstNames].join(', ')}`);
check('filter selected a subset', worstCount > 0 && worstCount < 4, `${worstCount}`);
check('top-tier Mint Retrograde is NOT in the worst set', !worstNames.has('Mint Retrograde'));

// Tag the matches as Junk.
const summary = await CORE.tagMatching('junk', () => {});
console.log('tag summary:', summary);
console.log('applied tags:', applied);

check('tagMatching reports tagging every match', summary.done === worstCount, `${summary.done}/${worstCount}`);
check('no failures', summary.failed === 0, `${summary.failed}`);

// The right items, and ONLY those, received the Junk tag.
const taggedIds = Object.keys(applied);
const matchedIds = CORE.results('category').map((m) => m.el.id);
check(
  'exactly the matched weapons were tagged',
  taggedIds.length === matchedIds.length && matchedIds.every((id) => applied[id] === 'Junk'),
  `tagged [${taggedIds}] vs matched [${matchedIds}]`
);
check('the top-tier weapon (a) was NOT tagged', !applied['a']);
check('no item popup left open afterwards', !doc.querySelector('.item-popup'));

// Cancellation path.
CORE.reset();
CORE.setFilter({ slot: 'Kinetic' });
const p = CORE.tagMatching('keep', () => CORE.cancelTagging()); // cancel on first progress
const cancelledSummary = await p;
console.log('cancelled summary:', cancelledSummary);
check('cancel stops the run early', cancelledSummary.done < cancelledSummary.total || cancelledSummary.aborted);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
