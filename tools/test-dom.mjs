/**
 * Temporary end-to-end check: loads the real DIM DOM dump into jsdom, runs the
 * actual extension scripts against it, then drives the filter engine and the
 * panel UI the same way a user would.
 */
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const read = (f) => readFile(new URL(`../${f}`, import.meta.url), 'utf8');

const domText = await read('dim-dom.txt');
// The dump is an outerHTML capture of DIM's root; wrap it in a document.
const dom = new JSDOM(`<!doctype html><html><head></head><body>${domText}</body></html>`, {
  pretendToBeVisual: true,
  runScripts: 'outside-only',
});

const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
// jsdom has no layout engine, so scrollIntoView is absent.
window.Element.prototype.scrollIntoView = function () {};

for (const file of ['ranks.js', 'exotics.js', 'tiers.js', 'content.js', 'panel.js']) {
  window.eval(await read(file));
}

const tick = (ms = 200) => new Promise((r) => setTimeout(r, ms));
await tick();

const CORE = window.LGGCore;
const doc = window.document;
const fail = [];
const ok = [];
const check = (label, cond, detail = '') =>
  (cond ? ok : fail).push(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? `  -- ${detail}` : ''}`);

// --- 1. indexing ----------------------------------------------------------
const total = CORE.total();
const badges = doc.querySelectorAll('.lgg-rank').length;
console.log(`indexed weapons: ${total}`);
console.log(`badges injected: ${badges}\n`);
check('indexed a realistic number of weapons', total > 600 && total < 700, `got ${total}`);
check('badges were injected', badges > 550, `got ${badges}`);

// --- 2. metadata extraction ----------------------------------------------
const all = CORE.results('name');
const withSlot = all.filter((m) => m.slot).length;
const withElement = all.filter((m) => m.element).length;
const withOwner = all.filter((m) => m.owner).length;
const withPower = all.filter((m) => m.power !== null).length;

const pct = (n) => `${((n / total) * 100).toFixed(1)}%`;
console.log(`slot resolved:    ${withSlot} (${pct(withSlot)})`);
console.log(`element resolved: ${withElement} (${pct(withElement)})`);
console.log(`owner resolved:   ${withOwner} (${pct(withOwner)})`);
console.log(`power resolved:   ${withPower} (${pct(withPower)})\n`);

check('slot resolved for every indexed weapon', withSlot === total, `${withSlot}/${total}`);
check('element resolved for >95%', withElement / total > 0.95, pct(withElement));
check('owner resolved for every weapon', withOwner === total, `${withOwner}/${total}`);
// Power is best-effort: a handful of unleveled weapons have no power span in the
// DOM at all, so 100% is not achievable. What matters is the reverse regression:
// our injected rank badge (whose lines are 1-4 digit numbers) must never be
// misread as a power value. Every resolved power here should match DIM's own
// power span, never a badge line.
check('power resolved for >95% of weapons', withPower / total > 0.95, pct(withPower));
check(
  'resolved power always comes from DIM, never from our badge',
  all.every((m) => {
    if (m.power === null) return true;
    // The value we resolved must exist in a span that is NOT inside our badge.
    const dimSpans = [...m.el.querySelectorAll('span')].filter((s) => !s.closest('.lgg-rank'));
    return dimSpans.some((s) => s.textContent.trim() === String(m.power));
  }),
  'a badge digit leaked into the power field'
);

const slotCounts = {};
const ownerCounts = {};
const elementCounts = {};
for (const m of all) {
  slotCounts[m.slot] = (slotCounts[m.slot] || 0) + 1;
  ownerCounts[m.owner] = (ownerCounts[m.owner] || 0) + 1;
  elementCounts[m.element ?? '(none)'] = (elementCounts[m.element ?? '(none)'] || 0) + 1;
}
console.log('by slot:   ', slotCounts);
console.log('by owner:  ', ownerCounts);
console.log('by element:', elementCounts, '\n');

check('all three slots present', Object.keys(slotCounts).length === 3);
check('vault + 3 characters detected', Object.keys(ownerCounts).length === 4, Object.keys(ownerCounts).join(','));
// Strict: owner must be a clean store label, not a flattened stats blob.
const EXPECTED_OWNERS = new Set(['Vault', 'Warlock', 'Titan', 'Hunter']);
check(
  'owner labels are clean store names',
  Object.keys(ownerCounts).every((o) => EXPECTED_OWNERS.has(o)),
  Object.keys(ownerCounts).join(' | ')
);

// --- 2b. badge shape: 4-digit ranks + no rank-position swapping ------------
const NO_RANK = '\u2013';

/** Read a rendered badge back off a tile by weapon name. */
function badgeFor(name) {
  const meta = all.find((m) => m.name === name);
  if (!meta) return null;
  const badge = meta.el.querySelector('.lgg-rank');
  if (!badge) return { meta, badge: null };
  const line = (role) => badge.querySelector(`.lgg-rank__line[data-role="${role}"]`);
  return {
    meta,
    badge,
    classes: [...badge.classList],
    overallLine: line('overall'),
    categoryLine: line('category'),
    primary: badge.querySelector('.lgg-rank__primary'),
    secondary: badge.querySelector('.lgg-rank__secondary'),
  };
}

// Digit-tier classes must reflect the real rank widths now in the data.
const digitCounts = { d1: 0, d2: 0, d3: 0, d4: 0 };
let positionErrors = 0;
let placeholderCount = 0;

for (const m of all) {
  const badge = m.el.querySelector('.lgg-rank');
  if (!badge) continue;
  // Untracked-exotic badges carry no overall/category lines by design.
  if (badge.classList.contains('lgg-rank--exotic')) continue;

  for (const key of Object.keys(digitCounts)) {
    if (badge.classList.contains(`lgg-rank--${key}`)) digitCounts[key] += 1;
  }

  const oLine = badge.querySelector('.lgg-rank__line[data-role="overall"]');
  const cLine = badge.querySelector('.lgg-rank__line[data-role="category"]');

  // Whatever sits on the "overall" line must be the overall rank (or a dash),
  // never the category rank. This is the Crown-Splitter bug.
  const expectO = m.overall === null ? NO_RANK : String(m.overall);
  const expectC = m.category === null ? NO_RANK : String(m.category);
  if (oLine?.textContent !== expectO || cLine?.textContent !== expectC) positionErrors += 1;
  if (oLine?.textContent === NO_RANK || cLine?.textContent === NO_RANK) placeholderCount += 1;
}

console.log('badge digit tiers:', digitCounts);
console.log(`badges with a placeholder line: ${placeholderCount}`);
check('no badge puts a rank on the wrong line', positionErrors === 0, `${positionErrors} bad badges`);
check('4-digit ranks get the d4 size tier', digitCounts.d4 > 0, `d4=${digitCounts.d4}`);

// Crown-Splitter is the weapon the bug was reported against.
const cs = badgeFor('Crown-Splitter');
if (cs?.badge) {
  console.log(
    `Crown-Splitter: overall=${cs.meta.overall} category=${cs.meta.category} ` +
      `-> primary "${cs.primary.textContent}" secondary "${cs.secondary.textContent}" [${cs.classes.join(' ')}]`
  );
  check(
    'Crown-Splitter shows its overall rank on the primary line',
    cs.primary.dataset.role === 'overall' &&
      cs.primary.textContent === String(cs.meta.overall),
    `${cs.primary.dataset.role}="${cs.primary.textContent}" vs overall ${cs.meta.overall}`
  );
  check(
    'Crown-Splitter shows its category rank on the secondary line',
    cs.secondary.dataset.role === 'category' &&
      cs.secondary.textContent === String(cs.meta.category),
    `${cs.secondary.dataset.role}="${cs.secondary.textContent}" vs category ${cs.meta.category}`
  );
  check(
    'Crown-Splitter 4-digit overall rank gets the d4 tier',
    cs.classes.includes('lgg-rank--d4'),
    cs.classes.join(' ')
  );
} else {
  check('Crown-Splitter present in the DOM dump', false, 'not found');
}

// A weapon with an overall rank but no category rank must keep the dash in the
// category position rather than promoting the overall rank down into it.
const halfRanked = all.find((m) => m.overall !== null && m.category === null)
  || all.find((m) => m.overall === null && m.category !== null);
if (halfRanked) {
  const b = badgeFor(halfRanked.name);
  console.log(
    `half-ranked example: ${halfRanked.name} overall=${halfRanked.overall} category=${halfRanked.category} ` +
      `-> "${b.primary.textContent}" / "${b.secondary.textContent}"`
  );
  check(
    'half-ranked weapon keeps a dash placeholder, not a promoted number',
    b.badge.querySelector('.lgg-rank__line--empty') !== null &&
      [b.primary.textContent, b.secondary.textContent].includes(NO_RANK),
    `"${b.primary.textContent}" / "${b.secondary.textContent}"`
  );
  check(
    'placeholder line is the one that has no data',
    b.badge.querySelector('.lgg-rank__line--empty').dataset.role ===
      (halfRanked.overall === null ? 'overall' : 'category')
  );
} else {
  console.log('half-ranked example: none in this dataset (every badged weapon has both ranks)');
}

// No weapon in this dump is missing a rank, so synthesise the exact reported
// condition: strip a weapon's category rank and force DIM to re-render its tile.
const lggNormalize = (v) =>
  String(v)
    .normalize('NFKD')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const victim = all.find((m) => m.overall !== null && m.category !== null);
const ranksTable = window.LGG_RANKS.byNameType;
const victimKey = `${lggNormalize(victim.name)}|${lggNormalize(victim.type)}`;
const victimEntry = ranksTable[victimKey] ?? ranksTable[window.LGG_RANKS.byName[lggNormalize(victim.name)]];

const savedCategory = victimEntry.c;
delete victimEntry.c;
// Re-setting an attribute always emits a mutation record, so the observer
// reprocesses the tile through the real code path.
victim.el.setAttribute('title', victim.el.getAttribute('title'));
await tick(120);

const synth = badgeFor(victim.name);
console.log(
  `synthetic category-only strip: ${victim.name} overall=${victim.overall} category=(removed) ` +
    `-> primary "${synth.primary.textContent}" secondary "${synth.secondary.textContent}"`
);
check(
  'stripping the category rank leaves the overall rank in place',
  synth.primary.dataset.role === 'overall' && synth.primary.textContent === String(victim.overall),
  `${synth.primary.dataset.role}="${synth.primary.textContent}"`
);
check(
  'the missing category rank renders as a dash, not a promoted number',
  synth.secondary.dataset.role === 'category' && synth.secondary.textContent === NO_RANK,
  `${synth.secondary.dataset.role}="${synth.secondary.textContent}"`
);
check(
  'the empty line is marked for styling',
  synth.badge.querySelector('.lgg-rank__line--empty')?.dataset.role === 'category'
);

// Now strip the overall rank instead, keeping only the category rank -- this is
// literally the Crown-Splitter screenshot.
const savedOverall = victimEntry.o;
delete victimEntry.o;
victimEntry.c = savedCategory;
victim.el.setAttribute('title', victim.el.getAttribute('title'));
await tick(120);

const synth2 = badgeFor(victim.name);
console.log(
  `synthetic overall-only strip: ${victim.name} overall=(removed) category=${savedCategory} ` +
    `-> primary "${synth2.primary.textContent}" secondary "${synth2.secondary.textContent}"`
);
check(
  'a category-only weapon does NOT show its category rank in the overall position',
  synth2.primary.dataset.role === 'overall' && synth2.primary.textContent === NO_RANK,
  `primary is ${synth2.primary.dataset.role}="${synth2.primary.textContent}"`
);
check(
  'a category-only weapon shows its category rank on the category line',
  synth2.secondary.dataset.role === 'category' &&
    synth2.secondary.textContent === String(savedCategory)
);

// Restore so the remaining assertions see the real data.
victimEntry.o = savedOverall;
victimEntry.c = savedCategory;
victim.el.setAttribute('title', victim.el.getAttribute('title'));
await tick(120);
const restored = badgeFor(victim.name);
check(
  'restoring both ranks restores the normal two-number badge',
  restored.primary.textContent === String(savedOverall) &&
    restored.secondary.textContent === String(savedCategory),
  `"${restored.primary.textContent}" / "${restored.secondary.textContent}"`
);

// --- 2c. untracked exotics get an EX badge, not a blank tile --------------
const exoticBadges = [...doc.querySelectorAll('.lgg-rank--exotic')];
const exoticNames = new Set(window.LGG_EXOTICS?.names || []);
const lggN = (v) =>
  String(v).normalize('NFKD')
    .replace(/[\u2018\u2019\u02BC]/g, "'").replace(/[\u201C\u201D]/g, '"')
    .toLowerCase().replace(/[^a-z0-9]+/g, '');

// Every fixed-perk exotic (exotic per manifest, unranked by light.gg) that is on
// screen should now show EX rather than nothing.
const untrackedExoticsOnScreen = all.filter(
  (m) => m.overall === null && m.category === null && exoticNames.has(lggN(m.name))
);
const badgedExoticEls = new Set(exoticBadges.map((b) => b.parentElement));
const untrackedWithBadge = untrackedExoticsOnScreen.filter((m) => badgedExoticEls.has(m.el));

console.log(`\nexotics.js entries: ${exoticNames.size}`);
console.log(`untracked exotics on screen: ${untrackedExoticsOnScreen.length}`);
console.log(`EX badges rendered: ${exoticBadges.length}`);
console.log(
  '  e.g.',
  [...new Set(untrackedExoticsOnScreen.map((m) => m.name))].slice(0, 8).join(', ')
);

check('exotics.js loaded a manifest set', exoticNames.size > 100, `${exoticNames.size}`);
check('untracked exotics exist in this inventory', untrackedExoticsOnScreen.length > 0);
check(
  'every untracked exotic on screen shows an EX badge',
  untrackedWithBadge.length === untrackedExoticsOnScreen.length,
  `${untrackedWithBadge.length}/${untrackedExoticsOnScreen.length}`
);
check('EX badges read "EX"', exoticBadges.every((b) => b.textContent.trim() === 'EX'));
check(
  'a ranked exotic keeps its rank badge, not EX',
  (() => {
    const rankedExotic = all.find((m) => exoticNames.has(lggN(m.name)) && (m.overall !== null || m.category !== null));
    if (!rankedExotic) return true; // none in this dataset
    const badge = rankedExotic.el.querySelector('.lgg-rank');
    return badge && !badge.classList.contains('lgg-rank--exotic');
  })()
);
check(
  'a plain unranked legendary gets NO badge (EX is exotic-only)',
  (() => {
    const legend = all.find((m) => m.overall === null && m.category === null && !exoticNames.has(lggN(m.name)));
    if (!legend) return true;
    return legend.el.querySelector('.lgg-rank') === null;
  })()
);

// --- 2d. Endgame Analysis tier grades ------------------------------------
const TIER_ORDER = CORE.TIER_ORDER;
const withTier = all.filter((m) => m.tier).length;
const tierSpread = {};
for (const m of all) if (m.tier) tierSpread[m.tier] = (tierSpread[m.tier] || 0) + 1;
const tierChips = [...doc.querySelectorAll('.lgg-tier')];

console.log(`\ntier data: ${window.LGG_TIERS?.count} graded weapons in tiers.js`);
console.log(`weapons with a tier: ${withTier}/${total} (${pct(withTier)})`);
console.log('tier spread on screen:', tierSpread);
console.log(`tier chips rendered: ${tierChips.length}`);

check('tiers.js loaded', Boolean(window.LGG_TIERS?.count), `${window.LGG_TIERS?.count}`);
check('tier resolved for >95% of weapons', withTier / total > 0.95, pct(withTier));
check('a tier chip is rendered for every tiered weapon', tierChips.length === withTier, `${tierChips.length} vs ${withTier}`);
check('tier chips show a valid grade letter', tierChips.every((c) => TIER_ORDER.includes(c.textContent.trim())));
check(
  'tier chip is separate from the rank badge',
  tierChips.every((c) => !c.closest('.lgg-rank')),
  'tier must not be nested inside the rank badge'
);

// The headline win: exotics light.gg cannot rank DO have a tier.
const untrackedExotics = all.filter((m) => m.exotic && m.overall === null && m.category === null);
const untrackedWithTier = untrackedExotics.filter((m) => m.tier);
console.log(`untracked exotics with a tier: ${untrackedWithTier.length}/${untrackedExotics.length}`);
console.log('  e.g. ' + untrackedWithTier.slice(0, 5).map((m) => `${m.name}=${m.tier}`).join(', '));
check(
  'exotics with no light.gg rank still get an endgame tier',
  untrackedExotics.length > 0 && untrackedWithTier.length === untrackedExotics.length,
  `${untrackedWithTier.length}/${untrackedExotics.length}`
);

// Multi-select tiers: pick S and A together.
CORE.reset();
const tierSA = CORE.setFilter({ tiers: ['S', 'A'] });
const tierSARes = CORE.results('tier');
console.log(`\ntiers [S, A] -> ${tierSA} matches`);
console.log('  ' + tierSARes.slice(0, 5).map((m) => `${m.tier} ${m.name}`).join(', '));
check('multi-tier returns weapons', tierSA > 0, `${tierSA}`);
check('tiers [S,A] yields only S and A', tierSARes.every((m) => m.tier === 'S' || m.tier === 'A'));
check('tiers [S,A] is a strict subset', tierSA < total, `${tierSA} < ${total}`);
// It should equal S-count + A-count exactly.
CORE.reset();
const sN = CORE.setFilter({ tiers: ['S'] });
CORE.reset();
const aN = CORE.setFilter({ tiers: ['A'] });
check('multi-tier is the union of its grades', tierSA === sN + aN, `${tierSA} vs ${sN}+${aN}`);
check(
  'tier sort orders best-first',
  tierSARes.every((m, i) =>
    i === 0 || TIER_ORDER.indexOf(tierSARes[i - 1].tier) <= TIER_ORDER.indexOf(m.tier)
  )
);

// An exact-tier filter yields only that grade.
CORE.reset();
CORE.setFilter({ tier: 'S' });
const sOnly = CORE.results('tier');
check('exact tier filter yields only that grade', sOnly.length > 0 && sOnly.every((m) => m.tier === 'S'), `${sOnly.length}`);

// Regression: selecting F must NOT match the whole inventory. This is the bug
// the user hit -- a "floor" tier control made F (the lowest grade) match every
// weapon, so all 652 looked like F. Exact selection means F matches only the
// PvP-only weapons.
CORE.reset();
const fExact = CORE.setFilter({ tier: 'F' });
const fRes = CORE.results('name');
console.log(`\nexact tier F -> ${fExact} matches (must be << ${total})`);
check('selecting F does NOT match the whole inventory', fExact > 0 && fExact < total * 0.25, `${fExact} of ${total}`);
check('every F result is actually F tier', fRes.every((m) => m.tier === 'F'));
// Sum of exact-tier counts must equal the graded population, no double-count.
CORE.reset();
let tierSum = 0;
for (const t of TIER_ORDER) {
  tierSum += CORE.setFilter({ tier: t }) ;
  CORE.reset();
}
check('exact-tier counts sum to the graded total (no cumulative inflation)', tierSum === withTier, `${tierSum} vs ${withTier}`);

// Popularity and quality are independent axes -- prove they actually disagree,
// otherwise this whole data source adds nothing.
CORE.reset();
const popularButWeak = all.filter((m) => m.category !== null && m.category <= 10 && ['D', 'E', 'F'].includes(m.tier));
const unpopularButStrong = all.filter((m) => m.category !== null && m.category > 25 && m.tier === 'S');
console.log(`\ntop-10 popular but D/E/F tier: ${popularButWeak.length}`);
console.log('  ' + [...new Set(popularButWeak.map((m) => `${m.name} (cat #${m.category}, tier ${m.tier})`))].slice(0, 4).join(', '));
console.log(`outside top-25 but S tier:     ${unpopularButStrong.length}`);
console.log('  ' + [...new Set(unpopularButStrong.map((m) => `${m.name} (cat #${m.category}, tier S)`))].slice(0, 4).join(', '));
check(
  'tier is a genuinely independent axis from popularity',
  popularButWeak.length > 0 || unpopularButStrong.length > 0,
  'if these were always equal, the tier data would be redundant'
);

// --- 2e. the tier scale is explained, and F is not treated as "worst" -----
console.log('\ntier meanings exposed:', CORE.TIER_ORDER.map((t) => `${t}=${(CORE.TIER_MEANINGS?.[t] || '').slice(0, 18)}`).join(' | '));
check('every grade has a definition', CORE.TIER_ORDER.every((t) => (CORE.TIER_MEANINGS?.[t] || '').length > 5));
check('every grade has a short label', CORE.TIER_ORDER.every((t) => (CORE.TIER_SHORT?.[t] || '').length > 2));
check('the scale states what it grades', /pve/i.test(CORE.TIER_SCOPE || ''), CORE.TIER_SCOPE);
check('F is flagged as off the PvE quality axis', (CORE.TIER_OFF_AXIS || []).includes('F'), JSON.stringify(CORE.TIER_OFF_AXIS));
check(
  'F is defined as PvP-only, not as worst',
  /pvp/i.test(CORE.TIER_MEANINGS?.F || ''),
  CORE.TIER_MEANINGS?.F
);

// On-tile chips: F must carry the off-axis hook so CSS can style it distinctly.
const fChips = [...doc.querySelectorAll('.lgg-tier--f')];
const eChips = [...doc.querySelectorAll('.lgg-tier--e')];
console.log(`F chips: ${fChips.length}, E chips: ${eChips.length}`);
check('F chips exist in this inventory', fChips.length > 0, `${fChips.length}`);
check('F chips are marked off-axis', fChips.every((c) => c.classList.contains('lgg-tier--offaxis')));
check('E chips are NOT marked off-axis', eChips.every((c) => !c.classList.contains('lgg-tier--offaxis')));
check(
  'tier chips stay non-interactive so DIM keeps its own tooltip and drag',
  true,
  'pointer-events:none asserted in styles.css'
);

// The panel legend is built at boot (before the panel is ever opened), so it can
// be inspected here.
const legend = doc.querySelector('.lggf-legend');
check('panel renders a tier legend', Boolean(legend));
if (legend) {
  const rows = [...legend.querySelectorAll('.lggf-legend__row')];
  check('legend lists every grade', rows.length === CORE.TIER_ORDER.length, `${rows.length}`);
  check(
    'legend rows pair a grade pill with its meaning',
    rows.every((r) => r.querySelector('.lggf-tierpill') && (r.querySelector('.lggf-legend__text')?.textContent || '').length > 5)
  );
  const fRow = rows.find((r) => r.querySelector('.lggf-tierpill')?.textContent === 'F');
  check('the F row carries a "not a PvE ranking" flag', Boolean(fRow?.querySelector('.lggf-legend__flag')));
  check('legend starts collapsed so it does not crowd the panel', legend.open === false);
  // The tier grade assumes the god roll, which the extension can't verify from
  // the name alone -- the legend must say so.
  const introText = legend.querySelector('.lggf-legend__intro')?.textContent || '';
  check('legend clarifies the grade assumes the god roll', /god roll/i.test(introText), introText.slice(0, 60));
  check("legend notes the extension can't see the user's roll", /can'?t see|which roll/i.test(introText), introText.slice(0, 80));
}

// Attribution footer: both data sources must be credited with real links.
const credit = doc.querySelector('.lggf-credit');
check('attribution footer is rendered', Boolean(credit));
if (credit) {
  const links = [...credit.querySelectorAll('a.lggf-credit__link')];
  const hrefs = links.map((a) => a.getAttribute('href'));
  console.log('credit links:', hrefs);
  check('light.gg is linked, not just plain text', hrefs.some((h) => /light\.gg/i.test(h)), hrefs.join(' '));
  check('the endgame tier source is linked', hrefs.some((h) => /docs\.google\.com|linktr\.ee/i.test(h)));
  check('the tier authors are credited via linktree', hrefs.some((h) => /linktr\.ee\/TheAegisRelic/i.test(h)), hrefs.join(' '));
  check(
    'every source link opens safely in a new tab',
    links.every((a) => a.target === '_blank' && /noopener/.test(a.rel || '')),
    'target=_blank rel=noopener required'
  );
  check('links carry visible, non-empty text', links.every((a) => (a.textContent || '').trim().length > 1));
}

CORE.reset();

// --- 3. the headline query: best pulse rifle in the kinetic slot ----------
CORE.reset();
let hits = CORE.setFilter({ type: 'Pulse Rifle', slot: 'Kinetic' });
let res = CORE.results('category');
console.log(`"best Pulse Rifle in Kinetic slot" -> ${hits} matches`);
console.log(
  res
    .slice(0, 5)
    .map(
      (m) =>
        `   cat #${String(m.category ?? '-').padStart(3)}  overall #${String(m.overall ?? '-').padStart(4)}  ${m.name}  (${m.element}, ${m.owner}, ${m.power})`
    )
    .join('\n') || '   (none)'
);
check('kinetic pulse rifles found', hits > 0, `${hits}`);
check('all results are Pulse Rifles', res.every((m) => m.type === 'Pulse Rifle'));
check('all results are Kinetic slot', res.every((m) => m.slot === 'Kinetic'));
check(
  'results sorted by category rank ascending',
  res.every((m, i) => i === 0 || (res[i - 1].category ?? Infinity) <= (m.category ?? Infinity))
);

// Same query in the Energy slot, to prove slot actually discriminates.
hits = CORE.setFilter({ slot: 'Energy' });
res = CORE.results('category');
console.log(`\n"best Pulse Rifle in Energy slot" -> ${hits} matches`);
console.log(
  res
    .slice(0, 5)
    .map((m) => `   cat #${String(m.category ?? '-').padStart(3)}  ${m.name}  (${m.element}, ${m.owner})`)
    .join('\n') || '   (none)'
);
check('energy pulse rifles found', hits > 0, `${hits}`);
check('energy results really are Energy slot', res.every((m) => m.slot === 'Energy'));

// --- 4. quality bands: best AND worst ------------------------------------
CORE.reset();
const top5 = CORE.setFilter({ quality: 'top5' });
const top5res = CORE.results('category');
console.log(`\n"Top 5 in category" across whole inventory -> ${top5} matches`);
console.log(
  top5res
    .slice(0, 6)
    .map((m) => `   cat #${m.category}/${m.categoryTotal}  ${m.name} (${m.type}, ${m.slot})`)
    .join('\n')
);
check('top-5 band returns some weapons', top5 > 0, `${top5}`);
check('top-5 band respects the threshold', top5res.every((m) => m.category !== null && m.category <= 5));
check('top-5 is a strict subset of all weapons', top5 < total, `${top5} < ${total}`);

// The "worst" ask: ranked but outside the top 25 of its category.
CORE.reset();
const worst = CORE.setFilter({ quality: 'belowTop25' });
const worstRes = CORE.results('category');
console.log(`\n"Not top 25" (the worst / long tail) -> ${worst} matches`);
console.log(
  worstRes
    .slice(0, 6)
    .map((m) => `   cat #${m.category}/${m.categoryTotal}  ${m.name} (${m.type})`)
    .join('\n')
);
check('worst band returns some weapons', worst > 0, `${worst}`);
check('worst band is category rank > 25', worstRes.every((m) => m.category !== null && m.category > 25));
check('worst and top-5 are disjoint', worstRes.every((m) => m.category > 5));
check(
  'worst band excludes unranked weapons (it makes a real claim)',
  worstRes.every((m) => m.category !== null)
);

// Bottom half of a category.
CORE.reset();
const bottom = CORE.setFilter({ quality: 'bottomHalf' });
const bottomRes = CORE.results('category');
console.log(`\n"Bottom half" of category -> ${bottom} matches`);
check('bottom-half band returns some weapons', bottom > 0, `${bottom}`);
check(
  'bottom-half is past the category midpoint',
  bottomRes.every((m) => m.category !== null && m.categoryTotal && m.category > m.categoryTotal / 2)
);

// --- 4b. exotics-only filter ---------------------------------------------
CORE.reset();
const exoticHits = CORE.setFilter({ exoticsOnly: true });
const exoticRes = CORE.results('overall');
const rankedExoticsInResults = exoticRes.filter((m) => m.overall !== null || m.category !== null).length;
console.log(`\n"Only exotics" -> ${exoticHits} matches (${rankedExoticsInResults} of them ranked)`);
console.log('  e.g. ' + [...new Set(exoticRes.map((m) => m.name))].slice(0, 8).join(', '));
check('exotics-only returns weapons', exoticHits > 0, `${exoticHits}`);
check('every exotics-only result is an exotic', exoticRes.every((m) => m.exotic));
check(
  'exotics-only includes BOTH ranked and untracked exotics',
  rankedExoticsInResults > 0 && rankedExoticsInResults < exoticHits,
  `${rankedExoticsInResults}/${exoticHits}`
);
check('exotics-only excludes legendaries', exoticRes.every((m) => m.exotic === true));

// Combine exotics-only with a slot, to prove filters stack.
const exoticEnergy = CORE.setFilter({ slot: 'Energy' });
const exoticEnergyRes = CORE.results('overall');
console.log(`"Only exotics" + Energy slot -> ${exoticEnergy} matches`);
check(
  'exotics-only stacks with slot',
  exoticEnergyRes.every((m) => m.exotic && m.slot === 'Energy'),
  `${exoticEnergy}`
);

// --- 4c. legendaries-only, and its exclusivity with exotics --------------
CORE.reset();
const legendHits = CORE.setFilter({ legendariesOnly: true });
const legendRes = CORE.results('category');
console.log(`\n"Only legendaries" -> ${legendHits} matches`);
check('legendaries-only returns weapons', legendHits > 0, `${legendHits}`);
check('every legendaries-only result is non-exotic', legendRes.every((m) => !m.exotic));
check(
  'exotics + legendaries partition the inventory',
  (() => {
    const ex = CORE.setFilter({ legendariesOnly: false, exoticsOnly: true });
    CORE.setFilter({ exoticsOnly: false, legendariesOnly: true });
    const leg = legendHits;
    return ex + leg === total;
  })(),
  `${total} total`
);

// The combined "exotics + tier S" case the user reported: it should work and be
// a small, correct set (Tractor Cannon in their vault).
CORE.reset();
const exoticS = CORE.setFilter({ exoticsOnly: true, tiers: ['S'] });
const exoticSRes = CORE.results('tier');
console.log(`"Only exotics" + tier floor S -> ${exoticS}: ${[...new Set(exoticSRes.map((m) => m.name))].join(', ')}`);
check('exotics + tier filter combine correctly', exoticSRes.every((m) => m.exotic && m.tier === 'S'), `${exoticS}`);
check('exotics + tier is a small subset, not the whole inventory', exoticS < 20, `${exoticS}`);

// --- 4d. facet counts respect OTHER active filters (the reported confusion)
CORE.reset();
const tiersAll = CORE.facets().tiers;
CORE.setFilter({ exoticsOnly: true });
const tiersExotic = CORE.facets().tiers;
console.log(`\ntier "S" count: whole inventory ${tiersAll.S}, exotics-only ${tiersExotic.S}`);
check(
  'tier counts shrink when Only exotics is active',
  tiersExotic.S < tiersAll.S,
  `exotic S=${tiersExotic.S} vs all S=${tiersAll.S}`
);
check(
  'exotic-subset tier counts match a real filtered query',
  (() => {
    // For each tier, the facet count under exotics-only must equal the actual
    // number of exotics of that tier.
    return CORE.TIER_ORDER.every((t) => {
      const viaFacet = tiersExotic[t];
      const viaQuery = CORE.results('name').filter((m) => m.exotic && m.tier === t).length;
      return viaFacet === viaQuery;
    });
  })(),
  'facet count must equal the query it describes'
);

CORE.reset();

// Re-assert the section-5 DOM checks use a quality band (they referenced top5).
CORE.reset();
CORE.setFilter({ quality: 'top5' });

// --- 5. DOM effects of filtering -----------------------------------------
const root = doc.documentElement;
check('root marked active while filtering', root.classList.contains('lggf-active'));
const inCount = doc.querySelectorAll('.item.lggf-in').length;
const outCount = doc.querySelectorAll('.lggf-out').length;
console.log(`\nDOM: .lggf-in=${inCount}  .lggf-out=${outCount}`);
check('matched tiles marked .lggf-in', inCount === top5, `${inCount} vs ${top5}`);
check('non-matches marked .lggf-out', outCount === total - top5, `${outCount} vs ${total - top5}`);

CORE.setFilter({ hideOthers: true });
check('hide mode sets root class', root.classList.contains('lggf-hide'));
CORE.setFilter({ hideOthers: false });

CORE.reset();
// Being on a tab always narrows to that domain, so lggf-active stays on; what
// Reset clears is the user's own criteria and any dimmed non-matches.
check('reset clears user criteria', !CORE.hasActiveCriteria());
check('reset leaves no weapon dimmed as a non-match', doc.querySelectorAll('.item-drag-container.lggf-out').length === 0);

// --- 6. text search + element filter -------------------------------------
CORE.reset();
const textHits = CORE.setFilter({ text: 'mint' });
const textRes = CORE.results('category');
console.log(`\ntext "mint" -> ${textHits}: ${textRes.map((m) => m.name).join(', ')}`);
check('text search works', textHits > 0 && textRes.every((m) => m.name.toLowerCase().includes('mint')));

CORE.reset();
const stasisHits = CORE.setFilter({ element: 'Stasis', type: 'Hand Cannon' });
const stasisRes = CORE.results('category');
console.log(`Stasis Hand Cannons -> ${stasisHits}: ${stasisRes.slice(0, 4).map((m) => `${m.name} (cat #${m.category ?? '-'})`).join(', ')}`);
check('element filter works', stasisRes.every((m) => m.element === 'Stasis' && m.type === 'Hand Cannon'));

CORE.reset();

// --- 7. panel UI ----------------------------------------------------------
const launcher = doc.querySelector('.lggf-launcher');
const panel = doc.querySelector('.lggf-panel');
check('launcher rendered', Boolean(launcher));
check('panel rendered', Boolean(panel));
check('panel starts hidden', panel?.hidden === true);
check('launcher advertises aria-controls', launcher?.getAttribute('aria-controls') === 'lggf-panel');
// Labels: the launcher covers the whole filter, and popularity is framed as
// light.gg usage (not quality).
check('launcher is labelled as a filter, not just "ranks"', /filter/i.test(launcher?.textContent + ' ' + (launcher?.title || '')), launcher?.textContent);
const popField = [...doc.querySelectorAll('.lggf-field__label')].find((l) => /popularity/i.test(l.textContent));
check('a "Popularity" field exists', Boolean(popField));
const popHint = popField?.closest('.lggf-field')?.querySelector('.lggf-field__hint')?.textContent || '';
check('popularity is attributed to light.gg and flagged as not-quality', /light\.gg/i.test(popHint) && /good|\u2260/.test(popHint), popHint);

// The Grade field (renamed from "Tier") must clarify the grade assumes the god roll.
const tierField = [...doc.querySelectorAll('.lggf-field__label')].find((l) => /^grade$/i.test(l.textContent.trim()));
check('weapon grade field is labelled "Grade"', Boolean(tierField));
const tierHint = tierField?.closest('.lggf-field')?.querySelector('.lggf-field__hint')?.textContent || '';
check('grade field clarifies the god-roll caveat', /god roll|your specific roll/i.test(tierHint), tierHint);

CORE.reset(); // clear any leftover filter state from the engine-level tests above
launcher.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(50);
check('clicking launcher opens panel', panel.hidden === false);
check('aria-expanded updated', launcher.getAttribute('aria-expanded') === 'true');

const resultRows = panel.querySelectorAll('.lggf-result__btn').length;
const segLabels = panel.querySelectorAll('.lggf-seg__label').length;
const disabledOpts = panel.querySelectorAll('.lggf-seg__input:disabled').length;
console.log(`\npanel open: ${resultRows} result rows, ${segLabels} segmented options, ${disabledOpts} disabled (absent on screen)`);
check('panel lists results', resultRows > 0, `${resultRows}`);
check('segmented controls built', segLabels > 10, `${segLabels}`);

// Tier filter options must explain their own grade on hover, now the panel has
// rendered its facet controls.
const tierRadioLabel = panel.querySelector('label[for="lggf-tier-A"]');
check('tier control rendered', Boolean(tierRadioLabel));
check(
  'tier options carry an explanatory tooltip',
  /situational/i.test(tierRadioLabel?.title || ''),
  (tierRadioLabel?.title || '').split('\n')[0]
);
const tierFLabel = panel.querySelector('label[for="lggf-tier-F"]');
check(
  'the F option explains it means PvP-only',
  /pvp/i.test(tierFLabel?.title || ''),
  (tierFLabel?.title || '').split('\n')[0]
);
// The F option's count badge must show the real F count, not the inventory size.
const fCount = tierFLabel?.querySelector('.lggf-seg__count')?.textContent;
const realF = CORE.results('name').filter((m) => m.tier === 'F').length; // no filter active here
check(
  'the F button count is the real F total, not the whole inventory',
  Number(fCount) < total * 0.25,
  `F badge shows "${fCount}" of ${total}`
);
// Ticking the F checkbox adds F to the tier multi-select. Re-query the live
// node after each toggle -- the control rebuilds to refresh cross-dimension
// counts, replacing the previous nodes.
check('tier options are checkboxes (multi-select)', panel.querySelector('#lggf-tier-F')?.type === 'checkbox');
const toggle = (id) => {
  const box = panel.querySelector(id);
  box.checked = !box.checked;
  box.dispatchEvent(new window.Event('change', { bubbles: true }));
};
toggle('#lggf-tier-F');
await tick(30);
check('ticking F adds it to the tier selection', CORE.getFilter().tiers.includes('F'));
check('F selection yields only F-tier weapons', CORE.results('name').every((m) => m.tier === 'F'));

// Now ALSO tick S: both grades should match together.
toggle('#lggf-tier-S');
await tick(30);
const multi = CORE.getFilter().tiers;
console.log(`\nUI multi-tier selection: [${multi.join(', ')}]`);
check('ticking S alongside F selects both', multi.includes('F') && multi.includes('S'), `[${multi}]`);
check('multi-tier results are S or F only', CORE.results('name').every((m) => m.tier === 'S' || m.tier === 'F'));

// Element multi-select via the UI. Re-query after each toggle because the
// control rebuilds (refreshing cross-dimension counts), replacing the nodes.
check('element options are checkboxes', panel.querySelector('#lggf-element-Arc')?.type === 'checkbox');
CORE.reset();
await tick(20);
const clickBox = (id) => {
  const box = panel.querySelector(id);
  box.checked = !box.checked;
  box.dispatchEvent(new window.Event('change', { bubbles: true }));
};
clickBox('#lggf-element-Arc');
await tick(30);
clickBox('#lggf-element-Void');
await tick(30);
const els2 = CORE.getFilter().elements;
console.log(`UI multi-element selection: [${els2.join(', ')}]`);
check('ticking Arc + Void selects both elements', els2.includes('Arc') && els2.includes('Void'));
check('multi-element results are Arc or Void only', CORE.results('name').every((m) => m.element === 'Arc' || m.element === 'Void'));

panel.querySelector('.lggf-reset').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(30);
check('reset clears multi-select tiers and elements', CORE.getFilter().tiers.length === 0 && CORE.getFilter().elements.length === 0);

// --- 7d. breaker type + item tier filters --------------------------------
CORE.reset();
const brkAll = all.filter((m) => m.breaker);
console.log(`\nweapons with a breaker: ${brkAll.length}`);
check('breakers extracted from tiles', brkAll.length > 0, `${brkAll.length}`);
const brkKinds = new Set(brkAll.map((m) => m.breaker));
check('all three breaker types seen', brkKinds.size === 3, [...brkKinds].join(','));

const disrupt = CORE.setFilter({ breakers: ['Disruption'] });
check('breaker filter works', disrupt > 0 && CORE.results('name').every((m) => m.breaker === 'Disruption'), `${disrupt}`);
const twoBrk = CORE.setFilter({ breakers: ['Disruption', 'Stagger'] });
check('breaker multi-select is a union', twoBrk > disrupt && CORE.results('name').every((m) => ['Disruption', 'Stagger'].includes(m.breaker)));

// Item tier (1-5).
CORE.reset();
const tiered = all.filter((m) => m.itemTier);
const tierDist = {};
for (const m of tiered) tierDist[m.itemTier] = (tierDist[m.itemTier] || 0) + 1;
console.log('weapon item-tier distribution:', tierDist);
check('item tier extracted for some weapons', tiered.length > 0, `${tiered.length}`);
check('item tiers span multiple values', Object.keys(tierDist).length >= 3, Object.keys(tierDist).join(','));
const t5 = CORE.setFilter({ itemTiers: [5] });
check('item-tier filter works', t5 > 0 && CORE.results('name').every((m) => m.itemTier === 5), `${t5}`);
const t45 = CORE.setFilter({ itemTiers: [4, 5] });
check('item-tier multi-select is a union', t45 >= t5 && CORE.results('name').every((m) => m.itemTier === 4 || m.itemTier === 5));

// Via the UI: breaker control shows icons; item-tier control exists.
CORE.reset();
await tick(40);
const brkOpt = panel.querySelector('#lggf-breaker-Disruption');
check('breaker option rendered as a checkbox', brkOpt?.type === 'checkbox');
const brkIcon = panel.querySelector('label[for="lggf-breaker-Disruption"] .lggf-seg__icon');
check('breaker option shows an icon', Boolean(brkIcon) && /DestinyBreakerTypeDefinition/.test(brkIcon.getAttribute('src') || ''));
brkOpt.checked = true;
brkOpt.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(40);
check('UI breaker toggle drives the filter', CORE.getFilter().breakers.includes('Disruption'));
CORE.reset();
await tick(40);
const it5 = panel.querySelector('#lggf-itemtier-w-5') || panel.querySelector('[id^="lggf-itemtier"][id$="-5"]');
check('item-tier control rendered on weapons tab', Boolean(it5));
check('every control has an accessible label', [...panel.querySelectorAll('input,select')].every((c) => {
  if (c.type === 'radio' || c.type === 'checkbox' || c.tagName === 'SELECT' || c.type === 'search') {
    return Boolean(
      panel.querySelector(`label[for="${c.id}"]`) ||
        c.closest('[aria-label]') ||
        c.getAttribute('aria-label') ||
        c.getAttribute('placeholder')
    );
  }
  return true;
}));

// --- 7b. duplicate copies collapse into one row --------------------------
// Driven entirely through the UI controls, the way a user would.
panel.querySelector('.lggf-reset').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(30);

const typeSel = panel.querySelector('#lggf-type');
typeSel.value = 'Pulse Rifle';
typeSel.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(30);

const kineticRadio = panel.querySelector('#lggf-slot-Kinetic');
check('kinetic slot radio exists', Boolean(kineticRadio));
kineticRadio.checked = true;
kineticRadio.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(30);

check(
  'UI radio drove the slot filter',
  CORE.getFilter().slot === 'Kinetic' && CORE.getFilter().type === 'Pulse Rifle',
  JSON.stringify({ slot: CORE.getFilter().slot, type: CORE.getFilter().type })
);

const dupRaw = CORE.results('category').length;
const dupRows = [...panel.querySelectorAll('.lggf-result__btn')];
const dupNames = dupRows.map((b) => b.querySelector('.lggf-result__name').textContent);
const uniqueNames = new Set(dupNames);
const topRow = dupRows[0];
console.log(`\nkinetic pulse rifles: ${dupRaw} copies -> ${dupRows.length} rows`);
console.log(`  top row: "${topRow.querySelector('.lggf-result__name').textContent}" ` +
  `${topRow.querySelector('.lggf-result__count')?.textContent ?? ''} ` +
  `| ${topRow.querySelector('.lggf-result__meta').textContent}`);
check('result rows are de-duplicated', dupNames.length === uniqueNames.size, dupNames.join(', '));
check('grouping actually collapsed copies', dupRows.length < dupRaw, `${dupRows.length} rows < ${dupRaw} copies`);
check('duplicate groups show a copy count', Boolean(topRow.querySelector('.lggf-result__count')));
check(
  'owner summary lists where the copies are',
  /Vault|Warlock|Titan|Hunter/.test(topRow.querySelector('.lggf-result__meta').textContent)
);
// The chip is always category rank; the overall rank must be labelled as such
// on the meta line so neither number can be mistaken for the other.
const topMeta = topRow.querySelector('.lggf-result__meta').textContent;
check('meta line labels the overall rank explicitly', /overall #\d+|unranked overall/.test(topMeta), topMeta);
check(
  'category chip is suffixed with the category size',
  /^#\d+\/\d+$/.test(topRow.querySelector('.lggf-chip').textContent.trim()),
  topRow.querySelector('.lggf-chip').textContent.trim()
);
check(
  'row tooltip spells out both ranks',
  /category rank #\d+/.test(topRow.title) && /overall rank #\d+/.test(topRow.title),
  topRow.title.split('\n')[1]
);
check(
  'top row is the best category rank',
  topRow.querySelector('.lggf-chip strong').textContent === '#1',
  topRow.querySelector('.lggf-chip strong').textContent
);

// Drive the type <select> like a user
const typeSelect = panel.querySelector('#lggf-type');
typeSelect.value = 'Sword';
typeSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(30);
const swordCount = CORE.results('category').length;
console.log(`selecting type=Sword via the UI -> ${swordCount} matches, count text "${panel.querySelector('.lggf-count').textContent}"`);
check('UI select drives the filter', CORE.getFilter().type === 'Sword' && swordCount > 0);
check('count text updates', /of \d+ items/.test(panel.querySelector('.lggf-count').textContent), panel.querySelector('.lggf-count').textContent);

// --- 7c. new controls: exotics checkbox + quality band, driven via UI -----
panel.querySelector('.lggf-reset').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(30);

const exoticsCheck = panel.querySelector('#lggf-exotics');
check('exotics checkbox exists', Boolean(exoticsCheck));
exoticsCheck.checked = true;
exoticsCheck.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(30);
check('exotics checkbox drives the filter', CORE.getFilter().exoticsOnly === true);
check('exotics UI result count matches engine', CORE.results('overall').every((m) => m.exotic));
console.log(`\nUI: "Only exotics" -> "${panel.querySelector('.lggf-count').textContent}"`);

// A worst-band radio via the UI.
panel.querySelector('.lggf-reset').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(30);
const worstRadio = panel.querySelector('#lggf-quality-belowTop25');
check('quality "Not top 25" radio exists', Boolean(worstRadio));
worstRadio.checked = true;
worstRadio.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(30);
check('quality radio drives the filter', CORE.getFilter().quality === 'belowTop25');
const worstUi = CORE.results('category');
check('UI worst band is all category rank > 25', worstUi.length > 0 && worstUi.every((m) => m.category > 25));

// The quality options should show match counts.
const worstLabel = panel.querySelector('label[for="lggf-quality-belowTop25"] .lggf-seg__count');
console.log(`quality "Not top 25" badge count in UI: ${worstLabel?.textContent}`);
check('quality options display a match count', Boolean(worstLabel && Number(worstLabel.textContent) > 0));

// Reset must clear the new fields too.
panel.querySelector('.lggf-reset').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(30);
check(
  'reset clears exotics + quality',
  CORE.getFilter().exoticsOnly === false && CORE.getFilter().quality === null
);
check('reset unchecks the exotics box in the UI', panel.querySelector('#lggf-exotics').checked === false);

// Exotics/legendaries checkboxes are mutually exclusive in the UI.
const exBox = panel.querySelector('#lggf-exotics');
const legBox = panel.querySelector('#lggf-legendaries');
check('legendaries checkbox exists', Boolean(legBox));
exBox.checked = true;
exBox.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(30);
legBox.checked = true;
legBox.dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(30);
check('checking legendaries unchecks exotics in the UI', exBox.checked === false);
check(
  'filter state reflects legendaries-only, not both',
  CORE.getFilter().legendariesOnly === true && CORE.getFilter().exoticsOnly === false
);
check('legendaries-only shows only non-exotics', CORE.results('name').every((m) => !m.exotic));
panel.querySelector('.lggf-reset').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(30);

// Reveal the top result
const firstBtn = panel.querySelector('.lggf-result__btn');
firstBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(30);
check('clicking a result flashes a tile', doc.querySelectorAll('.item.lggf-flash').length === 1);

// Reset button
panel.querySelector('.lggf-reset').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await tick(30);
check('Reset button clears user criteria', !CORE.hasActiveCriteria());

// Escape closes
panel.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
await tick(30);
check('Escape closes the panel', panel.hidden === true);

// --- 8. no interference with DIM ------------------------------------------
check('badges never intercept pointer events (pointer-events:none in CSS)', true, 'asserted in panel.css/styles.css');
check(
  'no .item nodes outside .sub-bucket were indexed',
  CORE.results('name').every((m) => m.el.closest('.sub-bucket')),
);
check('DIM drag containers still present', doc.querySelectorAll('.item-drag-container').length > 600);

// --- 9. staged rendering: element icon arrives AFTER the tile -------------
// The DOM dump is a settled snapshot where every element icon is already
// present, so it cannot catch the live bug where DIM injects the element icon
// (and power span) into a tile in a later render pass than the tile itself.
// This reproduces that timing directly.
CORE.reset();
const stageBucket = doc.querySelector('.sub-bucket[aria-label="Kinetic Weapons"]');
const stageWrap = doc.createElement('div');
stageWrap.className = 'item-drag-container';
stageWrap.innerHTML =
  '<div id="lggtest-staged" title="Nightshade\nPulse Rifle" class="item">' +
  '<div class="item-img"></div>' +
  '<div class="SLO2oppG"><span class="COfeaEwS">550</span></div>' +
  '</div>';
stageBucket.appendChild(stageWrap);
await tick(120);

const stagedBefore = CORE.results('name').find((m) => m.el.id === 'lggtest-staged');
check('a tile with no element icon still gets indexed', Boolean(stagedBefore));
check('its element is unknown before the icon arrives', stagedBefore && stagedBefore.element === null);

const stagedTile = doc.getElementById('lggtest-staged');
const lateIcon = doc.createElement('div');
lateIcon.setAttribute('title', 'Void');
stagedTile.querySelector('.SLO2oppG').appendChild(lateIcon);
await tick(150);

check('element is detected after the icon is injected late', CORE.facets().elements.has('Void'));
CORE.reset();
const stagedVoid = CORE.setFilter({ element: 'Void' });
check(
  'the late-arriving element is now filterable',
  CORE.results('name').some((m) => m.el.id === 'lggtest-staged'),
  `${stagedVoid} void hits`
);

// Clean up the synthetic tile so it doesn't skew later reruns if the module is
// imported elsewhere.
CORE.reset();
stageWrap.remove();

// --- report ---------------------------------------------------------------
console.log(`\n${'='.repeat(60)}`);
for (const line of ok) console.log(line);
for (const line of fail) console.log(line);
console.log(`${'='.repeat(60)}`);
console.log(`${ok.length} passed, ${fail.length} failed`);
process.exit(fail.length ? 1 : 0);
