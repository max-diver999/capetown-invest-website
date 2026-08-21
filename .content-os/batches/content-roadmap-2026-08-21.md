# Content roadmap — 50 статей — capetown-invest.com — 2026-08-21

> Основание: конкурентный анализ (~30 SERP-выборок, см. AUDIT-REPORT + topics-proposal.json). Цель: горячие лиды на покупку (consultation / get-shortlist).
> **Порядок обязателен: сначала Wave 1-2 corpus-cleanup (зачистка мусора), затем новые статьи.** Публиковать новый контент на сайт с «MORE Group»-мусором = кормить демоцию.
> Волны по 5 слагов (batch_size_default: 5). Каждая статья: extractable direct answer (2-3 предложения) + ≥1 таблица с цифрами + видимый «Updated {month} 2026» + FAQ (schema=visible) + bridge на consultation/shortlist + 3-5 контекстных внутр. ссылок (+ relatedSlugs, которые после Code Wave 3 начнут рендериться).
> Коллекции существующие: guides / areas / segments / compare / news. Новых роутов не требуется (country-сегменты кладём в segments).
> **СТОП: писать только после «ок» Максима (per publishing-gates).**

## Конкурентная логика (кратко)

- **theafricanvestor.com** доминирует программатик-Q&A ковром: тонко, шаблонно, без данных и авторов — бьётся глубиной + таблицами + свежестью.
- **Юрфирмы** (STBB, Miltons, Hammond Pole…) держат все trust/company/marriage/withholding-запросы: авторитетно, но жаргон без цифр и CRO — **эти SERP не имеют investor-friendly ответа** → наш главный незанятый пояс (Waves 2-3).
- **ooba** держит process/калькуляторы (local-аудитория), **Global Property Guide** — yield-таблицы (country-level), **Airbtics/AirROI** — STR-данные без покупки. Никто не соединяет «данные + покупка + налоги нерезидента» в одном месте.
- **Country-segment** страницы (NL/CH/UAE/FR…) — документированный спрос (Dutch топ-3 наций, R1bn+), конкуренции ноль.
- AI-цитаты выигрывают: single-question H1, датированные таблицы, пошаговые процессы с таймлайнами, явные stat-предложения.

## Wave C1 — STR/rates compliance (наши GSC-кластеры) — сразу после corpus Wave 1-2

| # | Slug (collection) | Query | Зачем |
|---|---|---|---|
| T01 | guides/cape-town-str-bylaw-2026-registration | cape town airbnb by-law 2026 registration | Живой tracker (комментарии до 5 Oct 2026) — urgency + цитируемость; хаб к STR-гиду |
| T02 | guides/airbnb-yields-by-suburb-cape-town | best area airbnb investment cape town | Merge Airbtics/AirROI-данные (occ 71-75%, ADR R1,600-2,900) с ценами покупки → ROI-таблица, которой нет ни у кого |
| T03 | guides/body-corporate-airbnb-ban-rules | can body corporate ban airbnb south africa | Критичный pre-purchase check; связка STR-гид ↔ проекты со STR-friendly rules |
| T04 | guides/cape-town-municipal-valuation-objection-gv | cape town property valuation objection GV2025 | Кормит топ-страницу rates (468 imp): rates-калькуляция + objection timeline |
| T05 | guides/cape-town-utilities-costs-owners-2026 | cape town water electricity tariffs owner | Fresh-news вакуум (fixed-charges суд, 6.64% hike) → annual holding-cost таблица |

## Wave C2 — seller/lifecycle moat (юрфирмы без CRO)

| # | Slug | Query | Зачем |
|---|---|---|---|
| T06 | guides/selling-property-south-africa-non-resident | selling property south africa non resident | Никто не собрал s35A+repatriation+CGT+fees воедино; sellers = будущие buyers/рефералы |
| T07 | guides/section-35a-withholding-tax-explained | withholding tax non resident seller 7.5% | 7.5/10/15% + порог R2m + directive process, worked examples (калькулятор — после Code ok) |
| T08 | guides/repatriating-property-sale-proceeds | repatriate money selling property south africa | «Запишите inward transfer или деньги застрянут» — high-anxiety угол против self-serving FX-фирм |
| T09 | guides/cost-of-selling-compliance-certificates | cost of selling house SA compliance certificates | Foreign-seller версия: сертификаты + 5-7% комиссия + s35A + FX |
| T10 | guides/property-transfer-timeline-delays | property transfer taking long deeds office | Week-by-week таймлайн CT Deeds Office + 2026 traps; хаб цепочки rates-clearance |

## Wave C3 — структуры и налоги

| # | Slug | Query | Зачем |
|---|---|---|---|
| T11 | guides/buy-property-company-trust-or-personal | buying property SA through company trust foreigner | Матрица налогов (withholding 7.5/10/15, CGT inclusion 40/80, estate duty) — в SERP только жаргон |
| T12 | guides/vat-vs-transfer-duty-new-developments | vat or transfer duty new development | «R12m new build экономит R1.56m duty» + ссылки на наши 28 проектов (shortlist-мост) |
| T13 | guides/cgt-primary-residence-exclusion-non-residents | primary residence exclusion CGT non resident | Острый вопрос без ясного ответа в SERP; апгрейд CGT-кластера |
| T14 | guides/sars-tax-number-foreign-property-buyer | foreigner register sars tax number | Упоминается везде, не объяснено нигде; шаг из how-to-buy |
| T15 | guides/south-african-will-estate-planning-foreign-owners | do I need south african will property | «12-24 мес. на иностранное завещание» + 2-wills checklist |

## Wave C4 — buyer segments (документированный спрос, ноль конкуренции)

| # | Slug | Query | Зачем |
|---|---|---|---|
| T16 | segments/netherlands-buyers-cape-town-property | buying property cape town from netherlands | Dutch топ-3 наций (R1bn+, кластер Somerset West); Box 3/DTA угол уникален |
| T17 | segments/swiss-buyers-cape-town-property | swiss buying property cape town | Топ-4 нация; CHF + gated estates R4-12m |
| T18 | segments/dubai-uae-buyers-cape-town-property | buying property cape town from dubai | Gulf SA-expats + международники; связка с нашим compare vs Dubai (orphan-fix) |
| T19 | guides/us-citizens-sa-property-tax-reporting | US citizen owning SA property FBAR | FBAR/8938 + treaty + «LLC не работает» — апгрейд US-сегмента |
| T20 | guides/germany-south-africa-tax-treaty-property | double taxation germany SA rental | Немцы — нация №1; в SERP только PDF договора; Progressionsvorbehalt worked example |

## Wave C5 — финансы нерезидента

| # | Slug | Query | Зачем |
|---|---|---|---|
| T21 | guides/non-resident-mortgage-banks-compared | which banks lend foreigners south africa | Bank-by-bank (FNB Foreign Choice, Nedbank 1:1, Absa, Standard) — нет ни у кого; апгрейд 50%-rule страницы |
| T22 | guides/rand-transfer-strategy-property-purchase | best way transfer money buy property SA | Нейтральный rand-cycle + forward contracts против sales-pages FX-брокеров |
| T23 | guides/refinance-equity-release-non-resident | refinance property SA non resident | 50% cap + SARB certificate — вакуум |
| T24 | guides/uk-pension-sipp-south-africa-property | buy overseas property with SIPP | Myth-bust для UK-сегмента (55% charge) + альтернативы |
| T25 | guides/netherlands-south-africa-tax-treaty-property | NL-SA treaty box 3 | Пара к T16; Box 3 exemption-with-progression = триггер покупки |

## Wave C6 — альтернативные пути покупки

| # | Slug | Query | Зачем |
|---|---|---|---|
| T26 | guides/bank-repossessed-property-cape-town | bank repossessed houses cape town | MyRoof/P24 = только листинги; 3 фазы + sheriff 6-10% + voetstoots + «может ли нерезидент» |
| T27 | guides/property-auctions-cape-town | property auctions cape town how it works | Нет авторитетного гида: 10% депозит, комиссия, 4-6 мес. transfer |
| T28 | guides/plot-and-plan-cape-town-build-costs | plot and plan cape town / cost to build | R17k/m² WC + VAT + NHBRC + duty на землю — investor-версии нет |
| T29 | guides/buying-vacant-land-foreigner-south-africa | can foreigners buy land south africa | theafricanvestor тонкий; zoning/services/повышенный rates на землю |
| T30 | guides/deposit-protection-conveyancer-trust-account | is my deposit safe conveyancer trust | Foreign-угол: оплата из-за рубежа, email-fraud, Buyers Trust |

## Wave C7 — niche / high-ticket

| # | Slug | Query | Зачем |
|---|---|---|---|
| T31 | guides/guesthouse-boutique-hotel-investment-cape-town | buy guesthouse cape town licensing | High-ticket лиды; end-to-end «buy+license+run» нет ни у кого (zoning consent, liquor, VAT going-concern) |
| T32 | guides/student-accommodation-stellenbosch-investment | student accommodation stellenbosch investment | 30k студентов vs 6.5k мест, до 14.5% yield — данные есть, страницы нет |
| T33 | guides/cape-town-cbd-conversions-investment | cape town cbd apartments conversions | R12.8bn CBD boom (news-only SERP) → buy/avoid + STR-oversaturation warning |
| T34 | guides/fractional-co-living-investment-cape-town | fractional property investment cape town | Нейтральный разбор (from R100k) vs full title — trust-winner |
| T35 | guides/heritage-property-bo-kaap-de-waterkant | buying heritage property cape town | HWC 60-year rule + heritage overlay + STR De Waterkant — уникальная связка |

## Wave C8 — новые areas: False Bay + южный пояс

| # | Slug | Query | Зачем |
|---|---|---|---|
| T36 | areas/muizenberg-property-investment | muizenberg property investment | Высшая metro-доходность 7.2%, R1.85m медиана, +18%/3yr — SERP из agent-PR |
| T37 | areas/fish-hoek-property-investment | fish hoek property market | 218 сделок/год, R2.35m avg; retiree+UK угол |
| T38 | areas/simons-town-st-james-property-investment | simons town property investment | «Международники берут Kalk Bay/St James/Simon's Town» — investor-страницы нет |
| T39 | areas/noordhoek-kommetjie-property-investment | noordhoek property prices | R5.3m→R8.65m за 3 года, DOM 157→66 — только устаревший PR |
| T40 | areas/observatory-salt-river-property-investment | observatory cape town investment | 8-10% yields, student/medical база; коридор к нашей Woodstock |

## Wave C9 — новые areas: West Coast + north value

| # | Slug | Query | Зачем |
|---|---|---|---|
| T41 | areas/langebaan-west-coast-property-investment | langebaan property investment | R1.3bn/год продаж, 60-107% рост/10 лет; синтеза нет |
| T42 | areas/melkbosstrand-big-bay-property-investment | big bay melkbosstrand property | Сосед нашей Blouberg: тот же kite-surf/STR спрос, ниже вход |
| T43 | areas/pinelands-property-investment | pinelands cape town property | Zero investor-контента; family-rental у госпиталей/UCT |
| T44 | areas/bellville-tyger-valley-property-investment | bellville property investment | Northern suburbs value + Tygerberg medical students |
| T45 | compare/somerset-west-gated-estates-comparison | somerset west estates comparison | Немцы/швейцарцы/голландцы кластер R4-12m: «какой estate» не пакует никто; связка T16-T17 |

## Wave C10 — AEO-авторитет + citation magnets

| # | Slug | Query | Зачем |
|---|---|---|---|
| T46 | guides/foreign-buyers-cape-town-statistics | foreign buyers cape town statistics | Канонический stats-hub (R153bn/10yr, 40+ наций, Germany #1) — цитаты медиа и AI, обновление квартально |
| T47 | guides/how-long-property-transfer-south-africa | how long does transfer take SA | PAA-staple; direct-answer + week-by-week — AI-citation win; feeder к T10 |
| T48 | guides/inheriting-south-african-property-non-resident | inheriting property SA non resident | SARB approval для вывода наследства — незнание массово; lifecycle-замыкание |
| T49 | guides/holiday-home-cape-town-hybrid-model | holiday home cape town pays for itself | «6 недель сам + Airbnb остальное» с реальными ADR/occ по suburbs — психология foreign buyer, прямой мост в shortlist |
| T50 | guides/home-insurance-cape-town-costs | buildings insurance cost cape town | Пустой SERP (US Cape Cod выше SA-контента!); BC-insures vs freehold + бенчмарки премий |

## Резерв (bench, если что-то выпадет)

marriage-regime-foreign-buyers · buying-property-with-crypto-sa · rates-clearance-certificate · areas/elgin-grabouw · segments/france-buyers · segments/nordics-buyers · sa-expats-returning-gulf · buying-timeline-8-12-weeks.

## Калькуляторы (после Code-ok, не статьи)

- Transfer duty + VAT calculator → встроить в `south-africa-transfer-duty-explained` (+ s35A-toggle) — link-magnet (Calcura/Rand Tools уже ранкуются форматом).
- Net-yield calculator per suburb → встроить в `cape-town-rental-yield-guide`.

## KPI на 90 дней после старта волн

- 50 статей проиндексированы; ≥15 в топ-10 по target query (low-competition пояс);
- CTR топ-3 GSC-страниц ≥2% (после corpus Wave 1);
- Лиды: consultation+shortlist submissions ×3 от текущей базы;
- AI-citations: появление в ответах Perplexity/ChatGPT по 10 контрольным запросам (T02, T06, T07, T46, T47).
