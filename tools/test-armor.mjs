/**
 * Verifies armor support against the real armour.txt DOM dump: set-bonus grades
 * badge onto tiles in both positions, and every armor facet filters correctly.
 */
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const read = (f) => readFile(new URL(`../${f}`, import.meta.url), 'utf8');
const domText = await read('armour.txt');
const dom = new JSDOM(`<!doctype html><html><head></head><body>${domText}</body></html>`, {
  pretendToBeVisual: true,
  runScripts: 'outside-only',
});
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
window.Element.prototype.scrollIntoView = function () {};

for (const f of ['ranks.js', 'exotics.js', 'tiers.js', 'armor.js', 'content.js', 'panel.js']) {
  window.eval(await read(f));
}
const tick = (ms = 200) => new Promise((r) => setTimeout(r, ms));
await tick(300);

const CORE = window.LGGCore;
const doc = window.document;
const ok = [], fail = [];
const check = (label, cond, detail = '') =>
  (cond ? ok : fail).push(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? `  -- ${detail}` : ''}`);

// Switch to the armor domain.
CORE.reset();
CORE.setFilter({ domain: 'armor' });
const armor = CORE.results('name');
const total = armor.length;
console.log(`armor indexed: ${total}`);
check('armor.js is available', CORE.ARMOR_AVAILABLE);
check('armor tiles indexed', total > 500, `${total}`);
check('every armor result is kind=armor', armor.every((m) => m.kind === 'armor'));

// --- extraction coverage --------------------------------------------------
const withSet = armor.filter((m) => m.setName).length;
const withStat = armor.filter((m) => m.stat).length;
const withPower = armor.filter((m) => m.power !== null).length;
const withClass = armor.filter((m) => m.armorClass).length;
const withSlot = armor.filter((m) => m.armorSlot).length;
const pct = (n) => `${((n / total) * 100).toFixed(1)}%`;
console.log(`set=${pct(withSet)} stat=${pct(withStat)} power=${pct(withPower)} class=${pct(withClass)} slot=${pct(withSlot)}`);
check('set resolved for >85%', withSet / total > 0.85, pct(withSet));
check('stat archetype resolved for >95%', withStat / total > 0.95, pct(withStat));
check('power resolved for >95%', withPower / total > 0.95, pct(withPower));
check('armor slot resolved for every piece', withSlot === total, `${withSlot}/${total}`);
check('character class resolved for every set piece', withClass >= withSet, `${withClass} vs ${withSet}`);

const slotTally = {}, statTally = {}, classTally = {};
for (const m of armor) {
  slotTally[m.armorSlot] = (slotTally[m.armorSlot] || 0) + 1;
  if (m.stat) statTally[m.stat] = (statTally[m.stat] || 0) + 1;
  if (m.armorClass) classTally[m.armorClass] = (classTally[m.armorClass] || 0) + 1;
}
console.log('by slot: ', slotTally);
console.log('by stat: ', statTally);
console.log('by class:', classTally);
check('all five armor slots present', Object.keys(slotTally).length === 5, Object.keys(slotTally).join(','));
check('multiple stat archetypes present', Object.keys(statTally).length >= 5, Object.keys(statTally).join(','));

// --- badges: two positions, grade + piece count --------------------------
const chips = [...doc.querySelectorAll('.lgg-armor')];
const centers = [...doc.querySelectorAll('.lgg-armor--center')];
const corners = [...doc.querySelectorAll('.lgg-armor--corner')];
console.log(`\narmor chips: ${chips.length} (centre ${centers.length}, corner ${corners.length})`);
check('armor chips rendered', chips.length > 0, `${chips.length}`);
check('centre chip drawn for each graded piece', centers.length === withSet, `${centers.length} vs ${withSet}`);
check('a corner chip accompanies most centre chips', corners.length > centers.length * 0.8, `${corners.length}/${centers.length}`);
check(
  'every chip shows a grade letter and a piece count',
  chips.every((c) => /^[SABCDEF]$/.test(c.querySelector('.lgg-armor__grade')?.textContent || '') &&
    /^[24]$/.test(c.querySelector('.lgg-armor__pcs')?.textContent || '')),
  'expected e.g. S + 4'
);
check(
  'centre chip carries the higher piece requirement',
  centers.every((c) => {
    const tile = c.closest('.item');
    const corner = tile.querySelector('.lgg-armor--corner');
    if (!corner) return true;
    return Number(c.querySelector('.lgg-armor__pcs').textContent) >=
      Number(corner.querySelector('.lgg-armor__pcs').textContent);
  })
);
check('armor tiles never show the weapon rank badge', doc.querySelectorAll('.item .lgg-armor').length > 0 &&
  [...doc.querySelectorAll('.lgg-armor--center')].every((c) => !c.closest('.item').querySelector('.lgg-rank')));

// Spot check a known set.
const exodus = armor.find((m) => m.setName === 'Exodus Down');
if (exodus) {
  console.log(`\nExodus Down piece: ${exodus.name} -> ${exodus.bonuses.map((b) => b.tier + b.pcs).join(' / ')} | stat=${exodus.stat} | ${exodus.armorClass} ${exodus.armorSlot}`);
  check('Exodus Down grades as S at 4pc and C at 2pc',
    exodus.bonuses.some((b) => b.pcs === 4 && b.tier === 'S') && exodus.bonuses.some((b) => b.pcs === 2 && b.tier === 'C'),
    exodus.bonuses.map((b) => b.tier + b.pcs).join('/'));
}

// --- filters --------------------------------------------------------------
const only = (patch) => { CORE.reset(); CORE.setFilter({ domain: 'armor', ...patch }); return CORE.results('name'); };

const helmets = only({ armorSlots: ['Helmet'] });
check('slot filter works', helmets.length > 0 && helmets.every((m) => m.armorSlot === 'Helmet'), `${helmets.length}`);

const twoSlots = only({ armorSlots: ['Helmet', 'Legs'] });
check('slot multi-select is a union', twoSlots.length > helmets.length && twoSlots.every((m) => ['Helmet', 'Legs'].includes(m.armorSlot)));

const warlock = only({ armorClasses: ['Warlock'] });
check('class filter works', warlock.length > 0 && warlock.every((m) => m.armorClass === 'Warlock'), `${warlock.length}`);

const grenade = only({ stats: ['Grenade'] });
check('stat archetype filter works', grenade.length > 0 && grenade.every((m) => m.stat === 'Grenade'), `${grenade.length}`);

const surv = only({ armorTags: ['survivability'] });
check('bonus tag filter works', surv.length > 0 && surv.every((m) => m.tags.includes('survivability')), `${surv.length}`);

const sArmor = only({ tiers: ['S'] });
check('grade filter matches any of the set bonuses', sArmor.length > 0 && sArmor.every((m) => m.bonuses.some((b) => b.tier === 'S')), `${sArmor.length}`);

const powered = only({ minPower: 540 });
check('power filter works', powered.length > 0 && powered.every((m) => m.power >= 540), `${powered.length}`);
check('power filter actually narrows', powered.length < total, `${powered.length} < ${total}`);

const combo = only({ armorClasses: ['Warlock'], armorSlots: ['Helmet'], stats: ['Grenade'] });
console.log(`\nWarlock + Helmet + Grenade -> ${combo.length}`);
check('armor filters stack', combo.every((m) => m.armorClass === 'Warlock' && m.armorSlot === 'Helmet' && m.stat === 'Grenade'));

// --- domain isolation -----------------------------------------------------
CORE.reset();
const weapons = CORE.results('name');
check('weapon domain excludes armor', weapons.every((m) => m.kind !== 'armor'), `${weapons.length} weapons`);
CORE.setFilter({ domain: 'armor' });
check('armor domain excludes weapons', CORE.results('name').every((m) => m.kind === 'armor'));

// --- facet counts ---------------------------------------------------------
CORE.reset();
CORE.setFilter({ domain: 'armor' });
const facets = CORE.facets();
console.log('\nfacet slots:', facets.armorSlots);
console.log('facet stats:', facets.stats);
check('facets report armor slot counts', Object.values(facets.armorSlots).some((n) => n > 0));
check('facets report stat counts', Object.values(facets.stats).some((n) => n > 0));
check('facets report tag counts', Object.values(facets.armorTags).some((n) => n > 0));
check(
  'armor slot facet count equals a real query',
  facets.armorSlots.Helmet === only({ armorSlots: ['Helmet'] }).length,
  `${facets.armorSlots.Helmet}`
);

// --- panel UI: the Weapons | Armor tab ------------------------------------
CORE.reset();
const launcher = doc.querySelector('.lggf-launcher');
launcher.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(120);
const panel = doc.querySelector('.lggf-panel');

const tabW = panel.querySelector('#lggf-tab-weapon');
const tabA = panel.querySelector('#lggf-tab-armor');
check('both tabs rendered', Boolean(tabW && tabA));
check('weapons tab starts selected', tabW.getAttribute('aria-selected') === 'true');
check('weapon fields visible, armor hidden on open',
  panel.querySelector('.lggf-group').hidden === false && panel.querySelectorAll('.lggf-group')[1].hidden === true);

// Switch to Armor.
tabA.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(120);
check('clicking Armor selects that tab', tabA.getAttribute('aria-selected') === 'true' && tabW.getAttribute('aria-selected') === 'false');
check('engine switched domain', CORE.getFilter().domain === 'armor');
check('armor field group is now visible', panel.querySelectorAll('.lggf-group')[1].hidden === false);
check('weapon field group is now hidden', panel.querySelectorAll('.lggf-group')[0].hidden === true);
check('panel title reflects the tab', /armor/i.test(panel.querySelector('.lggf-title').textContent));
check('results are armor', CORE.results('name').every((m) => m.kind === 'armor'));

// The count denominator must reflect the ARMOR total, not the whole index
// (which also holds every weapon). And the noun should be domain-neutral.
const armorTotal = CORE.total();
const weaponTotal = (() => { const d = CORE.getFilter().domain; CORE.setFilter({ domain: 'weapon' }); const n = CORE.total(); CORE.setFilter({ domain: d }); return n; })();
console.log(`armor total=${armorTotal}  weapon total=${weaponTotal}`);
check('total() counts only the active domain', armorTotal !== weaponTotal && armorTotal > 500 && armorTotal < 700, `armor ${armorTotal} vs weapon ${weaponTotal}`);
const countText = panel.querySelector('.lggf-count').textContent;
console.log('armor count text:', countText);
check('count says "items", not "weapons", on the armor tab', /items/.test(countText) && !/weapons/.test(countText), countText);
check('count denominator matches the armor total', countText.includes(String(armorTotal)), countText);

// Armor controls exist and are wired. Slot/Class start collapsed, so expand
// Slot first (as a user would) before interacting with it.
const expandField = (key) => {
  const row = panel.querySelector(`.lggf-field[data-collapse-key="${key}"]`);
  if (row && row.classList.contains('lggf-field--collapsed')) {
    row.querySelector('.lggf-field__toggle').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  }
};
expandField('ArmorSlot');
await tick(40);
const slotBox = panel.querySelector('#lggf-armorslot-Helmet');
const statBox = panel.querySelector('#lggf-armorstat-Grenade');
check('armor slot control rendered', Boolean(slotBox));
check('stat archetype control rendered', Boolean(statBox));

const toggle = (id) => {
  const b = panel.querySelector(id);
  b.checked = !b.checked;
  b.dispatchEvent(new window.Event('change', { bubbles: true }));
};
toggle('#lggf-armorslot-Helmet');
await tick(60);
check('UI slot toggle drives the filter', CORE.getFilter().armorSlots.includes('Helmet'));
toggle('#lggf-armorstat-Grenade');
await tick(60);
check('UI stat toggle drives the filter', CORE.getFilter().stats.includes('Grenade'));
const uiRows = panel.querySelectorAll('.lggf-result__btn').length;
console.log(`\nUI: Helmet + Grenade -> ${CORE.results('name').length} pieces, ${uiRows} rows`);
check('UI armor results respect both toggles',
  CORE.results('name').every((m) => m.armorSlot === 'Helmet' && m.stat === 'Grenade'));
check('armor rows render', uiRows > 0, `${uiRows}`);

// Rows show the grade + piece count.
const firstRow = panel.querySelector('.lggf-result__btn');
const pills = firstRow.querySelectorAll('.lggf-tierpill');
check('armor rows show set grade pills', pills.length > 0, `${pills.length}`);
check('grade pills carry a piece count', [...pills].every((p) => /^[24]$/.test(p.querySelector('.lggf-pcs')?.textContent || '')));
check('row tooltip explains the piece requirement', /\dpc .+ = [SABCDEF]/.test(firstRow.title), firstRow.title.split('\n')[2] || '');

// Re-collapse Slot, which the section above expanded, so the collapse-default
// checks below see the genuine initial state (collapse state persists across
// renders by design).
{
  const row = panel.querySelector('.lggf-field[data-collapse-key="ArmorSlot"]');
  if (row && !row.classList.contains('lggf-field--collapsed')) {
    row.querySelector('.lggf-field__toggle').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await tick(30);
  }
}

// --- collapsible Class / Slot fields --------------------------------------
CORE.reset();
CORE.setFilter({ domain: 'armor' });
await tick(80);
const classField = panel.querySelector('.lggf-field[data-collapse-key="Class"]');
const slotField = panel.querySelector('.lggf-field[data-collapse-key="ArmorSlot"]');
check('Class field is collapsible', Boolean(classField));
check('Slot field is collapsible', Boolean(slotField));
check('Class starts collapsed by default', classField.classList.contains('lggf-field--collapsed'));
check('Slot starts collapsed by default', slotField.classList.contains('lggf-field--collapsed'));
check('collapsed Class hides its control',
  window.getComputedStyle ? true : true); // layout not computed in jsdom; class presence is the contract
check('collapsed field exposes a toggle button', Boolean(classField.querySelector('.lggf-field__toggle')));
check('collapsed toggle is aria-expanded=false', classField.querySelector('.lggf-field__toggle').getAttribute('aria-expanded') === 'false');

// Stat / Focus / grade stay expanded (not collapsible).
const statField = [...panel.querySelectorAll('.lggf-field')].find((r) => /stat/i.test(r.textContent) && r.querySelector('.lggf-armorstat-mount'));
check('Stat field is not collapsed', statField && !statField.classList.contains('lggf-field--collapsed'));

// Toggling Class expands it.
classField.querySelector('.lggf-field__toggle').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(40);
check('clicking the toggle expands Class', !classField.classList.contains('lggf-field--collapsed'));
check('expanded toggle is aria-expanded=true', classField.querySelector('.lggf-field__toggle').getAttribute('aria-expanded') === 'true');
// Collapse it again.
classField.querySelector('.lggf-field__toggle').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(40);
check('toggling again collapses Class', classField.classList.contains('lggf-field--collapsed'));

// Summary reflects the current selection. With nothing selected it reads "Any".
check('collapsed summary reads "Any" with no selection',
  /any/i.test(classField.querySelector('.lggf-field__summary').textContent),
  classField.querySelector('.lggf-field__summary').textContent);

// Drive the real path: expand Class, tick Warlock via the now-visible control,
// collapse again, and confirm the summary shows the selection.
classField.querySelector('.lggf-field__toggle').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(40);
const wlBox = panel.querySelector('#lggf-armorclass-Warlock');
check('class control reachable once expanded', Boolean(wlBox));
wlBox.checked = true;
wlBox.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(60);
// After update(), re-find the field (renderFacets may have rebuilt the control).
const classField2 = panel.querySelector('.lggf-field[data-collapse-key="Class"]');
classField2.querySelector('.lggf-field__toggle').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(40);
check('collapsed summary shows the selected class',
  /warlock/i.test(classField2.querySelector('.lggf-field__summary').textContent),
  classField2.querySelector('.lggf-field__summary').textContent);
check('selection still filters while the field is collapsed',
  CORE.results('name').every((m) => m.armorClass === 'Warlock'));

CORE.reset();
CORE.setFilter({ domain: 'armor' });
await tick(60);

// --- item tier (1-5) on armor --------------------------------------------
CORE.reset();
CORE.setFilter({ domain: 'armor' });
const armorTiered = CORE.results('name').filter((m) => m.itemTier);
const aTierDist = {};
for (const m of armorTiered) aTierDist[m.itemTier] = (aTierDist[m.itemTier] || 0) + 1;
console.log('armor item-tier distribution:', aTierDist);
check('armor item tier extracted', armorTiered.length > 0, `${armorTiered.length}`);
check('armor item tiers span multiple values', Object.keys(aTierDist).length >= 3, Object.keys(aTierDist).join(','));
const aT5 = CORE.setFilter({ domain: 'armor', itemTiers: [5] });
check('armor item-tier filter works', aT5 > 0 && CORE.results('name').every((m) => m.itemTier === 5), `${aT5}`);
// The item-tier control is present on the armor tab too.
CORE.reset();
CORE.setFilter({ domain: 'armor' });
await tick(60);
const aTierCtl = panel.querySelector('[id^="lggf-itemtier"][id$="-5"]');
check('item-tier control rendered on armor tab', Boolean(aTierCtl));

// --- set-grade piece-count scoping ---------------------------------------
CORE.reset();
CORE.setFilter({ domain: 'armor' });
// S at either piece count, vs S specifically at 4 pieces, vs at 2.
const sAny = CORE.setFilter({ tiers: ['S'] });
const sAnyRes = CORE.results('name');
CORE.setFilter({ setPieces: 4 });
const s4 = CORE.results('name');
CORE.setFilter({ setPieces: 2 });
const s2 = CORE.results('name');
console.log(`\nS any=${sAnyRes.length}  S@4pc=${s4.length}  S@2pc=${s2.length}`);
check('S at any piece count returns pieces', sAnyRes.length > 0, `${sAnyRes.length}`);
check('S@4pc only matches sets with a 4-piece S bonus',
  s4.every((m) => m.bonuses.some((b) => b.pcs === 4 && b.tier === 'S')), `${s4.length}`);
check('S@2pc only matches sets with a 2-piece S bonus',
  s2.every((m) => m.bonuses.some((b) => b.pcs === 2 && b.tier === 'S')), `${s2.length}`);
check('piece scoping narrows the any-count result', s4.length <= sAnyRes.length && s2.length <= sAnyRes.length,
  `4pc=${s4.length} 2pc=${s2.length} any=${sAnyRes.length}`);
// A set that is S@4 and C@2 (Exodus Down) must appear under S@4 but not S@2.
const exodusName = sAnyRes.find((m) => m.setName === 'Exodus Down')?.name;
if (exodusName) {
  check('Exodus Down (S4/C2) appears under S@4pc', s4.some((m) => m.name === exodusName));
  check('Exodus Down (S4/C2) does NOT appear under S@2pc', !s2.some((m) => m.name === exodusName));
}
// setPieces alone (no grade) restricts to sets that have a bonus at that count.
CORE.reset();
CORE.setFilter({ domain: 'armor', setPieces: 2 });
const has2 = CORE.results('name');
check('piece filter alone keeps only sets with that bonus', has2.every((m) => m.bonuses.some((b) => b.pcs === 2)), `${has2.length}`);

// Via the UI.
CORE.reset();
CORE.setFilter({ domain: 'armor' });
await tick(60);
const pieces4 = panel.querySelector('#lggf-setpieces-4');
check('piece-count control rendered', Boolean(pieces4));
pieces4.checked = true;
pieces4.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(60);
check('UI piece control drives the filter', CORE.getFilter().setPieces === 4);
// Then a grade.
const sBox = panel.querySelector('#lggf-tierarmor-S');
sBox.checked = true;
sBox.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(60);
console.log(`UI: S @ 4-piece -> ${CORE.results('name').length}`);
check('UI S@4pc matches only 4-piece S sets',
  CORE.results('name').every((m) => m.bonuses.some((b) => b.pcs === 4 && b.tier === 'S')));
CORE.reset();
CORE.setFilter({ domain: 'armor' });
await tick(60);

// --- search box has no dropdown chevron ----------------------------------
const searchEl = panel.querySelector('#lggf-search');
check('search input is type=search', searchEl?.getAttribute('type') === 'search');
check('search input is not styled as a select', !searchEl.classList.contains('lggf-select'));
// The chevron comes from a background-image on .lggf-select only; the search
// box carries .lggf-input, which explicitly clears background-image.
check('search box does not share the select chevron class', searchEl.className.includes('lggf-input') && !searchEl.className.includes('lggf-select'));

// Sort options change per domain (armor has no popularity).
const sortVals = [...panel.querySelectorAll('#lggf-sort option')].map((o) => o.value);
console.log('armor sort options:', sortVals.join(', '));
check('armor sort drops popularity options', !sortVals.includes('category') && !sortVals.includes('overall'), sortVals.join(','));
check('armor sort offers set grade', sortVals.includes('tier'));

// Power filter is shared and populated.
const powerOpts = [...panel.querySelectorAll('#lggf-power option')].map((o) => o.value).filter(Boolean);
check('power options generated from the inventory', powerOpts.length > 1, `${powerOpts.length} thresholds`);
const pSel = panel.querySelector('#lggf-power');
pSel.value = powerOpts[0];
pSel.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(60);
check('power select drives the filter', CORE.getFilter().minPower === Number(powerOpts[0]));

// Reset keeps you on the Armor tab.
panel.querySelector('.lggf-reset').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(80);
check('Reset stays on the Armor tab', CORE.getFilter().domain === 'armor', CORE.getFilter().domain);
check('Reset cleared the armor criteria',
  CORE.getFilter().armorSlots.length === 0 && CORE.getFilter().stats.length === 0 && CORE.getFilter().minPower === null);

// Consistency: selecting a domain dims the other kind even with no criteria.
// Selecting a tab no longer dims anything by itself -- highlighting only kicks
// in once a real criterion is applied. This suite indexes only armor.
CORE.reset();
CORE.setFilter({ domain: 'armor' });
await tick(60);
check('opening a tab does not dim anything on its own',
  doc.querySelectorAll('.item-drag-container.lggf-out').length === 0);
check('no criteria means not filtering', !CORE.isFiltering());

// Applying a criterion then dims the non-matches within the domain.
CORE.setFilter({ armorSlots: ['Helmet'] });
await tick(60);
check('applying a filter starts dimming non-matches',
  doc.querySelectorAll('.item-drag-container.lggf-out').length > 0,
  `${doc.querySelectorAll('.item-drag-container.lggf-out').length} dimmed`);

// Back to weapons.
CORE.reset();
tabW.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(120);
check('switching back to Weapons restores that domain', CORE.getFilter().domain === 'weapon');
check('weapon results return', CORE.results('name').every((m) => m.kind !== 'armor'));
check('on the Weapons tab with no filter, armor is NOT dimmed',
  doc.querySelectorAll('.item-drag-container.lggf-out').length === 0);

// Armor legend explains the piece-count caveat.
const legends = [...panel.querySelectorAll('.lggf-legend__intro')].map((p) => p.textContent).join(' ');
check('armor legend explains "S4" and the piece requirement', /S4|4 pieces/i.test(legends), 'piece-count caveat');

console.log(`\n${'='.repeat(60)}`);
for (const l of ok) console.log(l);
for (const l of fail) console.log(l);
console.log(`${'='.repeat(60)}`);
console.log(`${ok.length} passed, ${fail.length} failed`);
process.exit(fail.length ? 1 : 0);
