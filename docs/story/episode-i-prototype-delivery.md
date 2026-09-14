# Episode I prototype delivery

The user authorized production of all Episode I chapters, new prototype assets and
mechanics, editable levels, cutscenes/dialogue, and publication of the complete
current workspace. The prior planning-only restriction no longer applies to this
isolated campaign implementation.

[Play / edit the campaign](../../episode-one/index.html) ·
[Guide, controls and limitations](../../episode-one/README.md) ·
[Chapter board](../../episode-one/review/chapter-board.png)

## Design decisions applied

- **Native mini only**, following the active September 14 standard. Approved
  Proposal A Jane/Jessie and all six enemy archetypes are referenced unchanged.
  Big-family kit work remains an earlier isolated review; it is not imported into
  the new active campaign.
- **Twelve maps for ten chapters.** First Strike uses sequential Jessie sabotage,
  Janey recovery/retreat and shared wrecking-yard escape maps. This makes both
  required roles playable without a companion combat AI or simultaneous branching.
- **Side-view flight** for both cruiser chapters, with different route lengths,
  enemy arrangements and destination art. The same workshop edits the distance
  axis and all placements.
- **New dialogue is provisional.** The supplied invitation, oath, first two replies
  and welcome remain exact, including “Nexis.” There is no invented spoken third
  oath answer. The module stays behind; Nexus consequently tracks Jessie; Jessie’s
  rescue ends in his fixed death; the regional-server upload and final vow follow.
- **Missing originals remain visible.** Password, emblem, album music/lyrics/cues,
  source-exact album conversations, final credits, and the chapter 6/9 titles are
  unresolved. Newly authored scene cards never overwrite the verbatim reference.
- **Prototype animation substitutions are explicit.** A native equipment overlay
  supplies the bat; climbing currently uses existing locomotion presentation;
  Jessie’s death uses a cinematic cutaway. No approved hero sprite was repainted
  or relabeled as a new death/climb action.
- **Browser workshop**, portable JSON exports and IndexedDB recovery. Shared
  registry and render/simulation interpretation; no separate uneditable mission
  code hidden behind the chapter maps. The optional import CLI writes reviewed
  browser exports back to level files while keeping replaced files in its own
  recovery folder.

## What was built

The campaign adds timed sabotage/escape, conditions/objectives, terminals and exits,
checkpoint restoration, cutscene cards and control handoffs, route transitions,
stealth detection/cover, fence climbing/rear strike, grenades, 30-second watch
powers, temporary shield pickups, flight boosts/spread cannon, and finite-ammo gun
scavenging. The ordinary-input server-escape test takes three replacement guns.

The workshop supports search/drag/stamp, auto-edge terrain painting, erasing,
selection/multiselection, drag/nudge/snap, duplicate/copy/paste, undo/redo, layers,
visibility/locking, groups, expanded reusable assemblies, gameplay-property editing,
mission objectives/timers, cinematic card editing, beginning/location/sequence
playtests, export/import, recovery after reload and named validation errors.

There are 80 mini asset definitions: 47 existing Recyke modules plus 33 new native
recipes for the hideout, Skyview, Hub/server, scenery, equipment and flight. NPCs,
cruiser and security-head stand-ins remain prototype art choices. Art, collisions
and behavior are separate; metadata records native bounds/origins, revision,
connections, defaults, tags, frames, timings, thumbnails and placement rules.

## Verification and review

- All twelve maps complete through ordinary simulation inputs, with cinematic
  waits skipped. First Strike retains the unrecovered module; the stealth route
  reaches the fixed story outcome; the server escape replenishes finite weapons.
- Twenty focused core checks cover version/reference/structure errors, physics
  behavior, dormant encounters, rear strike, timer boundaries, save restoration,
  source fidelity, cutscene skip equivalence, copy remapping and input immutability.
- Real browser checks cover keyboard gameplay, paint/undo, dialogue changes,
  export/open, recovery after reload and twenty playtest/return cycles at DPR 1/2.
  No page or asset-load errors; physical scene zoom and origin are integer aligned.
- Asset checks cover 126 native PNG sheets, 189 sheet frames, binary alpha/palette
  for new art, frame timing/ranges, exact hashes and all eight approved actor cells.
- All 1,949 pre-kit baseline files (including nested Git metadata) remain unchanged;
  all 333 packaged Recyke-kit files still match the earlier delivered archive.
  Original Recyke’s 13 simulation scenarios and 16 crouch scenarios also pass.
- The native chapter board, full new-asset catalog and browser captures were
  visually inspected for seams, character scale/readability, foreground overlap,
  platform lips, search cones and location distinction. Early captures exposed
  a stale editor-canvas size; final chapter views are the correct 480×270.

This is a short playable prototype and usable first workshop. It does not claim
final difficulty/pacing approval, final supporting art, complete album production,
full inventory/progression, hoverboard, moving platforms, slopes, live nested
prefabs, or advanced timeline scrubbing. The earlier planning document remains
useful for those later stages; the implementation guide identifies what exists.

## Repository consolidation

The existing remote is `FreeMarketWildlife/Ctrl-Alt-Del`. Before this delivery it
contained an older prototype at the repository root, while the current workspace
had evolved into several development folders. Its previous root snapshot is
preserved exactly in `archive/repository-main-ef0396d/`; its commit history remains
the parent history of the consolidated update. The new root provides a launcher.

All current source, approved art, reviews, plans, Recyke kit, archives and original
backups are included as real repository files. Nested `.git` databases, caches and
transient test downloads are not game content and are excluded; local nested Git
histories remain untouched. No force push or original-backup edits are required.
