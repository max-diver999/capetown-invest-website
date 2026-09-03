# Аудит готовности к следующей волне контента — 2026-08-27
Веерная проверка по 7 измерениям, 73 агента, каждая находка прошла состязательную верификацию с воспроизведением.
**Итог: 66 находок, 63 подтверждены, 3 опровергнуты. 3 блокера, 5 находок блокируют запуск новой волны.**
| | |
|---|---|
| Агентов | 73 |
| Находок заявлено | 66 |
| Подтверждено после верификации | 63 |
| Опровергнуто | 3 |
| Блокеров | 3 |
| Блокируют новую волну | 5 |

## Блокирует запуск новой волны
### [BLOCKER] Transfer duty on the site's own standard R3,000,000 worked example is stated as four different amounts across nine files
- **Затронуто:** 9 files, ~16 occurrences; includes the pillar guide and two compare/ pages already rewritten in R1-R4
- **Починка:** Set every R3,000,000 duty statement to R107,356 (3.58%). Note that R106,784 is legitimate only as the bracket constant for the R2,994,801-R13,310,000 band (correct usage at south-africa-transfer-duty-explained.mdx:60, :80, :89 and foreigner-property-tax-south-africa-hub.mdx:77, :137).
### [BLOCKER] Sea Point modelled yield is stated as 4.5-6% gross / 3.5-5% net on two project pages against the registered 9.7% / 7.5% used on ~20 others; City Bowl gross spans 5% to 10%
- **Затронуто:** Sea Point: 2 project pages vs ~20; City Bowl: 6 distinct bands across projects/ and guides/
- **Починка:** Pin the project pages to the registered node figures, or state explicitly why serviced/aparthotel stock underwrites lower and give the different basis a name so it is not read as the suburb figure.
### [BLOCKER] The old, non-discriminating rubric is still `npm run geo:audit` AND is the GEO step inside qa:full at --min-score 90; it now ranks the R1-R4 rewrites as the worst files in the corpus
- **Затронуто:** package.json:15; scripts/qa-full.mjs:54-56,87-95; CLAUDE.md:16 lists `npm run geo:audit` as a standard check. 126/136 commercial files fail at the qa:full threshold.
- **Починка:** Repoint `geo:audit` at scripts/geo-score.mjs and replace the qa-full.mjs GEO step with the new scorer (or drop the step until it is repointed). Delete scripts/geo-citability-audit.mjs and scripts/lib/geo-citability-scorer.mjs once geo-calibrate's `--old` path no longer needs them.
### [MAJOR] The news collection is a near-dead branch of the graph: only 2 of 5 news pages receive any inbound body link, 3 links total
- **Затронуто:** 5 news pages; 3 inbound links from 2 source files
- **Починка:** When writing guides/compare pages that cite market movements, link the dated news note that carries the figure. Consider extending resolveRelatedEntities in src/lib/content-graph.ts with a news branch keyed on tags or area.
### [MAJOR] Wave R4 shipped a 404 internal link, and scripts/qa-audit.mjs cannot see it — its broken-link regex omits `segments` and skips prefix-less paths
- **Затронуто:** 1 live 404 link on a rewritten page; the validator blind spot covers all /segments/ body links and every prefix-less internal link corpus-wide
- **Починка:** Fix the link at src/content/segments/uk-buyers-cape-town-property.mdx:81, then change qa-audit.mjs:218 to validate every `](/…)` target against the built route set (add `segments`, and flag any internal path whose first segment is not a known collection or static route). Without this, new articles keep shipping 404s that the gate calls clean.

## Все подтверждённые находки по измерениям

### factual integrity (14)

- 🚫 **[blocker]** Transfer duty on the site's own standard R3,000,000 worked example is stated as four different amounts across nine files
  - затронуто: 9 files, ~16 occurrences; includes the pillar guide and two compare/ pages already rewritten in R1-R4
  - починка: Set every R3,000,000 duty statement to R107,356 (3.58%). Note that R106,784 is legitimate only as the bracket constant for the R2,994,801-R13,310,000 band (correct usage at south-africa-transfer-duty-explained.mdx:60, :80, :89 and foreigner-property-tax-south-africa-hub.mdx:77, :137).
- 🚫 **[blocker]** Sea Point modelled yield is stated as 4.5-6% gross / 3.5-5% net on two project pages against the registered 9.7% / 7.5% used on ~20 others; City Bowl gross spans 5% to 10%
  - затронуто: Sea Point: 2 project pages vs ~20; City Bowl: 6 distinct bands across projects/ and guides/
  - починка: Pin the project pages to the registered node figures, or state explicitly why serviced/aparthotel stock underwrites lower and give the different basis a name so it is not read as the suburb figure.
- **[major]** Transfer duty on a R4,000,000 home is given as R167,500 on one page and ">R280,000" on another; the correct R217,356 appears nowhere in the corpus
  - затронуто: 2 files; no correct R4m anchor exists anywhere in 152 files
  - починка: Replace with R217,356 (5.43%) in both places and re-derive durbanville's R230,500 total and its 8-10% claim.
- **[major]** Pillar guide's duty at R15,000,000 is R1,353,000; the SARS table gives R1,461,156 — the number looks back-derived from a round "effective 9%"
  - затронуто: 2 files (pillar guide + a compare/ page rewritten in R1-R4)
  - починка: R1,461,156, effective 9.74%. Re-check the Portugal crossover claim, which shifts once the true rate is used.
- **[major]** The foreigner tax hub still carries pre-correction 2025/26 City of Cape Town rates and a wrong R2.8m duty, and its footnote still labels the page's rates as "2025/2026"
  - затронуто: 1 file, 3 lines — but it is the hub other pages link to for rates and duty
  - починка: rates R13,952/yr (R1,163/mo), duty R91,200, footnote to "City of Cape Town residential rates for 2026/27, adopted 29 June 2026".
- **[major]** Two area pages state the prime lending rate as 11.75% "currently" against the corpus-wide and registered 10.50%, and derive foreign-buyer rates from it
  - затронуто: 2 files
  - починка: Set prime to 10.50% and recompute both derived ranges.
- **[major]** Two area pages put non-resident deposits at 30-40% and 35-45% against the registered 50% LTV cap repeated on ~40 pages
  - затронуто: 2 files against ~40 stating 50%
  - починка: Align both to the ~50% LTV / ~50% deposit position, and drop the "100% bond" line from the durbanville foreign-buyer stack.
- **[major]** Levies guide FAQ uses R900/month rates on a R4,000,000 flat (true R1,803) and a R12,000,000 Camps Bay unit that its own table caps at R2,692/month
  - затронуто: 1 file, 3 lines (FAQ frontmatter + FaqBlock duplicate + node table mismatch)
  - починка: R1,803/mo rates and a 1.7pp drag; either raise the Camps Bay premium rates band to match a R8m-R12m unit or drop the R12,000,000 reference.
- **[major]** Airbnb-yields-by-suburb guide's own table contradicts its central claim that Camps Bay yields least
  - затронуто: 1 file, table row plus 5 prose/FAQ claims
  - починка: Either restate Camps Bay's modelled revenue/entry price so the table supports the thesis, or rewrite the thesis to what the table actually shows (Camps Bay's gross STR yield is mid-pack; the argument has to be about net after management and winter, not gross). Fix the R3m/R3.5m switch.
- **[major]** Rates on an R8 million house given as R3,200/month against the rates guide's R47,232/year (R3,936/month) for the same value
  - затронуто: 1 file, 1 line
  - починка: R3,936 a month (R47,232 a year).
- **[minor]** Conveyancing guide costs the same R2,400,000 bond twice at different amounts, producing two totals for one purchase
  - затронуто: 1 file, 2 tables + quick answer
  - починка: Key the bond-registration line to the loan amount, not the purchase price, then reconcile R181,500 / R184,284 to one figure (and rebuild it on the corrected R107,356 duty).
- **[minor]** Observatory worked example nets 6.0%, not the stated "near 6.5 percent", and uses R14,400 rates where the formula gives R15,232
  - затронуто: 1 file, 1 paragraph
  - починка: State 6.0% and use R15,232 / R1,003-R1,536.
- **[minor]** "R4.2bn, up 61% from R2.66bn" is arithmetically 57.9%, and the pair is registered that way in facts.json
  - затронуто: 1 file (2 occurrences) + facts.json
  - починка: Reconcile against the source report — quote either the pair of turnover figures or the growth rate, not a pair that does not divide.
- **[note]** Val de Vie holding-cost pages quote a 2025/26 estate HOA tariff for a financial year that ended 30 June 2026
  - затронуто: 2 files (project + developer page), 6 lines
  - починка: Pull the 2026/27 published estate HOA and re-derive the R11,710 combined figure, or say explicitly that the 2026/27 tariff is not yet published.

### tooling, gates and CI wiring (13)

- 🚫 **[blocker]** The old, non-discriminating rubric is still `npm run geo:audit` AND is the GEO step inside qa:full at --min-score 90; it now ranks the R1-R4 rewrites as the worst files in the corpus
  - затронуто: package.json:15; scripts/qa-full.mjs:54-56,87-95; CLAUDE.md:16 lists `npm run geo:audit` as a standard check. 126/136 commercial files fail at the qa:full threshold.
  - починка: Repoint `geo:audit` at scripts/geo-score.mjs and replace the qa-full.mjs GEO step with the new scorer (or drop the step until it is repointed). Delete scripts/geo-citability-audit.mjs and scripts/lib/geo-citability-scorer.mjs once geo-calibrate's `--old` path no longer needs them.
- **[major]** validate:content over-counts words by ~24% because it counts JSX/markup tokens as words — 50/152 files are below their own collection minimum once markup is stripped, yet it reports 152/152 clean
  - затронуто: scripts/qa-audit.mjs:118; 50/152 files; the headline "avg 2782 words" is ~659 words/file of markup
  - починка: Reuse fix-batch-queue's bodyWordCount (or move it to scripts/lib/) inside qa-audit.mjs:118. Until then validate:content will pass a genuinely thin new article: a 1,400-word guide padded with components clears the 2,000 threshold.
- **[major]** Two gates disagree on title length: validate:content allows 45-65 chars, the push gate requires 50-60 — real titles at 47 and 49 chars pass one and fail the other
  - затронуто: 9 files carry bad-title-length in the fix queue; scripts/qa-audit.mjs:139 vs scripts/fix-batch-queue.mjs:209
  - починка: Pick one range and put it in a single shared module. A writer targeting the documented validate:content range will land a title that the push gate rejects.
- **[major]** The new scorer is manual-only — it is wired into no npm script, no hook and no QA step
  - затронуто: package.json (no geo:score / geo:calibrate script); scripts/qa-full.mjs; .githooks/pre-push
  - починка: Add `"geo:score": "node scripts/geo-score.mjs"` and `"geo:calibrate": "node scripts/geo-calibrate.mjs"`, and swap the qa-full GEO step onto geo-score.mjs. Calibration passes today, so it is safe to gate on.
- **[major]** geo-judge.mjs `final` reports a different deterministic score than geo-score.mjs for the same file (61 vs 64) because it builds the corpus index from one directory instead of the whole corpus
  - затронуто: scripts/geo-judge.mjs:141-143 — every `final` invocation
  - починка: Export corpusFiles() from geo-score.mjs (or move it into scripts/lib/geo/) and have geo-judge.mjs `final` use it. The same corpus-scoping hole geo-score.mjs was hardened against is still open in the judge path.
- **[major]** The geo-fix-corpus-90*.mjs family that produced the original garbage still exists, writes to src/content by default, and targets the discredited rubric
  - затронуто: scripts/geo-fix-corpus-90.mjs, scripts/geo-fix-corpus-90-final.mjs, scripts/geo-fix-corpus-90-cleanup.mjs
  - починка: Delete all three before the next wave. `node scripts/geo-fix-corpus-90.mjs` with no arguments rewrites every file scoring under 90 on the old rubric — which, per finding 1, is now every R1-R4 rewrite. One accidental invocation undoes four waves.
- **[major]** Two of the three qa:full:quick failures are sandbox proxy artifacts, not repo defects
  - затронуто: scripts/audit-all-images.mjs, scripts/post-deploy-smoke.mjs — results unusable from this session
  - починка: Do not treat these two as findings. Image URL health and live HTTP smoke could not be verified here and need re-running outside the sandbox. The third failure in that run (Corpus signals, exit 1) is real and is finding 3 above.
- **[minor]** The judge stage has never run: no verdicts exist, GEO_JUDGE_SECRET is set nowhere, and there is no CI to hold it — every score in this repo is deterministic-only and hard-capped at 75
  - затронуто: All 152 files. Corpus mean from `node scripts/geo-score.mjs` is 53.5/75; the 95 ceiling is unreachable in this repo.
  - починка: State scores as X/75 in all reporting, or stand up the judge: a CI job holding GEO_JUDGE_SECRET that runs `geo-judge.mjs packet` -> model -> `record`. Until then any target expressed on the 0-95 scale (e.g. "score 90") is not achievable by writing, only by the missing stage.
- **[minor]** The GEO step in qa:full:quick is vacuous — `--changed` only sees uncommitted files, so a committed new article is never scored and the step passes on 0 files
  - затронуто: scripts/geo-citability-audit.mjs:47-60; scripts/qa-full.mjs:54-55
  - починка: Use the `@{u}..HEAD` range like pre-push-gate.mjs does, so committed-but-unpushed articles are in scope. Whichever scorer ends up wired in, this argument path currently guarantees a green light.
- **[minor]** site-passport.yaml still asserts the discredited baseline as the site's GEO contract
  - затронуто: .content-os/site-passport.yaml:31-36
  - починка: Rewrite geo_baseline against scripts/geo-score.mjs (command, 0-75 scale, current mean 53.5) so the passport stops certifying a rubric that scored injected garbage 90.2 and hand-written prose 90.5.
- **[note]** All 10 files the calibration harness designates "known-good, hand-written" are simultaneously flagged as not-ready blockers by the fix queue that the pre-push gate enforces
  - затронуто: 10/10 calibration exemplars; scripts/geo-calibrate.mjs:24-35 vs scripts/fix-batch-queue.mjs:209-237
  - починка: The standard of "good" and the gate that admits content must be the same object. Either relax fix-batch-queue's thin-content/bad-title-length/missing-scenarios rules to match what the hand-written exemplars actually look like, or stop treating fix-queue not-ready rows as a hard push failure. Writing the next article to the exemplar standard currently guarantees it fails the push gate.
- **[note]** Nothing runs automatically on push: no CI config exists and the git hook is not installed in this clone
  - затронуто: repo root (no .github/); .git/hooks/ (uninstalled); .githooks/pre-push
  - починка: Context for findings 1-3: the broken old scorer does not gate a push today because nothing gates a push today. That cuts both ways — before wiring the new scorer in, run `npm run setup:hooks`, otherwise the gate exists only as a script somebody remembers to run.
- **[note]** Calibration's `bad` set is floor-clamped at exactly 0, so the gate cannot detect regression within it — the reported 68.1-point separation is partly a clamp artifact
  - затронуто: scripts/geo-calibrate.mjs:133-137 TARGETS; scripts/lib/geo/score.mjs:378
  - починка: Not a defect in the rubric — the separation is real and calibration genuinely passes. But because all 59 bad files sit on the floor, a future change that lifted them from -290 to -5 internally would leave every reported number identical and calibration would still pass. Consider asserting on pre-clamp `base - penaltyTotal` as well, so the harness can see drift before it reaches the surface.

### Cannibalisation and cross-file duplication in the current corpus (5)

- **[major]** The rental-yield cannibal pair is real but the defect is contradiction, not text overlap: three guides publish three different Woodstock/City Bowl/Green Point yields, two of which contradict facts.json
  - затронуто: 3 files: src/content/guides/cape-town-rental-yield-guide.mdx (L76,77,78), src/content/guides/gross-vs-net-yield-cape-town.mdx (L157), src/content/guides/highest-rental-yield-suburbs-cape-town.mdx (L67,69,72). Contradicts .content-os/facts.json L252,L264.
  - починка: Pick the register values (Woodstock 6.0% net, City Bowl 7.9% gross) as the single source, correct cape-town-rental-yield-guide.mdx L76-78 and gross-vs-net-yield-cape-town.mdx L157 to match, and register the remaining suburb yields (Observatory, Green Point, Woodstock gross) in facts.json so a future page cannot invent a third value. Then resolve the cannibal itself: cape-town-rental-yield-guide an
- **[major]** guides/southern-suburbs-cape-town-property and guides/stellenbosch-property-investment-guide share 188 9-grams (7.45%) — cloned semigration boilerplate, not a query cannibal
  - затронуто: 2 files at 7.45%; the underlying 179.6%/79.7% semigration block is repeated across 10 files
  - починка: Do not merge these pages — they answer different queries. In R6 strip the duplicated semigration/metro-benchmark block from both and cite guides/cape-town-semigration-property-guide once, keeping only the sentence each page needs on its own subject (school-belt demand for southern-suburbs; university plus estate demand for stellenbosch). Consider making the semigration guide the single home of the
- **[major]** Verified clean: the R1-R4 rewritten pages do NOT duplicate each other — zero pairs above 3%, worst is 2.66%
  - затронуто: 50 rewritten files, 0 defective pairs
  - починка: None needed. The batch-duplication failure mode from the earlier wave did not recur in R1-R4; whatever process produced these can be reused for R5/R6.
- **[minor]** projects/on-park-century-city and projects/skywater-century-city are the same review written twice: 253 shared 9-grams, 11.32% of the smaller file — the worst pair in the corpus
  - затронуто: 2 files: src/content/projects/on-park-century-city.mdx, src/content/projects/skywater-century-city.mdx
  - починка: Rewrite these two together in R5, not separately. The pages already have their real distinguishing axis (completed/verifiable accounts vs off-plan/staged exposure) and each states it once; everything after that is shared. Delete the shared foreign-buyer, yield-rebuild and next-steps blocks from one page and cross-link instead, and price each scheme off its own comparables rather than repeating one
- **[minor]** guides/new-developments-cape-town-2026 and guides/off-plan-property-cape-town-guide share 220 9-grams (7.93% of the smaller) — a genuine cannibal on off-plan buyer intent
  - затронуто: 2 files: src/content/guides/new-developments-cape-town-2026.mdx, src/content/guides/off-plan-property-cape-town-guide.mdx
  - починка: In R6, give off-plan-property-cape-town-guide sole ownership of the mechanics (OTP terms, NHBRC enrolment, VAT vs transfer duty, deposit/trust account, developer red flags) and strip those sections from new-developments-cape-town-2026, leaving it as a precinct/pipeline page (which precincts are active in 2026 and what is delivering) that links out for the mechanics. Note that nhbrc-warranty-south-

### internal linking and content graph integrity (8)

- 🚫 **[major]** The news collection is a near-dead branch of the graph: only 2 of 5 news pages receive any inbound body link, 3 links total
  - затронуто: 5 news pages; 3 inbound links from 2 source files
  - починка: When writing guides/compare pages that cite market movements, link the dated news note that carries the figure. Consider extending resolveRelatedEntities in src/lib/content-graph.ts with a news branch keyed on tags or area.
- **[minor]** Broken internal link: /cape-town-property-for-uk-retirees/ is missing the /segments/ prefix and 404s
  - затронуто: 1 file; 1 link; leaves segments/cape-town-property-for-uk-retirees with 0 working inbound body links
  - починка: Change to /segments/cape-town-property-for-uk-retirees/ at src/content/segments/uk-buyers-cape-town-property.mdx:81.
- **[minor]** Layer-2 entity graph is mostly dead: 22/28 projects resolve to no area page, 23/26 area pages resolve to zero projects
  - затронуто: 22 of 28 project pages, 23 of 26 area pages, 2 of 7 developer pages
  - починка: Either (a) set `area:` on each project to the matching area-page suburb (e.g. azure-camps-bay-beach → "Camps Bay", zero2one-sea-point → "Sea Point") and move the region label into the already-existing `region:` field, or (b) add a region→area-page alias map in scripts/lib or src/lib/content-graph.ts. Rename developer page `rabie-property-developers` → `rabie-property-group`, or normalise developer
- **[minor]** The ≥5 internal-link gate counts duplicates, so a page passes with 5 links to only 2 distinct destinations
  - затронуто: 10 files below 5 distinct destinations; gate logic in scripts/qa-audit.mjs affects all 152
  - починка: Dedupe before the threshold test at scripts/qa-audit.mjs:161: count `new Set(internal.map(normaliseTarget)).size`, exclude hub-root links (`](/guides/)`) and exclude self-links. Then fix the 10 files listed.
- **[minor]** Two self-referential links, one of them promising a topic that has its own dedicated page
  - затронуто: 2 files, 2 links
  - починка: Retarget src/content/guides/buy-cape-town-property-foreigner.mdx:221 to /guides/fica-requirements-foreign-property-buyers/. Replace the self-entry at src/content/guides/due-diligence-cape-town-property.mdx:242 with a real destination. Add a self-link check to scripts/qa-audit.mjs.
- **[minor]** Anchor text promises a topic the destination does not cover, while the correct destination exists
  - затронуто: 2 files, 2 links (out of 1400 anchored internal links checked)
  - починка: Retarget src/content/guides/can-foreigners-buy-property-south-africa.mdx:105 to /guides/south-africa-exchange-control-property/ and src/content/projects/rockwell-tower-cape-town.mdx:49 to /areas/v-and-a-waterfront-property-investment/.
- **[minor]** 16 orphan pages with zero inbound links from any MDX file (body links and relatedSlugs combined)
  - затронуто: 16 of 152 pages; per-collection body-inbound zeros: projects 9/28, news 3/5, compare 2/15, guides 2/67, segments 1/4, developers 1/7, areas 0/26
  - починка: Add contextual links from topically adjacent pages, or at minimum add each orphan to a relevant page's relatedSlugs. Add an orphan check to scripts/qa-audit.mjs (fail when any collection entry has zero inbound edges) so the next wave cannot create new ones.
- **[note]** qa-audit's broken-internal-link check silently ignores /segments/ links and all root-level links — proven with a live test
  - затронуто: scripts/qa-audit.mjs (link validation for 4 segments/ pages + every root-level page link corpus-wide)
  - починка: Add `segments` to the broken-link regex at scripts/qa-audit.mjs:216, and validate collection+slug as a pair against a `coll/slug` set rather than the flat `allSlugs` Set built at scripts/qa-audit.mjs:96-107 (the flat set also means a link to /guides/<slug-that-lives-in-areas>/ would pass). Add a whitelist check for root-level paths (/about/, /contact/, /consultation/, /get-shortlist/, /methodology

### frontmatter, metadata and rendered SEO surface (8)

- **[major]** scripts/build-llms-txt.mjs hardcodes the superseded rates constant, so the AI-facing digest contradicts itself
  - затронуто: scripts/build-llms-txt.mjs:103, public/llms-full.txt:12
  - починка: Update line 103 to R620,000 / roughly 0.64 cents per rand, note the R8,000,000 relief cutoff, then regenerate. Better: source that block from .content-os/facts.json instead of a literal.
- **[minor]** public/llms-full.txt still serves the pre-R3/R4 title AND description for 26 of 152 pages
  - затронуто: public/llms-full.txt (26/152 entries), public/llms.txt (1/7 entries)
  - починка: node scripts/build-llms-txt.mjs, then wire it into qa-full.mjs or the pre-push gate as a drift check (regenerate to a temp file and diff).
- **[minor]** No corpus-level uniqueness gate exists for title, description or heroImage
  - затронуто: scripts/qa-audit.mjs (all 7 collections, 152 files)
  - починка: Add a corpus pass to qa-audit.mjs that maps title / description / heroImage across all collections and fails on any value used more than once. Cheap to add and it is the guard R5/R6 will need.
- **[minor]** 24 files edited by the rates correction b7407d1 still carry an updatedDate from before the correction
  - затронуто: 24 files across guides (10), projects (8), areas (2), news (2), segments (1), developers (1)
  - починка: Set updatedDate: 2026-08-27 on those 24. Add a gate comparing frontmatter updatedDate against `git log -1 --format=%ad` for files whose body or title/description changed.
- **[minor]** Two heroImage URLs are each used on two pages, breaking the "unique hero per page" invariant
  - затронуто: 4 files; 150 unique images across 152 pages
  - починка: Swap one image in each pair from scripts/capetown-hero-images.json. The og:image is derived from heroImage, so today four pages share two social cards.
- **[minor]** Rental-yield guides: two titles compete on the same keyword set, three descriptions share the same suburb list
  - затронуто: 4 guides/ files
  - починка: When R6 reaches these, retitle cape-town-rental-yield-guide as the hub (drop "Gross vs Net" from it, since gross-vs-net-yield-cape-town owns that query) and rewrite its description to point at the cluster rather than repeat the same suburb list.
- **[note]** Four readingTime values are far outside the corpus's own words-per-minute norm
  - затронуто: 4 files
  - починка: Recompute as round(bodyWords/200) and add a qa-audit check failing when readingTime deviates from that by more than ~40%.
- **[note]** Verified clean: length gates, exact duplicates, missing fields, rendered meta
  - затронуто: 152 MDX files, 173 rendered pages
  - починка: No action. Recorded so these are not re-audited.

### build output and rendered HTML (8)

- **[major]** Visible FAQ and FAQPage JSON-LD disagree on 49 rendered pages — the FAQ is authored twice in 149 of 152 MDX files
  - затронуто: 49 rendered pages drifted; 149 of 152 MDX files structurally at risk; 10 of the 71 R1-R4 rewritten pages already affected
  - починка: Make frontmatter `faq` the single source: delete the inline `<FaqBlock items={[…]}>` from the MDX bodies and let ArticleLayout render it (that path already exists and is used by the 3 files without an inline block), or have the inline block read `frontmatter.faq`. Until then every new article written with the current template ships two copies that will drift. Add a check to scripts/qa-audit.mjs co
- **[major]** All-caps "MODELED" is rendered as body copy on 64 pages including the homepage and 13 meta descriptions
  - затронуто: 64 rendered pages (homepage + projects hub included), 13 meta descriptions, 48 source files, src/pages/index.astro:80 and :99
  - починка: Lower-case to "modelled" across src/content and src/pages/index.astro, delete .content-os/boilerplate.txt:11 (line 13 already carries the correct wording), and add a grep for /\bMODELED\b/ to the rendered audit. Note this fix also closes 25 of the 49 FAQ visible/schema mismatches for free.
- 🚫 **[major]** Wave R4 shipped a 404 internal link, and scripts/qa-audit.mjs cannot see it — its broken-link regex omits `segments` and skips prefix-less paths
  - затронуто: 1 live 404 link on a rewritten page; the validator blind spot covers all /segments/ body links and every prefix-less internal link corpus-wide
  - починка: Fix the link at src/content/segments/uk-buyers-cape-town-property.mdx:81, then change qa-audit.mjs:218 to validate every `](/…)` target against the built route set (add `segments`, and flag any internal path whose first segment is not a known collection or static route). Without this, new articles keep shipping 404s that the gate calls clean.
- **[minor]** 17 FAQPage questions are in the structured data but never render on the page (Google FAQ policy requires the answer be visible)
  - затронуто: 7 pages, 17 invisible schema questions, 10 visible questions with no schema entry
  - починка: Trim frontmatter `faq` to exactly what renders (or render everything). This is the subset of the dual-source problem that is a structured-data policy violation, not just drift, so it is worth fixing even before the architecture change.
- **[minor]** Markdown link syntax renders as literal text inside TldrBlock on 3 guide pages, and once inside FAQ JSON-LD
  - затронуто: 3 guide pages, 5 visible occurrences; 1 page with 2 raw markdown links in structured data
  - починка: Strip the markdown links from the three TldrBlock `text=` props (or give TldrBlock a `set:html` slot and pass real anchors), and de-markdown the frontmatter faq answer at sectional-title-vs-freehold-cape-town.mdx:29. Add /\]\(\// to the rendered audit's checks so it cannot recur.
- **[minor]** The rendered audit only covers the 152 MDX pages — the homepage, all 7 hubs and 9 static pages are never checked
  - затронуто: 17 built pages, incl. the homepage and all 7 collection hubs
  - починка: Enumerate dist/client/**/index.html instead of src/content when --local is used, and add a route exemption list for requireLeadForm so legal/utility pages do not produce false P0s.
- **[minor]** Homepage claims "Project reviews (21 live)" while 28 project pages are built and linked from the hub
  - затронуто: src/pages/index.astro:101, rendered on the homepage
  - починка: Derive the number from getCollection('projects').length rather than hardcoding it, so it cannot go stale when wave R5 adds or removes project pages.
- **[note]** Checked and clean: build, page coverage, JSON-LD validity, titles/descriptions, dates, sitemap
  - затронуто: whole corpus
  - починка: No action — recorded so items 1-3 of the brief are not re-checked.

### fact registry and provenance coverage (7)

- **[minor]** Registry keys are literal strings, so five renderings of already-registered facts count as unregistered across 67 file-instances
  - затронуто: 6 phantom keys, 75 file-instances; measurably drags provenance on files whose figures are already sourced
  - починка: Normalise in the tokeniser before keying: strip trailing [,.], accept the m/M suffix as million, canonicalise R2,000,000 -> R2 million, singular/plural durations. Alternatively add an "aliases" array per fact entry. Do this before R5/R6, otherwise writers using house style are penalised for correctly-sourced figures and the obvious score-chasing fix is to change house style or stuff the registry.
- **[minor]** The 80% registry gate is arithmetically unreachable: 68 of the 102 unregistered load-bearing figures are worked-example rand amounts, and the denominator grows as the corpus grows
  - затронуто: whole corpus; the gate as specified will never arm honestly
  - починка: Either raise LOAD_BEARING_MIN_FILES / exclude bare rand amounts and durations from the denominator so it measures real claims, or restate the gate as an absolute count of registered claims rather than a share. As written, the only paths to 80% are registry poisoning or never arming.
- **[minor]** Top 20 unregistered load-bearing figures, with what each actually is
  - затронуто: 102 unregistered load-bearing figures
  - починка: Real registration work is small: R8 million, the NHBRC warranty periods (3 months / 12 months / 5 years), and a R4 million site-convention entry to match the existing R3 million one. Everything else is tokeniser normalisation or figures a single-key registry cannot source. Do not treat "102 unregistered" as 102 research tasks.
- **[minor]** Corpus contradicts the registered Portuguese Golden Visa claim on a file the register does not list
  - затронуто: src/content/guides/does-buying-property-give-residency-south-africa.mdx:45 (also mirrored in the FAQ block on the same page)
  - починка: Rewrite the contrast so it does not assert a live Portuguese property route (the UAE half is fine and is separately registered as ae-*), and add the file to pt-golden-visa-property-removed.files.
- **[minor]** All 19 external claims share one asOf and one reviewBy, so the review calendar is a single cliff rather than a rolling schedule
  - затронуто: .content-os/external-claims.json, all 19 claims
  - починка: Stagger reviewBy across the six jurisdictions (e.g. PT and MU at 6 months, US and GB at 9, AE and DE at 12) so the workload arrives in batches the project can actually absorb.
- **[note]** external-claims.json file lists are wrong in both directions, and facts:review cannot detect it because it only checks file existence
  - затронуто: 2 claims; 2 stale file entries, 9 unlisted carriers
  - починка: Add a containment probe to facts-review.mjs alongside the existsSync check (each claim gets a required-pattern list) so a rewrite that drops or spreads a claim fails the review. Then split uk-non-resident-sdlt-surcharge into separate GB and SG claims — one id currently bundles two jurisdictions with one file list — and regenerate both lists from grep.
- **[note]** Five external-jurisdiction figures sit in facts.json against stated policy, buying unearned provenance for 30+ unrelated Cape Town files and escaping the review calendar
  - затронуто: .content-os/facts.json (5 of 54 entries); ~30 unrelated files receiving the provenance credit
  - починка: Move the five entries out of facts.json into external-claims.json (2% and 60% are already covered by uk-non-resident-sdlt-surcharge; 4.13% by pt-lisbon-yield; the AIMI pair by pt-aimi-bands — they are duplicates, not additions). Recheck coverage afterwards: it drops to 41/146, which is the honest number.

## Опровергнуто при верификации

- Verified clean: trailing slashes, relatedSlugs targets, slug collisions, and .astro/.ts hrefs
- The pre-push gate fails today on 56 pre-existing corpus-wide blockers, so the first push that touches any MDX is blocked by defects in unrelated files
- Registered prime lending rate (10.5%) is contradicted on four live pages, two of which assert 11.75% "currently"
