/**
 * Generates ../armor.js: a lookup from an armor piece's display name to its
 * armor set and that set's Endgame Analysis set-bonus grades.
 *
 * Two sources are joined:
 *   1. Bungie manifest, DestinyEquipableItemSetDefinition -- authoritative
 *      mapping of set -> member item hashes -> item names.
 *   2. The Endgame Analysis "set bonuses" tab -- S..F grade per set bonus.
 *      https://docs.google.com/spreadsheets/d/1JM-0SlxVDAi-C6rGVlLxa-J1WGewEeL8Qvq4htWZHhY (gid 1665223292)
 *
 * Usage (PowerShell):
 *   $env:BUNGIE_API_KEY = "<key>"
 *   npm run build:armor
 *
 * Why the manifest is required rather than matching names
 * ------------------------------------------------------
 * Set members frequently do NOT contain the set's name. "Oryx's Memory" is worn
 * as "Darkhollow Grasps", "War Numen's Fist" and so on. Guessing the set from an
 * item's name would silently mis-attribute those, so the set membership comes
 * from the manifest and only the SET NAME is matched against the sheet.
 *
 * A set has two bonuses -- one at 2 pieces and one at 4 -- and they are graded
 * separately, often very differently (Exodus Down: 4pc = S, 2pc = C). Both are
 * kept; the UI shows the best and explains the breakdown, because the grade is
 * only realised if you actually wear that many pieces.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const API_KEY = process.env.BUNGIE_API_KEY;
if (!API_KEY) {
  console.error(
    'Set BUNGIE_API_KEY first.\n  PowerShell: $env:BUNGIE_API_KEY = "your-key"\n  Get a key : https://www.bungie.net/en/Application'
  );
  process.exit(1);
}

const BUNGIE = 'https://www.bungie.net';
const SHEET_ID = '1JM-0SlxVDAi-C6rGVlLxa-J1WGewEeL8Qvq4htWZHhY';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}`;
const SET_GID = '1665223292';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'armor.js');

const TIER_ORDER = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
const TIER_RANK = new Map(TIER_ORDER.map((t, i) => [t, i]));

/**
 * The Armor 3.0 stats. DIM draws one of these icons on an armor tile to show the
 * piece's stat archetype, which is what we let users filter by.
 *
 * Mapped by explicit stat hash rather than by name, because several legacy stat
 * definitions share names and icons -- notably one stale "Class" definition uses
 * the same icon as "Melee". Pinning the six hashes DIM actually renders avoids
 * that collision.
 */
const ARMOR_STAT_HASHES = {
  2996146975: 'Weapons',
  392767087: 'Health',
  1943323491: 'Class',
  1735777505: 'Grenade',
  144602215: 'Super',
  3493869314: 'Melee',
};

/** Keep identical to normalize() in content.js. */
function normalize(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * Set-name key. The manifest suffixes some sets with " Set" ("Smoke Jumper Set")
 * where the sheet does not ("Smoke Jumper"), so a trailing "set" is dropped on
 * both sides. Without this, 5 of 56 sets fail to join.
 */
function setKey(name) {
  return normalize(name).replace(/set$/, '');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else q = false;
      } else field += c;
      continue;
    }
    if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); field = ''; rows.push(row); row = []; }
    else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function getJson(url, withKey = false) {
  const res = await fetch(url, withKey ? { headers: { 'X-API-Key': API_KEY } } : undefined);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  // --- 1. manifest: set -> members ---------------------------------------
  console.log('Fetching manifest index...');
  const man = await getJson(`${BUNGIE}/Platform/Destiny2/Manifest/`, true);
  if (man.ErrorCode !== 1) throw new Error(`Bungie API error ${man.ErrorCode}: ${man.Message}`);
  const paths = man.Response.jsonWorldComponentContentPaths?.en;
  const setPath = paths?.DestinyEquipableItemSetDefinition;
  if (!setPath) {
    throw new Error('DestinyEquipableItemSetDefinition missing from the manifest -- armor sets cannot be resolved.');
  }

  console.log('Fetching set, item and stat definitions (large)...');
  const [setDefs, itemDefs, statDefs] = await Promise.all([
    getJson(`${BUNGIE}${setPath}`),
    getJson(`${BUNGIE}${paths.DestinyInventoryItemDefinition}`),
    getJson(`${BUNGIE}${paths.DestinyStatDefinition}`),
  ]);

  /**
   * Armor stat archetype icons: the 32-hex content hash in the icon URL -> stat
   * name. At runtime we read the icon off the tile and look the hash up, which is
   * stable even though DIM's own CSS class names are not.
   */
  const statIcons = {};
  for (const [hash, name] of Object.entries(ARMOR_STAT_HASHES)) {
    const icon = statDefs[hash]?.displayProperties?.icon;
    const m = icon && icon.match(/([0-9a-f]{32})\./i);
    if (m) statIcons[m[1].toLowerCase()] = name;
    else console.log(`  WARNING no icon for stat ${name} (${hash})`);
  }
  console.log(`  armor stat icons mapped: ${Object.keys(statIcons).length}/6`);

  /** normalized item name -> set display name */
  const itemToSet = {};
  /**
   * normalized item name -> character class. Needed because vault armor has no
   * owning character, so the class cannot be inferred from DIM's layout. Each
   * class has distinct piece names within a set (Grips vs Gauntlets vs Gloves),
   * so a name lookup is unambiguous.
   */
  const itemToClass = {};
  const CLASS_BY_TYPE = { 0: 'Titan', 1: 'Hunter', 2: 'Warlock' };
  /** setKey -> { name, members: count } */
  const manifestSets = new Map();

  for (const def of Object.values(setDefs)) {
    const setName = def?.displayProperties?.name;
    if (!setName) continue;
    let members = 0;
    for (const hash of def.setItems || []) {
      const item = itemDefs[hash];
      const itemName = item?.displayProperties?.name;
      if (!itemName) continue;
      itemToSet[normalize(itemName)] = setName;
      const cls = CLASS_BY_TYPE[item.classType];
      if (cls) itemToClass[normalize(itemName)] = cls;
      members += 1;
    }
    if (members) manifestSets.set(setKey(setName), { name: setName, members });
  }
  console.log(`  manifest: ${manifestSets.size} sets, ${Object.keys(itemToSet).length} member item names`);

  // --- 2. sheet: set -> graded bonuses ------------------------------------
  console.log('Fetching set-bonus grades from the Endgame Analysis sheet...');
  const csv = await (
    await fetch(`${SHEET_URL}/export?format=csv&gid=${SET_GID}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
  ).text();
  const rows = parseCsv(csv);

  // Find the header row carrying Set + Tier.
  let hi = -1;
  for (let i = 0; i < Math.min(8, rows.length); i += 1) {
    const low = rows[i].map((c) => c.trim().toLowerCase());
    if (low.includes('set') && low.includes('tier')) { hi = i; break; }
  }
  if (hi === -1) throw new Error('Could not find the Set/Tier header row in the set-bonus tab.');
  const header = rows[hi].map((c) => c.trim().toLowerCase());
  const ci = (n) => header.indexOf(n);
  const iSet = ci('set');
  const iBonus = ci('bonus');
  const iPcs = ci('pcs');
  const iTier = ci('tier');
  const iTags = ci('tags');
  const iEffect = ci('effect');
  const iDesc = ci('description');

  /** setKey -> { name, source, bonuses: [{ pcs, bonus, tier, tags, effect, notes }] } */
  const sets = {};
  const allTags = new Set();
  let bonusRows = 0;

  for (const r of rows.slice(hi + 1)) {
    const rawSet = (r[iSet] || '').trim();
    if (!rawSet) continue;
    // The Set cell is "<Set Name>\n<Source activity>".
    const [setName, source = ''] = rawSet.split('\n').map((s) => s.trim());
    if (!setName) continue;
    const tier = (r[iTier] || '').trim().toUpperCase();
    if (!TIER_RANK.has(tier)) continue;

    const key = setKey(setName);
    if (!sets[key]) {
      sets[key] = { name: setName, source, bonuses: [] };
    }
    // Tags cell can hold several newline/space separated tags.
    const tags = (iTags === -1 ? '' : r[iTags] || '')
      .split(/[\n,]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    for (const t of tags) allTags.add(t);

    sets[key].bonuses.push({
      pcs: Number((r[iPcs] || '').trim()) || null,
      bonus: (r[iBonus] || '').trim(),
      tier,
      tags,
      effect: iEffect === -1 ? '' : (r[iEffect] || '').replace(/\s+/g, ' ').trim(),
      notes: iDesc === -1 ? '' : (r[iDesc] || '').replace(/\s+/g, ' ').trim(),
    });
    bonusRows += 1;
  }

  // Best (lowest-index) tier per set, and sort bonuses by piece count desc so
  // the headline 4-piece bonus reads first.
  for (const s of Object.values(sets)) {
    s.bonuses.sort((a, b) => (b.pcs ?? 0) - (a.pcs ?? 0));
    s.best = s.bonuses.reduce(
      (acc, b) => (acc === null || TIER_RANK.get(b.tier) < TIER_RANK.get(acc) ? b.tier : acc),
      null
    );
  }
  console.log(`  sheet: ${Object.keys(sets).length} sets, ${bonusRows} graded bonuses`);

  // --- 3. join ------------------------------------------------------------
  const sheetOnly = [];
  const manifestOnly = [];
  for (const k of Object.keys(sets)) if (!manifestSets.has(k)) sheetOnly.push(sets[k].name);
  for (const [k, v] of manifestSets) if (!sets[k]) manifestOnly.push(v.name);

  // Keep only item -> set entries whose set is actually graded, and store the
  // set key so the runtime lookup is a single hop.
  const items = {};
  let gradedItems = 0;
  for (const [itemKey, setName] of Object.entries(itemToSet)) {
    const k = setKey(setName);
    if (!sets[k]) continue;
    items[itemKey] = k;
    gradedItems += 1;
  }

  const distribution = {};
  for (const s of Object.values(sets)) distribution[s.best] = (distribution[s.best] || 0) + 1;

  const payload = {
    generated: new Date().toISOString(),
    manifestVersion: man.Response.version,
    source: SHEET_URL,
    sourceName: 'Destiny 2 Endgame Analysis (community spreadsheet)',
    order: TIER_ORDER,
    tags: [...allTags].sort(),
    // Armor 3.0 stat archetypes, in DIM's display order.
    statNames: ['Weapons', 'Health', 'Class', 'Grenade', 'Super', 'Melee'],
    // icon content hash -> stat name
    statIcons,
    setCount: Object.keys(sets).length,
    itemCount: gradedItems,
    distribution,
    // setKey -> { name, source, best, bonuses: [...] }
    sets,
    // normalized armor item name -> setKey
    items,
    // normalized armor item name -> 'Titan' | 'Hunter' | 'Warlock'
    itemClass: Object.fromEntries(
      Object.keys(items).map((k) => [k, itemToClass[k]]).filter(([, v]) => v)
    ),
    classNames: ['Titan', 'Hunter', 'Warlock'],
  };

  const out = `/**
 * GENERATED FILE - do not edit by hand.
 * Run \`npm run build:armor\` (needs BUNGIE_API_KEY) to refresh.
 *
 * Armor set bonuses graded S..F by the community "Destiny 2 Endgame Analysis"
 * spreadsheet, joined to armor pieces via the Bungie manifest's
 * DestinyEquipableItemSetDefinition. Grades belong to the sheet's authors and are
 * credited in the UI.
 *
 * A set carries a 2-piece and a 4-piece bonus, graded separately and often very
 * differently -- so a grade is only realised when that many pieces are worn.
 *
 * Sets:      ${payload.setCount} graded, covering ${payload.itemCount} armor pieces
 * Best-tier: ${JSON.stringify(distribution)}
 * Manifest:  ${payload.manifestVersion}
 * Generated: ${payload.generated}
 */
globalThis.LGG_ARMOR = ${JSON.stringify(payload, null, 2)};
`;

  await writeFile(OUT, out, 'utf8');

  console.log(`\nWrote ${OUT}`);
  console.log(`  graded sets:        ${payload.setCount}`);
  console.log(`  armor piece names:  ${payload.itemCount}`);
  console.log(`  best-tier spread:   ${JSON.stringify(distribution)}`);
  console.log(`  bonus tags:         ${payload.tags.join(', ')}`);
  if (sheetOnly.length) console.log(`  WARNING sheet sets with no manifest match: ${sheetOnly.join(' / ')}`);
  if (manifestOnly.length) console.log(`  note: manifest sets the sheet has not graded: ${manifestOnly.join(' / ')}`);
}

main().catch((err) => {
  console.error('\n' + (err.message || err));
  process.exit(1);
});
