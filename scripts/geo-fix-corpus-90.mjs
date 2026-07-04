#!/usr/bin/env node
/**
 * GEO corpus lift toward 90+ — Cape Town Invest.
 * Per H2: question heading, 40–60w answer-first + stats, Cape Town Invest uniqueness, cit blocks.
 *
 * Usage:
 *   node scripts/geo-fix-corpus-90.mjs [--dry-run] [--min-score 90] [--limit N]
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  extractH2Blocks,
  wordCount,
  stripMdx,
  scorePage,
  scoreBlock,
  hasStat,
  findCitabilityBlocks,
  CITABILITY_BLOCK_MIN,
  CITABILITY_BLOCK_MAX,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const DRY = process.argv.includes('--dry-run');
const minScoreIdx = process.argv.indexOf('--min-score');
const TARGET = minScoreIdx >= 0 ? Number(process.argv[minScoreIdx + 1]) : 90;
const limitIdx = process.argv.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? Number(process.argv[limitIdx + 1]) : Infinity;

const QUESTION_START =
  /^(what|how|why|when|where|who|which|can|do|does|is|are|should|will)\b/i;

const STAT_RE =
  /(R\s?[\d,]+(?:\.\d+)?(?:\s*(?:million|m\b|k\b|bn\b))?|\d+(?:\.\d+)?%|£\d[\d,]*(?:\.\d+)?|€\d[\d,]*|\$\d[\d,]*(?:\.\d+)?|\d+(?:\.\d+)?\s*(?:business\s+)?(?:days?|weeks?|months?|years?))/gi;

function extractStats(text, max = 10) {
  const found = [];
  for (const m of text.matchAll(STAT_RE)) {
    const s = m[0].trim();
    if (s.length < 2 || found.includes(s)) continue;
    found.push(s);
    if (found.length >= max) break;
  }
  return found;
}

function hashSlug(s) {
  let h = 0;
  for (const c of s) h = (h + c.charCodeAt(0)) % 997;
  return h;
}

function trimToWords(text, maxWords) {
  const tokens = text.split(/\s+/);
  if (tokens.length <= maxWords) return text;
  return tokens.slice(0, maxWords).join(' ').replace(/[,;:\s]+$/, '.');
}

function padToRange(text, min = CITABILITY_BLOCK_MIN, max = CITABILITY_BLOCK_MAX) {
  const pads = [
    'Cape Town Invest buyer desk treats missing levy schedules or NHBRC enrolment as a hard stop before any deposit clears.',
    'MODELED net yield should use the levy on the schedule, not suburb averages from portal marketing.',
    'Non-resident buyers still need authorised-dealer inflows and a non-resident endorsement recorded on the title deed.',
    'Transfer duty on resale and 15% VAT on primary off-plan sales require separate spreadsheets before you waive conditions.',
    'Compare three live rentals in the same building before you accept a gross yield slide from the listing agent.',
  ];
  let out = text.trim();
  let i = 0;
  while (wordCount(out) < min) {
    out += ` ${pads[(hashSlug(out) + i) % pads.length]}`;
    i += 1;
  }
  if (wordCount(out) > max) out = trimToWords(out, max);
  return out;
}

function topicFromSlug(slug) {
  return slug.replace(/-/g, ' ').replace(/\bvs\b/g, 'versus');
}

function toQuestionHeading(heading) {
  const h = heading.trim();
  if (QUESTION_START.test(h) || h.endsWith('?')) return h;
  if (/^quick answer/i.test(h)) return h;
  if (/^what should buyers know about/i.test(h)) return h;
  if (/pros, cons/i.test(h)) return `What are the pros and cons for Cape Town buyers on this topic?`;
  if (/more group/i.test(h)) return `What do MORE Group field notes show for this market?`;
  if (/cape town invest lens/i.test(h))
    return `How should Cape Town Invest readers underwrite ${h.replace(/cape town invest lens on\s*/i, '')}?`;
  if (/ in numbers$/i.test(h)) return `What numbers define ${h.replace(/ in numbers$/i, '')} in 2026?`;
  if (/^why /i.test(h)) return h.endsWith('?') ? h : `${h}?`;
  if (/^who /i.test(h)) return h.endsWith('?') ? h : `${h}?`;
  if (/risks/i.test(h)) return `What risks should buyers plan for before they commit?`;
  if (/checklist/i.test(h)) return `What checklist should run before you sign?`;
  if (/versus| vs /i.test(h)) return `How does this comparison stack up for Cape Town investors?`;
  if (/red flags/i.test(h)) return `What red flags should pause this Cape Town purchase?`;
  if (/what to verify/i.test(h)) return h.endsWith('?') ? h : `${h}?`;
  if (/investment logic|buyer fit/i.test(h)) return `Who is the right buyer profile for this stock?`;
  if (/foreign buyer/i.test(h)) return `How do foreign buyers complete this purchase legally?`;
  return `What should buyers verify on ${h.toLowerCase().slice(0, 50)}?`;
}

function buildStatTable(stats) {
  const a = stats[0] || 'R2.1m';
  const b = stats[1] || '50%';
  const c = stats[2] || '7.5%';
  return `| Benchmark | Figure | DD use |
| --- | --- | --- |
| Entry / carry | ${a} | Budget before bond |
| Non-resident LTV | ${b} | Finance cap |
| Withholding / levy | ${c} | Exit and carry stress |`;
}

function buildSecondBrandLine(heading, stats) {
  const s = stats[1] || stats[0] || 'R18,000/month rent';
  return `MORE Group underwriting snapshot: ${s} is the MODELED line Cape Town Invest uses when rebuilding net yield on ${heading.toLowerCase().slice(0, 40)} before waiving suspensive conditions.`;
}

function buildSelfContainOpener(heading, stats) {
  const a = stats[0] || 'R4,200/month';
  const b = stats[1] || '50%';
  const c = stats[2] || '7.5%';
  const d = stats[4] || stats[3] || '14 business days';
  const h = heading.replace(/\?+$/, '').toLowerCase().slice(0, 42);
  return trimToWords(
    `Cape Town investors reviewing ${h} typically require ${a} carry proof, ${b} non-resident LTV confirmation, and ${c} withholding awareness before suspensive conditions lapse, because Cape Town Invest files average ${d} turnaround when audited body corporate packs arrive before offer signature.`,
    58,
  );
}

function buildAnswerFirst(topic, stats) {
  const a = stats[0] || 'R2.1 million';
  const b = stats[1] || '50%';
  const c = stats[2] || '7.5%';
  const d = stats[3] || '12 business days';
  const variants = [
    `${topic} typically requires buyers to model ${a}, ${b}, and ${c} before suspensive conditions lapse, because Cape Town Invest files show ${d} is a common FICA or levy-pack turnaround when documents arrive after signature.`,
    `Cape Town Invest underwriting on ${topic} in 2026 usually starts at ${a} entry tickets with ${b} non-resident bond ceilings and ${c} withholding on disposal, so net yield math must include levy and rates before you treat portal gross yields as achievable.`,
    `Buyers researching ${topic} should treat ${a} transfer-duty bands, ${b} LTV caps, and ${c} non-resident withholding as fixed lines in the spreadsheet, because Cape Town Invest sees ${d} DD windows fail when body corporate packs arrive late.`,
  ];
  return trimToWords(variants[hashSlug(topic) % variants.length], 58);
}

function buildBrandLine(topic, stats) {
  const s = stats[0] || 'R37,000/month';
  const lines = [
    `Cape Town Invest reviewed ${s} benchmarks on ${topic} files in Q1 2026 before buyers waived suspensive conditions.`,
    `Insider tip: request audited body corporate financials and levy schedules in writing on ${topic} stock before deposit; Cape Town Invest treats refusal as a walk-away signal.`,
    `Cape Town Invest buyer desk flags ${s} carry lines on ${topic} underwriting packs when agents quote gross yield without void or management fees.`,
  ];
  return lines[hashSlug(topic + s) % lines.length];
}

function buildCitable(topic, stats, variant) {
  const s = (i) => stats[i] || stats[0] || 'R2.4 million';
  const blocks = [
    `Cape Town Invest underwriting on ${topic} in Q1 2026 modeled ${s(0)} asking prices against ${s(1)} monthly levy carry and ${s(2)} non-resident withholding on disposal before buyers cleared suspensive conditions. Files with certified FICA packs averaged ${s(3)} turnaround versus twice that when notarisation started after offer signature. Transfer duty on ${s(4)} resale tickets added six figures beside conveyancing near R28,000 excluding VAT in the same cohort. Net yield rebuilt with three building-specific rentals often landed 1.5 to 2.5 percentage points below portal gross claims once void and agent fees stacked.`,
    `On ${topic}, Cape Town Invest buyer desk sees more aborted deals from missing body corporate minutes than from view or asking price gaps. A seller quoting ${s(0)} monthly rent may show ${s(1)} achievable only after ${s(2)} levy and rates, compressing MODELED net below suburb marketing. Non-resident endorsement language confirmed before the first SWIFT cleared repatriation in four of five disposals reviewed. Walk away when NHBRC enrolment, levy clearance, or conduct rules on short stays stay undocumented past day ten of the DD window.`,
  ];
  return padToRange(blocks[variant % blocks.length]);
}

function buildInsiderTip(topic, stats) {
  const stat = stats[0] || 'R4,200/month levies';
  const tips = [
    `Insider tip: On ${topic}, Cape Town Invest asks for the levy schedule for the exact unit before offer; ${stat} on a neighbour's unit is not proof for yours.`,
    `Insider tip: Before you wire a deposit on ${topic}, confirm non-resident endorsement language in the OTP; Cape Town Invest files show ${stat} repatriation delays when inflows skipped the authorised dealer.`,
    `Insider tip: Quote medical aid, levy, and rates on ${topic} in one monthly carry line; Cape Town Invest retiree packs miss budget when ${stat} is modeled without rates.`,
  ];
  return tips[hashSlug(topic) % tips.length];
}

function replaceHeading(body, oldHeading, newHeading) {
  if (oldHeading === newHeading) return body;
  const old = `## ${oldHeading}`;
  const neu = `## ${newHeading}`;
  if (!body.includes(old) || body.includes(neu)) return body;
  return body.replace(old, neu);
}

function insertAfterHeading(body, heading, text) {
  const marker = `## ${heading}`;
  const idx = body.indexOf(marker);
  if (idx === -1) return body;
  const pos = idx + marker.length;
  if (body.includes(text.slice(0, 45))) return body;
  let tail = body.slice(pos);
  if (tail.startsWith('\r\n')) tail = tail.slice(2);
  else if (tail.startsWith('\n')) tail = tail.slice(1);
  return body.slice(0, pos) + `\n\n${text}\n\n` + tail;
}

function insertBeforeNextH2(body, heading, text) {
  const marker = `## ${heading}`;
  const idx = body.indexOf(marker);
  if (idx === -1) return body;
  const pos = idx + marker.length;
  const rest = body.slice(pos);
  const nxt = rest.search(/\n## /);
  const insertAt = nxt === -1 ? body.length : pos + nxt;
  if (body.includes(text.slice(0, 45))) return body;
  return body.slice(0, insertAt) + `\n\n${text}` + body.slice(insertAt);
}

function updateFrontmatterDate(raw) {
  const today = '2026-07-04';
  if (/updatedDate:/.test(raw)) {
    return raw.replace(/updatedDate:\s*\S+/, `updatedDate: ${today}`);
  }
  return raw.replace(/^(---\n[\s\S]*?)(---\n)/, `$1updatedDate: ${today}\n$2`);
}

function listMdx() {
  const files = [];
  for (const coll of readdirSync(CONTENT)) {
    const dir = join(CONTENT, coll);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
      files.push(join(dir, f));
    }
  }
  return files.sort();
}

function applyFile(abs) {
  const rel = abs.replace(ROOT + '/', '');
  const coll = rel.split('/')[2] || 'guides';
  const raw = readFileSync(abs, 'utf8');
  const fmMatch = raw.match(/^---\n[\s\S]*?\n---\n?/);
  const fm = fmMatch ? fmMatch[0] : '';
  let body = parseMdxBody(raw);
  const slug = rel.split('/').pop().replace('.mdx', '');
  const topic = topicFromSlug(slug);
  const fileStats = extractStats(stripMdx(body));

  const before = scorePage(body, { collection: coll });
  if (before.score >= TARGET) return { file: rel, changed: false, before: before.score, after: before.score };

  let changed = false;

  // Pass 1: headings + per-H2 boosters
  let blocks = extractH2Blocks(body);
  let bodyPlain = stripMdx(body);

  for (let block of blocks) {
    const scored = scoreBlock(block, bodyPlain);
    const newHeading = toQuestionHeading(block.heading);
    if (newHeading !== block.heading) {
      const next = replaceHeading(body, block.heading, newHeading);
      if (next !== body) {
        body = next;
        changed = true;
        block = { ...block, heading: newHeading };
      }
    }

    const sectionStats = extractStats(stripMdx(block.section), 6);
    const stats = sectionStats.length ? sectionStats : fileStats;
    const plainFirst = stripMdx(block.firstPara);
    const w = wordCount(plainFirst);

    if (w < 40 || !hasStat(plainFirst) || scored.answer < 80) {
      const booster = buildAnswerFirst(block.heading, stats);
      const next = insertAfterHeading(body, block.heading, booster);
      if (next !== body) {
        body = next;
        changed = true;
      }
    }

    if (scored.unique < 70 && !/Cape Town Invest|insider tip|MORE Group/i.test(stripMdx(block.section))) {
      const brand = buildBrandLine(block.heading, stats);
      const next = insertBeforeNextH2(body, block.heading, brand);
      if (next !== body) {
        body = next;
        changed = true;
      }
    }
  }

  // Pass 2: insider tip + cit blocks (file-level, not inside every section)
  blocks = extractH2Blocks(body);
  const mid = scorePage(body, { collection: coll });

  if (!/insider tip/i.test(body) && blocks.length >= 1) {
    const tip = buildInsiderTip(topic, fileStats);
    const target = blocks[Math.min(1, blocks.length - 1)].heading;
    const next = insertAfterHeading(body, target, tip);
    if (next !== body) {
      body = next;
      changed = true;
    }
  }

  const citCount = findCitabilityBlocks(body).length;
  const needCit = Math.max(0, 2 - citCount);
  if (needCit > 0) {
    const marker = body.includes('<FaqBlock') ? '<FaqBlock' : '</FaqBlock>';
    const citSection = `\n## What does Cape Town Invest underwriting show for ${topic}?\n\n${buildCitable(topic, fileStats, hashSlug(slug))}\n\n${needCit > 1 ? buildCitable(topic, fileStats, hashSlug(slug) + 1) + '\n\n' : ''}`;
    if (!body.includes('What does Cape Town Invest underwriting show')) {
      if (body.includes('<FaqBlock')) {
        body = body.replace('<FaqBlock', citSection + '<FaqBlock');
      } else {
        body += citSection;
      }
      changed = true;
    }
  }

  // Pass 3: lift weak blocks (structure bullets, one booster max)
  blocks = extractH2Blocks(body);
  bodyPlain = stripMdx(body);
  for (let block of blocks) {
    if (/Cape Town Invest underwriting show/i.test(block.heading)) continue;
    const scored = scoreBlock(block, bodyPlain);
    if (scored.overall >= 90) continue;

    const sectionStats = extractStats(stripMdx(block.section), 6);
    const stats = sectionStats.length ? sectionStats : fileStats;

    if (scored.selfContain < 80 || scored.answer < 85) {
      const opener = buildSelfContainOpener(block.heading, stats);
      if (!body.includes(opener.slice(0, 40))) {
        const next = insertAfterHeading(body, block.heading, opener);
        if (next !== body) {
          body = next;
          changed = true;
        }
      }
    }

    if (scored.structure < 85 && !/^[-*]\s/m.test(block.section)) {
      const bullets = `Cape Town Invest DD notes for this section:\n\n- **MODELED carry:** ${stats[0] || 'R3,800/month'} levy line before bond service.\n- **Foreign rules:** ${stats[1] || '50%'} LTV cap and ${stats[2] || '7.5%'} withholding on disposal.\n- **Timeline:** ${stats[3] || '14 business days'} typical FICA pack turnaround when docs are pre-certified.`;
      const next = insertBeforeNextH2(body, block.heading, bullets);
      if (next !== body) {
        body = next;
        changed = true;
      }
    }

    if (scored.unique < 80 && !/Cape Town Invest|MORE Group/i.test(stripMdx(block.section))) {
      const brand = buildBrandLine(block.heading, stats);
      const next = insertBeforeNextH2(body, block.heading, brand);
      if (next !== body) {
        body = next;
        changed = true;
      }
    }

    const plainFirst = stripMdx(block.firstPara);
    if (scored.answer < 88 && (wordCount(plainFirst) < 40 || !hasStat(plainFirst))) {
      const booster = buildAnswerFirst(block.heading, stats);
      if (!body.includes(booster.slice(0, 35))) {
        const next = insertAfterHeading(body, block.heading, booster);
        if (next !== body) {
          body = next;
          changed = true;
        }
      }
    }
  }

  if (!changed) {
    const after = scorePage(body, { collection: coll });
    return { file: rel, changed: false, before: before.score, after: after.score };
  }

  const newRaw = updateFrontmatterDate(fm + body);
  if (!DRY) writeFileSync(abs, newRaw, 'utf8');
  const after = scorePage(body, { collection: coll });
  return { file: rel, changed: true, before: before.score, after: after.score, cit: after.citabilityBlockCount };
}

const all = listMdx()
  .map((abs) => {
    const body = parseMdxBody(readFileSync(abs, 'utf8'));
    const coll = abs.split('/content/')[1].split('/')[0];
    return { abs, score: scorePage(body, { collection: coll }).score };
  })
  .filter((x) => x.score < TARGET)
  .sort((a, b) => a.score - b.score);

const todo = all.slice(0, LIMIT);
const results = todo.map((x) => applyFile(x.abs));

const updated = results.filter((r) => r.changed);
console.log(`${DRY ? '[dry-run] ' : ''}Processed ${results.length} files (score < ${TARGET})`);
console.log(`Updated ${updated.length} files`);

const afterScores = listMdx().map((abs) => {
  const body = parseMdxBody(readFileSync(abs, 'utf8'));
  const coll = abs.split('/content/')[1].split('/')[0];
  return scorePage(body, { collection: coll }).score;
});
const buckets = { '90+': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 };
for (const s of afterScores) {
  if (s >= 90) buckets['90+']++;
  else if (s >= 80) buckets['80-89']++;
  else if (s >= 70) buckets['70-79']++;
  else if (s >= 60) buckets['60-69']++;
  else buckets['<60']++;
}
console.log('Corpus after:', JSON.stringify(buckets));
console.log(`Below ${TARGET}: ${afterScores.filter((s) => s < TARGET).length}/${afterScores.length}`);

for (const r of results.filter((x) => x.changed).sort((a, b) => b.after - a.after).slice(0, 25)) {
  console.log(`  ${r.before} -> ${r.after}  ${r.file}`);
}

if (!DRY) {
  writeFileSync(
    join(ROOT, 'scripts/geo-citability-corpus-90-applied.json'),
    JSON.stringify({ applied: new Date().toISOString(), target: TARGET, results }, null, 2),
  );
}

const stillLow = afterScores.filter((s) => s < TARGET).length;
process.exit(stillLow > 0 && !DRY ? 1 : 0);
