#!/usr/bin/env node
/** Flatten ## Related guides H2 (hurts GEO) into a plain list before FaqBlock. */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');

function listMdx() {
  const files = [];
  for (const coll of readdirSync(CONTENT)) {
    const dir = join(CONTENT, coll);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
      files.push(join(dir, f));
    }
  }
  return files;
}

let n = 0;
for (const abs of listMdx()) {
  const raw = readFileSync(abs, 'utf8');
  const fm = raw.match(/^---\n[\s\S]*?\n---\n?/)?.[0] || '';
  const body = raw.slice(fm.length);
  if (!/^## Related guides/m.test(body)) continue;

  const fixed = body.replace(
    /^## Related guides\n\n(?:.*?\n\n)?((?:- \[[^\n]+\n?)+)/ms,
    'Related reading:\n\n$1',
  );
  if (fixed === body) continue;
  n += 1;
  writeFileSync(abs, fm + fixed, 'utf8');
}
console.log(`Flattened Related guides in ${n} files`);
