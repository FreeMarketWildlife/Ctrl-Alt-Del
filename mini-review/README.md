# Mini-only animation release — Proposal A

**Update:** Both heroes now support held ground crouching, crouch walking, firing
and crouch walking + firing. [Crouch controls, collision contract and checks](CROUCHING.md).
The notes below describe the appearance migration; all original actions remain.

[Open the shared workshop](index.html), [view the animated comparison](assets/motion.gif),
or [play the active mini Recyke route](../recyke-development/recyke.html?size=mini).

Minis are now the workspace default. Jane and Jessie use the approved Proposal A
appearance across all original animations. The large family is retired from active
character/enemy renderers, sheets, catalogue entries, workshops and Recyke selection.

## What changed

Jane retains all **14 actions / 102 poses**: idle, stand, walk, run, fire, run-fire,
jump, jump-fire, crouch, jab, cross, front-kick, round-kick and hurt. Her dark red
side ponytail, blue eye, purple/lime jacket, choker and torn denim use separately
edited native mini clusters. The tear follows the leg rather than floating over it.

Jessie retains all **10 actions / 72 poses**: idle, walk, run, fire, run-fire, jump,
jump-fire, crouch, jab and hurt. His messy brown hair, brown eye, red leather jacket,
blue jeans, rolled cuffs and forearm tattoo carry through every pose. Walking and
jab arms received dedicated sleeve/cuff/tattoo edits instead of retaining bare arms.
Jessie's muzzle flash now follows the selected animation frame, so frame stepping,
playback and sheet export agree; action durations and combat cadence are unchanged.

All active copies of each hero master agree. The earlier Jessie-only refinement
folder continues to contain Jessie only; its workshop links to the shared mini review.
All six enemy archetypes retain their existing mini pixels exactly.

## Native contracts preserved

| Contract | Active mini value |
| --- | --- |
| Cell | 48 × 48 source pixels |
| Standing height | 32px (drone neutral span 32px) |
| Feet anchor | (20,40) |
| World scale | One source pixel per world unit |
| Palette | 16 opaque colors per hero plus transparency |
| Sheet width | 12 cells / 576px |
| Jane sheet, including crouch modes | 576 × 864 |
| Jessie sheet, including crouch modes | 576 × 672 |
| Idle/stand | 8 × 160ms |
| Walk | 12 × 80ms |
| Run/run-fire | 12 × 50ms |
| Fire | 60 / 75 / 130ms |
| Jump/jump-fire | 70 / 100 / 160 / 110 / 75 / 90ms |

All remaining action holds and counts match the originals. Short export rows still
repeat the last authored pose to fill 12 columns. Canonical metadata records the
real frame counts, timings, loop flags and contacts; Jane retains all hair points.

Every original mini motion sample is numerically identical to the pre-migration version:
leg lengths, feet, body offsets, ponytail roots, links and delayed hair waves.
Existing `CADJane`, `CADJessie` and `CADEnemies` mini draw/sheet contracts and asset
paths remain available. Large draw requests are rejected rather than silently scaled.

Recyke defaults to the existing 480 × 270 mini route, including old `size=big`
bookmarks. Its mini map, standing collision dimensions, running speed, gravity, standing muzzle
coordinates, projectile cadence, swaps and checkpoints are unchanged. The new
crouch modes add a low collider, slow walking and lowered muzzle.
The large route is preserved only in the complete archived build.

## Archive and defaults

[archive/pre-mini-2026-09-14](../archive/pre-mini-2026-09-14/README.md) contains complete
pre-migration copies of all four development folders and the appearance review.
This includes all large hero, mech and drone masters, motion data, PNG sheets,
metadata, larger Recyke route, old standards and working previous apps. No assets
were lost: large sheets and rejected anatomy renderers were removed from active
folders only after making that snapshot. The original-backup folders are unchanged
and protected by hashes in `original-backups.json`.

Root and development-folder AGENTS.md and character/art standards now specify
mini-only work and the approved appearance. Root development entry pages launch mini
Recyke. Character/enemy workshop links open this shared mini workshop. Older character catalogues redirect to the current catalogue; active catalogues
list only current mini heroes/enemies and old large bookmarks resolve to minis.
The old `/appearance-review/` URL redirects here; the original idle comparison is
preserved inside the archive. Standalone legacy flight/world studies have no
big/mini model variants and remain historical studies; they are not new mini masters.

## Complete visual inspection

Inspected every authored hero frame in both facings, with dark and light backgrounds,
and inspected silhouette views. Full right-facing sheets, left-facing sheets and
individual action strips are in `assets/`. The shared scene and GIF show both heroes
walking, running, firing and jumping simultaneously; scene zoom applies to everything.
Frame strips include real per-frame holds. The solo viewer supports each action and
individual pose stepping, plus normal, half and quarter-speed playback.

Findings:

- No new cell clipping, disconnected head/body silhouettes or lost floor contacts.
- Clothing stays red/purple as appropriate through the full action sets. Cuffs,
  gloves and denim clusters remain attached to their respective limbs.
- Jane's ponytail root stays on her head; fixed-length links and delayed waves are
  preserved in every action. Running while firing does not reset legs or hair.
- Boots retain the established floor contacts. Kick support feet remain planted.
- **Remaining inherited visual issue:** Recyke's full speed is 90px/s. Across run
  frames 0→2 (100ms), the body advances 9px while the contact ankle moves back 5px,
  producing approximately **4px of forward drift per support phase**; the far leg
  repeats this at frames 6→8. Discrete pose holds also make this visible as small
  steps. Fixing this requires a separate gait/velocity matching decision. This
  appearance migration preserves the requested timing and gameplay movement.
- The workshop's optional travel follows contact-aligned root steps, rather than
  pretending to be the gameplay physics. It labels this distinction and uses a
  simple review arc for jumps. Turning travel off shows anchored pose playback.
- At 32px height, iris, choker and tattoo details are one-pixel cues. The tattoo
  cannot resolve its big-model chevron motif; it remains a dark mark on the forearm.
  Fine denim tears can be occluded by crossed legs during attacks. Jane's inherited
  idle/stand mini frames are visually identical; their eight timing holds remain.
- Jessie still holds his weapon during ordinary run and jump, matching the original
  animation foundation. Jane's ordinary run has an arm pump. Their different poses
  are intentional retained behavior, not a missing action.

## Checks completed

- `check-characters.cjs`: **472 hero frame/direction rasters**, all 174 motion
  samples compared with the originals, exact action/timing/anchor contracts,
  opaque 16-color bounds, connected principal silhouettes, floor contacts,
  independent run/jump-fire legs, and cell-for-cell export equality.
- **816 enemy frame/direction rasters** are byte-identical to the archived minis.
  All original-backup file hashes match.
- Existing mini Jane and Jessie motion tests pass: fixed bones, contacts, loop
  continuity, boot clearance, kick contacts, firing independence and hair links.
  Maximum bone rounding error 0.616px; Jane hair-link rounding error at most 1px.
- Enemy mech motion tests pass for 80 mini poses; enemy artwork remains unchanged.
- Existing Recyke simulation suite passes **13 scenarios**, including normal-input
  completion for both heroes: 22.49s, all 8 enemies defeated, 6/6 health.
- Existing Recyke native-art suite passes **8 scene probes** with no sprite resizing,
  partial-alpha pixels, untracked palette colors or fractional sprite origins.
- `check-browser.cjs`: 32 full hero action strips, per-pose controls, all six enemies,
  facings/backgrounds/silhouettes, all four catalogues, mini game default, desktop
  and phone grids; no JavaScript errors.
- Existing Recyke browser suite passes both heroes' keyboard controls, pause/resume,
  reset/blur behavior, defeat/retry, normal-input completion, multitouch cancellation,
  navigation links and six desktop/mobile/DPR viewport combinations. Browser
  completion with Jessie: 22.76s, all 8 enemies, 6/6 health.

Older dual-family tests and their original expectations are preserved in the archive.
Active character test entry points now call the shared mini raster suite; review
entry points call the new workshop browser suite. The retained motion/gameplay suites
run only the supported mini family. Baseline hashes were explicitly refreshed to
protect the newly approved mini masters; prior baseline manifests remain archived.

## Reproduce

Serve the workspace root on port 8042. Node requires the installed `@napi-rs/canvas`
and `playwright` packages (configure NODE_PATH if needed). CHROME_PATH can select a
browser. Run `node mini-review/check-characters.cjs`, `node mini-review/check-browser.cjs`,
and the motion, Recyke level/art/browser and pixel-grid tests under recyke-development/tests.
`render-motion.cjs` renders the shared scene and complete review sheets; the GIF uses
50ms frames and an exact 3× nearest-neighbor enlargement of the complete scene.
