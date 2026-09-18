/**
 * DIM light.gg Popularity Rank - core
 *
 * Two jobs:
 *   1. Badge every weapon tile with its light.gg overall + category rank.
 *   2. Maintain a searchable index of on-screen weapons and apply filters to it.
 *
 * The filter UI lives in panel.js and talks to this file through
 * globalThis.LGGCore. Everything is local -- ranks.js (generated from the two
 * light.gg CSVs by tools/build-ranks.mjs) loads as a sibling content script, so
 * there is no network request, no service worker and no message passing.
 *
 * DIM markup this relies on, all verified against a real DOM dump:
 *   <div class="store-row store-header">        one .store-cell per character + Vault
 *   <div class="sub-bucket" aria-label="Kinetic Weapons">   the equipment slot
 *     <div class="item-drag-container">          layout/drag wrapper
 *       <div id="6917530198745296829"
 *            title="Modified B-7 Pistol&#10;Hand Cannon"
 *            class="item uEXdHeTm">
 *         <div title="Stasis" class="e0VY8WPa">  damage element
 *         <span class="COfeaEwS">550</span>      power level
 *
 * Selector policy: DIM ships hashed CSS class names (uEXdHeTm, e0VY8WPa) that
 * change on every deploy, so they are never used as selectors here. Only DIM's
 * stable semantic classes (.item, .item-img, .item-drag-container, .sub-bucket,
 * .store-row, .store-cell, .store-header, .equipped-item) and attributes
 * (title, aria-label) are relied on. Element and power level are found by shape
 * -- a title matching a known damage type, a span containing only digits.
 */

(() => {
  'use strict';

  // -------------------------------------------------------------------------
  // Config
  // -------------------------------------------------------------------------

  /**
   * Which rank gets the large top line of the badge: 'overall' or 'category'.
   * Category rank is arguably more actionable ("3rd best hand cannon" beats
   * "76th overall"), so this is a one-word change if you prefer it that way.
   */
  const PRIMARY = 'overall';

  /** Set to 'overall' or 'category' to show a single number instead of both. */
  const SHOW = 'both';

  /** Lower this to hide unpopular weapons entirely, e.g. 100 for the top 100. */
  const MAX_OVERALL_SHOWN = Infinity;

  // -------------------------------------------------------------------------
  // Data
  // -------------------------------------------------------------------------

  const RANKS = globalThis.LGG_RANKS;
  if (!RANKS || !RANKS.byNameType) {
    console.error('[lgg-rank] ranks.js did not load. Run: node tools/build-ranks.mjs');
    return;
  }

  /**
   * Exotic weapon names from the Bungie manifest (see tools/build-exotics.mjs).
   * Optional: if exotics.js is absent the extension still works, it just cannot
   * distinguish an untracked exotic from any other unranked weapon.
   */
  const EXOTIC_NAMES = new Set(globalThis.LGG_EXOTICS?.names || []);

  /**
   * Endgame PvE tier grades (S..F) from the community Endgame Analysis sheet
   * (see tools/build-tiers.mjs). Optional, like exotics.js.
   *
   * This is a different axis from the light.gg ranks: popularity says what the
   * community *uses*, tier says how good it is in endgame PvE. They disagree
   * often and usefully -- Praxic Blade is the single most-used weapon yet grades
   * B, while plenty of S-tier weapons are barely used.
   */
  /**
   * Armor set bonuses (see tools/build-armor.mjs). Optional, like the others.
   *
   * Armor is a separate domain from weapons: it has no popularity rank, and its
   * grade belongs to the *set* rather than the piece. A set carries a 2-piece and
   * a 4-piece bonus graded separately, so both are surfaced -- the grade is only
   * realised once you actually wear that many pieces.
   */
  const ARMOR = globalThis.LGG_ARMOR || null;
  const ARMOR_SETS = ARMOR?.sets || {};
  const ARMOR_ITEMS = ARMOR?.items || {};
  const ARMOR_ITEM_CLASS = ARMOR?.itemClass || {};
  const ARMOR_STAT_ICONS = ARMOR?.statIcons || {};
  const ARMOR_STAT_NAMES = ARMOR?.statNames || [];
  const ARMOR_TAGS = ARMOR?.tags || [];
  const ARMOR_CLASSES = ARMOR?.classNames || [];

  /** Armor item types DIM puts on line 2 of `title`. */
  const ARMOR_TYPES = [
    'Helmet',
    'Gauntlets',
    'Chest Armor',
    'Leg Armor',
    'Class Armor',
    'Hunter Cloak',
    'Titan Mark',
    'Warlock Bond',
  ];
  const ARMOR_TYPE_SET = new Set(ARMOR_TYPES);

  /** Canonical armor slots, and how each item type maps onto one. */
  const ARMOR_SLOTS = ['Helmet', 'Gauntlets', 'Chest', 'Legs', 'Class Item'];
  const ARMOR_SLOT_BY_TYPE = {
    Helmet: 'Helmet',
    Gauntlets: 'Gauntlets',
    'Chest Armor': 'Chest',
    'Leg Armor': 'Legs',
    'Class Armor': 'Class Item',
    'Hunter Cloak': 'Class Item',
    'Titan Mark': 'Class Item',
    'Warlock Bond': 'Class Item',
  };

  const TIERS = globalThis.LGG_TIERS?.tiers || {};
  const TIER_ORDER = globalThis.LGG_TIERS?.order || ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
  const TIER_INDEX = new Map(TIER_ORDER.map((t, i) => [t, i]));
  const TIER_MEANINGS = globalThis.LGG_TIERS?.meanings || {};
  const TIER_SHORT = globalThis.LGG_TIERS?.short || {};
  /**
   * Grades that are not a PvE quality judgement. F means "exclusively PvP
   * effects", so an F weapon may be excellent in Crucible -- it must never be
   * coloured or worded as though it were the worst grade.
   */
  const TIER_OFF_AXIS = new Set(globalThis.LGG_TIERS?.offAxis || ['F']);
  const TIER_SCOPE = globalThis.LGG_TIERS?.scope || 'endgame PvE';

  /** Item types (line 2 of `title`) treated as weapons, in DIM's own wording. */
  const WEAPON_TYPES = [
    'Auto Rifle',
    'Combat Bow',
    'Fusion Rifle',
    'Glaive',
    'Grenade Launcher',
    'Hand Cannon',
    'Linear Fusion Rifle',
    'Machine Gun',
    'Pulse Rifle',
    'Rocket Launcher',
    'Scout Rifle',
    'Shotgun',
    'Sidearm',
    'Sniper Rifle',
    'Submachine Gun',
    'Sword',
    'Trace Rifle',
  ];
  const WEAPON_TYPE_SET = new Set(WEAPON_TYPES);

  /** Equipment slots, taken from the .sub-bucket aria-label minus " Weapons". */
  const SLOTS = ['Kinetic', 'Energy', 'Power'];
  const SLOT_BY_LABEL = new Map(SLOTS.map((s) => [`${s} Weapons`, s]));

  /** Damage types DIM puts in a title attribute inside the tile. */
  const DAMAGE_TYPES = ['Kinetic', 'Arc', 'Solar', 'Void', 'Stasis', 'Strand'];
  const DAMAGE_TYPE_SET = new Set(DAMAGE_TYPES);

  /**
   * Champion breaker types. DIM shows these as an intrinsic icon whose title is
   * "This weapon intrinsically has <X>." The three are Anti-Barrier (Shield
   * Piercing), Overload (Disruption) and Unstoppable (Stagger); we key off the
   * title wording DIM uses.
   */
  const BREAKER_ICON_BASE = 'https://www.bungie.net/common/destiny2_content/icons/DestinyBreakerTypeDefinition_';
  const BREAKERS = [
    { id: 'Shield Piercing', label: 'Anti-Barrier', icon: `${BREAKER_ICON_BASE}07b9ba0194e85e46b258b04783e93d5d.png` },
    { id: 'Disruption', label: 'Overload', icon: `${BREAKER_ICON_BASE}da558352b624d799cf50de14d7cb9565.png` },
    { id: 'Stagger', label: 'Unstoppable', icon: `${BREAKER_ICON_BASE}825a438c85404efd6472ff9e97fc7251.png` },
  ];
  const BREAKER_TITLE_RE = /intrinsically has ([^."]+)/i;

  /**
   * Item tier (1-5), the Edge of Fate armor/weapon quality. DIM draws it as a
   * column of dots in the .oOmFuxay overlay: an inline SVG whose single dot
   * <path> has one "M" subpath per tier. The glyph's fill colour maps 1:1 to
   * tier, which we use as a fast cross-check.
   */
  const TIER_DOT_FILL = {
    '#c8c2cd': 2,
    '#edf3ed': 3,
    '#ffcbff': 4,
    '#fcff99': 5,
  };

  const BADGE_CLASS = 'lgg-rank';
  const STATE_ATTR = 'lggRank'; // dataset key -> data-lgg-rank

  // -------------------------------------------------------------------------
  // Name matching
  // -------------------------------------------------------------------------

  /** Must stay identical to normalize() in tools/build-ranks.mjs. */
  function normalize(value) {
    return String(value)
      .normalize('NFKD')
      .replace(/[\u2018\u2019\u02BC]/g, "'") // curly apostrophes
      .replace(/[\u201C\u201D]/g, '"') // curly double quotes
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ''); // drop spaces, quotes, periods, hyphens
  }

  /** Parse DIM's title attribute into { name, type }, or null if unexpected. */
  function parseTitle(title) {
    if (!title) return null;
    const lines = title.split('\n');
    const name = (lines[0] || '').trim();
    const type = (lines[1] || '').trim();
    if (!name || !type) return null;
    return { name, type };
  }

  /**
   * Resolve { overall, category } for a weapon, either value possibly null.
   *
   * Tries name+type first, then name alone via the byName index (covers a type
   * mismatch between DIM and light.gg), then the name with a trailing variant
   * suffix removed so an "(Adept)" / "(Timelost)" / "(Harrowed)" roll can fall
   * back to its base weapon.
   */
  function ranksFor(name, type) {
    const lookup = (n, t) => {
      const nKey = normalize(n);
      const direct = RANKS.byNameType[`${nKey}|${normalize(t)}`];
      if (direct) return direct;
      const alias = RANKS.byName[nKey];
      return alias ? RANKS.byNameType[alias] : undefined;
    };

    let entry = lookup(name, type);
    if (!entry) {
      const base = name.replace(/\s*\((?:adept|timelost|harrowed)\)\s*$/i, '');
      if (base !== name) entry = lookup(base, type);
    }
    if (!entry) return { overall: null, category: null };

    return { overall: entry.o ?? null, category: entry.c ?? null };
  }

  /** How many weapons light.gg ranks in this category, or null. */
  function categoryTotal(type) {
    return RANKS.categoryTotals?.[normalize(type)] ?? null;
  }

  // -------------------------------------------------------------------------
  // Reading facts off a tile
  // -------------------------------------------------------------------------

  /** Damage element, found by shape rather than by DIM's hashed class name. */
  function readElement(el) {
    for (const node of el.querySelectorAll('div[title]')) {
      const t = node.getAttribute('title');
      if (DAMAGE_TYPE_SET.has(t)) return t;
    }
    return null;
  }

  /**
   * Power level: the first span inside the tile whose text is all digits.
   *
   * Skips any span inside our own badge -- on a re-render the previous badge is
   * still attached when this runs, and a rank line like "550" is a valid 1-4
   * digit number that would otherwise be misread as power.
   */
  function readPower(el) {
    for (const node of el.querySelectorAll('span')) {
      if (node.closest(`.${BADGE_CLASS}`)) continue;
      const t = node.textContent.trim();
      if (t && /^\d{1,4}$/.test(t)) return Number(t);
    }
    return null;
  }

  /**
   * Armor stat archetype ("Grenade", "Weapons", ...) read off the tile's stat
   * icon.
   *
   * DIM renders it as an <img> whose URL carries a 32-hex Bungie content hash.
   * We scan the tile for any such hash that matches the manifest-derived map, so
   * this survives DIM changing its class names or swapping <img> for a
   * background-image div (it has done both).
   */
  function readArmorStat(el) {
    if (!ARMOR) return null;
    for (const node of el.querySelectorAll('img[src], [style*="background-image"]')) {
      const url = node.getAttribute('src') || node.getAttribute('style') || '';
      const m = url.match(/([0-9a-f]{32})/i);
      if (!m) continue;
      const hit = ARMOR_STAT_ICONS[m[1].toLowerCase()];
      if (hit) return hit;
    }
    return null;
  }

  /** Champion breaker type from the intrinsic-perk icon's title, or null. */
  function readBreaker(el) {
    for (const node of el.querySelectorAll('[title]')) {
      const m = (node.getAttribute('title') || '').match(BREAKER_TITLE_RE);
      if (m) {
        const id = m[1].trim();
        if (BREAKERS.some((b) => b.id === id)) return id;
      }
    }
    return null;
  }

  /**
   * Item tier (1-5) from the dot overlay, or null if the piece has none (older
   * gear predating the Edge of Fate tier system).
   *
   * Read the .oOmFuxay overlay's background-image SVG: the dot glyph is a single
   * <path> with one "M" move-command per tier. The glyph fill colour also maps
   * to tier, so it's used as a corroborating check -- if the two disagree we
   * trust the fill, since a stray "M" in path data is more likely than a wrong
   * colour.
   */
  function readItemTier(el) {
    const overlay = el.querySelector('.oOmFuxay');
    const style = overlay?.getAttribute('style') || '';
    // The SVG is a data URI inside url("..."). It contains single quotes and
    // spaces, so match up to the closing quote+paren of url(...), not to the
    // first quote. DIM percent-encodes the markup (%3c, %3e, %23), sometimes
    // partially, so decode then work on the result.
    const m = style.match(/url\(\s*["']?(data:image\/svg\+xml,[\s\S]*?)["']?\s*\)/i);
    if (!m) return null;
    let svg = m[1];
    try {
      svg = decodeURIComponent(svg.replace(/^data:image\/svg\+xml,/, ''));
    } catch {
      // Leave partially-encoded; the checks below tolerate %3c/%23 forms too.
    }

    // Fill colour -> tier. Accept both decoded (#fcff99) and encoded (%23fcff99).
    const fillMatch = svg.match(/fill=['"](?:#|%23)([0-9a-f]{6})['"]/i);
    const byFill = fillMatch ? TIER_DOT_FILL[`#${fillMatch[1].toLowerCase()}`] : undefined;

    // Dot count: the coloured <g>'s path has one "M" move-command per tier.
    // Tolerate encoded angle brackets by normalising them first.
    const norm = svg.replace(/%3c/gi, '<').replace(/%3e/gi, '>');
    const dotPath = norm.match(/<g\s+fill=['"][^'"]*['"]>\s*<path\b[^>]*\bd=['"]([^'"]*)['"]/i);
    const byDots = dotPath ? (dotPath[1].match(/M/g) || []).length : 0;

    const tier = byFill || byDots || null;
    return tier >= 1 && tier <= 5 ? tier : null;
  }

  /** Equipment slot from the enclosing .sub-bucket's aria-label. */
  function readSlot(el) {
    const bucket = el.closest('.sub-bucket');
    if (!bucket) return null;
    return SLOT_BY_LABEL.get(bucket.getAttribute('aria-label') || '') || null;
  }

  /**
   * First non-empty text node inside a header cell.
   *
   * Deliberately not textContent: the header cell also holds power level,
   * glimmer, and vault capacity counters, so flattening it yields
   * "Vault5507,7133,050...". DIM renders the store name as the first text in the
   * cell ("Warlock" then "Human" then stats; "Vault" then counters), so the first
   * text node is the label. Anything suspiciously long is rejected rather than
   * shown, so a DIM layout change degrades to no label instead of garbage.
   */
  function firstTextLabel(cell) {
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = (node.nodeValue || '').trim();
      if (!text) continue;
      return text.length <= 24 ? text : null;
    }
    return null;
  }

  /**
   * Column index -> store label, cached because resolving it walks the DOM and
   * there can be hundreds of tiles per render pass. Invalidated whenever a
   * mutation batch is processed.
   */
  let ownerLabels = null;

  function storeLabels() {
    if (ownerLabels) return ownerLabels;
    const header = document.querySelector('.store-row.store-header');
    ownerLabels = header ? [...header.children].map(firstTextLabel) : [];
    return ownerLabels;
  }

  /**
   * Owner ("Warlock" / "Hunter" / "Titan" / "Vault").
   *
   * DIM lays the inventory out as a table of divs: each .store-row holds one
   * .store-cell per store, in the same column order as the .store-header row.
   * So the owner is the header label at our column index. Defensive throughout --
   * a layout change should cost us a label, not break filtering.
   */
  function readOwner(el) {
    try {
      const cell = el.closest('.store-cell');
      const row = cell?.parentElement;
      if (!cell || !row) return null;

      const columnIndex = [...row.children].indexOf(cell);
      if (columnIndex < 0) return null;

      return storeLabels()[columnIndex] ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Build the metadata record for an armor tile.
   *
   * Armor's grade lives on its *set*, not the piece, and a set has two bonuses
   * (2-piece and 4-piece) graded separately. Both are carried so the UI can show
   * each with its piece requirement rather than implying one number applies.
   */
  function readArmorMeta(el, parsed) {
    const key = normalize(parsed.name);
    const setKey = ARMOR_ITEMS[key] || null;
    const set = setKey ? ARMOR_SETS[setKey] : null;
    const bonuses = set?.bonuses || [];

    return {
      kind: 'armor',
      el,
      wrapper: el.closest('.item-drag-container') || el,
      name: parsed.name,
      type: parsed.type,
      armorSlot: ARMOR_SLOT_BY_TYPE[parsed.type] || null,
      // Character class comes from the manifest, since vault armor has no owner
      // column to infer it from.
      armorClass: ARMOR_ITEM_CLASS[key] || null,
      stat: readArmorStat(el),
      power: readPower(el),
      itemTier: readItemTier(el), // Edge of Fate tier 1-5, or null
      owner: readOwner(el),
      setKey,
      setName: set?.name || null,
      setSource: set?.source || '',
      // Best grade across the set's bonuses, and the pieces needed to reach it.
      tier: set?.best || null,
      bonuses, // [{ pcs, bonus, tier, tags, effect, notes }] sorted 4pc first
      tags: [...new Set(bonuses.flatMap((b) => b.tags || []))],
      search: parsed.name.toLowerCase(),
    };
  }

  /** Build the full metadata record for a weapon tile. */
  function readMeta(el, parsed) {
    const { overall, category } = ranksFor(parsed.name, parsed.type);
    return {
      kind: 'weapon',
      el,
      // .item-drag-container is the layout box; hiding the bare .item would
      // leave an empty gap in DIM's grid.
      wrapper: el.closest('.item-drag-container') || el,
      name: parsed.name,
      type: parsed.type,
      slot: readSlot(el),
      element: readElement(el),
      breaker: readBreaker(el), // Champion breaker: Shield Piercing | Disruption | Stagger
      power: readPower(el),
      itemTier: readItemTier(el), // Edge of Fate tier 1-5, or null
      owner: readOwner(el),
      overall,
      category,
      categoryTotal: categoryTotal(parsed.type),
      // Exotic per the Bungie manifest (regardless of whether light.gg ranks it).
      exotic: EXOTIC_NAMES.has(normalize(parsed.name)),
      // Endgame Analysis tier grade, and the sheet's own note explaining it.
      tier: TIERS[normalize(parsed.name)]?.t ?? null,
      tierNotes: TIERS[normalize(parsed.name)]?.n ?? '',
      // Exotic AND unranked by light.gg -> the fixed-perk exotics that get the
      // "EX" badge, since showing no badge would look like a bug.
      exoticUntracked:
        overall === null && category === null && EXOTIC_NAMES.has(normalize(parsed.name)),
      search: parsed.name.toLowerCase(),
    };
  }

  // -------------------------------------------------------------------------
  // Badge
  // -------------------------------------------------------------------------

  /**
   * Visual tier, driven by category rank when available because it is scaled to
   * the category (top 5 of a type is meaningful), otherwise by overall rank.
   */
  function tierFor({ overall, category }) {
    if (category !== null) {
      if (category <= 5) return 1;
      if (category <= 15) return 2;
      if (category <= 40) return 3;
      return 4;
    }
    if (overall <= 25) return 1;
    if (overall <= 100) return 2;
    if (overall <= 250) return 3;
    return 4;
  }

  function removeBadge(el) {
    el.querySelector(`:scope > .${BADGE_CLASS}`)?.remove();
  }

  /** Placeholder shown when one of the two ranks is unavailable. */
  const NO_RANK = '\u2013'; // en dash

  const TIER_CLASS = 'lgg-tier';

  function removeTier(el) {
    el.querySelector(`:scope > .${TIER_CLASS}`)?.remove();
  }

  /**
   * Endgame tier grade, as its own small chip in the tile's bottom-left corner.
   *
   * Kept separate from the centre rank badge on purpose: these are two different
   * claims from two different sources (popularity vs endgame quality), and
   * merging them into one chip would imply they mean the same thing.
   */
  function injectTier(el, tier) {
    removeTier(el);
    if (!tier) return;
    const chip = document.createElement('div');
    chip.className = `${TIER_CLASS} ${TIER_CLASS}--${tier.toLowerCase()}`;
    // Off-axis grades (F = PvP only) get their own styling hook so they are not
    // painted as the worst rung of a PvE ladder.
    if (TIER_OFF_AXIS.has(tier)) chip.classList.add(`${TIER_CLASS}--offaxis`);
    chip.textContent = tier;
    chip.setAttribute('aria-hidden', 'true');
    el.appendChild(chip);
  }

  const ARMOR_BADGE_CLASS = 'lgg-armor';

  function removeArmorBadges(el) {
    for (const n of el.querySelectorAll(`:scope > .${ARMOR_BADGE_CLASS}`)) n.remove();
  }

  /**
   * Armor set-bonus grades, as up to two chips.
   *
   * A set is graded separately at 2 and 4 pieces and the grades often differ a
   * lot (Exodus Down: 4pc S, 2pc C). Showing one letter would imply the grade is
   * unconditional, so each is drawn with its piece requirement -- "S4", "C2" --
   * and they get their own corners: the higher requirement centre (where the
   * weapon rank badge sits, which armor doesn't use), the lower bottom-left.
   * DIM draws little on armor, so both spots are free.
   */
  function injectArmorBadges(el, meta) {
    removeArmorBadges(el);
    if (!meta.bonuses.length) return;

    // Sorted 4pc-first by the build script; centre gets the first, corner the next.
    const positions = ['center', 'corner'];
    meta.bonuses.slice(0, 2).forEach((b, i) => {
      if (!b.tier) return;
      const chip = document.createElement('div');
      chip.className =
        `${ARMOR_BADGE_CLASS} ${ARMOR_BADGE_CLASS}--${positions[i]} ` +
        `${ARMOR_BADGE_CLASS}--${b.tier.toLowerCase()}`;
      if (TIER_OFF_AXIS.has(b.tier)) chip.classList.add(`${ARMOR_BADGE_CLASS}--offaxis`);
      chip.setAttribute('aria-hidden', 'true');

      const grade = document.createElement('span');
      grade.className = `${ARMOR_BADGE_CLASS}__grade`;
      grade.textContent = b.tier;
      const pcs = document.createElement('span');
      pcs.className = `${ARMOR_BADGE_CLASS}__pcs`;
      pcs.textContent = String(b.pcs ?? '');

      chip.append(grade, pcs);
      el.appendChild(chip);
    });
  }

  /** Untracked exotic: a single "EX" chip instead of ranks. */
  function injectExoticBadge(el) {
    removeBadge(el);
    const badge = document.createElement('div');
    badge.className = `${BADGE_CLASS} ${BADGE_CLASS}--exotic`;
    badge.setAttribute('aria-hidden', 'true');
    const line = document.createElement('span');
    line.className = `${BADGE_CLASS}__line ${BADGE_CLASS}__primary`;
    line.dataset.role = 'exotic';
    line.textContent = 'EX'; // light.gg does not rank fixed-perk exotics
    badge.appendChild(line);
    el.appendChild(badge);
  }

  function injectBadge(el, ranks) {
    removeBadge(el);

    // Line order is fixed by PRIMARY so a given position always means the same
    // thing. Critically, a missing rank still occupies its line as a dash rather
    // than letting the other rank slide up into it -- otherwise a weapon with
    // only a category rank (Crown-Splitter at #79 of swords) renders a lone big
    // "79" that is indistinguishable from an overall rank of 79.
    const ordered =
      PRIMARY === 'category'
        ? [
            { role: 'category', value: ranks.category },
            { role: 'overall', value: ranks.overall },
          ]
        : [
            { role: 'overall', value: ranks.overall },
            { role: 'category', value: ranks.category },
          ];

    const lines = SHOW === 'both' ? ordered : ordered.filter((p) => p.role === SHOW);

    // Nothing to say at all -> no badge. (In single-rank mode that also covers
    // the case where the one rank we would show is missing.)
    if (!lines.some((p) => p.value !== null)) return;

    const badge = document.createElement('div');
    badge.className = `${BADGE_CLASS} ${BADGE_CLASS}--t${tierFor(ranks)}`;
    if (lines.length === 1) badge.classList.add(`${BADGE_CLASS}--single`);

    // Width/size tier by digit count. The overall list is past 1600 entries, so
    // 4-digit ranks are common and need a smaller, wider box.
    const digits = Math.max(
      1,
      ...lines.map((p) => (p.value === null ? 0 : String(p.value).length))
    );
    badge.classList.add(`${BADGE_CLASS}--d${Math.min(digits, 4)}`);

    badge.setAttribute('aria-hidden', 'true'); // decorative; DIM's title has the real info

    lines.forEach((p, i) => {
      const line = document.createElement('span');
      line.className = `${BADGE_CLASS}__line ${BADGE_CLASS}__${i === 0 ? 'primary' : 'secondary'}`;
      if (p.value === null) line.classList.add(`${BADGE_CLASS}__line--empty`);
      line.dataset.role = p.role; // 'overall' | 'category'
      line.textContent = p.value === null ? NO_RANK : String(p.value);
      badge.appendChild(line);
    });

    el.appendChild(badge);
  }

  // -------------------------------------------------------------------------
  // Index
  // -------------------------------------------------------------------------

  /** @type {Map<HTMLElement, object>} .item element -> metadata */
  const index = new Map();
  const listeners = new Set();
  let notifyScheduled = false;

  function notify() {
    if (notifyScheduled) return;
    notifyScheduled = true;
    // Coalesce: DIM can add hundreds of tiles in one tick.
    setTimeout(() => {
      notifyScheduled = false;
      for (const cb of listeners) {
        try {
          cb();
        } catch (err) {
          console.error('[lgg-rank] listener failed', err);
        }
      }
    }, 60);
  }

  /** Drop entries whose nodes DIM has detached. */
  function prune() {
    let removed = 0;
    for (const el of index.keys()) {
      if (!el.isConnected) {
        index.delete(el);
        removed += 1;
      }
    }
    return removed;
  }

  function processItem(el) {
    if (!(el instanceof HTMLElement)) return false;

    const parsed = parseTitle(el.getAttribute('title'));
    const isWeapon = parsed && WEAPON_TYPE_SET.has(parsed.type);
    const isArmor = parsed && ARMOR && ARMOR_TYPE_SET.has(parsed.type);

    if (!isWeapon && !isArmor) {
      // Node may have been recycled from a weapon/armor into something else.
      if (el.dataset[STATE_ATTR] !== undefined) {
        delete el.dataset[STATE_ATTR];
        removeBadge(el);
        removeTier(el);
        removeArmorBadges(el);
        clearFilterClasses(el, index.get(el));
        index.delete(el);
        return true;
      }
      return false;
    }

    // --- armor -------------------------------------------------------------
    if (isArmor) return processArmorItem(el, parsed);

    const meta = readMeta(el, parsed);

    let ranks = { overall: meta.overall, category: meta.category };
    const hasRank = ranks.overall !== null || ranks.category !== null;
    if (ranks.overall !== null && ranks.overall > MAX_OVERALL_SHOWN) {
      ranks = { overall: null, category: null };
    }

    // Badge state fingerprint: rank pair, or a marker for the exotic/none cases.
    // Included in the dataset guard so a recycled tile repaints correctly.
    const shownRank = ranks.overall !== null || ranks.category !== null;
    const badgeState = shownRank
      ? `${ranks.overall ?? '-'}/${ranks.category ?? '-'}`
      : meta.exoticUntracked
        ? 'exotic'
        : 'none';
    // Tier is part of the fingerprint so a recycled tile repaints its grade.
    const state = `${badgeState}|${meta.tier ?? '-'}`;

    const known = index.get(el);
    const unchanged = known && known.name === parsed.name && el.dataset[STATE_ATTR] === state;

    if (unchanged) {
      // Re-inject only if DIM's re-render dropped our nodes.
      if (badgeState !== 'none' && !el.querySelector(`:scope > .${BADGE_CLASS}`)) {
        if (badgeState === 'exotic') injectExoticBadge(el);
        else injectBadge(el, ranks);
      }
      if (meta.tier && !el.querySelector(`:scope > .${TIER_CLASS}`)) injectTier(el, meta.tier);

      // The badge is settled, but DIM injects the element icon, power span and
      // slot wrapper into a tile in *later* render passes than the tile itself.
      // Those late arrivals don't change name or rank, so without this the very
      // first (empty) read of element/slot/power/owner would stick forever --
      // which is exactly why the element filter showed "none on screen".
      if (known && facetsChanged(known, meta)) {
        // Preserve the badge-state bookkeeping, refresh the facet fields.
        Object.assign(known, {
          slot: meta.slot,
          element: meta.element,
          breaker: meta.breaker,
          power: meta.power,
          itemTier: meta.itemTier,
          owner: meta.owner,
          exotic: meta.exotic,
        });
        applyToItem(known);
        return true; // a facet changed -> panel must re-render its controls
      }
      return false;
    }

    el.dataset[STATE_ATTR] = state;
    if (shownRank) injectBadge(el, ranks);
    else if (badgeState === 'exotic') injectExoticBadge(el);
    else removeBadge(el);
    injectTier(el, meta.tier);

    // Only index tiles inside the inventory grid. DIM also renders .item nodes
    // in the item detail popup, the loadout drawer and compare, and those must
    // never be dimmed by a filter.
    if (el.closest('.sub-bucket')) {
      index.set(el, meta);
      applyToItem(meta); // keep a live filter consistent for newly rendered tiles
    } else if (known) {
      clearFilterClasses(el, known);
      index.delete(el);
    }

    return true;
  }

  /**
   * Armor counterpart of the weapon path: badge the set-bonus grades and index
   * the piece. Same recycling discipline -- DIM reuses tiles, and the stat icon
   * and power span arrive in later render passes than the tile itself.
   */
  function processArmorItem(el, parsed) {
    const meta = readArmorMeta(el, parsed);

    // Fingerprint covers what we draw: the graded bonuses.
    const state =
      'armor:' + (meta.bonuses.length ? meta.bonuses.map((b) => `${b.tier}${b.pcs}`).join(',') : 'none');

    const known = index.get(el);
    const unchanged = known && known.name === parsed.name && el.dataset[STATE_ATTR] === state;

    if (unchanged) {
      // Re-draw if DIM's re-render dropped our chips.
      if (meta.bonuses.length && !el.querySelector(`:scope > .${ARMOR_BADGE_CLASS}`)) {
        injectArmorBadges(el, meta);
      }
      // Late-arriving stat icon / power / owner must not stay stuck at their
      // first (often empty) read -- the same trap as the weapon element icon.
      if (
        known &&
        (known.stat !== meta.stat ||
          known.power !== meta.power ||
          known.itemTier !== meta.itemTier ||
          known.owner !== meta.owner ||
          known.armorSlot !== meta.armorSlot)
      ) {
        Object.assign(known, {
          stat: meta.stat,
          power: meta.power,
          itemTier: meta.itemTier,
          owner: meta.owner,
          armorSlot: meta.armorSlot,
        });
        applyToItem(known);
        return true;
      }
      return false;
    }

    el.dataset[STATE_ATTR] = state;
    // Armor never shows the weapon rank badge or weapon tier chip.
    removeBadge(el);
    removeTier(el);
    injectArmorBadges(el, meta);

    if (el.closest('.sub-bucket')) {
      index.set(el, meta);
      applyToItem(meta);
    } else if (known) {
      clearFilterClasses(el, known);
      index.delete(el);
    }
    return true;
  }

  /** True if any filterable facet differs between two metadata records. */
  function facetsChanged(a, b) {
    return (
      a.slot !== b.slot ||
      a.element !== b.element ||
      a.breaker !== b.breaker ||
      a.power !== b.power ||
      a.itemTier !== b.itemTier ||
      a.owner !== b.owner ||
      a.exotic !== b.exotic
    );
  }

  function scan(root) {
    if (!(root instanceof HTMLElement)) return false;
    let changed = false;
    if (root.matches?.('div.item[title]')) changed = processItem(root) || changed;
    const nodes = root.querySelectorAll?.('div.item[title]');
    if (nodes) for (const node of nodes) changed = processItem(node) || changed;
    return changed;
  }

  // -------------------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------------------

  const EMPTY_FILTER = Object.freeze({
    // Which domain the panel is filtering. Weapons and armor have almost no
    // shared facets, so the tab picks one and the other is left untouched.
    domain: 'weapon', // 'weapon' | 'armor'

    text: '',
    slot: null, // 'Kinetic' | 'Energy' | 'Power'
    type: null, // e.g. 'Pulse Rifle'
    elements: [], // multi-select: any of 'Arc' | 'Solar' | ...; [] means any
    breakers: [], // multi-select: any of 'Shield Piercing' | 'Disruption' | 'Stagger'
    quality: null, // category-rank band, see QUALITY below
    tiers: [], // multi-select weapon Grade: any of 'S'..'F'; [] means any
    exoticsOnly: false, // only exotic weapons
    legendariesOnly: false, // only non-exotic (legendary and below) weapons
    rankedOnly: false, // drop weapons light.gg has no data for
    itemTiers: [], // multi-select item tier 1-5 (shared by both domains); [] means any

    // --- armor ---
    armorSlots: [], // multi: 'Helmet' | 'Gauntlets' | 'Chest' | 'Legs' | 'Class Item'
    armorClasses: [], // multi: 'Titan' | 'Hunter' | 'Warlock'
    stats: [], // multi: 'Weapons' | 'Health' | 'Class' | 'Grenade' | 'Super' | 'Melee'
    armorTags: [], // multi: 'damage' | 'survivability' | ...
    setPieces: null, // armor grade scope: null = either bonus, 2 or 4 = that bonus only
    minPower: null, // inclusive power floor, applies to either domain

    hideOthers: false, // collapse non-matches instead of fading them
  });

  /** Normalize a patch so element/tier accept a scalar, an array, or null. */
  function normalizeMulti(value) {
    if (value === null || value === undefined) return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
  }

  /**
   * Named quality bands, evaluated against a weapon's *category* rank (its
   * standing within its own weapon type). Category rank is the right axis: "the
   * worst hand cannons" means low within hand cannons, not low across all guns
   * where every hand cannon would drown among 1600 entries.
   *
   * `test(meta)` receives the metadata; a weapon with no category rank never
   * matches a band, since we cannot place it.
   */
  const QUALITY = {
    top5: { label: 'Top 5', test: (m) => m.category !== null && m.category <= 5 },
    top10: { label: 'Top 10', test: (m) => m.category !== null && m.category <= 10 },
    top25: { label: 'Top 25', test: (m) => m.category !== null && m.category <= 25 },
    // "Worst": ranked, but outside the top 25 of its category -- the long tail
    // of weapons the community has largely moved on from. Ranked-only so we are
    // making a real claim, not just flagging unknowns.
    belowTop25: {
      label: 'Not top 25',
      test: (m) => m.category !== null && m.category > 25,
    },
    // Bottom of the pack: the least popular half of a ranked category.
    bottomHalf: {
      label: 'Bottom half',
      test: (m) => m.category !== null && m.categoryTotal && m.category > m.categoryTotal / 2,
    },
  };

  let filter = { ...EMPTY_FILTER };

  const ROOT_ACTIVE = 'lggf-active';
  const ROOT_HIDE = 'lggf-hide';
  const OUT_CLASS = 'lggf-out';
  const IN_CLASS = 'lggf-in';

  /**
   * True when the user has applied a real filter criterion.
   *
   * Being on a tab is NOT itself treated as filtering: an unfiltered tab leaves
   * the whole inventory alone rather than dimming the other domain. Dimming
   * everything just because a tab is open was visually noisy, so highlighting
   * only kicks in once you actually narrow something.
   */
  function isFiltering(f = filter) {
    const any = (a) => Boolean(a && a.length);
    if (f.domain === 'armor') {
      return Boolean(
        f.text.trim() ||
          any(f.armorSlots) ||
          any(f.armorClasses) ||
          any(f.stats) ||
          any(f.armorTags) ||
          any(f.tiers) ||
          any(f.itemTiers) ||
          f.setPieces !== null ||
          f.minPower !== null
      );
    }
    return Boolean(
      f.text.trim() ||
        f.slot ||
        f.type ||
        any(f.elements) ||
        any(f.breakers) ||
        f.quality ||
        any(f.tiers) ||
        any(f.itemTiers) ||
        f.exoticsOnly ||
        f.legendariesOnly ||
        f.rankedOnly ||
        f.minPower !== null
    );
  }

  // The launcher dot and bulk-tag affordance ask the same question as dimming
  // now, so this is just an alias kept for the panel's existing calls.
  const hasActiveCriteria = isFiltering;

  function matches(meta, f = filter) {
    // Domain gate first: the armor tab never matches weapons and vice versa.
    const wantArmor = f.domain === 'armor';
    if (wantArmor !== (meta.kind === 'armor')) return false;

    const text = f.text.trim().toLowerCase();
    if (text && !meta.search.includes(text)) return false;
    if (f.minPower !== null && (meta.power === null || meta.power < f.minPower)) return false;

    // Item tier (1-5) is shared across domains. An item with no tier (older
    // gear) can never match a tier constraint.
    if (f.itemTiers && f.itemTiers.length) {
      if (meta.itemTier === null || !f.itemTiers.includes(meta.itemTier)) return false;
    }

    // Grade multi-select is shared: weapons use their endgame tier, armor uses
    // its set-bonus grades. For armor, ANY of the set's bonuses may match by
    // default, since a set can be S at 4 pieces and C at 2. setPieces narrows
    // that to only the 2- or 4-piece bonus, so "S at 4 pieces" is expressible.
    if (wantArmor) {
      // Which bonuses count, given the piece-count qualifier.
      const relevant = f.setPieces
        ? (meta.bonuses || []).filter((b) => b.pcs === f.setPieces)
        : meta.bonuses || [];
      // A piece-count filter with no matching bonus excludes the piece outright.
      if (f.setPieces && !relevant.length) return false;
      if (f.tiers && f.tiers.length) {
        if (!relevant.some((b) => f.tiers.includes(b.tier))) return false;
      }
    } else if (f.tiers && f.tiers.length) {
      if (meta.tier === null || !f.tiers.includes(meta.tier)) return false;
    }

    if (wantArmor) {
      if (f.armorSlots.length && !f.armorSlots.includes(meta.armorSlot)) return false;
      if (f.armorClasses.length && !f.armorClasses.includes(meta.armorClass)) return false;
      if (f.stats.length && !f.stats.includes(meta.stat)) return false;
      if (f.armorTags.length && !f.armorTags.some((t) => (meta.tags || []).includes(t))) return false;
      return true;
    }

    // --- weapons ---
    if (f.slot && meta.slot !== f.slot) return false;
    if (f.type && meta.type !== f.type) return false;
    if (f.elements && f.elements.length && !f.elements.includes(meta.element)) return false;
    if (f.breakers && f.breakers.length && !f.breakers.includes(meta.breaker)) return false;
    if (f.exoticsOnly && !meta.exotic) return false;
    if (f.legendariesOnly && meta.exotic) return false;

    const ranked = meta.overall !== null || meta.category !== null;
    if (f.rankedOnly && !ranked) return false;

    if (f.quality) {
      const band = QUALITY[f.quality];
      if (band && !band.test(meta)) return false;
    }

    return true;
  }

  function clearFilterClasses(el, meta) {
    el.classList.remove(IN_CLASS);
    (meta?.wrapper || el.closest('.item-drag-container') || el).classList.remove(OUT_CLASS);
  }

  function applyToItem(meta) {
    if (!isFiltering()) {
      meta.el.classList.remove(IN_CLASS);
      meta.wrapper.classList.remove(OUT_CLASS);
      return false;
    }
    const hit = matches(meta);
    meta.el.classList.toggle(IN_CLASS, hit);
    meta.wrapper.classList.toggle(OUT_CLASS, !hit);
    return hit;
  }

  function applyFilter() {
    prune();

    const root = document.documentElement;
    const active = isFiltering();
    root.classList.toggle(ROOT_ACTIVE, active);
    root.classList.toggle(ROOT_HIDE, active && filter.hideOthers);

    let hits = 0;
    for (const meta of index.values()) if (applyToItem(meta)) hits += 1;
    return active ? hits : index.size;
  }

  // -------------------------------------------------------------------------
  // Full-inventory sweep (defeat DIM's list virtualization)
  // -------------------------------------------------------------------------

  /**
   * Find the element that actually scrolls the inventory. DIM has changed this
   * over time (window vs an inner main region), so we detect it rather than
   * hard-code a class: walk up from a known weapon tile to the nearest ancestor
   * that both overflows and is scrollable. Fall back to the scrolling element
   * (documentElement/body) when the whole page scrolls.
   */
  function findScroller() {
    const probe = document.querySelector('.sub-bucket .item, .store-cell .item');
    let node = probe?.parentElement;
    while (node && node !== document.body) {
      const style = getComputedStyle(node);
      const scrolls = /(auto|scroll|overlay)/.test(style.overflowY);
      if (scrolls && node.scrollHeight > node.clientHeight + 4) return node;
      node = node.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  let sweeping = false;

  // -------------------------------------------------------------------------
  // Tagging (drives DIM's own tag shortcuts; never touches storage directly)
  // -------------------------------------------------------------------------

  /**
   * DIM's documented keyboard shortcuts, fired while an item popup is open:
   *   Shift+0 clear, Shift+1 Favorite, Shift+2 Keep, Shift+3 Junk,
   *   Shift+4 Infuse, Shift+5 Archive.
   * We use DIM's own code path rather than writing tags directly, so behaviour,
   * lock-syncing and storage all stay exactly as if the user did it by hand.
   * https://github.com/DestinyItemManager/DIM/wiki/Keyboard-Shortcuts
   */
  const TAGS = {
    clear: { key: '0', label: 'Clear tag' },
    favorite: { key: '1', label: 'Favorite' },
    keep: { key: '2', label: 'Keep' },
    junk: { key: '3', label: 'Junk' },
    infuse: { key: '4', label: 'Infuse' },
    archive: { key: '5', label: 'Archive' },
  };

  let tagging = false;

  /** Fire a Shift+<digit> keyboard event the way DIM's hotkey layer listens for it. */
  function fireTagKey(digit) {
    const opts = {
      key: digit,
      code: `Digit${digit}`,
      keyCode: 48 + Number(digit),
      which: 48 + Number(digit),
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    };
    const target = document.activeElement || document.body;
    target.dispatchEvent(new KeyboardEvent('keydown', opts));
    target.dispatchEvent(new KeyboardEvent('keyup', opts));
  }

  function popupOpen() {
    // DIM's item popup is a positioned sheet; it carries an "item-popup" marker.
    return document.querySelector('.item-popup, [class*="itemPopup"], [role="dialog"]');
  }

  async function waitFor(fn, timeout = 1200, gap = 40) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const v = fn();
      if (v) return v;
      await wait(gap);
    }
    return null;
  }

  /**
   * Apply a tag to every weapon currently passing the filter, by driving DIM's
   * UI once per weapon: open the item popup, fire the tag shortcut, close it.
   *
   * This is a bulk write to your DIM tags, so panel.js must confirm the count
   * with the user first. Tags are non-destructive metadata -- reversible with
   * the "Clear tag" action or DIM's own Shift+0 -- and nothing here moves,
   * deletes, or dismantles anything.
   *
   * onProgress({ done, total, name }) is called per item. Returns a summary.
   */
  async function tagMatching(tagId, onProgress) {
    const tag = TAGS[tagId];
    if (!tag) throw new Error(`unknown tag "${tagId}"`);
    if (tagging) return { done: 0, total: 0, failed: 0, aborted: true };
    tagging = true;

    try {
      // Snapshot up front: tagging can change what DIM renders, and we do not
      // want the set shifting under us mid-run. One connected element per
      // weapon copy.
      const targets = [];
      for (const meta of index.values()) {
        if (meta.el.isConnected && matches(meta)) targets.push(meta);
      }

      let done = 0;
      let failed = 0;

      for (const meta of targets) {
        if (!tagging) break; // cancelled
        if (!meta.el.isConnected) {
          failed += 1;
          continue;
        }

        meta.el.scrollIntoView({ block: 'center', inline: 'center' });
        await nextFrame();

        // Open the item popup for this tile.
        meta.el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        const popup = await waitFor(popupOpen);

        if (popup) {
          fireTagKey(tag.key);
          await wait(60);
          // Close the popup: Escape is DIM's dismiss.
          document.body.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true })
          );
          await waitFor(() => !popupOpen(), 800);
          done += 1;
        } else {
          failed += 1;
        }

        if (onProgress) onProgress({ done, total: targets.length, failed, name: meta.name });
        await wait(30);
      }

      return { done, total: targets.length, failed, aborted: !tagging };
    } finally {
      tagging = false;
    }
  }

  function cancelTagging() {
    tagging = false;
  }

  async function sweep(onProgress) {
    if (sweeping) return index.size;
    sweeping = true;
    try {
      const scroller = findScroller();
      const isWindow =
        scroller === document.scrollingElement || scroller === document.documentElement;

      const getTop = () => (isWindow ? window.scrollY : scroller.scrollTop);
      const setTop = (v) => (isWindow ? window.scrollTo(0, v) : (scroller.scrollTop = v));
      const viewport = isWindow ? window.innerHeight : scroller.clientHeight;
      const maxScroll = () =>
        (isWindow
          ? (document.scrollingElement || document.documentElement).scrollHeight
          : scroller.scrollHeight) - viewport;

      const original = getTop();

      // Step by ~85% of a viewport so consecutive windows overlap slightly and
      // no row is skipped between DIM's render passes.
      const step = Math.max(200, Math.floor(viewport * 0.85));
      let lastSeen = -1;
      let stable = 0;

      for (let pos = 0; ; pos += step) {
        const target = Math.min(pos, maxScroll());
        setTop(target);
        // Let DIM render the newly-visible window, then let our observer index it.
        await nextFrame();
        await wait(90);
        await nextFrame();

        if (onProgress && maxScroll() > 0) {
          onProgress(Math.min(1, target / maxScroll()));
        }

        // Stop once we are at the bottom AND the index has stopped growing for a
        // couple of steps (DIM's scrollHeight can grow as tall rows render in).
        if (target >= maxScroll()) {
          if (index.size === lastSeen) stable += 1;
          else stable = 0;
          lastSeen = index.size;
          if (stable >= 2) break;
        }
      }

      // Restore where the user was.
      setTop(original);
      await nextFrame();
      if (onProgress) onProgress(1);
      return index.size;
    } finally {
      sweeping = false;
    }
  }

  // -------------------------------------------------------------------------
  // Public surface for panel.js
  // -------------------------------------------------------------------------

  const SORTS = {
    category: (a, b) =>
      (a.category ?? Infinity) - (b.category ?? Infinity) ||
      (a.overall ?? Infinity) - (b.overall ?? Infinity) ||
      a.name.localeCompare(b.name),
    overall: (a, b) =>
      (a.overall ?? Infinity) - (b.overall ?? Infinity) ||
      (a.category ?? Infinity) - (b.category ?? Infinity) ||
      a.name.localeCompare(b.name),
    power: (a, b) => (b.power ?? -1) - (a.power ?? -1) || a.name.localeCompare(b.name),
    name: (a, b) => a.name.localeCompare(b.name),
    tier: (a, b) =>
      (TIER_INDEX.get(a.tier) ?? Infinity) - (TIER_INDEX.get(b.tier) ?? Infinity) ||
      (a.category ?? Infinity) - (b.category ?? Infinity) ||
      a.name.localeCompare(b.name),
  };

  globalThis.LGGCore = {
    WEAPON_TYPES,
    SLOTS,
    DAMAGE_TYPES,
    // [{ id, label }] in display order, for the quality control.
    QUALITY_BANDS: Object.entries(QUALITY).map(([id, b]) => ({ id, label: b.label })),
    // Armor vocabulary for the armor tab. Empty when armor.js is absent, which
    // the panel uses to decide whether to offer the tab at all.
    ARMOR_AVAILABLE: Boolean(ARMOR),
    ARMOR_SLOTS,
    ARMOR_CLASSES,
    ARMOR_STAT_NAMES,
    ARMOR_TAGS,
    ARMOR_SET_COUNT: ARMOR?.setCount || 0,

    // Champion breaker types: [{ id, label }] in display order.
    BREAKERS,
    // Item tier values (1-5), shared by both domains.
    ITEM_TIERS: [1, 2, 3, 4, 5],

    // Endgame Analysis tier letters, in the sheet's own order.
    TIER_ORDER,
    // Grade -> full definition, and a short form for tight UI spots.
    TIER_MEANINGS,
    TIER_SHORT,
    // Grades that are off the PvE quality axis (F = PvP only).
    TIER_OFF_AXIS: [...TIER_OFF_AXIS],
    // What the scale is grading, e.g. "endgame PvE".
    TIER_SCOPE,
    // Attribution for the two data sources, shown as links in the panel footer.
    // Both are third-party community data, not ours; crediting them is required.
    RANK_SOURCE: {
      name: 'light.gg',
      // The public popularity list these ranks are exported from.
      url: 'https://www.light.gg/god-roll/popular/weapons/',
    },
    TIER_SOURCE: {
      // The spreadsheet itself (from tiers.js), plus its authors' hub.
      name: globalThis.LGG_TIERS?.sourceName || 'Endgame Analysis',
      url: globalThis.LGG_TIERS?.source || '',
      authorName: 'The Aegis Relic',
      authorUrl: 'https://linktr.ee/TheAegisRelic',
      count: globalThis.LGG_TIERS?.count || 0,
    },

    getFilter: () => ({ ...filter }),

    /**
     * Merge criteria into the active filter and repaint. Returns match count.
     *
     * element/tier accept either a scalar (back-compat, e.g. { element: 'Void' })
     * or an array (multi-select, e.g. { elements: ['Void', 'Arc'] }). Both land
     * in the plural array fields.
     */
    setFilter(patch) {
      const next = { ...filter, ...patch };
      // Fold any singular aliases into the plural arrays.
      if ('element' in patch) next.elements = normalizeMulti(patch.element);
      if ('elements' in patch) next.elements = normalizeMulti(patch.elements);
      if ('tier' in patch) next.tiers = normalizeMulti(patch.tier);
      if ('tiers' in patch) next.tiers = normalizeMulti(patch.tiers);
      // Multi-selects accept a scalar too, for symmetry.
      for (const key of ['armorSlots', 'armorClasses', 'stats', 'armorTags', 'breakers', 'itemTiers']) {
        if (key in patch) next[key] = normalizeMulti(patch[key]);
      }
      delete next.element;
      delete next.tier;
      filter = next;
      return applyFilter();
    },

    reset() {
      filter = { ...EMPTY_FILTER };
      return applyFilter();
    },

    isFiltering: () => isFiltering(),

    /** True only when the user has applied a real criterion (not just a tab). */
    hasActiveCriteria: () => hasActiveCriteria(),

    /** Weapons currently passing the filter, sorted. */
    results(sort = 'category') {
      prune();
      const compare = SORTS[sort] || SORTS.category;
      const list = [];
      for (const meta of index.values()) if (matches(meta)) list.push(meta);
      return list.sort(compare);
    },

    /**
     * Count of indexed items in the active domain, regardless of filter. This is
     * the denominator for "N of M": on the armor tab it must count armor, not the
     * whole index (which also holds every weapon), and vice versa.
     */
    total() {
      prune();
      const wantArmor = filter.domain === 'armor';
      let n = 0;
      for (const meta of index.values()) {
        if ((meta.kind === 'armor') === wantArmor) n += 1;
      }
      return n;
    },

    /**
     * Which options are actually present on screen, for building the UI.
     * Counts let the panel show how many weapons each control would match and
     * disable ones that would return nothing.
     */
    facets() {
      prune();
      const f = {
        slots: new Set(),
        types: new Set(),
        elements: new Set(), // which elements exist on screen (presence)
        elementCounts: {}, // element -> filter-aware count
        breakers: {}, // breaker id -> filter-aware count
        itemTiers: {}, // item tier 1-5 -> filter-aware count (both domains)
        exotics: 0,
        legendaries: 0,
        quality: {},
        tiers: {}, // grade -> filter-aware count
      };
      for (const id of Object.keys(QUALITY)) f.quality[id] = 0;
      for (const t of TIER_ORDER) f.tiers[t] = 0;
      for (const e of DAMAGE_TYPES) f.elementCounts[e] = 0;
      for (const b of BREAKERS) f.breakers[b.id] = 0;
      for (let t = 1; t <= 5; t += 1) f.itemTiers[t] = 0;

      // Counts respect the OTHER active filters, so a control's numbers describe
      // the set you would actually get if you picked that option now. Each
      // dimension is counted against the filter with its own field neutralized,
      // otherwise, say, the tier counts would still show whole-inventory numbers
      // while "Only exotics" is checked -- the bug that made the filters look
      // broken. "presence" facets (which slots/types/elements exist) ignore the
      // filter entirely, since disabling an option you can still reach would be
      // worse than showing a zero next to it.
      // Each dimension's counts are computed against the filter with its OWN
      // field neutralized, so a multi-select's numbers describe what adding that
      // option would yield alongside the other active filters.
      const forDim = (overrides) => ({ ...filter, ...overrides });
      const fTier = forDim({ tiers: [] });
      const fElement = forDim({ elements: [] });
      const fExotic = forDim({ exoticsOnly: false, legendariesOnly: false });
      const fQuality = forDim({ quality: null });
      const fSlot = forDim({ armorSlots: [] });
      const fClass = forDim({ armorClasses: [] });
      const fStat = forDim({ stats: [] });
      const fTags = forDim({ armorTags: [] });
      const fBreaker = forDim({ breakers: [] });
      const fItemTier = forDim({ itemTiers: [] });

      // Armor facet buckets.
      f.armorSlots = {};
      f.armorClasses = {};
      f.stats = {};
      f.armorTags = {};
      for (const s of ARMOR_SLOTS) f.armorSlots[s] = 0;
      for (const c of ARMOR_CLASSES) f.armorClasses[c] = 0;
      for (const s of ARMOR_STAT_NAMES) f.stats[s] = 0;
      for (const t of ARMOR_TAGS) f.armorTags[t] = 0;

      for (const meta of index.values()) {
        // Item tier applies to both domains.
        if (meta.itemTier && f.itemTiers[meta.itemTier] !== undefined && matches(meta, fItemTier)) {
          f.itemTiers[meta.itemTier] += 1;
        }

        if (meta.kind === 'armor') {
          if (meta.armorSlot !== null && f.armorSlots[meta.armorSlot] !== undefined && matches(meta, fSlot)) {
            f.armorSlots[meta.armorSlot] += 1;
          }
          if (meta.armorClass && f.armorClasses[meta.armorClass] !== undefined && matches(meta, fClass)) {
            f.armorClasses[meta.armorClass] += 1;
          }
          if (meta.stat && f.stats[meta.stat] !== undefined && matches(meta, fStat)) {
            f.stats[meta.stat] += 1;
          }
          for (const t of meta.tags || []) {
            if (f.armorTags[t] !== undefined && matches(meta, fTags)) f.armorTags[t] += 1;
          }
          // Armor grades: count every graded bonus the set carries.
          // Grade counts honour the active piece-count scope, so picking "4pc"
          // makes the S/A/... counts reflect only the 4-piece bonuses.
          for (const b of meta.bonuses || []) {
            if (filter.setPieces && b.pcs !== filter.setPieces) continue;
            if (b.tier && f.tiers[b.tier] !== undefined && matches(meta, fTier)) f.tiers[b.tier] += 1;
          }
          continue;
        }

        // Presence: what exists on screen at all.
        if (meta.slot) f.slots.add(meta.slot);
        if (meta.type) f.types.add(meta.type);
        if (meta.element) f.elements.add(meta.element);

        // Filter-aware counts.
        if (meta.exotic && matches(meta, fExotic)) f.exotics += 1;
        if (!meta.exotic && matches(meta, fExotic)) f.legendaries += 1;
        if (meta.element && f.elementCounts[meta.element] !== undefined && matches(meta, fElement)) {
          f.elementCounts[meta.element] += 1;
        }
        if (meta.breaker && f.breakers[meta.breaker] !== undefined && matches(meta, fBreaker)) {
          f.breakers[meta.breaker] += 1;
        }
        if (meta.tier && f.tiers[meta.tier] !== undefined && matches(meta, fTier)) {
          f.tiers[meta.tier] += 1;
        }
        for (const [id, band] of Object.entries(QUALITY)) {
          if (band.test(meta) && matches(meta, fQuality)) f.quality[id] += 1;
        }
      }
      return f;
    },

    /** Scroll a weapon into view and flash it. */
    reveal(meta) {
      if (!meta?.el?.isConnected) return;
      meta.el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      meta.el.classList.remove('lggf-flash');
      // Force a reflow so the animation restarts on repeat clicks.
      void meta.el.offsetWidth;
      meta.el.classList.add('lggf-flash');
      setTimeout(() => meta.el.classList.remove('lggf-flash'), 1600);
    },

    // [{ id, label }] for the tag actions, in a sensible order.
    TAGS: ['junk', 'archive', 'keep', 'favorite', 'infuse', 'clear'].map((id) => ({
      id,
      label: TAGS[id].label,
    })),

    /**
     * Apply a DIM tag to every weapon currently passing the filter. This is a
     * bulk write -- panel.js confirms the count first. Returns a summary object.
     */
    tagMatching,

    /** Abort an in-progress tagMatching run. */
    cancelTagging,

    /**
     * Force DIM to render every weapon tile, so the index covers the whole
     * inventory instead of only what is on screen.
     *
     * DIM virtualizes its lists: off-screen tiles are not in the DOM at all, so
     * we can only see a weapon after DIM has scrolled it near the viewport. This
     * steps the scroll container from top to bottom, pausing for DIM to render
     * and for our observer to index each batch, then restores the original
     * position. Returns the total indexed after the sweep.
     *
     * onProgress(fraction 0..1) is called as it goes, for a progress bar.
     */
    sweep,

    /** Called whenever the set of on-screen weapons changes. */
    onChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };

  // -------------------------------------------------------------------------
  // Observation
  // -------------------------------------------------------------------------

  // Mutations arrive in bursts while DIM renders a vault full of items. Batch
  // them into a single animation-frame pass.
  let queued = new Set();
  let frame = null;

  function flush() {
    frame = null;
    const batch = queued;
    queued = new Set();
    ownerLabels = null; // DIM may have re-rendered the store header
    let changed = false;
    for (const node of batch) changed = scan(node) || changed;
    if (changed) notify();
  }

  function enqueue(node) {
    queued.add(node);
    // DIM fills a tile in stages: the .item shell first, then the element icon,
    // power span and other bits get injected as descendants in later passes.
    // Those descendant additions must re-trigger processing of the *enclosing*
    // tile, otherwise the tile's element/power stay stuck at their first-read
    // (often empty) values. scan() only descends, so add the ancestor here.
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tile = node.closest?.('div.item[title]');
      if (tile && tile !== node) queued.add(tile);
    }
    if (frame === null) frame = requestAnimationFrame(flush);
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        for (const added of m.addedNodes) {
          if (added.nodeType === Node.ELEMENT_NODE) enqueue(added);
        }
        // A removed subtree may have held indexed items; prune on the next pass.
        if (m.removedNodes.length) notify();
      } else if (m.type === 'attributes' && m.target.nodeType === Node.ELEMENT_NODE) {
        // `title` swapped on a recycled node, or `class` changed so the node now
        // matches div.item.
        enqueue(m.target);
      }
    }
  });

  function start() {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['title', 'class'],
    });
    scan(document.body); // initial sweep for anything rendered before we attached
    notify();
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
