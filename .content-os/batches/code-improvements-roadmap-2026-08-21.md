# Code improvements roadmap — capetown-invest.com — 2026-08-21

> Основание: `.content-os/reports/CODE-AUDIT-2026-08-21.md`. Reference-паттерны: `florida-estate-website` (HubLayout, content-graph, Breadcrumbs, nav.ts, og-block). Ветки `cc/capetown-code-wave{N}-*`.
> **СТОП: Astro/layout-правки только после «ок» Максима на этот roadmap.** Гейты: build + audit:rendered:fail + qa:full:quick + ручной прогон мобильной навигации.

## Code Wave 1 — hotfixes без layout-риска (0.5 дня) — P0

1. Titles хабов: `projects/index.astro:16`, `developers/index.astro:12`, `news/index.astro:11` — «Mexico Real Estate …» → Cape Town wording (+descriptions).
2. Удалить `scripts/submit-all-50.sh` (50 mexico-invest.com URL — риск нарушения indexing-isolation).
3. Vendor недостающие либы в `scripts/lib/`: `cloudinary-gate.mjs`, `indexnow-log.mjs`, `record-submitted.mjs`, `cloudinary-routing.mjs` (или guard-import) — чинит `validate:content`/`qa:full`/indexing-скрипты на чистом клоне и в CI.
4. `thanks/index.astro`: `generate_lead` currency USD → ZAR.
5. Консультация: кнопка «Request shortlist →» → «Request consultation →».
6. Главная: «Project reviews (21 live)» → актуальный счётчик из коллекции; «MODELED» из плиток → «modelled» в тултип/сноску.

## Code Wave 2 — навигация + крошки (1-2 дня) — P0/P1

1. **Мобильное меню** (burger + panel) — порт из florida `Header.astro:58-85,231-277`.
2. `src/data/nav.ts` (NAV_GROUPS/UTILITY_NAV/PILLAR_GUIDES) — единый источник для Header/Footer/home.
3. Footer: полный (Areas, Projects, Segments, Developers, News, About, Contact, Consultation, Get-shortlist, WhatsApp с `data-wa-placement="footer_contact"`, «Start here» pillar-блок).
4. `Breadcrumbs.astro` видимые + единый источник crumbs↔BreadcrumbList (порт florida `ArticleLayout.astro:137-153`); добавить schema на хабы/home/funnels.
5. `/consultation/` — ссылка в header utility или footer (сейчас недостижима из chrome).

## Code Wave 3 — content graph + related links (2-3 дня) — P0

1. Порт `src/lib/content-graph.ts` layer 1: `resolveRelatedSlugs` → `RelatedLinks.astro` в ArticleLayout («Related research») — оживляет relatedSlugs в 125 файлах.
2. Layer 2: `src/data/geo.ts` для Cape Town (region → areas → projects → developers) + `resolveRelatedEntities`: area-страница ↔ проекты в area, project → area + developer, guide → релевантные areas. Закрывает 14 orphans системно.
3. Fallback-логика: страница без relatedSlugs получает entity-based ссылки (news → forecast/lightstone).

## Code Wave 4 — хабы (2-3 дня) — P0

1. Порт `HubLayout.astro`: интро с внутр. ссылками, тематические группы (`HubGroup[]` + leftover-guard), jump-nav, hub-FAQ, LeadForm, breadcrumb, `CollectionPage`+`ItemList` JSON-LD.
2. Кластеры guides-хаба (7 групп): Buying process · Taxes & costs · Visas & residency · Yields & rentals/STR · Areas & market data · New-build/off-plan DD · Ownership & exit.
3. Areas-хаб: группировка по регионам (Atlantic Seaboard / City Bowl / Southern Suburbs / Northern & Blouberg / Winelands / False Bay & Whale Coast); projects-хаб по district + price band (после заполнения priceFromZAR); compare-хаб: SA vs SA / international; segments-хаб.

## Code Wave 5 — schema + media (1-2 дня) — P1

1. og-block: `public/og-default.png` (1200×630), `og:image:alt`, `twitter:image`, absolute-URL guard (florida `BaseLayout.astro:31-32,72-74`); org logo → растровый PNG ≥112px.
2. JSON-LD: `WebSite` на всех стр.; `NewsArticle` для /news/; `AboutPage`/`ContactPage`; project-страницы → `ApartmentComplex`/`Residence` (priceFromZAR, district); org-тип `RealEstateAgent` → пересмотреть на `Organization` (сайт заявляет «not a broker») — решение Максима, влияет на rich results.
3. FAQPage: гейтить по `hasInlineFaqBlock` (не эмитить дубль), синхронизировать 2 файла с расхождением FAQ↔schema.
4. Hero: `heroAlt` prop + осмысленный fallback-alt, width/height, fetchpriority (CLS/LCP); сниппет для постепенной миграции hero на Cloudinary (отдельная контентная волна — 141 изображение).
5. Sitemap `lastmod` из frontmatter (florida `buildLastmodMap()`).

## Code Wave 6 — funnels + гигиена (1-2 дня) — P1/P2

1. LeadForm: `querySelectorAll('form.ig-lead-form')` + per-form статусы; phone-валидация ≥8 цифр.
2. Analytics: `window.investGulfTrack` → `capeTownTrack` (синхронно в GoogleAnalytics/LeadForm/WhatsAppIntentTracker/thanks).
3. `priceFromZAR` заполнить в 28 проектах + `formatZar()`; убрать `formatUsd`/`priceFromUsd` (мертвый код).
4. `404.astro` с навигацией; RSS для /news/ (опционально).
5. Удалить/переименовать чужие скрипты: `fix-mexico-*`, `spain-corpus-excellence.mjs`, `generate-singapore-*`, `upload-mexico-cloudinary.py` (alias оставить с новым именем), mexico/spain манифесты, `src/lib/homeProjects.ts` (Mexico AREA_PRIORITY), `expand-pilot-projects.mjs` (генерит Spain-контент).
6. Расширить `audit-rendered-live.mjs`: length/dupes title+desc, alt-coverage, JSON-parse schema, internal-link count, ловля мусор-паттернов («MORE Group», «buyer desk flags», `r,`) — чтобы регрессия A-1 не повторилась.
7. InlineCta палитра → teal-токены; llms-full.txt — сгенерировать полный digest корпуса скриптом.

## Отдельное решение Максима (не делаю без явного «ок»)

- Landing-коллекция `/invest-in-{sea-point,city-bowl,winelands}/` (florida-паттерн, priority 0.92) — новые slugs.
- `sameAs: moregroup.estate` — оставить/убрать (trade-off: entity-trust vs независимость бренда).
- Thai WhatsApp +66 на сайте — оставить/заменить на SA-номер.

## Ожидаемый эффект

- Мобильная навигация + хабы + related-links → crawl-глубина, распределение PageRank, время на сайте, устранение orphans.
- CollectionPage/ItemList + чистые titles + og-превью → CTR и цитируемость (AEO/GEO).
- Рабочие гейты в CI → регрессии ловятся до продакшена.
