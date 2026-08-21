# Corpus cleanup roadmap — capetown-invest.com — 2026-08-21

> Основание: `.content-os/reports/AUDIT-REPORT-2026-08-21.md`. Волны ≤25 файлов, каждая — отдельный PR `cc/capetown-fix-wave{N}-{topic}`, human-readable diff, без mass-regex удаления абзацев.
> Гейты каждого PR: `fix:markdown-glue --dry` (0 файлов), `validate:content:changed`, `geo:audit` (пересчёт после Wave 2-4 — скор просядет с 90, это ожидаемо и честно), `build && audit:rendered:fail`.
> **СТОП: выполнение только после «ок» Максима.**

## Wave 1 — hotfix топ-страниц и битых titles (11 файлов, P0)

Файлы: guides/{cape-town-rates-taxes-property, short-term-rental-rules-cape-town, cape-town-property-market-forecast-2026-2027, cape-town-property-prices-by-suburb-2026, eu-citizens-buying-cape-town-property, cape-town-semigration-property-guide, non-resident-mortgage-cape-town, southern-suburbs-cape-town-property}, areas/paarl-property-investment, projects/{two-oceans-beach, chestercourt-redevelopment}

1. **STR-гид**: title/description — убрать фейк «75% of Blocks Restrict It» → «Cape Town Airbnb Rules 2026: Zoning, Body Corporate, SARS — 4-Layer Checklist»; восстановить lead-абзац секции bylaws (L63); s35A FAQ — добавить порог R2m.
2. **Rates-гид**: strip мусорные блоки (особенно «Rates clearance» L139-150 — 3 подряд), заголовки «r2 million» → «R2 million», снять «?» с не-вопросов; description начать с прямого ответа.
3. **Forecast**: битая таблица L210-214 (сепаратор), «undefined» L264, тройной повтор L92; синхронизировать national ~6% (forecast) vs ~5.2% (lightstone) — пометить forecast vs realized; обновить на Aug-2026 (SARB).
4. **Prices-by-suburb**: title → «…: R/m² for 17 Areas»; junk-таблицы прочь; Blouberg 7.5-9.0% → выровнять с area (6.5%); «Steinhoff corridor» удалить; «a investable» → «an investable».
5. **5 titles «Guide 2026 Guide 2026»** починить (eu-citizens, semigration, non-resident-mortgage, southern-suburbs, paarl).
6. **two-oceans-beach**: retitle на реальные схемы (2 On Hill / Beiramar) без «From R2.7m» за несуществующий проект; chestercourt — выверить title↔предмет.

## Wave 2 — битые внутренние ссылки (7 файлов, P0, быстрый)

- `/guides/{camps-bay,clifton,woodstock,bantry-bay}-property-investment/` → `/areas/…/` в: areas/hout-bay, guides/cape-town-property-investment-guide, projects/{acacia-house-woodstock ×3, amdec-hout-bay ×2, camps-bay-infinity, the-ridge-clifton}.
- `/areas/stellenbosch-property-investment-guide/` → `/guides/…/` в areas/durbanville.
- Malformed `/areas/blouberg…/-property-investment/`, `/areas/milnerton…/-property-investment/` в areas/{table-view, durbanville}.
- После правок: `npm run check-links`.

## Waves 3–6 — снятие мусорных блоков (P0, ядро зачистки)

Паттерны для surgical-удаления (стабильные якоря, файл за файлом, визуальная перепроверка diff):
- абзацы `Cape Town Invest buyer desk flags …` (296);
- абзацы `MORE Group underwriting snapshot: …` (818 вхождений «underwriting snapshot»);
- блоки `Cape Town Invest DD notes for this section:` + 3 буллета (124);
- junk-таблицы `| Benchmark | Figure | DD use |` и «Entry / carry r,»-строки;
- предложения-обрывки с эхом заголовка («…on {lowercased H2 fragment} before waiving…», битые токены `r,`, `undefined`);
- `Insider tip: request audited body corporate financials … on {H2} stock…` — переписать в 1 нормальное предложение или удалить.

**Правило восстановления**: если после снятия секция пуста (список A-2: foreigner-tax-hub ×2, transfer-duty «Do foreign buyers pay more» — перенести ответ из FAQ в прозу, non-resident-rental-tax ×2 (IT77 walkthrough + remittance), camps-bay «Foreign buyers», constantia lead «First/Second», silo-district «No 2 silo») — дописать 1-3 фактных абзаца из уже проверенных цифр того же файла/хаба. Это точечные дописки, не mass-MDX.

- **Wave 3**: guides A–C кластер налогов/покупки (25 файлов) — начать с защищённых: transfer-duty (только снять мусор, таблицу SARS не трогать!), CGT, exchange-control, FICA, hub, non-resident-*, cost-of-buying…
- **Wave 4**: guides остаток (25).
- **Wave 5**: areas 26 (+ восстановление пустых секций Constantia/Camps Bay).
- **Wave 6**: projects 28 + developers 7 + compare 15 + segments 4 + news 5 (двумя PR по ~25: 6a projects+developers, 6b compare+segments+news; в compare/cape-town-vs-lisbon починить таблицу L88-93; в lightstone — таблицу L154-159).

Параллельно в каждой волне: «MODELED» — оставить ≤2 на файл + одна ссылка на /methodology/; убрать «MODELED» из плиток главной (страница index.astro — согласовать с code-roadmap).

## Wave 7 — заголовки: де-«?» и рекапитализация (все коллекции, скриптом с ручным diff)

~1 323 H2 с «?» → снять «?» у не-вопросов, Title-case имён собственных («camps bay» → «Camps Bay», «r2 million» → «R2 million»). Разбить на 6 PR по коллекциям (≤25 файлов каждый).

## Wave 8 — числовая консистентность (P1, ~15 файлов)

- Sea Point net 7.5% ↔ hub worked example 4.8% — выбрать методологию, поправить area+compare или пример хаба.
- R11.3bn — единое определение (Atlantic Seaboard + City Bowl, per Lightstone) в lightstone/camps-bay/woodstock.
- Atlantic Seaboard net «under 3%» (blouberg L91) — выровнять.
- «Conveyancing near R28,000» — уйдёт вместе с мусорными блоками; проверить остатки, канон — тариф-таблица хаба.
- Kalk Bay R/m² band — пересчитать.
- Verify-by пометки: CoCT 0.69c/R + R450k (бюджет 2026/27), SARS-пороги.

## Wave 9 — дедупликация межфайловых абзацев (P1)

5 семейств (LTV-абзац ×24, «Confirm transfer duty…» ×19, red-flags block ×13, «Buyer scenarios» ×20+, «Asking prices sit 10%+…» ×12): в 2-3 «канонических» файлах оставить, в остальных — переписать в суточную специфику (цифры конкретного suburb) или удалить. Поднимет rubric self/unique (78/81 → цель 85+).

## Wave 10 — каннибализация: merge + differentiate (P1, требует отдельного «ок» — затрагивает slugs)

1. `hidden-costs-buying-property-cape-town` → merge в `cost-of-buying-property-cape-town` + 301 в vercel.json.
2. `cape-town-property-investment-checklist` → merge в `how-to-buy-property-cape-town-step-by-step` + 301.
3. `can-foreigners-buy-property-south-africa` — сузить до national eligibility; FICA/финансирование/exchange-control → link-out.
4. `eu-citizens-buying-cape-town-property` — убрать немецкий H2 (→ link на segments/german-buyers); german-buyers углубить EUR/ZAR + немецкое налоговое резидентство.
5. `best-areas-invest-cape-town-2026` — убрать R/m²-таблицы (канон — prices-by-suburb), перестроить как ranking по целям покупателя.
6. uk-retirees: визовый саммари ≤2 предложения + link на retirement-visa.

## Wave 11 — freshness + orphans (P1)

- Реальные updatedDate при фактических правках (волны выше дадут это автоматически) — снять единый штамп 2026-07-04.
- Orphans (14): вписать контекстные ссылки: vs-dubai — из segments/uae-релевантных гидов + investment-guide; news ×3 — из forecast/lightstone; digital-nomad ↔ remote-work-visa; hidden-costs/checklist уходят через merge; проекты ×3 — из своих area-страниц; uk-retirees — из uk-buyers + retirement-visa. (Полное решение — content-graph из code-roadmap.)
- News-коллекцию обновить/дополнить Aug-2026 событиями (STR by-law tracker — см. content-roadmap T15).
- 15 слабых titles (A-16) — точечные апгрейды с цифрой/выгодой.

## Definition of done (Phase 1 corpus)

- 0 вхождений: «MORE Group», «buyer desk flags», «DD notes for this section», «underwriting snapshot», токенов `r,`/`undefined` в src/content.
- «MODELED» ≤ 2/файл; 0 junk-таблиц; 0 пустых H2-секций; 0 битых ссылок (`check-links`); 0 titles >65 симв. в топ-30 GSC-страниц; FAQ = schema на 100% файлов.
- validate 144/144; geo:audit пересчитан с честным скором (ожидание: answer/structure ≥90, self/unique ↑, stats просядет — зафиксировать новый baseline в STATUS.md).
