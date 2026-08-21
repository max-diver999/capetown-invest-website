# Content quality audit checklist — capetown-invest.com

Phase 0 corpus pass. Strong GEO baseline — focus CTR clusters and hub UX.

## Baseline (2026-08-21)

- `npm run validate:content -- --all` — **144/144 clean**
- `npm run geo:audit` — commercial **90/100**, grade **A**, 0 below min
- Rubric: answer 98 · self 78 · structure 90 · stats 100 · unique 81

## Corpus checks (all 144 MDX)

- [ ] Rates & taxes cluster consistency (municipal, transfer duty, CGT mentions)
- [ ] STR rules ↔ area pages (Sea Point, Camps Bay, City Bowl)
- [ ] Lightstone / market data / forecast / prices-by-suburb cross-links
- [ ] Projects (28) ↔ areas (26) ↔ developers (7)
- [ ] Compare pages (15) — cannibalization with guides
- [ ] Segments (4) vs guides — duplicate intent
- [ ] Orphan MDX, FAQ/schema on commercial pages
- [ ] Lead paths: consultation + get-shortlist from top GSC pages
- [ ] Wikidata Q140810037 — schema/org consistency sitewide

## Rendered HTML (after build)

- [ ] Hero images + alt
- [ ] JSON-LD Article/FAQ/Organization
- [ ] Lead forms + API
- [ ] `audit:rendered:fail` zero errors

## Code / UX (compare Florida pilot)

- [ ] Hub pages guides/areas/projects/compare/segments
- [ ] Header nav, breadcrumbs, related links
- [ ] site-report counts match corpus

## Output

`AUDIT-REPORT-{date}.md` with P0/P1/P2, waves ~25 files.
