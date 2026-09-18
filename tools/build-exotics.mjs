/**
 * Generates ../exotics.js from the live Bungie Destiny 2 manifest: the set of
 * exotic weapon names, so the extension can label an exotic that light.gg does
 * not rank ("EX") rather than showing no badge, which looks like a bug.
 *
 * Why this exists: light.gg only tracks a "popularity rank" for weapons with
 * roll variance (random/craftable), because the rank compares your roll to the
 * community's. Fixed-perk exotics like Sunshot have no roll to compare, so they
 * are absent from the popularity CSVs. That is a property of the data, not a gap
 * we can fill -- but we CAN at least say "this is an exotic, not tracked".
 *
 * The manifest is the only authoritative, free source for "is this weapon an
 * exotic". No account access, no OAuth, no scopes -- just a public API key.
 *
 * Usage (PowerShell):
 *   $env:BUNGIE_API_KEY = "<key from https://www.bungie.net/en/Application>"
 *   npm run build:exotics
 *
 * Output is a content script (not JSON) so it can be loaded before content.js
 * and read synchronously off globalThis, matching how ranks.js works.
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
const ITEM_TYPE_WEAPON = 3; // DestinyItemType.Weapon
const TIER_EXOTIC = 6; // TierType.Exotic

// Keep this identical to normalize() in content.js / build-ranks.mjs so the
// extension can match a DIM weapon name against this set the same way.
function normalize(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

async function bungie(path) {
  const res = await fetch(`${BUNGIE}${path}`, { headers: { 'X-API-Key': API_KEY } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json();
}

async function main() {
  console.log('Fetching manifest index...');
  const manifest = await bungie('/Platform/Destiny2/Manifest/');
  if (manifest.ErrorCode !== 1) {
    throw new Error(`Bungie API error ${manifest.ErrorCode}: ${manifest.Message}`);
  }
  const version = manifest.Response.version;
  const defPath =
    manifest.Response.jsonWorldComponentContentPaths?.en?.DestinyInventoryItemDefinition;
  if (!defPath) throw new Error('Could not find DestinyInventoryItemDefinition path in manifest');

  console.log('Fetching item definitions (large download)...');
  const defs = await bungie(defPath); // this endpoint takes no API key, but sending it is harmless

  const names = new Set();
  const samples = [];
  for (const def of Object.values(defs)) {
    if (def?.itemType !== ITEM_TYPE_WEAPON) continue;
    if (def?.inventory?.tierType !== TIER_EXOTIC) continue;
    const name = def?.displayProperties?.name;
    if (!name) continue;
    const key = normalize(name);
    if (!names.has(key)) samples.push(name);
    names.add(key);
  }

  const sorted = [...names].sort();
  const payload = {
    generated: new Date().toISOString(),
    manifestVersion: version,
    count: sorted.length,
    // normalized exotic weapon names; membership test only
    names: sorted,
  };

  const out = `/**
 * GENERATED FILE - do not edit by hand.
 * Run \`npm run build:exotics\` (needs BUNGIE_API_KEY) to refresh after a DLC.
 *
 * Exotic weapon names (normalized) from the Bungie manifest, used to label
 * exotics that light.gg does not assign a popularity rank.
 *
 * Manifest version: ${version}
 * Exotic weapons:   ${sorted.length}
 * Generated:        ${payload.generated}
 */
globalThis.LGG_EXOTICS = ${JSON.stringify(payload, null, 2)};
`;

  const target = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'exotics.js');
  await writeFile(target, out, 'utf8');

  console.log(`\nWrote ${target}`);
  console.log(`  exotic weapons: ${sorted.length}`);
  console.log(`  e.g. ${samples.slice(0, 8).join(', ')}`);
}

main().catch((err) => {
  console.error('\n' + (err.message || err));
  process.exit(1);
});
