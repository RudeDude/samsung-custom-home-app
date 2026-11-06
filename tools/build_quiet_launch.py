#!/usr/bin/env python3
"""Copy Quiet Launch into a package directory and list local pictures."""
import argparse
import json
import shutil
from pathlib import Path

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "apps" / "quiet-launch"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=ROOT / ".local" / "build" / "quiet-launch")
    parser.add_argument("--photos", type=Path, default=ROOT / ".local" / "photos")
    parser.add_argument("--photo-base", default="", help="Photo server origin, without a trailing slash")
    args = parser.parse_args()
    out = args.out.expanduser().resolve()
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(SOURCE, out, ignore=shutil.ignore_patterns("*.wgt"))
    photos = args.photos.expanduser().resolve()
    images = []
    if photos.is_dir():
        for path in sorted(photos.iterdir(), key=lambda item: item.name.lower()):
            if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES:
                target = out / "photos" / path.name
                shutil.copy2(path, target)
                images.append({"name": path.name, "url": "photos/" + path.name})
    (out / "photos" / "manifest.json").write_text(json.dumps({"images": images}, indent=2) + "\n")
    base = args.photo_base.rstrip("/")
    (out / "js" / "server.local.js").write_text(
        f"window.QUIET_PHOTO_BASE = {json.dumps(base)};\n"
    )
    print(f"Package tree {out}")
    print(f"Pictures packaged: {len(images)}")
    if base:
        print(f"Live picture server {base}")


if __name__ == "__main__":
    main()
