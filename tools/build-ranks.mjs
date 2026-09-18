/**
 * Merges the two light.gg CSV exports into ranks.js, a plain content script that
 * assigns the lookup tables onto globalThis.
 *
 *   light_gg_popular_weapons.csv  -> overall rank (rank across all weapons)
 *   light_gg_category_ranks.csv   -> category rank (rank within its weapon type)
 *
 * Usage:  node tools/build-ranks.mjs
 *
 * Why a .js file instead of .json: content scripts listed in the manifest all
 * share one isolated-world global and load in order, so ranks.js can define the
 * data and content.js can read it synchronously. That removes the need for
 * web_accessible_resources, a fetch, a service worker, and message passing.
 *
 * Both CSVs contain duplicate names (light.gg lists separate item hashes of the
 * same weapon, e.g. "The Ringing Nail" at auto-rifles 2 and 23). Best (lowest)
 * rank wins.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OVERALL_CSV = 'light_gg_popular_weapons.csv';
const CATEGORY_CSV = 'light_gg_category_ranks.csv';
const OUT_PATH = resolve(ROOT, 'ranks.js');

/**
 * light.gg category slug -> DIM item type (line 2 of the tile's title attribute).
 * The category CSV leaves "Weapon Type" blank, so the slug is the only source of
 * type information there.
 */
const SLUG_TO_TYPE = {
  'auto-rifles': 'Auto Rifle',
  'combat-bows': 'Combat Bow',
  'fusion-rifles': 'Fusion Rifle',
  glaives: 'Glaive',
  'grenade-launchers': 'Grenade Launcher',
  'hand-cannons': 'Hand Cannon',
  'linear-fusion-rifles': 'Linear Fusion Rifle',
  'machine-guns': 'Machine Gun',
  'pulse-rifles': 'Pulse Rifle',
  'rocket-launchers': 'Rocket Launcher',
  'scout-rifles': 'Scout Rifle',
  shotguns: 'Shotgun',
  sidearms: 'Sidearm',
  'sniper-rifles': 'Sniper Rifle',
  'submachine-guns': 'Submachine Gun',
  swords: 'Sword',
  'trace-rifles': 'Trace Rifle',
};

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
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

/** Reads a CSV into { header, rows } and validates the required columns exist. */
async function readCsv(filename, requiredColumns) {
  const rows = parseCsv(await readFile(resolve(ROOT, filename), 'utf8'));
  const header = rows.shift();
  const idx = {};
  for (const [key, column] of Object.entries(requiredColumns)) {
    idx[key] = header.indexOf(column);
    if (idx[key] === -1) {
      throw new Error(`${filename} is missing a "${column}" column. Header: ${header.join(', ')}`);
    }
  }
  return { rows, idx };
}

/**
 * Must stay byte-for-byte identical to normalize() in content.js.
 * Strips case and all non-alphanumerics so "M-17 \"Fast Talker\"", "D.F.A." and
 * "Randy's Throwing Knife" match regardless of punctuation style.
 */
function normalize(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

async function main() {
  /** key "<name>|<type>" -> { o?: overallRank, c?: categoryRank } */
  const byNameType = new Map();
  /** normalized name -> best "<name>|<type>" key, for type-mismatch fallback */
  const nameToKey = new Map();
  /** normalized type -> how many weapons light.gg ranks in that category */
  const categoryTotals = {};

  const stats = { overall: 0, category: 0, categoryOnly: 0, unknownSlugs: new Set() };

  function slot(nKey, tKey) {
    const key = `${nKey}|${tKey}`;
    if (!byNameType.has(key)) byNameType.set(key, {});
    return byNameType.get(key);
  }

  // --- overall ranks -------------------------------------------------------
  {
    const { rows, idx } = await readCsv(OVERALL_CSV, {
      rank: 'Rank',
      name: 'Name',
      type: 'Weapon Type',
    });

    for (const row of rows) {
      const rank = Number.parseInt(row[idx.rank], 10);
      const name = (row[idx.name] || '').trim();
      const type = (row[idx.type] || '').trim();
      if (!Number.isFinite(rank) || !name || !type) continue;
      stats.overall += 1;

      const nKey = normalize(name);
      const tKey = normalize(type);
      const entry = slot(nKey, tKey);
      if (entry.o === undefined || rank < entry.o) entry.o = rank;
      nameToKey.set(nKey, `${nKey}|${tKey}`);
    }
  }

  // --- category ranks ------------------------------------------------------
  {
    const { rows, idx } = await readCsv(CATEGORY_CSV, {
      slug: 'Category Slug',
      rank: 'Category Rank',
      name: 'Name',
    });

    for (const row of rows) {
      const slug = (row[idx.slug] || '').trim();
      const rank = Number.parseInt(row[idx.rank], 10);
      const name = (row[idx.name] || '').trim();
      const type = SLUG_TO_TYPE[slug];

      if (!type) {
        if (slug) stats.unknownSlugs.add(slug);
        continue;
      }
      if (!Number.isFinite(rank) || !name) continue;
      stats.category += 1;

      const nKey = normalize(name);
      const tKey = normalize(type);
      const key = `${nKey}|${tKey}`;
      const existed = byNameType.has(key);
      const entry = slot(nKey, tKey);
      if (entry.c === undefined || rank < entry.c) entry.c = rank;
      if (!existed) stats.categoryOnly += 1;
      if (!nameToKey.has(nKey)) nameToKey.set(nKey, key);

      categoryTotals[tKey] = Math.max(categoryTotals[tKey] || 0, rank);
    }
  }

  if (stats.unknownSlugs.size) {
    throw new Error(
      `Unmapped category slugs (add them to SLUG_TO_TYPE): ${[...stats.unknownSlugs].join(', ')}`
    );
  }

  // Sort for a stable, readable generated file: best category rank first.
  const sortedEntries = [...byNameType.entries()].sort((a, b) => {
    const ac = a[1].c ?? Infinity;
    const bc = b[1].c ?? Infinity;
    return ac - bc || (a[1].o ?? Infinity) - (b[1].o ?? Infinity) || a[0].localeCompare(b[0]);
  });

  const payload = {
    generated: new Date().toISOString(),
    sources: [OVERALL_CSV, CATEGORY_CSV],
    // Keys are "<normalized name>|<normalized weapon type>".
    // o = overall rank across all weapons, c = rank within its weapon type.
    byNameType: Object.fromEntries(sortedEntries),
    // Fallback used when DIM's item type does not match the CSV's.
    byName: Object.fromEntries([...nameToKey.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
    // Normalized weapon type -> size of that category on light.gg.
    categoryTotals: Object.fromEntries(Object.entries(categoryTotals).sort()),
  };

  const withBoth = sortedEntries.filter(([, v]) => v.o !== undefined && v.c !== undefined).length;
  const catOnly = sortedEntries.filter(([, v]) => v.o === undefined).length;
  const overallOnly = sortedEntries.filter(([, v]) => v.c === undefined).length;

  const out = `/**
 * GENERATED FILE - do not edit by hand.
 * Run \`node tools/build-ranks.mjs\` after replacing either source CSV.
 *
 * Sources:   ${payload.sources.join(', ')}
 * Generated: ${payload.generated}
 * Weapons:   ${sortedEntries.length} unique name+type keys
 *            ${withBoth} with both ranks, ${catOnly} category-only, ${overallOnly} overall-only
 *
 * Keys are normalized (lowercased, non-alphanumerics stripped) as
 * "<name>|<weapontype>". Each value is { o: overall rank, c: category rank };
 * either field may be absent.
 */
globalThis.LGG_RANKS = ${JSON.stringify(payload, null, 2)};
`;

  await writeFile(OUT_PATH, out, 'utf8');

  console.log(`Wrote ${OUT_PATH}`);
  console.log(`  overall rows:   ${stats.overall}`);
  console.log(`  category rows:  ${stats.category}`);
  console.log(`  unique weapons: ${sortedEntries.length}`);
  console.log(`    both ranks:   ${withBoth}`);
  console.log(`    category only:${catOnly}`);
  console.log(`    overall only: ${overallOnly}`);
  console.log(`  categories:     ${Object.keys(categoryTotals).length}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
