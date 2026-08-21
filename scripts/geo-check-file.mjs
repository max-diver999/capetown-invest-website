#!/usr/bin/env node
/** Score a single MDX file against the GEO citability rubric. */
import fs from 'fs';
import path from 'path';
import { scorePage } from './lib/geo-citability-scorer.mjs';

const target = process.argv[2];
if (!target) {
  console.error('usage: node scripts/geo-check-file.mjs src/content/<collection>/<slug>.mdx');
  process.exit(1);
}
const collection = path.basename(path.dirname(target));
const body = fs.readFileSync(target, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
const r = scorePage(body, { collection });
console.log(`${target}`);
console.log(`score ${r.score}/100 | coverage ${r.coverage}% | citability blocks ${r.citabilityBlockCount}`);
console.log(`rubric: answer ${r.categoryAvgs.answer} | self ${r.categoryAvgs.selfContain} | structure ${r.categoryAvgs.structure} | stats ${r.categoryAvgs.stats} | unique ${r.categoryAvgs.unique}`);
console.log(r.issues.length ? `issues:\n  ${r.issues.join('\n  ')}` : 'issues: none');
