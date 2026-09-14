# Art direction — fixed pixel standard

## Non-negotiable pixel consistency

- Every scene has ONE native art-pixel grid. Characters, enemies, environments,
  weapons, effects and pixel UI within that scene use exactly the same pixel size.
- One source pixel equals one logical world unit. Snap the final raster to that
  grid. Never independently scale a sprite, body part, weapon or prop.
- Zoom the COMPLETE scene uniformly with whole DEVICE pixels per source pixel.
  Use `CADPixelGrid.applyScene` for canvas presentation. Never stretch to fill.
- Fractional CSS dimensions are allowed only when they map exactly to whole
  device-pixel blocks. This handles high-density phones without uneven pixels.
- A mini sprite must never be independently enlarged to match a big sprite.
- No smoothing or antialiasing on pixel sprites. Perspective/rotation must be
  rasterized to the native grid, not applied as a fractional sprite transform.

## Locked character and enemy size families

- BIG: 128 × 128 native cells, standard humanoids standing 96px high, feet anchor (64,112).
- MINI: 48 × 48 native cells, standard humanoids standing 32px high, feet anchor (20,40).
- Big and mini are separately authored. Never derive one by resizing the other.
- Keep these sizes fixed from now on. Standard humanoid enemies use these same
  families. Larger bosses may occupy multiple cells without changing pixel size.
  Do not change sizes without an explicit user request.
- Jessie and Jane now have approved-family masters in `jessie.js` and `jane.js`.
  Their motion modules are `jessie-motion.js` and `jane-motion.js`. Do not use the
  rejected `characters-detailed.js` anatomy rig for either character's new art.
  Compare both families together in `jane.html`. Sentinel, Bastion, Scrapper,
  Watcher, Manta and Collector now have native enemy masters in `enemies.html`.
  Jane / Courier and the separate flight vehicles retain their existing artwork.
- Export native dimensions, stable feet anchors, palette and per-frame timing.
- Preserve limb lengths and volume through every animation. A smoother frame
  rate cannot repair shrinking thighs or sliding feet. Inspect full sequences
  and silhouettes; verify planted contacts and connected anatomy before detail.
- Jessie and Jane locomotion currently use 12 poses. Keep frame counts and timing in
  metadata; never assume eight frames in viewers, exports or gameplay adapters.

## General art rules

- Use pixel-art assets for all icons; do not introduce emoji or font-symbol icons.
- Author UI icons and miniature building illustrations on a 32 × 32 pixel canvas
  and display them at native size. Draw miniature versions rather than shrinking
  world sprites. Use the existing game palette and crisp nearest-neighbor rendering.
- World sprites use one art pixel per world unit; camera zoom applies uniformly.
  Preserve that shared scale. Do not independently stretch art or use fractional
  scaling for UI assets. Building portraits use their native sprite dimensions.
- Inventory/category panels should open adjacent to their toolbar trigger rather
  than as centered modal windows. Keep the world visible and usable.

## Jane motion and exports

- Preserve all 14 Jane actions, including stand, cross, front-kick and round-kick.
  Her 128×128 / 48×48 cells, 96px / 32px heights and anchors match Jessie.
- Jane's mini is independently authored. Preserve her magenta jacket, dark violet
  ponytail, warm skin, 16-color palette and connected head/neck silhouette.
- Hair roots follow the head; fixed-length links carry a delayed traveling wave.
  Run/fire combinations share hair and lower-body motion. Never scale or move the
  root separately to make a tail pose fit. Inspect the full 12-pose run at both sizes.
- `CADJane.metadata()` is the canonical sheet metadata; preserve actual counts,
  per-frame timings, loop recommendations, foot contacts and hair point data.
- New masters are available in the workshops, Concept Art and the playable Recyke
  starter level. The original Skyview campaign retains its legacy collision/art sizing.

## Enemy models and exports

- The six enemy archetypes each have independent big and mini artwork. Ground
  enemies use the fixed 96px/32px standing heights; drone idle frame 0 spans are
  96px/32px wide. Both use the same native cells and ground anchors as the heroes.
- Use `enemy-mechs.js`, `enemy-mech-motion.js`, `enemy-drones.js` and the shared
  `enemies.js` API. Do not restore the old inline codex enemy experiments as masters.
- Preserve each enemy's distinct armor, weapon, rotor/wing or claw silhouette.
  Every palette has sixteen opaque colors, with the shared hero ink/neutral ramp.
- Ground enemies have ten actions, drones seven. Read actual counts and timings
  from `CADEnemies.metadata(id)`. Death is a one-shot with a persistent final wreck.
- Render and export native pixels. One complete scene zoom is allowed; individual
  enemy scaling and automatic big-to-mini reduction are prohibited.
- Keep the approved Jessie/Jane source, motion and asset pixels unchanged during
  enemy work. Validate every frame and direction, contacts, bounds and native sheets.

## Recyke starter level

- `recyke.html` / First Shift uses the approved heroes and all six enemy archetypes.
  Big has a 640 × 360 native viewport; mini has a 480 × 270 native viewport.
- `recyke-level.js` owns two separately placed maps and family-specific physics.
  `recyke-art.js` draws original scenery on the same native grid as the active
  models. Neither route is a resized copy of the other.
- Preserve 96px / 32px standing heights, native anchors, opaque raster geometry,
  bitmap world lettering and whole-scene device-pixel presentation.
- Gameplay animation adapters read canonical timing, preserve the running leg
  cycle while firing, and hold final one-shot death poses. Do not alter approved
  character/enemy source or export pixels to accommodate a level adapter.
- Maintain the safe introduction, reachable platforms, checkpoint recovery and
  Bastion-controlled exit. Verify normal-input completion of both routes, cover,
  collisions, input interruption and pixel presentation when changing gameplay.
- See `RECYKE-LEVEL.md` for route design, controls, research and validation commands.
