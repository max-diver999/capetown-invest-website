# AUDIT-REPORT — capetown-invest.com — 2026-08-21

> Phase 0 full audit: corpus (144 MDX) + rendered HTML (built dist, 161 pages) + GSC signals.
> Live site is egress-blocked from this environment; page-by-page review performed on the local production build (identical HTML). Code findings → `CODE-AUDIT-2026-08-21.md`.
> Baseline: `validate:content --all` 144/144 clean (after stubbing the missing `cloudinary-gate.mjs` — see CODE-AUDIT C-5); `geo:audit` 90/100 grade A; `build` + `audit:rendered:fail` 0 errors (10 narrow checks only).

## Executive summary

Сайт технически здоров (canonicals, sitemap, schema-покрытие, дубликатов title 0, лид-форма на каждой странице), но корпус отравлен одним событием: коммит `9cda569` (04.07.2026, +16 460 строк в 152 файлах, «geo: lift full corpus to 90+») вставил под почти каждый H2 авто-сгенерированные «citability»-блоки с перепутанными цифрами. **GEO 90/100 — частично накрученный показатель**: rubric «stats 100» оплачен галлюцинированными финансовыми утверждениями в индексируемом тексте. Это одновременно:

- риск Google scaled-content-abuse / helpful-content демоции (вероятная причина стагнации CTR при позициях 7–10);
- убийца доверия для живого покупателя (нонсенс на 10-й строке каждой топ-страницы);
- утечка white-label бренда «MORE Group» ×841 на «независимом» сайте.

Реальный контент под мусором — сильный (проверенные SARS-таблицы, worked examples, честные MODELED-оговорки). Зачистка ≈145 файлов — главный рычаг и для SEO, и для AEO/GEO, и для конверсии.

## P0 — критично (блокирует рост)

| # | Находка | Масштаб / evidence |
|---|---|---|
| A-1 | **Мусорные авто-блоки в production HTML**: 4 семейства — «Cape Town Invest buyer desk flags…» (296 экз., 136 стр.), «MORE Group underwriting snapshot…» (818 экз.), «Cape Town Invest DD notes for this section» (124 стр.), junk-таблицы «Benchmark / Figure / DD use». Внутри — галлюцинированные утверждения: «R892 non-resident LTV confirmation», «179.6% withholding on disposal» (lightstone L63), «R11.3bn LTV cap» (camps-bay L49), «25% typical FICA pack turnaround», литеральные битые токены «r,», «undefined» (forecast L264), обрывки заголовков середины слова («…on how should cape town invest readers unde before waiving…»). «MORE Group» ×841 на 145 стр.; «MODELED» ×2 655 на 147 стр. (в т.ч. плитки главной) | Всё видимо в rendered HTML. Внесено коммитом `9cda569` |
| A-2 | **~15% секций выпотрошены шаблоном**: H2 без единого содержательного абзаца — только мусор. Примеры: foreigner-tax-hub «What foreign buyers mean by property tax» (L43-49) и «Transfer duty and vat at purchase» (L82-100); transfer-duty «Do foreign buyers pay more transfer duty?» (L145-163 — ответ есть только в FAQ); non-resident-rental-tax «Registering with sars: it77» (L81-90) и «Remitting rental income abroad» (L157-167); camps-bay «Foreign buyers in camps bay?» (L159-167); constantia, silo-district «No 2 silo» (L90-102). Constantia L70: секция начинается с «Third, buyer motivation.» — First/Second перезаписаны |
| A-3 | **Фейк в title топ-страницы GSC**: short-term-rental-rules — «75% of Blocks Restrict It» / description «75% of sectional title schemes restrict it» — в теле нигде не подтверждено; 75% — это порог special resolution (STSMA), не доля схем. Мислидинг в SERP + правовой риск |
| A-4 | **Проект-фантом**: projects/two-oceans-beach — title «Prices From R2.7m, 6.5% Yield», а тело признаёт (L50): «There is no verified off-plan scheme by that name on the West Coast». Retitle вокруг реальных схем (2 On Hill / Beiramar) или noindex. Схожая проверка: chestercourt-redevelopment (title «Cape Town CBD Rental Pipeline» не про Chester Court) |
| A-5 | **Битые titles «Guide 2026 Guide 2026»** (в frontmatter, batch-скрипт приклеил суффикс): eu-citizens, semigration, non-resident-mortgage, southern-suburbs, + paarl («2026…Guide 2026»). Плюс 148/161 title >65 символов (суффикс « | Cape Town Invest» поверх и так полных тайтлов) — массовые обрезания в SERP |
| A-6 | **Конфликт цифр между файлами (галлюцинация-класс)**: Blouberg yield 7.5–9.0% (prices-by-suburb L124) vs 6.5%/4.5% (своя area-страница); Sea Point «7.5% net» (area+compare) vs 4.8% net в worked example хаба (L134-147); R11.3bn приписан трём разным географиям (lightstone L203 / camps-bay L62 / woodstock L68); national growth ~6% (forecast L61) vs ~5.2% (lightstone L74); «conveyancing near R28,000» в 80+ файлах против R48-52k на R5m в хабе; Atlantic Seaboard net «under 3%» (blouberg L91) vs 4.4%/7.5% на соседних страницах |
| A-7 | **11+7 битых внутренних ссылок** (MDX + rendered): паттерн «wrong collection» — `/guides/camps-bay-property-investment/` вместо `/areas/…` (из hout-bay, amdec-hout-bay, camps-bay-infinity), `/guides/{woodstock,clifton,bantry-bay}-property-investment/`, `/areas/stellenbosch-property-investment-guide/` (гид лежит в guides); malformed `/areas/blouberg-property-investment/-property-investment/` и `/areas/milnerton…/-property-investment/` (из table-view, durbanville) |

## P1 — важно

| # | Находка |
|---|---|
| A-8 | **~1 323 из 1 577 H2 оканчиваются «?»**, многие — не вопросы («## Related guides?», «## Camps bay in numbers, 2025?») + machine-lowercase имён собственных в заголовках («camps bay», «r2 million») |
| A-9 | **4 битые markdown-таблицы** (нет разделителя `\|---\|`, рендерятся сырыми пайпами): forecast L210-214, lightstone L154-159, cape-town-vs-lisbon L88-93 (+1) |
| A-10 | **Каннибализация — 4 действия**: (1) hidden-costs → merge в cost-of-buying (301); (2) investment-checklist → merge в how-to-buy-step-by-step (301); (3) can-foreigners-buy-property-south-africa сузить до eligibility/national law (FICA/фин/exchange-control — link-out на CT-страницу); (4) eu-citizens (хаб) vs segments/german-buyers — убрать немецкий H2 из eu-citizens, german-buyers оставить EUR/ZAR + немецкую налоговую специфику |
| A-11 | **Верстка/медиа**: все hero — hotlink Wikimedia (289 изображений, 66 через redirect-endpoint Special:FilePath), `alt=""` на 301/449 img (все hero), 145 img без width/height (CLS), og:image = Wikimedia/SVG-favicon → превью в соцсетях/мессенджерах фактически сломаны сайтвайд |
| A-12 | **Orphans (0 входящих контентных ссылок, 14 стр.)**: compare/{vs-dubai, vs-durban, vs-portugal}, guides/{digital-nomad, eu-citizens, hidden-costs, returning-expat}, news/{interest-rates-2026, luxury-sales-record, foreign-buyers-atlantic-seaboard}, projects/{azure-camps-bay, makers-landing, the-ridge-clifton}, segments/uk-retirees. Причина системная: related-модуля нет (CODE-AUDIT C-3), хабы плоские (C-4). Особенно больно для vs-dubai (P1-winner по PRIORITY-CTR-LEADS) |
| A-13 | **Повторяющиеся межфайловые абзацы** (за пределами мусорных блоков): «Non-residents typically face tighter loan-to-value…» ×14+10 файлов; «Confirm transfer duty and total costs…» ×19; 5-bullet «red flags»-блок ×13; 3-scenario «Buyer scenarios» ×20+ area-страниц; «Asking prices sit 10%+ above recent deeds-office sales…» ×12 — душат rubric self/unique (78/81) |
| A-14 | **FAQ schema ≠ видимый FAQ**: buy-cape-town-property-foreigner (4 расхождения), cape-town-remote-work-visa-property (1); + двойная эмиссия FAQPage возможна архитектурно (CODE-AUDIT C-9) |
| A-15 | **Freshness**: все 144 файла с одинаковой `updatedDate: 2026-07-04`; news-коллекция (5 шт.) вся от 17.06; главная пишет «updated June 2026»; the-charlotte «Q4 2025 completion» не обновлён; sitemap без lastmod |
| A-16 | **Слабые titles (CTR)**: 15 генериков без цифры/выгоды (financially-independent-visa «Full Guide», non-resident-rental-tax, conveyancing-fees, snagging, segments ×3 шаблонные, 4 area «Prices, Yields, Data», 6 «…, Yields» comma-dangle и др.) |

## P2 — гигиена

- prices-by-suburb: «Steinhoff corridor» как дескриптор локации (L128) — удалить; «a investable» (L85); Kalk Bay R/m² band = Paarl (sanity-check).
- STR FAQ: у s35A не указан порог R2m — добавить.
- Verify-by даты на CoCT тариф 0.69c/R + R450k exemption (бюджет 2026/27) и SARS-пороги.
- «This guide is for information only…» ×24 — ок (дисклеймер), исключить из дедупа; «Foreign buyers: [hub]» bare-sentence ×15 проектов — сделать контекстными.
- Консультация: кнопка «Request shortlist →» на странице consultation (copy/paste).
- Главная: «Project reviews (21 live)» vs 28 проектов; «MODELED» в плитках hero.
- llms-full.txt — 18 строк (саммари, не full-corpus digest).

## Что уже хорошо (не трогать)

- transfer-duty-explained: SARS-таблица (eff. 01.04.2025) верифицирована полностью, все 3 worked examples пересчитываются корректно — **эталон, защитить от массовых правок**.
- CGT guide: 40%/80%, R2m, R40k, s35A 7.5/10/15 — всё верно, пример пересчитан.
- Прямые ответы (Quick answer + TldrBlock) на топ-страницах GSC — снippet-качества; titles rates/STR/forecast уже с цифрами.
- Canonicals 159/159 чистые, sitemap 159 URL корректен, robots/llms.txt/AI-боты, www-308, honeypot+server spam-gate на /api/lead/, FAQ-текст = schema-текст (кроме 2 файлов), 12.4 внутр. ссылок/стр. в среднем.
- Sea Point area page — самая чистая; the-charlotte — образец обращения с developer-claimed цифрами (кроме мусорных блоков).

## Блок D — GSC CTR (топ-3 страницы)

| Страница | Сигнал | Диагноз | Действия |
|---|---|---|---|
| /guides/cape-town-rates-taxes-property/ (468 imp, 0.85%, pos 9.7) | Title/answer уже сильные | Проблема не в title, а в отравленном теле (3 мусорных блока подряд в «Rates clearance», junk-таблицы) и позиции 9.7 | Strip мусор → real freshness update (2026/27 тариф) → внутр. ссылки из cost/transfer-duty/хаба → re-submit. Title оставить, desc можно начать с прямого ответа «Cape Town rates 2026: ~R892/month on R2m…» |
| /guides/short-term-rental-rules-cape-town/ (378 imp, 0.53%) | Фейковый «75%» в title | A-3 + выпотрошенная секция bylaws (L63-67) | Retitle: «Cape Town Airbnb Rules 2026: Zoning, Body Corporate, SARS — 4-Layer Checklist»; восстановить lead-абзац bylaws; compliance-checklist сниппет-блок; bridge на consultation + area-страницы (Sea Point/Camps Bay/City Bowl) |
| /guides/cape-town-property-market-forecast-2026-2027/ (219 imp, 0.46%) | Хвост мусора + битая таблица | L92 тройной повтор, L264 «undefined», таблица L210 без сепаратора | Починить таблицу, strip мусор, обновить forecast-блок на Aug-2026 данные (SARB июльское решение), синхронизировать national 6% vs 5.2% с lightstone, ссылки на prices-by-suburb + lightstone |
| /guides/cape-town-property-prices-by-suburb-2026/ (124 imp) | Слабый title | Главная таблица — лучший AEO-актив сайта | Title → «Cape Town Property Prices by Suburb 2026: R/m² for 17 Areas»; убрать junk-таблицы вокруг; выровнять Blouberg yield с area-страницей |

## Каннибализация — решения (сводно из A-10)

Merge (301): hidden-costs → cost-of-buying; investment-checklist → how-to-buy-step-by-step.
Differentiate: can-foreigners-buy (national eligibility) ↔ buy-cape-town-property-foreigner (полный процесс); best-areas (ranking по целям, без R/m²-таблиц) ↔ prices-by-suburb (единственная R/m²-таблица); eu-citizens (хаб) ↔ german-buyers (EUR/ZAR + немецкий налоговый резидентство); uk-retirees ↔ retirement-visa (2 предложения саммари + link).
Keep: how-to-buy ↔ buy-foreigner; investment-guide ↔ is-good-investment ↔ forecast; us-buyers; uk-buyers ↔ uk-tax.

## Допущения (per corpus-cleanup-mode — вопросы Максиму не задаём)

1. Мусорные блоки = регрессия GEO-скриптов, а не осознанный контент → снятие целиком, GEO-скор пересчитаем после (ожидаемо просядет rubric stats — это честная цена; answer/structure останутся).
2. «MODELED»-оговорка сохраняется, но 1–2 раза на страницу + ссылка на /methodology/ вместо ×19.
3. Слияния слагов (301) — только после «ок» на roadmap (новые slugs не создаём, удаление = redirect в vercel.json).
4. Wikimedia-hero меняем на Cloudinary отдельной волной после code-ok (изображения — не Phase 0).
