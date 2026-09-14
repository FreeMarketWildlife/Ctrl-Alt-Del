# Pixel art standard / fixed grid

The mandatory rules live in [AGENTS.md](AGENTS.md). The current Jessie, Jane and enemy masters are documented in [JESSIE-STANDARD.md](JESSIE-STANDARD.md), [JANE-STANDARD.md](JANE-STANDARD.md) and [ENEMY-STANDARD.md](ENEMY-STANDARD.md). Compare heroes and enemies at the same grid scale in the [enemy workshop](enemies.html).

## One grid per scene

Every asset in a scene uses one native pixel grid. A world pixel, a character pixel, a weapon pixel and an effect pixel have identical size. Scale the complete canvas uniformly to whole device-pixel blocks using `CADPixelGrid.applyScene`. Never stretch a scene to fill its container or enlarge one sprite independently. Round final drawing positions to the native grid; disable smoothing.

High-density phones may use fractional CSS canvas dimensions when they correspond to whole device-pixel blocks. If a scene cannot fit at its smallest whole-device-pixel scale, crop or scroll it instead of introducing uneven pixels. Ordinary HTML text is outside the pixel-art grid.

## Fixed size families

| Family | Cell | Standing height | Feet anchor |
| --- | --- | --- | --- |
| Big | 128 × 128 | 96px | (64,112) |
| Mini | 48 × 48 | 32px | (20,40) |

Author the two versions separately. Their difference is native pixel count, never an individual scale transform. Use these families for future humanoid characters and enemies. Bosses can span multiple cells. Changes to these sizes require an explicit user request.

## Drawing and motion

- Readable adult silhouette before costume detail. Maintain head, shoulder, pelvis and limb volume through every pose.
- Sixteen opaque colors plus transparency for each character. Upper-left light, darker far limbs, coherent highlight clusters. No blurred edges or automatic image reduction.
- Twelve walk poses with a grounded support foot. Twelve run poses with compression, push-off, airborne recovery and contact. Fixed limb lengths, opposing limbs and restrained torso motion prevent a dancing silhouette. Read timing and frame counts from metadata.
- Braced gun poses and recoil are independent of the leg cycle. Jump, crouch and strike poses preserve their anchors and explicitly timed recovery.
- View both directions, normal speed, slow playback and the complete frame strip. Check native exports for bounds, palette, alpha and timing. Technical validation does not replace visual review.

## Migration status

Jessie's earlier 128×112 anatomy study and 40×40 field studies are rejected as character masters. The codex now links to fresh big/mini drawings for Jessie, Jane and six enemy archetypes. Jane's explicitly labeled Courier outfit and the separate flight vehicles retain their existing artwork. Do not copy former study cell sizes into new assets. Existing gameplay retains legacy art and collision geometry pending separate integration. Shared canvas presentation applies across the app.

The SLYNYRD anatomy, walk, fighting stance, strike and compact run-and-gun references and our specific design decisions are linked in [Jessie's standard](JESSIE-STANDARD.md).

Jane uses 14 animation rows including run/fire combinations, cross punches and
two kicks. Her ponytail is authored separately at each native size with fixed-length
links and progressive delay. [Her standard](JANE-STANDARD.md) records timing, hair
metadata, exports and research. Approved Jessie artwork remains unchanged.

Sentinel, Bastion and Scrapper match the humanoid standing heights. Watcher, Manta
and Collector use 96px/32px neutral spans within the same cells. All six have
independent big/mini art, complete movement and combat sequences, and persistent
final wreck poses. Their canonical dimensions and timings live in `assets/enemies/`.
