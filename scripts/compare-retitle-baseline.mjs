#!/usr/bin/env node
/**
 * Compare a current Search Console snapshot against the pre-merge baseline.
 *
 * Forty pages changed title in the September 2026 waves, alongside new internal
 * links, new hero images and reworked section indexes. The baseline in
 * .content-os/reports/seo-core-2026-09-07/data/retitle-baseline-2026-09-04.csv
 * is the "before" for that, taken over 9 June to 4 September 2026.
 *
 * The rule this encodes, so it cannot be misread later: only pages that carried
 * at least MIN_IMPRESSIONS in the baseline can say anything, and only a position
 * move larger than MIN_POSITION_DELTA counts as a move. Everything else is noise
 * at these volumes, and clicks are noise throughout: the whole corpus took 59
 * clicks in three months, so a page going from 1 click to 2 means nothing.
 *
 * Usage:
 *   1. Pull the current window from the GSC MCP with dimensions ["page"] over a
 *      window the same length as the baseline (87 days), and save the `data`
 *      array to a JSON file.
 *   2. node scripts/compare-retitle-baseline.mjs <snapshot.json>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = path.join(
  ROOT,
  '.content-os/reports/seo-core-2026-09-07/data/retitle-baseline-2026-09-04.csv',
);

const MIN_IMPRESSIONS = 30; // below this the page cannot show a real move
const MIN_POSITION_DELTA = 1.0;

function readBaseline() {
  const [, ...lines] = fs.readFileSync(BASELINE, 'utf8').trim().split('\n');
  return lines.map((line) => {
    const [slug, collection, clicks, impressions, position] = line.split(',');
    return {
      slug,
      collection,
      clicks: Number(clicks),
      impressions: Number(impressions),
      // A page with no impressions has no position; empty stays empty rather
      // than becoming 0, which would read as rank 0 and invert every comparison.
      position: position === '' || position === undefined ? null : Number(position),
    };
  });
}

/** GSC returns full URLs; the baseline is keyed by slug. */
function slugOf(url) {
  const parts = url.replace(/\/$/, '').split('/');
  return parts[parts.length - 1];
}

function main() {
  const snapshotPath = process.argv[2];
  if (!snapshotPath) {
    console.error('Usage: node scripts/compare-retitle-baseline.mjs <snapshot.json>');
    console.error('The snapshot is the `data` array from a GSC query with dimensions ["page"].');
    process.exit(1);
  }

  const baseline = readBaseline();
  const raw = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const rows = Array.isArray(raw) ? raw : raw.data;
  if (!Array.isArray(rows)) {
    console.error('Snapshot must be an array of rows, or an object with a `data` array.');
    process.exit(1);
  }

  // www and apex are separate rows in GSC; fold them so a page is not split.
  const now = new Map();
  for (const row of rows) {
    const slug = slugOf(row.page);
    const prev = now.get(slug);
    if (!prev) {
      now.set(slug, { clicks: row.clicks, impressions: row.impressions, position: row.position });
      continue;
    }
    const total = prev.impressions + row.impressions;
    now.set(slug, {
      clicks: prev.clicks + row.clicks,
      impressions: total,
      // Impression-weighted, because GSC position is an average over impressions.
      position: total
        ? (prev.position * prev.impressions + row.position * row.impressions) / total
        : prev.position,
    });
  }

  const conclusive = [];
  const inconclusive = [];
  for (const base of baseline) {
    const after = now.get(base.slug) ?? { clicks: 0, impressions: 0, position: null };
    const entry = {
      slug: base.slug,
      before: base,
      after,
      dImp: after.impressions - base.impressions,
      dPos:
        base.position === null || after.position === null
          ? null
          : // Lower position is better, so a drop in the number is a gain.
            base.position - after.position,
    };
    (base.impressions >= MIN_IMPRESSIONS ? conclusive : inconclusive).push(entry);
  }

  const fmt = (n, d = 1) => (n === null ? '  n/a' : n.toFixed(d).padStart(5));
  const sign = (n) => (n === null ? '  n/a' : (n > 0 ? '+' : '') + n.toFixed(1));

  console.log(`\nBaseline: ${path.relative(ROOT, BASELINE)}`);
  console.log(`Snapshot: ${snapshotPath}`);
  console.log(
    `\nConclusive (baseline impressions >= ${MIN_IMPRESSIONS}). ` +
      `A position move counts only if larger than ${MIN_POSITION_DELTA}.\n`,
  );
  console.log(
    `${'page'.padEnd(42)} ${'imp'.padStart(6)} ${'was'.padStart(6)} ${'pos'.padStart(6)} ${'was'.padStart(6)}  verdict`,
  );
  for (const e of conclusive.sort((a, b) => b.before.impressions - a.before.impressions)) {
    let verdict = 'no move';
    if (e.dPos === null) verdict = 'left the index';
    else if (Math.abs(e.dPos) > MIN_POSITION_DELTA) verdict = e.dPos > 0 ? 'GAINED' : 'LOST';
    console.log(
      `${e.slug.slice(0, 42).padEnd(42)} ${String(e.after.impressions).padStart(6)} ` +
        `${String(e.before.impressions).padStart(6)} ${fmt(e.after.position)} ${fmt(e.before.position)}  ` +
        `${verdict}${verdict === 'GAINED' || verdict === 'LOST' ? ` ${sign(e.dPos)}` : ''}`,
    );
  }

  const moved = conclusive.filter((e) => e.dPos !== null && Math.abs(e.dPos) > MIN_POSITION_DELTA);
  const gained = moved.filter((e) => e.dPos > 0);
  const totalBefore = baseline.reduce((s, b) => s + b.impressions, 0);
  const totalAfter = baseline.reduce((s, b) => s + (now.get(b.slug)?.impressions ?? 0), 0);

  console.log(
    `\n${inconclusive.length} of ${baseline.length} pages carried fewer than ${MIN_IMPRESSIONS} ` +
      `impressions before and cannot show a move either way. They are not listed.`,
  );
  console.log(
    `\nConclusive pages: ${conclusive.length}. Moved: ${moved.length} ` +
      `(${gained.length} gained, ${moved.length - gained.length} lost).`,
  );
  console.log(
    `Impressions across all 40 pages: ${totalBefore} before, ${totalAfter} after ` +
      `(${totalAfter - totalBefore >= 0 ? '+' : ''}${totalAfter - totalBefore}).`,
  );
  console.log(
    '\nRead the impression total first. Position on a small sample moves for reasons that have ' +
      'nothing to do with the page, and clicks at this volume are noise.\n',
  );
}

main();
