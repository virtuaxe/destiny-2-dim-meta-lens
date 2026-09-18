/**
 * GENERATED FILE - do not edit by hand.
 * Run `npm run build:armor` (needs BUNGIE_API_KEY) to refresh.
 *
 * Armor set bonuses graded S..F by the community "Destiny 2 Endgame Analysis"
 * spreadsheet, joined to armor pieces via the Bungie manifest's
 * DestinyEquipableItemSetDefinition. Grades belong to the sheet's authors and are
 * credited in the UI.
 *
 * A set carries a 2-piece and a 4-piece bonus, graded separately and often very
 * differently -- so a grade is only realised when that many pieces are worn.
 *
 * Sets:      56 graded, covering 816 armor pieces
 * Best-tier: {"S":5,"A":12,"B":12,"C":16,"D":6,"E":3,"F":2}
 * Manifest:  244213.26.06.29.2000-1-bnet.65864
 * Generated: 2026-09-12T14:49:58.350Z
 */
globalThis.LGG_ARMOR = {
  "generated": "2026-09-12T14:49:58.350Z",
  "manifestVersion": "244213.26.06.29.2000-1-bnet.65864",
  "source": "https://docs.google.com/spreadsheets/d/1JM-0SlxVDAi-C6rGVlLxa-J1WGewEeL8Qvq4htWZHhY",
  "sourceName": "Destiny 2 Endgame Analysis (community spreadsheet)",
  "order": [
    "S",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
  ],
  "tags": [
    "ability",
    "ammo",
    "damage",
    "pvp",
    "refill",
    "splash",
    "stats",
    "survivability"
  ],
  "statNames": [
    "Weapons",
    "Health",
    "Class",
    "Grenade",
    "Super",
    "Melee"
  ],
  "statIcons": {
    "585ae4ede9c3da96b34086fccccdc8cd": "Super",
    "717b8b218cc14325a54869bef21d2964": "Health",
    "065cdaabef560e5808e821cefaeaa22c": "Grenade",
    "7eb845acb5b3a4a9b7e0b2f05f5c43f1": "Class",
    "bc69675acdae9e6b9a68a02fb4d62e07": "Weapons",
    "fa534aca76d7f2d7e7b4ba4df4271b42": "Melee"
  },
  "setCount": 56,
  "itemCount": 816,
  "distribution": {
    "S": 5,
    "A": 12,
    "B": 12,
    "C": 16,
    "D": 6,
    "E": 3,
    "F": 2
  },
  "sets": {
    "atheonsmemory": {
      "name": "Atheon's Memory",
      "source": "Vault of Glass",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Collective Power",
          "tier": "S",
          "tags": [
            "damage"
          ],
          "effect": "Orb of Power at feet (effective 5s ICD)",
          "notes": "exclusive effect, great for extra super, Still Hunt, Argent mod facilitation, essentially Attrition Orbs without any setup"
        },
        {
          "pcs": 2,
          "bonus": "Radiolaria Breach",
          "tier": "D",
          "tags": [
            "stats",
            "splash"
          ],
          "effect": "50 Health for 7.5s, drops 4 radiolaria pools around player in a clover pattern, ~5m radius",
          "notes": "survivability effect is very weak, pools barely stagger enemies, not very effective overall"
        }
      ],
      "best": "S"
    },
    "exodusdown": {
      "name": "Exodus Down",
      "source": "Nessus",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Repurposed Charge",
          "tier": "S",
          "tags": [
            "survivability"
          ],
          "effect": "13% / 21% / 30% (up to 35%) DR, start/extensions are 3s per stack, 5? HP heal and starts crit health regen",
          "notes": "probably most consistent build-agnostic survivability set bonus in the game"
        },
        {
          "pcs": 2,
          "bonus": "Emergency Electromagnet",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "collects nearby orbs and ammo within 10?m, multiple orbs count as simultaneous for 4pc.",
          "notes": "not particularly useful unless paired with 4pc. or mod setup"
        }
      ],
      "best": "S"
    },
    "promised": {
      "name": "Promised",
      "source": "Salvation's Edge",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Resonance Redirection",
          "tier": "B",
          "tags": [
            "survivability",
            "damage"
          ],
          "effect": "8m exhausting explosion (2?s ICD)",
          "notes": "exhaust blast has fairly small radius, uptime is about once every other kill"
        },
        {
          "pcs": 2,
          "bonus": "Stable Resonance",
          "tier": "S",
          "tags": [
            "survivability",
            "damage"
          ],
          "effect": "25% DR and 7% damage for 12s, refreshable",
          "notes": "excellent global DR for a 2pc., a little reliant on elite+ presence but very strong if applicable"
        }
      ],
      "best": "S"
    },
    "tmcustom": {
      "name": "TM Custom",
      "source": "Spire of the Watcher",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "High Noon",
          "tier": "S",
          "tags": [
            "damage"
          ],
          "effect": "7% damage for 3s (doubled for Tex weapons)",
          "notes": "best-in-class damage booster set bonus, irreplaceable effect"
        },
        {
          "pcs": 2,
          "bonus": "Old Martian Diplomacy",
          "tier": "B",
          "tags": [
            "survivability"
          ],
          "effect": "40? HP and 12m disorient pulse, <2s ICD",
          "notes": "worse Duality 4pc. effect, pretty large disorient pulse radius, uptime isn't amazing but infinite stow"
        }
      ],
      "best": "S"
    },
    "coda": {
      "name": "CODA",
      "source": "Prophecy",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "So Very Thin",
          "tier": "S",
          "tags": [
            "ability",
            "survivability"
          ],
          "effect": "22?% grenade energy 22?% melee energy 40% DR for 5s, refreshable on kill",
          "notes": "easily the most consistent source of high DR if able to play around swapping polarities, excellent chunk gains too"
        },
        {
          "pcs": 2,
          "bonus": "Between Poles",
          "tier": "D",
          "tags": [
            "stats"
          ],
          "effect": "8 Grenade per stack for 10s 8 Melee per stack for 10s",
          "notes": "most grenade/melee builds already invest into high stat, not really worth spending set bonus to do so"
        }
      ],
      "best": "S"
    },
    "smokejumper": {
      "name": "Smoke Jumper",
      "source": "Solo/Fireteam Ops",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Too Old for This",
          "tier": "C",
          "tags": [
            "survivability",
            "ammo"
          ],
          "effect": "16% additional special progress and 35 HP",
          "notes": "for finisher requirement, ammo increase is very disappointing compared to modern ammo-boosting set bonuses, HP isn't much"
        },
        {
          "pcs": 2,
          "bonus": "Ride Together, Die Together",
          "tier": "A",
          "tags": [
            "survivability"
          ],
          "effect": "40% DR decaying for 3s",
          "notes": "excellent pairing with Attrition Orbs / triple arm orb gen mod setups, a little build-dependent but solid regardless"
        }
      ],
      "best": "A"
    },
    "legacysoath": {
      "name": "Legacy's Oath",
      "source": "Deep Stone Crypt",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "God-like Judgment",
          "tier": "C",
          "tags": [
            "damage"
          ],
          "effect": "570 damage (+0) heat-seeking missile array, no ICD",
          "notes": "entire missile array does the same damage as a single adaptive sniper shot"
        },
        {
          "pcs": 2,
          "bonus": "Augmented Servos",
          "tier": "A",
          "tags": [
            "splash"
          ],
          "effect": "9m disorienting pulse",
          "notes": "probably best melee-focused set bonus in the game, effective DR from blind, constantly reprocable"
        }
      ],
      "best": "A"
    },
    "crystocrene": {
      "name": "Crystocrene",
      "source": "Europa",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "From the Storm",
          "tier": "D",
          "tags": [
            "survivability"
          ],
          "effect": "Frost Armor buildup every 4?s until reentering combat",
          "notes": "passive time requirement is extremely long and unlikely to activate in endgame content"
        },
        {
          "pcs": 2,
          "bonus": "Resupply",
          "tier": "A",
          "tags": [
            "ammo",
            "ability"
          ],
          "effect": "additive 20% ammo progress for both types (effectively ~7x at 0, ~3-3.5x at 100) and Orb Of Power",
          "notes": "probably currently bugged and works in combat; actually pretty decent and about doubles ammo gen if 5 kills/12s"
        }
      ],
      "best": "A"
    },
    "nezarecsnightmare": {
      "name": "Nezarec's Nightmare",
      "source": "Root of Nightmares",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Dream-Devourer",
          "tier": "A",
          "tags": [
            "survivability"
          ],
          "effect": "Devour 20% DR",
          "notes": "good for controllable environments for getting Devour on non-Devour subclasses, otherwise DR isn't that high"
        },
        {
          "pcs": 2,
          "bonus": "Bad Dreams",
          "tier": "C",
          "tags": [
            "ability"
          ],
          "effect": "Orb of Power",
          "notes": "free passive orb gen for most builds, but not amazing or particularly noticeable"
        }
      ],
      "best": "A"
    },
    "pantheosresplendent": {
      "name": "Pantheos Resplendent",
      "source": "Pantheon",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Down the Line",
          "tier": "D",
          "tags": [
            "damage"
          ],
          "effect": "15% damage to minor/elites, 1-2 stacks (minor/elite) removed on kill (1s window?)",
          "notes": "reverse Redirection, 15% not that much and definitely an odd choice for a 4pc."
        },
        {
          "pcs": 2,
          "bonus": "Well Prepared",
          "tier": "A",
          "tags": [
            "ability"
          ],
          "effect": "Armor Charge 10 Health per stack",
          "notes": "enables infinite special finishers with Curative Orbs, works with Stacks on Stacks"
        }
      ],
      "best": "A"
    },
    "oryxsmemory": {
      "name": "Oryx's Memory",
      "source": "King's Fall",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Ascendant Escape",
          "tier": "A",
          "tags": [
            "survivability"
          ],
          "effect": "invisibility for 6-8s, no ICD",
          "notes": "instant tracking break and invis when needed is very helpful"
        },
        {
          "pcs": 2,
          "bonus": "Iron Sharpens Iron",
          "tier": "A",
          "tags": [
            "ammo"
          ],
          "effect": "additive 12% special ammo progress, 7.5% heavy ammo progress",
          "notes": "still pretty solid post-nerf in elite-heavy encounters, just not overpowered, worse than Europa 2pc. with lower elite presence"
        }
      ],
      "best": "A"
    },
    "deepexplorer": {
      "name": "Deep Explorer",
      "source": "Duality",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Bittersweet",
          "tier": "A",
          "tags": [
            "survivability"
          ],
          "effect": "35 / 65 / 87.5 / 105 / 130 / 170 / 195 / full HP per stack",
          "notes": "in practice, a very large amount of healing uptime as long as you play around swapping weapons, have to forgo DR"
        },
        {
          "pcs": 2,
          "bonus": "Built Bitter",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "? reload per stack until stowed (up to 50? reload and 0.85x? reload duration)",
          "notes": "essentially Bitterspite in set bonus form, not bad but just QoL stats"
        }
      ],
      "best": "A"
    },
    "aionadapter": {
      "name": "AION Adapter",
      "source": "Kepler - Mythic",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Reactive Shock",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "disorienting burst within ?m for 4.5s",
          "notes": "being hit by melee is already a very poor circumstance in endgame content, disorient effect is available for less"
        },
        {
          "pcs": 2,
          "bonus": "Force Absorption",
          "tier": "A",
          "tags": [
            "survivability"
          ],
          "effect": "20% splash DR and 60% self explosive DR for 15s",
          "notes": "splash is a fair amount of incoming damage, but overshadowed by other more universal DR options"
        }
      ],
      "best": "A"
    },
    "greathunt": {
      "name": "Great Hunt",
      "source": "Last Wish",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Taken Armaments",
          "tier": "A",
          "tags": [
            "ammo"
          ],
          "effect": "additive 10% heavy ammo progress",
          "notes": "makes Getaway warlock an ammo printer with mod support"
        },
        {
          "pcs": 2,
          "bonus": "Taken Barrier",
          "tier": "B",
          "tags": [
            "survivability"
          ],
          "effect": "10% DR for 7s (refreshable)",
          "notes": "like Ferro but better uptime for specifically Getaway warlock, but there are better DR uptime set bonuses"
        }
      ],
      "best": "A"
    },
    "techeunsregalia": {
      "name": "Techeun's Regalia",
      "source": "Shattered Throne",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Truth to Power",
          "tier": "A",
          "tags": [
            "survivability",
            "ability"
          ],
          "effect": "up to 15% DR, +50% grenade/melee regen, +35% class regen",
          "notes": "consistent DR source that doesn't require much, but doesn't have a high ceiling and is tied to 4pc."
        },
        {
          "pcs": 2,
          "bonus": "Queensfoil Rush",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "200? HP overshield during, 7m slowing burst after",
          "notes": "already generally quite safe during a finisher, slowing burst is okay, specific playstyle"
        }
      ],
      "best": "A"
    },
    "sageprotector": {
      "name": "Sage Protector",
      "source": "Equilibrium",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Blade Focus",
          "tier": "C",
          "tags": [
            "damage"
          ],
          "effect": "10% sword damage, 2x lunge for 7s",
          "notes": "damage loss to activate effect, not really worth pairing with 2pc. effect either, basically just used for movement tech"
        },
        {
          "pcs": 2,
          "bonus": "Combat Meditation",
          "tier": "A",
          "tags": [
            "ability"
          ],
          "effect": "5% grenade and class 10% if Blade Focus active",
          "notes": "enables ability spam strategies using high hit count swords like casters and Ergo, also decent for neutral depending on build"
        }
      ],
      "best": "A"
    },
    "crotasmemory": {
      "name": "Crota's Memory",
      "source": "Crota's End",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Power of the Son",
          "tier": "A",
          "tags": [
            "survivability"
          ],
          "effect": "?% flinch resist and 15% DR (increases to 25% at 24s like Chaos Reshaped)",
          "notes": "high uptime DR with little thinking required, not best-in-class and 2pc. isn't universally useful"
        },
        {
          "pcs": 2,
          "bonus": "Cursed Fist",
          "tier": "C",
          "tags": [
            "splash"
          ],
          "effect": "same radius as origin trait Cursed Thrall explosion, less damage (257 at +0)",
          "notes": "extra explosions are nice, but damage is quite low and DSC 2pc. is definitely favored in endgame"
        }
      ],
      "best": "A"
    },
    "ironpanoply": {
      "name": "Iron Panoply",
      "source": "Iron Banner",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Iron Conviction",
          "tier": "B",
          "tags": [
            "survivability",
            "ammo"
          ],
          "effect": "35 ammo gen, ?% flinch resist, 15?% DR within 15?m for 7s, refreshable",
          "notes": "pretty decently high uptime DR and ammo gen as long as kill cycle is kept up, also 2pc. is not bad"
        },
        {
          "pcs": 2,
          "bonus": "Vigilant Watch",
          "tier": "B",
          "tags": [
            "survivability",
            "stats"
          ],
          "effect": "up to ? stability and ? handling 30 HP",
          "notes": "slightly better than Bushido due to timing of healing, but HP amount is still very small"
        }
      ],
      "best": "B"
    },
    "ironbattalion": {
      "name": "Iron Battalion",
      "source": "Iron Banner",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Supercyclical",
          "tier": "B",
          "tags": [
            "ability"
          ],
          "effect": "5% super refund per kill, up to 6",
          "notes": "insane Well uptime with Phoenix Protocol, potentially roam supers as well in non-boss encounters"
        },
        {
          "pcs": 2,
          "bonus": "Primary Honing",
          "tier": "C",
          "tags": [
            "stats",
            "damage"
          ],
          "effect": "? handling, ? reload, and up to 12% additional non-boss damage at 200 Weapons for primaries",
          "notes": "probably the best non-boss damage booster out there, completely passive, also free stat boost for primary QoL, great 2pc. efficiency"
        }
      ],
      "best": "B"
    },
    "reveriedawn": {
      "name": "Reverie Dawn",
      "source": "Dreaming City",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "A Wish Fulfilled",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "Cure x1",
          "notes": "held back immensely by 5s reproc ICD, also Cure x1 is not much healing given activation rate"
        },
        {
          "pcs": 2,
          "bonus": "A Wish for Protection",
          "tier": "B",
          "tags": [
            "survivability"
          ],
          "effect": "Amplified effect, ? reload and ?% flinch resistance for 7s (5s ICD after expiry)",
          "notes": "enemy accuracy drop effect is good but can be obtained through other means, easy to activate, ICD sucks, maybe for solo DPS?"
        }
      ],
      "best": "B"
    },
    "swordmaster": {
      "name": "Swordmaster",
      "source": "Pinnacle Ops",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Stesso Tempo",
          "tier": "B",
          "tags": [
            "survivability"
          ],
          "effect": "50% DR for 3s after dropping guard, refreshable by blocking again even without damage",
          "notes": "very specific playstyle but very strong DR source if played around"
        },
        {
          "pcs": 2,
          "bonus": "Balestra",
          "tier": "B",
          "tags": [
            "survivability"
          ],
          "effect": "exhaust for 5s",
          "notes": "potentially useful for melee builds/DPS"
        }
      ],
      "best": "B"
    },
    "yearningecho": {
      "name": "Yearning Echo",
      "source": "Grasp of Avarice",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Overflowing Coffers",
          "tier": "B",
          "tags": [
            "ability",
            "splash"
          ],
          "effect": "?% more ability energy 4.5x Tangle damage (5+ stacks) 4 orbs shot forward (5+ stacks)",
          "notes": "currently bugged and gives no super gains; potential for orb chaining, also usable with Whirling Maelstrom"
        },
        {
          "pcs": 2,
          "bonus": "Untold Greed",
          "tier": "C",
          "tags": [
            "survivability",
            "stats"
          ],
          "effect": "up to ~15% DR at 25+ stacks and ? reload, 10 stacks lost on critical health",
          "notes": "low uptime given requirements to get individual stacks, much simpler and more universal DR available at 2pc. level"
        }
      ],
      "best": "B"
    },
    "ferropotent": {
      "name": "Ferropotent",
      "source": "Solo/Fireteam Ops",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Built From Scratch",
          "tier": "C",
          "tags": [
            "ammo"
          ],
          "effect": "primary kills give +3% special progress, special kills give +2% heavy progress",
          "notes": "very small ammo difference, also cannot generate surplus ammo if high reserves"
        },
        {
          "pcs": 2,
          "bonus": "Rapid Repair",
          "tier": "B",
          "tags": [
            "survivability"
          ],
          "effect": "10% DR and ?% flinch resist for 7s",
          "notes": "non-stackable low DR, sort of universal but full healing requirement limits uptime"
        }
      ],
      "best": "B"
    },
    "techsec": {
      "name": "Techsec",
      "source": "Solo/Fireteam Ops",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Concussive Rounds",
          "tier": "B",
          "tags": [
            "splash"
          ],
          "effect": "disorienting wave within 10m for 4.5s",
          "notes": "good with glaive melee builds and certain kinetic primaries, maybe High Albedo"
        },
        {
          "pcs": 2,
          "bonus": "Wrecker",
          "tier": "C",
          "tags": [
            "damage"
          ],
          "effect": "200% kinetic damage to shields/overshields, 15% kinetic damage to constructs",
          "notes": "essentially just exists to make 4pc. function, otherwise not very useful outside edge cases like Calus final and boss Subjugators"
        }
      ],
      "best": "B"
    },
    "twofoldcrown": {
      "name": "Twofold Crown",
      "source": "Trials of Osiris",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Gift of Sight",
          "tier": "F",
          "tags": [
            "pvp"
          ],
          "effect": "enhanced radar for 5s",
          "notes": "does literally nothing in PvE"
        },
        {
          "pcs": 2,
          "bonus": "Crook and Flail",
          "tier": "B",
          "tags": [
            "survivability"
          ],
          "effect": "70 HP",
          "notes": "Kinetic Synthesis is permanent now, so this becomes a lot more viable"
        }
      ],
      "best": "B"
    },
    "lastdiscipline": {
      "name": "Last Discipline",
      "source": "Crucible",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Power Loader",
          "tier": "B",
          "tags": [
            "ammo"
          ],
          "effect": "6% special progress",
          "notes": "strongly dependent on team environment, if built into can be used with strong non-Kinetic Synthesis options like Still Hunt"
        },
        {
          "pcs": 2,
          "bonus": "Terminal Velocity",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "20 reload and 0.95x reload duration for primaries for 6s",
          "notes": "free reload QoL for primary weapons, nothing beyond that"
        }
      ],
      "best": "B"
    },
    "thunderhead": {
      "name": "Thunderhead",
      "source": "Neomuna",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Lethal Weave",
          "tier": "C",
          "tags": [
            "ability",
            "ammo"
          ],
          "effect": "10% grenade energy, +10% special ammo progress if grenade full",
          "notes": "suits Prismatic hunter playstyle pretty well, have to forgo other 2pc. DR options, but potentially worth a look"
        },
        {
          "pcs": 2,
          "bonus": "License to Thrill",
          "tier": "B",
          "tags": [
            "survivability"
          ],
          "effect": "12-30% melee (5m) DR for 15s",
          "notes": "perfectly suits grapple melee, Nanotech Tracer portion not really relevant unless Nanotech sword releases"
        }
      ],
      "best": "B"
    },
    "disastercorps": {
      "name": "Disaster Corps",
      "source": "Crucible",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Magnificent Duty",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "20 range, 20 stability, 30 reload, 0.9x reload duration for auto rifles, scout rifles, and sidearms for 11s",
          "notes": "trigger is definitely not that easy to come by, and reload is helpful but restricted"
        },
        {
          "pcs": 2,
          "bonus": "Pleas Heard",
          "tier": "B",
          "tags": [
            "survivability"
          ],
          "effect": "20 HP/s until interrupted by damage, firing, or casting ability, can be reactivated within time window",
          "notes": "currently bugged and heals 5 HP/s; in practice decent sustain, like a pseudo-Heal Clip effect but worse"
        }
      ],
      "best": "B"
    },
    "bushido": {
      "name": "Bushido",
      "source": "Pinnacle Ops",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Unfaltering Focus",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "10% non-stackable DR for 7s, 2s extensions on trigger-matching damage up to 10s",
          "notes": "despite being refreshable on-damage DR, 10% non-stackable is very low"
        },
        {
          "pcs": 2,
          "bonus": "Iaido",
          "tier": "B",
          "tags": [
            "survivability"
          ],
          "effect": "35 HP",
          "notes": "pretty small HP benefit, but easy to activate without any planning, reload/swap requirement a little annoying"
        }
      ],
      "best": "B"
    },
    "collectivepsyche": {
      "name": "Collective Psyche",
      "source": "Desert Perpetual",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Doppler Effect",
          "tier": "C",
          "tags": [
            "ability"
          ],
          "effect": "solar buffs and strand debuffs last 50% longer, 70% with Solace/Continuity",
          "notes": "poor 2pc., can be good for extending sever and increasing Restoration duration on Prismatic or through Physic"
        },
        {
          "pcs": 2,
          "bonus": "Accretion",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "0.0125?x ready/stow duration per stack, up to 0.75x",
          "notes": "very high swap animation multiplier, but purely QoL and no strong PvE benefit"
        }
      ],
      "best": "C"
    },
    "aionrenewal": {
      "name": "AION Renewal",
      "source": "Kepler",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Reactive Booster",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "Speed Booster",
          "notes": "only source of instant Speed Booster in the game, actually a decent escape tool but doesn't grant Amplified"
        },
        {
          "pcs": 2,
          "bonus": "Force Converter",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "Speed Booster after sprinting for 2.5s",
          "notes": "in theory a good escape tool, but activation period makes it much less reactive in practice, compare to constant DR"
        }
      ],
      "best": "C"
    },
    "seventhseraph": {
      "name": "Seventh Seraph",
      "source": "Cosmodrome",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Rasputin's Reprisal",
          "tier": "C",
          "tags": [
            "splash",
            "survivability"
          ],
          "effect": "216/405 damage 10m solar explosion that heals allies for 25?/50 HP (construct/elite+), <1s ICD",
          "notes": "probably best splash-focused set bonus, especially high uptime on crystal spam builds"
        },
        {
          "pcs": 2,
          "bonus": "Rasputin's Wrath",
          "tier": "D",
          "tags": [
            "stats"
          ],
          "effect": "3 Weapons and 3 Grenade per stack for 10s",
          "notes": "arguably the two best stats to have as a passive benefit, but still not that noticeable"
        }
      ],
      "best": "C"
    },
    "darkage": {
      "name": "Dark Age",
      "source": "Warlord's Ruin",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Healing Initiative",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "creates stackable 8s healing drone that deploys 10-50 HP pulses every 2s (5 total)",
          "notes": "very cool concept, unfortunately healing doesn't last long and requires Initiative stacking, can't use Sage Protector"
        },
        {
          "pcs": 2,
          "bonus": "Taking Initiative",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "? handling and ? reload for 8s",
          "notes": "like Adrenal Rush but more niche activation requirement"
        }
      ],
      "best": "C"
    },
    "apostatesblade": {
      "name": "Apostate's Blade",
      "source": "Pit of Heresy",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Melee Conduction",
          "tier": "C",
          "tags": [
            "damage"
          ],
          "effect": "28 damage 7m 30-40 scorch explosion on hit, 1s ICD",
          "notes": "cool for buildcrafting, unfortunately splash isn't insane enough to outdo having constant DR"
        },
        {
          "pcs": 2,
          "bonus": "Regenerative Threshold",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "20 HP and starts health regen",
          "notes": "would be a lot better if it wasn't just 20 HP, finisher requirement not really worth given weak effect"
        }
      ],
      "best": "C"
    },
    "dreambane": {
      "name": "Dreambane",
      "source": "Moon",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Nightmarish Resilience",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "20 HP and begins health regen, 2s ICD",
          "notes": "similar to PoH 2pc., except healing effect cannot be stowed and is mostly passive off of sprees"
        },
        {
          "pcs": 2,
          "bonus": "Nightmarish Power",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "30 Grenade and 30 Melee for 15s, refreshable",
          "notes": "stats are of the less noticeable variety"
        }
      ],
      "best": "C"
    },
    "flain": {
      "name": "Flain",
      "source": "Sundered Doctrine",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Knit Together",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "~50? HP per hit",
          "notes": "sustain with Weaver's Call, 2pc., Euphony, and Horde Shuttle, but forgoing DR for travel-based critical healing"
        },
        {
          "pcs": 2,
          "bonus": "Sinew Stitching",
          "tier": "C",
          "tags": [
            "splash"
          ],
          "effect": "Threadling spawn (5s ICD, separate for both triggers)",
          "notes": "not the worst Threadling spawn source, has artifact synergy, but much better neutral set bonuses exist"
        }
      ],
      "best": "C"
    },
    "lustrous": {
      "name": "Lustrous",
      "source": "Solstice",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Cauterize",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "35 HP (?s ICD)",
          "notes": "same HP as Bushido, just tied to kill counter CD rather than actual timer, also 4pc. instead"
        },
        {
          "pcs": 2,
          "bonus": "Photogalvanic",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "20? handling, 10 reload, 0.85x reload duration, ?% flinch resist for solar weapons for 4s",
          "notes": "QoL stats, pretty easy activation but solar-specific"
        }
      ],
      "best": "C"
    },
    "luminopotent": {
      "name": "Luminopotent",
      "source": "Solo/Fireteam Ops",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Shock and Clear",
          "tier": "C",
          "tags": [
            "ability"
          ],
          "effect": "makes Ionic Trace (no ICD?)",
          "notes": "good for Ionic Trace spam builds, seems to have essentially no cooldown, no DR or sustain from 2pc. though"
        },
        {
          "pcs": 2,
          "bonus": "Ionic Overclock",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "? handling, ? reload, and ? vent speed for fusions, LFRs, and heat weapons",
          "notes": "Eddy Current-esque effect, QoL stats but no major PvE impact"
        }
      ],
      "best": "C"
    },
    "veritas": {
      "name": "Veritas",
      "source": "Throne World",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Lucent Tithes",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "50? HP and 3 Void moths that give 22.5HP Void Overshield to allies each",
          "notes": "not the best reward for an elite+ finisher compared to other set bonuses, eHP gain is pretty decent"
        },
        {
          "pcs": 2,
          "bonus": "Lucent Transmutation",
          "tier": "C",
          "tags": [
            "ability"
          ],
          "effect": "elemental pickup based on Light subclass (5s ICD, Firesprite and Void Breach initiate global CD)",
          "notes": "free Firesprite, Void Breach, or Ionic Trace on finisher, also gives higher ability uptime on any melee build"
        }
      ],
      "best": "C"
    },
    "takenking": {
      "name": "Taken King",
      "source": "Ghosts of the Deep",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Lucent Swarm",
          "tier": "C",
          "tags": [
            "splash"
          ],
          "effect": "extends Ceremony to 30s spawns 60m tracking Arc moth for 8s",
          "notes": "competes with DSC 2pc. except takes 4pc., forces useless 2pc., and also works with grenades"
        },
        {
          "pcs": 2,
          "bonus": "The Ceremony",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "30 Super for 30s, refreshable",
          "notes": "Super is one of less important stats to have during roam, pretty much unnoticeable"
        }
      ],
      "best": "C"
    },
    "cyberserpentnull": {
      "name": "Cyberserpent Null",
      "source": "Gambit",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Bountiful Munitions",
          "tier": "C",
          "tags": [
            "ammo"
          ],
          "effect": "?% special ammo progress, increased to ?% against elite+ and Taken",
          "notes": "maybe the most universal special ammo generation set bonus, but not extremely significant and 2pc. sucks"
        },
        {
          "pcs": 2,
          "bonus": "Adrenal Rush",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "30 reload, 0.95x reload duration, and 40 handling for ?s, ?s extension on kill",
          "notes": "free stats, very easy to activate, but no strongly tangible PvE impact"
        }
      ],
      "best": "C"
    },
    "resonantfury": {
      "name": "Resonant Fury",
      "source": "Vow of the Disciple",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Siphoning Touch",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "30 / 60 / 90 / 105 / 120 HP (based on stacks consumed)",
          "notes": "mag-based means bow, rocket, or BGL-based damage can trigger very quickly on swap, however Duality 4pc. is better"
        },
        {
          "pcs": 2,
          "bonus": "Resonant Plating",
          "tier": "D",
          "tags": [
            "survivability"
          ],
          "effect": "starts health regen",
          "notes": "regen can be immediately interrupted, combatant class + melee requirement is very strict"
        }
      ],
      "best": "C"
    },
    "eutechnology": {
      "name": "Eutechnology",
      "source": "Arena/Pinnacle Ops",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Techeun's Foresight",
          "tier": "D",
          "tags": [
            "splash"
          ],
          "effect": "~3m / 87 damage (+0) void explosion (increased to ~5m / 173 damage if within 7s of pickup)",
          "notes": "splash damage and radius are both underwhelming, also long effective cooldown between each explosion"
        },
        {
          "pcs": 2,
          "bonus": "Gift of the Ley Lines",
          "tier": "C",
          "tags": [
            "ability"
          ],
          "effect": "Void Breach (?s ICD)",
          "notes": "not the most universally valuable elemental pickup type, spree requirement is a little hefty"
        }
      ],
      "best": "C"
    },
    "triumphalanthem": {
      "name": "Triumphal Anthem",
      "source": "Crucible",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Shoot to Scoot",
          "tier": "D",
          "tags": [
            "survivability"
          ],
          "effect": "slides are 33% longer and give 50% DR while sliding",
          "notes": "gives Transversives slide, high DR while sliding, not really practical"
        },
        {
          "pcs": 2,
          "bonus": "Scoot to Loot",
          "tier": "C",
          "tags": [
            "refill"
          ],
          "effect": "picks up ammo within 15m and gives 25 reload and 25 handling for ?s",
          "notes": "Gravity Well-type effect, not really sure where this would be useful outside of getting OoB ammo off hunter"
        }
      ],
      "best": "C"
    },
    "uncageddeviants": {
      "name": "Uncaged Deviants",
      "source": "Desert Perpetual - Epic",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Superluminal Motion",
          "tier": "C",
          "tags": [
            "survivability"
          ],
          "effect": "30 HP/s for 10s, refreshable",
          "notes": "not the worst for DPS, specifically for Well warlock, but there are definitely better options, especially for 4pc."
        },
        {
          "pcs": 2,
          "bonus": "Special Relativity",
          "tier": "E",
          "tags": [
            "refill"
          ],
          "effect": "refills stowed specials",
          "notes": "Shoot to Loot already does this"
        }
      ],
      "best": "C"
    },
    "spacewalk": {
      "name": "Spacewalk",
      "source": "Vesper's Host",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Augmented Explosives",
          "tier": "D",
          "tags": [
            "splash"
          ],
          "effect": "?m disorienting pulse before detonation",
          "notes": "relatively weak subclass effect tied to a very long cooldown, also 2pc. sucks"
        },
        {
          "pcs": 2,
          "bonus": "Augmented Armaments",
          "tier": "D",
          "tags": [
            "damage"
          ],
          "effect": "15% primary damage",
          "notes": "fairly situational, not many good pairings to activate disorient, 15% isn't really worth given setup"
        }
      ],
      "best": "D"
    },
    "circuit": {
      "name": "Circuit",
      "source": "Sparrow Racing League",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Dielectric Drift",
          "tier": "D",
          "tags": [
            "splash"
          ],
          "effect": "jolts enemies in front",
          "notes": "jolt is a pretty easy effect to apply without this specific requirement, also has pretty mediocre 2pc. attached"
        },
        {
          "pcs": 2,
          "bonus": "Revving Up",
          "tier": "D",
          "tags": [
            "survivability"
          ],
          "effect": "+5% critical regen speed per stack (~1.63x speed, starts 0.5s faster) Speed Booster",
          "notes": "takes way too long to stack through normal gameplay pattern, loses stacks very quickly, regen effect is decent but uptime not great"
        }
      ],
      "best": "D"
    },
    "wildwood": {
      "name": "Wildwood",
      "source": "EDZ",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Field Expertise",
          "tier": "D",
          "tags": [
            "stats",
            "damage"
          ],
          "effect": "up to ? reload, ? aim assist, 10% non-boss damage for 15s (ends early on body kills)",
          "notes": "10% is almost unnoticeable for non-boss, also requires only crit kills"
        },
        {
          "pcs": 2,
          "bonus": "Watchtower",
          "tier": "D",
          "tags": [
            "survivability"
          ],
          "effect": "25% DR until ADS stopped",
          "notes": "not really practical in most PvE scenarios, non-stackable DR is available at this level in a broader application"
        }
      ],
      "best": "D"
    },
    "kentarch3": {
      "name": "Kentarch 3",
      "source": "Garden of Salvation",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Network Upload",
          "tier": "D",
          "tags": [
            "ability"
          ],
          "effect": "?% melee energy to allies within ?m",
          "notes": "basically just gives you Pugilist as a 4pc. set bonus"
        },
        {
          "pcs": 2,
          "bonus": "Network Admin",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "? handling and ? reload ? Health",
          "notes": "generally unnoticeable / QoL stats, even if pretty easy to activate"
        }
      ],
      "best": "D"
    },
    "firstascent": {
      "name": "First Ascent",
      "source": "Pale Heart",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Burn 'Em Down",
          "tier": "E",
          "tags": [
            "ability"
          ],
          "effect": "~6% grenade energy per Stack 'Em Up stack",
          "notes": "effect is pretty weak, and requirement is awful for one-time use"
        },
        {
          "pcs": 2,
          "bonus": "Stack 'Em Up",
          "tier": "D",
          "tags": [
            "ability"
          ],
          "effect": "1.2% Transcendence gains per stack for 24s, cannot refresh at 5 stacks",
          "notes": "results in 15-20% Transcendence progress if requirements are fulfilled, gains do not progress further at 5 stacks"
        }
      ],
      "best": "D"
    },
    "thrivingsurvivor": {
      "name": "Thriving Survivor",
      "source": "Lawless Frontier",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Room Clearing",
          "tier": "D",
          "tags": [
            "stats",
            "ammo"
          ],
          "effect": "40 Grenade, 40 Weapon, 40 ammo gen for heat/primary weapons for 10s",
          "notes": "pretty solid stat bonuses, kill spree requirements are not the worst, held back by low impact 2pc."
        },
        {
          "pcs": 2,
          "bonus": "Opening Act",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "? stability and ? vent/reload speed to heat/primary weapons for 15s",
          "notes": "reload is nice but restricted to specific weapon types and activation requirement is much harder than most reload set bonuses"
        }
      ],
      "best": "D"
    },
    "wildanthem": {
      "name": "Wild Anthem",
      "source": "Crucible",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "SUROS Harmony",
          "tier": "E",
          "tags": [
            "pvp"
          ],
          "effect": "? handling and ?% flinch resist for 6s, SUROS Synergy weapons get 15 range",
          "notes": "only handling on a 4pc. set bonus, basically unnoticeable"
        },
        {
          "pcs": 2,
          "bonus": "Fanfare",
          "tier": "E",
          "tags": [
            "stats"
          ],
          "effect": "15 reload and 0.95x reload duration",
          "notes": "basically free reload as long as you're not compulsive, bonus isn't really that big though"
        }
      ],
      "best": "E"
    },
    "shrewdsurvivor": {
      "name": "Shrewd Survivor",
      "source": "Lawless Frontier",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Hotshot",
          "tier": "E",
          "tags": [
            "pvp"
          ],
          "effect": "15? stability, 20 reload, ? aim assist for Reflex Action weapons, 30 Weapons for 10s",
          "notes": "only one helpful cooldown stat, limited to small weapon subset, and tied to a 4pc. at that"
        },
        {
          "pcs": 2,
          "bonus": "Reflex Action",
          "tier": "E",
          "tags": [
            "pvp"
          ],
          "effect": "50 handling, 0.6x ready, -2.5% accuracy cone for 1.5s, extends on damage",
          "notes": "generally unnoticeable / QoL stats, even if pretty easy to activate"
        }
      ],
      "best": "E"
    },
    "peraudacia": {
      "name": "Per Audacia",
      "source": "Crucible",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Sublime Transit",
          "tier": "E",
          "tags": [
            "pvp"
          ],
          "effect": "? mobility, 6.25% sprint speed, 33% slide distance",
          "notes": "gives Transversive Steps effect passively, should stack with one other movement boost (lightweight/exotic)?"
        },
        {
          "pcs": 2,
          "bonus": "Primary Chain",
          "tier": "E",
          "tags": [
            "pvp"
          ],
          "effect": "? mobility, ? range, ? handling for primaries until death",
          "notes": "handling is marginally helpful but benefit is very limited in PvE"
        }
      ],
      "best": "E"
    },
    "cruelelectrum": {
      "name": "Cruel Electrum",
      "source": "Trials of Osiris",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Primary Phantom",
          "tier": "F",
          "tags": [
            "pvp"
          ],
          "effect": "removed from radar for ?s, ends upon readying non-primary",
          "notes": "does literally nothing in PvE"
        },
        {
          "pcs": 2,
          "bonus": "Primary Survivor",
          "tier": "F",
          "tags": [
            "pvp"
          ],
          "effect": "? handling, ? reload, ? aim assist, ?% reduced flinch",
          "notes": "technically helpful stats but requirements aren't really skill-sourced"
        }
      ],
      "best": "F"
    },
    "newdemotic": {
      "name": "New Demotic",
      "source": "Trials of Osiris",
      "bonuses": [
        {
          "pcs": 4,
          "bonus": "Martingale",
          "tier": "F",
          "tags": [
            "pvp"
          ],
          "effect": "? handling and ?x ADS duration for ?s",
          "notes": "technically helpful stats but requirements aren't really skill-sourced"
        },
        {
          "pcs": 2,
          "bonus": "Paroli",
          "tier": "F",
          "tags": [
            "pvp"
          ],
          "effect": "?% flinch resist for ?s",
          "notes": "does literally nothing in PvE"
        }
      ],
      "best": "F"
    }
  },
  "items": {
    "triumphalanthemgrips": "triumphalanthem",
    "triumphalanthemvest": "triumphalanthem",
    "triumphalanthemcloak": "triumphalanthem",
    "triumphalanthemmask": "triumphalanthem",
    "triumphalanthemstrides": "triumphalanthem",
    "triumphalanthemgauntlets": "triumphalanthem",
    "triumphalanthemplate": "triumphalanthem",
    "triumphalanthemmark": "triumphalanthem",
    "triumphalanthemhelm": "triumphalanthem",
    "triumphalanthemgreaves": "triumphalanthem",
    "triumphalanthemgloves": "triumphalanthem",
    "triumphalanthemrobes": "triumphalanthem",
    "triumphalanthembond": "triumphalanthem",
    "triumphalanthemcover": "triumphalanthem",
    "triumphalanthemboots": "triumphalanthem",
    "seventhseraphgrips": "seventhseraph",
    "seventhseraphvest": "seventhseraph",
    "seventhseraphcloak": "seventhseraph",
    "seventhseraphcowl": "seventhseraph",
    "seventhseraphstrides": "seventhseraph",
    "seventhseraphgloves": "seventhseraph",
    "seventhseraphrobes": "seventhseraph",
    "seventhseraphbond": "seventhseraph",
    "seventhseraphhood": "seventhseraph",
    "seventhseraphboots": "seventhseraph",
    "seventhseraphgauntlets": "seventhseraph",
    "seventhseraphplate": "seventhseraph",
    "seventhseraphmark": "seventhseraph",
    "seventhseraphhelmet": "seventhseraph",
    "seventhseraphgreaves": "seventhseraph",
    "techsecgrasps": "techsec",
    "techseccloak": "techsec",
    "techsecvest": "techsec",
    "techsecmask": "techsec",
    "techsecstrides": "techsec",
    "techsecgauntlets": "techsec",
    "techsecmark": "techsec",
    "techsecplate": "techsec",
    "techsechelm": "techsec",
    "techsecboots": "techsec",
    "techsecgloves": "techsec",
    "techsecbond": "techsec",
    "techsecvestment": "techsec",
    "techsechood": "techsec",
    "darkhollowgrasps": "oryxsmemory",
    "darkhollowchiton": "oryxsmemory",
    "darkhollowmask": "oryxsmemory",
    "darkhollowtreads": "oryxsmemory",
    "darkhollowmantle": "oryxsmemory",
    "warnumensfist": "oryxsmemory",
    "warnumenschest": "oryxsmemory",
    "warnumenscrown": "oryxsmemory",
    "warnumensboots": "oryxsmemory",
    "warnumensmark": "oryxsmemory",
    "graspofeir": "oryxsmemory",
    "chasmofyul": "oryxsmemory",
    "mouthofur": "oryxsmemory",
    "pathofxol": "oryxsmemory",
    "bondofthewormlore": "oryxsmemory",
    "ironpanoplygrasps": "ironpanoply",
    "ironpanoplyvest": "ironpanoply",
    "ironpanoplycloak": "ironpanoply",
    "ironpanoplymask": "ironpanoply",
    "ironpanoplystrides": "ironpanoply",
    "ironpanoplygauntlets": "ironpanoply",
    "ironpanoplyplate": "ironpanoply",
    "ironpanoplymark": "ironpanoply",
    "ironpanoplyhelm": "ironpanoply",
    "ironpanoplygreaves": "ironpanoply",
    "ironpanoplygloves": "ironpanoply",
    "ironpanoplyvestment": "ironpanoply",
    "ironpanoplybond": "ironpanoply",
    "ironpanoplyhood": "ironpanoply",
    "ironpanoplyboots": "ironpanoply",
    "resonantfurygrips": "resonantfury",
    "resonantfuryvest": "resonantfury",
    "resonantfurycloak": "resonantfury",
    "resonantfurymask": "resonantfury",
    "resonantfurystrides": "resonantfury",
    "resonantfurygauntlets": "resonantfury",
    "resonantfuryplate": "resonantfury",
    "resonantfurymark": "resonantfury",
    "resonantfuryhelm": "resonantfury",
    "resonantfurygreaves": "resonantfury",
    "resonantfurygloves": "resonantfury",
    "resonantfuryrobes": "resonantfury",
    "resonantfurybond": "resonantfury",
    "resonantfurycowl": "resonantfury",
    "resonantfuryboots": "resonantfury",
    "reveriedawngrasps": "reveriedawn",
    "reveriedawnhauberk": "reveriedawn",
    "reveriedawncloak": "reveriedawn",
    "reveriedawncasque": "reveriedawn",
    "reveriedawnstrides": "reveriedawn",
    "reveriedawngauntlets": "reveriedawn",
    "reveriedawnplate": "reveriedawn",
    "reveriedawnmark": "reveriedawn",
    "reveriedawnhelm": "reveriedawn",
    "reveriedawngreaves": "reveriedawn",
    "reveriedawngloves": "reveriedawn",
    "reveriedawntabard": "reveriedawn",
    "reveriedawnbond": "reveriedawn",
    "reveriedawnhood": "reveriedawn",
    "reveriedawnboots": "reveriedawn",
    "luminopotentgrips": "luminopotent",
    "luminopotentcuirass": "luminopotent",
    "luminopotentcloak": "luminopotent",
    "luminopotentmask": "luminopotent",
    "luminopotentstrides": "luminopotent",
    "luminopotentgauntlets": "luminopotent",
    "luminopotentplate": "luminopotent",
    "luminopotentmark": "luminopotent",
    "luminopotenthelm": "luminopotent",
    "luminopotentgreaves": "luminopotent",
    "luminopotentgloves": "luminopotent",
    "luminopotentrobes": "luminopotent",
    "luminopotentbond": "luminopotent",
    "luminopotentcover": "luminopotent",
    "luminopotentboots": "luminopotent",
    "gripsofexaltation": "kentarch3",
    "vestoftranscendence": "kentarch3",
    "cloakoftemptation": "kentarch3",
    "cowlofrighteousness": "kentarch3",
    "stridesofascendancy": "kentarch3",
    "gauntletsofexaltation": "kentarch3",
    "plateoftranscendence": "kentarch3",
    "temptationsmark": "kentarch3",
    "helmofrighteousness": "kentarch3",
    "greavesofascendancy": "kentarch3",
    "glovesofexaltation": "kentarch3",
    "robesoftranscendence": "kentarch3",
    "temptationsbond": "kentarch3",
    "maskofrighteousness": "kentarch3",
    "bootsofascendancy": "kentarch3",
    "gripsofthegreathunt": "greathunt",
    "vestofthegreathunt": "greathunt",
    "cloakofthegreathunt": "greathunt",
    "maskofthegreathunt": "greathunt",
    "stridesofthegreathunt": "greathunt",
    "gauntletsofthegreathunt": "greathunt",
    "plateofthegreathunt": "greathunt",
    "markofthegreathunt": "greathunt",
    "helmofthegreathunt": "greathunt",
    "greavesofthegreathunt": "greathunt",
    "glovesofthegreathunt": "greathunt",
    "robesofthegreathunt": "greathunt",
    "bondofthegreathunt": "greathunt",
    "hoodofthegreathunt": "greathunt",
    "bootsofthegreathunt": "greathunt",
    "primezealotgloves": "atheonsmemory",
    "primezealotcuirass": "atheonsmemory",
    "shatteredvaultcloak": "atheonsmemory",
    "primezealotmask": "atheonsmemory",
    "primezealotstrides": "atheonsmemory",
    "kabrsbrazengrips": "atheonsmemory",
    "kabrswrath": "atheonsmemory",
    "lightofthegreatprism": "atheonsmemory",
    "kabrsbattlecage": "atheonsmemory",
    "kabrsforcefulgreaves": "atheonsmemory",
    "glovesofthehezenlords": "atheonsmemory",
    "cuirassofthehezenlords": "atheonsmemory",
    "fragmentoftheprime": "atheonsmemory",
    "facadeofthehezenlords": "atheonsmemory",
    "treadofthehezenlords": "atheonsmemory",
    "cruelelectrumgrips": "cruelelectrum",
    "cruelelectrumvest": "cruelelectrum",
    "cruelelectrumcloak": "cruelelectrum",
    "cruelelectrummask": "cruelelectrum",
    "cruelelectrumstrides": "cruelelectrum",
    "cruelelectrumgauntlets": "cruelelectrum",
    "cruelelectrumplate": "cruelelectrum",
    "cruelelectrummark": "cruelelectrum",
    "cruelelectrumhelm": "cruelelectrum",
    "cruelelectrumgreaves": "cruelelectrum",
    "cruelelectrumgloves": "cruelelectrum",
    "cruelelectrumrobes": "cruelelectrum",
    "cruelelectrumbond": "cruelelectrum",
    "cruelelectrumhood": "cruelelectrum",
    "cruelelectrumboots": "cruelelectrum",
    "legacysoathgrips": "legacysoath",
    "legacysoathvest": "legacysoath",
    "legacysoathcloak": "legacysoath",
    "legacysoathmask": "legacysoath",
    "legacysoathstrides": "legacysoath",
    "legacysoathgauntlets": "legacysoath",
    "legacysoathplate": "legacysoath",
    "legacysoathmark": "legacysoath",
    "legacysoathhelm": "legacysoath",
    "legacysoathgreaves": "legacysoath",
    "legacysoathgloves": "legacysoath",
    "legacysoathrobes": "legacysoath",
    "legacysoathbond": "legacysoath",
    "legacysoathcowl": "legacysoath",
    "legacysoathboots": "legacysoath",
    "aionadaptergrips": "aionadapter",
    "aionadaptercloak": "aionadapter",
    "aionadaptervest": "aionadapter",
    "aionadaptermask": "aionadapter",
    "aionadapterstrides": "aionadapter",
    "aionadaptergauntlets": "aionadapter",
    "aionadaptermark": "aionadapter",
    "aionadapterplate": "aionadapter",
    "aionadapterhelm": "aionadapter",
    "aionadaptergreaves": "aionadapter",
    "aionadaptergloves": "aionadapter",
    "aionadapterbond": "aionadapter",
    "aionadapterrobes": "aionadapter",
    "aionadapterhood": "aionadapter",
    "aionadapterboots": "aionadapter",
    "collectivepsychesleeves": "collectivepsyche",
    "collectivepsychecloak": "collectivepsyche",
    "collectivepsychecuirass": "collectivepsyche",
    "collectivepsychecasque": "collectivepsyche",
    "collectivepsychestrides": "collectivepsyche",
    "collectivepsychegauntlets": "collectivepsyche",
    "collectivepsychemark": "collectivepsyche",
    "collectivepsycheplate": "collectivepsyche",
    "collectivepsychehelm": "collectivepsyche",
    "collectivepsychegreaves": "collectivepsyche",
    "collectivepsychegloves": "collectivepsyche",
    "collectivepsychebond": "collectivepsyche",
    "collectivepsycherobes": "collectivepsyche",
    "collectivepsychecover": "collectivepsyche",
    "collectivepsycheboots": "collectivepsyche",
    "bushidogrips": "bushido",
    "bushidocloak": "bushido",
    "bushidovest": "bushido",
    "bushidocowl": "bushido",
    "bushidostrides": "bushido",
    "bushidogauntlets": "bushido",
    "bushidomark": "bushido",
    "bushidoplate": "bushido",
    "bushidohelm": "bushido",
    "bushidogreaves": "bushido",
    "bushidogloves": "bushido",
    "bushidobond": "bushido",
    "bushidorobes": "bushido",
    "bushidoboots": "bushido",
    "aionrenewalgrips": "aionrenewal",
    "aionrenewalcloak": "aionrenewal",
    "aionrenewalvest": "aionrenewal",
    "aionrenewalmask": "aionrenewal",
    "aionrenewalstrides": "aionrenewal",
    "aionrenewalgauntlets": "aionrenewal",
    "aionrenewalmark": "aionrenewal",
    "aionrenewalplate": "aionrenewal",
    "aionrenewalhelm": "aionrenewal",
    "aionrenewalgreaves": "aionrenewal",
    "aionrenewalgloves": "aionrenewal",
    "aionrenewalbond": "aionrenewal",
    "aionrenewalrobes": "aionrenewal",
    "aionrenewalhood": "aionrenewal",
    "aionrenewalboots": "aionrenewal",
    "techeunsregaliagrips": "techeunsregalia",
    "techeunsregaliavest": "techeunsregalia",
    "techeunsregaliamask": "techeunsregalia",
    "techeunsregaliastrides": "techeunsregalia",
    "techeunsregaliacloak": "techeunsregalia",
    "techeunsregaliagauntlets": "techeunsregalia",
    "techeunsregaliaplate": "techeunsregalia",
    "techeunsregaliahelmet": "techeunsregalia",
    "techeunsregaliagreaves": "techeunsregalia",
    "techeunsregaliamark": "techeunsregalia",
    "techeunsregaliagloves": "techeunsregalia",
    "techeunsregaliarobes": "techeunsregalia",
    "techeunsregaliahood": "techeunsregalia",
    "techeunsregaliaboots": "techeunsregalia",
    "techeunsregaliabond": "techeunsregalia",
    "apostatesbladegrips": "apostatesblade",
    "apostatesbladevest": "apostatesblade",
    "apostatesbladecloak": "apostatesblade",
    "apostatesblademask": "apostatesblade",
    "apostatesbladestrides": "apostatesblade",
    "apostatesbladegauntlets": "apostatesblade",
    "apostatesbladeplate": "apostatesblade",
    "apostatesblademark": "apostatesblade",
    "apostatesbladehelm": "apostatesblade",
    "apostatesbladegreaves": "apostatesblade",
    "apostatesbladegloves": "apostatesblade",
    "apostatesbladerobe": "apostatesblade",
    "apostatesbladebond": "apostatesblade",
    "apostatesbladehood": "apostatesblade",
    "apostatesbladeboots": "apostatesblade",
    "flowinggripscoda": "coda",
    "flowingvestcoda": "coda",
    "cloakjudgmentcoda": "coda",
    "flowingcowlcoda": "coda",
    "flowingbootscoda": "coda",
    "crushingguardcoda": "coda",
    "crushingplatecoda": "coda",
    "markjudgmentcoda": "coda",
    "crushinghelmcoda": "coda",
    "crushinggreavescoda": "coda",
    "channelingwrapscoda": "coda",
    "channelingrobescoda": "coda",
    "bondjudgmentcoda": "coda",
    "channelingcowlcoda": "coda",
    "channelingtreadscoda": "coda",
    "twistingechogrips": "yearningecho",
    "twistingechovest": "yearningecho",
    "twistingechocloak": "yearningecho",
    "twistingechomask": "yearningecho",
    "twistingechostrides": "yearningecho",
    "descendingechogauntlets": "yearningecho",
    "descendingechocage": "yearningecho",
    "descendingechomark": "yearningecho",
    "descendingechohelm": "yearningecho",
    "descendingechogreaves": "yearningecho",
    "corruptingechogloves": "yearningecho",
    "corruptingechorobes": "yearningecho",
    "corruptingechobond": "yearningecho",
    "corruptingechocover": "yearningecho",
    "corruptingechoboots": "yearningecho",
    "tmearpcustomgrips": "tmcustom",
    "tmearpcustomvest": "tmcustom",
    "tmearpcustomhood": "tmcustom",
    "tmearpcustomchaps": "tmcustom",
    "tmearpcustomcloakedstetson": "tmcustom",
    "tmcogburncustomgauntlets": "tmcustom",
    "tmcogburncustomplate": "tmcustom",
    "tmcogburncustomcover": "tmcustom",
    "tmcogburncustomlegguards": "tmcustom",
    "tmcogburncustommark": "tmcustom",
    "tmmosscustomgloves": "tmcustom",
    "tmmosscustomduster": "tmcustom",
    "tmmosscustomhat": "tmcustom",
    "tmmosscustompants": "tmcustom",
    "tmmosscustombond": "tmcustom",
    "deepexplorergrasps": "deepexplorer",
    "deepexplorervest": "deepexplorer",
    "deepexplorercloak": "deepexplorer",
    "deepexplorermask": "deepexplorer",
    "deepexplorerstrides": "deepexplorer",
    "deepexplorergauntlets": "deepexplorer",
    "deepexplorerplate": "deepexplorer",
    "deepexplorermark": "deepexplorer",
    "deepexplorerhelmet": "deepexplorer",
    "deepexplorergreaves": "deepexplorer",
    "deepexplorergloves": "deepexplorer",
    "deepexplorervestments": "deepexplorer",
    "deepexplorerbond": "deepexplorer",
    "deepexplorerhood": "deepexplorer",
    "deepexplorerboots": "deepexplorer",
    "graspsofthetakenking": "takenking",
    "vestofthetakenking": "takenking",
    "maskofthetakenking": "takenking",
    "stridesofthetakenking": "takenking",
    "cloakofthetakenking": "takenking",
    "gauntletsofthetakenking": "takenking",
    "plateofthetakenking": "takenking",
    "helmofthetakenking": "takenking",
    "greavesofthetakenking": "takenking",
    "markofthetakenking": "takenking",
    "glovesofthetakenking": "takenking",
    "vestmentofthetakenking": "takenking",
    "hoodofthetakenking": "takenking",
    "bootsofthetakenking": "takenking",
    "bondofthetakenking": "takenking",
    "firstascentgrips": "firstascent",
    "firstascentvest": "firstascent",
    "firstascentcloak": "firstascent",
    "firstascentcasque": "firstascent",
    "firstascentstrides": "firstascent",
    "firstascentgauntlets": "firstascent",
    "firstascentplate": "firstascent",
    "firstascentmark": "firstascent",
    "firstascenthelm": "firstascent",
    "firstascentgreaves": "firstascent",
    "firstascentgloves": "firstascent",
    "firstascentrobes": "firstascent",
    "firstascentbond": "firstascent",
    "firstascenthood": "firstascent",
    "firstascentboots": "firstascent",
    "darkagegrips": "darkage",
    "darkageharness": "darkage",
    "darkagecloak": "darkage",
    "darkagemask": "darkage",
    "darkagestrides": "darkage",
    "darkagegauntlets": "darkage",
    "darkagechestrig": "darkage",
    "darkagemark": "darkage",
    "darkagehelm": "darkage",
    "darkagesabatons": "darkage",
    "darkagegloves": "darkage",
    "darkageovercoat": "darkage",
    "darkagebond": "darkage",
    "darkagevisor": "darkage",
    "darkagelegbraces": "darkage",
    "ironbattaliongrips": "ironbattalion",
    "ironbattalionvest": "ironbattalion",
    "ironbattalioncloak": "ironbattalion",
    "ironbattalioncowl": "ironbattalion",
    "ironbattalionstrides": "ironbattalion",
    "ironbattaliongauntlets": "ironbattalion",
    "ironbattalionplate": "ironbattalion",
    "ironbattalionmark": "ironbattalion",
    "ironbattalionhelm": "ironbattalion",
    "ironbattaliongreaves": "ironbattalion",
    "ironbattaliongloves": "ironbattalion",
    "ironbattalionrobes": "ironbattalion",
    "ironbattalionbond": "ironbattalion",
    "ironbattalioncover": "ironbattalion",
    "ironbattalionboots": "ironbattalion",
    "cyberserpentnullgrips": "cyberserpentnull",
    "cyberserpentnullvest": "cyberserpentnull",
    "cyberserpentnullcloak": "cyberserpentnull",
    "cyberserpentnullmask": "cyberserpentnull",
    "cyberserpentnullstrides": "cyberserpentnull",
    "cyberserpentnullgauntlets": "cyberserpentnull",
    "cyberserpentnullplate": "cyberserpentnull",
    "cyberserpentnullmark": "cyberserpentnull",
    "cyberserpentnullhelm": "cyberserpentnull",
    "cyberserpentnullgreaves": "cyberserpentnull",
    "cyberserpentnullgloves": "cyberserpentnull",
    "cyberserpentnullrobes": "cyberserpentnull",
    "cyberserpentnullbond": "cyberserpentnull",
    "cyberserpentnullcover": "cyberserpentnull",
    "cyberserpentnullboots": "cyberserpentnull",
    "circuitgauntlets": "circuit",
    "circuitchestplate": "circuit",
    "racersscarf": "circuit",
    "circuitdefender": "circuit",
    "circuitstriders": "circuit",
    "racersmark": "circuit",
    "circuitkeeper": "circuit",
    "racersbond": "circuit",
    "circuitrunner": "circuit",
    "newdemoticgrasps": "newdemotic",
    "newdemoticvest": "newdemotic",
    "newdemoticcloak": "newdemotic",
    "newdemoticmask": "newdemotic",
    "newdemoticstrides": "newdemotic",
    "newdemoticgauntlets": "newdemotic",
    "newdemoticplate": "newdemotic",
    "newdemoticmark": "newdemotic",
    "newdemotichelm": "newdemotic",
    "newdemoticgreaves": "newdemotic",
    "newdemoticgloves": "newdemotic",
    "newdemoticrobes": "newdemotic",
    "newdemoticbond": "newdemotic",
    "newdemoticcover": "newdemotic",
    "newdemoticboots": "newdemotic",
    "thrivingsurvivorgrips": "thrivingsurvivor",
    "thrivingsurvivorvest": "thrivingsurvivor",
    "thrivingsurvivorcloak": "thrivingsurvivor",
    "thrivingsurvivorcowl": "thrivingsurvivor",
    "thrivingsurvivorstrides": "thrivingsurvivor",
    "thrivingsurvivorgauntlets": "thrivingsurvivor",
    "thrivingsurvivorplate": "thrivingsurvivor",
    "thrivingsurvivormark": "thrivingsurvivor",
    "thrivingsurvivorhelm": "thrivingsurvivor",
    "thrivingsurvivorgreaves": "thrivingsurvivor",
    "thrivingsurvivorgloves": "thrivingsurvivor",
    "thrivingsurvivorrobe": "thrivingsurvivor",
    "thrivingsurvivorbond": "thrivingsurvivor",
    "thrivingsurvivorcover": "thrivingsurvivor",
    "thrivingsurvivorboots": "thrivingsurvivor",
    "dreambanegrips": "dreambane",
    "dreambanevest": "dreambane",
    "dreambanecloak": "dreambane",
    "dreambanecowl": "dreambane",
    "dreambanestrides": "dreambane",
    "dreambanegauntlets": "dreambane",
    "dreambaneplate": "dreambane",
    "dreambanemark": "dreambane",
    "dreambanehelm": "dreambane",
    "dreambanegreaves": "dreambane",
    "dreambanegloves": "dreambane",
    "dreambanerobes": "dreambane",
    "dreambanebond": "dreambane",
    "dreambanehood": "dreambane",
    "dreambaneboots": "dreambane",
    "wildanthemgrips": "wildanthem",
    "wildanthemvest": "wildanthem",
    "wildanthemcloak": "wildanthem",
    "wildanthemmask": "wildanthem",
    "wildanthemstrides": "wildanthem",
    "wildanthemgauntlets": "wildanthem",
    "wildanthemplate": "wildanthem",
    "wildanthemmark": "wildanthem",
    "wildanthemhelm": "wildanthem",
    "wildanthemgreaves": "wildanthem",
    "wildanthemgloves": "wildanthem",
    "wildanthemrobes": "wildanthem",
    "wildanthembond": "wildanthem",
    "wildanthemcover": "wildanthem",
    "wildanthemboots": "wildanthem",
    "pantheosresplendentgrasps": "pantheosresplendent",
    "pantheosresplendentvest": "pantheosresplendent",
    "pantheosresplendentcloak": "pantheosresplendent",
    "pantheosresplendentmask": "pantheosresplendent",
    "pantheosresplendentstrides": "pantheosresplendent",
    "pantheosresplendentgauntlets": "pantheosresplendent",
    "pantheosresplendentplate": "pantheosresplendent",
    "pantheosresplendentmark": "pantheosresplendent",
    "pantheosresplendenthelm": "pantheosresplendent",
    "pantheosresplendentgreaves": "pantheosresplendent",
    "pantheosresplendentgloves": "pantheosresplendent",
    "pantheosresplendentrobes": "pantheosresplendent",
    "pantheosresplendentbond": "pantheosresplendent",
    "pantheosresplendenthood": "pantheosresplendent",
    "pantheosresplendentboots": "pantheosresplendent",
    "swordmastersgrips": "swordmaster",
    "swordmastersvest": "swordmaster",
    "swordmasterscloak": "swordmaster",
    "swordmastersmask": "swordmaster",
    "swordmastersstrides": "swordmaster",
    "swordmastersgauntlets": "swordmaster",
    "swordmastersplate": "swordmaster",
    "swordmastersmark": "swordmaster",
    "swordmastershelm": "swordmaster",
    "swordmastersgreaves": "swordmaster",
    "swordmastersgloves": "swordmaster",
    "swordmastersrobes": "swordmaster",
    "swordmastersbond": "swordmaster",
    "swordmasterscover": "swordmaster",
    "swordmastersboots": "swordmaster",
    "eutechnologysleeves": "eutechnology",
    "eutechnologyvest": "eutechnology",
    "eutechnologycloak": "eutechnology",
    "eutechnologycowl": "eutechnology",
    "eutechnologystrides": "eutechnology",
    "eutechnologygauntlets": "eutechnology",
    "eutechnologyplate": "eutechnology",
    "eutechnologymark": "eutechnology",
    "eutechnologyhelm": "eutechnology",
    "eutechnologygreaves": "eutechnology",
    "eutechnologygloves": "eutechnology",
    "eutechnologyrobes": "eutechnology",
    "eutechnologybond": "eutechnology",
    "eutechnologycover": "eutechnology",
    "eutechnologyboots": "eutechnology",
    "veritasgrips": "veritas",
    "veritasvest": "veritas",
    "veritascloak": "veritas",
    "veritascowl": "veritas",
    "veritasstrides": "veritas",
    "veritasgauntlets": "veritas",
    "veritasplate": "veritas",
    "veritasmark": "veritas",
    "veritashelm": "veritas",
    "veritasgreaves": "veritas",
    "veritasgloves": "veritas",
    "veritasrobe": "veritas",
    "veritasbond": "veritas",
    "veritashood": "veritas",
    "veritasboots": "veritas",
    "wildwoodgauntlets": "wildwood",
    "wildwoodplate": "wildwood",
    "wildwoodmark": "wildwood",
    "wildwoodhelm": "wildwood",
    "wildwoodgreaves": "wildwood",
    "wildwoodgloves": "wildwood",
    "wildwoodrobes": "wildwood",
    "wildwoodbond": "wildwood",
    "wildwoodcover": "wildwood",
    "wildwoodboots": "wildwood",
    "wildwoodgrips": "wildwood",
    "wildwoodvest": "wildwood",
    "wildwoodcloak": "wildwood",
    "wildwoodmask": "wildwood",
    "wildwoodstrides": "wildwood",
    "gripsoftrepidation": "nezarecsnightmare",
    "vestoftrepidation": "nezarecsnightmare",
    "maskoftrepidation": "nezarecsnightmare",
    "bootsoftrepidation": "nezarecsnightmare",
    "cloakoftrepidation": "nezarecsnightmare",
    "gauntletsofagony": "nezarecsnightmare",
    "plateofagony": "nezarecsnightmare",
    "helmofagony": "nezarecsnightmare",
    "greavesofagony": "nezarecsnightmare",
    "markofagony": "nezarecsnightmare",
    "wrapsofdetestation": "nezarecsnightmare",
    "robesofdetestation": "nezarecsnightmare",
    "maskofdetestation": "nezarecsnightmare",
    "bootsofdetestation": "nezarecsnightmare",
    "bondofdetestation": "nezarecsnightmare",
    "peraudaciagrips": "peraudacia",
    "peraudaciacuirass": "peraudacia",
    "peraudaciacloak": "peraudacia",
    "peraudaciacasque": "peraudacia",
    "peraudaciastrides": "peraudacia",
    "peraudaciagauntlets": "peraudacia",
    "peraudaciaplate": "peraudacia",
    "peraudaciamark": "peraudacia",
    "peraudaciahelm": "peraudacia",
    "peraudaciagreaves": "peraudacia",
    "peraudaciagloves": "peraudacia",
    "peraudaciarobes": "peraudacia",
    "peraudaciabond": "peraudacia",
    "peraudaciacover": "peraudacia",
    "peraudaciaboots": "peraudacia",
    "doggedgage": "crotasmemory",
    "relentlessharness": "crotasmemory",
    "shroudofflies": "crotasmemory",
    "unyieldingcasque": "crotasmemory",
    "tirelessstriders": "crotasmemory",
    "willbreakersfists": "crotasmemory",
    "willbreakersresolve": "crotasmemory",
    "markofthepit": "crotasmemory",
    "willbreakerswatch": "crotasmemory",
    "willbreakersgreaves": "crotasmemory",
    "deathsingersgrip": "crotasmemory",
    "deathsingersmantle": "crotasmemory",
    "bonecirclet": "crotasmemory",
    "deathsingersgaze": "crotasmemory",
    "deathsingersherald": "crotasmemory",
    "promisedreigngrips": "promised",
    "promisedreignvest": "promised",
    "promisedreigncloak": "promised",
    "promisedreignmask": "promised",
    "promisedreignstrides": "promised",
    "promisedreuniongauntlets": "promised",
    "promisedreunionplate": "promised",
    "promisedreunionmark": "promised",
    "promisedreunionhelm": "promised",
    "promisedreuniongreaves": "promised",
    "promisedvictorywraps": "promised",
    "promisedvictoryrobes": "promised",
    "promisedvictorybond": "promised",
    "promisedvictoryhood": "promised",
    "promisedvictoryboots": "promised",
    "smokejumpergrasps": "smokejumper",
    "smokejumpercloak": "smokejumper",
    "smokejumpervest": "smokejumper",
    "smokejumpermask": "smokejumper",
    "smokejumperstrides": "smokejumper",
    "smokejumpergauntlets": "smokejumper",
    "smokejumpermark": "smokejumper",
    "smokejumperplate": "smokejumper",
    "smokejumperhelm": "smokejumper",
    "smokejumperboots": "smokejumper",
    "smokejumpergloves": "smokejumper",
    "smokejumperbond": "smokejumper",
    "smokejumpervestment": "smokejumper",
    "smokejumperhood": "smokejumper",
    "shrewdsurvivorgrips": "shrewdsurvivor",
    "shrewdsurvivorvest": "shrewdsurvivor",
    "shrewdsurvivorcloak": "shrewdsurvivor",
    "shrewdsurvivorcowl": "shrewdsurvivor",
    "shrewdsurvivorstrides": "shrewdsurvivor",
    "shrewdsurvivorgauntlets": "shrewdsurvivor",
    "shrewdsurvivorplate": "shrewdsurvivor",
    "shrewdsurvivormark": "shrewdsurvivor",
    "shrewdsurvivorhelm": "shrewdsurvivor",
    "shrewdsurvivorgreaves": "shrewdsurvivor",
    "shrewdsurvivorgloves": "shrewdsurvivor",
    "shrewdsurvivorrobe": "shrewdsurvivor",
    "shrewdsurvivorbond": "shrewdsurvivor",
    "shrewdsurvivorcover": "shrewdsurvivor",
    "shrewdsurvivorboots": "shrewdsurvivor",
    "disastercorpsgrasps": "disastercorps",
    "disastercorpscloak": "disastercorps",
    "disastercorpsvest": "disastercorps",
    "disastercorpsmask": "disastercorps",
    "disastercorpsstrides": "disastercorps",
    "disastercorpsgauntlets": "disastercorps",
    "disastercorpsmark": "disastercorps",
    "disastercorpsplate": "disastercorps",
    "disastercorpshelm": "disastercorps",
    "disastercorpsgreaves": "disastercorps",
    "disastercorpsgloves": "disastercorps",
    "disastercorpsbond": "disastercorps",
    "disastercorpsvestment": "disastercorps",
    "disastercorpshood": "disastercorps",
    "disastercorpsboots": "disastercorps",
    "crystocrenegrips": "crystocrene",
    "crystocrenevest": "crystocrene",
    "crystocrenecloak": "crystocrene",
    "crystocrenecowl": "crystocrene",
    "crystocrenestrides": "crystocrene",
    "crystocrenegauntlets": "crystocrene",
    "crystocreneplate": "crystocrene",
    "crystocrenemark": "crystocrene",
    "crystocrenehelm": "crystocrene",
    "crystocrenegreaves": "crystocrene",
    "crystocrenegloves": "crystocrene",
    "crystocrenerobes": "crystocrene",
    "crystocrenebond": "crystocrene",
    "crystocrenehood": "crystocrene",
    "crystocreneboots": "crystocrene",
    "exodusdowngrips": "exodusdown",
    "exodusdownvest": "exodusdown",
    "exodusdowncloak": "exodusdown",
    "exodusdownmask": "exodusdown",
    "exodusdownstrides": "exodusdown",
    "exodusdowngauntlets": "exodusdown",
    "exodusdownplate": "exodusdown",
    "exodusdownmark": "exodusdown",
    "exodusdownhelm": "exodusdown",
    "exodusdowngreaves": "exodusdown",
    "exodusdowngloves": "exodusdown",
    "exodusdownrobes": "exodusdown",
    "exodusdownbond": "exodusdown",
    "exodusdownhood": "exodusdown",
    "exodusdownboots": "exodusdown",
    "lastdisciplinegrasps": "lastdiscipline",
    "lastdisciplinecloak": "lastdiscipline",
    "lastdisciplinevest": "lastdiscipline",
    "lastdisciplinemask": "lastdiscipline",
    "lastdisciplinestrides": "lastdiscipline",
    "lastdisciplinegauntlets": "lastdiscipline",
    "lastdisciplinemark": "lastdiscipline",
    "lastdisciplineplate": "lastdiscipline",
    "lastdisciplinehelm": "lastdiscipline",
    "lastdisciplinegreaves": "lastdiscipline",
    "lastdisciplinegloves": "lastdiscipline",
    "lastdisciplinebond": "lastdiscipline",
    "lastdisciplinevestment": "lastdiscipline",
    "lastdisciplinehood": "lastdiscipline",
    "lastdisciplineboots": "lastdiscipline",
    "twofoldcrowngrasps": "twofoldcrown",
    "twofoldcrowncloak": "twofoldcrown",
    "twofoldcrownvest": "twofoldcrown",
    "twofoldcrownmask": "twofoldcrown",
    "twofoldcrownstrides": "twofoldcrown",
    "twofoldcrowngauntlets": "twofoldcrown",
    "twofoldcrownmark": "twofoldcrown",
    "twofoldcrownplate": "twofoldcrown",
    "twofoldcrownhelm": "twofoldcrown",
    "twofoldcrowngreaves": "twofoldcrown",
    "twofoldcrowngloves": "twofoldcrown",
    "twofoldcrownbond": "twofoldcrown",
    "twofoldcrownrobes": "twofoldcrown",
    "twofoldcrowncowl": "twofoldcrown",
    "twofoldcrownboots": "twofoldcrown",
    "thunderheadgrips": "thunderhead",
    "thunderheadvest": "thunderhead",
    "thunderheadmask": "thunderhead",
    "thunderheadstrides": "thunderhead",
    "thunderheadcloak": "thunderhead",
    "thunderheadgauntlets": "thunderhead",
    "thunderheadplate": "thunderhead",
    "thunderheadhelm": "thunderhead",
    "thunderheadgreaves": "thunderhead",
    "thunderheadmark": "thunderhead",
    "thunderheadgloves": "thunderhead",
    "thunderheadrobes": "thunderhead",
    "thunderheadcover": "thunderhead",
    "thunderheadboots": "thunderhead",
    "thunderheadbond": "thunderhead",
    "spacewalkgrasps": "spacewalk",
    "spacewalkvest": "spacewalk",
    "spacewalkcloak": "spacewalk",
    "spacewalkcowl": "spacewalk",
    "spacewalkstrides": "spacewalk",
    "spacewalkgauntlets": "spacewalk",
    "spacewalkplate": "spacewalk",
    "spacewalkmark": "spacewalk",
    "spacewalkhelm": "spacewalk",
    "spacewalkgreaves": "spacewalk",
    "spacewalkgloves": "spacewalk",
    "spacewalkrobes": "spacewalk",
    "spacewalkbond": "spacewalk",
    "spacewalkcover": "spacewalk",
    "spacewalkboots": "spacewalk",
    "graspsoftheflain": "flain",
    "scalesoftheflain": "flain",
    "huskscloak": "flain",
    "maskoftheflain": "flain",
    "hooksoftheflain": "flain",
    "gripsoftheflain": "flain",
    "carapaceoftheflain": "flain",
    "attendantsmark": "flain",
    "skulloftheflain": "flain",
    "clawsoftheflain": "flain",
    "reachoftheflain": "flain",
    "adornmentoftheflain": "flain",
    "weaversbond": "flain",
    "visageoftheflain": "flain",
    "talonsoftheflain": "flain",
    "ferropotentgrips": "ferropotent",
    "ferropotentcuirass": "ferropotent",
    "ferropotentcloak": "ferropotent",
    "ferropotentmask": "ferropotent",
    "ferropotentstrides": "ferropotent",
    "ferropotentgauntlets": "ferropotent",
    "ferropotentplate": "ferropotent",
    "ferropotentmark": "ferropotent",
    "ferropotenthead": "ferropotent",
    "ferropotentgreaves": "ferropotent",
    "ferropotentgloves": "ferropotent",
    "ferropotentrobes": "ferropotent",
    "ferropotentbond": "ferropotent",
    "ferropotentcover": "ferropotent",
    "ferropotentboots": "ferropotent",
    "lustrousgrips": "lustrous",
    "lustrousvest": "lustrous",
    "lustrouscloak": "lustrous",
    "lustrouscasque": "lustrous",
    "lustrousstrides": "lustrous",
    "lustrousgauntlets": "lustrous",
    "lustrousplate": "lustrous",
    "lustrousmark": "lustrous",
    "lustroushelm": "lustrous",
    "lustrousgreaves": "lustrous",
    "lustroussleeves": "lustrous",
    "lustrousrobes": "lustrous",
    "lustrousbond": "lustrous",
    "lustrouscover": "lustrous",
    "lustrousboots": "lustrous",
    "sageprotectorgrips": "sageprotector",
    "sageprotectorvest": "sageprotector",
    "sageprotectorcloak": "sageprotector",
    "sageprotectorcowl": "sageprotector",
    "sageprotectorstrides": "sageprotector",
    "sageprotectorgauntlets": "sageprotector",
    "sageprotectorplate": "sageprotector",
    "sageprotectormark": "sageprotector",
    "sageprotectorhelm": "sageprotector",
    "sageprotectorgreaves": "sageprotector",
    "sageprotectorgloves": "sageprotector",
    "sageprotectorrobes": "sageprotector",
    "sageprotectorbond": "sageprotector",
    "sageprotectorcover": "sageprotector",
    "sageprotectorboots": "sageprotector"
  },
  "itemClass": {
    "triumphalanthemgrips": "Hunter",
    "triumphalanthemvest": "Hunter",
    "triumphalanthemcloak": "Hunter",
    "triumphalanthemmask": "Hunter",
    "triumphalanthemstrides": "Hunter",
    "triumphalanthemgauntlets": "Titan",
    "triumphalanthemplate": "Titan",
    "triumphalanthemmark": "Titan",
    "triumphalanthemhelm": "Titan",
    "triumphalanthemgreaves": "Titan",
    "triumphalanthemgloves": "Warlock",
    "triumphalanthemrobes": "Warlock",
    "triumphalanthembond": "Warlock",
    "triumphalanthemcover": "Warlock",
    "triumphalanthemboots": "Warlock",
    "seventhseraphgrips": "Hunter",
    "seventhseraphvest": "Hunter",
    "seventhseraphcloak": "Hunter",
    "seventhseraphcowl": "Hunter",
    "seventhseraphstrides": "Hunter",
    "seventhseraphgloves": "Warlock",
    "seventhseraphrobes": "Warlock",
    "seventhseraphbond": "Warlock",
    "seventhseraphhood": "Warlock",
    "seventhseraphboots": "Warlock",
    "seventhseraphgauntlets": "Titan",
    "seventhseraphplate": "Titan",
    "seventhseraphmark": "Titan",
    "seventhseraphhelmet": "Titan",
    "seventhseraphgreaves": "Titan",
    "techsecgrasps": "Hunter",
    "techseccloak": "Hunter",
    "techsecvest": "Hunter",
    "techsecmask": "Hunter",
    "techsecstrides": "Hunter",
    "techsecgauntlets": "Titan",
    "techsecmark": "Titan",
    "techsecplate": "Titan",
    "techsechelm": "Titan",
    "techsecboots": "Warlock",
    "techsecgloves": "Warlock",
    "techsecbond": "Warlock",
    "techsecvestment": "Warlock",
    "techsechood": "Warlock",
    "darkhollowgrasps": "Hunter",
    "darkhollowchiton": "Hunter",
    "darkhollowmask": "Hunter",
    "darkhollowtreads": "Hunter",
    "darkhollowmantle": "Hunter",
    "warnumensfist": "Titan",
    "warnumenschest": "Titan",
    "warnumenscrown": "Titan",
    "warnumensboots": "Titan",
    "warnumensmark": "Titan",
    "graspofeir": "Warlock",
    "chasmofyul": "Warlock",
    "mouthofur": "Warlock",
    "pathofxol": "Warlock",
    "bondofthewormlore": "Warlock",
    "ironpanoplygrasps": "Hunter",
    "ironpanoplyvest": "Hunter",
    "ironpanoplycloak": "Hunter",
    "ironpanoplymask": "Hunter",
    "ironpanoplystrides": "Hunter",
    "ironpanoplygauntlets": "Titan",
    "ironpanoplyplate": "Titan",
    "ironpanoplymark": "Titan",
    "ironpanoplyhelm": "Titan",
    "ironpanoplygreaves": "Titan",
    "ironpanoplygloves": "Warlock",
    "ironpanoplyvestment": "Warlock",
    "ironpanoplybond": "Warlock",
    "ironpanoplyhood": "Warlock",
    "ironpanoplyboots": "Warlock",
    "resonantfurygrips": "Hunter",
    "resonantfuryvest": "Hunter",
    "resonantfurycloak": "Hunter",
    "resonantfurymask": "Hunter",
    "resonantfurystrides": "Hunter",
    "resonantfurygauntlets": "Titan",
    "resonantfuryplate": "Titan",
    "resonantfurymark": "Titan",
    "resonantfuryhelm": "Titan",
    "resonantfurygreaves": "Titan",
    "resonantfurygloves": "Warlock",
    "resonantfuryrobes": "Warlock",
    "resonantfurybond": "Warlock",
    "resonantfurycowl": "Warlock",
    "resonantfuryboots": "Warlock",
    "reveriedawngrasps": "Hunter",
    "reveriedawnhauberk": "Hunter",
    "reveriedawncloak": "Hunter",
    "reveriedawncasque": "Hunter",
    "reveriedawnstrides": "Hunter",
    "reveriedawngauntlets": "Titan",
    "reveriedawnplate": "Titan",
    "reveriedawnmark": "Titan",
    "reveriedawnhelm": "Titan",
    "reveriedawngreaves": "Titan",
    "reveriedawngloves": "Warlock",
    "reveriedawntabard": "Warlock",
    "reveriedawnbond": "Warlock",
    "reveriedawnhood": "Warlock",
    "reveriedawnboots": "Warlock",
    "luminopotentgrips": "Hunter",
    "luminopotentcuirass": "Hunter",
    "luminopotentcloak": "Hunter",
    "luminopotentmask": "Hunter",
    "luminopotentstrides": "Hunter",
    "luminopotentgauntlets": "Titan",
    "luminopotentplate": "Titan",
    "luminopotentmark": "Titan",
    "luminopotenthelm": "Titan",
    "luminopotentgreaves": "Titan",
    "luminopotentgloves": "Warlock",
    "luminopotentrobes": "Warlock",
    "luminopotentbond": "Warlock",
    "luminopotentcover": "Warlock",
    "luminopotentboots": "Warlock",
    "gripsofexaltation": "Hunter",
    "vestoftranscendence": "Hunter",
    "cloakoftemptation": "Hunter",
    "cowlofrighteousness": "Hunter",
    "stridesofascendancy": "Hunter",
    "gauntletsofexaltation": "Titan",
    "plateoftranscendence": "Titan",
    "temptationsmark": "Titan",
    "helmofrighteousness": "Titan",
    "greavesofascendancy": "Titan",
    "glovesofexaltation": "Warlock",
    "robesoftranscendence": "Warlock",
    "temptationsbond": "Warlock",
    "maskofrighteousness": "Warlock",
    "bootsofascendancy": "Warlock",
    "gripsofthegreathunt": "Hunter",
    "vestofthegreathunt": "Hunter",
    "cloakofthegreathunt": "Hunter",
    "maskofthegreathunt": "Hunter",
    "stridesofthegreathunt": "Hunter",
    "gauntletsofthegreathunt": "Titan",
    "plateofthegreathunt": "Titan",
    "markofthegreathunt": "Titan",
    "helmofthegreathunt": "Titan",
    "greavesofthegreathunt": "Titan",
    "glovesofthegreathunt": "Warlock",
    "robesofthegreathunt": "Warlock",
    "bondofthegreathunt": "Warlock",
    "hoodofthegreathunt": "Warlock",
    "bootsofthegreathunt": "Warlock",
    "primezealotgloves": "Hunter",
    "primezealotcuirass": "Hunter",
    "shatteredvaultcloak": "Hunter",
    "primezealotmask": "Hunter",
    "primezealotstrides": "Hunter",
    "kabrsbrazengrips": "Titan",
    "kabrswrath": "Titan",
    "lightofthegreatprism": "Titan",
    "kabrsbattlecage": "Titan",
    "kabrsforcefulgreaves": "Titan",
    "glovesofthehezenlords": "Warlock",
    "cuirassofthehezenlords": "Warlock",
    "fragmentoftheprime": "Warlock",
    "facadeofthehezenlords": "Warlock",
    "treadofthehezenlords": "Warlock",
    "cruelelectrumgrips": "Hunter",
    "cruelelectrumvest": "Hunter",
    "cruelelectrumcloak": "Hunter",
    "cruelelectrummask": "Hunter",
    "cruelelectrumstrides": "Hunter",
    "cruelelectrumgauntlets": "Titan",
    "cruelelectrumplate": "Titan",
    "cruelelectrummark": "Titan",
    "cruelelectrumhelm": "Titan",
    "cruelelectrumgreaves": "Titan",
    "cruelelectrumgloves": "Warlock",
    "cruelelectrumrobes": "Warlock",
    "cruelelectrumbond": "Warlock",
    "cruelelectrumhood": "Warlock",
    "cruelelectrumboots": "Warlock",
    "legacysoathgrips": "Hunter",
    "legacysoathvest": "Hunter",
    "legacysoathcloak": "Hunter",
    "legacysoathmask": "Hunter",
    "legacysoathstrides": "Hunter",
    "legacysoathgauntlets": "Titan",
    "legacysoathplate": "Titan",
    "legacysoathmark": "Titan",
    "legacysoathhelm": "Titan",
    "legacysoathgreaves": "Titan",
    "legacysoathgloves": "Warlock",
    "legacysoathrobes": "Warlock",
    "legacysoathbond": "Warlock",
    "legacysoathcowl": "Warlock",
    "legacysoathboots": "Warlock",
    "aionadaptergrips": "Hunter",
    "aionadaptercloak": "Hunter",
    "aionadaptervest": "Hunter",
    "aionadaptermask": "Hunter",
    "aionadapterstrides": "Hunter",
    "aionadaptergauntlets": "Titan",
    "aionadaptermark": "Titan",
    "aionadapterplate": "Titan",
    "aionadapterhelm": "Titan",
    "aionadaptergreaves": "Titan",
    "aionadaptergloves": "Warlock",
    "aionadapterbond": "Warlock",
    "aionadapterrobes": "Warlock",
    "aionadapterhood": "Warlock",
    "aionadapterboots": "Warlock",
    "collectivepsychesleeves": "Hunter",
    "collectivepsychecloak": "Hunter",
    "collectivepsychecuirass": "Hunter",
    "collectivepsychecasque": "Hunter",
    "collectivepsychestrides": "Hunter",
    "collectivepsychegauntlets": "Titan",
    "collectivepsychemark": "Titan",
    "collectivepsycheplate": "Titan",
    "collectivepsychehelm": "Titan",
    "collectivepsychegreaves": "Titan",
    "collectivepsychegloves": "Warlock",
    "collectivepsychebond": "Warlock",
    "collectivepsycherobes": "Warlock",
    "collectivepsychecover": "Warlock",
    "collectivepsycheboots": "Warlock",
    "bushidogrips": "Hunter",
    "bushidocloak": "Hunter",
    "bushidovest": "Hunter",
    "bushidocowl": "Warlock",
    "bushidostrides": "Hunter",
    "bushidogauntlets": "Titan",
    "bushidomark": "Titan",
    "bushidoplate": "Titan",
    "bushidohelm": "Titan",
    "bushidogreaves": "Titan",
    "bushidogloves": "Warlock",
    "bushidobond": "Warlock",
    "bushidorobes": "Warlock",
    "bushidoboots": "Warlock",
    "aionrenewalgrips": "Hunter",
    "aionrenewalcloak": "Hunter",
    "aionrenewalvest": "Hunter",
    "aionrenewalmask": "Hunter",
    "aionrenewalstrides": "Hunter",
    "aionrenewalgauntlets": "Titan",
    "aionrenewalmark": "Titan",
    "aionrenewalplate": "Titan",
    "aionrenewalhelm": "Titan",
    "aionrenewalgreaves": "Titan",
    "aionrenewalgloves": "Warlock",
    "aionrenewalbond": "Warlock",
    "aionrenewalrobes": "Warlock",
    "aionrenewalhood": "Warlock",
    "aionrenewalboots": "Warlock",
    "techeunsregaliagrips": "Hunter",
    "techeunsregaliavest": "Hunter",
    "techeunsregaliamask": "Hunter",
    "techeunsregaliastrides": "Hunter",
    "techeunsregaliacloak": "Hunter",
    "techeunsregaliagauntlets": "Titan",
    "techeunsregaliaplate": "Titan",
    "techeunsregaliahelmet": "Titan",
    "techeunsregaliagreaves": "Titan",
    "techeunsregaliamark": "Titan",
    "techeunsregaliagloves": "Warlock",
    "techeunsregaliarobes": "Warlock",
    "techeunsregaliahood": "Warlock",
    "techeunsregaliaboots": "Warlock",
    "techeunsregaliabond": "Warlock",
    "apostatesbladegrips": "Hunter",
    "apostatesbladevest": "Hunter",
    "apostatesbladecloak": "Hunter",
    "apostatesblademask": "Hunter",
    "apostatesbladestrides": "Hunter",
    "apostatesbladegauntlets": "Titan",
    "apostatesbladeplate": "Titan",
    "apostatesblademark": "Titan",
    "apostatesbladehelm": "Titan",
    "apostatesbladegreaves": "Titan",
    "apostatesbladegloves": "Warlock",
    "apostatesbladerobe": "Warlock",
    "apostatesbladebond": "Warlock",
    "apostatesbladehood": "Warlock",
    "apostatesbladeboots": "Warlock",
    "flowinggripscoda": "Hunter",
    "flowingvestcoda": "Hunter",
    "cloakjudgmentcoda": "Hunter",
    "flowingcowlcoda": "Hunter",
    "flowingbootscoda": "Hunter",
    "crushingguardcoda": "Titan",
    "crushingplatecoda": "Titan",
    "markjudgmentcoda": "Titan",
    "crushinghelmcoda": "Titan",
    "crushinggreavescoda": "Titan",
    "channelingwrapscoda": "Warlock",
    "channelingrobescoda": "Warlock",
    "bondjudgmentcoda": "Warlock",
    "channelingcowlcoda": "Warlock",
    "channelingtreadscoda": "Warlock",
    "twistingechogrips": "Hunter",
    "twistingechovest": "Hunter",
    "twistingechocloak": "Hunter",
    "twistingechomask": "Hunter",
    "twistingechostrides": "Hunter",
    "descendingechogauntlets": "Titan",
    "descendingechocage": "Titan",
    "descendingechomark": "Titan",
    "descendingechohelm": "Titan",
    "descendingechogreaves": "Titan",
    "corruptingechogloves": "Warlock",
    "corruptingechorobes": "Warlock",
    "corruptingechobond": "Warlock",
    "corruptingechocover": "Warlock",
    "corruptingechoboots": "Warlock",
    "tmearpcustomgrips": "Hunter",
    "tmearpcustomvest": "Hunter",
    "tmearpcustomhood": "Hunter",
    "tmearpcustomchaps": "Hunter",
    "tmearpcustomcloakedstetson": "Hunter",
    "tmcogburncustomgauntlets": "Titan",
    "tmcogburncustomplate": "Titan",
    "tmcogburncustomcover": "Titan",
    "tmcogburncustomlegguards": "Titan",
    "tmcogburncustommark": "Titan",
    "tmmosscustomgloves": "Warlock",
    "tmmosscustomduster": "Warlock",
    "tmmosscustomhat": "Warlock",
    "tmmosscustompants": "Warlock",
    "tmmosscustombond": "Warlock",
    "deepexplorergrasps": "Hunter",
    "deepexplorervest": "Hunter",
    "deepexplorercloak": "Hunter",
    "deepexplorermask": "Hunter",
    "deepexplorerstrides": "Hunter",
    "deepexplorergauntlets": "Titan",
    "deepexplorerplate": "Titan",
    "deepexplorermark": "Titan",
    "deepexplorerhelmet": "Titan",
    "deepexplorergreaves": "Titan",
    "deepexplorergloves": "Warlock",
    "deepexplorervestments": "Warlock",
    "deepexplorerbond": "Warlock",
    "deepexplorerhood": "Warlock",
    "deepexplorerboots": "Warlock",
    "graspsofthetakenking": "Hunter",
    "vestofthetakenking": "Hunter",
    "maskofthetakenking": "Hunter",
    "stridesofthetakenking": "Hunter",
    "cloakofthetakenking": "Hunter",
    "gauntletsofthetakenking": "Titan",
    "plateofthetakenking": "Titan",
    "helmofthetakenking": "Titan",
    "greavesofthetakenking": "Titan",
    "markofthetakenking": "Titan",
    "glovesofthetakenking": "Warlock",
    "vestmentofthetakenking": "Warlock",
    "hoodofthetakenking": "Warlock",
    "bootsofthetakenking": "Warlock",
    "bondofthetakenking": "Warlock",
    "firstascentgrips": "Hunter",
    "firstascentvest": "Hunter",
    "firstascentcloak": "Hunter",
    "firstascentcasque": "Hunter",
    "firstascentstrides": "Hunter",
    "firstascentgauntlets": "Titan",
    "firstascentplate": "Titan",
    "firstascentmark": "Titan",
    "firstascenthelm": "Titan",
    "firstascentgreaves": "Titan",
    "firstascentgloves": "Warlock",
    "firstascentrobes": "Warlock",
    "firstascentbond": "Warlock",
    "firstascenthood": "Warlock",
    "firstascentboots": "Warlock",
    "darkagegrips": "Hunter",
    "darkageharness": "Hunter",
    "darkagecloak": "Hunter",
    "darkagemask": "Hunter",
    "darkagestrides": "Hunter",
    "darkagegauntlets": "Titan",
    "darkagechestrig": "Titan",
    "darkagemark": "Titan",
    "darkagehelm": "Titan",
    "darkagesabatons": "Titan",
    "darkagegloves": "Warlock",
    "darkageovercoat": "Warlock",
    "darkagebond": "Warlock",
    "darkagevisor": "Warlock",
    "darkagelegbraces": "Warlock",
    "ironbattaliongrips": "Hunter",
    "ironbattalionvest": "Hunter",
    "ironbattalioncloak": "Hunter",
    "ironbattalioncowl": "Hunter",
    "ironbattalionstrides": "Hunter",
    "ironbattaliongauntlets": "Titan",
    "ironbattalionplate": "Titan",
    "ironbattalionmark": "Titan",
    "ironbattalionhelm": "Titan",
    "ironbattaliongreaves": "Titan",
    "ironbattaliongloves": "Warlock",
    "ironbattalionrobes": "Warlock",
    "ironbattalionbond": "Warlock",
    "ironbattalioncover": "Warlock",
    "ironbattalionboots": "Warlock",
    "cyberserpentnullgrips": "Hunter",
    "cyberserpentnullvest": "Hunter",
    "cyberserpentnullcloak": "Hunter",
    "cyberserpentnullmask": "Hunter",
    "cyberserpentnullstrides": "Hunter",
    "cyberserpentnullgauntlets": "Titan",
    "cyberserpentnullplate": "Titan",
    "cyberserpentnullmark": "Titan",
    "cyberserpentnullhelm": "Titan",
    "cyberserpentnullgreaves": "Titan",
    "cyberserpentnullgloves": "Warlock",
    "cyberserpentnullrobes": "Warlock",
    "cyberserpentnullbond": "Warlock",
    "cyberserpentnullcover": "Warlock",
    "cyberserpentnullboots": "Warlock",
    "circuitgauntlets": "Warlock",
    "circuitchestplate": "Warlock",
    "racersscarf": "Hunter",
    "circuitdefender": "Hunter",
    "circuitstriders": "Warlock",
    "racersmark": "Titan",
    "circuitkeeper": "Titan",
    "racersbond": "Warlock",
    "circuitrunner": "Warlock",
    "newdemoticgrasps": "Hunter",
    "newdemoticvest": "Hunter",
    "newdemoticcloak": "Hunter",
    "newdemoticmask": "Hunter",
    "newdemoticstrides": "Hunter",
    "newdemoticgauntlets": "Titan",
    "newdemoticplate": "Titan",
    "newdemoticmark": "Titan",
    "newdemotichelm": "Titan",
    "newdemoticgreaves": "Titan",
    "newdemoticgloves": "Warlock",
    "newdemoticrobes": "Warlock",
    "newdemoticbond": "Warlock",
    "newdemoticcover": "Warlock",
    "newdemoticboots": "Warlock",
    "thrivingsurvivorgrips": "Hunter",
    "thrivingsurvivorvest": "Hunter",
    "thrivingsurvivorcloak": "Hunter",
    "thrivingsurvivorcowl": "Hunter",
    "thrivingsurvivorstrides": "Hunter",
    "thrivingsurvivorgauntlets": "Titan",
    "thrivingsurvivorplate": "Titan",
    "thrivingsurvivormark": "Titan",
    "thrivingsurvivorhelm": "Titan",
    "thrivingsurvivorgreaves": "Titan",
    "thrivingsurvivorgloves": "Warlock",
    "thrivingsurvivorrobe": "Warlock",
    "thrivingsurvivorbond": "Warlock",
    "thrivingsurvivorcover": "Warlock",
    "thrivingsurvivorboots": "Warlock",
    "dreambanegrips": "Hunter",
    "dreambanevest": "Hunter",
    "dreambanecloak": "Hunter",
    "dreambanecowl": "Hunter",
    "dreambanestrides": "Hunter",
    "dreambanegauntlets": "Titan",
    "dreambaneplate": "Titan",
    "dreambanemark": "Titan",
    "dreambanehelm": "Titan",
    "dreambanegreaves": "Titan",
    "dreambanegloves": "Warlock",
    "dreambanerobes": "Warlock",
    "dreambanebond": "Warlock",
    "dreambanehood": "Warlock",
    "dreambaneboots": "Warlock",
    "wildanthemgrips": "Hunter",
    "wildanthemvest": "Hunter",
    "wildanthemcloak": "Hunter",
    "wildanthemmask": "Hunter",
    "wildanthemstrides": "Hunter",
    "wildanthemgauntlets": "Titan",
    "wildanthemplate": "Titan",
    "wildanthemmark": "Titan",
    "wildanthemhelm": "Titan",
    "wildanthemgreaves": "Titan",
    "wildanthemgloves": "Warlock",
    "wildanthemrobes": "Warlock",
    "wildanthembond": "Warlock",
    "wildanthemcover": "Warlock",
    "wildanthemboots": "Warlock",
    "pantheosresplendentgrasps": "Hunter",
    "pantheosresplendentvest": "Hunter",
    "pantheosresplendentcloak": "Hunter",
    "pantheosresplendentmask": "Hunter",
    "pantheosresplendentstrides": "Hunter",
    "pantheosresplendentgauntlets": "Titan",
    "pantheosresplendentplate": "Titan",
    "pantheosresplendentmark": "Titan",
    "pantheosresplendenthelm": "Titan",
    "pantheosresplendentgreaves": "Titan",
    "pantheosresplendentgloves": "Warlock",
    "pantheosresplendentrobes": "Warlock",
    "pantheosresplendentbond": "Warlock",
    "pantheosresplendenthood": "Warlock",
    "pantheosresplendentboots": "Warlock",
    "swordmastersgrips": "Hunter",
    "swordmastersvest": "Hunter",
    "swordmasterscloak": "Hunter",
    "swordmastersmask": "Hunter",
    "swordmastersstrides": "Hunter",
    "swordmastersgauntlets": "Titan",
    "swordmastersplate": "Titan",
    "swordmastersmark": "Titan",
    "swordmastershelm": "Titan",
    "swordmastersgreaves": "Titan",
    "swordmastersgloves": "Warlock",
    "swordmastersrobes": "Warlock",
    "swordmastersbond": "Warlock",
    "swordmasterscover": "Warlock",
    "swordmastersboots": "Warlock",
    "eutechnologysleeves": "Hunter",
    "eutechnologyvest": "Hunter",
    "eutechnologycloak": "Hunter",
    "eutechnologycowl": "Hunter",
    "eutechnologystrides": "Hunter",
    "eutechnologygauntlets": "Titan",
    "eutechnologyplate": "Titan",
    "eutechnologymark": "Titan",
    "eutechnologyhelm": "Titan",
    "eutechnologygreaves": "Titan",
    "eutechnologygloves": "Warlock",
    "eutechnologyrobes": "Warlock",
    "eutechnologybond": "Warlock",
    "eutechnologycover": "Warlock",
    "eutechnologyboots": "Warlock",
    "veritasgrips": "Hunter",
    "veritasvest": "Hunter",
    "veritascloak": "Hunter",
    "veritascowl": "Hunter",
    "veritasstrides": "Hunter",
    "veritasgauntlets": "Titan",
    "veritasplate": "Titan",
    "veritasmark": "Titan",
    "veritashelm": "Titan",
    "veritasgreaves": "Titan",
    "veritasgloves": "Warlock",
    "veritasrobe": "Warlock",
    "veritasbond": "Warlock",
    "veritashood": "Warlock",
    "veritasboots": "Warlock",
    "wildwoodgauntlets": "Titan",
    "wildwoodplate": "Titan",
    "wildwoodmark": "Titan",
    "wildwoodhelm": "Titan",
    "wildwoodgreaves": "Titan",
    "wildwoodgloves": "Warlock",
    "wildwoodrobes": "Warlock",
    "wildwoodbond": "Warlock",
    "wildwoodcover": "Warlock",
    "wildwoodboots": "Warlock",
    "wildwoodgrips": "Hunter",
    "wildwoodvest": "Hunter",
    "wildwoodcloak": "Hunter",
    "wildwoodmask": "Hunter",
    "wildwoodstrides": "Hunter",
    "gripsoftrepidation": "Hunter",
    "vestoftrepidation": "Hunter",
    "maskoftrepidation": "Hunter",
    "bootsoftrepidation": "Hunter",
    "cloakoftrepidation": "Hunter",
    "gauntletsofagony": "Titan",
    "plateofagony": "Titan",
    "helmofagony": "Titan",
    "greavesofagony": "Titan",
    "markofagony": "Titan",
    "wrapsofdetestation": "Warlock",
    "robesofdetestation": "Warlock",
    "maskofdetestation": "Warlock",
    "bootsofdetestation": "Warlock",
    "bondofdetestation": "Warlock",
    "peraudaciagrips": "Hunter",
    "peraudaciacuirass": "Hunter",
    "peraudaciacloak": "Hunter",
    "peraudaciacasque": "Hunter",
    "peraudaciastrides": "Hunter",
    "peraudaciagauntlets": "Titan",
    "peraudaciaplate": "Titan",
    "peraudaciamark": "Titan",
    "peraudaciahelm": "Titan",
    "peraudaciagreaves": "Titan",
    "peraudaciagloves": "Warlock",
    "peraudaciarobes": "Warlock",
    "peraudaciabond": "Warlock",
    "peraudaciacover": "Warlock",
    "peraudaciaboots": "Warlock",
    "doggedgage": "Hunter",
    "relentlessharness": "Hunter",
    "shroudofflies": "Hunter",
    "unyieldingcasque": "Hunter",
    "tirelessstriders": "Hunter",
    "willbreakersfists": "Titan",
    "willbreakersresolve": "Titan",
    "markofthepit": "Titan",
    "willbreakerswatch": "Titan",
    "willbreakersgreaves": "Titan",
    "deathsingersgrip": "Warlock",
    "deathsingersmantle": "Warlock",
    "bonecirclet": "Warlock",
    "deathsingersgaze": "Warlock",
    "deathsingersherald": "Warlock",
    "promisedreigngrips": "Hunter",
    "promisedreignvest": "Hunter",
    "promisedreigncloak": "Hunter",
    "promisedreignmask": "Hunter",
    "promisedreignstrides": "Hunter",
    "promisedreuniongauntlets": "Titan",
    "promisedreunionplate": "Titan",
    "promisedreunionmark": "Titan",
    "promisedreunionhelm": "Titan",
    "promisedreuniongreaves": "Titan",
    "promisedvictorywraps": "Warlock",
    "promisedvictoryrobes": "Warlock",
    "promisedvictorybond": "Warlock",
    "promisedvictoryhood": "Warlock",
    "promisedvictoryboots": "Warlock",
    "smokejumpergrasps": "Hunter",
    "smokejumpercloak": "Hunter",
    "smokejumpervest": "Hunter",
    "smokejumpermask": "Hunter",
    "smokejumperstrides": "Hunter",
    "smokejumpergauntlets": "Titan",
    "smokejumpermark": "Titan",
    "smokejumperplate": "Titan",
    "smokejumperhelm": "Titan",
    "smokejumperboots": "Warlock",
    "smokejumpergloves": "Warlock",
    "smokejumperbond": "Warlock",
    "smokejumpervestment": "Warlock",
    "smokejumperhood": "Warlock",
    "shrewdsurvivorgrips": "Hunter",
    "shrewdsurvivorvest": "Hunter",
    "shrewdsurvivorcloak": "Hunter",
    "shrewdsurvivorcowl": "Hunter",
    "shrewdsurvivorstrides": "Hunter",
    "shrewdsurvivorgauntlets": "Titan",
    "shrewdsurvivorplate": "Titan",
    "shrewdsurvivormark": "Titan",
    "shrewdsurvivorhelm": "Titan",
    "shrewdsurvivorgreaves": "Titan",
    "shrewdsurvivorgloves": "Warlock",
    "shrewdsurvivorrobe": "Warlock",
    "shrewdsurvivorbond": "Warlock",
    "shrewdsurvivorcover": "Warlock",
    "shrewdsurvivorboots": "Warlock",
    "disastercorpsgrasps": "Hunter",
    "disastercorpscloak": "Hunter",
    "disastercorpsvest": "Hunter",
    "disastercorpsmask": "Hunter",
    "disastercorpsstrides": "Hunter",
    "disastercorpsgauntlets": "Titan",
    "disastercorpsmark": "Titan",
    "disastercorpsplate": "Titan",
    "disastercorpshelm": "Titan",
    "disastercorpsgreaves": "Titan",
    "disastercorpsgloves": "Warlock",
    "disastercorpsbond": "Warlock",
    "disastercorpsvestment": "Warlock",
    "disastercorpshood": "Warlock",
    "disastercorpsboots": "Warlock",
    "crystocrenegrips": "Hunter",
    "crystocrenevest": "Hunter",
    "crystocrenecloak": "Hunter",
    "crystocrenecowl": "Hunter",
    "crystocrenestrides": "Hunter",
    "crystocrenegauntlets": "Titan",
    "crystocreneplate": "Titan",
    "crystocrenemark": "Titan",
    "crystocrenehelm": "Titan",
    "crystocrenegreaves": "Titan",
    "crystocrenegloves": "Warlock",
    "crystocrenerobes": "Warlock",
    "crystocrenebond": "Warlock",
    "crystocrenehood": "Warlock",
    "crystocreneboots": "Warlock",
    "exodusdowngrips": "Hunter",
    "exodusdownvest": "Hunter",
    "exodusdowncloak": "Hunter",
    "exodusdownmask": "Hunter",
    "exodusdownstrides": "Hunter",
    "exodusdowngauntlets": "Titan",
    "exodusdownplate": "Titan",
    "exodusdownmark": "Titan",
    "exodusdownhelm": "Titan",
    "exodusdowngreaves": "Titan",
    "exodusdowngloves": "Warlock",
    "exodusdownrobes": "Warlock",
    "exodusdownbond": "Warlock",
    "exodusdownhood": "Warlock",
    "exodusdownboots": "Warlock",
    "lastdisciplinegrasps": "Hunter",
    "lastdisciplinecloak": "Hunter",
    "lastdisciplinevest": "Hunter",
    "lastdisciplinemask": "Hunter",
    "lastdisciplinestrides": "Hunter",
    "lastdisciplinegauntlets": "Titan",
    "lastdisciplinemark": "Titan",
    "lastdisciplineplate": "Titan",
    "lastdisciplinehelm": "Titan",
    "lastdisciplinegreaves": "Titan",
    "lastdisciplinegloves": "Warlock",
    "lastdisciplinebond": "Warlock",
    "lastdisciplinevestment": "Warlock",
    "lastdisciplinehood": "Warlock",
    "lastdisciplineboots": "Warlock",
    "twofoldcrowngrasps": "Hunter",
    "twofoldcrowncloak": "Hunter",
    "twofoldcrownvest": "Hunter",
    "twofoldcrownmask": "Hunter",
    "twofoldcrownstrides": "Hunter",
    "twofoldcrowngauntlets": "Titan",
    "twofoldcrownmark": "Titan",
    "twofoldcrownplate": "Titan",
    "twofoldcrownhelm": "Titan",
    "twofoldcrowngreaves": "Titan",
    "twofoldcrowngloves": "Warlock",
    "twofoldcrownbond": "Warlock",
    "twofoldcrownrobes": "Warlock",
    "twofoldcrowncowl": "Warlock",
    "twofoldcrownboots": "Warlock",
    "thunderheadgrips": "Hunter",
    "thunderheadvest": "Hunter",
    "thunderheadmask": "Hunter",
    "thunderheadstrides": "Hunter",
    "thunderheadcloak": "Hunter",
    "thunderheadgauntlets": "Titan",
    "thunderheadplate": "Titan",
    "thunderheadhelm": "Titan",
    "thunderheadgreaves": "Titan",
    "thunderheadmark": "Titan",
    "thunderheadgloves": "Warlock",
    "thunderheadrobes": "Warlock",
    "thunderheadcover": "Warlock",
    "thunderheadboots": "Warlock",
    "thunderheadbond": "Warlock",
    "spacewalkgrasps": "Hunter",
    "spacewalkvest": "Hunter",
    "spacewalkcloak": "Hunter",
    "spacewalkcowl": "Hunter",
    "spacewalkstrides": "Hunter",
    "spacewalkgauntlets": "Titan",
    "spacewalkplate": "Titan",
    "spacewalkmark": "Titan",
    "spacewalkhelm": "Titan",
    "spacewalkgreaves": "Titan",
    "spacewalkgloves": "Warlock",
    "spacewalkrobes": "Warlock",
    "spacewalkbond": "Warlock",
    "spacewalkcover": "Warlock",
    "spacewalkboots": "Warlock",
    "graspsoftheflain": "Hunter",
    "scalesoftheflain": "Hunter",
    "huskscloak": "Hunter",
    "maskoftheflain": "Hunter",
    "hooksoftheflain": "Hunter",
    "gripsoftheflain": "Titan",
    "carapaceoftheflain": "Titan",
    "attendantsmark": "Titan",
    "skulloftheflain": "Titan",
    "clawsoftheflain": "Titan",
    "reachoftheflain": "Warlock",
    "adornmentoftheflain": "Warlock",
    "weaversbond": "Warlock",
    "visageoftheflain": "Warlock",
    "talonsoftheflain": "Warlock",
    "ferropotentgrips": "Hunter",
    "ferropotentcuirass": "Hunter",
    "ferropotentcloak": "Hunter",
    "ferropotentmask": "Hunter",
    "ferropotentstrides": "Hunter",
    "ferropotentgauntlets": "Titan",
    "ferropotentplate": "Titan",
    "ferropotentmark": "Titan",
    "ferropotenthead": "Titan",
    "ferropotentgreaves": "Titan",
    "ferropotentgloves": "Warlock",
    "ferropotentrobes": "Warlock",
    "ferropotentbond": "Warlock",
    "ferropotentcover": "Warlock",
    "ferropotentboots": "Warlock",
    "lustrousgrips": "Hunter",
    "lustrousvest": "Hunter",
    "lustrouscloak": "Hunter",
    "lustrouscasque": "Hunter",
    "lustrousstrides": "Hunter",
    "lustrousgauntlets": "Titan",
    "lustrousplate": "Titan",
    "lustrousmark": "Titan",
    "lustroushelm": "Titan",
    "lustrousgreaves": "Titan",
    "lustroussleeves": "Warlock",
    "lustrousrobes": "Warlock",
    "lustrousbond": "Warlock",
    "lustrouscover": "Warlock",
    "lustrousboots": "Warlock",
    "sageprotectorgrips": "Hunter",
    "sageprotectorvest": "Hunter",
    "sageprotectorcloak": "Hunter",
    "sageprotectorcowl": "Hunter",
    "sageprotectorstrides": "Hunter",
    "sageprotectorgauntlets": "Titan",
    "sageprotectorplate": "Titan",
    "sageprotectormark": "Titan",
    "sageprotectorhelm": "Titan",
    "sageprotectorgreaves": "Titan",
    "sageprotectorgloves": "Warlock",
    "sageprotectorrobes": "Warlock",
    "sageprotectorbond": "Warlock",
    "sageprotectorcover": "Warlock",
    "sageprotectorboots": "Warlock"
  },
  "classNames": [
    "Titan",
    "Hunter",
    "Warlock"
  ]
};
