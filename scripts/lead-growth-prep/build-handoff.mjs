#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'scripts/lead-growth-prep');
fs.mkdirSync(outDir, { recursive: true });

const queue = [
  ['https://capetown-invest.com/guides/cape-town-rates-taxes-property/', 262, 2, 9.1],
  ['https://capetown-invest.com/guides/short-term-rental-rules-cape-town/', 194, 1, 7.6],
  ['https://capetown-invest.com/guides/cape-town-property-market-forecast-2026-2027/', 157, 0, 7.8],
  ['https://capetown-invest.com/guides/buy-cape-town-property-foreigner/', 0, 0, null],
  ['https://capetown-invest.com/guides/can-foreigners-buy-property-south-africa/', 31, 0, 9.5],
  ['https://capetown-invest.com/guides/airbnb-investment-cape-town-guide/', 60, 0, 10.1],
  ['https://capetown-invest.com/areas/sea-point-property-investment/', 40, 0, 6.8],
  ['https://capetown-invest.com/areas/green-point-property-investment/', 27, 0, 6.7],
  ['https://capetown-invest.com/areas/claremont-property-investment/', 10, 1, 5.3],
  ['https://capetown-invest.com/compare/cape-town-vs-dubai-property-investment/', 8, 1, 4.2],
  ['https://capetown-invest.com/compare/western-cape-vs-gauteng-property-investment/', 12, 1, 9.2],
  ['https://capetown-invest.com/get-shortlist/', 1, 0, 11],
];

function metaForUrl(url) {
  const p = new URL(url).pathname.replace(/\/$/, '') || '/';
  if (p === '/') return 'src/pages/index.astro';
  if (p === '/get-shortlist') return 'src/pages/get-shortlist/index.astro';
  const m = p.match(/^\/(guides|areas|compare|projects|segments|developers)\/([^/]+)/);
  if (!m) return null;
  return `src/content/${m[1]}/${m[2]}.mdx`;
}

function readMeta(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  if (filePath.endsWith('.mdx')) {
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) return { title: '', desc: '' };
    const t = fm[1].match(/^title:\s*(.+)$/m);
    const d = fm[1].match(/^description:\s*(.+)$/m);
    const clean = (s) => s?.replace(/^['"]|['"]$/g, '').trim() || '';
    return { title: clean(t?.[1]), desc: clean(d?.[1]) };
  }
  const t = raw.match(/\btitle="([^"]+)"/);
  const d = raw.match(/\bdescription="([^"]+)"/);
  return { title: t?.[1] || '', desc: d?.[1] || '' };
}

const rows = queue.map(([url, imp, clk, pos], idx) => {
  const rel = metaForUrl(url);
  const fp = rel ? path.join(root, rel) : null;
  const { title, desc } = fp && fs.existsSync(fp) ? readMeta(fp) : { title: '', desc: '' };
  return { pri: idx < 3 ? 'P0' : 'P1', url, imp, clk, pos, title, desc, file: rel || 'missing' };
});

let md = `# CTR queue (12 URL)\n\nPeriod: GSC 18 Jun – 24 Jul 2026.\n\n| Pri | URL | Imp | Clk | Pos | Chars title | Chars desc | Title (current) | Description (current) | File |\n|-----|-----|-----|-----|-----|-------------|------------|-----------------|----------------------|------|\n`;
for (const r of rows) {
  const esc = (s) => s.replace(/\|/g, '/').replace(/\n/g, ' ');
  md += `| ${r.pri} | ${r.url} | ${r.imp} | ${r.clk} | ${r.pos ?? '—'} | ${r.title.length} | ${r.desc.length} | ${esc(r.title)} | ${esc(r.desc.slice(0, 120))}${r.desc.length > 120 ? '…' : ''} | \`${r.file}\` |\n`;
}
fs.writeFileSync(path.join(outDir, 'ctr-queue.md'), md);

const topSlugs = [
  'guides/cape-town-rates-taxes-property.mdx',
  'guides/short-term-rental-rules-cape-town.mdx',
  'guides/cape-town-property-market-forecast-2026-2027.mdx',
  'guides/airbnb-investment-cape-town-guide.mdx',
  'guides/cape-town-semigration-property-guide.mdx',
  'guides/can-foreigners-buy-property-south-africa.mdx',
  'guides/buy-cape-town-property-foreigner.mdx',
  'areas/sea-point-property-investment.mdx',
  'developers/devmco-group.mdx',
  'guides/nhbrc-warranty-south-africa-new-build.mdx',
];

let auditOut = '';
try {
  auditOut = execSync('node scripts/audit-all-images.mjs 2>&1', { cwd: root, encoding: 'utf8', maxBuffer: 2_000_000 });
} catch (e) {
  auditOut = (e.stdout || '') + (e.stderr || '');
}

const blocks = auditOut.split(/\n(?=\[(?:404|400)\])/);
const hits = [];
for (const block of blocks) {
  const status = block.match(/^\[(404|400)\]/);
  if (!status) continue;
  const urlLine = block.split('\n')[0];
  const files = block.split('\n').slice(1).filter((l) => l.trim().startsWith('src/'));
  for (const f of files) {
    const rel = f.trim();
    if (topSlugs.some((s) => rel.includes(s))) {
      hits.push({ status: status[1], url: urlLine, file: rel });
    }
  }
}

let img = `# Broken images on top-impression MDX (404/400 only)\n\nAudit: audit-all-images.mjs. Many 429 from Wikimedia rate limit — ignore 429 for now; fix true 404/400 below.\n\n`;
if (hits.length === 0) {
  img += 'No 404/400 on priority slugs in this run (or only 429 throttling).\n\n';
  img += 'Manual check from full audit for forecast + airbnb guides (commons FilePath URLs).\n';
} else {
  img += '| Status | File | URL snippet |\n|--------|------|-------------|\n';
  for (const h of hits) {
    img += `| ${h.status} | \`${h.file}\` | ${h.url.slice(0, 100)} |\n`;
  }
}
fs.writeFileSync(path.join(outDir, 'broken-images-top.txt'), img);

const wwwHeaders = execSync('curl -sI https://www.capetown-invest.com/ | head -5', { encoding: 'utf8' });
const apexHeaders = execSync('curl -sI https://capetown-invest.com/ | head -5', { encoding: 'utf8' });

const wwwTxt = `WWW audit — ${new Date().toISOString().slice(0, 10)}
==================

vercel.json already defines www → apex 301 (host redirect).

Live HEAD www:
${wwwHeaders}

Live HEAD apex:
${apexHeaders}

Finding: if www returns 200, redirect is NOT active on production (check Vercel domain config: www must be assigned to project + redirect rule).

Canonical on both hosts points to apex (good).

GSC still lists www URLs separately — fix redirect first, then request indexing on apex URLs only.

Expensive model: verify Vercel dashboard Domains (www + apex), redeploy if needed; do not duplicate content fixes on www host.
`;
fs.writeFileSync(path.join(outDir, 'www-audit.txt'), wwwTxt);

const readme = `# Lead growth prep (cheap pass)

Generated for handoff to expensive model. Do not edit by hand unless re-running \`node scripts/lead-growth-prep/build-handoff.mjs\`.

| File | Purpose |
|------|---------|
| ctr-queue.md | 12 URLs + current title/description |
| www-audit.txt | www/apex redirect status |
| broken-images-top.txt | 404/400 on high-impression MDX |
| README.md | this file |

## Already done in repo (cheap pass)

- LeadForm: \`lead_submit\` GA4 via investGulfTrack when API accepted !== false; spam → /thanks/ without event; real lead → /thanks/?lead=1 (+ generate_lead on thanks page)
- CtaBox.astro component ready (insert into MDX by expensive model)
- test-lead-spam-gate.mjs: ALL PASS

## Not deployed until push

Commit LeadForm + CtaBox when ready for production.
`;
fs.writeFileSync(path.join(outDir, 'README.md'), readme);

console.log('Wrote', outDir);
