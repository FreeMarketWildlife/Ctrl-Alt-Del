# Ground crouching — Jane and Jessie minis

[Play Recyke](../recyke-development/recyke.html) · [Inspect both heroes](index.html) · [Animated crouch comparison](assets/crouch-motion.gif)

[All new poses](assets/crouch-sequences.png) · [Opposite facing](assets/crouch-sequences-left.png) · [Hitbox comparison](assets/crouch-comparison.png)

Hold **S / Down**, or the touch **Duck** button, while grounded. Combine it with
left/right movement and Fire in any combination. Crouching applies immediately,
including on the landing simulation step. Feet remain in exactly the same place.
Release to stand; if a solid ceiling blocks standing, the character stays low until
clear. One-way platforms do not trap the head. Down in an ordinary airborne jump
does not shrink the body; landing with Down does.

## Native artwork and collision

| Contract | Value |
| --- | --- |
| Native cell / feet anchor | 48×48 / (20,40), unchanged |
| Standing art / collider | 32px tall / 10×30 |
| Crouching art / collider | 18px tall / 10×16 |
| Crouch speed | 25 world pixels/second |
| Lower muzzle | 18px forward, 9px above feet |
| Crouch idle | 4 holds × 160ms |
| Crouch walk | 12 poses × 80ms |
| Crouch fire | 60 / 75 / 130ms |
| Crouch walk + fire | 12 poses × 80ms; continuous movement phase |

The four added state names are `crouch-idle`, `crouch-walk`, `crouch-fire` and
`crouch-walk-fire`. The old `crouch` study remains unchanged for compatibility.
Jane now has 18 actions / 133 poses, Jessie 14 / 103. Canonical sheets and metadata
include all new states. Their heights are now 864px and 672px, respectively; cells
and 576px sheet width are unchanged. All active master copies agree.

The renderer authors a folded low body directly on the native grid. Original 7px
thigh/shin lengths and boot geometry remain. Walking keeps the 2px contact stride
per 80ms; the new swing arc lifts the feet only 2px so knees pass smoothly beneath
the torso. Jane's five-joint ponytail retains its fixed links and follows the low
head. Clothing, cuffs, tattoo, choker and denim details use Proposal A clusters.
Firing does not reset the walking leg or hair phase.

Solid collision, projectile collision and pickup reach use the current height.
High projectile trajectories that hit standing players pass over crouching players;
low trajectories still hit. Solid walls still occlude the lowered muzzle. Crouching
does not confer invulnerability to low attacks or close melee.

## Implementation choices

These details were unspecified and are the implemented proposals:

- A 16px collider and 18px visual height give a readable deep crouch with the same
  small head-art margin as the original standing model.
- Crouch walking uses 25px/s to match the authored contact stride; standing running
  retains its existing 90px/s.
- Held Down takes priority over grounded jump and melee, preserving the requested
  always-crouched behavior. Release Down to jump or use the standing melee action.
- The character holds the weapon ready in both low idle and low walking poses.
- Standing resumes automatically when there is enough solid headroom.

## Verification and visual findings

- 16 crouch simulation scenarios pass across both heroes: all four combinations,
  landing, hero swaps, headroom, narrow passages, projectile misses/hits, both muzzle
  directions, wall occlusion, pause and reset.
- Real browser keyboard and three-touch Duck + Move + Fire tests pass, including
  input release/cancellation. No JavaScript errors.
- All 236 authored motion samples pass fixed bones, boot clearance and contacts.
  New crouch cycles also pass knee continuity, gait/shot independence, hair-root and
  hair-link checks. Maximum bone rounding error: 0.616px; hair-link error: 1px.
- All 472 hero frame/facing rasters pass native cell bounds, opaque palette,
  connected principal silhouette, floor contact and exact sheet/draw equality.
- Original 348 Proposal A frame/facing rasters are byte-identical to the saved
  pre-crouch masters. All 174 original motion samples match the pre-mini archive.
  All 816 enemy rasters and original-backup hashes remain unchanged.
- Existing Recyke simulation: 13 scenarios pass. Both heroes complete the route
  through normal inputs in 22.49s, with 8 kills and 6/6 health.
- Existing native-art checks: 8 scene probes pass. Pixel-grid checks pass.
- Browser regression: both heroes' keyboard controls, pause/restart, defeat/retry,
  complete playthrough and six viewport/DPR combinations pass. Mini workshop checks
  cover all 32 action strips, pose stepping, crouch/movement and hitbox controls.

Inspected complete new sequences and opposite facings for anatomy, clothing,
ponytail attachment, clipping and ground contact. The repaired low gait has no
remaining knee jump or floor penetration. Integer pose holds create small steps
between contact frames; no additional accumulated contact drift occurs at steady
25px/s. The inherited standing run drift remains documented in README.md. Low idle
uses a held ready pose, matching the original mini idle's restrained treatment.

The pre-crouch hero/motion/game files are preserved in `crouch-baseline/` for direct
comparison. Character master/export baseline hashes were explicitly refreshed only
after the original-action pixel checks passed. The older large-model archive and
original backups are untouched.

## Run the checks

Use Node with the installed `@napi-rs/canvas` and `playwright` packages on NODE_PATH.
Serve the workspace at port 8042. Set CHROME_PATH to the installed Chrome executable.

```
node mini-review/check-characters.cjs
node recyke-development/tests/jane-motion.cjs
node recyke-development/tests/jessie-motion.cjs
node recyke-development/tests/crouch.cjs
node recyke-development/tests/crouch-browser.cjs
node mini-review/check-browser.cjs
node recyke-development/tests/recyke-level.cjs
node recyke-development/tests/recyke-art.cjs
node recyke-development/tests/pixel-grid.cjs
BASE_URL=http://127.0.0.1:8042/recyke-development node recyke-development/tests/recyke-browser.cjs
node mini-review/render-crouch.cjs
```
