# Recyke environment kit — isolated review scope

This folder implements the user's explicit follow-up request for **both independently authored big and mini environment assets**, overriding the earlier mini-only restriction only for this isolated kit/review. It does not change workspace production defaults.

- Preserve one native art pixel per world unit. No family is resized from the other.
- Keep big 128×128 / 96px figures / (64,112) and mini 48×48 / 32px figures / (20,40) references unchanged.
- The four hero sheets in `reference/` are byte-identical source copies. Big is the archived approved appearance, clearly labeled; mini is current Proposal A with approved crouch. Do not repaint them to match.
- Do not modify existing gameplay folders, character/enemy masters, original backups or archives.
- New geometry is authored in `src/mini.cjs` and `src/big.cjs`, with shared integer-raster primitives. Reuse native Recyke extraction where recorded in metadata.
- `assets/` is generated native PNG/JSON. `scenes/` contains separately placed layouts. Preview movement is a small isolated harness, not the full editor or campaign.
- No invented password, Moral Code emblem, conversation, elevator interior or canon location details. The source says concealed entrance; the layout and latch interaction are review proposals.
- Rerun build, scene generation, raster/traversal checks and affected browser checks after relevant changes. Inspect the actual assembled scenes, not only individual assets.
