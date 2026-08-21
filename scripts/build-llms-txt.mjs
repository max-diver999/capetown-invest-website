#!/usr/bin/env node
/**
 * Generate public/llms.txt and public/llms-full.txt from the live corpus, so
 * the AI-facing digest cannot drift from what the site actually publishes.
 *
 * Usage: node scripts/build-llms-txt.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('src/content');
const SITE = 'https://capetown-invest.com';

const COLLECTIONS = [
  ['guides', 'Guides', 'Buying process, tax, yields, visas, due diligence'],
  ['areas', 'Areas', 'Suburb-level prices, modelled yields, tenant demand'],
  ['projects', 'Developments', 'Independent reviews of new and off-plan schemes'],
  ['compare', 'Comparisons', 'Cape Town against other markets and suburb head-to-heads'],
  ['segments', 'Buyer guides', 'Country-specific tax, currency and paperwork'],
  ['developers', 'Developers', 'Track record and warranty checks'],
  ['news', 'Market news', 'Dated market updates with investor implications'],
];

const PILLARS = [
  'guides/cape-town-property-investment-guide',
  'guides/buy-cape-town-property-foreigner',
  'guides/cape-town-rates-taxes-property',
  'guides/short-term-rental-rules-cape-town',
  'guides/south-africa-transfer-duty-explained',
  'guides/cape-town-rental-yield-guide',
  'guides/cape-town-property-prices-by-suburb-2026',
];

function read(collection) {
  const dir = path.join(ROOT, collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      const get = (key) => fm.match(new RegExp(`^${key}:\\s*["']?(.*?)["']?\\s*$`, 'm'))?.[1] ?? '';
      return {
        slug: file.replace(/\.mdx$/, ''),
        collection,
        title: get('title'),
        description: get('description'),
        noindex: /^noindex:\s*true/m.test(fm),
      };
    })
    .filter((e) => !e.noindex)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

const byCollection = new Map(COLLECTIONS.map(([id]) => [id, read(id)]));
const total = [...byCollection.values()].reduce((n, list) => n + list.length, 0);
const all = [...byCollection.values()].flat();
const bySlug = new Map(all.map((e) => [`${e.collection}/${e.slug}`, e]));

const short = [
  '# Cape Town Invest',
  '',
  '> Independent English-language research on Cape Town and Western Cape property investment for foreign and non-resident buyers: ownership rules, transfer duty and municipal rates, rental yields, short-term letting law, visas, and suburb-level data.',
  '',
  `- Site: ${SITE}`,
  '- Contact: info@capetown-invest.com',
  '- Wikidata: https://www.wikidata.org/wiki/Q140810037',
  '- Editorial stance: research-first. Not a developer, agency or listing portal. Enquiries may be referred to licensed South African professionals.',
  `- Corpus: ${total} pages across ${COLLECTIONS.length} collections`,
  '',
  '## Start here',
  ...PILLARS.map((key) => {
    const entry = bySlug.get(key);
    return entry ? `- [${entry.title}](${SITE}/${key}/)` : null;
  }).filter(Boolean),
  '',
  '## Collections',
  ...COLLECTIONS.map(([id, label, note]) => `- [${label}](${SITE}/${id}/) — ${note} (${byCollection.get(id).length})`),
  '',
  '## Ask us',
  `- [Free shortlist](${SITE}/get-shortlist/)`,
  `- [Consultation](${SITE}/consultation/)`,
  `- [Contact](${SITE}/contact/)`,
  '',
  '## Full index',
  `- [llms-full.txt](${SITE}/llms-full.txt) lists every page with its summary.`,
  '',
];

const full = [
  '# Cape Town Invest — full page index',
  '',
  'Independent research on Cape Town and Western Cape property for foreign buyers. Every page below is public and indexable.',
  '',
  'Key facts used across the corpus, current at August 2026 and worth re-verifying before transacting:',
  '- Foreigners may own freehold and sectional title property in South Africa. No foreign buyer surcharge applies.',
  '- Transfer duty runs on the SARS scale effective 1 April 2025: nil to R1,210,000, then 3%, 6%, 8%, 11% and 13% on the top band above R13,310,000.',
  '- New stock sold by a VAT-registered developer carries 15% VAT instead of transfer duty, never both.',
  '- Non-residents typically borrow up to about 50% of the purchase price from South African banks.',
  '- Non-resident sellers face a withholding of 7.5% (individuals), 10% (companies) or 15% (trusts) on prices above R2m, credited against the final capital gains liability.',
  '- Capital gains inclusion is 40% for individuals and 80% for trusts and companies; the primary residence exclusion is R2m.',
  '- City of Cape Town rates exempt the first R450,000 of municipal value, then charge roughly 0.69 cents per rand per year.',
  '- A sectional title body corporate can restrict short-term letting by 75% special resolution under the STSMA.',
  '- Property ownership does not grant residency. Visa routes are separate.',
  '- Rental yields on this site are modelled and directional, not guaranteed.',
  '',
  'Sources cited across the corpus: Lightstone deeds data, FNB and John Loos research, Pam Golding and Seeff market commentary, SARS guidance, City of Cape Town by-laws and tariffs.',
  '',
  ...COLLECTIONS.flatMap(([id, label]) => [
    `## ${label} (${byCollection.get(id).length})`,
    '',
    ...byCollection.get(id).map((e) => `- [${e.title}](${SITE}/${id}/${e.slug}/): ${e.description}`),
    '',
  ]),
  '## Conversion',
  '',
  `- [Free shortlist](${SITE}/get-shortlist/): budget, area and goal, answered within one business day.`,
  `- [Consultation](${SITE}/consultation/): scoped call for foreign buyers.`,
  `- [Contact](${SITE}/contact/)`,
  '',
];

fs.writeFileSync('public/llms.txt', `${short.join('\n')}`);
fs.writeFileSync('public/llms-full.txt', `${full.join('\n')}`);
console.log(`llms.txt: ${short.length} lines | llms-full.txt: ${full.length} lines | ${total} pages indexed`);
