#!/usr/bin/env node
/**
 * Repair H2/H3 headings damaged by the July 2026 GEO run:
 *  - drops the trailing "?" from headings that are not questions
 *  - restores capitalisation of proper nouns and acronyms that were lowercased
 *
 * Usage: node scripts/fix-heading-case.mjs [--dry]
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'src/content');
const DRY = process.argv.includes('--dry');

const QUESTION_STARTS =
  /^(what|how|who|why|when|where|which|is|are|can|could|do|does|did|should|will|would|has|have|must|may|am)\b/i;

/** Proper nouns and acronyms the generator lowercased. Longest-first at build time. */
const TERMS = [
  'Atlantic Seaboard', 'City Bowl', 'Southern Suburbs', 'Northern Suburbs', 'West Coast',
  'Cape Town', 'Western Cape', 'South Africa', 'South African', 'Table Mountain', 'False Bay',
  'Camps Bay', 'Sea Point', 'Green Point', 'Bantry Bay', 'Hout Bay', 'Clifton', 'Fresnaye',
  'Llandudno', 'Bakoven', 'Woodstock', 'Observatory', 'Salt River', 'Gardens', 'Tamboerskloof',
  'De Waterkant', 'Constantia', 'Newlands', 'Claremont', 'Rondebosch', 'Bishopscourt',
  'Blouberg', 'Bloubergstrand', 'Table View', 'Milnerton', 'Durbanville', 'Century City',
  'Burgundy Estate', 'Somerset West', 'Stellenbosch', 'Franschhoek', 'Paarl', 'Hermanus',
  'Kalk Bay', 'Muizenberg', 'Simon’s Town', 'Val de Vie', 'Pearl Valley', 'Winelands',
  'Helderberg', 'Foreshore', 'Waterfront', 'Granger Bay', 'Silo District', 'Harbour Arch',
  'Melrose Arch', 'Makers Landing', 'Burg Street', 'Victoria Road', 'Coral Road', 'Albert Road',
  'Main Road', 'Long Street', 'Bree Street', 'Golden Acre', 'Zonnebloem',
  'Blok', 'Amdec', 'Rabie', 'Devmco', 'Growthpoint', 'Prospekt', 'Signatura', 'Berman Brothers',
  'Lightstone', 'Seeff', 'Pam Golding', 'Property24', 'FNB', 'Absa', 'Nedbank', 'Standard Bank',
  'SARS', 'SARB', 'NHBRC', 'FICA', 'PPRA', 'STSMA', 'CGT', 'VAT', 'LTV', 'REIT', 'UDZ', 'OTP',
  'HOA', 'AGM', 'POA', 'SWIFT', 'IT77', 'FBAR', 'FATCA', 'HMRC', 'SIPP', 'ITIN', 'SSN',
  'Airbnb', 'Booking.com', 'WhatsApp', 'Deeds Office', 'Home Affairs', 'Reserve Bank',
  'Cape Town Invest', 'Vivante', 'Evergreen', 'Iron Works', 'Zero2One', 'ONEHUNDREDONM',
  'Beiramar', 'Infinity', 'Azalea', 'Chester Court', 'Venice House', 'Acacia House',
  'Nine Palms', 'SkyWater', 'Rhapsody', 'Two Oceans', 'The Charlotte', 'Foreshore Place',
  'UK', 'US', 'USA', 'EU', 'UAE', 'GBP', 'USD', 'EUR', 'ZAR', 'CHF', 'British', 'German',
  'Dutch', 'French', 'American', 'Swiss', 'Portuguese', 'Mauritius', 'Lisbon', 'Dubai',
  'Durban', 'Johannesburg', 'Gauteng', 'Umhlanga', 'Sibaya', 'KZN', 'Herschel', 'Bishops',
  'UCT', 'CPUT', 'Tygerberg', 'Day Zero', 'Eskom',
].sort((a, b) => b.length - a.length);

const TERM_PATTERNS = TERMS.map((term) => ({
  term,
  re: new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
}));

function fixHeading(raw) {
  let text = raw;

  // 1. Drop "?" when the heading is not actually a question.
  if (text.endsWith('?') && !QUESTION_STARTS.test(text)) {
    text = text.slice(0, -1).trimEnd();
  }

  // 2. Restore proper-noun casing.
  for (const { term, re } of TERM_PATTERNS) {
    text = text.replace(re, term);
  }

  // 3. Sentence case: first letter, and "r2 million" style rand amounts.
  text = text.charAt(0).toUpperCase() + text.slice(1);
  text = text.replace(/\br(\d)/g, 'R$1');
  text = text.replace(/\bRand\b/g, 'rand');

  return text;
}

let filesChanged = 0;
let headingsChanged = 0;
const samples = [];

for (const col of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, col);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const full = path.join(dir, file);
    const raw = fs.readFileSync(full, 'utf8');
    const fmEnd = raw.indexOf('\n---\n', 3);
    const head = raw.slice(0, fmEnd + 5);
    const body = raw.slice(fmEnd + 5);
    let changed = 0;

    const next = body.replace(/^(#{2,3}) (.+)$/gm, (line, hashes, text) => {
      const fixed = fixHeading(text.trim());
      if (fixed !== text.trim()) {
        changed++;
        if (samples.length < 25) samples.push(`${text.trim()}  ->  ${fixed}`);
        return `${hashes} ${fixed}`;
      }
      return line;
    });

    if (changed) {
      filesChanged++;
      headingsChanged += changed;
      if (!DRY) fs.writeFileSync(full, head + next);
    }
  }
}

console.log(DRY ? '— DRY RUN —' : '— APPLIED —');
console.log(`Files: ${filesChanged} | headings fixed: ${headingsChanged}`);
console.log('\nSamples:');
samples.forEach((s) => console.log('  ', s));
