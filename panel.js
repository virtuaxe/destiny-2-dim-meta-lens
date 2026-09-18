/**
 * DIM light.gg Popularity Rank - filter panel
 *
 * A non-modal panel docked bottom-right that answers two questions:
 *   "what is the best pulse rifle I own in the kinetic slot?"  -> the ranked
 *      result list, sorted by category rank, top row is the answer
 *   "show me only my best weapons"                             -> the Best Only
 *      control, which filters the actual inventory grid
 *
 * Design notes:
 *   - Non-destructive by default. Non-matching tiles fade rather than vanish, so
 *     DIM's layout never jumps and drag-to-transfer keeps working. "Hide others"
 *     is opt-in for when you want a clean grid.
 *   - Facet-driven. Slot / type / element options are built from what is
 *     actually on screen, so you never pick a filter that returns nothing.
 *   - Every control is a real form element inside a <form>, so the panel is
 *     fully keyboard operable and screen-reader legible. Result rows are
 *     buttons that scroll the tile into view and flash it.
 *   - Nothing here writes to DIM's own state. The panel only toggles CSS classes
 *     via LGGCore, so closing or removing the extension leaves DIM untouched.
 *
 * All class names are prefixed lggf- because content script CSS shares the page.
 */

(() => {
  'use strict';

  const CORE = globalThis.LGGCore;
  if (!CORE) {
    console.error('[lgg-rank] panel.js loaded without LGGCore; check manifest script order.');
    return;
  }

  const MAX_RESULTS = 60;
  const ELEMENT_ORDER = CORE.DAMAGE_TYPES;
  // Quality bands come from the core (best AND worst), plus an "Any" option.
  const QUALITY_OPTIONS = [
    { label: 'Any', value: null },
    ...CORE.QUALITY_BANDS.map((b) => ({ label: b.label, value: b.id })),
  ];

  let panel = null;
  let launcher = null;
  let open = false;
  let sort = 'category';
  let sweeping = false;
  let sweptOnce = false;
  let lastScanAt = null; // Date of the most recent completed full scan
  const els = {}; // cached references to the live controls
  // Collapsed/expanded state per collapsible field, remembered across renders.
  const collapseState = {};

  // -------------------------------------------------------------------------
  // Small DOM helpers
  // -------------------------------------------------------------------------

  function h(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') throw new Error('refusing to set innerHTML');
      else if (k.startsWith('on') && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'dataset') Object.assign(node.dataset, v);
      else node.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of [].concat(children)) {
      if (c === null || c === undefined) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  }

  /**
   * Segmented control styled as buttons.
   *
   * Single-select (default): radios; onChange receives the picked value.
   * Multi-select (multiple: true): checkboxes; `values` is the selected array,
   * and onChange receives the new array. The "Any" option (value null) clears
   * the whole selection, and selecting all real options is equivalent to Any.
   */
  function segmented({ name, legend, options, value, values, multiple, onChange, available }) {
    const selected = multiple ? new Set(values || []) : null;
    const group = h('div', {
      class: 'lggf-seg',
      role: multiple ? 'group' : 'radiogroup',
      'aria-label': legend,
    });

    for (const opt of options) {
      const id = `lggf-${name}-${String(opt.value ?? 'any').replace(/\W+/g, '')}`;
      const disabled = available ? opt.value !== null && !available.has(opt.value) : false;
      const isAny = opt.value === null;
      const checked = multiple
        ? isAny
          ? selected.size === 0
          : selected.has(opt.value)
        : opt.value === value;

      const input = h('input', {
        type: multiple && !isAny ? 'checkbox' : multiple ? 'radio' : 'radio',
        // In multi mode the "Any" pseudo-option stays a radio-like reset; real
        // options are checkboxes. They share a name only in single mode.
        class: 'lggf-seg__input',
        name: multiple && !isAny ? `lggf-${name}-${opt.value}` : `lggf-${name}`,
        id,
        value: String(opt.value ?? ''),
        checked,
        disabled,
        onChange: () => {
          if (!multiple) return onChange(opt.value);
          if (isAny) return onChange([]); // clear
          const nextSet = new Set(selected);
          if (nextSet.has(opt.value)) nextSet.delete(opt.value);
          else nextSet.add(opt.value);
          onChange([...nextSet]);
        },
      });

      const labelChildren = [];
      // Optional leading icon (breaker types).
      if (opt.icon) {
        labelChildren.push(
          h('img', { class: 'lggf-seg__icon', src: opt.icon, alt: '', 'aria-hidden': 'true' })
        );
      }
      labelChildren.push(h('span', { text: opt.label }));
      if (typeof opt.count === 'number') {
        labelChildren.push(h('span', { class: 'lggf-seg__count', text: String(opt.count) }));
      }
      const label = h('label', { class: 'lggf-seg__label', for: id }, labelChildren);
      if (opt.hint) label.title = disabled ? `${opt.hint}\n(none on screen)` : opt.hint;
      else if (disabled) label.title = 'None on screen';
      else if (typeof opt.count === 'number') label.title = `${opt.count} on screen`;

      group.append(input, label);
    }
    return group;
  }

  /**
   * Collapsible legend explaining the grade scale.
   *
   * Worth the space because the scale is not the good-to-bad ramp people assume:
   * D and E mean "negligible in PvE" while F means "PvP only", so an F weapon can
   * be a Crucible staple. Without this, a wall of F grades reads as "these are
   * all garbage", which is simply wrong.
   */
  function tierLegend() {
    const order = CORE.TIER_ORDER || [];
    if (!order.length) return null;

    const rows = order.map((t) => {
      const offAxis = (CORE.TIER_OFF_AXIS || []).includes(t);
      return h('li', { class: 'lggf-legend__row' }, [
        h('span', {
          class: `lggf-tierpill lggf-tierpill--${t.toLowerCase()}`,
          text: t,
        }),
        h('span', { class: 'lggf-legend__text', text: CORE.TIER_MEANINGS?.[t] || '' }),
        offAxis
          ? h('span', {
              class: 'lggf-legend__flag',
              text: 'not a PvE ranking',
              title: 'This grade describes PvP usefulness, so it is not the bottom of the PvE scale.',
            })
          : null,
      ]);
    });

    return h('details', { class: 'lggf-legend' }, [
      h('summary', { class: 'lggf-legend__summary', text: 'What do the grades mean?' }),
      h('p', {
        class: 'lggf-legend__intro',
        text: `Grades a weapon's contribution to ${CORE.TIER_SCOPE} at its god roll. The grade assumes the ideal perk combo \u2014 a weapon can only reach its grade with the right roll, and this extension can't see which roll you have. Higher is also not always "better overall": read F carefully.`,
      }),
      h('ul', { class: 'lggf-legend__list' }, rows),
    ]);
  }

  /** External source link with safe target/rel. */
  function sourceLink(text, url, title) {
    return h('a', {
      class: 'lggf-credit__link',
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
      text,
      title: title || url,
    });
  }

  /**
   * Attribution footer. Both datasets are third-party community work, so each
   * gets a real link back to its source: popularity to light.gg's public list,
   * tiers to the Endgame Analysis sheet and to its authors' hub.
   */
  function creditFooter() {
    const rank = CORE.RANK_SOURCE || {};
    const tier = CORE.TIER_SOURCE || {};

    const children = [];

    // Popularity ranks -> light.gg.
    if (rank.url) {
      children.push(
        h('div', { class: 'lggf-credit__row' }, [
          h('span', { class: 'lggf-credit__label', text: 'Popularity: ' }),
          sourceLink(rank.name || 'light.gg', rank.url, 'Opens light.gg\u2019s popular weapons list'),
        ])
      );
    }

    // Endgame tiers -> the spreadsheet, and its authors.
    if (tier.url || tier.authorUrl) {
      const row = h('div', { class: 'lggf-credit__row' }, [
        h('span', { class: 'lggf-credit__label', text: 'Tiers: ' }),
      ]);
      if (tier.url) {
        row.appendChild(
          sourceLink(
            tier.name || 'Endgame Analysis',
            tier.url,
            `${tier.count || 0} graded weapons \u2014 opens the source spreadsheet`
          )
        );
      }
      if (tier.authorUrl) {
        row.appendChild(h('span', { class: 'lggf-credit__by', text: ' by ' }));
        row.appendChild(
          sourceLink(tier.authorName || 'author', tier.authorUrl, 'Opens the authors\u2019 links')
        );
      }
      children.push(row);
    }

    if (!children.length) return null;
    return h('div', { class: 'lggf-credit' }, children);
  }

  /**
   * Short legend for the armor grades. Reuses the tier meanings, but leads with
   * the piece-count caveat, which is the thing people get wrong: a set graded S
   * is only S once you are actually wearing that many pieces of it.
   */
  function armorLegend() {
    if (!CORE.ARMOR_AVAILABLE) return null;
    return h('details', { class: 'lggf-legend' }, [
      h('summary', { class: 'lggf-legend__summary', text: 'How armor grades work' }),
      h('p', {
        class: 'lggf-legend__intro',
        text:
          'Badges read like "S4" \u2014 grade S, earned at 4 pieces. A set is graded ' +
          'separately at 2 and 4 pieces and the two often differ a lot, so wearing ' +
          'one piece of an S-tier set gets you nothing. Centre badge is the higher ' +
          'requirement, bottom-left the lower. Same S..F scale as weapons, and F ' +
          'still means PvP-only rather than worst.',
      }),
      h('p', {
        class: 'lggf-legend__intro',
        text: `${CORE.ARMOR_SET_COUNT} sets graded. Exotic and legacy armor has no set bonus, so it gets no badge.`,
      }),
    ]);
  }

  /**
   * A labelled filter row.
   *
   * opts.collapsible makes the label a toggle that hides the control, so a busy
   * tab (armor has seven fields) doesn't push the results list off screen. When
   * collapsed, a summary of the current selection rides on the label row so the
   * field isn't opaque -- "Class: Warlock" rather than just a hidden control.
   * The collapsed default is remembered per label in collapseState, so it sticks
   * across the panel re-rendering its facets.
   */
  function field(labelText, control, hint, opts = {}) {
    const row = h('div', { class: 'lggf-field' }, [
      h('span', { class: 'lggf-field__label', text: labelText }),
      control,
      hint ? h('span', { class: 'lggf-field__hint', text: hint }) : null,
    ]);

    if (!opts.collapsible) return row;

    row.classList.add('lggf-field--collapsible');
    const key = opts.key || labelText;
    if (!(key in collapseState)) collapseState[key] = opts.collapsed === true;

    // Swap the plain label for a toggle button carrying a live summary.
    const labelEl = row.querySelector('.lggf-field__label');
    const summary = h('span', { class: 'lggf-field__summary' });
    const toggle = h('button', {
      type: 'button',
      class: 'lggf-field__toggle',
      'aria-expanded': 'false',
      onClick: () => setCollapsed(key, !collapseState[key]),
    }, [
      h('span', { class: 'lggf-field__caret', 'aria-hidden': 'true' }),
      h('span', { class: 'lggf-field__label', text: labelText }),
      summary,
    ]);
    labelEl.replaceWith(toggle);

    row.dataset.collapseKey = key;
    applyCollapsed(row, key);
    return row;
  }

  /** Reflect a field's collapsed state into the DOM. */
  function applyCollapsed(row, key) {
    const collapsed = collapseState[key] === true;
    row.classList.toggle('lggf-field--collapsed', collapsed);
    const toggle = row.querySelector('.lggf-field__toggle');
    if (toggle) toggle.setAttribute('aria-expanded', String(!collapsed));
    // Summary of the current selection, shown only while collapsed.
    const summary = row.querySelector('.lggf-field__summary');
    if (summary) summary.textContent = collapsed ? collapseSummary(key) : '';
  }

  function setCollapsed(key, collapsed) {
    collapseState[key] = collapsed;
    const row = panel.querySelector(`.lggf-field[data-collapse-key="${cssEscape(key)}"]`);
    if (row) applyCollapsed(row, key);
  }

  /** A short "what's selected" string for a collapsed field. */
  function collapseSummary(key) {
    const f = CORE.getFilter();
    const fmt = (arr) => (arr && arr.length ? arr.join(', ') : 'Any');
    switch (key) {
      case 'Class':
        return fmt(f.armorClasses);
      case 'ArmorSlot':
        return fmt(f.armorSlots);
      case 'Slot':
        return f.slot || 'Any';
      case 'Type':
        return f.type || 'Any';
      case 'Element':
        return fmt(f.elements);
      case 'Stat':
        return fmt(f.stats);
      case 'Focus':
        return fmt(f.armorTags);
      default:
        return '';
    }
  }

  const cssEscape = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));

  /**
   * Weapons | Armor tab strip.
   *
   * A tab rather than one combined form because the two domains share almost no
   * facets: weapons have popularity, element and ammo slot; armor has set
   * bonuses, stat archetype and character class. Showing both at once would be a
   * wall of mostly-irrelevant controls. Switching tabs also switches which
   * domain the inventory filter applies to, so the other kind is simply left
   * alone rather than dimmed.
   */
  function buildTabs() {
    if (!CORE.ARMOR_AVAILABLE) return null; // no armor data -> weapons only

    const mk = (id, label) =>
      h('button', {
        type: 'button',
        class: 'lggf-tab',
        role: 'tab',
        id: `lggf-tab-${id}`,
        'aria-selected': String(id === 'weapon'),
        'aria-controls': 'lggf-panel',
        dataset: { domain: id },
        text: label,
        onClick: () => setDomain(id),
      });

    els.tabWeapon = mk('weapon', 'Weapons');
    els.tabArmor = mk('armor', 'Armor');
    els.tabs = h('div', { class: 'lggf-tabs', role: 'tablist', 'aria-label': 'Filter by weapons or armor' }, [
      els.tabWeapon,
      els.tabArmor,
    ]);
    return els.tabs;
  }

  /** Switch domain: swap the visible field group and re-run the filter. */
  function setDomain(domain) {
    if (CORE.getFilter().domain === domain) return;
    // Clear the other domain's criteria so a stale weapon filter can't silently
    // constrain the armor view (or vice versa).
    CORE.reset();
    CORE.setFilter({ domain });

    if (els.tabWeapon) {
      els.tabWeapon.setAttribute('aria-selected', String(domain === 'weapon'));
      els.tabArmor.setAttribute('aria-selected', String(domain === 'armor'));
    }
    els.weaponFields.hidden = domain !== 'weapon';
    els.armorFields.hidden = domain !== 'armor';
    els.search.placeholder = domain === 'armor' ? 'Armor or set name\u2026' : 'Weapon name\u2026';
    panel.setAttribute('aria-label', domain === 'armor' ? 'Armor filter' : 'Weapon filter');
    els.title.textContent = domain === 'armor' ? 'Armor filter' : 'Weapon filter';

    syncControls();
    renderSortOptions(domain);
    renderResults();
  }

  /** Sort options differ by domain: armor has no popularity rank. */
  function renderSortOptions(domain) {
    const opts =
      domain === 'armor'
        ? [
            ['tier', 'Set grade'],
            ['power', 'Power'],
            ['name', 'Name'],
          ]
        : [
            ['category', 'Popularity (in type)'],
            ['overall', 'Popularity (overall)'],
            ['tier', 'Endgame tier'],
            ['power', 'Power'],
            ['name', 'Name'],
          ];
    // Keep the current sort if it still exists, else fall back to the first.
    const keep = opts.some(([v]) => v === sort) ? sort : opts[0][0];
    els.sort.replaceChildren(...opts.map(([value, text]) => h('option', { value, text })));
    els.sort.value = keep;
    sort = keep;
  }

  // -------------------------------------------------------------------------
  // Launcher
  // -------------------------------------------------------------------------

  function buildLauncher() {
    launcher = h('button', {
      type: 'button',
      class: 'lggf-launcher',
      'aria-expanded': 'false',
      'aria-controls': 'lggf-panel',
      title: 'Weapon filter \u2014 popularity, tier, slot, element and more',
      onClick: toggle,
    }, [
      h('span', { class: 'lggf-launcher__mark', text: 'lg', 'aria-hidden': 'true' }),
      h('span', { class: 'lggf-launcher__text', text: 'Filter' }),
      h('span', { class: 'lggf-launcher__count', text: '' }),
    ]);
    document.body.appendChild(launcher);
  }

  // -------------------------------------------------------------------------
  // Panel
  // -------------------------------------------------------------------------

  function buildPanel() {
    const f = CORE.getFilter();

    els.search = h('input', {
      type: 'search',
      class: 'lggf-input',
      id: 'lggf-search',
      placeholder: 'Weapon name\u2026',
      autocomplete: 'off',
      spellcheck: 'false',
      value: f.text,
      onInput: () => update({ text: els.search.value }),
    });

    els.slot = h('div', { class: 'lggf-slot-mount' });
    els.type = h('select', {
      class: 'lggf-select',
      id: 'lggf-type',
      onChange: () => update({ type: els.type.value || null }),
    });
    els.element = h('div', { class: 'lggf-element-mount' });
    els.breaker = h('div', { class: 'lggf-breaker-mount' });
    // Item tier gets a separate mount per tab (they can't share DOM ids).
    els.itemTierWeapon = h('div', { class: 'lggf-itemtier-mount' });
    els.itemTierArmor = h('div', { class: 'lggf-itemtier-mount' });
    els.quality = h('div', { class: 'lggf-quality-mount' });
    els.tier = h('div', { class: 'lggf-tier-mount' });

    els.exotics = h('input', {
      type: 'checkbox',
      class: 'lggf-check',
      id: 'lggf-exotics',
      checked: f.exoticsOnly,
      // Exotics and legendaries are mutually exclusive: turning one on turns the
      // other off, since a weapon can't be both.
      onChange: () => {
        if (els.exotics.checked) els.legendaries.checked = false;
        update({ exoticsOnly: els.exotics.checked, legendariesOnly: false });
      },
    });

    els.legendaries = h('input', {
      type: 'checkbox',
      class: 'lggf-check',
      id: 'lggf-legendaries',
      checked: f.legendariesOnly,
      onChange: () => {
        if (els.legendaries.checked) els.exotics.checked = false;
        update({ legendariesOnly: els.legendaries.checked, exoticsOnly: false });
      },
    });

    els.hide = h('input', {
      type: 'checkbox',
      class: 'lggf-check',
      id: 'lggf-hide',
      checked: f.hideOthers,
      onChange: () => update({ hideOthers: els.hide.checked }),
    });

    els.ranked = h('input', {
      type: 'checkbox',
      class: 'lggf-check',
      id: 'lggf-ranked',
      checked: f.rankedOnly,
      onChange: () => update({ rankedOnly: els.ranked.checked }),
    });

    els.sort = h('select', {
      class: 'lggf-select lggf-select--sm',
      id: 'lggf-sort',
      onChange: () => {
        sort = els.sort.value;
        renderResults();
      },
    }, [
      h('option', { value: 'category', text: 'Popularity (in type)' }),
      h('option', { value: 'overall', text: 'Popularity (overall)' }),
      h('option', { value: 'tier', text: 'Endgame tier' }),
      h('option', { value: 'power', text: 'Power' }),
      h('option', { value: 'name', text: 'Name' }),
    ]);

    // --- armor controls ---------------------------------------------------
    // Mount points; contents are rebuilt by renderFacets from live counts.
    els.armorSlot = h('div', { class: 'lggf-armorslot-mount' });
    els.armorClass = h('div', { class: 'lggf-armorclass-mount' });
    els.armorStat = h('div', { class: 'lggf-armorstat-mount' });
    els.armorTags = h('div', { class: 'lggf-armortags-mount' });
    // Separate grade control for armor: same letters, different meaning, and it
    // must not share DOM ids with the weapon tier radios.
    els.tierArmor = h('div', { class: 'lggf-tierarmor-mount' });
    // Piece-count scope for the set grade: Any / 2pc / 4pc.
    els.setPieces = h('div', { class: 'lggf-setpieces-mount' });

    // Power floor. A slider would imply a continuous range DIM doesn't really
    // have; a select of round thresholds is easier to hit and self-explaining.
    els.power = h('select', {
      class: 'lggf-select',
      id: 'lggf-power',
      onChange: () => update({ minPower: els.power.value ? Number(els.power.value) : null }),
    });

    els.count = h('span', { class: 'lggf-count', role: 'status', 'aria-live': 'polite' });
    els.results = h('ul', { class: 'lggf-results' });

    // Bulk-tag action: applies a DIM tag to everything currently matching.
    els.tagBtn = h('button', {
      type: 'button',
      class: 'lggf-tag',
      onClick: openTagConfirm,
    }, [h('span', { class: 'fas fa-tag app-icon', 'aria-hidden': 'true' }), h('span', { text: 'Tag matches\u2026' })]);

    els.tagRow = h('div', { class: 'lggf-tagrow' }, [els.tagBtn]);

    // "Scan all" re-runs the full-inventory sweep on demand (after DIM navigates,
    // or if the automatic sweep ran before the inventory finished loading).
    els.scan = h('button', {
      type: 'button',
      class: 'lggf-scan',
      title: scanTooltip(),
      'aria-label': 'Scan the full inventory',
      onClick: () => runSweep(true),
      // Relative time ("3 minutes ago") drifts while the panel sits open, so
      // recompute the tooltip each time the button is pointed at or focused.
      onMouseEnter: () => {
        els.scan.title = scanTooltip();
      },
      onFocus: () => {
        els.scan.title = scanTooltip();
      },
    }, [h('span', { class: 'fas fa-sync app-icon', 'aria-hidden': 'true' }), h('span', { text: 'Scan all' })]);

    els.scanBar = h('div', { class: 'lggf-scanbar__fill' });

    // Weapon-only fields, grouped so the tab can show/hide them as a unit.
    els.weaponFields = h('div', { class: 'lggf-group' }, [
      field('Slot', els.slot),
      field('Type', els.type),
      field('Element', els.element),
      field('Breaker', els.breaker, 'Champion breaker the weapon can trigger'),
      field('Item tier', els.itemTierWeapon, 'Edge of Fate item tier (dots), 1\u20135'),
      field(
        'Popularity',
        els.quality,
        'light.gg usage rank within the weapon type \u2014 popular \u2260 good'
      ),
      field(
        'Grade',
        els.tier,
        `${CORE.TIER_SCOPE} grade for the weapon\u2019s god roll \u2014 your specific roll may be lower`
      ),
      tierLegend(),
      h('div', { class: 'lggf-checks' }, [
        h('div', { class: 'lggf-checkrow' }, [
          els.exotics,
          h('label', { class: 'lggf-checklabel', for: 'lggf-exotics', text: 'Only exotics' }),
        ]),
        h('div', { class: 'lggf-checkrow' }, [
          els.legendaries,
          h('label', { class: 'lggf-checklabel', for: 'lggf-legendaries', text: 'Only legendaries' }),
        ]),
        h('div', { class: 'lggf-checkrow' }, [
          els.ranked,
          h('label', { class: 'lggf-checklabel', for: 'lggf-ranked', text: 'Only ranked weapons' }),
        ]),
      ]),
    ]);

    // Armor-only fields. The grade control is shared conceptually but rendered
    // separately, because for armor a grade belongs to the set's 2pc/4pc bonus
    // rather than to the piece.
    els.armorFields = h('div', { class: 'lggf-group', hidden: true }, [
      // Class and Slot collapse by default: they're the fields most people set
      // once (or not at all), and collapsing them keeps the set-grade controls
      // and the results list above the fold.
      field('Class', els.armorClass, null, { collapsible: true, collapsed: true, key: 'Class' }),
      field('Slot', els.armorSlot, null, { collapsible: true, collapsed: true, key: 'ArmorSlot' }),
      field('Stat', els.armorStat, 'The archetype icon DIM draws on the piece'),
      field('Item tier', els.itemTierArmor, 'Edge of Fate item tier (dots), 1\u20135'),
      field('Focus', els.armorTags, 'What the set bonus does'),
      field('Pieces', els.setPieces, 'Which set bonus the grade applies to'),
      field(
        'Set grade',
        els.tierArmor,
        'Endgame grade of the set bonus \u2014 only earned once you wear that many pieces'
      ),
      armorLegend(),
    ]);

    const form = h('form', {
      class: 'lggf-form',
      onSubmit: (e) => e.preventDefault(), // there is nothing to submit; filtering is live
    }, [
      field('Search', els.search),
      els.weaponFields,
      els.armorFields,
      // Shared across both tabs.
      field('Min power', els.power),
      h('div', { class: 'lggf-checks' }, [
        h('div', { class: 'lggf-checkrow' }, [
          els.hide,
          h('label', { class: 'lggf-checklabel', for: 'lggf-hide', text: 'Hide non-matches' }),
        ]),
      ]),
    ]);

    panel = h('section', {
      class: 'lggf-panel',
      id: 'lggf-panel',
      role: 'dialog',
      'aria-modal': 'false',
      'aria-label': 'Weapon filter',
      hidden: true,
      onKeyDown: (e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          close();
          launcher.focus();
        }
      },
    }, [
      h('header', { class: 'lggf-head' }, [
        (els.title = h('h2', { class: 'lggf-title', text: 'Weapon filter' })),
        els.scan,
        h('button', {
          type: 'button',
          class: 'lggf-reset',
          text: 'Reset',
          title: 'Clear all filters',
          onClick: () => {
            // Keep the active tab: Reset clears criteria, it does not navigate.
            const { domain } = CORE.getFilter();
            CORE.reset();
            CORE.setFilter({ domain });
            syncControls();
            refresh();
          },
        }),
        h('button', {
          type: 'button',
          class: 'lggf-close',
          'aria-label': 'Close rank filter',
          onClick: () => {
            close();
            launcher.focus();
          },
        }, [h('span', { 'aria-hidden': 'true', text: '\u00d7' })]),
      ]),
      h('div', { class: 'lggf-scanbar', 'aria-hidden': 'true' }, [els.scanBar]),
      buildTabs(),
      form,
      h('div', { class: 'lggf-resultshead' }, [
        els.count,
        h('label', { class: 'lggf-sortlabel', for: 'lggf-sort', text: 'Sort' }),
        els.sort,
      ]),
      els.tagRow,
      els.results,
      // Attribution: both data sources are third-party community work, credited
      // with real links back to where the data comes from.
      creditFooter(),
    ]);

    document.body.appendChild(panel);
  }

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  /**
   * Signature of everything renderFacets() would draw. DIM re-renders the
   * inventory constantly, and blindly rebuilding the radio inputs each time
   * would yank focus out from under a keyboard user mid-selection. So the
   * controls are only rebuilt when the options or the selection actually change.
   */
  let facetSignature = null;

  function signatureOf(filter, facets) {
    return JSON.stringify([
      [...facets.slots].sort(),
      [...facets.types].sort(),
      [...facets.elements].sort(),
      facets.elementCounts,
      facets.exotics,
      facets.legendaries,
      facets.quality,
      facets.tiers,
      filter.domain,
      filter.slot,
      filter.type,
      [...(filter.elements || [])].sort(),
      [...(filter.breakers || [])].sort(),
      [...(filter.itemTiers || [])].sort(),
      facets.breakers,
      facets.itemTiers,
      filter.quality,
      [...(filter.tiers || [])].sort(),
      filter.exoticsOnly,
      filter.legendariesOnly,
      filter.minPower,
      // armor
      facets.armorSlots,
      facets.armorClasses,
      facets.stats,
      facets.armorTags,
      [...(filter.armorSlots || [])].sort(),
      [...(filter.armorClasses || [])].sort(),
      [...(filter.stats || [])].sort(),
      [...(filter.armorTags || [])].sort(),
      filter.setPieces,
      facets.tiers,
    ]);
  }

  /** Rebuild the facet controls from what is currently on screen. */
  function renderFacets(force = false) {
    const f = CORE.getFilter();
    const facets = CORE.facets();

    const signature = signatureOf(f, facets);
    if (!force && signature === facetSignature) return;
    facetSignature = signature;

    els.slot.replaceChildren(
      segmented({
        name: 'slot',
        legend: 'Equipment slot',
        options: [{ label: 'Any', value: null }, ...CORE.SLOTS.map((s) => ({ label: s, value: s }))],
        value: f.slot,
        available: facets.slots,
        onChange: (v) => update({ slot: v }),
      })
    );

    // <select> for type: 17 options is too many for a segmented control.
    const typeOptions = [h('option', { value: '', text: 'Any weapon type' })];
    for (const t of CORE.WEAPON_TYPES) {
      const present = facets.types.has(t);
      typeOptions.push(
        h('option', {
          value: t,
          text: present ? t : `${t} \u2014 none on screen`,
          disabled: !present,
          selected: f.type === t,
        })
      );
    }
    els.type.replaceChildren(...typeOptions);
    els.type.value = f.type || '';

    // Element is multi-select: pick any combination, or Any to clear.
    els.element.replaceChildren(
      segmented({
        name: 'element',
        legend: 'Damage element (pick any combination)',
        multiple: true,
        options: [
          { label: 'Any', value: null },
          ...ELEMENT_ORDER.map((e) => {
            const count = facets.elementCounts?.[e] ?? 0;
            return { label: e, value: e, count, hint: `${e}\n${count} on screen` };
          }),
        ],
        values: f.elements,
        available: facets.elements,
        onChange: (arr) => update({ elements: arr }),
      })
    );

    // Breaker type, multi-select, with the Bungie icon on each option.
    els.breaker.replaceChildren(
      segmented({
        name: 'breaker',
        legend: 'Champion breaker (pick any combination)',
        multiple: true,
        options: [
          { label: 'Any', value: null },
          ...CORE.BREAKERS.map((b) => {
            const count = facets.breakers?.[b.id] ?? 0;
            return { label: b.label, value: b.id, count, icon: b.icon, hint: `${b.label}\n${count} on screen` };
          }),
        ],
        values: f.breakers,
        available: new Set([null, ...CORE.BREAKERS.filter((b) => (facets.breakers?.[b.id] ?? 0) > 0).map((b) => b.id)]),
        onChange: (arr) => update({ breakers: arr }),
      })
    );

    // Item tier (1-5) for the weapons tab.
    renderItemTierControl(els.itemTierWeapon, f, facets);

    // Quality band. Options that would match nothing on screen are disabled and
    // annotated with their count, so "Bottom half" doesn't look broken when the
    // current view happens to hold only top-tier weapons.
    els.quality.replaceChildren(
      segmented({
        name: 'quality',
        legend: 'Popularity within weapon type',
        options: QUALITY_OPTIONS.map((o) =>
          o.value === null
            ? o
            : { ...o, label: o.label, count: facets.quality[o.value] ?? 0 }
        ),
        value: f.quality,
        // "Any" is always allowed; a band is allowed only if it has matches.
        available: new Set(
          QUALITY_OPTIONS.filter((o) => o.value === null || (facets.quality[o.value] ?? 0) > 0).map(
            (o) => o.value
          )
        ),
        onChange: (v) => update({ quality: v }),
      })
    );

    // Tier control. Multi-select of exact grades (not a floor): pick S and A
    // together, or just F. A floor model was wrong here -- F means "PvP only",
    // not "worst", so "F and above" was both meaningless and confusing. Each
    // count is the real number of that grade under the other active filters.
    const tierOptions = [{ label: 'Any', value: null }];
    for (const t of CORE.TIER_ORDER) {
      const count = facets.tiers[t] ?? 0;
      const offAxis = (CORE.TIER_OFF_AXIS || []).includes(t);
      tierOptions.push({
        label: t,
        value: t,
        count,
        hint:
          `${t} \u2014 ${CORE.TIER_MEANINGS?.[t] || ''}` +
          (offAxis ? '\n(not a PvE quality grade)' : '') +
          `\n${count} on screen`,
      });
    }
    els.tier.replaceChildren(
      segmented({
        name: 'tier',
        legend: 'Endgame tier (pick any combination)',
        multiple: true,
        options: tierOptions,
        values: f.tiers,
        // A grade is selectable only if something on screen has it.
        available: new Set([null, ...CORE.TIER_ORDER.filter((t) => (facets.tiers[t] ?? 0) > 0)]),
        onChange: (arr) => update({ tiers: arr }),
      })
    );

    els.exotics.disabled = facets.exotics === 0 && !CORE.getFilter().exoticsOnly;
    els.legendaries.disabled = facets.legendaries === 0 && !CORE.getFilter().legendariesOnly;

    renderArmorFacets(f, facets);
    renderPowerOptions(f);
  }

  /** Item-tier (1-5) multi-select. Shared shape for both tabs. */
  function renderItemTierControl(mount, f, facets) {
    mount.replaceChildren(
      segmented({
        name: `itemtier-${mount === els.itemTierArmor ? 'a' : 'w'}`,
        legend: 'Item tier (pick any combination)',
        multiple: true,
        options: [
          { label: 'Any', value: null },
          ...CORE.ITEM_TIERS.map((t) => {
            const count = facets.itemTiers?.[t] ?? 0;
            return { label: `T${t}`, value: t, count, hint: `Item tier ${t}\n${count} on screen` };
          }),
        ],
        values: f.itemTiers,
        available: new Set([null, ...CORE.ITEM_TIERS.filter((t) => (facets.itemTiers?.[t] ?? 0) > 0)]),
        onChange: (arr) => update({ itemTiers: arr }),
      })
    );
  }

  function renderArmorFacets(f, facets) {
    if (!CORE.ARMOR_AVAILABLE) return;

    renderItemTierControl(els.itemTierArmor, f, facets);

    const multi = (mount, name, legend, values, options, onChange) => {
      mount.replaceChildren(
        segmented({
          name,
          legend,
          multiple: true,
          options: [{ label: 'Any', value: null }, ...options],
          values,
          available: new Set([null, ...options.filter((o) => (o.count ?? 1) > 0).map((o) => o.value)]),
          onChange,
        })
      );
    };

    multi(
      els.armorClass,
      'armorclass',
      'Character class',
      f.armorClasses,
      CORE.ARMOR_CLASSES.map((c) => ({ label: c, value: c, count: facets.armorClasses?.[c] ?? 0 })),
      (arr) => update({ armorClasses: arr })
    );

    multi(
      els.armorSlot,
      'armorslot',
      'Armor slot',
      f.armorSlots,
      CORE.ARMOR_SLOTS.map((s) => ({ label: s, value: s, count: facets.armorSlots?.[s] ?? 0 })),
      (arr) => update({ armorSlots: arr })
    );

    multi(
      els.armorStat,
      'armorstat',
      'Stat archetype',
      f.stats,
      CORE.ARMOR_STAT_NAMES.map((s) => ({
        label: s,
        value: s,
        count: facets.stats?.[s] ?? 0,
        hint: `${s} archetype \u2014 the icon DIM draws on the piece`,
      })),
      (arr) => update({ stats: arr })
    );

    multi(
      els.armorTags,
      'armortag',
      'Set bonus focus',
      f.armorTags,
      CORE.ARMOR_TAGS.map((t) => ({
        label: t,
        value: t,
        count: facets.armorTags?.[t] ?? 0,
      })),
      (arr) => update({ armorTags: arr })
    );

    // Piece-count scope for the grade. Single-select: Any / 2pc / 4pc. Counts
    // show how many pieces on screen have a bonus at that requirement.
    const pcCount = (pcs) =>
      CORE.results('name').filter((m) => (m.bonuses || []).some((b) => b.pcs === pcs)).length;
    els.setPieces.replaceChildren(
      segmented({
        name: 'setpieces',
        legend: 'Set bonus piece requirement',
        options: [
          { label: 'Either', value: null },
          { label: '2-piece', value: 2, count: pcCount(2) },
          { label: '4-piece', value: 4, count: pcCount(4) },
        ],
        value: f.setPieces,
        onChange: (v) => update({ setPieces: v }),
      })
    );

    // Armor grade control: same letters as weapons, but the count is the number
    // of pieces whose set carries a bonus at that grade (respecting the piece
    // scope above).
    const gradeLegend = f.setPieces ? `Set bonus grade (${f.setPieces}-piece)` : 'Set bonus grade';
    multi(
      els.tierArmor,
      'tierarmor',
      gradeLegend,
      f.tiers,
      CORE.TIER_ORDER.map((t) => {
        const count = facets.tiers?.[t] ?? 0;
        const offAxis = (CORE.TIER_OFF_AXIS || []).includes(t);
        return {
          label: t,
          value: t,
          count,
          hint:
            `${t} \u2014 ${CORE.TIER_MEANINGS?.[t] || ''}` +
            (offAxis ? '\n(not a PvE quality grade)' : '') +
            `\n${count} pieces on screen`,
        };
      }),
      (arr) => update({ tiers: arr })
    );
  }

  /**
   * Power floor options, derived from what is actually on screen so the
   * thresholds are always meaningful for the current inventory.
   */
  function renderPowerOptions(f) {
    const powers = CORE.results('power')
      .map((m) => m.power)
      .filter((p) => p !== null);
    const opts = [h('option', { value: '', text: 'Any power' })];
    if (powers.length) {
      const max = Math.max(...powers);
      const min = Math.min(...powers);
      // Round thresholds descending from the cap, skipping ones below the floor.
      const step = 10;
      const top = Math.floor(max / step) * step;
      for (let p = top; p >= Math.floor(min / step) * step && opts.length < 12; p -= step) {
        const n = powers.filter((v) => v >= p).length;
        opts.push(h('option', { value: String(p), text: `${p}+  (${n})`, selected: f.minPower === p }));
      }
    }
    els.power.replaceChildren(...opts);
    els.power.value = f.minPower === null ? '' : String(f.minPower);
  }

  /** Push filter state back into the controls (used after Reset). */
  function syncControls() {
    const f = CORE.getFilter();
    els.search.value = f.text;
    els.exotics.checked = f.exoticsOnly;
    els.legendaries.checked = f.legendariesOnly;
    els.hide.checked = f.hideOthers;
    els.ranked.checked = f.rankedOnly;
    // Field groups follow the active domain (Reset keeps you on the same tab).
    if (els.weaponFields) els.weaponFields.hidden = f.domain !== 'weapon';
    if (els.armorFields) els.armorFields.hidden = f.domain !== 'armor';
    renderFacets(true);
  }

  /**
   * The chip always shows the category rank, suffixed with the category size so
   * "#79/84" cannot be misread as an overall rank. When a weapon has no category
   * rank the chip says so explicitly rather than silently promoting the overall
   * rank into the same visual slot.
   */
  function rankChip(meta) {
    if (meta.category !== null) {
      const total = meta.categoryTotal ? `/${meta.categoryTotal}` : '';
      return h('span', {
        class: 'lggf-chip lggf-chip--cat',
        title: `#${meta.category} most popular ${meta.type}${
          meta.categoryTotal ? ` of ${meta.categoryTotal} ranked` : ''
        }`,
      }, [
        h('strong', { text: `#${meta.category}` }),
        h('span', { class: 'lggf-chip__total', text: total }),
      ]);
    }
    return h('span', {
      class: 'lggf-chip lggf-chip--none',
      text: 'no cat.',
      title: `light.gg has no ${meta.type} category rank for this weapon`,
    });
  }

  /** "overall #1604" / "unranked overall" -- always explicit about which rank. */
  function overallText(meta) {
    return meta.overall !== null ? `overall #${meta.overall}` : 'unranked overall';
  }

  /**
   * Collapse duplicate copies of the same weapon into one row.
   *
   * A vault commonly holds five Mint Retrogrades; five identical rows would push
   * the actual answer off screen. The grid filter still marks every copy -- this
   * is presentation only. Input is already sorted, and Map preserves insertion
   * order, so grouping does not disturb the ranking.
   */
  function groupResults(list) {
    const groups = new Map();

    for (const meta of list) {
      const key = `${meta.name}|${meta.type}`;
      let g = groups.get(key);
      if (!g) {
        g = { lead: meta, count: 0, owners: new Map() };
        groups.set(key, g);
      }
      g.count += 1;
      if (meta.owner) g.owners.set(meta.owner, (g.owners.get(meta.owner) || 0) + 1);
      // Reveal should land on the highest-power copy, that being the one you want.
      if ((meta.power ?? -1) > (g.lead.power ?? -1)) g.lead = meta;
    }

    return [...groups.values()];
  }

  /** "Vault \u00d75 \u00b7 Warlock" */
  function ownerSummary(owners) {
    return [...owners.entries()]
      .map(([owner, n]) => (n > 1 ? `${owner} \u00d7${n}` : owner))
      .join(' \u00b7 ');
  }

  /**
   * Result row for an armor piece. Leads with the set's grades as "S4 / C2" so
   * the piece requirement is never implicit, then the set name (which is often
   * nothing like the piece's own name) and the piece's own attributes.
   */
  function armorRow(group) {
    const meta = group.lead;

    const grades = (meta.bonuses || []).map((b) =>
      h('span', {
        class: `lggf-tierpill lggf-tierpill--${b.tier.toLowerCase()}`,
        title: [
          `${b.pcs}-piece bonus: ${b.bonus}`,
          `Grade ${b.tier} \u2014 ${CORE.TIER_MEANINGS?.[b.tier] || ''}`,
          b.effect && `Effect: ${b.effect}`,
          b.notes,
        ]
          .filter(Boolean)
          .join('\n'),
      }, [
        h('strong', { text: b.tier }),
        h('span', { class: 'lggf-pcs', text: String(b.pcs ?? '') }),
      ])
    );

    const detail = [
      meta.setName ? `${meta.setName} set` : 'no set bonus',
      meta.armorClass,
      meta.armorSlot,
      meta.stat && `${meta.stat} archetype`,
      ownerSummary(group.owners),
    ]
      .filter(Boolean)
      .join(' \u00b7 ');

    const tooltip = [
      meta.name,
      meta.setName ? `Set: ${meta.setName}${meta.setSource ? ` (${meta.setSource})` : ''}` : 'Not part of a graded set',
      ...(meta.bonuses || []).map(
        (b) => `${b.pcs}pc ${b.bonus} = ${b.tier} (${CORE.TIER_SHORT?.[b.tier] || ''})`
      ),
      meta.stat && `${meta.stat} stat archetype`,
      group.count > 1 ? `${group.count} copies: ${ownerSummary(group.owners)}` : ownerSummary(group.owners),
      'Click to find it in the inventory',
    ]
      .filter(Boolean)
      .join('\n');

    return h('li', { class: 'lggf-result' }, [
      h('button', {
        type: 'button',
        class: 'lggf-result__btn',
        title: tooltip,
        onClick: () => CORE.reveal(meta),
      }, [
        h('span', { class: 'lggf-grades' }, grades.length ? grades : [
          h('span', { class: 'lggf-chip lggf-chip--none', text: 'no set' }),
        ]),
        h('span', { class: 'lggf-result__body' }, [
          h('span', { class: 'lggf-result__nameline' }, [
            h('span', { class: 'lggf-result__name', text: meta.name }),
            group.count > 1
              ? h('span', { class: 'lggf-result__count', text: `\u00d7${group.count}`, title: `${group.count} copies` })
              : null,
          ]),
          h('span', { class: 'lggf-result__meta', text: detail }),
        ]),
        meta.power !== null
          ? h('span', { class: 'lggf-result__power', text: String(meta.power) })
          : null,
      ]),
    ]);
  }

  function renderResults() {
    const raw = CORE.results(sort);
    const list = groupResults(raw);
    const active = CORE.hasActiveCriteria();
    const total = CORE.total();

    // With no filter applied, show the plain total; once narrowed, "N of M".
    els.count.textContent = active ? `${raw.length} of ${total} items` : `${total} items`;

    // Launcher dot and bulk tagging light up only when a real filter is applied.
    launcher.classList.toggle('lggf-launcher--on', active);

    const canTag = active && raw.length > 0;
    els.tagRow.hidden = !canTag;
    if (canTag) {
      els.tagBtn.querySelector('span:last-child').textContent = `Tag ${raw.length} match${
        raw.length === 1 ? '' : 'es'
      }\u2026`;
    }
    els.results.replaceChildren();

    if (!list.length) {
      els.results.appendChild(
        h('li', { class: 'lggf-empty' }, [
          h('p', { text: 'Nothing matches.' }),
          h('p', {
            class: 'lggf-empty__hint',
            text: 'Try loosening a filter, or scroll the inventory so more items render.',
          }),
        ])
      );
      return;
    }

    for (const group of list.slice(0, MAX_RESULTS)) {
      const meta = group.lead;
      if (meta.kind === 'armor') {
        els.results.appendChild(armorRow(group));
        continue;
      }
      // The overall rank goes on the meta line, explicitly labelled, so the chip
      // can stay unambiguously "category rank" for every row.
      const detail = [
        overallText(meta),
        meta.type,
        meta.slot && `${meta.slot} slot`,
        meta.element,
        ownerSummary(group.owners),
      ]
        .filter(Boolean)
        .join(' \u00b7 ');

      const tierPill = meta.tier
        ? h('span', {
            class: `lggf-tierpill lggf-tierpill--${meta.tier.toLowerCase()}`,
            text: meta.tier,
            // Grade, what the grade means, then the sheet's per-weapon note.
            title: [
              `Tier ${meta.tier} \u2014 ${CORE.TIER_MEANINGS?.[meta.tier] || ''}`,
              `(${CORE.TIER_SCOPE}, at the weapon\u2019s god roll)`,
              meta.tierNotes,
            ]
              .filter(Boolean)
              .join('\n'),
          })
        : null;

      const tooltip = [
        meta.name,
        meta.category !== null
          ? `category rank #${meta.category}${meta.categoryTotal ? ` of ${meta.categoryTotal}` : ''} among ${meta.type}s`
          : `no category rank among ${meta.type}s`,
        meta.overall !== null ? `overall rank #${meta.overall}` : 'no overall rank',
        meta.tier
          ? `tier ${meta.tier} (${CORE.TIER_SHORT?.[meta.tier] || ''}) at god roll` +
            (meta.tierNotes ? ` \u2014 ${meta.tierNotes}` : '')
          : 'no endgame tier',
        group.count > 1 ? `${group.count} copies: ${ownerSummary(group.owners)}` : ownerSummary(group.owners),
        'Click to find it in the inventory',
      ]
        .filter(Boolean)
        .join('\n');

      const row = h('li', { class: 'lggf-result' }, [
        h('button', {
          type: 'button',
          class: 'lggf-result__btn',
          // Hover/focus gets the detail the meta line may have ellipsized.
          title: tooltip,
          onClick: () => CORE.reveal(meta),
        }, [
          rankChip(meta),
          tierPill,
          h('span', { class: 'lggf-result__body' }, [
            h('span', { class: 'lggf-result__nameline' }, [
              h('span', { class: 'lggf-result__name', text: meta.name }),
              group.count > 1
                ? h('span', {
                    class: 'lggf-result__count',
                    text: `\u00d7${group.count}`,
                    title: `${group.count} copies`,
                  })
                : null,
            ]),
            h('span', { class: 'lggf-result__meta', text: detail }),
          ]),
          meta.power !== null
            ? h('span', { class: 'lggf-result__power', text: String(meta.power) })
            : null,
        ]),
      ]);
      els.results.appendChild(row);
    }

    if (list.length > MAX_RESULTS) {
      els.results.appendChild(
        h('li', {
          class: 'lggf-more',
          text: `+${list.length - MAX_RESULTS} more items \u2014 narrow the filter to see them`,
        })
      );
    }
  }

  function update(patch) {
    CORE.setFilter(patch);
    // Selecting a slot can empty out types (and vice versa), so the available
    // options are recomputed -- but renderFacets() no-ops unless they changed.
    renderFacets();
    refreshCollapsedSummaries();
    renderResults();
  }

  /** Keep collapsed fields' summaries current as selections change. */
  function refreshCollapsedSummaries() {
    for (const row of panel.querySelectorAll('.lggf-field--collapsed[data-collapse-key]')) {
      const summary = row.querySelector('.lggf-field__summary');
      if (summary) summary.textContent = collapseSummary(row.dataset.collapseKey);
    }
  }

  function refresh() {
    if (!open) {
      // Still keep the launcher badge honest while the panel is closed.
      launcher.classList.toggle('lggf-launcher--on', CORE.hasActiveCriteria());
      return;
    }
    renderFacets();
    renderResults();
  }

  // -------------------------------------------------------------------------
  // Open / close
  // -------------------------------------------------------------------------

  function openPanel() {
    open = true;
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('lggf-panel-open');
    renderSortOptions(CORE.getFilter().domain);
    renderFacets(true);
    renderResults();
    els.search.focus();

    // DIM only renders tiles near the viewport, so the index starts as just
    // what is on screen. Sweep the whole inventory into view once, so filters
    // cover everything you own -- not only the current view.
    runSweep();
  }

  async function runSweep(force = false) {
    if (sweeping) return;
    if (sweptOnce && !force) return; // one automatic sweep per panel session
    sweeping = true;
    setScanState('scanning');

    try {
      await CORE.sweep((fraction) => {
        if (els.scanBar) els.scanBar.style.width = `${Math.round(fraction * 100)}%`;
      });
      sweptOnce = true;
      lastScanAt = new Date();
    } catch (err) {
      console.error('[lgg-rank] sweep failed', err);
    } finally {
      sweeping = false;
      setScanState('done');
      renderFacets(true);
      renderResults();
    }
  }

  /** "just now" / "3 minutes ago" / "2 hours ago" from a Date. */
  function relativeTime(date) {
    const secs = Math.round((Date.now() - date.getTime()) / 1000);
    if (secs < 45) return 'just now';
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  /** Tooltip for the Scan all button, reflecting scan state and last scan time. */
  function scanTooltip() {
    if (sweeping) return 'Scanning your full inventory\u2026';
    if (!lastScanAt) return 'Scan your full inventory (DIM only loads what is on screen)';
    const clock = lastScanAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `Last scanned ${relativeTime(lastScanAt)} (${clock}) \u2014 click to re-scan`;
  }

  function setScanState(state) {
    if (!els.scan) return;
    panel.classList.toggle('lggf-scanning', state === 'scanning');
    els.scan.disabled = state === 'scanning';
    els.scan.title = scanTooltip();
  }

  // -------------------------------------------------------------------------
  // Bulk tagging (a write action -- always behind an explicit confirmation)
  // -------------------------------------------------------------------------

  let tagging = false;

  /** Build and show a confirmation sheet: pick a tag, see the count, confirm. */
  function openTagConfirm() {
    if (tagging) return;
    const count = CORE.results('category').length;
    if (!count) return;

    // How many distinct weapons vs total copies, so the user knows the scope.
    const distinct = new Set(CORE.results('name').map((m) => `${m.name}|${m.type}`)).size;

    // Remove any prior sheet.
    document.getElementById('lggf-tagsheet')?.remove();

    const tagButtons = CORE.TAGS.map((t) =>
      h('button', {
        type: 'button',
        class: `lggf-tagopt lggf-tagopt--${t.id}`,
        onClick: () => runTagging(t.id, t.label),
      }, [h('span', { text: t.label })])
    );

    const sheet = h('div', {
      class: 'lggf-tagsheet',
      id: 'lggf-tagsheet',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Confirm bulk tag',
    }, [
      h('div', { class: 'lggf-tagsheet__head' }, [
        h('strong', { text: `Tag ${count} matching item${count === 1 ? '' : 's'}` }),
        distinct !== count
          ? h('span', { class: 'lggf-tagsheet__sub', text: `${distinct} unique, ${count} copies` })
          : null,
      ]),
      h('p', {
        class: 'lggf-tagsheet__note',
        text: 'This applies a DIM tag to each matching weapon, the same as tagging them by hand. Tags are reversible and nothing is moved or dismantled.',
      }),
      h('div', { class: 'lggf-tagsheet__opts' }, tagButtons),
      h('button', {
        type: 'button',
        class: 'lggf-tagsheet__cancel',
        text: 'Cancel',
        onClick: () => sheet.remove(),
      }),
    ]);

    panel.appendChild(sheet);
    sheet.querySelector('.lggf-tagopt')?.focus();
  }

  async function runTagging(tagId, tagLabel) {
    const sheet = document.getElementById('lggf-tagsheet');
    if (tagging) return;
    tagging = true;

    // Swap the sheet into a progress state.
    if (sheet) {
      sheet.replaceChildren(
        h('div', { class: 'lggf-tagsheet__head' }, [
          h('strong', { text: `Tagging as ${tagLabel}\u2026` }),
        ]),
        h('div', { class: 'lggf-tagprog' }, [h('div', { class: 'lggf-tagprog__fill' })]),
        h('p', { class: 'lggf-tagsheet__note', id: 'lggf-tagstatus', text: 'Starting\u2026' }),
        h('button', {
          type: 'button',
          class: 'lggf-tagsheet__cancel',
          text: 'Stop',
          onClick: () => CORE.cancelTagging(),
        })
      );
    }

    const fill = sheet?.querySelector('.lggf-tagprog__fill');
    const status = sheet?.querySelector('#lggf-tagstatus');

    let summary;
    try {
      summary = await CORE.tagMatching(tagId, ({ done, total, name }) => {
        if (fill && total) fill.style.width = `${Math.round((done / total) * 100)}%`;
        if (status) status.textContent = `${done} of ${total} \u2014 ${name}`;
      });
    } catch (err) {
      console.error('[lgg-rank] tagging failed', err);
      summary = { done: 0, total: 0, failed: 0, error: true };
    } finally {
      tagging = false;
    }

    // Report and auto-dismiss.
    if (sheet) {
      const msg = summary.error
        ? 'Tagging failed \u2014 see console.'
        : summary.aborted
          ? `Stopped after ${summary.done} of ${summary.total}.`
          : `Tagged ${summary.done} item${summary.done === 1 ? '' : 's'} as ${tagLabel}` +
            (summary.failed ? ` (${summary.failed} skipped).` : '.');
      sheet.replaceChildren(
        h('div', { class: 'lggf-tagsheet__head' }, [h('strong', { text: msg })]),
        h('button', {
          type: 'button',
          class: 'lggf-tagsheet__cancel',
          text: 'Done',
          onClick: () => sheet.remove(),
        })
      );
      setTimeout(() => sheet.isConnected && sheet.remove(), 4000);
    }

    refresh();
  }

  function close() {
    open = false;
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('lggf-panel-open');
    // Note: sweptOnce is intentionally NOT reset here. Once the inventory has
    // been scanned, reopening the panel does not scan again -- reopening is
    // cheap and the index persists. If the user has since navigated or acquired
    // gear, they can re-scan with the "Scan all" button, whose tooltip shows how
    // long ago the last scan was.
  }

  function toggle() {
    if (open) close();
    else openPanel();
  }

  // -------------------------------------------------------------------------
  // Boot
  // -------------------------------------------------------------------------

  function boot() {
    buildLauncher();
    buildPanel();

    // DIM renders progressively and on navigation; keep facets and counts live.
    CORE.onChange(refresh);

    // Global Escape while focus is elsewhere (e.g. user clicked a tile).
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open && !panel.contains(document.activeElement)) close();
    });
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
