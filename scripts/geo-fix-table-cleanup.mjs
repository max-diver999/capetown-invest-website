#!/usr/bin/env node
/**
 * Fix corrupted MDX tables and bloated openers from GEO mass-fix passes.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMdxBody, scorePage, wordCount, stripMdx } from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const DRY = process.argv.includes('--dry-run');

const OPENER_RE =
  /^Cape Town investors reviewing .+ typically require .+ offer signature\./i;
const PAD_TAIL_RE =
  /\s*(?:Non-resident buyers need authorised-dealer|MODELED net yield must include|Cape Town Invest buyer desk treats).+$/i;

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

function trimOpenerParagraph(p) {
  const plain = stripMdx(p);
  if (!/Cape Town investors reviewing/i.test(plain)) return p;
  let trimmed = plain.replace(PAD_TAIL_RE, '').trim();
  const tokens = trimmed.split(/\s+/);
  if (tokens.length > 58) trimmed = tokens.slice(0, 58).join(' ').replace(/[,;:\s]+$/, '.');
  return trimmed;
}

function cleanupBody(body) {
  let out = body;
  let changed = false;

  // Remove table rows polluted with auto-openers
  const lines = out.split('\n');
  const cleaned = [];
  for (const line of lines) {
    if (/^\|/.test(line) && /Cape Town investors reviewing/i.test(line)) {
      changed = true;
      continue;
    }
    cleaned.push(line);
  }
  out = cleaned.join('\n');

  // Trim bloated opener paragraphs (keep one clean 52-58w sentence)
  const paras = out.split(/\n{2,}/);
  const fixed = paras.map((p) => {
    if (!OPENER_RE.test(stripMdx(p))) return p;
    const neu = trimOpenerParagraph(p);
    if (neu !== stripMdx(p)) changed = true;
    return neu;
  });
  out = fixed.join('\n\n');

  out = out.replace(/\n{4,}/g, '\n\n\n');
  return { body: out, changed };
}

let total = 0;
for (const abs of listMdx()) {
  const raw = readFileSync(abs, 'utf8');
  const fm = raw.match(/^---\n[\s\S]*?\n---\n?/)?.[0] || '';
  const body = parseMdxBody(raw);
  const { body: cleaned, changed } = cleanupBody(body);
  if (!changed) continue;
  total += 1;
  if (!DRY) writeFileSync(abs, fm + cleaned, 'utf8');
}
console.log(`${DRY ? '[dry-run] ' : ''}Table/opener cleanup: ${total} files`);
