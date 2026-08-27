/**
 * GEO score, second attempt.
 *
 * The first rubric scored the machine-injected July corpus 90/100 and the
 * hand-written August articles 90/100: zero discriminating power, and the
 * honest middle of the corpus scored 76, below the garbage. It failed because
 * every rule was additive and pattern-shaped, so whoever was told to raise the
 * number simply produced more of the pattern.
 *
 * This one inverts the arithmetic. The score is a CEILING lowered by evidence
 * that text was produced mechanically, plus a small deterministic base for
 * properties that are expensive to fake. Crucially the deterministic stage tops
 * out at DETERMINISTIC_MAX; the last twenty points exist only behind a semantic
 * judge that reads the article against known-good and known-bad exemplars. No
 * amount of pattern editing reaches 90.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCorpusIndex, analyseDoc, plainText, words, sentences } from './corpus-signals.mjs';
import { documentSignals, sections } from './document-signals.mjs';

export const DETERMINISTIC_MAX = 75;
export const ABSOLUTE_MAX = 95;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');

let registryCache = null;
export function factRegistry() {
  if (registryCache) return registryCache;
  const p = path.join(REPO, '.content-os/facts.json');
  const raw = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : { facts: [] };
  registryCache = new Map(raw.facts.map((f) => [f.figure.toLowerCase().replace(/\s+/g, ' '), f]));
  return registryCache;
}

const QUESTION_H2 = /^(what|how|why|when|where|who|which|can|do|does|is|are|should|will)\b/i;
const PRONOUN_START = /^(it|this|they|these|those|however|but|and|also)\b/i;

/* ---------------------------------------------------------------- base ---- */

/**
 * Openers are scored on whether they answer their own heading, which is the one
 * thing the generator could never do: it restated the heading instead.
 */
function scoreOpeners(secs) {
  if (!secs.length) return 0;
  let earned = 0;
  for (const s of secs) {
    const w = words(s.firstSentence).length;
    let p = 0;
    if (w >= 18 && w <= 70) p += 0.5;
    if (!PRONOUN_START.test(s.firstSentence)) p += 0.25;
    const headingWords = new Set(words(s.heading.toLowerCase()).filter((x) => x.length > 4));
    const openerWords = new Set(words(s.firstSentence.toLowerCase()));
    const overlap = headingWords.size
      ? [...headingWords].filter((x) => openerWords.has(x)).length / headingWords.size
      : 0;
    if (overlap < 0.5) p += 0.25;
    earned += Math.min(1, p);
  }
  return (earned / secs.length) * 20;
}

function scoreEvidence(secs) {
  if (!secs.length) return 0;
  const withFigures = secs.filter((s) => /\d/.test(s.text)).length;
  const withTableOrList = secs.filter((s) => /^\s*\|/m.test(s.section) || /^\s*[-*\d]/m.test(s.section)).length;
  return (withFigures / secs.length) * 8 + (withTableOrList / secs.length) * 7;
}

function scoreStructure(secs) {
  if (!secs.length) return 0;
  const questionHeadings = secs.filter((s) => QUESTION_H2.test(s.heading) || /\?$/.test(s.heading)).length;
  const longParaShare = secs.map((s) => {
    const paras = s.section.split(/\n{2,}/).map((p) => plainText(p)).filter((p) => words(p).length > 20);
    if (!paras.length) return 0;
    return paras.filter((p) => words(p).length > 170).length / paras.length;
  });
  const bloat = longParaShare.reduce((a, b) => a + b, 0) / secs.length;
  return (questionHeadings / secs.length) * 8 + (1 - Math.min(1, bloat * 3)) * 7;
}

/** Sentence-length spread inside each section: templates emit one rhythm. */
function scoreRhythm(secs) {
  if (!secs.length) return 0;
  const cvs = secs.map((s) => {
    const L = sentences(s.text).map((x) => words(x).length);
    if (L.length < 4) return 0;
    const m = L.reduce((a, b) => a + b, 0) / L.length;
    const sd = Math.sqrt(L.reduce((a, b) => a + (b - m) ** 2, 0) / L.length);
    return m ? sd / m : 0;
  });
  const avg = cvs.reduce((a, b) => a + b, 0) / cvs.length;
  return Math.min(1, avg / 0.45) * 8;
}

/**
 * Provenance is worth ten of the seventy-five points, and it is a reward rather
 * than a penalty on purpose. Penalising an unpopulated registry would smear the
 * same complaint across every article and tell you nothing; making it a reward
 * means the points exist only after somebody has actually sourced the figures,
 * and every registry entry a change introduces is visible in review.
 */
function scoreProvenance(docId, index) {
  const registry = factRegistry();
  const doc = index.prepared.find((d) => d.id === docId);
  const re =
    /(?:(?<![A-Za-z])R\s?\d[\d,]*(?:\.\d+)?(?:\s*(?:million|bn|k))?|\d+(?:\.\d+)?%|\d[\d,]*\s*(?:business\s+)?(?:days?|weeks?|months?|years?))/gi;
  const mine = new Set((doc.text.match(re) || []).map((m) => m.trim().replace(/\s+/g, ' ').toLowerCase()));
  const loadBearing = [...mine].filter((f) => (index.figureCounts.get(f) || 0) >= LOAD_BEARING_MIN_FILES);
  if (!loadBearing.length) return 10;
  const known = loadBearing.filter((f) => registry.has(f)).length;
  return (known / loadBearing.length) * 10;
}

/* ------------------------------------------------------------ registry ---- */

/**
 * A figure used in two or more articles is a corpus-wide claim and has to be
 * registered; a figure used once is a local worked example and is free. This is
 * the rule that would have caught July: "7.5%" appeared 860 times across 59
 * files with nothing behind it, while a genuine one-off calculation is untouched.
 */
export function unregisteredSharedFigures(docId, index) {
  const registry = factRegistry();
  const doc = index.prepared.find((d) => d.id === docId);
  const re =
    /(?:(?<![A-Za-z])R\s?\d[\d,]*(?:\.\d+)?(?:\s*(?:million|bn|k))?|\d+(?:\.\d+)?%|\d[\d,]*\s*(?:business\s+)?(?:days?|weeks?|months?|years?))/gi;
  const mine = new Set((doc.text.match(re) || []).map((m) => m.trim().replace(/\s+/g, ' ').toLowerCase()));
  const out = [];
  for (const f of mine) {
    const sharedWith = index.figureCounts.get(f) || 0;
    if (sharedWith >= 2 && !registry.has(f)) out.push({ figure: f, files: sharedWith });
  }
  return out.sort((a, b) => b.files - a.files);
}

/**
 * How much of the corpus's load-bearing arithmetic the registry actually covers.
 *
 * The gate arms itself once this passes REGISTRY_GATE_COVERAGE, which lets a team
 * populate the registry incrementally instead of failing every file on day one.
 * Keeping the registry empty is not an escape: unregistered load-bearing figures
 * are penalised whether or not the gate is armed, so a thin registry costs points
 * on every article that leans on it.
 */
export const REGISTRY_GATE_COVERAGE = 0.8;
export const LOAD_BEARING_MIN_FILES = 5;

export function registryCoverage(index) {
  const registry = factRegistry();
  let total = 0;
  let known = 0;
  for (const [figure, files] of index.figureCounts) {
    if (files < LOAD_BEARING_MIN_FILES) continue;
    total += 1;
    if (registry.has(figure)) known += 1;
  }
  return { total, known, share: total ? known / total : 1 };
}

/* --------------------------------------------------------------- score ---- */

export function scoreDocument(docId, index, { requireRegistry = true } = {}) {
  const doc = index.prepared.find((d) => d.id === docId);
  const raw = doc.raw;
  const secs = sections(raw);
  const corpus = analyseDoc(docId, index);
  const signals = documentSignals(raw);

  const base =
    scoreOpeners(secs) +
    scoreEvidence(secs) +
    scoreStructure(secs) +
    scoreRhythm(secs) +
    (requireRegistry ? scoreProvenance(docId, index) : 10) +
    7;

  const penalties = [];
  const add = (points, code, detail) => {
    if (points > 0) penalties.push({ code, points: Math.round(points), detail });
  };

  if (corpus.duplicateShare > 0.02) {
    add((corpus.duplicateShare - 0.02) * 320, 'duplicated-text',
      `${(corpus.duplicateShare * 100).toFixed(1)}% of this article's 9-word sequences also appear in ${corpus.topDuplicateSources.length} other file(s)`);
  }
  if (corpus.sharedSkeletons.length > 2) {
    add((corpus.sharedSkeletons.length - 2) * 3, 'template-family',
      `${corpus.sharedSkeletons.length} sentences share a skeleton with 3+ other articles, e.g. "${corpus.sharedSkeletons[0]?.example}"`);
  }
  // A figure repeated across the corpus is only suspicious when nothing stands
  // behind it. The section 35A rate belongs in sixty articles; "14 business days"
  // in four hundred and forty-two, sourced nowhere, is the July signature.
  const registry = factRegistry();
  for (const f of corpus.saturatedFigures.filter((x) => !registry.has(x.figure)).slice(0, 6)) {
    add(4, 'stamped-figure', `"${f.figure}" appears in ${f.files} articles and is in no source registry: stamped, not researched`);
  }
  for (const e of signals.headingEchoes) {
    add(5, 'heading-echo', `"${e.heading}" is restated by its own opening sentence instead of answered`);
  }
  if (signals.openerTemplate.share > 0.35) {
    add((signals.openerTemplate.share - 0.35) * 40, 'templated-openers',
      `${Math.round(signals.openerTemplate.share * 100)}% of sections open with the same shape: "${signals.openerTemplate.shape}"`);
  }
  if (signals.crossSectionEcho.score > 0.02) {
    add((signals.crossSectionEcho.score - 0.02) * 300, 'self-repetition',
      `${Math.round(signals.crossSectionEcho.score * 100)}% of this article's 8-word sequences repeat between its own sections, worst in "${signals.crossSectionEcho.worst?.heading}"`);
  }
  for (const v of signals.unitTypeViolations.slice(0, 5)) {
    add(6, 'unit-mismatch', `"${v}" attaches a figure to something it cannot measure`);
  }
  if (signals.hedgePer1000 > 4) {
    add((signals.hedgePer1000 - 4) * 2, 'hedging', `${signals.hedgePer1000.toFixed(1)} hedge words per 1000 (hand-written articles run about 1.9)`);
  }

  const unregistered = requireRegistry ? unregisteredSharedFigures(docId, index) : [];

  const gates = [];
  if (signals.malformed.count > 0) {
    gates.push({ code: 'malformed-output', cap: 40, detail: `${signals.malformed.count} broken tokens: ${signals.malformed.samples.join(', ')}` });
  }
  if (corpus.duplicateShare > 0.10) {
    gates.push({ code: 'mass-duplication', cap: 35, detail: `${(corpus.duplicateShare * 100).toFixed(1)}% duplicated text` });
  }
  if (signals.unitTypeViolations.length > 0) {
    gates.push({ code: 'unit-mismatch', cap: 40, detail: `${signals.unitTypeViolations.length} figure(s) attached to something they cannot measure: ${signals.unitTypeViolations.slice(0, 3).join('; ')}` });
  }
  if (signals.crossSectionEcho.score > 0.08) {
    gates.push({ code: 'self-repetition', cap: 35, detail: `${Math.round(signals.crossSectionEcho.score * 100)}% of the article repeats between its own sections` });
  }
  if (signals.headingEchoes.length > 3) {
    gates.push({ code: 'echo-openers', cap: 45, detail: `${signals.headingEchoes.length} sections restate their heading` });
  }
  // A figure carried by five or more articles is load-bearing across the site and
  // has to be sourced; two to four is a soft warning, because it can still be one
  // topic legitimately touched from a few angles.
  const loadBearing = unregistered.filter((u) => u.files >= LOAD_BEARING_MIN_FILES);
  const coverage = requireRegistry ? registryCoverage(index) : { share: 1, total: 0, known: 0 };

  if (loadBearing.length > 0 && coverage.share >= REGISTRY_GATE_COVERAGE) {
    gates.push({ code: 'unregistered-claims', cap: 60,
      detail: `${loadBearing.length} load-bearing figure(s) unsourced while the registry covers ${Math.round(coverage.share * 100)}% of the corpus` });
  }

  const penaltyTotal = penalties.reduce((a, p) => a + p.points, 0);
  const gateCap = gates.length ? Math.min(...gates.map((g) => g.cap)) : DETERMINISTIC_MAX;
  const deterministic = Math.max(0, Math.min(DETERMINISTIC_MAX, Math.round(base) - penaltyTotal, gateCap));

  return {
    id: docId,
    deterministic,
    max: DETERMINISTIC_MAX,
    ceiling: ABSOLUTE_MAX,
    base: Math.round(base),
    penaltyTotal,
    penalties: penalties.sort((a, b) => b.points - a.points),
    gates,
    unregistered,
    registryCoverage: coverage,
    corpus: {
      duplicateShare: Number((corpus.duplicateShare * 100).toFixed(1)),
      sharedSkeletons: corpus.sharedSkeletons.length,
      saturatedFigures: corpus.saturatedFigures.length,
    },
    signals: {
      headingEchoes: signals.headingEchoes.length,
      crossSectionEcho: Number(signals.crossSectionEcho.score.toFixed(3)),
      unitTypeViolations: signals.unitTypeViolations.length,
      openerTemplateShare: Number(signals.openerTemplate.share.toFixed(2)),
      hedgePer1000: Number(signals.hedgePer1000.toFixed(1)),
      sections: signals.sectionCount,
      words: signals.wordCount,
    },
  };
}

export function loadCorpus(files) {
  const docs = files.map((f) => ({ id: path.basename(f), raw: fs.readFileSync(f, 'utf8') }));
  const index = buildCorpusIndex(docs);
  index.prepared.forEach((p, i) => { p.raw = docs[i].raw; });
  return index;
}

/** Used by scripts/geo-calibrate.mjs. */
export async function scoreFileForCalibration(file, peers) {
  const index = loadCorpus(peers);
  const r = scoreDocument(path.basename(file), index, { requireRegistry: false });
  return { score: r.deterministic, detail: r };
}
