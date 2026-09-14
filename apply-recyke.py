"""Apply only reviewed Recyke files after checking current and staged content."""
from pathlib import Path
import hashlib
import json
import shutil

task = Path('/Users/tanoshi/Documents/ChatGPT/Ctrl Alt Del')
staging = task / 'recyke-development'
destination = Path('/Users/tanoshi/Documents/GitHub/Ctrl-Alt-Del')
manifest = json.loads((task / 'recyke-original-backup/manifest.json').read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None

for name, hashes in manifest.items():
    assert sha(staging / name) == hashes['after'], f'Staging changed: {name}'
    assert sha(destination / name) == hashes['before'], f'Project changed: {name}'
    if hashes['before'] is None:
        assert not (destination / name).exists(), f'Destination exists: {name}'

for name in manifest:
    target = destination / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(staging / name, target)

for name, hashes in manifest.items():
    assert sha(destination / name) == hashes['after'], f'Copy verification failed: {name}'

print(f'Applied and verified {len(manifest)} Recyke files; existing-file backups retained.')
