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
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { loadCorpus, scoreDocument, factRegistryReport, corpusFiles, DETERMINISTIC_MAX, ABSOLUTE_MAX } from './lib/geo/score.mjs';

/**
 * The corpus is every MDX file Astro publishes, discovered the same way Astro
 * discovers it.
 *
 * The previous version listed seven directories and read each one
 * non-recursively, which meant `git mv` into a subdirectory removed a file from
 * the corpus while leaving it on the site. A red team moved the thirty
 * worst-scoring files one level deeper and lifted the corpus mean from 40.7 to
 * 51 in four minutes, with a diff that reads as tidying. Recursive discovery
 * from the collection root closes it: anything Astro publishes is scored, and
 * anything moved out of src/content stops being a page at all.
 */

function printOne(r, explain) {
  const bar = '='.repeat(60);
  console.log(`\n${r.id}`);
  console.log(`  score ${r.deterministic}/${r.max}   (ceiling ${ABSOLUTE_MAX} with judge stage)`);
  console.log(`  base ${r.base}  penalties -${r.penaltyTotal}  sections ${r.signals.sections}  words ${r.signals.words}`);
  if (r.gates.length) {
    console.log('  gates:');
    for (const g of r.gates) console.log(`    [cap ${g.cap}] ${g.code}: ${g.detail}`);
  }
  if (explain && r.components) {
    const maxes = { openers: 20, evidence: 15, structure: 15, rhythm: 8, provenance: 10, floor: 7 };
    const parts = Object.entries(r.components)
      .map(([k, v]) => `${k} ${Math.round(v)}/${maxes[k]}`)
      .join('  ');
    console.log(`  base parts: ${parts}`);
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
// --min-score N exits non-zero when any scored file is below N, so this scorer
// can stand in a gate rather than only being read by a human. --changed narrows
// to MDX touched against origin/HEAD, which is what a pre-push hook wants.
const minIdx = args.indexOf('--min-score');
const minScore = minIdx !== -1 ? Number(args[minIdx + 1]) : null;
const changedOnly = args.includes('--changed');
const target = args.find((a, i) => !a.startsWith('--') && !(minIdx !== -1 && i === minIdx + 1));
const files = corpusFiles();

function changedFiles() {
  const run = (a) => {
    try { return execFileSync('git', a, { encoding: 'utf8' }); } catch { return ''; }
  };
  // Committed-but-unpushed work counts: a --changed gate that only sees the
  // working tree passes trivially once the author commits, which makes it
  // vacuous exactly when it matters.
  const out = [run(['diff', '--name-only', 'HEAD', '--', 'src/content']),
               run(['diff', '--name-only', '--cached', '--', 'src/content']),
               run(['diff', '--name-only', 'origin/HEAD...HEAD', '--', 'src/content'])].join('\n');
  const set = new Set(out.split('\n').map((l) => l.trim()).filter((l) => l.endsWith('.mdx')));
  return files.filter((f) => set.has(f));
}

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
  const scope = changedOnly ? changedFiles() : files;
  if (changedOnly && !scope.length) {
    console.log('GEO: no changed MDX to score.');
    process.exit(0);
  }
  const rows = scope.map((f) => scoreDocument(path.basename(f), index)).sort((a, b) => a.deterministic - b.deterministic);
  const cov = rows[0]?.registryCoverage;
  const mean = rows.reduce((a, r) => a + r.deterministic, 0) / rows.length;
  console.log(`=== GEO deterministic scores (max ${DETERMINISTIC_MAX}, ceiling ${ABSOLUTE_MAX} with judge) ===`);
  console.log(`corpus ${rows.length} files, mean ${mean.toFixed(1)}`);
  // The 95 ceiling is only real once a judge verdict exists. Saying so here
  // stops the headline number being read as "out of 95" when nothing has been
  // judged and every score in the repository is deterministic-only.
  const judged = fs.existsSync('.content-os/judgements')
    ? fs.readdirSync('.content-os/judgements').filter((f) => f.endsWith('.json')).length
    : 0;
  if (!judged) {
    console.log(
      `no judge verdicts on record, so the effective ceiling today is ${DETERMINISTIC_MAX}, not ${ABSOLUTE_MAX}. ` +
        'Set GEO_JUDGE_SECRET and run scripts/geo-judge.mjs to open the top 20 points.',
    );
  } else {
    console.log(`${judged} judge verdict(s) on record.`);
  }
  if (cov) {
    console.log(`fact registry covers ${cov.known}/${cov.total} load-bearing figures (${Math.round(cov.share * 100)}%); the registry gate arms at 80%`);
  }
  const reg = factRegistryReport();
  if (reg.rejected) console.log(`${reg.rejected} registry entr(y/ies) ignored: a source of 12+ characters, a statement of 20+ and an ISO date are required`);
  if (reg.templated) {
    console.log(
      `\n⚠ registry looks generated rather than researched: ${reg.topSource} of ${reg.usable} entries share one source string. ` +
        'Provenance credit is withheld from every article until this is fixed.',
    );
  }
  console.log('');
  for (const r of rows) {
    const flags = [
      r.gates.length ? `GATE:${r.gates.map((g) => g.code).join(',')}` : '',
      r.unregistered.length ? `unregistered:${r.unregistered.length}` : '',
    ].filter(Boolean).join(' ');
    console.log(`${String(r.deterministic).padStart(3)}/${DETERMINISTIC_MAX}  ${r.id.padEnd(52)} ${flags}`);
  }
  const worst = rows.filter((r) => r.gates.length);
  console.log(`\n${worst.length} file(s) hit a gate; ${rows.filter((r) => r.unregistered.length).length} carry unregistered shared figures.`);

  if (minScore !== null && Number.isFinite(minScore)) {
    const below = rows.filter((r) => r.deterministic < minScore);
    if (below.length) {
      console.log(`\n❌ ${below.length}/${rows.length} file(s) below the ${minScore}/${DETERMINISTIC_MAX} threshold:`);
      for (const r of below.slice(0, 20)) console.log(`   ${String(r.deterministic).padStart(3)}  ${r.id}`);
      if (below.length > 20) console.log(`   ... and ${below.length - 20} more`);
      process.exit(1);
    }
    console.log(`\n✅ all ${rows.length} scored file(s) at or above ${minScore}/${DETERMINISTIC_MAX}.`);
  }
}
