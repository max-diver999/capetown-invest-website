# CODE-AUDIT — capetown-invest.com — 2026-08-21

> Phase 0 code audit. Reference: `florida-estate-website` (post-audit hub UX / content-graph patterns only).
> Scope: src/pages, layouts, components, data, scripts, config vs Florida pilot. No code changed — findings + roadmap only.
> Build baseline: `npm run build` ✅ 144 pages, `audit:rendered:fail` ✅ 0 errors (note: that script only runs 10 narrow boilerplate/lead-form checks — it does NOT validate titles, schema, alts, links).

## P0 — blocks SEO / leads

| # | Finding | Evidence | Fix |
|---|---|---|---|
| C-1 | **Wrong-site titles on 3 hubs** — Cape Town pages present themselves as Mexico in `<title>`/SERP | `src/pages/projects/index.astro:16` `title="Mexico Real Estate Projects"`; `src/pages/developers/index.astro:12` `"Mexico Real Estate Developers"`; `src/pages/news/index.astro:11` `"Mexico Real Estate News"` | One-line title+description fixes, Cape Town wording |
| C-2 | **No mobile navigation.** Header hides nav below `md:` — mobile users get logo + "Free shortlist" only; whole site unreachable from mobile header | `src/components/Header.astro` (no burger); Florida `Header.astro:58-85,231-277` has burger + grouped mobile panel | Port Florida burger/mobile panel |
| C-3 | **Content graph dead.** `relatedSlugs` populated in 125 MDX, rendered **nowhere**; no related-links module on any article; no cross-collection linking (area↔projects, project↔developer) despite `region/area/developer` fields existing in `src/content.config.ts:31-44` | zero refs to `relatedSlugs` outside content.config.ts; Florida `src/lib/content-graph.ts` + `RelatedLinks.astro` + `src/data/geo.ts` solve exactly this ("populated across N files and rendered nowhere" is Florida's own pre-audit pathology) | Port content-graph layer 1 (resolveRelatedSlugs) + layer 2 (entity graph: region→areas→projects) + RelatedLinks into ArticleLayout |
| C-4 | **No HubLayout.** All 7 hub indexes are flat card grids: no thematic grouping, no intro copy with links, no jump-nav, no hub FAQ, no LeadForm, no breadcrumb, no `CollectionPage`/`ItemList` JSON-LD | `src/pages/{guides,areas,projects,compare,segments,developers,news}/index.astro` vs Florida `HubLayout.astro` + `guides/index.astro:14-126` (7-cluster ORDER + leftover guard + hub FAQ) | Port HubLayout + per-hub cluster ORDER |
| C-5 | **Quality gates broken on clean clone / parent-workspace imports.** `scripts/lib/more-content-gate.mjs:13` imports `../../../scripts/lib/cloudinary-gate.mjs` (outside repo) → `validate:content`, `qa:full` fail on any fresh checkout/CI. Same pathology: `scripts/indexnow-submit.mjs:7` (`indexnow-log.mjs`), `scripts/submit-google-explicit.mjs:6` (`record-submitted.mjs`), `scripts/rollout-mexico-cloudinary*.mjs` (`cloudinary-routing.mjs`). None of these lib files exist in the repo — they live only in Maxim's local workspace | verified: `validate:content -- --all` crashes ERR_MODULE_NOT_FOUND until stubbed; with stub → 144/144 clean | Vendor the 4 lib files into `scripts/lib/` (or guard imports). Indexing scripts highest priority |
| C-6 | **`scripts/submit-all-50.sh` submits 50 `https://mexico-invest.com/...` URLs** — running it under the `capetown-invest-indexing` key violates the indexing isolation policy | `scripts/submit-all-50.sh` | Delete/neutralize the file |

## P1 — important

| # | Finding | Evidence | Fix |
|---|---|---|---|
| C-7 | Hero images: all 141 content heroes hotlink Wikimedia (75 upload.wikimedia.org + 66 commons Special:FilePath), `alt=""` hardcoded, no width/height/fetchpriority (CLS + image-SEO zero) | `ArticleLayout.astro:117`; Florida `ArticleLayout.astro:96-101,212-221` (heroAlt prop + dims) | Add heroAlt prop + dims now; migrate heroes to own CDN (Cloudinary) as separate wave |
| C-8 | og:image default = `favicon.svg` (invalid on most platforms); no `twitter:image`, no `og:image:alt` | `BaseLayout.astro:23`; Florida `BaseLayout.astro:31-32,72-74` + `public/og-default.png` | Add branded og-default.png + port og block |
| C-9 | Duplicate-FAQPage risk: `ArticleLayout.astro:95` emits faqSchema unconditionally even when inline `<FaqBlock>` present; + 2 files where visible FAQ ≠ schema FAQ (`guides/buy-cape-town-property-foreigner.mdx` 4/4 divergent, `guides/cape-town-remote-work-visa-property.mdx` 1/1) | verified by script; Florida gates via `hasInlineFaqBlock` (`ArticleLayout.astro:186`) | Gate schema emission; sync the 2 divergent files |
| C-10 | JSON-LD gaps: no `WebSite`, no `CollectionPage`/`ItemList` (hubs), no `NewsArticle` on /news/, no `AboutPage`/`ContactPage`, no property-entity schema on projects (`ApartmentComplex`/`Residence` — priceFromZAR/district data exists unused). Org typed `RealEstateAgent` while site disclaims "not a broker" (consider `Organization` + `WebSite`) | `BaseLayout.astro:31-63`; Florida emits all of these | Port Florida schema set; align org type with positioning |
| C-11 | Visible breadcrumbs absent sitewide; BreadcrumbList JSON-LD only on articles (crude auto labels), missing on hubs/home/funnels | Florida `Breadcrumbs.astro` + HubLayout:111 | Port component, single source for crumbs+schema |
| C-12 | Nav gaps: header lacks Developers/News/Methodology; footer lacks Areas/Projects/Segments/Developers/News/About/Contact/consultation/WhatsApp; `/consultation/` linked from nowhere in chrome; no central `src/data/nav.ts` | `Header.astro`, `Footer.astro` vs Florida `nav.ts` | Central nav data + full footer (crawl paths + PageRank flow) |
| C-13 | Projects hub price plumbing dead: sorts/prints `priceFromUsd` (schema has `priceFromZAR`, present in 0 files) → "from $150K" USD fallback on ZAR site; ProjectCard price always empty | `projects/index.astro:10-13` | Populate priceFromZAR, formatZar(), drop formatUsd |
| C-14 | Analytics namespace `window.investGulfTrack` baked in; thanks page fires `generate_lead` with `currency: 'USD'` | `GoogleAnalytics.astro:20`, `LeadForm.astro:173`, `WhatsAppIntentTracker.astro:25-27`, `thanks/index.astro:24-25` | Rename to capeTownTrack; currency ZAR |
| C-15 | LeadForm binds `getElementById('ig-lead-form')` — only first form works; no phone validation | `LeadForm.astro:130`; Florida `LeadForm.astro:125-135` querySelectorAll + per-form scope | Port Florida binding + phone check |
| C-16 | Sitemap has priorities but **no lastmod** | `astro.config.mjs`; Florida `buildLastmodMap()` | Frontmatter-driven lastmod |
| C-17 | No root landing/money pages (Florida: `/invest-in-miami/` etc. via landing collection, priority 0.92) | Florida `LandingContent.astro` | Candidates: /invest-in-sea-point/, /invest-in-city-bowl/, /invest-in-winelands/ (needs Maxim ok — new slugs) |
| C-18 | Other-market scripts/aliases in repo: `images:upload*`→`upload-mexico-cloudinary.py`, `corpus:excellence`→`spain-corpus-excellence.mjs`, `fix-mexico-*`, `generate-singapore-*`, `expand-pilot-projects.mjs` generates Spain/NIE/Ley 57 content; mexico/spain manifests | package.json, scripts/ | Rename used, delete unused (Maxim ok) |

## P2 — cleanup

- `src/lib/homeProjects.ts` dead (Mexico AREA_PRIORITY: tulum, playa-del-carmen…) — delete.
- `sameAs` asserts `moregroup.estate/about/` — cross-entity assertion an "independent" brand may not want; confirm intended (Florida deliberately avoids, see florida `site.ts:14-18`).
- No 404.astro (Vercel default), no RSS for /news/.
- InlineCta hardcoded blue `#1a6fb5` off the teal token system.
- `author.ts` pattern (Florida) for future E-E-A-T Person switch.
- qa-full/qa-audit/pre-push-gate banners self-describe as "mexico-invest" (cosmetic).
- `audit-rendered-live.mjs` covers only 10 boilerplate checks — extend with: title/desc dupes+length, schema JSON parse, alt coverage, internal-link count, garbled-text patterns ("buyer desk flags", "MORE Group").
- Site chrome shows Thai WhatsApp `+66 65 119 5327` on SA site — presumably intended (MORE Group ops), flag for trust review.
- `updatedDate: 2026-07-04` identical across all 144 MDX (bulk stamp) — freshness signal wasted; stagger real update dates when files are actually touched.

## Assumptions documented (per corpus-cleanup-mode: no questions to Maxim)

1. Thai WhatsApp number and moregroup.estate sameAs are intentional brand ops — flagged, not changed.
2. site-report/ is noindexed → its Mexico references are cosmetic only.
3. Florida patterns are the approved UX target; порт компонентов пойдёт только после «ок» на code-improvements-roadmap.
