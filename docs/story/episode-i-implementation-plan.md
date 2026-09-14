# Episode I implementation plan

Status: planning only. No campaign implementation is authorized by this document.
Prepared from the saved designer material and a read-only prototype inspection on
September 14, 2026 (UTC). Jane/Janey and Jessie's final artwork and animation delivery
remain **PENDING — owned by the separate character task**.

## Recommendation and scope

Build **Chapters 1–2: the Recyke arrival and Moral Code induction** first, ending
with the leader's supplied welcome. Include a small, explicitly proposed training
sequence to make this a useful playable opening. It provides an introduction,
player control, a short learning loop and a definite ending without requiring the
Hub mission, branching routes, flight, stealth or server destruction.

This document covers all ten chapters, reuse candidates, missing sources, action
requirements and implementation order. It is the dedicated planning artifact;
character files, motion modules, assets, gameplay, other documents, art standards,
archives and original backups are outside its edit scope.

**Mini models are the only production family for every model.** Follow the current
[workspace instructions](../../AGENTS.md): native humanoid cells 48×48, standing
height 32px, feet anchor (20,40), one source pixel per world unit, and whole-scene
zoom in whole device pixels. Equipment, vehicles, enemies and environments must be
authored for that family; a cruiser need not fit a humanoid cell. No reuse plan here
permits shrinking a large model, enlarging individual sprites, restoring archived
models or continuing their development. The archive is historical, not a runtime
dependency. Use 480×270 as the proposed opening viewport, matching active Recyke.

## Authority and interpretation

- **Source:** [organized designer reference](lead-designer-reference.md) and
  [verbatim original](lead-designer-original.txt). The original controls exact
  wording, including oath spelling and punctuation. No album was supplied or audited.
- **Naming:** narrative “Janey” maps to prototype `jane` / Jane. This is not a file,
  identifier or character-standard rename. Preserve “Aquire this!” as supplied.
  Chapters 6 and 9 have no supplied titles; existing menu labels are provisional
  catalogue labels, not recovered source titles.
- **Source requirement** means a beat explicitly described in the outline.
  **Proposal** means an implementation recommendation requiring later design
  agreement. **MISSING** means source content or an unresolved design specification.
  **PENDING ART** means the separate character delivery must be reviewed; the
  existence of an action name is not proof of finished art or gameplay support.
- Prototype text, locations, powers and menu labels do not add canonical lore.
  Earlier reference notes about appearance remain historical; current mini-only
  direction applies. Although current workshop notes report a Proposal A release,
  this plan follows the user's instruction to treat final hero artwork as pending.

## Chapter requirements

Each chapter separates described events from proposed staging. Required actions
are requests for eventual coverage, not claims that the animation task includes them.

### 1. Intro

| Area | Requirement |
| --- | --- |
| Cutscenes | Jessie and Janey walk and banter on Recyke's main street; turn into an alley; give a password at a concealed entrance; several locks turn; door opens and they enter. Music peaks as camera rises to skyline and title credits appear. |
| Playable sections | None specified. Keep this scripted for the first build; making the walk playable would be an additional proposal. |
| Objective and exit | Narrative objective: bring the pair to the hidden entrance. Finish the title reveal, then transition inside for chapter 2. No combat or password puzzle is specified. |
| Environments and props | Main-street strip, alley, concealed door and lock assembly, skyline/title framing. New mini scene layouts; street and skyline can share Recyke background elements. |
| Characters and actions | Janey and Jessie: paired walking, stopping, turning, conversational staging and doorway entry. A password recipient is implied but need not be shown as a new character; identity is unspecified. |
| Mechanics and reuse | New scene sequencer, camera rise, actor paths, door/lock events, subtitle and music cues. Reuse mini rendering/grid, existing walk action interfaces subject to pending delivery, and selected Recyke scenery. The current gameplay camera follows horizontally; the title rise needs new staging. |
| Missing source | **MISSING:** banter, password, reply if any, doorway keeper identity, exact music/credit timing, opening-credit text and concealed-entrance design. Use explicit missing-content markers, not invented conversation or a guessed password. |

### 2. The Moral Code

| Area | Requirement |
| --- | --- |
| Cutscenes | Rusty elevator descent; Jessie comforts Janey. They enter a well-kept room made from recycled parts. Hooded figure calls “Recruit! Step forward.” After the player approaches, perform the supplied oath. Music swells before the final answer; lyrics imply acceptance. End with “Welcome Recruit, to The Moral Code!” |
| Playable sections | Required: walk Janey to the figure. Suggested by source, not mandatory: training during the song. First-build proposal: a short movement/jump, item-use and shooting tutorial after the oath's acceptance beat. |
| Objective and exit | Approach the leader; if training is included, complete its tasks and reach the welcome. Membership is a fixed story outcome; no refusal branch is specified. |
| Environments and props | Elevator cabin and landing; meeting room with leaking pipes, puddles, flickering news holograms, program monitors, recycled furnishings and wall-symbol location. Proposed compact training area within the same room layout; source provides no training geography. |
| Characters and actions | Janey: walk, stop, face/listen/respond; proposed jump/land, collect/use item, aim/fire. Jessie: descend, comfort and accompany. Hooded leader: beckon and address recruit; background observers: watch/idle. Specific comfort gestures and oath poses are unspecified. |
| Mechanics and reuse | Proximity interaction and control handoff are new. Use exact source oath text, retaining “Nexis”; do not supply a spoken third “I Do.” Reuse Recyke movement, platforms, pickups, projectiles, pause/input handling and mini draw interfaces. Objective-gated training, safe targets and music-to-task synchronization are new. Blocking requires its own behavior and action specification if included. |
| Missing source | **MISSING:** elevator conversation, symbol, identities/appearance of leader and observers, hologram/news/program content, lyrics, recording/cue sheet, training tasks and pass conditions. Design decision: handling early/late task completion relative to music. Source oath questions, first two replies, invitation and welcome are available verbatim. |

### 3. First Strike

| Area | Requirement |
| --- | --- |
| Cutscenes | Opening beat: Jessie has already installed a device in the Hub's main operating system; cooling failure and alarms begin; Janey reviews objectives. Proposed scripted briefing and transitions. Source ending: reunion and escape to wrecking-yard cruiser, takeoff as Hub explodes, then Jessie tells Janey to hide at her parents' Skyview home. |
| Playable sections | Jessie route: fight through several rooms, disable secondary controls before time expires, fight a head of security and exit. Janey route: fight toward module; security attack forces retreat before recovery; test several doors for the only unlocked one; reunite with Jessie and follow his directions out. Route selection/switching structure is unresolved. |
| Objective and exit | Jessie must disable secondary systems; Janey attempts recovery but **must leave the module behind**. Both reach the cruiser. The module outcome persists into chapter 4 regardless of route chosen. Do not offer a successful recovery branch that silently removes the later attack's cause. |
| Environments and props | Hub core, secondary controls, separate room chains, module location, security encounter space(s), locked/unlocked doors, reunion hall, street to wrecking yard, cruiser exterior/interior and Hub destruction view. Room counts/layouts are missing. |
| Characters and actions | Both heroes: combat movement/fire/hurt, operate controls/doors, run, rendezvous and board cruiser. Jessie: guide Janey. Janey: forced retreat. Head(s) of security: attack and encounter resolution; count, identity and whether human or robotic are unspecified. |
| Mechanics and reuse | Reuse Recyke combat, collision, patrol telegraphs, checkpoint concepts and enemy adapters. New timed multi-room objectives, terminal/door interactions, route progression, forced-retreat event, companion guidance, evacuation and explosion sequence. Prototype instant hero swap is not a dual-route system; generic Bastion gate logic is only an encounter scaffold, not an approved security chief. |
| Missing source | **MISSING:** album track 3 exact dialogue, briefing wording, guidance lines, device/module identity and relationship, how the module enables tracking, controls interaction, timers and timeout outcomes, route-selection format, security chief design, cruiser design/ownership details for this departure, room layouts and music cues. Do not equate the installed device, module and Moral Code's code. |

### 4. Breaking news in sky view

| Area | Requirement |
| --- | --- |
| Cutscenes | Father's house party; he talks down to Janey about Jessie from Recyke. Guest asks for the TV news. Newscaster warns of a fatal Nexus drone/robot attack on Recyke and advises uninvolved people to leave. Proposed staged dialogue/news sequence. |
| Playable sections | Janey runs from the party to her own cruiser. No combat, pursuit, father confrontation mechanic or driving section is specified here. |
| Objective and exit | Reach the cruiser and depart to rescue Jessie. Preserve the causal link: module left behind → Jessie's location tracked → Nexus attacks Recyke. The exact way the player learns that link is missing. |
| Environments and props | Skyview parents' house, party/TV room, route to parking or landing area, Janey's cruiser. Skyview exterior studies are visual references only; the house interior and path are new mini environments. |
| Characters and actions | Janey: converse/react, turn, run, board. Father: converse; guest: call attention to news; partygoers: background presence; newscaster: on-screen delivery. Mother's presence is not specified. |
| Mechanics and reuse | Reuse movement, camera/input handoff and scene systems built for chapters 1–2; new broadcast playback, departure objective and vehicle-entry trigger. Escape Skyview's combat map, transformation orbs and “liberation” ending do not implement this chapter. |
| Missing source | **MISSING:** album father/daughter dialogue, exact news and guest lines, party cast/design, house layout, departure staging, causal-reveal wording and musical timing. Father's Nexus employment and disapproval are supplied; his role in ordering the attack is not. |

### 5. Reaching Out

| Area | Requirement |
| --- | --- |
| Cutscenes | Takeoff/arrival can be short transitions; the source does not require a separate cinematic. Rescue intent is supplied; extra dialogue is missing. |
| Playable sections | Janey pilots toward Recyke, destroys Nexus flight drones, avoids hits, flies through propaganda hologram signs for boost and through gun power-ups for new cruiser weapons. |
| Objective and exit | Reach Recyke to try to rescue Jessie, then enter chapter 6's events. Proposed destination trigger; a mandatory flight boss is not specified. |
| Environments and props | Skyview-to-Recyke aerial corridor, city layers, propaganda sign volumes, weapon pickups and approach to the attacked building. New native-mini vehicle/flight presentation is required. |
| Characters and actions | Janey: pilot/steer, fire, react to hits; cruiser: movement/bank, boost and weapon discharge. Flight drones: patrol/approach, attack, hurt and destruction. |
| Mechanics and reuse | Adapt Night Chase movement, projectiles, waves, damage, pause/retry and input. Add boost triggers, boost behavior, weapon acquisition/switching and arrival objective. Its Jessie-to-Skyview route, rechargeable shield, carrier boss and win text are prototype choices, not requirements. Mini drone renderers are candidates after flight-scale/collision review. |
| Missing source | **MISSING:** route length/layout, flight perspective, cruiser specification, sign artwork and propaganda words, boost duration/effect, weapons and pickup rules, enemy mix, tuning, music and arrival staging. No prototype vehicle identity is adopted as canon. |

### 6. Untitled in the supplied outline

| Area | Requirement |
| --- | --- |
| Cutscenes | Jessie works at a computer with code operatives in a multistory building. Missile strikes and throws him. After playable escape, Janey arrives and calls; Jessie reveals himself, runs toward her and is shot and killed. Janey flies away. Stage the fatal event as a fixed narrative outcome, distinct from ordinary player defeat. |
| Playable sections | After regaining consciousness, guide Jessie to the exposed hole where a wall stood, avoiding detection by invading robots. |
| Objective and exit | Reach the opening unseen; trigger the rescue attempt and Jessie's death; transition to Janey's escape. Success at stealth does not save Jessie. |
| Environments and props | Workroom/computers, other floors suggested by building exterior, impact damage and debris, robot approach/cover layout, exposed opening and cruiser rendezvous space. These are new layouts; generic machinery alone is insufficient. |
| Characters and actions | Jessie: computer use, look up, blast displacement, fallen/unconscious state, recovery, concealed movement, reveal/run, gunshot reaction and death/settle. Janey: pilot, call/react, escape. Operatives: work/react, outcomes unspecified. Robots: invade/search/detect/fire. Shooter identity is unspecified. |
| Mechanics and reuse | Reuse movement, collision and projectile line-of-sight geometry as low-level candidates. New detection/visibility rules, stealth feedback, cover semantics, suspicion/alert or immediate detection decision, retry checkpoint and coordinated cinematic control. Existing enemy targeting is not a complete stealth system; hurt is not a death animation. |
| Missing source | **MISSING:** title, building identity/layout, operative identities/fates, shooter, exact call/dialogue, detection rules and failure outcome, injury/recovery choreography and musical timing. Menu label “The Death of Jessie” is not a supplied chapter title. Do not invent survival, resurrection or an alternate rescue ending. |

### 7. Ctrl Alt Del

| Area | Requirement |
| --- | --- |
| Cutscenes | No standalone cutscene specified. Propose brief escape-to-flight and arrival transitions without adding dialogue. |
| Playable sections | Janey flies toward the regional server, shoots drones, avoids hits, collects boosts through propaganda holograms and new weapons through fly-through gun pickups. |
| Objective and exit | Reach the regional server perimeter for chapter 8. This is a second authored route using the same flight systems as chapter 5. |
| Environments and props | Recyke-to-server aerial corridor, signs/pickups, server skyline and arrival area. Shared city/flight kit; new route and destination composition. |
| Characters and actions | Janey piloting; cruiser steering/boost/fire/hit responses; drone attack/destruction. Jessie is no longer a playable companion. |
| Mechanics and reuse | Reuse the completed chapter 5 flight mode. New route data and progression transition. Decide whether health, weapons and boost state carry across chapter 6; prototype restart logic does not answer this. |
| Missing source | **MISSING:** server location and travel geography, route/pacing, propaganda text, weapon carryover, enemies, music and arrival staging. No distinct boss, new vehicle power or revenge speech is specified. |

### 8. Aquire this!

| Area | Requirement |
| --- | --- |
| Cutscenes | No standalone cutscene specified; the fence climb and rear bat strike are explicitly player-assisted. Proposed short interaction-controlled sequences may handle them, but should preserve player initiation. |
| Playable sections | Climb perimeter fence, strike down the robot facing away with a bat, enter and fight through to the regional server hub. |
| Objective and exit | Breach perimeter and reach the hub, handing off to chapter 9's hack. |
| Environments and props | Server perimeter/landing area, climbable fence, guard position and entry, combat rooms and server hub. Build an intact server kit that can also support chapter 9's escape route. |
| Characters and actions | Janey: climb/mount/traverse/dismount fence, hold and swing bat from behind, enter, combat. Robot: back-facing patrol/idle, bat impact and collapse; interior enemy mix unspecified. |
| Mechanics and reuse | Reuse ground movement/combat, enemies and encounter gates. Add climb interaction, collision handoff, bat equipment/contact window and rear-hit resolution. Jump does not prove fence-climb coverage; jab does not prove bat coverage. Mini ground robots are candidates without declaring an archetype canonical. |
| Missing source | **MISSING:** fence and room layouts, bat origin/equip state, whether rear strike is lethal or disabling, guard identity/behavior, climb controls, stealth requirement beyond the described approach, interior enemy roster and music. |

### 9. No separate title supplied

| Area | Requirement |
| --- | --- |
| Cutscenes | Janey hacks the regional server; whether this is cinematic, a simple interaction or a playable hack is unspecified. Proposed minimum: a clearly initiated terminal interaction. Escape culminates in building explosion; exact shot/transition is missing. |
| Playable sections | Escape before timer expires, fighting robots and drones. Steal guns from downed robots, spend limited ammunition, discard depleted weapons and obtain replacements. Other power-ups are mentioned without detail. |
| Objective and exit | Complete the hack, leave before destruction, then transition to chapter 10. Establish timer start and successful escape boundary as design decisions. |
| Environments and props | Chapter 8 server hub/interiors, escape path, downed-robot weapon drops, exit and destruction view. Reuse geometry where readable; escape blockages/damage variants need design. |
| Characters and actions | Janey: terminal use, run/jump/combat/hurt, pick up/equip/fire/discard stolen guns. Robots/drones: attack, destruction and readable loot state. |
| Mechanics and reuse | Reuse ground combat and chapter 3 timer/escape framework; pickups offer collision/UI scaffolding only. New per-weapon ammo, weapon ownership/equip state, discard/replacement loop and ammo HUD. Current unlimited base shooting and generic health/scrap pickups do not satisfy it. Avoid an infinite-ammo fallback that bypasses the required scavenging loop. |
| Missing source | **MISSING:** title, hack content and technical effect, relation to the oath's code, timer value/start point, expiry/retry rules, exit location, ammo counts, weapon types, drop guarantees, depleted-gun controls, other power-ups and music. “The Countdown Begins” is a menu label only. |

### 10. Never say Die

| Area | Requirement |
| --- | --- |
| Cutscenes | Janey stands on a rooftop overlooking the city, vows to Jessie's memory to continue fighting Nexus, and end credits play. |
| Playable sections | None specified. |
| Objective and exit | Deliver the vow and complete Episode I. Proposed return-to-menu/replay endpoint after credits. |
| Environments and props | Rooftop foreground and city panorama; skyline kit can recur, but this rooftop/location is not identified in the source. |
| Characters and actions | Janey: stand, look over city and deliver vow; exact gesture is unspecified. Jessie is remembered, with no ghost, hologram or flashback specified. |
| Mechanics and reuse | Reuse scene/camera/subtitle/music/credits systems from opening, plus new final composition and episode-complete persistence. |
| Missing source | **MISSING:** exact vow, closing lyrics/audio/timing, rooftop identity and final credits. Keep the source's “Jessy” spelling in its verbatim record; no new lore or appearance follows from it. |

## Prototype comparison and reuse decisions

This is a static inspection of the files linked below, not a fresh gameplay or art
certification. Most development folders contain copies of the same prototype files;
they are not four completed campaigns. Use Recyke as the planning baseline and the
separate character task's eventual approved handoff for hero dependencies.

| Existing material and evidence | Reusable contribution | Gap or restriction |
| --- | --- | --- |
| [Recyke simulation](../../recyke-development/recyke-level.js), [presentation](../../recyke-development/recyke.js), [mini entry](../../recyke-development/recyke.html) | Active 480×270 mini route; movement/jump buffering/coyote time, platforms, projectile collision/cover, melee, aim assist, six enemy archetypes, health/scrap pickups, checkpoint/retry, exit gate, pause and keyboard/touch controls. Best basis for chapters 2–4, 6, 8–9. | First Shift is Sorting Row → Line 7 depot, not any complete designer chapter. Its eight-enemy combat route is not the induction tutorial. Simulation/map/objectives are coupled and need future separation. `setHero` swaps one actor while retaining position/health; it does not simulate two characters in different rooms. Checkpoint state is in memory, not a campaign save. |
| [Recyke scenery/adapters](../../recyke-development/recyke-art.js), [pixel grid](../../recyke-development/pixel-grid.js) | Mini street/industrial vocabulary: train, tenements, workshops, bins, presses, boilers, steam, conveyors; native draw adapters, integer scene zoom and raster conventions. Best fit for Recyke exteriors, recycled-room props and wrecking-yard dressing. | New narrative layouts, doors, elevator, meeting room, Hub, house, damaged building and server are still needed. Reusing a prop does not establish story geography. Only active mini geometry is a candidate. |
| [Shared mini review](../../mini-review/README.md), [Jane interface](../../recyke-development/jane.js), [Jessie interface](../../recyke-development/jessie.js); character workspaces [Jane](../../jane-development/AGENTS.md) and [Jessie](../../jessie-refinement/AGENTS.md) | Named mini action interfaces and fixed native contracts; review facility for eventual integration. | **PENDING ART.** No completeness claim about the concurrent task. Review/catalog availability does not implement interactions, companion behavior or cinematic choreography. Do not edit or copy a moving character baseline during planning. |
| [Ground enemies](../../enemy-development/enemy-mechs.js), [drones](../../enemy-development/enemy-drones.js), [enemy rules](../../enemy-development/AGENTS.md) | Sentinel, Bastion, Scrapper; Watcher, Manta, Collector. Ground idle/walk/run/charge/fire/run-fire/melee/jump/hurt/death; drone idle/patrol/rush/charge/fire/hurt/death. Recyke already integrates mini versions. | Candidate encounter actors only. Security chief identities, invading-robot stealth AI, rear takedowns, disarmable weapons and campaign flight balance are not supplied by these action lists. |
| [Escape Skyview](../../recyke-development/level-one.js), loaded through [prototype launcher](../../recyke-development/prototypes.js) | Historical directed run-and-gun example with platforming, enemy drops, health, timed shield/overdrive, checkpoint and boss-gated extraction. Useful implementation references for pickup feedback and encounter flow. | Its “Chapter 01” label conflicts with designer Intro. It starts as Jessie, uses transformation orbs and ends “Skyview liberated.” Those are not source requirements. It uses legacy `CADCharacters`/`CADWorld`, not the active mini hero integration. Prefer Recyke as the runtime base; do not port old figures or silently inherit power rules. |
| [Night Chase simulation](../../recyke-development/flight-level.js), [flight rendering](../../recyke-development/flight-art.js) | Existing side-view cruiser movement, shooting, waves, hits, pause, auto-fire and defeat/retry. Strong logic reference for chapters 5 and 7. | Hardcoded Jessie → Skyview with rechargeable shield and carrier boss. No fly-through boosts or weapon pickups. Legacy cruiser visibly embeds Jessie and flight models are not approved mini masters. Review/re-author native mini vehicle/world presentation; do not scale historical art into compliance. |
| [Chase previews](../../recyke-development/chase.js), [Skyview world study](../../recyke-development/world.js), [legacy combat/FPS studies](../../recyke-development/prototypes.js) | Visual composition references; FPS study has raycasting/line-of-sight concepts. | Rear flight is a preview with a steering slider, not a playable second flight mode. FPS is not required by this outline. No basis to switch server interiors to FPS or adopt legacy narrative/appearance. |
| [Catalogue/menu data](../../recyke-development/app.js), [play menu](../../recyke-development/play.js) | Ten-slot chapter order, navigation and menu-state ideas. | `app.js` launches a gameplay-placeholder toast; `play.js` launches historical prototypes. The active [index](../../recyke-development/index.html) redirects to mini Recyke. Chapter selection and stored menu indexes do not implement chapter sequencing, checkpoints, album synchronization or narrative state. |
| [Recyke simulation checks](../../recyke-development/tests/recyke-level.cjs), [browser checks](../../recyke-development/tests/recyke-browser.cjs), [flight checks](../../recyke-development/tests/flight-level.cjs) | Existing verification patterns for normal-input completion, pause, retry, touch and flight movement/win/loss. | Not executed for this documentation task. They do not certify story accuracy, pending art, new scenes or required campaign mechanics. Adapt future checks to the actual chapter objectives. |

**Stale documentation found:** [RECYKE-LEVEL.md](../../recyke-development/RECYKE-LEVEL.md)
still describes Big/Small routes, and legacy menu/presentation strings mention other
sizes. Current root/development instructions, mini entry and simulation force minis.
These older descriptions do not authorize large-model reuse; they remain untouched
because this task edits only the dedicated plan.

## Character action requirements and handoff

The inspected catalog names are Jane: idle, stand, walk, run, fire, run-fire, jump,
jump-fire, crouch, jab, cross, front-kick, round-kick, hurt; Jessie: idle, walk, run,
fire, run-fire, jump, jump-fire, crouch, jab, hurt. All final hero artwork is pending.
Recyke's gameplay drives a subset; for example, a catalogued crouch is not proof of
playable crouching or stealth. None of the additional actions below is presumed to
be in the ongoing character task.

| Required coverage | Chapters | Handoff or implementation gap |
| --- | --- | --- |
| Both heroes walk/run, stop/turn, jump/land, aim/fire while stationary/moving/airborne, melee, hurt | 1–3; Janey 4, 8–9; Jessie movement in 6 | Catalog candidates exist, pending final review. Walk-speed staging and synchronized paired paths differ from combat running. Bind contacts and gameplay timing to approved contracts. |
| Listening, speaking, comforting, responding to oath, reacting to news and loss | 1–4, 6, 10 | Staging/action coverage missing; decide where existing idle/walk poses suffice before requesting new animations. Do not assume lip sync or bespoke gestures are required. |
| Blocking | Optional training in 2; later use unassigned | No block action or player block mechanic found in inspected Recyke/catalogs. Crouch, invulnerability after damage and prototype shield powers are not blocking. |
| Operate door/terminal, handle module if shown, board cruiser | 3–4, 9; doorway staging in 1 | Interaction poses/contact points, equipment state and sequencing need specification. Source begins after device installation; a playable installation action is not required. |
| Pilot, bank, boost, fire cruiser weapons, react inside cruiser | 3–7 | Native mini vehicle/cockpit coverage missing or unverified. Distinguish vehicle motion from humanoid animation. |
| Computer work, blast knockback, unconscious hold, get up, concealed locomotion, reveal/run, fatal shot and settled death | Jessie in 6 | New/unverified action and staging requirements. Existing hurt/jump/crouch names are insufficient evidence. Stealth may use ordinary walking if design allows; crouch-walk is not explicitly specified. |
| Fence climb and dismount; bat hold, windup, rear strike, follow-through | Janey in 8 | New/unverified climb and equipment actions, contact timing and collision transitions. Do not substitute jump/jab without design agreement. |
| Pick up/equip/fire/drop robot guns | Janey in 9 | Weapon-specific attachment, grip/muzzle and ammo-state behavior; catalogue pistol fire alone is insufficient. |
| Rooftop stand and vow | Janey in 10 | Idle/stand candidate plus authored staging; gesture and dialogue missing. |

New mini NPC coverage is also required for the hooded leader, observers, father,
party guests, newscaster and code operatives. Determine minimal shared background
poses later; do not assign names, ranks, uniforms or fates absent from the source.

Before future integration, obtain the separate task's approved mini delivery and
compare it against this table. Record each action as available, staged using existing
poses, or needing a separately scoped addition. Preserve existing action coverage,
frame counts/timing, contacts, ponytail links and APIs. This plan does not request
edits from or expand the scope of the animation task.

## Episode-wide systems and unresolved mechanics

The inspected prototypes do not provide a complete scene runner, branching campaign,
album timeline, inventory/progression system, stealth mission or weapon-scavenging
loop. The following are proposed implementation boundaries, not changes made now.

| System | Proposed responsibility | Decisions still needed |
| --- | --- | --- |
| Scene and chapter flow | Explicit cutscene/playable handoffs, subtitles, camera/door events, objectives, completion and replay. Keep story events separate from animation playback. | Skip/resume behavior, save boundaries, music sync and retry policy. |
| Narrative state | Track induction, chapter 3 outcome, module left behind, rescue attempt/Jessie death, server hack and episode completion. Fixed story beats must survive skip/retry without duplicating events. | Route selection vs sequential routes vs switching in chapter 3; chapter selection/spoiler policy. Prototype hero swap is not authorization for co-op or transformations. |
| Ground objectives | Approach/interact triggers, room transitions, terminal/door state, encounter gates and evacuation timers. | Room maps, timers, failure rules, guidance and checkpoint placement. Timers must respect pause and retry decisions. |
| Flight | One common mode with separately authored routes for chapters 5 and 7; boosts and weapon pickups. | Perspective, mini vehicle kit, tuning, route lengths, carryover and arrival conditions. |
| Stealth | Visibility/cover rules and readable detection, plus a retryable chapter 6 approach ending in a fixed cinematic death. | Detection consequence and feedback; combat permission during approach is unspecified. |
| Equipment | Ammo-bearing stolen guns, equip/discard/drop interactions, later character gadgets and capacity. | Gear availability by chapter, controls, ammo economy and progression. Avoid making unassigned powers prerequisite to a route. |

The character brief also requires eventual design work beyond chapter-specific verbs:

- **Janey:** grenades, laser pistol, hologram copy for **30 seconds** to double
  damage, recharge after **MISSING X** enemy kills; backpack holds **MISSING X**
  items including health refills. Recyke's immediate health pickup does not implement
  a carried item or backpack. Copy behavior, grenade rules and chapter unlocks are missing.
- **Jessie:** larger pistol fires **three successive rounds per trigger pull**;
  short-duration hoverboard can ram multiple enemies; watch pulse lasts **30 seconds**
  and stuns enemies entering its field, recharging after **MISSING X** kills.
  Current generic single-shot firing is not the required burst system. Hoverboard
  duration, pulse radius/stun behavior, controls and unlock placement are missing.
- **Progression:** levels unlock abilities/gadgets and backpack capacity. Thresholds,
  rewards, chapter placement and whether this extends beyond Janey are **MISSING**.
  Prototype scrap counts, transformation orbs, overdrive and flight shield must not
  be treated as substitutes. None is required for the recommended opening.

## Smallest complete opening to build first

### Proposed playable scope

One connected chapter 1–2 experience, one player-controlled hero (Janey), Jessie
as a scripted companion, one hooded leader and a small background observer group.
Use one Recyke street/alley set, one elevator transition, and one meeting/training
room. Target roughly **4–6 minutes for an internal first pass**, subject to the
missing album's actual duration; this is a planning estimate, not musical canon.

1. **Arrive:** scripted street walk, alley/entrance, locks and skyline/title reveal.
2. **Descend:** elevator scene and meeting-room reveal, with missing conversation
   visibly tracked in the internal content checklist.
3. **Approach:** leader's supplied invitation; hand control to Janey to walk to
   the leader. Trigger the verbatim oath; the third response remains a missing lyric
   cue, not a newly written spoken answer.
4. **Train — proposed subset of the optional source suggestion:** cross one low
   platform, collect a demonstration health item, and fire at a safe practice target.
   Include short functional control prompts. The target and demonstration health
   setup are new tutorial design proposals, not source lore. No inventory menu,
   real enemy encounter or mandatory melee is needed. Define how a full-health
   player completes the item demonstration so the existing pickup rule cannot stall it.
5. **Conclude:** play the supplied welcome and reach an opening-complete screen
   with replay/return options. Do not launch an unimplemented chapter 3 or claim
   Episode I is complete.

Blocking is an example in the optional training suggestion. Defer it from this
smallest build because both its mechanic and action coverage are unverified; record
the tutorial as a reduced proposed subset, not the full training design. The
absolute minimum source-required interactivity is simply walking to the leader;
the three short exercises are recommended to make the opening useful as a gameplay
foundation. They can be removed if strict minimum scope is preferred later.

### New work versus reuse

Reuse Recyke's mini rendering/input/grid and selected movement, platform, projectile
and pickup logic. Create a separate opening scene/map definition, source-text/cue
slots, proximity objectives, scripted companion paths, door/elevator/camera events,
practice-target behavior and a completion endpoint. Do not import First Shift's
enemy roster, depot victory condition, swap button or repair-station fiction into
the induction. The simulation currently assumes a gate enemy when resolving its
exit, so an enemy-free training room needs a real objective/exit adaptation, not
just an empty enemy list.

Defer First Strike, route selection, all flight, bosses, gadgets, progression,
stealth, fence climbing, bat combat and stolen guns. Those remain in the full
Episode I backlog above. The opening does not need a fabricated mission briefing
or teaser dialogue to end coherently at the welcome.

### Completion gates

- **Internal structural completion:** the entire opening has a start, playable
  handoffs, finite tutorial goals, welcome and replayable end. Missing-source slots
  can be explicit internal cards such as `[MISSING: CH1 PASSWORD]` or
  `[MISSING: CH2 LYRIC / AFFIRMATION CUE]`; do not portray them as finished dialogue.
  Temporary timing must be labeled and must not be reported as album-synchronized.
- **Source-complete presentation:** requires supplied opening banter/password,
  elevator dialogue, symbol/background text decisions, album/lyrics/cue sheet and
  credits. Resolve the third-vow musical answer and early/late tutorial timing before
  calling the sequence faithful to the recording.
- **Art completion:** requires approved final Jane/Janey and Jessie mini handoff,
  reviewed action coverage, new mini NPC/environment/door/elevator assets and coherent
  native scale. Existing files do not satisfy this gate merely by being present.
- **Future functional checks:** finish with ordinary keyboard and touch input;
  pause/resume and lost-focus input clearing work; approach/task triggers fire once;
  full-health item handling cannot deadlock; skip/replay does not strand control or
  duplicate induction; scene transitions preserve the mini grid. Review art and text
  separately from simulation completion.

## Build order after the opening

| Milestone | Scope and dependency | Definition of completion |
| --- | --- | --- |
| 1. Opening | Chapters 1–2 as above; resolve opening source slots and pending art handoff. | Full arrival-to-welcome experience; internal and final-content gates reported separately. |
| 2. First Strike | Chapter 3, using ground/scene systems. Decide route format and module outcome first. A Janey-route internal pass is a useful proposal because it exercises the causal failure; it does not complete Jessie's route requirement. | Both outlined routes supported in the agreed format, reunion/timed escape/cruiser ending work, module remains behind in every supported story path. |
| 3. Rescue approach | Chapter 4 departure and chapter 5 flight; establish the common mini flight system. | Party/news → run to cruiser → fly to Recyke, including sign boosts and new-weapon pickups; no prototype route/story substitution. |
| 4. Failed rescue | Chapter 6, after stealth design and Jessie action/staging coverage are resolved. | Retryable unseen approach and fixed rescue/death/escape sequence, with ordinary detection failure distinguished from the story outcome. |
| 5. Server assault | Chapter 7 reuses flight; chapters 8–9 share server spaces. Resolve climb/bat and finite-ammo/hack/timer loops. | Arrival → player-assisted breach → hub → hack → weapon-scavenging escape → destruction. No ammo dead end or timer softlock. |
| 6. Episode closure | Chapter 10 plus cross-chapter persistence, source/audio integration and review. | Rooftop vow/credits and a complete ten-chapter playthrough, with pending source/art items resolved before final signoff. |

## Missing-source register

Keep these items open rather than filling them with prototype lore. The relevant
chapter tables provide the detailed interaction/design gaps.

| ID | Missing input | Affects | Needed before |
| --- | --- | --- | --- |
| M01 | Opening banter, password, elevator comfort dialogue, opening/final credits | 1–2, 10 | Final scripted presentation |
| M02 | Album recordings, lyric/transcript material and scene/music cue timings; explicitly track 3 dialogue and chapter 4 conversation | All musical scenes, especially 2–4 | Any claim of exact dialogue or album synchronization |
| M03 | Moral Code symbol, leader/observer identities and visual briefs, monitor/news content, training specification | 2 | Finished room/content and training acceptance |
| M04 | Module identity/function, relation to installed sabotage device, tracking mechanism, code/upload technical lore | 2–4, 9 | Explanatory dialogue, interfaces or lore-dependent gameplay; preserve supplied causal outcomes meanwhile |
| M05 | Chapter 3 route structure, security chief(s), room plans, timers, guidance and escape rules | 3 | Mission implementation and route acceptance |
| M06 | Party/house cast and layout, news wording, exact way the module consequence is revealed | 4 | Finished scene and departure path |
| M07 | Cruiser(s), flight viewpoint/routes, propaganda copy, weapons, boost values and carryover | 3–7 | Production mini flight design |
| M08 | Chapter 6 title, building/operatives, detection/failure rules, shooter and death choreography | 6 | Stealth mission and cinematic delivery |
| M09 | Fence/bat details, server layouts, hack behavior, ammo/drop economy and escape timer rules; chapter 9 title | 8–9 | Server assault implementation |
| M10 | Exact final vow, rooftop location and end-credit/music material | 10 | Finished ending |
| M11 | Gadget tuning, recharge kill counts, backpack capacity, hoverboard duration, progression and chapter unlock assignments | Episode-wide | Any route depending on these powers |
| M12 | Final approved hero mini artwork/action handoff; separately scoped missing actions and new NPC/environment/vehicle briefs | All | Final visual acceptance; never presumed complete by this plan |

No unspecified lore, album dialogue or missing chapter title is supplied by this
plan. No implementation or changes to the concurrent character work were made.
