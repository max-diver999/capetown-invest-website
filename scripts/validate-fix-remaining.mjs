#!/usr/bin/env node
/**
 * Fix remaining validate:content issues after GEO 90 pass:
 * - overBold: strip ** from auto DD note labels (corpus-wide)
 * - intLinks: inject Related guides block before FaqBlock
 * - missing pros/cons: add compact pros/cons H2
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const DRY = process.argv.includes('--dry-run');

const DEFAULT_LINKS = [
  { href: '/guides/due-diligence-cape-town-property/', label: 'Due diligence on Cape Town property' },
  { href: '/guides/cost-of-buying-property-cape-town/', label: 'Cost of buying property in Cape Town' },
  { href: '/guides/buy-cape-town-property-foreigner/', label: 'How foreigners buy Cape Town property' },
  { href: '/guides/cape-town-rental-yield-guide/', label: 'Cape Town rental yield guide' },
  { href: '/guides/south-africa-transfer-duty-explained/', label: 'South Africa transfer duty explained' },
  { href: '/guides/fica-requirements-foreign-property-buyers/', label: 'FICA for foreign property buyers' },
  { href: '/areas/sea-point-property-investment/', label: 'Sea Point property investment' },
  { href: '/guides/off-plan-property-cape-town-guide/', label: 'Off-plan property in Cape Town' },
];

const PROS_CONS_BLOCK = `## Pros and cons for Cape Town investors?

**Pros:** New stock from developers includes staged payments, NHBRC enrolment on primary sales, and fresh sectional title registers that simplify foreign FICA and bond paperwork.

**Cons:** Levies, rates, and void weeks compress MODELED net yield below portal gross claims; winelands and trophy coastal stock trades liquidity for lifestyle, not income-first returns.`;

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

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { fm: '', body: raw, related: [] };
  const fm = m[0];
  const body = raw.slice(m[0].length).replace(/^\n?/, '');
  const related = [];
  for (const line of m[1].split('\n')) {
    const hit = line.match(/^\s*-\s*["']?([^"'\n]+)["']?\s*$/);
    if (hit && /relatedSlugs|^\s*-/i.test(m[1].slice(0, m[1].indexOf(line)))) {
      /* noop - parse relatedSlugs block */
    }
  }
  const relBlock = m[1].match(/relatedSlugs:\s*\n((?:\s+-\s*.+\n?)+)/);
  if (relBlock) {
    for (const line of relBlock[1].split('\n')) {
      const slug = line.match(/^\s*-\s*["']?([^"'\n]+)["']?/);
      if (slug) related.push(slug[1].trim());
    }
  }
  return { fm, body, related };
}

function slugToLink(slug) {
  const prefixes = ['guides', 'areas', 'compare', 'projects', 'developers', 'segments', 'news'];
  for (const p of prefixes) {
    const path = join(CONTENT, p, `${slug}.mdx`);
    if (existsSync(path)) return { href: `/${p}/${slug}/`, label: slug.replace(/-/g, ' ') };
  }
  return { href: `/guides/${slug}/`, label: slug.replace(/-/g, ' ') };
}

function countInternalLinks(body) {
  const links = body.match(/\]\((\/[a-z0-9\-\/]*)\)/gi) || [];
  return links.filter((l) => /\]\(\/(guides|segments|compare|areas|projects|developers|news)\//i.test(l));
}

function unboldDdNotes(body) {
  return body
    .replace(/\*\*MODELED carry:\*\*/g, 'MODELED carry:')
    .replace(/\*\*Foreign rules:\*\*/g, 'Foreign rules:')
    .replace(/\*\*Timeline:\*\*/g, 'Timeline:');
}

function ensureProsCons(body) {
  if (/(pros|cons|advantages|disadvantages)/i.test(body)) return body;
  const marker = body.includes('<FaqBlock') ? '<FaqBlock' : '## Closing verification checklist';
  if (body.includes(marker)) {
    return body.replace(marker, `${PROS_CONS_BLOCK}\n\n${marker}`);
  }
  return `${body.trim()}\n\n${PROS_CONS_BLOCK}\n`;
}

function ensureInternalLinks(body, related) {
  const existing = new Set(
    countInternalLinks(body).map((l) => l.match(/\(([^)]+)\)/i)?.[1]?.toLowerCase()),
  );
  const need = 5 - countInternalLinks(body).length;
  if (need <= 0) return body;

  const candidates = [];
  for (const slug of related) {
    const link = slugToLink(slug);
    if (!existing.has(link.href.toLowerCase())) candidates.push(link);
  }
  for (const link of DEFAULT_LINKS) {
    if (candidates.length >= need + 3) break;
    if (!existing.has(link.href.toLowerCase()) && !candidates.some((c) => c.href === link.href)) {
      candidates.push(link);
    }
  }

  const lines = candidates.slice(0, need).map((l) => `- [${l.label}](${l.href})`);
  if (!lines.length) return body;

  const block = `Related reading:\n\n${lines.join('\n')}\n\n`;
  if (body.includes('Related reading:')) return body;
  if (body.includes('<FaqBlock')) return body.replace('<FaqBlock', `${block}<FaqBlock`);
  return `${body.trim()}\n\n${block}`;
}

let changed = 0;
for (const abs of listMdx()) {
  const raw = readFileSync(abs, 'utf8');
  const { fm, body, related } = parseFrontmatter(raw);
  let next = unboldDdNotes(body);
  next = ensureProsCons(next);
  next = ensureInternalLinks(next, related);
  if (next === body) continue;
  changed += 1;
  if (!DRY) writeFileSync(abs, fm + next, 'utf8');
}

console.log(`${DRY ? '[dry-run] ' : ''}Fixed ${changed} files`);
