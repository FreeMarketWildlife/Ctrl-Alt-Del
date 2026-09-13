# CTRL ALT DEL

## Play Chapter One — Escape Skyview

[Play on phone or PC](https://freemarketwildlife.github.io/Ctrl-Alt-Del/) and choose **PLAY LEVEL ONE**. The 2,880-pixel scrolling run-and-gun level crosses six city blocks. Reach the midpoint checkpoint, defeat the armored gate mech, and enter the glowing extraction gate to win. Death retries from the checkpoint; the victory screen offers a fresh replay.

On phones, play in landscape: drag the horizontal left-thumb pad, tap/hold JUMP for variable height, hold FIRE, and tap PUNCH. Movement, jump and fire support simultaneous touches. Optional AUTO FIRE attacks forward when enemies are nearby. PAUSE is available during play. PC uses A/D or left/right, W/up to jump, Space/K to fire, and E to punch. Jump buffering and a short ledge grace period help avoid missed jumps.

Touch a glowing cyan/magenta energy orb to swap Jessie and Jane. Exit and re-enter the orb to swap again; health and power-ups carry over. Each defeated enemy independently rolls a **10% health drop** (+30 HP, capped at 100) and **5% power-up drop**. Power-ups last 15 seconds: Overdrive gives triple damage and faster fire; Shield reduces incoming damage by 70% before rounding. Collecting a new power replaces and refreshes the current one. The midpoint checkpoint restores health.

Mobile reference: [Playdigious on Dead Cells touch controls and optional automatic attacks](https://playdigious.com/news/sharpen-your-thumbs-dead-cells-is-now-slaying-foes-on-android). The implementation here uses original controls tailored to this game's two-dimensional movement.

The NEXUS FPS route remains available from Prototype Lab. Its render loop is stable on both input modes: PC uses WASD, arrow-key turning, mouse look, Space/K fire and E punch; mobile uses the movement stick, right-side drag-to-look zone, and FIRE/PUNCH buttons. The FPS HUD and world render now continue while those controls are active.

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

## Animated character art

Open `characters.html` (also linked from Field Intel) to inspect Jessie and Jane, select six animations, flip facing, pause, and export transparent PNG sprite sheets. `characters.js` is the shared integer-pixel renderer used in the studio, menu wallpaper, and run-and-gun prototype. Switch between Jessie and Jane using the in-game character button.

Native sprites occupy 40 × 40 cells. Exported sheets in `assets/characters/` contain eight frames in each of six rows: idle, run, jump, fire, punch, hurt. Run plays at 14 fps; other sheet animations at 8 fps. Gameplay attacks synchronize their animation to the attack timer. Collision height is 35 world pixels to match the adult silhouette; art remains one pixel per world unit.

Run-cycle reference: [Raymond Schlitter’s Side View Run N Gun study](https://www.slynyrd.com/blog/2026/1/26/side-view-run-n-gun). Original poses use planted contact, heel recovery, integer-pixel forward lean and a braced two-handed blaster hold. Firing while running preserves the leg cycle. Gameplay cadence follows distance traveled (42 world pixels per cycle). Studio controls include slow motion and frame stepping.

## Skyview environment and heavy mechs

`world.html` previews the original industrial city kit inspired by [Tiny Sci-Fi Pixels](https://www.slynyrd.com/blog/2025/11/28/pixelblog-59-tiny-sci-fi-pixels). `world.js` supplies the shared platform geometry and scenery for the run-and-gun: modular facades, roof vents, shutters, rail traffic, steam, pipes and illuminated deck edges. Art is drawn at native world scale.

Heavy NEXUS mechs now appear in the platformer enemy mix (22% per spawn). They have 7 HP, move at 13 pixels/second, charge visibly during the last half-second before firing, and fire a 22-damage shell about every 2.4 seconds. Contact deals 28 damage and does not destroy the mech. The existing player invulnerability window still applies. Smaller walkers and drones remain in the mix. The mech is an enemy, not a pilotable vehicle.
## PC play

Combat automatically starts in PC mode on mouse and keyboard devices. Use the `PC MODE ON` button to toggle PC and touch controls. PC controls are `A/D` to move, `W` to jump, `Space` to fire, and `E` to punch. The FPS route also supports arrow keys or mouse drag to look.
