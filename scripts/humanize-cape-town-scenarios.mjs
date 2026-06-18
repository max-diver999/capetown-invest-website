#!/usr/bin/env node
/**
 * Replace generic fix-cape-town-content-gaps scenario/risk blocks with slug-specific prose.
 * Run: node scripts/humanize-cape-town-scenarios.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const dryRun = process.argv.includes('--dry-run');

const TEMPLATE_RISKS =
  /## Red flags and buyer checklist \([^)]+\)\n\nPause the deal if any item below fails\. Cape Town marketing moves fast; conveyancing and compliance move at their own pace\.\n\n[\s\S]*?(?=\n## |\n<FaqBlock|\n\*Figures|$)/g;

const TEMPLATE_SCENARIOS =
  /## Buyer scenarios for [^\n]+\n\n(?:\*\*)?Cash buyer[\s\S]*?Apply this decision framework to [^\n]+ before you sign an offer to purchase\.\n\n/g;

const WORD_PAD_SENTENCES = [
  /When underwriting [^,]+, reconcile Lightstone or deeds-office comparables with on-the-ground agent data[^\n]*\n\n/g,
  /Transfer duty on a R3m purchase can exceed R200,000[^\n]*\n\n/g,
  /Non-resident bond finance is typically capped near 50% LTV[^\n]*\n\n/g,
  /Sectional title levies in Atlantic Seaboard nodes often run R3,000 to R8,000[^\n]*\n\n/g,
  /Load-shedding stages still influence tenant retention[^\n]*\n\n/g,
  /Semigration demand supports long-let depth in City Bowl[^\n]*\n\n/g,
  /Conveyancing from accepted offer to registration commonly takes 8 to 12 weeks[^\n]*\n\n/g,
  /Capital gains tax and non-resident withholding on disposal require SARS planning[^\n]*\n\n/g,
];

function suburbFromSlug(slug) {
  return slug
    .replace(/-property-investment$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function areaBlocks(slug, suburb) {
  const atlantic = ['camps-bay', 'clifton', 'sea-point', 'bantry-bay'].some((s) => slug.startsWith(s));
  const southern = ['rondebosch', 'newlands', 'claremont', 'constantia', 'gardens', 'tamboerskloof'].some((s) =>
    slug.startsWith(s)
  );
  const value = ['woodstock', 'milnerton'].some((s) => slug.startsWith(s));
  const winelands = ['franschhoek', 'hermanus'].some((s) => slug.startsWith(s));

  let yieldNote = 'Model net yield after levies, rates, and a realistic vacancy window.';
  let lifestyleNote = 'Weight schools, commute, and security over brochure gross yield.';
  if (atlantic) {
    yieldNote = slug.startsWith('sea-point')
        ? 'Sea Point is the Atlantic Seaboard income play: rebuild net on actual levies in your block, not a Camps Bay gross screenshot.'
        : 'Atlantic Seaboard trophy stock often models under 5% net; only buy here if capital preservation or lifestyle use carries the deal.';
    lifestyleNote =
      'Trophy buyers accept lower net for sea views and resale depth; income buyers should compare Sea Point or Green Point before overpaying for a view premium.';
  } else if (southern) {
    yieldNote =
      'Southern Suburbs long-lets run steadier than STR peaks; model 3.5% to 5% net on family homes and verify school-zone premiums in the asking price.';
    lifestyleNote =
      'Semigration families pay for Herschel, Bishops, or UCT proximity; run a long-let fallback even if you plan to live in the home.';
  } else if (value) {
    yieldNote =
      'Woodstock and Milnerton can show stronger gross on paper; stress-test crime perception, levy creep, and tenant quality before you chase yield.';
    lifestyleNote =
      'First-time Cape Town buyers often start here for entry price; pair the purchase with a clear hold period and backup-power budget.';
  } else if (winelands) {
    yieldNote =
      'Winelands liquidity is thinner than the City Bowl; model longer vacancy and seasonal letting if you rely on holiday demand.';
    lifestyleNote =
      'Lifestyle and semigration buyers dominate Franschhoek and Hermanus; treat yield as a bonus, not the primary exit.';
  }

  return {
    risks: `## ${suburb} red flags before you offer

Stop if the seller will not share levy certificates, body corporate minutes, or recent comparable sales on the same street. ${suburb} listings move quickly, but conveyancing still needs clean title and FICA-ready paperwork.

- Agent quotes gross Airbnb yield without confirming City of Cape Town short-term rental rules for that building.
- Levy statements hide a pending special resolution or deferred maintenance on common property.
- Asking prices sit 10%+ above recent deeds-office sales in the same complex without a verifiable upgrade story.
- Backup power and fibre are treated as optional extras; tenants in ${suburb} increasingly discount units without both.
- Offshore funds arrive without exchange-control records that support future repatriation on resale.
`,
    scenarios: `## Buyer scenarios: three paths in ${suburb}

**Cash buyer (foreign, no SA bond):** Clear title and FICA first, then budget 8% to 12% above price for transfer duty, conveyancing, and bond cancellation on any existing loan. Record offshore transfers cleanly at entry.

**Yield-focused investor:** ${yieldNote}

**Lifestyle or semigration buyer:** ${lifestyleNote} Compare sectional title levies against freehold garden maintenance before your offer goes unconditional.
`,
  };
}

const GUIDE_BLOCKS = {
  'gross-vs-net-yield-cape-town': { removeOnly: true },
  'best-areas-invest-cape-town-2026': {
    risks: `## Area-picker red flags

Do not choose a suburb from a single gross-yield screenshot. Cape Town areas trade different risk profiles: Atlantic Seaboard prestige, City Bowl regulation, Century City convenience, Southern Suburbs schools.

- Comparing suburbs on gross rent while ignoring levy spreads that can erase 2+ yield points.
- Buying Camps Bay or Clifton for income when your hurdle rate needs 6%+ net; trophy strips rarely clear that bar.
- Ignoring short-term rental bylaws in the City Bowl before you model Airbnb income.
- Skipping [due diligence](/guides/due-diligence-cape-town-property/) because the area "always performs."
`,
    scenarios: `## Buyer scenarios: which Cape Town area fits your goal

**Income-first buyer:** Start with Sea Point and City Bowl apartments on net yield. Century City works if you want lower entry and sectional-title simplicity.

**Capital and prestige buyer:** Camps Bay, Clifton, and Bantry Bay trade liquidity and scarcity for sub-5% net. Accept that trade or move to a different area.

**Semigration family:** Southern Suburbs and Constantia win on schools and long-let depth; yields are moderate but vacancy is usually lower.

**Winelands or coast lifestyle:** Stellenbosch, Franschhoek, or Hermanus for a longer hold and lifestyle use; pair with a city income asset if you need cash flow.
`,
  },
  'highest-rental-yield-suburbs-cape-town': {
    risks: `## Yield-table red flags

Headline yield suburbs change with price cycles. A suburb that topped the table in 2024 can slip once semigration bids up entry prices.

- Ranking suburbs on gross rent divided by asking price, not transacted price.
- Ignoring levy-heavy sectional title blocks that compress net yield by 2 to 3 points.
- Assuming short-term rental rules are uniform across Cape Town; verify per building.
`,
    scenarios: `## How to use the yield ranking

**Apartment income buyer:** Shortlist Sea Point, Green Point, and Woodstock on net after levies; compare two-bedroom stock against one-bedroom liquidity.

**House investor:** Southern Suburbs and Milnerton offer different tenant profiles; model maintenance and garden costs on houses.

**Foreign cash buyer:** Yield is only half the story; confirm FICA, exchange control, and [non-resident tax](/guides/non-resident-rental-income-tax-south-africa/) before you chase the top suburb on the table.
`,
  },
  'long-term-rental-cape-town-guide': {
    risks: `## Long-let landlord red flags

- Lease template copied from a generic portal without deposit, maintenance, and load-shedding clauses suited to SA law.
- Tenant screening skipped because the market feels tight; one bad default erases a year of yield.
- Body corporate rules that cap leases or ban subletting discovered after transfer.
`,
    scenarios: `## Long-term rental buyer scenarios

**Hands-off foreign owner:** Budget 8% to 12% management, plus vacancy at four to eight weeks. Sea Point and Southern Suburbs offer the deepest professional manager pool.

**Semigration landlord:** You may self-manage at first; still model letting commission if you return overseas within three years.

**Portfolio builder:** Stack two long-lets in different nodes (City Bowl plus Southern Suburbs) to diversify tenant type without duplicating STR regulatory risk.
`,
  },
  'short-term-rental-rules-cape-town': {
    risks: `## Short-term rental compliance red flags

- Buying into a sectional title scheme where the trustees have already voted against Airbnb-style letting.
- Operating without City of Cape Town registration where required for your property class.
- Underwriting winter occupancy at summer peak rates; Atlantic Seaboard seasonality is real.
`,
    scenarios: `## Short-term rental investor scenarios

**Seasonal operator:** Camps Bay and Sea Point can lift gross income in peak months; keep a long-let fallback near 7% net if regulations tighten.

**Remote-work host:** City Bowl and Woodstock attract medium-term stays; confirm whether your scheme treats 30+ day lets differently from nightly bookings.

**First STR purchase:** Start with one unit, professional cleaning, and explicit levy approval in writing before transfer.
`,
  },
  'gross-vs-net-yield-cape-town': { removeOnly: true },
  'property-management-cape-town-cost': {
    risks: `## Property management red flags

- Manager quotes 8% to 12% but excludes VAT, maintenance markup, or renewal fees.
- No transparent reporting on rent collection, arrears, and levy payments to the body corporate.
- STR manager promises occupancy without a seasonal breakdown or repair escrow.
`,
    scenarios: `## When professional management pays off

**Overseas owner:** Management is not optional if you are not on the ground for arrears, maintenance, and municipal issues.

**Yield investor:** Compare two quotes on the same unit; net yield after fees is the only comparison that matters.

**Self-managing semigrator:** You may save fees for 12 to 24 months, but budget your time and a handover plan if you leave South Africa.
`,
  },
  'fica-requirements-foreign-property-buyers': {
    risks: `## FICA and compliance red flags

- Seller pressure to pay a deposit before your bank and attorney complete FICA on the funding path.
- Offshore transfers without the exchange-control trail your attorney needs for future repatriation.
- Using a third-party wallet or informal agent to move funds to avoid documentation.
`,
    scenarios: `## Foreign buyer FICA scenarios

**First SA purchase:** Start FICA with your SA bank and attorney before you shortlist property; timelines often take longer than buyers expect.

**Cash buyer from UK or EU:** Source-of-funds proof must match the account that wires transfer duty and purchase funds.

**Portfolio add-on:** Second purchases are faster, but still refresh FICA if your funding structure changed since the last deed.
`,
  },
  'south-africa-transfer-duty-explained': {
    risks: `## Transfer duty planning red flags

- Using rounded "10% all-in" rules of thumb instead of SARS brackets on your exact price.
- Forgetting transfer duty is due on the purchase price even when you buy cash without a bond.
- Structuring off-plan payments without clarity on which amount triggers duty timing.
`,
    scenarios: `## Who needs the transfer duty math first

**Cash foreign buyer:** Duty scales with price; on a R3m purchase you are already above R200,000 in duty alone before conveyancing.

**Bond-assisted buyer:** Duty is on the full price, not the equity you bring; model duty plus bond costs together.

**Off-plan buyer:** Confirm when duty becomes payable relative to construction milestones and occupation.
`,
  },
  'conveyancing-fees-cape-town': {
    risks: `## Conveyancing red flags

- Quote excludes VAT, deeds office fees, or bond registration on a financed deal.
- Attorney is not on your bank's panel for non-resident finance.
- Timelines promised in weeks without caveat for FICA, rates clearance, or body corporate certificates.
`,
    scenarios: `## Conveyancing scenarios by buyer type

**Foreign cash buyer:** Appoint a conveyancer early to reconcile transfer duty, trust account rules, and exchange-control letters.

**Sectional title buyer:** Levy clearance and body corporate compliance certificates often sit on the critical path; ask for realistic timelines.

**Seller in a chain:** Registration at 8 to 12 weeks is common; do not book renovation crews until the deed is lodged.
`,
  },
  'load-shedding-property-cape-town': {
    risks: `## Load-shedding due diligence red flags

- Listing markets "backup power" without specifying inverter size, battery hours, or generator share in a sectional scheme.
- Tenant lease silent on who pays for diesel or electricity top-ups during Stage 4+.
- Special levy incoming for shared generator installation not disclosed before offer.
`,
    scenarios: `## Backup power buyer scenarios

**Apartment investor:** Prefer schemes with installed inverter or solar; retrofit rights vary by trustees.

**Family semigrator:** Whole-home solar plus battery often beats generator noise in suburban streets.

**Trophy coastal buyer:** Do not assume sea-view buildings include adequate backup; verify per unit.
`,
  },
  'cape-town-water-security-property': {
    risks: `## Water security red flags

- Borehole or well advertised without proof of registration or water-use compliance.
- Estate claims "off-grid water" without maintenance history on pumps and filtration.
- Guest house STR model ignores drought restrictions that can cap occupancy amenities.
`,
    scenarios: `## Water-conscious buyer scenarios

**Suburban family buyer:** Check municipal supply history for the street and whether borehole rights transfer with title.

**Estate buyer:** HOA water infrastructure is a shared asset; review levy-funded maintenance, not only household tanks.

**Investor:** Tenants expect reliable supply; discount units in schemes with known restriction history.
`,
  },
  'nhbrc-warranty-south-africa-new-build': {
    risks: `## NHBC and new-build red flags

- Developer sales pitch without NHBRC enrollment proof for the specific phase you are buying.
- Snag list deferred to "after registration" with no written defect liability window.
- Off-plan visuals that do not match enrolled plans filed with the NHBRC.
`,
    scenarios: `## New-build buyer scenarios

**Off-plan investor:** NHBRC enrollment is your baseline; pair it with independent [snagging](/guides/snagging-inspection-new-build-cape-town/) before final payment.

**End-user semigrator:** Warranty covers structure, not finishes; budget for post-handover upgrades separately.

**Foreign buyer:** Use a project attorney and escrow-aware payment schedule; do not accelerate cash without milestone verification.
`,
  },
  'snagging-inspection-new-build-cape-town': {
    risks: `## Snagging red flags

- Developer refuses independent snag access before occupational certificate or final drawdown.
- Generic snag template with no photographic log tied to unit number and date.
- Pressure to sign happy letter before latent defects window expires.
`,
    scenarios: `## Snagging scenarios

**Off-plan end user:** Book snagging before you take occupation; cosmetic and functional lists differ from structural warranty claims.

**Investor flipping on completion:** Snag quality affects first tenant reviews; fix developer defects before marketing the let.

**Foreign absentee owner:** Appoint a local snag specialist with video walkthrough; do not rely on developer-only inspections.
`,
  },
  'security-estates-cape-town-foreign-buyers': {
    risks: `## Security estate red flags

- HOA financials not shared before offer; special levies for perimeter upgrades are common.
- Foreign ownership caps or rental restrictions in estate rules discovered late.
- Marketing conflates "estate living" with guaranteed capital growth without sales data.
`,
    scenarios: `## Estate buyer scenarios

**Family semigrator:** Estates win on schools access and uniform security; compare levy plus HOA fees against suburban freehold with private security.

**Foreign investor:** Some estates restrict short-term letting; verify rental rules in the management association constitution.

**Retirement hold:** Single-level units and medical access matter more than yield; Constantia and Winelands estates differ sharply on liquidity.
`,
  },
  'atlantic-seaboard-property-investment-guide': {
    risks: `## Atlantic Seaboard red flags

- Buying for yield in Clifton or Camps Bay when net models sit near 4% while your hurdle is 6%+.
- Ignoring wind, parking, and density factors that affect Sea Point rents but not trophy pricing.
- STR marketing without checking whether the sectional title scheme allows nightly letting.
`,
    scenarios: `## Atlantic Seaboard buyer paths

**Income buyer:** Sea Point and Green Point first; rebuild net on levies in the actual block.

**Trophy buyer:** Camps Bay, Clifton, and Bantry Bay for scarcity and hard-currency preservation; accept lower cash yield.

**Hybrid buyer:** Own Sea Point for rent and use Atlantic Seaboard lifestyle spend as a separate decision, not one blended deal.
`,
  },
  'is-cape-town-property-good-investment-2026': {
    risks: `## Macro due diligence red flags

- Basing the whole case on rand weakness without modeling local rates, vacancy, and tax on rental profit.
- Comparing Cape Town to Dubai or Lisbon on yield alone while ignoring SA-specific levy and compliance costs.
- Treating semigration headlines as guaranteed price growth in your chosen suburb.
`,
    scenarios: `## 2026 Cape Town investor profiles

**Hard-currency entry:** Rand pricing can stretch offshore budgets; pair currency logic with net yield on the specific suburb.

**Income seeker:** City Bowl and Sea Point still model strongest net on apartments; verify your building's letting rules.

**Lifestyle plus optionality:** Semigration buyers accept moderate yield for schools and security; keep an exit plan if work patterns reverse.
`,
  },
  'cape-town-property-investment-checklist': {
    risks: `## Checklist discipline red flags

- Skipping items because the agent "handles everything"; liability stays with the buyer.
- Deposit paid before FICA and exchange-control path is confirmed.
- No written levy and rates estimate on sectional title before offer.
`,
    scenarios: `## Who should run the full checklist

**First-time SA buyer:** Run every item; the expensive mistakes are predictable and documented in this guide.

**Repeat local buyer:** Still verify body corporate health and STR rules; they change faster than transfer duty brackets.

**Foreign portfolio buyer:** Add exchange-control and non-resident tax items even if the property feels similar to your last purchase.
`,
  },
};

const PROJECT_BLOCKS = {
  'oneonr-de-waterkant': {
    risks: `## One&Only De Waterkant red flags

- Branded residence premium priced without comparing unbranded De Waterkant stock on a per-square-metre basis.
- Short-term rental assumptions in a scheme where hotel management rules may limit owner letting.
- Off-plan payment schedule not aligned with construction and enrollment milestones.
`,
    scenarios: `## Who fits One&Only De Waterkant

**Trophy and lifestyle buyer:** Branded waterfront living with hotel services; yield is secondary to capital preservation and use.

**Foreign cash buyer:** Clear FICA and exchange control before reservation fees; branded stock has longer resale cycles than generic City Bowl flats.

**Investor:** Only if you accept management constraints and model net after hotel-program fees, not generic Airbnb math.
`,
  },
  'the-charlotte-cape-town': {
    risks: `## The Charlotte red flags

- CBD yield quoted on furnished nightly lets without winter occupancy stress test.
- Parking and levy structure for the specific unit not confirmed in writing.
- Comparing Charlotte net to Sea Point apartments without adjusting for CBD tenant churn.
`,
    scenarios: `## The Charlotte buyer paths

**CBD professional let:** Target corporate and medium-term tenants; furnished one-beds trade differently from family homes.

**Foreign investor:** Use professional management from day one; you are unlikely to self-manage from overseas.

**Hybrid owner-user:** Some buyers use 90 days and let the rest; verify scheme rules on owner occupation versus rental.
`,
  },
};

function blocksFor(slug, coll) {
  if (GUIDE_BLOCKS[slug]) return GUIDE_BLOCKS[slug];
  if (PROJECT_BLOCKS[slug]) return PROJECT_BLOCKS[slug];
  if (coll === 'areas') return areaBlocks(slug, suburbFromSlug(slug));
  return {
    risks: `## Red flags before you sign

- Seller unwilling to provide deeds search, levy certificates, or FICA-ready documentation before deposit.
- Yield quoted gross without levies, rates, vacancy, and management on this specific asset class.
- Offshore funds without exchange-control records for future repatriation.
`,
    scenarios: `## Buyer scenarios for this topic

**Cash foreign buyer:** Confirm title, FICA, and transfer duty in writing; budget 8% to 12% above price for closing costs.

**Yield investor:** Model net yield after levies, rates, and realistic vacancy, not portal gross figures.

**Lifestyle buyer:** Weight schools, security, fibre, and backup power alongside headline price.
`,
  };
}

function hasRichScenarios(body) {
  const beforeFaq = body.split('<FaqBlock')[0];
  const markers = (beforeFaq.match(/## (Who|Three buyer|Buyer scenarios:|Which |Landlord|Off-plan suits)/gi) || []).length;
  const hasTemplate = /## Buyer scenarios for [a-z0-9 ]+$/m.test(beforeFaq);
  return markers >= 1 && !hasTemplate;
}

function cleanWordPad(body) {
  let out = body;
  for (const re of WORD_PAD_SENTENCES) out = out.replace(re, '');
  out = out.replace(/## Closing verification notes\n\n(?=\n## |\n<FaqBlock|$)/g, '');
  return out;
}

let changed = 0;
const COLLS = ['guides', 'compare', 'areas', 'projects', 'developers'];

for (const coll of COLLS) {
  const dir = join(CONTENT, coll);
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  } catch {
    continue;
  }
  for (const name of files) {
    const slug = name.replace(/\.mdx$/, '');
    const path = join(dir, name);
    let raw = readFileSync(path, 'utf8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    const fm = fmMatch[0];
    let body = raw.slice(fm.length);
    const origBody = body;

    const hadTemplate = TEMPLATE_RISKS.test(body) || TEMPLATE_SCENARIOS.test(body);
    TEMPLATE_RISKS.lastIndex = 0;
    TEMPLATE_SCENARIOS.lastIndex = 0;

    body = body.replace(TEMPLATE_RISKS, '');
    body = body.replace(TEMPLATE_SCENARIOS, '');
    body = body.replace(/Apply this decision framework to [^\n]+ before you sign an offer to purchase\.\n\n/g, '');

    const spec = blocksFor(slug, coll);
    if (hadTemplate && !spec.removeOnly) {
      const chunk = `\n${spec.risks}\n${spec.scenarios}\n`;
      const faqIdx = body.indexOf('<FaqBlock');
      if (faqIdx !== -1) body = body.slice(0, faqIdx) + chunk + body.slice(faqIdx);
      else body = body.trimEnd() + '\n' + chunk;
    } else if (hadTemplate && spec.removeOnly) {
      // stripped only
    }

    body = cleanWordPad(body);

    // Collapse triple newlines
    body = body.replace(/\n{4,}/g, '\n\n\n');

    if (body !== origBody) {
      if (!dryRun) writeFileSync(path, fm + body);
      changed++;
      console.log(`humanized: ${coll}/${slug}`);
    }
  }
}

// Word-pad only files
const PAD_SLUGS = [
  'guides/stellenbosch-property-investment-guide',
  'guides/can-foreigners-buy-property-south-africa',
  'guides/cape-town-property-scams-avoid',
  'compare/century-city-vs-sea-point-investment',
];
for (const rel of PAD_SLUGS) {
  const path = join(CONTENT, rel + '.mdx');
  let raw = readFileSync(path, 'utf8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;
  const fm = fmMatch[0];
  let body = raw.slice(fm.length);
  const orig = body;
  body = cleanWordPad(body);
  if (rel.includes('stellenbosch')) {
    body = body.replace(
      /## Closing verification notes\n\n/,
      `## Closing verification notes\n\nWinelands buyers should match Lightstone deeds data with on-the-ground agent comps on the same road; spreads above 10% often mean stale asking prices, not a rising market.\n\n`
    );
  }
  if (body !== orig) {
    if (!dryRun) writeFileSync(path, fm + body);
    changed++;
    console.log(`humanized pad: ${rel}`);
  }
}

console.log(dryRun ? `Would change ${changed} files` : `Changed ${changed} files`);

// Header pass for fix-queue scenario/risk regex (idempotent)
const HEADER_FIXES = [
  [/## Three buyer paths in /g, '## Buyer scenarios: three paths in '],
  [/## Which Cape Town area fits your goal/g, '## Buyer scenarios: which Cape Town area fits your goal'],
  [/## How to use the yield ranking/g, '## Buyer scenarios: how to use the yield ranking'],
  [/## Long-term rental buyer scenarios/g, '## Buyer scenarios: long-term rental landlords'],
  [/## Short-term rental investor scenarios/g, '## Buyer scenarios: short-term rental investors'],
  [/## When professional management pays off/g, '## Buyer scenarios: when professional management pays off'],
  [/## Foreign buyer FICA scenarios/g, '## Buyer scenarios: foreign buyer FICA'],
  [/## Who needs the transfer duty math first/g, '## Buyer scenarios: transfer duty math'],
  [/## Conveyancing scenarios by buyer type/g, '## Buyer scenarios: conveyancing by buyer type'],
  [/## Backup power buyer scenarios/g, '## Buyer scenarios: backup power buyers'],
  [/## Water-conscious buyer scenarios/g, '## Buyer scenarios: water-conscious buyers'],
  [/## New-build buyer scenarios/g, '## Buyer scenarios: new-build buyers'],
  [/## Snagging scenarios/g, '## Buyer scenarios: snagging inspections'],
  [/## Estate buyer scenarios/g, '## Buyer scenarios: security estates'],
  [/## Atlantic Seaboard buyer paths/g, '## Buyer scenarios: Atlantic Seaboard buyer paths'],
  [/## 2026 Cape Town investor profiles/g, '## Buyer scenarios: Cape Town investors in 2026'],
  [/## Who should run the full checklist/g, '## Buyer scenarios: who should run the full checklist'],
  [/## Who fits One&Only De Waterkant/g, '## Buyer scenarios: One&Only De Waterkant'],
  [/## The Charlotte buyer paths/g, '## Buyer scenarios: The Charlotte CBD'],
  [/## Buyer scenarios for this topic/g, '## Buyer scenarios for this guide'],
];
let headerFixed = 0;
for (const coll of COLLS) {
  const dir = join(CONTENT, coll);
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  } catch {
    continue;
  }
  for (const name of files) {
    const path = join(dir, name);
    let raw = readFileSync(path, 'utf8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    const fm = fmMatch[0];
    let body = raw.slice(fm.length);
    const orig = body;
    for (const [re, rep] of HEADER_FIXES) body = body.replace(re, rep);
    if (body !== orig) {
      if (!dryRun) writeFileSync(path, fm + body);
      headerFixed++;
    }
  }
}
if (headerFixed) console.log(`${dryRun ? 'Would fix' : 'Fixed'} ${headerFixed} scenario headers`);

