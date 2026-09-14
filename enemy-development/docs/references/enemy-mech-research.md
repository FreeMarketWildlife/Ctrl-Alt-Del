# Native enemy machinery — research and decisions

Three original designs extend Jessie's and Jane's approved visual family. These
are ordinary human-sized machines, not giant bosses: each stands 96 native pixels
high in a 128×128 big cell and 32 pixels high in a separately authored 48×48 mini
cell. Their feet anchors remain (64,112) and (20,40). A scene zoom affects the whole
world uniformly; the mini is never enlarged independently.

## Shape and materials

Raymond Schlitter's [Pixelblog 19: Mecha Mania](https://www.slynyrd.com/blog/2019/7/23/pixelblog-19-mecha-mania)
explains why a three-quarter side view describes angular machinery clearly, why
human figures establish mechanical scale, and how surface striping can wrap
around a form. Applied here: establish three different silhouettes before color,
use sloping armor plates with broad top-facing highlights, and preserve a common
human reference height. No tutorial sprites or paint schemes were copied.

- **Sentinel:** a narrow cyan patrol chassis, recessed segmented waist, red mono-eye,
  exposed ankle mechanisms and a compact forearm cannon. It has the lightest visual mass.
- **Bastion:** broad sand/olive armor, offset shoulder launcher and a tapered shield
  covering the near arm. The shield advances bodily during its bash; it does not
  change size. Its amber visor remains visibly separated from the weapon.
- **Scrapper:** rusty industrial plates, a caged cyan sensor, boiler backpack,
  exposed shin pistons, power core and two articulated claw tines. Its melee
  raises and closes the claw as the chassis lunges.

All three palettes contain 16 opaque colors. They retain the heroes' common navy
outline and four steel values, then add their own armor and emissive ramps.
Highlights describe surfaces rather than placing random texture pixels. Mini
models use dedicated head, limb, shield, cannon and claw contours, reducing small
mechanisms to readable clusters. Each sensor has a restrained idle scan.

## Timing and mechanics

[Pixelblog 50: Human Walk Cycle](https://www.slynyrd.com/blog/2024/5/24/pixelblog-50-human-walk-cycle)
uses a simple anatomical dummy, meaningful contact/down/passing poses and economical
detail. The machines preserve the already approved twelve-pose foot paths, 80ms
walk cadence and 50ms run cadence. Big legs have 23px upper/lower links; mini legs
have 7px links. A shared pelvis solves to the fixed foot targets, with an airborne
phase in running. Firing does not alter the run's lower-body pose or timing.

[Pixelblog 9: Melee Attacks](https://www.slynyrd.com/blog/2018/9/8/pixelblog-9-melee-attacks)
discusses stance, weapon weight, short attack transitions, held anticipation and
recovery. The enemies expose a six-pose charge action and six-pose melee action.
A 160ms windup precedes a 45ms strike, a 75ms impact and a slower recovery. These
are enemy telegraphs: their visible intent is part of the attack, not extra
input latency imposed on the heroes. The three attacks read as a cannon shove,
shield bash and closing claw.

Eight death poses carry impact, failure, buckling, fall, impact, settling, power
down and the final wreck. The chassis rotates through native rasterized geometry;
its limbs keep their lengths. Knees fold upward, and weapon hinges counter-rotate
as the chest falls so barrels and claws stay above the floor. Final wreck geometry
is held and its sensors go dark. Playback tools may loop a review, but metadata
marks charge, fire, melee, jump, hurt and death as one-shot actions.

## Review and reproducibility

`enemy-mech-motion.js` owns the poses and timing; `enemy-mechs.js` owns original
native pixel contours. `CADEnemyMechs.metadata(id)` exports actual frame counts,
all pose data, timing, contacts, palette, sizes and anchors. All ten actions total
80 authored poses per size per archetype. Sheets use twelve columns and pad short
rows by repeating their final authored pose.

`node tests/enemy-mech-motion.cjs` validates fixed bones (maximum rounding error
0.639px), native placement, sole contacts, safe mirrored feet, continuous knee
motion, run/fire parity, telegraph timing and the settled wreck. The full enemy
raster suite separately checks every frame, facing, palette and export.
