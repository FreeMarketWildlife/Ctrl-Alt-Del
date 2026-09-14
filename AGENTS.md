# Shared story reference

Before future story, campaign, dialogue, character, ability, or world-design work,
read [the lead designer reference](docs/story/lead-designer-reference.md) and consult
its [verbatim source](docs/story/lead-designer-original.txt) for exact wording.
These shared notes apply across the development folders in this workspace.

The user supplied this direction for documentation and future reference only.
Do not treat it as a request to change existing gameplay, art, identifiers, or
approved character standards. The reference records differences and unresolved
details; keep those visible when planning relevant future work. Continue to follow
each development folder's own art and implementation instructions. Preserve the
original-backup folders.

# Active art standard — minis only (user-approved September 14, 2026)

- All new character, enemy, equipment and world work uses the MINI native family.
- Humanoid cells are 48×48, standing height 32px, feet anchor (20,40).
- One art pixel equals one world unit; zoom the entire scene in whole device pixels.
- Never scale a large model down to make a mini or independently enlarge a sprite.
- Jane and Jessie use approved Proposal A appearances across all original actions.
- Preserve action coverage, canonical timing, contacts, ponytail links and gameplay APIs.
- Large models and prior dual-family standards are archived under
  `archive/pre-mini-2026-09-14/`; do not load them in active apps or continue their development.
- Original-backup folders remain untouched. Historical story references remain verbatim;
  their earlier documentation-only disclaimer does not override this appearance approval.
- `mini-review/` is the shared animation review. Recyke defaults to its native mini route.

- Held ground crouching is supported for both heroes, including moving and firing.
  Preserve the additive modes and collider rules in `mini-review/CROUCHING.md`.
