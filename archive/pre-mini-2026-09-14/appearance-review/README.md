# Jane and Jessie — appearance proposal A

Review checkpoint only. [Open the comparison](index.html) or inspect
[the side-by-side PNG](assets/comparison.png). The review opens on the same idle
frame for current and proposed big/mini versions. Direction, frame stepping,
whole-scene zoom, cell/anchor guides, light/dark backgrounds and silhouettes are
available. No action beyond idle is exposed by the proposal API.

## Sources and authorization

Read and applied the [saved designer reference](../docs/story/lead-designer-reference.md),
[verbatim source](../docs/story/lead-designer-original.txt), shared AGENTS.md,
Jane development AGENTS.md, ART-STANDARDS.md, JANE-STANDARD.md and JESSIE-STANDARD.md,
and Jessie's refinement instructions and visual-direction notes. Inspected the
current native models in idle, locomotion and action poses.

The user's request explicitly authorizes appearance changes that conflict with the
older palette and clothing requirements. It also explicitly requests idle comparison
before animation rollout. This proposal does not replace the approved standards.

The Jane/Jessie masters and motion modules in jane-development, enemy-development
and recyke-development match byte for byte; Jessie's refinement master also matches.
The frozen `baseline/` copies come from jane-development. Comparison means the current
approved-family masters, rather than the rejected anatomy studies or legacy gameplay
sprites. The existing workshops and playable prototypes keep their original art.

## Direction translated into native art

| Character | Designer direction | Treatment in A |
| --- | --- | --- |
| Jane / story Janey | Dark red side ponytail | Burgundy shadow and muted red locks; original attached chain, length and root |
| Jane | Blue eyes, high cheekbones | Blue iris pixel and retained high cheek light plane |
| Jane | Purple / lime, 1980s punk | Purple fitted asymmetric jacket, lime accents, black choker |
| Jane | Torn jeans **or** plaid skirt | **Proposal:** torn jeans with ragged knee/thigh openings; replaces armored knee treatment |
| Jane | Combat boots; shoulder armor tentative | Existing combat boots; **proposal:** omit shoulder armor |
| Jessie | Messy brown hair, angular face, brown eyes | Broken tuft/fringe clusters, brown iris, defined jaw; removes shades |
| Jessie | Leather jacket, jeans, combat boots; red / blue | **Proposal:** oxblood leather moto jacket, charcoal shirt, blue denim, existing boots; removes vest and cargo pocket |
| Jessie | Tattoo, no design/location supplied | **Proposal:** abstract broken chevron on visible outer forearm; rolled sleeves expose it; one dark pixel in mini |
| Both | Laser pistol; Jessie's larger | **Proposal:** stockless sidearm housings with shorter sights, reduced magazine shapes, current wrist/grip positions; Jessie's remains larger |

Skin tones carry forward as a proposal because the designer does not specify them.
Tattoo placement/motif, exact garment cuts, accessory colors, cuff treatment and
sidearm industrial design are proposals rather than new lore. The source's actor
reference is treated as a cue for disheveled brown hair, not a likeness requirement.
No new external reference image or generated bitmap is used.

The story's approximate ages (18 and 19) inform uncovered eyes and hair/face styling.
Age is not asserted as something precisely measurable in a 32px sprite. The source
heights (5 ft 6 in / 5 ft 11 in) remain documented, while both native families keep
their locked common 96px / 32px standing height. No literal height rescaling, body
rig redesign, identifier rename, equipment behavior or story implementation occurs.
Backpack/watch and other equipment details are deferred to a later equipment pass;
this idle view preserves the existing held-pose foundation.

## Preserved constraints

- Big: 128 × 128 cells, 96px standing height, feet anchor (64,112).
- Mini: 48 × 48 cells, 32px standing height, feet anchor (20,40).
- Big and mini contours edited independently; no resized big sprite generates mini.
- Sixteen-color palettes, opaque source pixels, nearest-neighbor whole-scene zoom.
- Original body proportions, leg geometry, boots, feet anchors and motion modules.
- Jane's fixed-length ponytail chain and head attachment.
- Eight idle poses, original 160ms per-frame timing. Native exports have eight
  columns, explicitly identified in metadata; they are review strips, not replacement
  twelve-column gameplay sheets.
- All existing action counts, timings, exports, gameplay and original-backup folders.

`jane-proposal.js` and `jessie-proposal.js` derive from the frozen contour renderers.
Their private drawing functions retain original action branches as migration context,
but the public API accepts only `idle`. Those branches are not an animation rollout
and have not been reviewed as proposed action art. Carry approved appearance changes
into action poses only after the user's design review, preserving Jane's 14 actions
and Jessie's 10 actions, then inspect complete sequences at both sizes.

## Files and reproducibility

- `index.html`, `review.js`: independent comparison page; no gameplay imports it.
- `baseline/`: exact current masters, motion modules and pixel-grid helper.
- `*-proposal.js`: editable native contour proposals, isolated namespaces.
- `assets/*-current-*.png`, `assets/*-proposed-*.png`: transparent native frame 0
  cells and eight-frame idle strips, with sizes named explicitly.
- `assets/comparison-native.png`: 640 × 238 shared-grid board.
- `assets/comparison.png`: exactly 2× nearest-neighbor enlargement of that entire board.
- `assets/review-metadata.json`: palettes, cells, anchors, timing and verification results.
- `source-baseline.json`: SHA-256 hashes of all 960 pre-existing development/backup files.
- `render-review.cjs`: reproducible export and native-raster verification (`@napi-rs/canvas`).
- `check-browser.cjs`: comparison control and desktop/mobile presentation checks (`playwright`).

Serve the workspace root, for example `python3 -m http.server 8042 --bind 127.0.0.1`,
and open `http://127.0.0.1:8042/appearance-review/`. The page also uses local relative
script references and does not need a build step. Configure NODE_PATH for the installed
packages; CHROME_PATH optionally selects the browser for the browser check.

## Verification completed

128 current/proposed idle raster cases: two characters × two versions × two sizes
× eight frames × two directions. All stay within native cells, have only opaque or
transparent pixels, use colors from their 16-color palette, and form connected
silhouettes. Frame 0 heights remain exactly 96 and 32 pixels.

All 960 original file hashes match. Both frozen motion modules match their originals.
Existing motion suites pass: Jane 204 poses / 14 actions and Jessie 144 poses, checking
bones, contacts and independent firing; Jane also checks fixed hair links and waves.

Browser controls pass with no JavaScript errors. Desktop renders at 2 device pixels
per source pixel. The 390px-wide DPR3 browser selects one device pixel per source
pixel, with no page overflow; explicit zoom uses a scrollable scene. Browser geometry
checks allow 0.001 tolerance for CSS layout measurement rounding, while the shared
pixel-grid helper selects integer device scales. Desktop, mobile and light-background
silhouette screenshots are saved in `assets/` and visually inspected. The native
comparison was also visually inspected. These checks preserve the foundation; design
acceptance remains the user's review decision.
