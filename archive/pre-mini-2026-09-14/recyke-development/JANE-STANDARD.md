# Jane / fixed pixel standard

Jane's new character masters are `jane.js` (native artwork) and `jane-motion.js`
(pose targets and ponytail follow-through). Open [the workshop](jane.html) or the
Jane / Big and Jane / Mini entries in [Concept Art](codex.html#jane-big).

| Family | Native cell | Standing height | Feet anchor | Sheet |
| --- | --- | --- | --- | --- |
| Big | 128 × 128 | 96px | (64,112) | 1536 × 1792 |
| Mini | 48 × 48 | 32px | (20,40) | 576 × 672 |

One source pixel equals one world unit, for Jane, Jessie, weapons and scenery.
The complete scene is presented through `CADPixelGrid.applyScene` in whole device
pixels. No individual sprite enlargement, smoothing, fractional body-part rotation,
or reduction of the big artwork produces the mini. Both are authored separately.
Jane and Jessie match standing height within each family. The workshop's 112px
clear doorway and 32px crate demonstrate relative scale for the big family.

## Character design

Jane retains her magenta field jacket, dark violet ponytail, warm skin, navy combat
trousers, armored knees, fingerless gloves and practical boots. Her jacket has a
sloping shoulder, shaped ribcage, fitted waist, short hem, high collar, and an offset
zip. Her face and clothed arms have their own contours; she is not a palette swap
of Jessie. The mini has a separately composed face, body, sleeve and weapon design.

Sixteen opaque colors plus transparency describe the character. Five neutral colors
and the equipment highlight match Jessie's palette; the remaining colors provide
Jane's skin, violet hair and magenta fabric ramps. Light/shadow clusters stay broad
and readable. Native pixels remain opaque; scene typography is ordinary review UI.

## Animation coverage

| State | Frames | Timing |
| --- | --- | --- |
| Ready / idle | 8 | 160ms each |
| Stand | 8 | 160ms each |
| Walk | 12 | 80ms each |
| Run | 12 | 50ms each |
| Fire | 3 | 60 / 75 / 130ms |
| Run + fire | 12 | 50ms each |
| Jump | 6 | 70 / 100 / 160 / 110 / 75 / 90ms |
| Jump + fire | 6 | Same as jump |
| Crouch | 4 | 90 / 140 / 140 / 90ms |
| Jab | 6 | 90 / 40 / 75 / 65 / 80 / 160ms |
| Cross | 6 | 100 / 40 / 65 / 80 / 90 / 160ms |
| Front kick | 8 | 70 / 80 / 40 / 65 / 55 / 70 / 80 / 130ms |
| Round kick | 8 | 80 / 90 / 40 / 65 / 60 / 75 / 80 / 140ms |
| Hit reaction | 3 | 70 / 100 / 110ms |

All 102 authored poses have left/right presentation. Run without shooting uses a
bent arm pump; run + fire braces the carbine. Firing changes neither the leg cycle
nor the ponytail. Kicks keep the far foot planted and use different chamber,
extension and recovery paths. Legs retain 23px thigh/shin lengths in big and 7px
in mini before final grid rounding. The head, neck, collar and hair root share the
body displacement so crouching cannot separate them.

The preview loops all clips for inspection. Exported `loops` metadata distinguishes
continuous locomotion/idle clips from one-shot gameplay actions. The workshop adds
a sample jump arc above the anchored poses; the game supplies actual world motion.
Jane is playable at both native sizes in [Recyke / First Shift](recyke.html?hero=jane),
including running fire and her continuous ponytail motion. The original Skyview
campaign retains its legacy character renderer and collision dimensions.
The separate Jane / Courier entry remains a labeled legacy outfit study.

## Ponytail motion

The tied root follows Jane's head. Four fixed-length links propagate movement with
increasing phase delay, so the tip follows the middle of the hair. Big uses a 30px
chain; mini uses an independently authored 10px chain. At rest it hangs in a curved
lock; running pulls it backward with a traveling wave. Jump rise, fall, landing,
and attack recovery use different drag poses. A connected tapered ribbon and a few
coherent highlight clusters make the hair read as volume rather than noisy strands.

Hair animation is deterministic by frame: preview, frame stepping and exported
sheets agree exactly. Its complete point positions, link lengths, root and widths
are saved for every authored pose in the animation JSON.

## Exports and verification

`CADJane.metadata()` is the canonical JSON export schema. Native sheets and metadata
live in `assets/jane/`. Every row reserves 12 cells, padding shorter clips by repeating
the final pose. Use `frameCounts` and `timingMs` to play only authored frames.

- `node tests/jane-motion.cjs`: leg lengths, planted feet, loop continuity, hair
  attachment, chain lengths and wave variation.
- `node tests/jane.cjs`: every frame/direction, dimensions, opaque palette, connected
  silhouette, exact exports, firing independence, workshop/codex controls, mobile
  and desktop pixel grids, and unchanged approved Jessie artwork.
- `node tests/pixel-grid.cjs`: shared rendering grid invariants.

Serve locally; set `BASE_URL`, `CHROME_PATH` and `NODE_PATH` as needed for the browser
suite. `UPDATE_ASSETS=1` regenerates validated sheets and canonical JSON. These checks
support visual inspection of full sequences at native size, both directions, on
light/dark backgrounds and as silhouettes; they do not grade artistic quality.

## Research applied

- [SLYNYRD / Human Walk Cycle](https://www.slynyrd.com/blog/2024/5/24/pixelblog-50-human-walk-cycle): grounded contacts, shared anatomical landmarks, restrained body bob, and consistent clothing through movement.
- [SLYNYRD / Side View Run 'N Gun](https://www.slynyrd.com/blog/2026/1/26/side-view-run-n-gun): build a readable movement base and combine it with shooting without restarting locomotion.
- [SLYNYRD / Hair Forms](https://www.slynyrd.com/blog/2020/7/28/pixelblog-29-anime-faces-and-hair): organize hair into recognizable volume and deliberate pixel clusters. Jane's tied ponytail is an original design.
- [SLYNYRD / Punches and Kicks](https://www.slynyrd.com/blog/2024/11/25/pixelblog-53-punches-and-kicks): anticipation, fast extension, readable strike and recovery.
- [SLYNYRD / Top Down Character Animation 3](https://www.slynyrd.com/blog/2025/10/2/pixelblog-58-top-down-character-animation-part-3): finish the main anatomy before layering moving hair and equipment; simplify detail that flickers in playback. Applied here to side-view animation.
- [Animation Mentor / Follow-through and Overlapping Action](https://www.animationmentor.com/blog/follow-through-and-overlapping-action-the-12-basic-principles-of-animation/): root motion drives the hair; successive sections lag and settle with appropriate weight.
- [Animation Mentor / Animating Overlap](https://www.animationmentor.com/blog/tutorial-animate-overlap-and-follow-through/): establish primary motion, add progressive delay, then inspect silhouette and negative space.
- [Derek Yu / Pixel Art Basics](https://derekyu.com/makegames/pixelart.html): economical clusters, deliberate outline steps and selective internal shading.
- [Saint11 / Consistency](https://saint11.art/blog/consistency/): one scene grid and uniform scene presentation.

See [motion research notes](docs/references/jane-motion-research.md) for additional
pose and follow-through decisions. References inform technique; no external sprite
assets were copied into Jane's sheets.
