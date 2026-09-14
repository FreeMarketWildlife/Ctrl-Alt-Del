# Recyke / Street to Alley — environment kit 01

**Review candidate, revision 1.** A native modular environment kit with **47 definitions per family** (94 total), a searchable catalog, and two independently laid out, traversable demonstration scenes ending at the concealed Moral Code entrance. This is an isolated environment study, not an editor or finished campaign chapter.

[Open the preview](index.html) · [Same-grid family comparison](review/family-comparison.png) · [Asset registry](assets/registry.json) · [Production notes](PRODUCTION-NOTES.md) · [Raster/traversal checks](review/checks.json) · [Browser checks](review/browser-checks.json)

[Download the complete kit](dist/recyke-kit-r1.zip). Generated assets, catalog, reference sheets, scenes, source recipes and check reports are included.

## Review it

Serve the workspace root locally, then open [the kit preview](http://127.0.0.1:8056/recyke-kit/). The current review server uses port 8056. To restart it from the workspace root:

```sh
python3 -m http.server 8056 --bind 127.0.0.1
```

The preview uses fetch, so open it through localhost rather than double-clicking the HTML file. The generated assets and preview are portable together; rebuilding the extracted assets requires the original workspace sources recorded in metadata.

- **Walk the scene:** select Mini or Big and Jane or Jessie. A/D or arrows move, W/Up jumps, R restarts, P/Escape pauses. Mini supports the approved held S/Down crouch; the historical big reference has no new held-crouch behavior. Combat is outside this preview.
- **Visit sections:** Main street, Service frontage or Concealed entrance jumps to a safe review position. The ground route also connects them continuously. Crates, a raised street section and an optional one-way catwalk demonstrate elevation.
- **Entrance:** near the door, E advances sealed → latched → unlatched → opening → open. The inspector can select states directly. This tests visual states; it is not a password puzzle or the final scripted lock choreography.
- **Geometry:** lime solid rectangles, cyan dashed one-way platforms and amber interaction sensors. Decorative architecture, steam, machinery and foreground objects do not obstruct or damage the player. The entrance faces into the background; its sensor does not create an invisible horizontal wall.
- **Catalog:** search/filter, select a piece, inspect dimensions/anchor/default collision/sockets/source, select variations/states, pause and frame-step, or download the native sheet and exact metadata. All thumbnails draw native pixels; larger art can scroll rather than shrink.
- **Layers:** preview visibility can be toggled without changing authored data or collision. The native canvas is uniformly zoomed in integer device pixels using the unchanged shared `CADPixelGrid` helper.

## Delivered files

| Path | Contents |
| --- | --- |
| `assets/mini/`, `assets/big/` | Per-asset JSON and native PNG strips, including explicit cosmetic variations. No image is a resized version of the other family. |
| `assets/registry.json` | Versioned registry, palette, family/physics contracts, layers, material adjacency rules, assets, entrance assemblies and unchanged actor-reference declarations. |
| `assets/assemblies.json` | Two reusable native entrance assemblies: recess plus stateful door artwork and an entry socket. |
| `scenes/mini.json`, `scenes/big.json` | Independently placed layouts. Mini width 1,440; big width 2,560. Gameplay viewports 480×270 and 640×360. |
| `reference/` | Byte-identical hero-sheet copies, canonical animation metadata, unchanged grid helper, and a hash baseline for protected workspace files. These heroes are scale references, not new editable kit art. |
| `src/mini.cjs`, `src/big.cjs`, `src/painters.cjs` | Independent native recipes and shared integer-pixel drawing tools. |
| `src/build.cjs`, `src/scenes.cjs` | Deterministic exports and independently authored scene construction. |
| `src/preview-runtime.js`, `preview.js` | Native sheet renderer, small traversal harness and catalog UI. No production runtime changes. |
| `review/` | Native scenes/panoramas/contact sheets, browser captures, animation review strips and check reports. |
| `tests/` | Raster/schema-contract, seam, traversal, source-integrity and browser checks. |

The 47 definitions in each family cover 16 adjacency-based street tiles; facade, alley-wall, shutter, roof, corner and recessed-entry modules; the seven-frame concealed door; horizontal/vertical/elbow pipes; fan, lamp, scrap, skyline, cable and puddle; two cargo crates; four catwalk end/repeat modules and a decorative support; drain, FIX sign, paper notices; bin/bag, sorting press, boiler/steam; train carriage and rail beam. There are **186 PNG environment sheets** and **276 frame/variation rasters** across both families. This count excludes the unchanged hero sheets and review exports.

## Asset contract in this release

Use `assetId` + `revision`, never filenames or catalog positions as identity. Example: `cad.mini.recyke.crate-low` revision 1. Family is immutable. Display names may change without breaking references. Every entry records native geometry, bounds per frame/variation, origin, typed connection sockets where applicable, layers, collision defaults, properties, animation states/timings, source provenance, tags, thumbnail and placement rules.

Coordinates are integer native pixels, X right/Y down. **`native.origin` is a point in image coordinates. Collision offsets and sockets are relative to that origin.** Render a cell at `(instance.x - origin.x, instance.y - origin.y)` with no individual scaling. `visibleBounds` and `animationEnvelope` are in image coordinates. Terrain and pipe modules use top-left origins; facades use base-left; crates use base-center; lamps use their mounting point. This explicit distinction prevents double-subtracting actor anchors.

PNG strips have `frameCount × native.width` columns of pixels and `native.height` rows. Frame order and duration come from `animation.states`, not a guessed frame rate. Door frames are shared by several states; opening is a one-shot and holds its last open frame. Cosmetic variations use separate PNGs with identical collision. Actor sheets retain their original 12-column row layout and must use their separate canonical metadata.

The street material uses **24×24 mini** and **48×48 big** native tiles. It follows the existing Recyke surface motif instead of imposing the plan's tentative 8×8 artwork module. Fine placement remains one pixel; the suggested snap is 8/16 units. Neighbor masks are U=1, R=2, D=4, L=8; all 16 combinations have authored tiles. A missing diagonal/concave transition must be authored later, not synthesized by scaling. The saved scenes resolve material choices and variations into concrete asset instances; no full painting editor is included.

The registry's `properties.state` chooses artwork only. Collision and interactions are independent data. A consumer can bind an entrance sensor and `entry` socket to real mission logic later. The preview's `preview-inspect-entrance` behavior is explicitly a review action. There are no active hazard defaults, enemy encounters, pickups, invented signs naming the hideout or lore-bearing poster text.

## Rebuild and verify

Requires Node with `@napi-rs/canvas` and `playwright` installed, and Chrome for browser checks. Set `NODE_PATH` if using the bundled workspace packages; set `CHROME_PATH` if needed. Run from the workspace root:

```sh
node recyke-kit/src/build.cjs
node recyke-kit/src/scenes.cjs
node recyke-kit/src/render.cjs
node recyke-kit/tests/check.cjs
BASE_URL=http://127.0.0.1:8056/recyke-kit/ node recyke-kit/tests/browser.cjs
```

The generator checks each new frame on a padded canvas to catch clipping and rejects partial alpha. The checks validate native dimensions, metadata bounds, declared palette, unique asset IDs, animation frame/timing references, hashes, 96 compatible street joins, traversability and door completion in both families. Browser checks cover real keyboard movement/jump/pause, mini crouch, entrance completion, catalog search/filter/state/frame controls, hero selection and DPR 1/2 whole-pixel presentation. The protection baseline verifies **1,949 existing files**, including all original backups and the archive, remain unchanged.

## Native scene exports

[Mini street](review/mini-street.png) · [Mini service frontage](review/mini-yard.png) · [Mini entrance open](review/mini-entrance-open.png) · [Mini panorama](review/mini-panorama.png) · [Mini complete contact sheet](review/mini-catalog.png)

[Big street](review/big-street.png) · [Big service frontage](review/big-yard.png) · [Big entrance open](review/big-entrance-open.png) · [Big panorama](review/big-panorama.png) · [Big complete contact sheet](review/big-catalog.png)

The panorama deliberately repeats scale-reference figures at the start and entrance for review. The playable preview has one controlled hero plus the stationary starting reference; it does not claim scripted companion AI. Mini characters retain Proposal A. Big characters retain their historical approved clothing without alteration; do not read that comparison as a new character-appearance proposal.
