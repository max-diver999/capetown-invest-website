#!/usr/bin/env python3
"""
Give the eleven pages that borrowed another article's hero their own image.

content-quality-10 lists a reused heroImage as a stop condition, and
qa:full:quick does not catch it because it checks that image URLs return 200,
not that the slug matches. The borrowed sources all sit on the legacy niche
cloud, which is read-only for bandwidth reasons, so each page gets a fresh
Wikimedia Commons original uploaded to the active niche cloud instead.

Sources were chosen per page and checked by eye before this ran; the mapping,
licence and author live in scripts/capetown-hero-credits.json.

Credentials come from the routing file rather than the shell:
    99_Системное/.env.cloudinary-niche-active   (gitignored, cloud bwppi9gc)

Usage:
    python3 scripts/upload-borrowed-heroes.py --dry-run
    python3 scripts/upload-borrowed-heroes.py
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CREDITS = ROOT / "scripts" / "capetown-hero-credits.json"
ENV_FILE = (
    ROOT.parent / "99_Системное" / ".env.cloudinary-niche-active"
)
UA = "capetown-invest-hero-mirror/1.0 (+https://capetown-invest.com)"
MAX_WIDTH = 1920  # cloudinary-optimization: upload no larger, JPEG ~78%
QUALITY = 78
HERO_TRANSFORM = "w_1200,q_85,f_webp"


def load_credentials() -> tuple[str, str, str]:
    """Read the active niche cloud from the routing env file, not the shell."""
    if not ENV_FILE.exists():
        sys.exit(f"Missing {ENV_FILE}. See 99_Системное/CLOUDINARY_ROUTING.md.")
    values: dict[str, str] = {}
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        values[key.strip()] = value.strip()
    try:
        return (
            values["CLOUDINARY_CLOUD_NAME"],
            values["CLOUDINARY_API_KEY"],
            values["CLOUDINARY_API_SECRET"],
        )
    except KeyError as exc:
        sys.exit(f"{ENV_FILE} has no {exc.args[0]}.")


def fetch_original(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(request, timeout=180).read()


def normalise(raw: bytes) -> tuple[bytes, tuple[int, int]]:
    """Downscale to the upload cap and re-encode, so storage stays small."""
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    if image.width > MAX_WIDTH:
        height = round(image.height * MAX_WIDTH / image.width)
        image = image.resize((MAX_WIDTH, height), Image.LANCZOS)
    buffer = io.BytesIO()
    image.save(buffer, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    return buffer.getvalue(), image.size


def upload(cloud: str, key: str, secret: str, payload: bytes, public_id: str) -> dict:
    """Signed upload; overwrite=false so a repeat run is a no-op."""
    params = {"public_id": public_id, "overwrite": "false", "timestamp": str(int(time.time()))}
    to_sign = "&".join(f"{name}={params[name]}" for name in sorted(params))
    signature = hashlib.sha1((to_sign + secret).encode()).hexdigest()
    fields = {**params, "api_key": key, "signature": signature}

    boundary = uuid.uuid4().hex
    body = io.BytesIO()
    for name, value in fields.items():
        body.write(
            f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode()
        )
    body.write(
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; '
        f'filename="hero.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'.encode()
    )
    body.write(payload)
    body.write(f"\r\n--{boundary}--\r\n".encode())

    request = urllib.request.Request(
        f"https://api.cloudinary.com/v1_1/{cloud}/image/upload",
        data=body.getvalue(),
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "User-Agent": UA,
        },
    )
    return json.load(urllib.request.urlopen(request, timeout=300))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="fetch and size only")
    parser.add_argument("--slug", help="restrict to one slug")
    args = parser.parse_args()

    entries = json.loads(CREDITS.read_text(encoding="utf-8"))
    if args.slug:
        entries = [row for row in entries if row["slug"] == args.slug]
        if not entries:
            sys.exit(f"No entry for {args.slug}.")

    cloud, key, secret = load_credentials()
    print(f"cloud {cloud}, {len(entries)} image(s), dry-run={args.dry_run}\n")

    failures = 0
    for row in entries:
        try:
            payload, size = normalise(fetch_original(row["source"]))
        except Exception as error:  # noqa: BLE001 - one bad source must not stop the run
            print(f"{row['slug']:38} FETCH FAILED {error}")
            failures += 1
            continue

        kb = len(payload) // 1024
        if args.dry_run:
            print(f"{row['slug']:38} {size[0]}x{size[1]:<5} {kb:>4}KB -> {row['public_id']}")
            continue

        try:
            result = upload(cloud, key, secret, payload, row["public_id"])
        except urllib.error.HTTPError as error:
            print(f"{row['slug']:38} UPLOAD FAILED {error.code} {error.read()[:200]!r}")
            failures += 1
            continue

        row["uploaded_url"] = (
            f"https://res.cloudinary.com/{cloud}/image/upload/"
            f"{HERO_TRANSFORM}/{result['public_id']}"
        )
        print(f"{row['slug']:38} {size[0]}x{size[1]:<5} {kb:>4}KB -> {result['public_id']}")

    if not args.dry_run:
        CREDITS.write_text(
            json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    print(f"\ndone, {failures} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
