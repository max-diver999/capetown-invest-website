#!/usr/bin/env node
/**
 * Turn recurring declarative H2s into natural questions.
 *
 * Question headings match how people actually search and how assistants quote
 * a page, and the citability rubric scores them higher for the same reason.
 * Only well-understood heading families are rewritten; anything else is left
 * alone rather than force-fitted into a question.
 *
 * Usage: node scripts/question-headings.mjs [--dry]
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'src/content');
const DRY = process.argv.includes('--dry');

const RULES = [
  [/^Pros and cons of investing in (.+)$/i, (m) => `What are the pros and cons of investing in ${m[1]}?`],
  [/^Pros and cons of buying (?:a |an )?(.+)$/i, (m) => `What are the pros and cons of buying ${m[1]}?`],
  [/^Pros and cons of (.+)$/i, (m) => `What are the pros and cons of ${m[1]}?`],
  [/^Pros, cons,? and (?:who|realistic) (.+)$/i, (m) => `What are the pros, cons and ${m[1]}?`],
  [/^Foreign buyers (in|at|and) (.+)$/i, (m) => `How do foreign buyers approach ${m[2]}?`],
  [/^Why (.+?) commands? (.+)$/i, (m) => `Why does ${m[1]} command ${m[2]}?`],
  [/^Why (.+?) (?:is|sits|yields|belongs|works) (.+)$/i, (m) => `Why ${m[1].toLowerCase().startsWith('the ') ? 'is' : 'is'} ${m[1]} ${m[2]}?`],
  [/^Matching (.+?) to your (.+)$/i, (m) => `Which ${m[1]} property fits your ${m[2]}?`],
  [/^(\d{4}) outlook for (.+)$/i, (m) => `What is the ${m[1]} outlook for ${m[2]}?`],
  [/^How to underwrite (.+)$/i, (m) => `How should you underwrite ${m[1]}?`],
  [/^Buyer scenarios?: three paths in (.+)$/i, (m) => `Which buyer profile fits ${m[1]}?`],
  [/^Buyer scenarios?: (.+)$/i, (m) => `Which buyer profile fits ${m[1]}?`],
  [/^(.+?) in numbers,? (.+)$/i, (m) => `What do the ${m[2]} numbers say about ${m[1]}?`],
  [/^Who (?:should buy|rents|the) (.+)$/i, (m) => `Who ${m[0].toLowerCase().startsWith('who rents') ? 'rents' : 'should buy'} ${m[1]}?`],
  [/^Risks to plan for with (.+?)(?: (?:Property Investment|Guide|Review))?(?: \d{4})?$/i,
    (m) => `What risks should you plan for with ${m[1]}?`],
  [/^Red flags (?:before you offer|to check)(?: (?:in|on) (.+))?$/i, (m) => (m[1] ? `What red flags should stop an offer in ${m[1]}?` : 'What red flags should stop your offer?')],
  [/^(.+?) checklist before you sign$/i, (m) => `What belongs on your ${m[1].toLowerCase()} checklist?`],
];

/** Headings that read badly as questions or already work as labels. */
const SKIP = /^(Quick answer|Sources|Methodology|Related|Disclaimer|Bottom line|Key takeaways|FAQ)/i;

let filesChanged = 0;
let changed = 0;
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
    let hits = 0;

    const next = body.replace(/^(#{2}) (.+)$/gm, (line, hashes, text) => {
      const heading = text.trim();
      if (heading.endsWith('?') || SKIP.test(heading)) return line;
      for (const [re, build] of RULES) {
        const m = heading.match(re);
        if (!m) continue;
        let out = build(m).replace(/\s+/g, ' ').trim();
        out = out.charAt(0).toUpperCase() + out.slice(1);
        if (out.length > 95) return line;
        hits++;
        if (samples.length < 20) samples.push(`${heading}\n     -> ${out}`);
        return `${hashes} ${out}`;
      }
      return line;
    });

    if (hits) {
      filesChanged++;
      changed += hits;
      if (!DRY) fs.writeFileSync(full, head + next);
    }
  }
}

console.log(DRY ? '— DRY RUN —' : '— APPLIED —');
console.log(`Files: ${filesChanged} | headings rewritten: ${changed}`);
samples.forEach((s) => console.log('  ', s));
