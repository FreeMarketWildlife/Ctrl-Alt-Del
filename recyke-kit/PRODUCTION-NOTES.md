# Recyke kit 01 — production and review record

## Decisions applied

The [level-editor plan](../docs/editor/level-editor-plan.md), including its asset-library section, the [lead-designer reference](../docs/story/lead-designer-reference.md) and [verbatim source](../docs/story/lead-designer-original.txt), and current/archived family standards were inspected before production. The current [crouch contract](../mini-review/CROUCHING.md) was also read; its approved mini artwork and metadata are preserved.

No separate saved review document was found. The review decisions available in the current request were applied: both independently authored native families, an isolated and reviewable kit, a short street-to-alley scene ending at the concealed Moral Code entrance, approved characters kept unchanged, and a lightweight preview instead of a full editor. Additional review notes were requested asynchronously; none were supplied during this production pass.

The new request explicitly authorizes big and mini environment work here. The existing workspace's mini-only production defaults remain untouched. Only this folder uses the archived approved big sheets as immutable scale references. Jane and Jessie in the big view retain their historical appearance, while mini uses current Proposal A. No enemy art was edited or imported into the peaceful demonstration.

The destination follows the source's Intro, but the architecture layout and E-based visual inspection are proposals. There is no new password, spoken dialogue, emblem, story title, final lock choreography or interior. The previous tooling plan's practice switch/combat/depot endpoint was deliberately replaced with a quiet concealed entrance, as requested in this task.

## Reuse and new work

- **Exact native extraction:** low/tall cargo crate pixels from `surfaces`; refuse-bin/bag group, press and boiler/steam from `machinery`. Big extraction reads the archived independently authored big source; mini reads current Recyke. Native crop rectangles, source function and SHA-256 are recorded per asset. No image resizing is involved.
- **Adapted native motifs:** train carriage and rail beam, the FIX sign's native glyphs, Recyke's muted violet/steel/rust palette, window and ground language. The train's prior last-window drawing exceeded its advertised body width; the modular version constrains complete windows within its new sheet. Existing source is unchanged.
- **New modules:** all terrain edge/cap combinations, window/shutter/masonry bays, quiet rear alley wall, cornice/roof variations, corner return and recess, door state sequence, pipe connector modules, fan/lamp cycles, scrap variants, cable, drains/reflections and nonverbal paper notices. New artwork is a direction-review candidate, not labeled already approved.
- **Independent layouts and dimensions:** mini uses 24px ground tiles, 64×112 facade bays, 48×58 door cells with a 32×44 opening, and a 1,440px route. Big uses 48px tiles, 160×208 bays, 104×142 door cells with a 72×112 opening, and a 2,560px route. Ratios differ by object and layout; no global family-size multiplier exists.

## Contract findings and changes

1. **Terrain module size:** the plan's 8×8 miniature terrain module was tentative. The kit keeps the existing 24px mini / 48px big ground cadence for readable service-street detail. Placement is still integer-native and can snap more finely. All four-neighbor edge combinations are supplied; diagonal corner blending between different materials is not.
2. **Image bounds versus body size:** reused bins include bags/scrap, presses include their label and animation sweep, and boilers include pipe/steam extents. Metadata stores the complete exported envelope and per-frame visible bounds. These are larger than the machine body's size quoted in the planning inventory.
3. **Origin coordinate systems:** image-space origin/bounds and anchor-relative sockets/colliders are explicitly distinguished. Assets do not all share a humanoid feet anchor. The preview applies the actor anchor once using canonical metadata.
4. **Collision is independent of imagery:** dark machines, bins and facade details are decorative; only the ground, crates and catwalk tops block/support movement. The recessed entrance faces the background, so it supplies an interaction sensor and entry socket rather than an invisible side-scroller barrier. A real door across the path needs a separately specified solid-door behavior and geometry.
5. **Animation state reuse:** the door stores seven native frames, reused across sealed, latched, unlatched, opening and open states. It is not seven frames at one fixed FPS. Opening is nonlooping with an explicit end state. The press/steam loops sample the existing native procedural art deterministically.
6. **Family approval differs from unchanged character provenance:** copied actor references are byte-identical approved masters from their respective source stages. The new environment asset approval status is `review-candidate`; this task does not silently approve new character appearance or restore big production gameplay.
7. **Assemblies versus behavior:** the two native entrance assemblies expose the door's visual state. They do not embed executable mission logic. The prototype preview controls have a named review-only behavior that a future editor/runtime can replace.

## Visual QA findings

The street, service frontage and entrance were inspected in both native families, with approved characters standing/moving, solid and one-way geometry overlays, foreground on/off, and open/sealed door states. Full contact sheets expose every definition; native frame strips allow review of the animated pieces.

- **Seams:** all 96 compatible horizontal street-edge pairings pass exact boundary-pixel comparisons across variations. Native repeat modules join without scaling. Raised street sections use matching side/top adjacency. Foreground reflections remain below the walkable surface.
- **Scale:** every environment frame is opaque or transparent, on the declared palette and native dimensions; no partial-alpha raster edges. Per-scene zoom is whole device pixels. The UI is ordinary HTML typography outside that grid. The generated art contains no family-resizing transform.
- **Readability:** lower facade panels stay quiet behind hero silhouettes; brighter surface lips distinguish platforms from scenery. Large machine silhouettes remain behind the player. The alley uses a darker, less busy wall so the recess and door state can be read without a neon hideout sign.
- **Repetition:** three window/roof/scrap/terrain variations and two shutters/corners/pipes/posters soften repetition; different bay groupings and a machine pocket interrupt the street. Variations are explicit and stable in saved scenes, not randomized each frame.
- **Clipping:** the generator catches overflow on newly drawn pieces before cropping/export. It caught and led to fixes for the train window and a final masonry joint. Source machinery is extracted at recorded full native envelopes; the steam and press sequences remain within them. Scene boundaries intentionally crop repeating skyline/ground at the viewport, not individual sprites.
- **Traversability:** both layouts complete through normal movement/jump inputs, including landing on raised geometry, and end through the entrance's review interaction. Mini: 15.32 seconds; big: 15.18 seconds in the deterministic traversal checks. These are test timings, not mission duration targets. No combat, enemy gate, password or unseen prerequisite blocks completion.
- **Browser:** keyboard movement/jump/pause, mini crouch, hero selection, entrance sequence, search/filter/frame controls and DPR 1/2 rendering are checked. A hidden-tab sizing failure found during QA was corrected by deferring fitting until the scene has a visible width.
- **Protected work:** all 1,949 baseline source/art/gameplay/archive/backup files match their pre-task hashes. The four copied hero PNGs also match their source hashes exactly.

This is an art and placement preview, with a small movement harness. It does not replace the tested Recyke combat runtime. The inherited standing-run contact drift remains in unchanged hero animation; no gait or gameplay tuning was performed to hide it. The world art does not implement gravity, damage, collisions or doors by itself.

## Missing / deliberately deferred

- Moral Code symbol, password, banter, lock sounds/timing and elevator/hideout interior.
- A fuller diagonal/concave terrain-transition kit, slopes, ladders, fence/climb contacts and moving-platform physics.
- Independent alternate facade heights, dedicated interior corners and a larger facade window vocabulary. Current bays and roof/corner pieces suffice for this one short exterior study.
- Gameplay hazards for steam/press/conveyors, solid blocking doors and campaign transitions. Default machinery is decorative; no invisible damage is attached.
- Rain/weather, destructible buildings, deep prefab nesting, encounter design, checkpoints, pickups, inventory and all editor tools.
- New big Proposal A character art. The current request preserves approved artwork, so this preview uses unchanged historical big references rather than recoloring or scaling minis.

Recommended next review: compare street and entrance in both sizes, decide whether the amount of surface detail and the concealed door's visual states feel right, then extend only the chosen environment vocabulary. The underground hideout should be a separately scoped kit after its missing symbol/NPC/interior direction is resolved.
