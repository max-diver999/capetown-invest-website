/**
 * Corpus-level signals: the part of the rubric a single article cannot fake.
 *
 * Everything here is measured across the whole corpus at once, because the
 * failure mode we are defending against is mechanical: an agent told to "raise
 * the score" edits many files with one templated mutation. That is invisible
 * when you score a file in isolation and obvious when you look at all of them
 * together. Measured on the labelled sets (59 machine-injected files from
 * commit 9cda569 vs 10 written by hand):
 *
 *   cross-file 9-gram duplication   15.6%  vs   1.0%
 *   sentence skeletons in 3+ files    127  vs     2
 *
 * Signals that sounded plausible and did NOT survive measurement are listed in
 * docs/GEO-SCORING.md so nobody re-adds them on intuition.
 */

const SHINGLE_N = 9;

/**
 * Passages that are meant to be identical everywhere (legal disclaimers, the
 * standing note about modelled yields). They are declared in a file rather than
 * pattern-matched, so that exempting a passage is a visible, reviewable act.
 */
let boilerplateCache = null;
export function boilerplateLines() {
  if (boilerplateCache) return boilerplateCache;
  const p = new URL('../../../.content-os/boilerplate.txt', import.meta.url);
  let lines = [];
  try {
    lines = fs.readFileSync(p, 'utf8').split('\n');
  } catch { lines = []; }
  boilerplateCache = lines
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim());
  return boilerplateCache;
}

function stripBoilerplate(text) {
  let out = text;
  for (const b of boilerplateLines()) {
    if (!b) continue;
    const re = new RegExp(b.split(' ').map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^a-zA-Z0-9]+'), 'gi');
    out = out.replace(re, ' ');
  }
  return out;
}

/** Sentence skeleton: drop the specifics, keep the shape, so paraphrase farms still collide. */
export function skeleton(sentence) {
  return sentence
    .replace(/\d[\d,.]*/g, '#')
    .replace(/\b[A-Z][a-z]+\b/g, 'X')
    .toLowerCase()
    .replace(/[^a-z#x\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 12)
    .join(' ');
}

import fs from 'node:fs';

export function plainText(raw) {
  return raw
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/^\s*(?:import|export)\s.+$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/`[^`]+`/g, ' ')
    .replace(/^\|.*$/gm, ' ')
    .replace(/^#{1,6}.*$/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Text for duplication detection only.
 *
 * plainText drops table rows because table cells are not prose and wreck the
 * rhythm and paragraph-length measures that score writing quality. But dropping
 * them here would mean a comparison table cloned across eight pages costs
 * nothing, which is exactly the mutation this detector exists to catch. So
 * duplication runs over prose plus table cell text, and the quality rubrics run
 * over prose alone.
 */
export function duplicationText(raw) {
  const tableCells = raw
    .split('\n')
    .filter((l) => /^\s*\|/.test(l) && !/^\s*\|[\s:|-]*\|?\s*$/.test(l))
    .map((l) => l.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').join(' '))
    .join(' ');
  return `${plainText(raw)} ${tableCells.replace(/\s+/g, ' ').trim()}`.trim();
}

export function words(text) {
  return text.match(/\b[\w']+\b/g) || [];
}

export function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => words(s).length > 3);
}

/** Figure phrases: "R620,000", "7.5%", "14 business days" — the unit matters, the bare digit does not. */
export function figurePhrases(text) {
  const re =
    /(?:(?<![A-Za-z])R\s?\d[\d,]*(?:\.\d+)?(?:\s*(?:million|bn|k))?|\d+(?:\.\d+)?%|\d[\d,]*(?:\.\d+)?\s*(?:business\s+)?(?:days?|weeks?|months?|years?))/gi;
  return (text.match(re) || []).map((m) => m.trim().replace(/\s+/g, ' ').toLowerCase());
}

function shingleSet(text) {
  const w = words(stripBoilerplate(text)).map((x) => x.toLowerCase());
  const out = new Set();
  for (let i = 0; i + SHINGLE_N <= w.length; i += 1) out.add(w.slice(i, i + SHINGLE_N).join(' '));
  return out;
}

/**
 * @param {{id: string, raw: string}[]} docs every article in the corpus
 */
export function buildCorpusIndex(docs) {
  const prepared = docs.map((d) => {
    const text = plainText(d.raw);
    const dupText = duplicationText(d.raw);
    return {
      id: d.id,
      text,
      shingles: shingleSet(dupText),
      sentences: sentences(stripBoilerplate(dupText)),
    };
  });

  const shingleOwners = new Map();
  const skeletonOwners = new Map();
  const figureCounts = new Map();

  for (const doc of prepared) {
    for (const s of doc.shingles) {
      if (!shingleOwners.has(s)) shingleOwners.set(s, new Set());
      shingleOwners.get(s).add(doc.id);
    }
    const seenSkeletons = new Set();
    for (const sentence of doc.sentences) {
      const sk = skeleton(sentence);
      if (!sk || seenSkeletons.has(sk)) continue;
      seenSkeletons.add(sk);
      if (!skeletonOwners.has(sk)) skeletonOwners.set(sk, new Set());
      skeletonOwners.get(sk).add(doc.id);
    }
    for (const f of new Set(figurePhrases(doc.text))) {
      figureCounts.set(f, (figureCounts.get(f) || 0) + 1);
    }
  }

  return { prepared, shingleOwners, skeletonOwners, figureCounts, docCount: prepared.length };
}

/** Thresholds are absolute, not corpus-relative: a corpus-relative rule shifts when you poison the corpus. */
export const SHARED_SKELETON_MIN_FILES = 3;
export const SATURATED_FIGURE_MIN_FILES = 8;
export const SATURATED_FIGURE_MIN_SHARE = 0.25;

export function analyseDoc(docId, index) {
  const doc = index.prepared.find((d) => d.id === docId);
  if (!doc) throw new Error(`document not in corpus index: ${docId}`);

  let duplicated = 0;
  const duplicateSources = new Map();
  for (const s of doc.shingles) {
    const owners = index.shingleOwners.get(s);
    if (owners && owners.size > 1) {
      duplicated += 1;
      for (const o of owners) if (o !== docId) duplicateSources.set(o, (duplicateSources.get(o) || 0) + 1);
    }
  }
  const duplicateShare = doc.shingles.size ? duplicated / doc.shingles.size : 0;

  const sharedSkeletons = [];
  const seen = new Set();
  for (const sentence of doc.sentences) {
    const sk = skeleton(sentence);
    if (!sk || seen.has(sk)) continue;
    seen.add(sk);
    const owners = index.skeletonOwners.get(sk);
    if (owners && owners.size >= SHARED_SKELETON_MIN_FILES) {
      sharedSkeletons.push({ skeleton: sk, files: owners.size, example: sentence.slice(0, 120) });
    }
  }

  const saturatedFigures = [];
  const minFiles = Math.max(
    SATURATED_FIGURE_MIN_FILES,
    Math.ceil(index.docCount * SATURATED_FIGURE_MIN_SHARE),
  );
  for (const f of new Set(figurePhrases(doc.text))) {
    const n = index.figureCounts.get(f) || 0;
    if (n >= minFiles) saturatedFigures.push({ figure: f, files: n });
  }

  return {
    id: docId,
    duplicateShare,
    duplicatedShingles: duplicated,
    totalShingles: doc.shingles.size,
    topDuplicateSources: [...duplicateSources.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3),
    sharedSkeletons: sharedSkeletons.sort((a, b) => b.files - a.files),
    saturatedFigures: saturatedFigures.sort((a, b) => b.files - a.files),
  };
}
