# Enemies / fixed pixel standard

Six original enemy masters join Jessie and Jane in the [enemy workshop](enemies.html)
and [Concept Art](codex.html#sentinel-big). Each has a separately authored big and
mini model. Existing gameplay still uses its legacy art and collision geometry;
these masters, their animation metadata and native sheets are ready for integration.

| Family | Native cell | Ground standing height | Drone neutral span | Anchor |
| --- | --- | --- | --- | --- |
| Big | 128 × 128 | 96px | 96px | (64,112) |
| Mini | 48 × 48 | 32px | 32px | (20,40) |

One source pixel equals one world unit. All models, architecture, effects and weapons
share that grid. `CADPixelGrid.applyScene` presents the complete scene at an integer
number of device pixels per source pixel. Big and mini art never scale independently.
The small drawings have their own body panels, limbs, weapons, rotor assemblies and
claws; they are not reductions of the big sheets.

Drones are measured across their rotors or wings in idle frame 0. Their compact hulls
and hovering poses do not artificially fill the humanoid standing height. Their
drawing origin is the same ground anchor, with the hover offset included in the
master. The 112px clear doorway and 32px crate in the workshop provide world scale.

## Roster and visual language

| Enemy | Role | Distinguishing silhouette |
| --- | --- | --- |
| Sentinel | NEXUS patrol robot | Narrow chest, recessed waist, single optic and forward cannon |
| Bastion | Armored enforcer | Broad plated shoulders, riot shield and shoulder rack |
| Scrapper | Industrial hunter | Rusted armor, exposed pistons and powered salvage claw |
| Watcher | Surveillance drone | Open twin-rotor truss, rounded sensor housing, suspended cannon |
| Manta | Aerial interceptor | Swept armored wing, dorsal spine, recessed induction vents |
| Collector | Recovery drone | Copper hull, hazard panel and two articulated retrieval claws |

Every model uses sixteen opaque colors plus transparency. The first five colors are
the same ink and cool neutral ramp used by the heroes. Broad material clusters, dark
seams, selective upper-left highlights and a small sensor accent connect the faction
to the established world. Color complements the silhouette; the models remain
distinguishable in the workshop's silhouette view. All catalog thumbnails are separate
32 × 32 native drawings.

## Animation coverage

Each ground enemy has ten actions: idle, walk, run, charge, fire, run + fire, melee,
jump, hurt and death. Walk, run and running fire use twelve poses. Each drone has
seven actions: idle, patrol, rush, charge, fire, hurt and death. Patrol and rush use
twelve poses. Both sizes and both facing directions support every action.

Ground locomotion uses fixed-length joint chains and explicit foot targets, retaining
the established hero proportions. Armor follows those joints. Charge poses prepare
the weapon; firing has a short release and longer recovery. The shield bash and
salvage claw have their own attack silhouettes. Running fire preserves the lower
body cycle. Jump poses are exported in place; the workshop adds an integer-position
sample arc above the floor, while a game supplies its own trajectory.

Rotor blades change silhouette, Manta's induction vents pulse and Collector's claw
links lag behind its hull. A growing charge at drone emitters gives a visible warning
before the short muzzle flash and recoil. Destruction includes impact, loss of power,
descent or collapse, and a persistent wreck. Disabled sensors and propulsion stay
off in the final pose.

The workshop repeats every clip for inspection. Metadata marks continuous movement
as looping and attacks, reactions and destruction as one-shots. A game should hold
the final death frame instead of restarting it. Frame counts and timings are data;
never assume a fixed eight-frame sequence.

## Source and exports

- `enemy-mech-motion.js` owns ground joint targets and action phases.
- `enemy-mechs.js` owns the three ground silhouettes at both native sizes.
- `enemy-drones.js` owns separately authored aerial geometry and flight poses.
- `enemies.js` supplies the roster, viewer adapters and canonical exports.
- `assets/enemies/<id>/<id>-big.png`, `<id>-mini.png` and `<id>-animation.json`
  contain each enemy's native sheets and metadata in its own directory.

Sheets reserve twelve columns. Ground sheets are 1536 × 1280 and 576 × 480;
drone sheets are 1536 × 896 and 576 × 336. Short rows repeat their final authored
pose as padding. Read `frameCounts`, `timingMs` and `loops` to play the intended clip.
`CADEnemies.metadata(id)` is the single source for exported dimensions, palette,
row names, timings, loop behavior and motion data. Explicit frame rendering is
deterministic and matches the workshop's frame stepping.

## Review and verification

The workshop compares either hero with any enemy on one grid, with light/dark
backgrounds, silhouettes, complete pose strips, slow playback and native downloads.
[The roster image](docs/review/enemy-roster.png) and
[animation preview](docs/review/enemy-animation.gif) show the models together.

- `node tests/enemy-mech-motion.cjs` checks mechanical limb lengths, grounded
  contacts, action timing and motion continuity.
- `node tests/enemies.cjs` checks every native pose and direction, palette opacity,
  cell bounds, connected main bodies, dimensions, deterministic sheets, canonical
  metadata, workshop/catalog controls, device-pixel presentation and hero regression.
- `node tests/render-enemy-review.cjs` regenerates original code-rendered review media.

The browser test accepts `BASE_URL`, `NODE_PATH`, `CHROME_PATH` and `REVIEW_DIR`.
Set `UPDATE_ASSETS=1` to write validated native sheets and JSON. Tests support visual
review of silhouettes and complete sequences; they cannot measure artistic quality.

## Research applied

- [SLYNYRD / Shmup Design Part 1](https://www.slynyrd.com/blog/2020/12/14/pixelblog-31-shmup-sprite-design): common faction materials with distinct enemy geometry; readable attack colors and active flight details. Applied to three original drone structures and separate attack cues.
- [SLYNYRD / Horizontal Shmup](https://www.slynyrd.com/blog/2026/7/26/pixelblog-63-horizontal-shmup): start from the player's established asset scale, build clear primary shapes, then add material clusters and behavior-specific movement. Applied here without changing the agreed sizes.
- [SLYNYRD / Tiny Sci-Fi Pixels](https://www.slynyrd.com/blog/2025/11/28/pixelblog-59-tiny-sci-fi-pixels): mechanically weighted locomotion, compact machinery and independent weapon recoil. See the [ground research notes](docs/references/enemy-mech-research.md).
- [Saint11 / Consistency](https://saint11.art/blog/consistency/): preserve a coherent resolution and visual language across the world. The mandatory [project rules](AGENTS.md) fix the exact sizes and presentation used here.

These references inform construction and animation technique. No external sprites
were copied into the enemy masters or exports.
