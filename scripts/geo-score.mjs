#!/usr/bin/env node
/**
 * GEO score for one article or the whole corpus.
 *
 *   node scripts/geo-score.mjs                       # every guide, ranked
 *   node scripts/geo-score.mjs <file.mdx>            # one article, with reasons
 *   node scripts/geo-score.mjs <file.mdx> --explain  # plus every penalty in full
 *
 * The score is out of 75 in this stage. The last twenty points to the 95 ceiling
 * come from the judge stage (scripts/geo-judge.mjs), which no pattern edit can reach.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadCorpus, scoreDocument, DETERMINISTIC_MAX, ABSOLUTE_MAX } from './lib/geo/score.mjs';

// Every collection, because duplication is measured against the whole site: a
// passage shared between a guide and a project page is still a shared passage.
const CORPUS_DIRS = [
  'src/content/guides',
  'src/content/compare',
  'src/content/areas',
  'src/content/segments',
  'src/content/projects',
  'src/content/developers',
  'src/content/news',
];

function corpusFiles() {
  const out = [];
  for (const d of CORPUS_DIRS) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) if (f.endsWith('.mdx')) out.push(path.join(d, f));
  }
  return out;
}

function printOne(r, explain) {
  const bar = '='.repeat(60);
  console.log(`\n${r.id}`);
  console.log(`  score ${r.deterministic}/${r.max}   (ceiling ${ABSOLUTE_MAX} with judge stage)`);
  console.log(`  base ${r.base}  penalties -${r.penaltyTotal}  sections ${r.signals.sections}  words ${r.signals.words}`);
  if (r.gates.length) {
    console.log('  gates:');
    for (const g of r.gates) console.log(`    [cap ${g.cap}] ${g.code}: ${g.detail}`);
  }
  const shown = explain ? r.penalties : r.penalties.slice(0, 5);
  if (shown.length) {
    console.log('  penalties:');
    for (const p of shown) console.log(`    -${p.points} ${p.code}: ${p.detail}`);
    if (!explain && r.penalties.length > shown.length) {
      console.log(`    ... ${r.penalties.length - shown.length} more (--explain)`);
    }
  }
  if (r.unregistered.length) {
    console.log('  figures shared with other articles but not in .content-os/facts.json:');
    for (const u of r.unregistered.slice(0, 10)) console.log(`    ${u.figure} (in ${u.files} articles)`);
  }
  if (!r.gates.length && !r.penalties.length) console.log('  no defects found');
  if (explain) console.log(bar);
}

const args = process.argv.slice(2);
const explain = args.includes('--explain');
const asJson = args.includes('--json');
const target = args.find((a) => !a.startsWith('--'));
const files = corpusFiles();

if (target) {
  const abs = path.resolve(target);
  const all = files.map((f) => path.resolve(f));
  if (!all.includes(abs)) all.push(abs);
  const index = loadCorpus(all);
  printOne(scoreDocument(path.basename(abs), index), explain);
} else if (asJson) {
  const index = loadCorpus(files);
  const byId = new Map(files.map((f) => [path.basename(f), f]));
  const rows = files.map((f) => {
    const r = scoreDocument(path.basename(f), index);
    return { ...r, path: byId.get(r.id) };
  });
  console.log(JSON.stringify(rows, null, 1));
} else {
  const index = loadCorpus(files);
  const rows = files.map((f) => scoreDocument(path.basename(f), index)).sort((a, b) => a.deterministic - b.deterministic);
  const cov = rows[0]?.registryCoverage;
  const mean = rows.reduce((a, r) => a + r.deterministic, 0) / rows.length;
  console.log(`=== GEO deterministic scores (max ${DETERMINISTIC_MAX}, ceiling ${ABSOLUTE_MAX} with judge) ===`);
  console.log(`corpus ${rows.length} files, mean ${mean.toFixed(1)}`);
  if (cov) {
    console.log(`fact registry covers ${cov.known}/${cov.total} load-bearing figures (${Math.round(cov.share * 100)}%); the registry gate arms at 80%\n`);
  }
  for (const r of rows) {
    const flags = [
      r.gates.length ? `GATE:${r.gates.map((g) => g.code).join(',')}` : '',
      r.unregistered.length ? `unregistered:${r.unregistered.length}` : '',
    ].filter(Boolean).join(' ');
    console.log(`${String(r.deterministic).padStart(3)}/${DETERMINISTIC_MAX}  ${r.id.padEnd(52)} ${flags}`);
  }
  const worst = rows.filter((r) => r.gates.length);
  console.log(`\n${worst.length} file(s) hit a gate; ${rows.filter((r) => r.unregistered.length).length} carry unregistered shared figures.`);
}
