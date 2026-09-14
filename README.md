# Ctrl Alt Del

The complete development workspace, with the new **Episode I playable prototype
and desktop level workshop**, approved mini character/enemy work, the Recyke kit,
existing playable studies, story/design documentation, and preserved backups.

Start a local server from this folder:

```sh
python3 -m http.server 8056 --bind 127.0.0.1
```

Open **http://127.0.0.1:8056/** for the project launcher.

- [Episode I campaign and workshop](episode-one/index.html) — twelve editable maps
  covering all ten chapters, dialogue/cutscenes, ground combat, stealth and flight.
- [Episode I guide and delivery notes](episode-one/README.md)
- [Recyke environment kit](recyke-kit/index.html?size=mini)
- [Approved mini animation review](mini-review/index.html)
- [Existing Recyke playable route](recyke-development/recyke.html)
- [Saved story reference](docs/story/lead-designer-reference.md)
- [Episode I design/implementation plan](docs/story/episode-i-implementation-plan.md)
- [Level-editor and asset-library plan](docs/editor/level-editor-plan.md)

All active new work uses the native MINI family. Original-backup folders and
historical large-model work are preserved for reference. New Episode I supporting
art and dialogue are prototype proposals; they do not replace approved hero art
or establish missing album dialogue, music, titles or symbols as canon.

The previous repository-root version is retained under
`archive/repository-main-ef0396d/`. Current development folders retain their full
source files rather than being published as nested Git submodules. Their local
`.git` databases are machine-local history, not game assets.
