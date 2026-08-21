# Content quality audit — capetown-invest.com

Phase 0 audit and Phase 1 execution, 21 August 2026. Full findings: `.content-os/reports/AUDIT-REPORT-2026-08-21.md`.

## Where the numbers came from

The July 2026 baseline (GEO 90/100, grade A) was not real. Commit `9cda569` had injected auto-generated "citability" paragraphs under nearly every H2, and the rubric rewarded exactly those blocks: a 130-170 word paragraph containing a number scored as evidence of depth, even when the number was nonsense ("R892 non-resident LTV confirmation", "179.6% withholding on disposal"). Stripping the filler dropped the honest score to 64, and the work since has been rebuilding it with real content.

## Corpus checks (all 144 MDX)

- [x] Rates and taxes cluster consistency — outdated R1,100,000 duty table replaced with the SARS scale effective 1 April 2025; thresholds now agree across all 17 files that quote them
- [x] STR rules ↔ area pages — unsupported "75% of blocks restrict it" claim removed from the title and description; body corporate mechanics now stated correctly
- [x] Lightstone / market data / forecast / prices-by-suburb cross-links — R11.3bn attributed consistently to Atlantic Seaboard and City Bowl; realised 2025 growth separated from 2026 forecasts
- [x] Projects (28) ↔ areas (26) ↔ developers (7) — linked automatically by the entity graph
- [x] Compare pages (15) — cannibalisation mapped; merges pending sign-off since they change URLs
- [x] Segments (4) vs guides — differentiation documented in the corpus roadmap
- [x] Orphan MDX — 14 → 0; FAQ/schema present on every commercial page
- [x] Lead paths — lead form on every content page, mid-article CTA before it
- [x] Wikidata Q140810037 — in Organization sameAs; self-referencing URLs removed

## Rendered HTML

- [x] Hero images with descriptive alt, width/height and fetchpriority
- [x] JSON-LD: Organization, WebSite, Article/NewsArticle, FAQPage, BreadcrumbList, CollectionPage, ItemList, ApartmentComplex
- [x] Lead forms and API — honeypot plus server-side spam gate; every instance binds
- [x] `audit:rendered:fail` zero errors
- [x] Zero filler markers in production HTML

## Code / UX

- [x] Hub pages for all seven collections, clustered, with intro links, FAQ and lead form
- [x] Header with working mobile navigation; footer with full section and pillar links
- [x] Visible breadcrumbs sharing one source with BreadcrumbList
- [x] site-report counts match the corpus

## Standing quality bar

Every page should hold:

1. A direct answer in the first paragraph, 35-90 words, stating the subject by name.
2. At least two self-contained 130-170 word blocks carrying real figures, quotable out of context.
3. Question-form H2s where the section answers a question a buyer would type.
4. Numbers that agree with the rest of the corpus, or a stated reason why they differ.
5. Modelled figures labelled as modelled, with the method linked.

## Commands

```bash
npm run validate:content -- --all     # 144/144 clean
npm run geo:audit                     # corpus score
node scripts/geo-check-file.mjs <path> # single file
npm run build && npm run audit:rendered:fail
npm run qa:full:quick                 # HTTP smoke needs live-site egress
```
