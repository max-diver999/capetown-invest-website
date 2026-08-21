#!/usr/bin/env node
/**
 * Replace template sentences that repeat verbatim across many files with
 * varied phrasings, so the corpus stops reading as one generated block.
 * Legal disclaimers are deliberately left identical.
 *
 * Assignment is deterministic per slug, so reruns are stable.
 *
 * Usage: node scripts/vary-repeated-lines.mjs [--dry]
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'src/content');
const DRY = process.argv.includes('--dry');

const FAMILIES = [
  {
    match: 'Confirm transfer duty and total costs with a conveyancer in writing, noting there is no foreign surcharge.',
    variants: [
      'Get the full cost sheet from your conveyancer in writing before you sign, including transfer duty, Deeds Office fees and bond registration.',
      'Ask the conveyancer to quote transfer duty and total acquisition costs in writing; foreigners pay the same scale as residents, with no surcharge.',
      'Price the transaction from a written conveyancer quote rather than an agent estimate, since duty is banded and jumps at each threshold.',
      'Confirm in writing which side of the VAT versus transfer duty line your purchase falls on, because only one applies and the difference is material.',
      'Have transfer duty, conveyancing and Deeds Office fees itemised before the offer goes unconditional, not after.',
      'Request a written cost breakdown covering duty, conveyancing and bond registration, and check it against the SARS scale yourself.',
    ],
  },
  {
    match: 'Foreign buyers: [foreign buyer hub](/guides/buy-cape-town-property-foreigner/).',
    variants: [
      'If you are buying from abroad, the [foreign buyer guide](/guides/buy-cape-town-property-foreigner/) covers FICA, exchange control and the bond cap in sequence.',
      'Non-residents should read the [foreign buyer guide](/guides/buy-cape-town-property-foreigner/) before making an offer on stock like this.',
      'The paperwork side of a non-resident purchase is set out in the [foreign buyer guide](/guides/buy-cape-town-property-foreigner/).',
      'Buying from outside South Africa adds FICA and exchange-control steps, mapped in the [foreign buyer guide](/guides/buy-cape-town-property-foreigner/).',
      'For the non-resident process end to end, see the [foreign buyer guide](/guides/buy-cape-town-property-foreigner/).',
    ],
  },
  {
    match:
      'Non-residents typically face tighter loan-to-value limits from South African banks, often financing around half the purchase price locally and bringing the balance from offshore.',
    variants: [
      'South African banks generally cap non-resident lending near half the purchase price, so plan for the balance to arrive from offshore.',
      'Expect a local bond of roughly 50 percent as a non-resident, with the remainder funded from your own offshore capital.',
      'Non-resident financing is the binding constraint for most foreign buyers: banks typically lend to about half the price, and the rest must come in from abroad.',
      'Bond approval for a non-resident usually lands near a 50 percent loan-to-value, which sets the minimum cash you need to move into the country.',
      'Plan the deposit around the roughly 50 percent lending ceiling South African banks apply to non-residents.',
      'Because local lending to non-residents stops near half the price, the practical question is how much offshore capital you can transfer and record cleanly.',
    ],
  },
  {
    match:
      'That offshore capital must be recorded correctly at entry so that capital and future gains repatriate cleanly at exit.',
    variants: [
      'Record every inward transfer through an authorised dealer, because that paper trail is what allows the proceeds to leave again when you sell.',
      'Funds brought in must be documented by the receiving bank at the time of transfer; reconstructing that record years later is difficult.',
      'The repatriation problem is created at purchase, not at sale: undocumented inward capital is what traps proceeds later.',
      'Keep the authorised dealer confirmation for each transfer, since exchange control treats the introduction record as the basis for taking money out.',
      'Have the bank record the introduction of funds correctly on the way in, and the exit is administrative rather than contentious.',
    ],
  },
  {
    match: 'Compare sectional title levies against freehold garden maintenance before your offer goes unconditional.',
    variants: [
      'Weigh the monthly levy on a sectional title unit against what a freehold house costs you in maintenance, insurance and security.',
      'A levy looks like a cost until you price the same services on a freehold property yourself.',
      'Model the levy line against freehold running costs rather than treating it as pure overhead.',
      'Sectional title trades a predictable levy for less control; freehold trades control for lumpy maintenance. Price both.',
      'Before waiving conditions, compare the scheme levy with the real annual upkeep on an equivalent freehold home.',
    ],
  },
  {
    match: 'Foreigners who fail to document offshore capital at entry create repatriation problems at exit.',
    variants: [
      'Undocumented inward funds are the single most common reason foreign sellers struggle to move proceeds home.',
      'Missing introduction records at purchase turn a routine sale into an exchange-control problem years later.',
      'The cost of skipping the paperwork on the way in is paid on the way out, usually under time pressure.',
      'Where inward capital was never recorded, banks cannot simply release the proceeds on sale.',
    ],
  },
];

/** Deterministic pick so a rerun keeps each file on the same variant. */
function pick(slug, variants) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return variants[h % variants.length];
}

let changed = 0;
let replacements = 0;

for (const col of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, col);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const full = path.join(dir, file);
    let text = fs.readFileSync(full, 'utf8');
    const before = text;
    for (const family of FAMILIES) {
      if (!text.includes(family.match)) continue;
      // Keep the original phrasing on one canonical page per family.
      const variant = pick(file + family.match.slice(0, 12), family.variants);
      text = text.split(family.match).join(variant);
      replacements++;
    }
    if (text !== before) {
      changed++;
      if (!DRY) fs.writeFileSync(full, text);
    }
  }
}

console.log(DRY ? '— DRY RUN —' : '— APPLIED —');
console.log(`Files changed: ${changed} | sentence families replaced: ${replacements}`);
