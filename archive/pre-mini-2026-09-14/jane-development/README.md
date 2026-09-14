# CTRL ALT DEL

## Play Chapter One — Escape Skyview

[Play on phone or PC](https://freemarketwildlife.github.io/Ctrl-Alt-Del/) and choose **EPISODE 1**. Episodes 2 and 3 are locked. The 2,880-pixel scrolling run-and-gun level crosses six city blocks. Reach the midpoint checkpoint, defeat the armored gate mech, and enter the glowing extraction gate to win. Death retries from the checkpoint; the victory screen offers a fresh replay.

Input is automatic: touch shows the thumb controls; mouse and keyboard use PC controls. Supported mobile browsers request landscape/fullscreen on launch. If that is unavailable, the horizontal game viewport and separate thumb controls work in portrait without a rotation prompt. Drag the horizontal left-thumb pad, tap/hold JUMP for variable height, hold FIRE, and tap PUNCH. Optional AUTO FIRE and PAUSE are available. PC uses A/D or left/right, W/up to jump, Space/K to fire, and E to punch. Jump buffering and a short ledge grace period help avoid missed jumps.

Touch a glowing cyan/magenta energy orb to swap Jessie and Jane. Exit and re-enter the orb to swap again; health and power-ups carry over. Each defeated enemy independently rolls a **10% health drop** (+30 HP, capped at 100) and **5% power-up drop**. Power-ups last 15 seconds: Overdrive gives triple damage and faster fire; Shield reduces incoming damage by 70% before rounding. Collecting a new power replaces and refreshes the current one. The midpoint checkpoint restores health.

Mobile reference: [Playdigious on Dead Cells touch controls and optional automatic attacks](https://playdigious.com/news/sharpen-your-thumbs-dead-cells-is-now-slaying-foes-on-android). The implementation here uses original controls tailored to this game's two-dimensional movement.

The NEXUS FPS route remains available from the Concept Art footer or `play.html?mode=fps`. PC uses WASD, arrow-key turning, mouse look, Space/K fire and E punch; mobile uses the movement stick, right-side drag-to-look zone, and FIRE/PUNCH buttons.

## Concept Art codex

`codex.html` contains original animated studies: detailed Jessie and Jane anatomy sets, four field outfits, four flight vehicles, three mechs, three drones, three guns, two hoverboards and three environment studies. Filter by category, select a study, switch motion, slow playback, pause, step frames, turn sprites and export the current transparent PNG. Enlargements use integer pixel scaling; UI thumbnails are native 32px drawings.

Skyview's upper city is now a detailed 480×270 moonlit civic axis: a monumental senate complex, luxury garden apartments, senators, helpful human officers, flower planters and three lanes of flying-car traffic. Recyke is the opposing 480×270 night canyon: a moving public train passes a staffed recycling line that processes elite waste while robot patrols and sweeping cameras watch residents among stained towers, flickering signs, machinery, trash and steam. The existing industrial Skyview scene is retained as the visual midpoint between them. These art experiments do not replace gameplay enemies or weapons until selected for integration.

Jessie's rejected studies have been replaced by a fresh [big + mini workshop](jessie.html). Big Jessie uses a fixed 128×128 cell with a 96px standing height; mini Jessie is independently drawn in a 48×48 cell with a 32px standing height. Both share one grid in the comparison scene. `jessie.js` supplies ready, walk, run, fire, run-and-fire, jump, jumping fire, crouch, jab and hit-reaction poses. Exported sheets and frame timing are in `assets/jessie/`. See [the fixed standard](JESSIE-STANDARD.md) and mandatory [agent rules](AGENTS.md). Jane now has her own [big + mini workshop](jane.html) with all 14 animations, including a waving violet ponytail during her 12-pose run. Her 96px and 32px standing heights, native cells and feet anchors match Jessie. Her magenta jacket, face, limbs, weapons and hair are separately authored at each size. Compare both characters on one grid, inspect silhouettes and full hair sequences, and export native PNG sheets plus per-frame timing/hair metadata. See [Jane's standard](JANE-STANDARD.md). Gameplay character art and collision sizing remain legacy pending separate integration.

References: [SLYNYRD's city/mech study](https://www.slynyrd.com/blog/2025/11/28/pixelblog-59-tiny-sci-fi-pixels), [SLYNYRD's run-and-gun study](https://www.slynyrd.com/blog/2026/1/26/side-view-run-n-gun), and [Saint11's pixel-art tutorials](https://saint11.art/blog/pixel-art-tutorials/).

Run deterministic gameplay checks with `node tests/level-one.cjs`.

**Ctrl Alt Del** is a campaign game about Jessie and Jane taking down the NEXUS, an AI overlord who rules the world.

This is the dedicated development repository: `FreeMarketWildlife/Ctrl-Alt-Del`.

The project now has a menu-driven campaign shell and two playable Chapter One combat prototypes.

## Game pitch

A story-driven platformer shooter set in a dystopian state controlled by the **NEXUS**, an AI superpower. The world blends vaporwave neon, soft steampunk machinery, industrial city architecture, laser blasters, surveillance technology, robots, drones, and human enemies. There is currently no magic in the setting.

The two central protagonists are **Jessie** and **Jane**, both in their twenties, fighting against the system.

## Visual direction

- Cinematic pixel art rather than chibi pixel art.
- Human characters should read as adult human silhouettes with realistic proportions, expressed with as few pixels as practical.
- Vaporwave palette: cyan, magenta, purple, amber, deep navy and black.
- Soft-steampunk structures: pipes, rails, vents, industrial towers, smoke stacks and machinery blended with AI-era holographic technology.
- Menus should feel like a resistance broadcast hijacking a NEXUS-controlled screen.
- Animated wallpapers should use low-resolution parallax city scenes, steam, drone traffic, flickering windows, scan beams, holograms and subtle signal glitches.
- Pixel art should remain crisp and use nearest-neighbor scaling.

## Current prototype

Open `index.html` at the repository root to launch the playable prototype hub. No build step or dependencies are required.

For a local web server, run `python3 -m http.server 8000` from this folder, then open `http://localhost:8000`.

Implemented UI:

- Main menu
- Continue
- New Game
- Episode Select
- Chapter Select
- Options
- Extras
- Credits
- Animated low-resolution city wallpaper
- Adult-proportioned pixel silhouettes for Jessie and Jane
- Keyboard navigation
- Local save of selected episode/chapter and display settings
- Locked Episode III teaser
- Chapter One **run-and-gun shooter/platformer** with mobile movement, jumping, a laser blaster, punching, enemy waves and health
- Chapter One **Doom-style first-person shooter** with mobile joystick movement, drag-to-look, shooting, punching, robot AI and a minimap
- Mobile browser input lock that blocks text selection, long-press callouts, dragging, zoom gestures and overscroll during gameplay, with safe-area control spacing and automatic release of interrupted touches

The run-and-gun is the core campaign direction. The first-person mode is a secondary gameplay style that can appear when the story calls for it. The earlier one-on-one fighting-game experiment has been removed.

## Campaign structure

### Episode I — CTRL ALT DEL

10 chapters:

1. Intro
2. The Moral Code
3. First Strike
4. Breaking News In Skyview
5. Reaching Out
6. The Death of Jessie
7. Ctrl Alt Del
8. Aquire This!
9. The Countdown Begins
10. Never say Die

### Episode II — A GLITCH IN THE SYSTEM

12 chapters:

1. Here Goes Nothing
2. Activate Project Judas!
3. Mission Gone Wrong!
4. Janey Gets Hacked
5. A Glitch In The System
6. A Second Chance
7. Jessy Tells His Story (Remix (Chapter Ten: Never Say Die))
8. Evalyn is Taken, And The Plan To Get Her Back
9. In The Hallway
10. Interogation
11. Hand In Hand (GET OUT OF OUR WAY BILLY!)
12. Jessie and The Moral Code (Remix ( Chapter Two: The Moral Code))

The chapter titles above intentionally follow the released album track names, including their existing spellings.

### Episode III — CLASSIFIED

Chapter count and chapter names are intentionally unknown for now. The menu presents Episode III as a locked/incomplete transmission until the story is ready.

## Next development phase

The next phase is to turn Chapter One from a survival sandbox into a directed level with an opening story scene, checkpoints, a clear objective, Jessie/Jane teamwork, and an ending transition into Chapter Two.

## Repository migration

Migrated from `FreeMarketWildlife/Snake-Game-Test/ctrl-alt-del` at source commit `8d61f587cb10f8598781bd0f7c41b74ca6950d7b`. The game files now live at the repository root. The relevant game commit history was preserved by a Git subtree split (which rewrites commit IDs), and the new repository’s initial commit is retained. The original repository remains available as an archive of the shared development history.

## Legacy gameplay character art

Open `characters.html` (also linked from Field Intel) to inspect Jessie and Jane, select six animations, flip facing, pause, and export transparent PNG sprite sheets. `characters.js` is the shared integer-pixel renderer used in the studio, menu wallpaper, and run-and-gun prototype. Switch between Jessie and Jane using the in-game character button.

Native sprites occupy 40 × 40 cells. Exported sheets in `assets/characters/` contain eight frames in each of six rows: idle, run, jump, fire, punch, hurt. Run plays at 14 fps; other sheet animations at 8 fps. Gameplay attacks synchronize their animation to the attack timer. Collision height is 35 world pixels to match the adult silhouette; art remains one pixel per world unit.

Run-cycle reference: [Raymond Schlitter’s Side View Run N Gun study](https://www.slynyrd.com/blog/2026/1/26/side-view-run-n-gun). Original poses use planted contact, heel recovery, integer-pixel forward lean and a braced two-handed blaster hold. Firing while running preserves the leg cycle. Gameplay cadence follows distance traveled (42 world pixels per cycle). Studio controls include slow motion and frame stepping.

## Skyview environment and heavy mechs

`world.html` previews the original industrial city kit inspired by [Tiny Sci-Fi Pixels](https://www.slynyrd.com/blog/2025/11/28/pixelblog-59-tiny-sci-fi-pixels). `world.js` supplies the shared platform geometry and scenery for the run-and-gun: modular facades, roof vents, shutters, rail traffic, steam, pipes and illuminated deck edges. Art is drawn at native world scale.

Heavy NEXUS mechs now appear in the platformer enemy mix (22% per spawn). They have 7 HP, move at 13 pixels/second, charge visibly during the last half-second before firing, and fire a 22-damage shell about every 2.4 seconds. Contact deals 28 damage and does not destroy the mech. The existing player invulnerability window still applies. Smaller walkers and drones remain in the mix. The mech is an enemy, not a pilotable vehicle.
## PC play

Combat automatically chooses controls from the available input and switches when a touch, mouse or keyboard is used. No manual mode button is needed. PC controls are `A/D` to move, `W` to jump, `Space` to fire, and `E` to punch. The FPS route supports arrow keys or mouse movement over the game to look.

## Night Chase

Open `chase.html` from Concept Art to compare the side-view mission and an interactive rear-view perspective study. Play at `play.html?mode=chase`: Jessie pilots a hovercar through a nighttime city, fights patrol drones and interceptors, then defeats the blockade carrier to win. Enemy waves last 40 seconds; the carrier arrives at 42 seconds. The rear-view preview is an art/camera experiment, not a second playable mission.

Move with WASD or arrows on PC, or the two-axis touch stick on mobile. Auto fire starts enabled; Space/FIRE also shoots. E/SHIELD grants 2.2 seconds of protection with a seven-second cooldown. Pause and retry are supported. Portrait screens keep a horizontal playfield with controls beneath it.

`flight-art.js` supplies the original reusable hovercar, drones, interceptor, carrier, parallax skyline and rear-view city. The four vehicles are also inspectable in the Concept Art animation library. References: [SLYNYRD / Horizontal Shmup](https://www.slynyrd.com/blog/2026/7/26/pixelblog-63-horizontal-shmup) and [SLYNYRD / Anti-Gravity Racers](https://www.slynyrd.com/blog/2023/9/25/pixelblog-46-anti-gravity-racing-scene).

Run `node tests/flight-level.cjs` for movement, shield, pause, complete victory, defeat and retry coverage, and `node tests/level-one.cjs` for the ground campaign regression checks.

Jane verification: run `node tests/jane-motion.cjs` for anatomy/hair and
`node tests/jane.cjs` with Playwright for every pose, native exports, catalog and
workshop controls, mobile pixel grids, and unchanged Jessie pixels. Set
`UPDATE_ASSETS=1` to refresh `assets/jane/` from the verified renderer.
