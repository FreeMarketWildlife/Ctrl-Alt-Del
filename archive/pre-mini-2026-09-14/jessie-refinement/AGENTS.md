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

- BIG: 128 × 128 native cells, Jessie standing 96px high, feet anchor (64,112).
- MINI: 48 × 48 native cells, Jessie standing 32px high, feet anchor (20,40).
- Big and mini are separately authored. Never derive one by resizing the other.
- Keep these sizes fixed from now on. Standard humanoid enemies use these same
  families. Larger bosses may occupy multiple cells without changing pixel size.
  Do not change sizes without an explicit user request.
- Only Jessie is being rebuilt now; Jane and enemy art remain legacy until their
  own passes. `jessie.js` is Jessie's new source. Do not use the rejected anatomy
  rig for either new Jessie variant. Compare both on the same grid in `jessie.html`.
- Export native dimensions, stable feet anchors, palette and per-frame timing.
- Preserve limb lengths and volume through every animation. A smoother frame
  rate cannot repair shrinking thighs or sliding feet. Inspect full sequences
  and silhouettes; verify planted contacts and connected anatomy before detail.
- Jessie locomotion currently uses 12 poses. Keep frame counts and timing in
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
