// QA audit for capetown-invest content — hard gate before publish
// Usage:
//   node scripts/qa-audit.mjs
//   node scripts/qa-audit.mjs --changed
//   node scripts/qa-audit.mjs --file guides/slug.mdx

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { runExtendedChecks } from './lib/more-content-gate.mjs';

const ROOT = decodeURIComponent(new URL('../src/content/', import.meta.url).pathname);
const COLLECTIONS = ['guides', 'segments', 'compare', 'areas', 'projects', 'developers', 'news'];
// Top-level pages under src/pages/. Kept explicit rather than globbed so that a
// deleted page fails the gate instead of quietly becoming an accepted target.
const STATIC_ROUTES = new Set([
  'about', 'consultation', 'contact', 'get-shortlist', 'methodology',
  'privacy-policy', 'site-report', 'terms', 'thanks',
]);

const BANNED_PHRASES = [
  'Regional diversification',
  'Advanced investment strategies',
  'Operational excellence',
  'Comprehensive framework',
  'Future outlook',
  'Extended due diligence checklist',
  '[VERIFY]',
  '**VERIFY:**',
  'Knowledge base',
  'KB §',
  'source needed',
];

const REGULATORY_STALE = [
  { pattern: /AED\s*750[,\s]?000.*(?:minimum|sole|single)\s*owner/i, hint: 'Dubai sole-owner AED 750K floor removed 2026 — verify DLD Cube' },
  { pattern: /750k.*investor visa.*minimum/i, hint: 'Investor visa minimum may be outdated — verify 2026 rules' },
];

const args = process.argv.slice(2);
const changedOnly = args.includes('--changed');
const fileArgIdx = args.indexOf('--file');
const singleFile = fileArgIdx !== -1 ? args[fileArgIdx + 1] : null;

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { fm: null, body: raw, fmRaw: '' };
  const fmRaw = m[1];
  const body = raw.slice(m[0].length);
  const fm = {};
  for (const line of fmRaw.split('\n')) {
    const km = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (km) fm[km[1]] = km[2].trim();
  }
  const faqCount = (fmRaw.match(/^\s*-\s*question:/gm) || []).length;
  fm.__faqCount = faqCount;
  fm.__hasFaq = /\nfaq:/.test('\n' + fmRaw);
  return { fm, body, fmRaw };
}

function auditTables(body) {
  const probs = [];
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('|')) continue;
    if (/^\|\|/.test(line)) probs.push(`tableDoublePipe:L${i + 1}`);
    if (/^\|[\s\-:|]+\|$/.test(line) && !/^\|[\s\-:|]+\|$/.test(line.replace(/\|\|/g, '|'))) {
      // handled by double pipe
    }
    if (/^\|/.test(line) && /\|/.test(line.slice(1))) {
      const cols = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (i + 1 < lines.length && /^[\|\s\-:]+$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
        const sepCols = lines[i + 1].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (sepCols.length && cols.length && sepCols.length !== cols.length) {
          probs.push(`tableColMismatch:L${i + 1}(${cols.length}vs${sepCols.length})`);
        }
      }
    }
  }
  return probs;
}

function getChangedFiles() {
  const repoRoot = decodeURIComponent(new URL('..', import.meta.url).pathname);
  try {
    const out = execSync('git diff --name-only HEAD', { encoding: 'utf8', cwd: repoRoot });
    return out
      .split('\n')
      .filter((f) => f.startsWith('src/content/') && f.endsWith('.mdx'))
      .map((f) => {
        const parts = f.replace('src/content/', '').split('/');
        return { coll: parts[0], slug: parts[1].replace('.mdx', ''), path: f };
      });
  } catch {
    return [];
  }
}

const slugsByCollection = {};
const allSlugs = new Set();
for (const c of COLLECTIONS) {
  const dir = join(ROOT, c);
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  } catch {
    /* missing collection */
  }
  slugsByCollection[c] = files.map((f) => f.replace(/\.mdx$/, ''));
  for (const s of slugsByCollection[c]) allSlugs.add(s);
}

const issues = [];
const stats = { total: 0, byColl: {}, wordSum: 0 };
const reportRows = [];

function auditFile(c, slug) {
  stats.total++;
  stats.byColl[c] = (stats.byColl[c] || 0) + 1;
  const path = join(ROOT, c, slug + '.mdx');
  const raw = readFileSync(path, 'utf8');
  const { fm, body, fmRaw } = parseFrontmatter(raw);
  // Two counts, because they answer different questions and the gate needs the
  // honest one. `rawWords` splits everything, which is what this file used to
  // measure and why a page could pass an 1,800-word gate on ~1,000 words of
  // prose: JSX props, table cells, import lines and code spans all counted.
  // `words` is prose only, so the floor below means what it says.
  // The FAQ lives in frontmatter and the layout renders it, so it is real,
  // visible content on the page. It has to be measured, or collapsing the
  // duplicate copy would silently shrink every page's word count, fact density
  // and pros/cons detection — the gates would tighten as a side effect of a
  // structural cleanup rather than by decision.
  const faqText = [...(fmRaw || '').matchAll(/^\s*(?:-\s*question|answer):\s*"(.*)"\s*$/gm)]
    .map((m) => m[1])
    .join(' ');
  const measured = `${body}\n${faqText}`;
  const rawWords = measured.split(/\s+/).filter(Boolean).length;
  const words = measured
    .replace(/^\s*(?:import|export)\s.+$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*\|.*$/gm, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .split(/\s+/).filter(Boolean).length;
  stats.wordSum += words;
  const prob = [];

  if (!fm) {
    issues.push(`[${c}/${slug}] NO frontmatter`);
    return;
  }

  for (const k of ['title', 'description', 'pubDate', 'category']) {
    if (!fm[k]) prob.push(`missing:${k}`);
  }
  if (!fm.updatedDate) prob.push('missing:updatedDate');
  if (!fm.author) prob.push('missing:author');
  if (!fm.readingTime) prob.push('missing:readingTime');

  const desc = (fm.description || '').replace(/^["']|["']$/g, '');
  if (desc && desc.length > 160) prob.push(`descLen:${desc.length}>160`);
  if (desc && desc.length < 120) prob.push(`descLen:${desc.length}<120`);

  const title = (fm.title || '').replace(/^["']|["']$/g, '');
  if (title && (title.length < 45 || title.length > 65)) prob.push(`titleLen:${title.length}`);

  const minFaq = c === 'news' ? 3 : 5;
  if (!fm.__hasFaq) prob.push('no-faq-block');
  else if (fm.__faqCount < minFaq) prob.push(`faq:${fm.__faqCount}<${minFaq}`);

  // Floors in PROSE words, not raw tokens. They are deliberately set below the
  // corpus's own hand-written exemplars — the C1/C2 articles run 1,333 to 1,423
  // prose words, and a threshold that fails those would be measuring padding
  // rather than substance. This gate is a floor against stubs; quality is the
  // scorer's job, not the word count's.
  const minW = {
    guides: 1300,
    segments: 1100,
    projects: 1000,
    compare: 900,
    areas: 950,
    developers: 950,
    news: 750,
  }[c] ?? 900;
  if (words < minW) prob.push(`words:${words}<${minW} prose`);

  if (c !== 'news' && !/quick answer|tl;dr|\*\*quick answer|\*\*tl;dr/i.test(body)) {
    prob.push('no-quick-answer');
  }

  const links = body.match(/\]\((\/[a-z0-9\-\/]*)\)/gi) || [];
  const internal = links.filter((l) =>
    /\]\(\/(guides|segments|compare|areas|projects|developers|news)\//i.test(l),
  );
  if (internal.length < 5) prob.push(`intLinks:${internal.length}<5`);
  const noTrail = internal.filter((l) => !/\/\)$/.test(l));
  if (noTrail.length) prob.push(`noTrailingSlash:${noTrail.length}`);

  if (/<\d|[\s(]>\d/.test(body)) prob.push('mdx-angle-digit');
  if (/faqs=\{/.test(body)) prob.push('FaqBlock-faqs-prop');

  const tableLines = (body.match(/^\|.*\|$/gm) || []).length;
  if (tableLines < 3) prob.push(`tables:${tableLines}<3`);
  prob.push(...auditTables(body));

  for (const phrase of BANNED_PHRASES) {
    if (body.includes(phrase) || (fmRaw && fmRaw.includes(phrase))) {
      prob.push(`banned:${phrase.slice(0, 24)}`);
    }
  }

  const extErr = [];
  runExtendedChecks({
    prefix: `[${c}/${slug}]`,
    body: measured,
    cfg: {
      minWords: minW,
      label: c,
      // Held at the values the old word-derived formula produced, so the
      // honest word count did not quietly lower the bar for figures.
      minNumericFacts: { guides: 12, segments: 9, compare: 9, areas: 9, projects: 8, developers: 8, news: 8 }[c] ?? 9,
    },
    legacyExempt: c === 'news',
    errors: extErr,
  });
  for (const e of extErr) prob.push(e.replace(`[${c}/${slug}]: `, '').replace(`[${c}/${slug}] `, ''));

  const isRegulatory = /visa|golden visa|investor visa|dld|residency/i.test(
    `${fm.title} ${(fm.tags || '').toString()} ${slug}`,
  );
  if (isRegulatory) {
    for (const { pattern, hint } of REGULATORY_STALE) {
      const m = body.match(pattern);
      if (m) {
        const start = Math.max(0, m.index - 80);
        const end = Math.min(body.length, m.index + m[0].length + 80);
        const context = body.slice(start, end);
        if (!/removed|no longer|abolished|suspended|was|previously|until|before april/i.test(context)) {
          prob.push(`regulatoryStale:${hint.slice(0, 40)}`);
        }
      }
    }
  }

  const relBlock = fmRaw.match(/relatedSlugs:\s*\n([\s\S]*?)(?:\n[a-zA-Z_]+:|$)/);
  if (relBlock) {
    const rels = (relBlock[1].match(/-\s*["']?([a-z0-9\-]+)["']?/g) || [])
      .map((r) => r.replace(/-\s*["']?/, '').replace(/["']$/, ''))
      .filter((r) => r && r !== '--');
    const bad = rels.filter((r) => r && !allSlugs.has(r));
    if (bad.length) prob.push(`relatedSlugsBad:${bad.join('|')}`);
  }

  // Every internal link is validated against the real route set, not against a
  // hand-listed subset of collections. The previous version omitted `segments`
  // and ignored any path without a collection prefix, so a live 404 on a
  // rewritten page — /cape-town-property-for-uk-retirees/ instead of
  // /segments/cape-town-property-for-uk-retirees/ — passed the gate silently.
  const badLinks = [];
  for (const m of body.matchAll(/\]\((\/[^)#\s]*)\)/g)) {
    const href = m[1];
    if (href.startsWith('/api/') || href.startsWith('/_') || href.includes('.')) continue;
    const parts = href.split('/').filter(Boolean);
    if (!parts.length) continue;
    if (COLLECTIONS.includes(parts[0])) {
      if (parts.length !== 2 || !allSlugs.has(parts[1])) badLinks.push(href);
    } else if (STATIC_ROUTES.has(parts[0])) {
      if (parts.length !== 1) badLinks.push(href);
    } else {
      // A first segment that is neither a collection nor a static route is
      // almost always a collection prefix someone forgot.
      badLinks.push(href);
    }
  }
  const uniqueBad = [...new Set(badLinks)];
  if (uniqueBad.length) prob.push(`brokenInternalLinks:${uniqueBad.join('|')}`);

  // The FAQ was authored twice — frontmatter for the JSON-LD, an inline block
  // for the visible accordion — and the two drifted on seven pages, serving
  // structured questions that never appeared. The inline blocks are gone and
  // the layout renders from frontmatter, so there is one copy and nothing to
  // keep in step.

  reportRows.push({ coll: c, slug, words, rawWords, faq: fm.__faqCount, prob });
  if (prob.length) issues.push(`[${c}/${slug}] (${words} prose / ${rawWords} raw) ${prob.join(', ')}`);
}

let filesToAudit = [];
if (singleFile) {
  const parts = singleFile.replace(/^src\/content\//, '').split('/');
  filesToAudit = [{ coll: parts[0], slug: parts[1].replace('.mdx', '') }];
} else if (changedOnly) {
  filesToAudit = getChangedFiles();
  if (!filesToAudit.length) {
    console.log('No changed MDX files — skipping audit.');
    process.exit(0);
  }
} else {
  for (const c of COLLECTIONS) {
    for (const slug of slugsByCollection[c] || []) {
      filesToAudit.push({ coll: c, slug });
    }
  }
}

for (const { coll, slug } of filesToAudit) {
  auditFile(coll, slug);
}

console.log('=== CAPE TOWN INVEST QA AUDIT ===');
console.log(`Scope: ${changedOnly ? 'changed only' : singleFile ? singleFile : 'full corpus'}`);
console.log(`Files audited: ${stats.total}`);
if (stats.total) console.log(`Avg words: ${Math.round(stats.wordSum / stats.total)}`);
console.log(`Clean: ${reportRows.filter((r) => !r.prob.length).length}/${stats.total}`);
console.log('');

const counts = {};
for (const r of reportRows) {
  for (const p of r.prob) {
    const key = p.split(':')[0];
    counts[key] = (counts[key] || 0) + 1;
  }
}
if (Object.keys(counts).length) {
  console.log('=== PROBLEM SUMMARY ===');
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
  console.log('');
  console.log('=== DETAILED ISSUES ===');
  for (const i of issues) console.log(i);
}

const failCount = reportRows.filter((r) => r.prob.length).length;
console.log(`\nArticles with issues: ${failCount}/${stats.total}`);

if (failCount > 0) {
  console.error('\n❌ validate:content FAILED');
  process.exit(1);
}
console.log('\n✅ validate:content PASSED');
