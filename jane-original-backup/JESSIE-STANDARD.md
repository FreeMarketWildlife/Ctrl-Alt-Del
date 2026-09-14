# Jessie / fixed pixel standard

This replaces the rejected anatomy study as Jessie's working master. Only Jessie
is in scope; Jane and enemy art will receive their own passes.

| Family | Native cell | Standing height | Feet anchor |
| --- | --- | --- | --- |
| Big | 128 × 128 | 96px | (64,112) |
| Mini | 48 × 48 | 32px | (20,40) |

Both variants use the same source-pixel grid. Mini Jessie is separately drawn,
not reduced from big Jessie. These sizes stay fixed for future character/enemy
pairs; unusual bosses may occupy multiple cells with the same pixel grid.

## Presentation

Every scene has one grid and one uniform zoom. One native pixel equals one world
unit. `CADPixelGrid` presents the complete scene in integer device-pixel blocks.
For example, a 480px scene can occupy 320 CSS pixels on a DPR3 phone, with exactly
two device pixels per art pixel. No per-sprite zoom or fractional rotation. Ordinary
HTML typography is not pixel art. UI icons remain separately authored 32px drawings
on their UI grid. Comparison scenes draw both character sizes together at one zoom.

## Design and animation

Copper hair, black shades, broad bare arms, teal field vest, dark cargo trousers,
reinforced knees, boots and an energy carbine. Sixteen shared colors. Lighting from
upper left. Big Jessie uses shaped face, fabric and muscle clusters; mini Jessie
preserves the identity-defining shapes. The new torso has broad shoulders, a rib
cage and a tapered waist. Forearms have distinct muscle planes; the carbine is
compact enough to keep the human silhouette dominant.

`jessie-motion.js` provides independently authored foot paths for both sizes,
with fixed-length thigh/shin joints (23px big, 7px mini). The final raster permits
at most a 1px bone-length rounding error. Boots pitch through push-off and recovery.
The head and neck travel together with the torso; arms oppose the walking legs. Walk uses
12 × 80ms; run uses 12 × 50ms, retaining the previous 600ms run cadence.
Both versions remain intended for run-and-gun use.

Rows: idle, walk, run, fire, run-fire, jump, jump-fire, crouch, jab, hurt.
Weapon recoil is independent of leg motion. Each state has explicit frame timing.
Sheets reserve twelve cells per row and repeat the last pose when a state is shorter.
Metadata records the actual frame counts. The comparison viewer adds a sample
jump arc; frame strips and exports contain anchored poses. The game supplies
actual vertical motion when integrating the sprites.

## Upper-body refinement

The larger master uses a connected collar/neck/head, a narrower ribcage with a
clear waist, and joined arm contours in place of rounded outlined limb segments.
The profile has one visible sunglasses lens, an ear and a square jaw. Clothing
and skin use broad value clusters; highlights stay on the upper-left planes as
the arm extends. Both hands follow weapon recoil. The jab uses a stable shoulder
root, a reachable wrist target and a full glove silhouette.

The complete upper body shares the same vertical offset in every pose. Previously,
only the head received 65% of the torso displacement, leaving a visible air gap in
deep crouches. A raster connectivity regression now checks that head pixels remain
joined to the torso through every animation, in both directions.

The [world scale and complete pose review](docs/review/jessie-review.html) uses the
live renderer, with native frame sheets, silhouettes, both directions and light/dark
backgrounds. Its original industrial vignette demonstrates a 112px clear doorway,
32px cargo crate and 48px cover barrier next to 96px Jessie. These are reference
prop dimensions for the big family, not resized gameplay assets. Mini remains
independently authored at 32px; its existing artwork and motion are unchanged.

## References

- [Anatomy / SLYNYRD 49](https://www.slynyrd.com/blog/2024/3/25/pixelblog-49-realistic-human-anatomy): adult head-unit construction; check anatomical landmarks before detailing. Our broad arcade silhouette uses a 16px head including hair within the 96px standing height.
- [Walk / SLYNYRD 50](https://www.slynyrd.com/blog/2024/5/24/pixelblog-50-human-walk-cycle): eight contact/down/pass/lift poses, grounded supporting foot, restrained clothing clusters.
- [Stance / SLYNYRD 52](https://www.slynyrd.com/blog/2024/9/26/pixelblog-52-idle-fighting-stance): knee-driven weight and a steady foundation.
- [Strikes / SLYNYRD 53](https://www.slynyrd.com/blog/2024/11/25/pixelblog-53-punches-and-kicks): quick outgoing motion, held impact and readable recovery.
- [Mini run-and-gun / SLYNYRD 60](https://www.slynyrd.com/blog/2026/1/26/side-view-run-n-gun): economical clusters and independently timed gun/leg layers during movement. Our 32px mini height is a project choice, larger than the article's tiny base figure.
- [Run keyframes / SLYNYRD 8](https://www.slynyrd.com/blog/2018/8/19/pixelblog-8-intro-to-animation): strong contact, passing and airborne poses before adding in-betweens; preserve cadence when changing frame count.
- [Motion process / SLYNYRD 25](https://www.slynyrd.com/blog/2020/1/23/pixelblog-25-motion-cycles): animate and inspect anatomical sections first, then add clothing.
- [Derek Yu / Pixel Art Basics](https://derekyu.com/makegames/pixelart.html): economical clusters, clean outline steps and internal separation with shadow colors rather than heavy black divisions.
- [Saint11 / Consistency](https://saint11.art/blog/consistency/): render all world assets into one native canvas and apply uniform presentation scaling.
- [Saint11 tutorials](https://saint11.art/blog/pixel-art-tutorials/): economical shading, readable run silhouettes and clear clusters.

The [visual reference and exact generation prompt](docs/references/jessie-direction.md)
record the broader direction explored for this revision. It is concept reference;
the actual sprites remain native-grid contour drawings, not resized crops of it.

## Review

Compare both sizes together at the same scale and inspect complete pose sequences.
Check directions, bounds, palette, opaque pixels, exports, leg continuity while
shooting, and integer device-pixel blocks on desktop/mobile. Technical checks support
visual review; they do not establish that the design is visually successful.

Run `node tests/jessie-motion.cjs` for anatomical invariants. Serve the repository
on port 8026 and run `node tests/pixel-grid.cjs` and `node tests/jessie.cjs` with
Playwright installed. Set `BASE_URL` for another
server and `CHROME_PATH` for a system Chrome binary. Set `UPDATE_ASSETS=1` on
the Jessie check to regenerate native PNG sheets and JSON timing metadata.

Run `node tests/jessie-review.cjs` for the scale scene, complete frame sheets,
stepping and desktop/mobile review presentation. It exports review PNGs to a
temporary directory; `BASE_URL`, `CHROME_PATH` and `REVIEW_OUT` may be supplied.
