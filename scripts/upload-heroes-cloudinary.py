#!/usr/bin/env python3
"""
Mirror hero images onto Cloudinary and repoint the corpus at them.

Heroes ship hotlinked from Wikimedia today: a third-party redirect on every
LCP image, no image-search value for us, and a silent break whenever an
upstream file is renamed. This downloads each one, uploads it under
more-group/capetown/{collection}/{slug}, and rewrites heroImage in the MDX.

Requires (Cursor runs this, the cloud session has no keys):
    export CLOUDINARY_CLOUD_NAME=...
    export CLOUDINARY_API_KEY=...
    export CLOUDINARY_API_SECRET=...

Usage:
    node scripts/hero-images-manifest.mjs          # refresh the manifest first
    python3 scripts/upload-heroes-cloudinary.py --dry-run
    python3 scripts/upload-heroes-cloudinary.py --collection guides
    python3 scripts/upload-heroes-cloudinary.py --collection all
"""
from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "scripts" / "capetown-hero-images.json"
UA = "capetown-invest-hero-mirror/1.0 (+https://capetown-invest.com)"
TIMEOUT = 60


def env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        sys.exit(f"Missing {name}. Export the three Cloudinary variables first.")
    return value


def normalize_wikimedia_source(url: str) -> str:
    """Full-resolution upload.wikimedia.org files can exceed Cloudinary's size cap."""
    if "upload.wikimedia.org" not in url:
        return url
    if "Special:FilePath" in url:
        return url if "width=" in url else f"{url}{'&' if '?' in url else '?'}width=1400"
    name = urllib.parse.unquote(url.rsplit("/", 1)[-1])
    return f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(name)}?width=1400"


def fetch(url: str) -> bytes:
    """Wikimedia rejects requests without a descriptive User-Agent."""
    url = normalize_wikimedia_source(url)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read()


def sign(params: dict, secret: str) -> str:
    payload = "&".join(f"{k}={params[k]}" for k in sorted(params))
    return hashlib.sha1(f"{payload}{secret}".encode()).hexdigest()


def upload(data: bytes, public_id: str, folder: str, cloud: str, key: str, secret: str) -> str:
    ts = int(time.time())
    signed = {"folder": folder, "public_id": public_id, "timestamp": ts, "overwrite": "false"}
    boundary = "----capetownhero" + hashlib.md5(public_id.encode()).hexdigest()[:12]
    fields = dict(signed, api_key=key, signature=sign(signed, secret))

    body = bytearray()
    for name, value in fields.items():
        body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode()
    body += (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{public_id}\"\r\n"
        f"Content-Type: application/octet-stream\r\n\r\n".encode()
    )
    body += data + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        f"https://api.cloudinary.com/v1_1/{cloud}/image/upload",
        data=bytes(body),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT * 2) as resp:
        return json.load(resp)["secure_url"]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--collection", default="all")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    if not MANIFEST.exists():
        sys.exit("Run: node scripts/hero-images-manifest.mjs")
    images = json.loads(MANIFEST.read_text())["images"]
    todo = [i for i in images if i["external"] and args.collection in ("all", i["collection"])]
    if args.limit:
        todo = todo[: args.limit]

    print(f"{len(todo)} hero(s) to mirror" + (" [dry run]" if args.dry_run else ""))
    if args.dry_run:
        for item in todo[:10]:
            print(f"  {item['collection']}/{item['slug']} <- {item['source'][:80]}")
        if len(todo) > 10:
            print(f"  ... and {len(todo) - 10} more")
        return

    cloud, key, secret = env("CLOUDINARY_CLOUD_NAME"), env("CLOUDINARY_API_KEY"), env("CLOUDINARY_API_SECRET")
    done = failed = 0

    for item in todo:
        mdx = ROOT / item["file"]
        try:
            data = fetch(item["source"])
            url = upload(data, item["slug"], f"more-group/capetown/{item['collection']}", cloud, key, secret)
        except Exception as exc:  # noqa: BLE001 - report and keep going
            print(f"  FAIL {item['collection']}/{item['slug']}: {exc}")
            failed += 1
            continue

        text = mdx.read_text()
        patched = re.sub(r'^heroImage:\s*.*$', f'heroImage: "{url}"', text, count=1, flags=re.M)
        mdx.write_text(patched)
        done += 1
        print(f"  ok {item['collection']}/{item['slug']}")

    print(f"\nmirrored {done}, failed {failed}")
    print("Next: node scripts/hero-images-manifest.mjs && npm run validate:content -- --all && npm run build")


if __name__ == "__main__":
    main()
