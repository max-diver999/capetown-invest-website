#!/usr/bin/env node
/**
 * Cleanup after geo-fix-corpus-90: fix ugly headings, broken insider tips, duplicate boosters.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMdxBody, scorePage } from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const DRY = process.argv.includes('--dry-run');

const BOOSTER_RE =
  /Cape Town Invest underwriting on .+ in 2026 usually starts at .+?\n\n/g;
const SNAPSHOT_RE =
  /MORE Group underwriting snapshot: .+?\n\n/g;
const BROKEN_TIP_RE =
  /Insider tip: .+ on Quick answer:.*?\n/g;

function humanizeHeading(h) {
  let t = h
    .replace(/^what should buyers know about /i, '')
    .replace(/^what should buyers verify on /i, '')
    .trim();
  if (/ranked \(yield-first\)/i.test(t)) return 'Which Cape Town suburbs rank highest for rental yield?';
  if (/ranked growth-first/i.test(t)) return 'Which suburbs rank highest for capital growth?';
  if (/betterbond/i.test(t)) return 'What does BetterBond data show for Cape Town bond demand?';
  if (t.length < 8) return h;
  if (!/\?$/.test(t)) {
    if (/^why /i.test(t)) return t.endsWith('?') ? t : `${t}?`;
    if (/^the /i.test(t)) return `How does ${t.slice(4)} affect Cape Town buyers?`;
    return `What should investors verify on ${t}?`;
  }
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function cleanupBody(body) {
  let out = body;
  out = out.replace(BROKEN_TIP_RE, '');
  out = out.replace(BOOSTER_RE, '');
  out = out.replace(SNAPSHOT_RE, '');

  out = out.replace(/^## What should buyers know about (.+)$/gm, (_, rest) => {
    return `## ${humanizeHeading(`what should buyers know about ${rest}`)}`;
  });
  out = out.replace(/^## What should buyers verify on (.+)$/gm, (_, rest) => {
    return `## ${humanizeHeading(`what should buyers verify on ${rest}`)}`;
  });

  // Collapse triple newlines
  out = out.replace(/\n{4,}/g, '\n\n\n');
  return out;
}

function listMdx() {
  const files = [];
  for (const coll of readdirSync(CONTENT)) {
    const dir = join(CONTENT, coll);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
      files.push(join(dir, f));
    }
  }
  return files.sort();
}

let changed = 0;
for (const abs of listMdx()) {
  const raw = readFileSync(abs, 'utf8');
  const fm = raw.match(/^---\n[\s\S]*?\n---\n?/)?.[0] || '';
  const body = parseMdxBody(raw);
  const cleaned = cleanupBody(body);
  if (cleaned === body) continue;
  changed += 1;
  if (!DRY) writeFileSync(abs, fm + cleaned, 'utf8');
}

console.log(`${DRY ? '[dry-run] ' : ''}Cleaned ${changed} files`);
