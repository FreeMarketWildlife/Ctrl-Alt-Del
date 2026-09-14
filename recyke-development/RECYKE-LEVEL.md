# Recyke / First Shift

A playable starter route through the lower city's sorting yard to the Line 7 depot.
Play the [native mini route](recyke.html), as Jessie or Jane.
The large route is retired in the workspace archive. The level is linked from Episodes, Concept Art and the character/enemy workshops.

## Play

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | A/D or left/right arrows | Left/right buttons |
| Jump | W or up arrow | Jump |
| Crouch / crouch walk | Hold S or down arrow; combine with movement | Hold Duck + left/right |
| Crouch fire / crouch walk fire | Hold Down + Fire, with optional movement | Hold Duck + Fire, with optional left/right |
| Fire | Hold Space or K | Hold Fire |
| Melee | E | Melee |
| Swap hero | Q | Swap |
| Pause/resume | P or Escape | Pause / Resume |
| Retry after defeat / replay after victory | R | Dialog button |

Optional Auto fire is available in the toolbar. Swapping hero preserves your
position and health. Selecting Restart begins a fresh route.
Losing focus pauses play and clears held input. Simultaneous touch movement and
firing are supported; jump and melee activate on each press.

## Native mini world

| Property | Mini |
| --- | --- |
| Native scene | 480 × 270 |
| Hero / ground enemy cell | 48 × 48 |
| Standing art height | 32px |
| Crouching art height | 18px |
| Feet anchor in cell | (20,40) |
| Standing / crouching collider | 10×30 / 10×16 |
| Route width | 2,112 world pixels |
| Ground level | 222px |
| Clear entrance height | 40px |

Every source pixel is one world unit. Hold Down on the ground to crouch, including
while moving or firing. A blocked ceiling keeps the low stance after release until
standing is safe. Down takes priority over grounded jump and melee. Crouch walking
moves at 25px/s; original running remains 90px/s. See [the full crouch contract](../mini-review/CROUCHING.md).

The complete scene is presented
through `CADPixelGrid.applyScene` at whole device pixels per native pixel. Narrow
screens that cannot fit the native scene provide horizontal panning inside the
playfield. Individual models are never resized to fit the viewport.

Original scenery includes an elevated public train, worn tenements and workshops,
sorting presses, refuse bins, boilers, steam, conveyor surfaces and the depot gate.
Muted violet architecture and dark machinery sit behind brighter collision edges,
teal lamps and the active cast. All world geometry and lettering use opaque raster
pixels. Whole-scene zoom preserves the same pixel size for actors, props and effects.

## Route and encounters

1. **Sorting Row:** a safe receiving yard introduces movement before the first
   Sentinel and Watcher. Enemies remain inactive while the player stays in the
   entrance area.
2. **Conveyor Crossing:** short crates lead onto an optional catwalk. The ground
   path stays continuous; missing a jump does not cause a pit death.
3. **Scrap Route:** another elevated salvage path crosses Scrapper and Manta territory.
   Health kits and collectible scrap reward exploration.
4. **Repair Station:** reaching the checkpoint restores all six health points and
   secures a retry position. Defeated enemies and collected supplies remain resolved
   when retrying there.
5. **Rail Approach:** Collector and patrol encounters lead to the Bastion guarding
   Line 7. Disabling the gate unit opens the exit; entering it completes the shift.

The route contains eight enemies drawn from all six approved archetypes. Machines
telegraph attacks before firing, and solid cover blocks projectiles. A modest aim
assist helps the horizontal blaster reach aerial hulls. Melee works in either facing
direction. Health kits restore three points, capped at six; jump buffering and
coyote time help late inputs connect. Conveyor animation indicates the recycling
line; its surface does not force the player sideways.

Jessie and Jane use their approved movement, jumping, combat and hit poses. Running
fire preserves the lower-body cycle and Jane's hair wave. Enemy animation adapters
read canonical timing and hold each final wreck pose after destruction. The level
does not alter the character/enemy masters or their native sheets.

## Files and verification

- `recyke-level.js`: pure simulation, separately placed maps, movement, cover,
  enemies, pickups, checkpoint and exit.
- `recyke-art.js`: original environment and adapters for approved model renderers.
- `recyke.js`, `recyke.html`, `recyke.css`: presentation, input, HUD and dialogs.
- `tests/recyke-level.cjs`: simulation checks including both heroes completing both
  routes with ordinary movement, jumps and attacks.
- `tests/recyke-art.cjs`: sixteen scene probes, native geometry, opaque palette and
  unchanged hashes for 32 approved source/motion/export files.
- `tests/recyke-browser.cjs`: actual keyboard playthroughs, defeat/retry, controls,
  simultaneous touch input and twelve size/device presentation combinations.
- `tests/render-recyke-review.cjs`: comparison image and short animation from the
  production renderer and normal gameplay inputs.

Run `node tests/recyke-level.cjs` without dependencies. The art/review tools use
`@napi-rs/canvas` and `sharp`; the browser suite uses Playwright and Chrome. Set
`NODE_PATH`, `CHROME_PATH`, `BASE_URL` and `REVIEW_DIR` as needed. Start a local server
at the repository root and point `BASE_URL` to it for browser checks.

The [comparison image](docs/review/recyke-big-small.png) displays both routes at the
same pixel zoom. The [motion preview](docs/review/recyke-playthrough.gif) shows
movement, shooting, jumping and Jane's hair in both versions. These support visual
review; simulation checks alone do not assess art quality.

## Reference applied

[SLYNYRD / Side View Run 'N Gun](https://www.slynyrd.com/blog/2026/1/26/side-view-run-n-gun)
informed responsive jumping, separation of locomotion from shooting, and clear
foreground/background layering. Our route geometry, scenery and encounter sequence
are original. The project's [fixed art standard](ART-STANDARDS.md) determines the
exact pixel sizes; no external sprites are included.
