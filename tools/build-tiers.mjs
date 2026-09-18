/**
 * Generates ../tiers.js from the community "Destiny 2 Endgame Analysis"
 * spreadsheet, which assigns each weapon an endgame PvE tier grade (S..F).
 *
 *   Source: https://docs.google.com/spreadsheets/d/1JM-0SlxVDAi-C6rGVlLxa-J1WGewEeL8Qvq4htWZHhY
 *
 * This is community-maintained content by its authors, not ours. The extension
 * only reads the publicly published CSV export and credits the sheet in the UI.
 * If you redistribute the extension, keep that attribution and check the sheet's
 * own terms first.
 *
 * Usage:  npm run build:tiers        (no API key needed -- public CSV export)
 *
 * How it works
 * ------------
 * The sheet has ~36 tabs. Most are not weapons (exotic armor, perks, origin
 * traits, subclass fragments and aspects), and tab names are not exposed in the
 * published HTML, only gids. So instead of hardcoding gids or names, each tab is
 * fetched and classified by *content*: a tab is a weapon tab when most of the
 * values in its Name column match a weapon we already know about, from
 * ranks.js (light.gg) plus exotics.js (Bungie manifest). That makes the script
 * resilient to tabs being added, renamed or reordered.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import './../ranks.js';
import './../exotics.js';

const SHEET_ID = '1JM-0SlxVDAi-C6rGVlLxa-J1WGewEeL8Qvq4htWZHhY';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}`;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'tiers.js');

/** Sheet order, best-to-worst for endgame PvE. Used to resolve duplicates. */
const TIER_ORDER = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
const TIER_RANK = new Map(TIER_ORDER.map((t, i) => [t, i]));

/**
 * The sheet's own definition of its scale, transcribed from its legend.
 *
 * Read these carefully before assuming the scale is a simple good-to-bad ramp:
 * it grades a weapon's contribution to *endgame PvE*. D and E mean "negligible
 * in PvE", while F means "exclusively PvP effects" -- an F weapon can be
 * excellent in Crucible. So F is off-axis, not the bottom of the ladder. The
 * extension colours and labels it accordingly instead of painting it as bad.
 *
 * If the sheet ever revises its scale, update this block and re-run the build.
 */
const TIER_MEANINGS = {
  S: 'Irreplaceable effects / core kit',
  A: 'Situational but very good / universal with caveats',
  B: 'Strong in smaller niches / core downgrades',
  C: 'Could see use, bottom of viable',
  D: 'Does something in PvE but basically zero use',
  E: 'QoL or unnoticeable PvE stats',
  F: 'Exclusively PvP effects',
};

/** Short labels for tight UI spots. */
const TIER_SHORT = {
  S: 'Core kit',
  A: 'Very good',
  B: 'Niche pick',
  C: 'Bottom of viable',
  D: 'Negligible in PvE',
  E: 'QoL only',
  F: 'PvP only',
};

/** Fraction of a tab's names that must be known weapons to treat it as weapons. */
const WEAPON_TAB_THRESHOLD = 0.5;

/** Keep identical to normalize() in content.js. */
function normalize(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/** Minimal RFC4180-ish CSV parser: quoted fields, "" escapes, CRLF tolerant. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/csv,text/html,*/*' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** Every gid referenced by the published sheet, in document order, de-duplicated. */
async function discoverGids() {
  const html = await fetchText(`${SHEET_URL}/htmlview`);
  const gids = [...new Set([...html.matchAll(/gid=(\d+)/g)].map((m) => m[1]))];
  if (!gids.length) throw new Error('No gids found -- is the sheet still public?');
  return gids;
}

async function main() {
  const known = new Set([
    ...Object.keys(globalThis.LGG_RANKS.byName),
    ...globalThis.LGG_EXOTICS.names,
  ]);
  console.log(`Known weapon names for classification: ${known.size}`);

  console.log('Discovering sheet tabs...');
  const gids = await discoverGids();
  console.log(`  ${gids.length} tabs referenced\n`);

  /** normalized name -> { t: tier, n: notes } */
  const tiers = {};
  const stats = { weaponTabs: 0, otherTabs: 0, rows: 0, unmatched: new Set() };
  const distribution = {};

  for (const gid of gids) {
    let rows;
    try {
      rows = parseCsv(await fetchText(`${SHEET_URL}/export?format=csv&gid=${gid}`));
    } catch (err) {
      console.log(`  gid ${gid.padEnd(11)} skipped (${err.message})`);
      await wait(200);
      continue;
    }

    // Locate the header row: the one carrying both Name and Tier.
    let headerIdx = -1;
    for (let i = 0; i < Math.min(8, rows.length); i += 1) {
      const lower = rows[i].map((c) => c.trim().toLowerCase());
      if (lower.includes('name') && lower.includes('tier')) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx === -1) {
      stats.otherTabs += 1;
      await wait(200);
      continue;
    }

    const header = rows[headerIdx].map((c) => c.trim().toLowerCase());
    const nameCol = header.indexOf('name');
    const tierCol = header.indexOf('tier');
    const notesCol = header.indexOf('notes');
    const data = rows.slice(headerIdx + 1).filter((r) => (r[nameCol] || '').trim());

    // Classify by content, not by tab name.
    const parsed = data.map((r) => ({
      // Names can carry a second line, e.g. "Falling Guillotine\nBRAVE version".
      raw: (r[nameCol] || '').split('\n')[0].trim(),
      tier: (r[tierCol] || '').trim().toUpperCase(),
      notes: notesCol === -1 ? '' : (r[notesCol] || '').replace(/\s+/g, ' ').trim(),
    }));
    const hits = parsed.filter((p) => known.has(normalize(p.raw))).length;
    const ratio = parsed.length ? hits / parsed.length : 0;

    if (ratio < WEAPON_TAB_THRESHOLD) {
      stats.otherTabs += 1;
      await wait(200);
      continue;
    }

    stats.weaponTabs += 1;
    for (const p of parsed) {
      if (!TIER_RANK.has(p.tier)) continue; // blank or non-standard tier
      const key = normalize(p.raw);
      if (!key) continue;
      if (!known.has(key)) stats.unmatched.add(p.raw);

      const existing = tiers[key];
      // A name can appear on more than one tab (reissues, BRAVE variants). Keep
      // the best grade so a weapon is never under-sold.
      if (!existing || TIER_RANK.get(p.tier) < TIER_RANK.get(existing.t)) {
        tiers[key] = p.notes ? { t: p.tier, n: p.notes } : { t: p.tier };
      }
      stats.rows += 1;
    }
    console.log(
      `  gid ${gid.padEnd(11)} weapons rows=${String(parsed.length).padStart(3)} match=${(ratio * 100).toFixed(0)}%`
    );
    await wait(200);
  }

  for (const v of Object.values(tiers)) distribution[v.t] = (distribution[v.t] || 0) + 1;

  // Sort best-first for a readable generated file.
  const sorted = Object.fromEntries(
    Object.entries(tiers).sort(
      (a, b) => TIER_RANK.get(a[1].t) - TIER_RANK.get(b[1].t) || a[0].localeCompare(b[0])
    )
  );

  const payload = {
    generated: new Date().toISOString(),
    source: SHEET_URL,
    sourceName: 'Destiny 2 Endgame Analysis (community spreadsheet)',
    order: TIER_ORDER,
    // What the grades actually mean, per the sheet's own legend.
    meanings: TIER_MEANINGS,
    short: TIER_SHORT,
    // Grades that are NOT a PvE quality judgement -- F is "PvP only", so it must
    // not be presented as the worst possible grade.
    offAxis: ['F'],
    // This scale grades endgame PvE contribution.
    scope: 'endgame PvE',
    count: Object.keys(sorted).length,
    distribution,
    // normalized weapon name -> { t: tier, n?: notes }
    tiers: sorted,
  };

  const out = `/**
 * GENERATED FILE - do not edit by hand.
 * Run \`npm run build:tiers\` to refresh.
 *
 * Endgame PvE tier grades (S..F) for weapons, from the community-maintained
 * "Destiny 2 Endgame Analysis" spreadsheet. Content belongs to its authors;
 * this file is a derived lookup for local display and is credited in the UI.
 *
 * The scale grades ENDGAME PvE contribution, and is not a plain good-to-bad ramp:
${TIER_ORDER.map((t) => ` *   ${t} - ${TIER_MEANINGS[t]}`).join('\n')}
 * Note F means "PvP only", so it is not the bottom of a quality ladder.
 *
 * Source:    ${SHEET_URL}
 * Weapons:   ${payload.count}
 * Spread:    ${JSON.stringify(distribution)}
 * Generated: ${payload.generated}
 */
globalThis.LGG_TIERS = ${JSON.stringify(payload, null, 2)};
`;

  await writeFile(OUT, out, 'utf8');

  console.log(`\nWrote ${OUT}`);
  console.log(`  weapon tabs used: ${stats.weaponTabs}   other tabs skipped: ${stats.otherTabs}`);
  console.log(`  graded weapons:   ${payload.count}`);
  console.log(`  tier spread:      ${JSON.stringify(distribution)}`);
  if (stats.unmatched.size) {
    console.log(
      `  note: ${stats.unmatched.size} graded name(s) are not in our other data sources, kept anyway: ` +
        [...stats.unmatched].slice(0, 5).join(', ')
    );
  }
}

main().catch((err) => {
  console.error('\n' + (err.message || err));
  process.exit(1);
});
