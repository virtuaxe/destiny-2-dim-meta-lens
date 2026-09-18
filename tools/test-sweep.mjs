/**
 * Verifies CORE.sweep() defeats DIM's list virtualization: tiles that only
 * enter the DOM when scrolled near the viewport must all be indexed after a
 * sweep, and the user's original scroll position must be restored.
 *
 * jsdom has no layout or scrolling, so we simulate a virtualized list: a scroll
 * container with a tall spacer, whose scrollTop setter reveals the tiles whose
 * virtual position is now within the viewport window.
 */
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const read = (f) => readFile(new URL(`../${f}`, import.meta.url), 'utf8');

const shell = `<!doctype html><html><head></head><body>
  <div class="store-row store-header"><div class="store-cell"><div>Vault</div></div></div>
  <div class="store-row"><div class="store-cell">
    <div id="scroller"><div class="sub-bucket" aria-label="Kinetic Weapons" id="bucket"></div></div>
  </div></div>
</body></html>`;

const dom = new JSDOM(shell, { pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;
const doc = window.document;
window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
window.Element.prototype.scrollIntoView = function () {};

// --- build a fake virtualized list ---------------------------------------
const TOTAL = 300; // weapons in the "vault"
const VIEWPORT = 800;
const ROW = 50; // virtual px per tile
const CONTENT_H = TOTAL * ROW;

const weapons = [];
for (let i = 0; i < TOTAL; i++) {
  // Cycle through a few real ranked names so ranks/elements resolve.
  const names = ['Mint Retrograde', 'Nightshade', 'Autumn Wind', 'Blast Furnace', 'Cold Denial'];
  weapons.push({ id: `w${i}`, name: names[i % names.length], top: i * ROW });
}

const scroller = doc.getElementById('scroller');
const bucket = doc.getElementById('bucket');

// jsdom lets us define layout metrics.
Object.defineProperty(scroller, 'clientHeight', { value: VIEWPORT, configurable: true });
Object.defineProperty(scroller, 'scrollHeight', { value: CONTENT_H, configurable: true });
scroller.style.overflowY = 'scroll';
// getComputedStyle in jsdom reads inline style, so overflowY:scroll is visible.

let _top = 0;
Object.defineProperty(scroller, 'scrollTop', {
  configurable: true,
  get: () => _top,
  set: (v) => {
    _top = Math.max(0, Math.min(v, CONTENT_H - VIEWPORT));
    renderWindow();
  },
});

// DIM's inventory view renders a tile once it has been scrolled near, and keeps
// it in the DOM thereafter (this matches the user's report: scroll to the bottom
// once and every element shows up, then stays). So tiles are added when their
// virtual position first enters the window and are NOT removed afterwards.
function renderWindow() {
  const margin = ROW * 2;
  const hi = _top + VIEWPORT + margin;
  for (const w of weapons) {
    if (w.top > hi) continue;
    if (doc.getElementById(w.id)) continue;
    const wrap = doc.createElement('div');
    wrap.className = 'item-drag-container';
    wrap.innerHTML =
      `<div id="${w.id}" title="${w.name}\nPulse Rifle" class="item">` +
      `<div class="SLO2oppG"><div title="Void"></div><span class="COfeaEwS">550</span></div>` +
      `</div>`;
    bucket.appendChild(wrap);
  }
}
renderWindow(); // initial top-of-list window

for (const f of ['ranks.js', 'exotics.js', 'tiers.js', 'content.js', 'panel.js']) window.eval(await read(f));
const tick = (ms = 120) => new Promise((r) => setTimeout(r, ms));
await tick(150);

const CORE = window.LGGCore;
let pass = 0, fail = 0;
const check = (label, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? `  -- ${detail}` : ''}`);
  cond ? pass++ : fail++;
};

// Before sweeping: only the first viewport-worth of tiles are indexed.
const before = CORE.total();
console.log(`indexed before sweep: ${before} (of ${TOTAL} total)`);
check('only a partial view is indexed before sweep', before > 0 && before < TOTAL, `${before}`);

// Pretend the user had scrolled partway down, to test restoration.
scroller.scrollTop = 3000;
await tick(60);
const userPos = scroller.scrollTop;

// Sweep.
let lastProgress = 0;
const after = await CORE.sweep((frac) => { lastProgress = frac; });
await tick(60);

console.log(`indexed after sweep:  ${after} (of ${TOTAL} total)`);
check('sweep indexes (nearly) the whole inventory', after >= TOTAL * 0.98, `${after}/${TOTAL}`);
check('progress reached 100%', lastProgress === 1, `${lastProgress}`);
check('scroll position restored after sweep', scroller.scrollTop === userPos, `${scroller.scrollTop} vs ${userPos}`);

// The whole inventory is now filterable, not just the initial view.
CORE.reset();
const voidHits = CORE.setFilter({ element: 'Void' });
check('all swept tiles are filterable by element', voidHits >= TOTAL * 0.98, `${voidHits} void`);

const facets = CORE.facets();
check('facets reflect the full inventory', facets.elements.has('Void'));

// --- panel auto-scan lifecycle -------------------------------------------
// Spy on the sweep so we can count how often the PANEL triggers it. We stub the
// body here (the real sweep is exercised above) and resolve immediately, so the
// panel's post-scan state -- tooltip, sweptOnce guard -- is observable within a
// tick rather than after a multi-second scroll.
let sweepCalls = 0;
const realSweep = CORE.sweep.bind(CORE);
CORE.sweep = async (onProgress) => {
  sweepCalls += 1;
  if (onProgress) onProgress(1);
  return CORE.total();
};

const launcher = doc.querySelector('.lggf-launcher');
const panel = doc.querySelector('.lggf-panel');
const scanBtn = () => panel.querySelector('.lggf-scan');

// First open: should scan automatically exactly once.
launcher.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(400);
check('first open triggers exactly one auto-scan', sweepCalls === 1, `${sweepCalls}`);
check('scan button shows a "last scanned" time after scanning', /last scanned/i.test(scanBtn().title), scanBtn().title);

// Close and reopen: must NOT auto-scan again.
launcher.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); // close
await tick(60);
launcher.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); // reopen
await tick(300);
check('reopening does NOT auto-scan again', sweepCalls === 1, `${sweepCalls}`);
check('tooltip still reports the previous scan time', /last scanned/i.test(scanBtn().title), scanBtn().title);

// Manual "Scan all" still works and re-scans on demand.
scanBtn().dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(400);
check('clicking Scan all forces a re-scan', sweepCalls === 2, `${sweepCalls}`);

CORE.sweep = realSweep; // restore

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
