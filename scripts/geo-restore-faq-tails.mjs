#!/usr/bin/env node
/**
 * Restore FaqBlock + LeadForm tails dropped during GEO mass-fix.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMdxBody } from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');

const files = execSync("git diff --name-only HEAD -- 'src/content/**/*.mdx'", {
  cwd: ROOT,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean);

let restored = 0;
for (const rel of files) {
  const abs = join(ROOT, rel);
  const current = readFileSync(abs, 'utf8');
  if (/<FaqBlock/i.test(parseMdxBody(current))) continue;

  let head;
  try {
    head = execSync(`git show HEAD:${rel}`, { cwd: ROOT, encoding: 'utf8' });
  } catch {
    continue;
  }
  if (!/<FaqBlock/i.test(head)) continue;

  const fm = current.match(/^---\n[\s\S]*?\n---\n?/)?.[0] || '';
  const body = parseMdxBody(current);
  const headBody = parseMdxBody(head);
  const idx = headBody.search(/<FaqBlock/i);
  if (idx === -1) continue;
  const tail = headBody.slice(idx).trim();
  const neu = fm + body.trimEnd() + '\n\n' + tail + '\n';
  if (neu === current) continue;
  restored += 1;
  if (!DRY) writeFileSync(abs, neu, 'utf8');
  console.log('restored', rel);
}

console.log(`${DRY ? '[dry-run] ' : ''}Restored ${restored} files`);
