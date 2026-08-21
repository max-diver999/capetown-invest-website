#!/usr/bin/env node
/**
 * Build a manifest of every hero image the corpus points at.
 *
 * Heroes are currently hotlinked from Wikimedia, which is slow, unbranded and
 * breaks silently when an upstream file is renamed. This manifest is the input
 * for scripts/upload-heroes-cloudinary.py, which mirrors them onto our own CDN.
 *
 * Usage: node scripts/hero-images-manifest.mjs
 * Output: scripts/capetown-hero-images.json
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('src/content');
const OUT = path.resolve('scripts/capetown-hero-images.json');

const entries = [];

for (const collection of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, collection);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    const hero = fm.match(/^heroImage:\s*["']?(.+?)["']?\s*$/m)?.[1];
    if (!hero) continue;
    entries.push({
      collection,
      slug: file.replace(/\.mdx$/, ''),
      file: `src/content/${collection}/${file}`,
      source: hero,
      external: !hero.includes('res.cloudinary.com'),
    });
  }
}

const external = entries.filter((e) => e.external);
const byHost = external.reduce((acc, e) => {
  const host = new URL(e.source).host;
  acc[host] = (acc[host] ?? 0) + 1;
  return acc;
}, {});

fs.writeFileSync(
  OUT,
  `${JSON.stringify({ generated: 'node scripts/hero-images-manifest.mjs', total: entries.length, external: external.length, byHost, images: entries }, null, 2)}\n`,
);

console.log(`heroes: ${entries.length} | still external: ${external.length}`);
for (const [host, n] of Object.entries(byHost)) console.log(`  ${host}: ${n}`);
console.log(`written: ${path.relative(process.cwd(), OUT)}`);
