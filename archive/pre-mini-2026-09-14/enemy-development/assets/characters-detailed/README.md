# Detailed character studies

Original Jessie and Jane studies, separate from the compact gameplay sprites. Inspect in `codex.html#jessie-detailed` or `codex.html#jane-detailed`. The native figure is roughly 90px tall. Jessie retains his muscular build, cyan vest and shades; Jane wears her magenta jacket and violet ponytail.

PNG sheets have transparent backgrounds, eight columns, eight rows, and 128×112 cells. The origin is (64,102) within every cell. Rows: fighting idle, walk, run, jab, cross, front kick, round kick, neutral stand. Face right by default. The reusable renderer and exact per-frame durations in seconds are exported by `CADDetailedCharacters` in `characters-detailed.js`. Do not assume uniform timing for attacks: impact holds longer than the outgoing smear. Walk and run use eight explicit poses with opposed arm swing; idle compresses through the knees while the feet stay planted.

The Concept Art viewer supports slow motion, exact frame stepping, flipping, individual PNG export, and full-sheet PNG export. Both characters have all eight studies. These are animation studies, not replacement gameplay collision models.

References studied:

- [SLYNYRD 49: Realistic Human Anatomy](https://www.slynyrd.com/blog/2024/3/25/pixelblog-49-realistic-human-anatomy): adult proportions and separate anatomical masses.
- [SLYNYRD 50: Human Walk Cycle](https://www.slynyrd.com/blog/2024/5/24/pixelblog-50-human-walk-cycle): contact, down, passing and swing poses; opposite limb movement.
- [SLYNYRD 52: Idle Fighting Stance](https://www.slynyrd.com/blog/2024/9/26/pixelblog-52-idle-fighting-stance): planted feet, knee compression and staggered secondary motion.
- [SLYNYRD 53: Punches and Kicks](https://www.slynyrd.com/blog/2024/11/25/pixelblog-53-punches-and-kicks): preparation, brief smears, impact holds and recovery.

Art is drawn from original code-native pixel shapes, not extracted from the reference assets. Revision 01 uses the fixed 16-color palettes and construction landmarks in ../../ART-STANDARDS.md.
