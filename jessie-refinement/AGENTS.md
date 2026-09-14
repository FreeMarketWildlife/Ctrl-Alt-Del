# Active art direction — minis only

Follow [the workspace rules](../AGENTS.md). The user retired the large family and
approved Proposal A for all Jane/Jessie mini actions. This supersedes the previous
magenta/violet/teal outfit lock and dual-family requirements.

- Native humanoid cell 48×48, standing height 32px, feet anchor (20,40).
- One source pixel equals one world unit. Use CADPixelGrid.applyScene to zoom the
  complete scene uniformly in whole device pixels. No smoothing or sprite resizing.
- Jane: dark red side ponytail, purple/lime punk jacket, torn jeans, choker, boots.
- Jessie: messy brown hair, brown eye, red leather jacket, blue jeans, rolled cuffs,
  forearm tattoo and boots. Native minis are independently authored.
- Preserve Jane's 14 original actions and Jessie's 10, actual counts, timings and loops.
  The user also authorized four native crouch modes per hero: crouch-idle,
  crouch-walk, crouch-fire and crouch-walk-fire (18/14 total actions).
  Walk/run use 12 poses. Preserve fixed leg lengths, contacts and Jane's hair links.
- Use jane.js, jessie.js and their motion modules; do not restore rejected anatomy rigs.
- Enemies retain all six mini archetypes and their action coverage. Ground height
  and neutral drone span are 32px. Never resize characters to match world art.
- Recyke uses its existing 480×270 native mini route and mini physics. Preserve
  standing collision dimensions, combat cadence, checkpoints and normal completion.
  Grounded held Down uses the new 10×16 crouch collider (standing 10×30); feet stay
  anchored. Retain crouch until solid headroom permits standing after release.
- Pixel icons use native 32×32 canvases; ordinary review typography may use HTML.
- Large models, old workshops and prior standards are preserved in
  ../archive/pre-mini-2026-09-14/ and are inactive. Original-backup folders are untouched.
- Inspect complete motion sequences, silhouettes and both directions before delivery.
