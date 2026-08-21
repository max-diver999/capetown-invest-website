#!/usr/bin/env node
/**
 * Strip the auto-generated "citability" boilerplate injected by the July 2026
 * GEO-lift run (commit 9cda569) from the MDX corpus.
 *
 * Families removed (each is a standalone block separated by blank lines):
 *   1. "Cape Town investors reviewing {heading} typically require ..." openers
 *   2. "Insider tip: request audited body corporate financials ... on {heading} stock"
 *   3. "Cape Town Invest DD notes[ for this section]:" label + its bullet list
 *   4. "Cape Town Invest buyer desk flags ... underwriting packs ..."
 *   5. "On {slug}, Cape Town Invest buyer desk sees more aborted deals ..."
 *   6. "MORE Group underwriting snapshot: ..."
 *   7. "| Benchmark | Figure | DD use |" junk tables
 *
 * Usage: node scripts/strip-geo-boilerplate.mjs [--dry] [--collection guides]
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'src/content');
const DRY = process.argv.includes('--dry');
const colArg = process.argv.indexOf('--collection');
const ONLY = colArg > -1 ? process.argv[colArg + 1] : null;

const BLOCK_PATTERNS = [
  { id: 'reviewing-opener', re: /^Cape Town investors reviewing .*(typically require|usually means|usually require)/s },
  { id: 'usually-means-opener', re: /for Cape Town investors usually means .*(monthly carry|finance caps)/s },
  { id: 'buyers-underwriting', re: /^Buyers underwriting .* in Cape Town should model /s },
  { id: 'underwriting-on-slug', re: /^Cape Town Invest underwriting on .* in Q[1-4] \d{4} modeled /s },
  { id: 'insider-tip', re: /^Insider tip: request audited body corporate/s },
  { id: 'dd-notes-label', re: /^Cape Town Invest DD notes( for this section)?:\s*$/s },
  { id: 'buyer-desk-flags', re: /^Cape Town Invest buyer desk flags /s },
  { id: 'aborted-deals', re: /^On [^,]+, Cape Town Invest buyer desk sees more aborted deals/s },
  { id: 'more-group-snapshot', re: /^MORE Group underwriting snapshot: /s },
  { id: 'benchmark-table', re: /^\| Benchmark \| Figure \| DD use \|/s },
  { id: 'dd-bullets-orphan', re: /^-\s+(\*\*)?MODELED carry:.*\n-\s+(\*\*)?Foreign rules:/s },
];

/** Bullet list that belongs to a removed "DD notes" label. */
const DD_BULLETS_RE = /^-\s+(\*\*)?(MODELED carry|Foreign rules|Timeline|Entry|Carry|Exit)/m;

const stats = Object.fromEntries(BLOCK_PATTERNS.map((p) => [p.id, 0]));
stats['dd-notes-bullets'] = 0;
let filesChanged = 0;
const perFile = [];

function splitFrontmatter(raw) {
  const m = raw.match(/^---\n[\s\S]*?\n---\n/);
  if (!m) return ['', raw];
  return [m[0], raw.slice(m[0].length)];
}

function stripBody(body) {
  const blocks = body.split(/\n\n+/);
  const kept = [];
  let removedPrevLabel = false;
  const hits = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Bullet list orphaned by a just-removed "DD notes:" label
    if (removedPrevLabel && DD_BULLETS_RE.test(trimmed) && /^- /.test(trimmed)) {
      stats['dd-notes-bullets']++;
      hits.push('dd-notes-bullets');
      removedPrevLabel = false;
      continue;
    }
    removedPrevLabel = false;

    const match = BLOCK_PATTERNS.find((p) => p.re.test(trimmed));
    if (match) {
      stats[match.id]++;
      hits.push(match.id);
      if (match.id === 'dd-notes-label') removedPrevLabel = true;
      continue;
    }
    kept.push(block.replace(/\s+$/, ''));
  }

  return [kept.join('\n\n') + '\n', hits];
}

const collections = fs
  .readdirSync(ROOT)
  .filter((d) => fs.statSync(path.join(ROOT, d)).isDirectory())
  .filter((d) => !ONLY || d === ONLY);

for (const col of collections) {
  for (const file of fs.readdirSync(path.join(ROOT, col)).filter((f) => f.endsWith('.mdx'))) {
    const full = path.join(ROOT, col, file);
    const raw = fs.readFileSync(full, 'utf8');
    const [fm, body] = splitFrontmatter(raw);
    const [cleaned, hits] = stripBody(body);
    if (!hits.length) continue;
    filesChanged++;
    perFile.push(`${col}/${file}: ${hits.length} blocks`);
    if (!DRY) fs.writeFileSync(full, fm + cleaned);
  }
}

console.log(DRY ? '— DRY RUN —' : '— APPLIED —');
console.log(`Files affected: ${filesChanged}`);
console.log('Blocks removed by family:');
for (const [k, v] of Object.entries(stats)) console.log(`  ${k.padEnd(24)} ${v}`);
console.log(`  ${'TOTAL'.padEnd(24)} ${Object.values(stats).reduce((a, b) => a + b, 0)}`);
