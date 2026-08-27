# GEO-диагностика корпуса — 2026-08-27

Измерено новым скорером (`node scripts/geo-score.mjs`). Шкала детерминированной ступени 0–75; судья добавляет до 20, потолок 95. Методика и список отвергнутых сигналов: `docs/GEO-SCORING.md`.

## Итог

| коллекция | файлов | среднее | лучший | в гейте |
|---|---|---|---|---|
| areas | 26 | **6.0** | 47 | 20 |
| segments | 4 | **13.0** | 52 | 3 |
| compare | 15 | **17.5** | 47 | 6 |
| developers | 7 | **25.7** | 61 | 2 |
| news | 5 | **35.4** | 47 | 0 |
| guides | 67 | **40.6** | 63 | 4 |
| projects | 28 | **40.6** | 53 | 1 |
| **весь корпус** | **152** | **30.8** | 63 | 36 |

Распределение: 0–9: 39 · 10–19: 3 · 20–29: 15 · 30–39: 23 · 40–49: 46 · 50–59: 21 · 60–75: 5

Только **7 файлов из 152** не имеют ни одного штрафа.

## Что тянет вниз

| дефект | файлов | суммарный штраф |
|---|---|---|
| duplicated-text | 71 | −3163 |
| template-family | 49 | −2274 |
| stamped-figure | 304 | −1216 |
| heading-echo | 39 | −195 |
| hedging | 42 | −132 |
| self-repetition | 10 | −11 |
| unit-mismatch | 1 | −6 |

Гейты (обрезают потолок): mass-duplication 34 файла, unit-mismatch 1, echo-openers 1.

## Полная таблица

| балл | коллекция | статья | дубли | шаблоны | эхо | штампы | слов |
|---|---|---|---|---|---|---|---|
| 0 | guides | atlantic-seaboard-property-investment-guide | 18.1% | 25 | 0 | 10 | 3931 |
| 0 | guides | cape-town-city-bowl-property-investment | 8.2% | 16 | 0 | 3 | 4635 |
| 0 | guides | cape-town-property-investment-guide | 14.6% | 15 | 0 | 4 | 3191 |
| 0 | guides | eu-citizens-buying-cape-town-property | 8.7% | 13 | 1 | 4 | 3545 |
| 0 | compare | cape-town-vs-dubai-property-investment | 12.7% | 8 | 0 | 7 | 2133 |
| 0 | compare | cape-town-vs-lisbon-property-investment | 42.3% | 8 | 0 | 4 | 1482 |
| 0 | compare | cape-town-vs-portugal-property-investment | 36.1% | 6 | 0 | 6 | 1823 |
| 0 | compare | cape-town-vs-stellenbosch-property | 11.4% | 4 | 0 | 6 | 1963 |
| 0 | compare | somerset-west-vs-constantia-investment | 12.6% | 5 | 0 | 4 | 2113 |
| 0 | areas | bantry-bay-property-investment | 43.1% | 49 | 0 | 11 | 2617 |
| 0 | areas | blouberg-property-investment | 18.3% | 15 | 0 | 4 | 1649 |
| 0 | areas | camps-bay-property-investment | 44.1% | 53 | 0 | 10 | 2560 |
| 0 | areas | claremont-property-investment | 12.8% | 12 | 0 | 1 | 1611 |
| 0 | areas | clifton-property-investment | 32.2% | 43 | 0 | 8 | 2778 |
| 0 | areas | constantia-property-investment | 20.6% | 22 | 0 | 2 | 1597 |
| 0 | areas | de-waterkant-property-investment | 9.2% | 11 | 0 | 5 | 1888 |
| 0 | areas | franschhoek-property-investment | 19.9% | 22 | 0 | 2 | 1570 |
| 0 | areas | fresnaye-property-investment | 23.9% | 23 | 0 | 11 | 2652 |
| 0 | areas | gardens-property-investment | 41.6% | 26 | 0 | 2 | 1605 |
| 0 | areas | green-point-property-investment | 25.1% | 13 | 0 | 3 | 1789 |
| 0 | areas | hermanus-property-investment | 25.4% | 28 | 0 | 8 | 2028 |
| 0 | areas | hout-bay-property-investment | 20.6% | 38 | 0 | 3 | 2569 |
| 0 | areas | milnerton-property-investment | 26.1% | 23 | 0 | 4 | 1602 |
| 0 | areas | newlands-property-investment | 19.5% | 14 | 1 | 6 | 1992 |
| 0 | areas | paarl-property-investment | 34.5% | 23 | 0 | 4 | 1526 |
| 0 | areas | rondebosch-property-investment | 28.9% | 26 | 0 | 3 | 1976 |
| 0 | areas | sea-point-property-investment | 32.3% | 23 | 0 | 6 | 1786 |
| 0 | areas | somerset-west-property-investment | 32.3% | 21 | 0 | 6 | 1685 |
| 0 | areas | tamboerskloof-property-investment | 39.1% | 30 | 0 | 3 | 1929 |
| 0 | areas | woodstock-property-investment | 22.3% | 22 | 0 | 7 | 1944 |
| 0 | segments | german-buyers-cape-town-property | 49.7% | 45 | 0 | 5 | 3296 |
| 0 | segments | uk-buyers-cape-town-property | 54.2% | 45 | 0 | 4 | 2910 |
| 0 | segments | us-buyers-cape-town-property | 31.3% | 44 | 0 | 7 | 3383 |
| 0 | projects | skywater-century-city | 18.5% | 6 | 0 | 5 | 1954 |
| 0 | developers | blok-urban-developers | 16.8% | 11 | 1 | 8 | 2297 |
| 0 | developers | prospekt-property-development | 9.9% | 10 | 0 | 5 | 2384 |
| 0 | developers | rabie-property-developers | 35.5% | 14 | 0 | 1 | 1567 |
| 4 | compare | century-city-vs-durbanville-investment | 8.9% | 5 | 0 | 9 | 2461 |
| 4 | compare | sea-point-vs-camps-bay-investment | 13.9% | 3 | 0 | 6 | 1604 |
| 12 | guides | highest-rental-yield-suburbs-cape-town | 6.6% | 3 | 0 | 9 | 2742 |
| 13 | guides | century-city-property-investment-guide | 7.6% | 5 | 2 | 4 | 2639 |
| 16 | guides | cape-town-rental-yield-guide | 8.9% | 3 | 0 | 7 | 3182 |
| 20 | guides | stellenbosch-property-investment-guide | 6.3% | 2 | 0 | 7 | 2133 |
| 20 | compare | atlantic-seaboard-vs-winelands-investment | 4.5% | 1 | 0 | 9 | 1550 |
| 20 | compare | century-city-vs-sea-point-investment | 6.3% | 2 | 0 | 7 | 1774 |
| 21 | areas | v-and-a-waterfront-property-investment | 4.1% | 5 | 0 | 8 | 1740 |
| 21 | projects | harbour-arch-amdec-foreshore | 4.5% | 1 | 1 | 4 | 999 |
| 21 | projects | on-park-century-city | 8.3% | 2 | 0 | 7 | 2090 |
| 23 | compare | cape-town-vs-mauritius-property-investment | 6.8% | 3 | 0 | 8 | 1960 |
| 23 | compare | paarl-vs-stellenbosch-property-investment | 7.9% | 2 | 0 | 2 | 1958 |
| 23 | news | foreign-buyers-atlantic-seaboard-2025 | 5.3% | 1 | 0 | 9 | 1112 |
| 28 | guides | best-areas-invest-cape-town-2026 | 1.3% | 0 | 0 | 6 | 3920 |
| 28 | guides | gross-vs-net-yield-cape-town | 5.7% | 1 | 0 | 6 | 2454 |
| 28 | areas | kalk-bay-false-bay-property-investment | 0.6% | 1 | 0 | 11 | 5242 |
| 28 | areas | table-view-property-investment | 1.5% | 1 | 0 | 9 | 2217 |
| 28 | projects | green-village-val-de-vie | 2.5% | 4 | 0 | 10 | 1610 |
| 29 | guides | southern-suburbs-cape-town-property | 5.7% | 1 | 0 | 8 | 2433 |
| 30 | guides | new-developments-cape-town-2026 | 7.9% | 0 | 1 | 3 | 2297 |
| 30 | projects | foreshore-place-cape-town | 2% | 1 | 0 | 8 | 1635 |
| 30 | developers | val-de-vie-estate | 0.7% | 0 | 1 | 4 | 1361 |
| 31 | guides | long-term-rental-cape-town-guide | 1.6% | 0 | 1 | 9 | 3147 |
| 32 | areas | durbanville-property-investment | 2.2% | 2 | 0 | 10 | 3961 |
| 33 | guides | cape-town-water-security-property | 1.6% | 1 | 4 | 0 | 2460 |
| 33 | guides | how-to-buy-property-cape-town-step-by-step | 1.2% | 0 | 0 | 10 | 3713 |
| 33 | news | cape-town-luxury-sales-record-2025 | 5.1% | 0 | 0 | 9 | 922 |
| 34 | guides | cape-town-property-market-forecast-2026-2027 | 0.9% | 0 | 1 | 4 | 2135 |
| 35 | guides | cape-town-property-under-500k-usd | 0.1% | 0 | 0 | 8 | 2046 |
| 36 | guides | retirement-visa-south-africa-property | 0.4% | 0 | 0 | 1 | 2526 |
| 36 | projects | acacia-house-woodstock | 1% | 1 | 0 | 7 | 2297 |
| 36 | news | cape-town-interest-rates-property-2026 | 0.4% | 0 | 0 | 3 | 991 |
| 37 | guides | does-buying-property-give-residency-south-africa | 0.9% | 0 | 2 | 5 | 2851 |
| 37 | guides | property-management-cape-town-cost | 0.1% | 0 | 0 | 6 | 2453 |
| 37 | projects | nine-palms-century-city | 2.5% | 2 | 0 | 7 | 1342 |
| 37 | projects | pearl-valley-nova | 0.4% | 1 | 1 | 5 | 2153 |
| 38 | guides | airbnb-investment-cape-town-guide | 2.7% | 2 | 0 | 8 | 2623 |
| 38 | guides | off-plan-property-cape-town-guide | 6.1% | 0 | 0 | 2 | 2863 |
| 38 | compare | western-cape-vs-gauteng-property-investment | 4.5% | 2 | 0 | 1 | 1401 |
| 38 | projects | two-oceans-beach | 0.8% | 2 | 0 | 6 | 2273 |
| 38 | news | western-cape-property-forecast-2026 | 1.1% | 0 | 0 | 3 | 845 |
| 39 | projects | rockwell-tower-cape-town | 1.3% | 2 | 1 | 6 | 1255 |
| 40 | guides | buy-to-let-cape-town-mortgage | 0.2% | 0 | 0 | 4 | 2129 |
| 40 | guides | cape-town-vacancy-rates-rental | 0% | 0 | 0 | 6 | 1725 |
| 40 | guides | foreigner-property-tax-south-africa-hub | 1.6% | 0 | 0 | 6 | 2179 |
| 40 | guides | returning-south-african-expat-property | 0.1% | 0 | 0 | 5 | 2984 |
| 40 | developers | amdec-property-investments | 4% | 2 | 1 | 7 | 2038 |
| 41 | guides | financially-independent-visa-south-africa | 0.1% | 0 | 2 | 3 | 3228 |
| 41 | guides | uk-tax-south-africa-rental-property | 0.1% | 0 | 0 | 4 | 3670 |
| 41 | compare | cape-town-vs-johannesburg-property-investment | 4.2% | 1 | 0 | 5 | 2001 |
| 41 | projects | venice-house-cbd | 1.5% | 3 | 0 | 5 | 1870 |
| 42 | guides | body-corporate-due-diligence-cape-town | 0% | 0 | 1 | 5 | 3071 |
| 42 | guides | buy-cape-town-property-foreigner | 3.9% | 4 | 1 | 5 | 3737 |
| 42 | guides | buy-cape-town-property-remotely | 0.7% | 0 | 0 | 7 | 2323 |
| 42 | guides | sectional-title-vs-freehold-cape-town | 0.2% | 0 | 1 | 5 | 2351 |
| 42 | compare | off-plan-vs-resale-cape-town-investment | 0.9% | 0 | 0 | 5 | 2788 |
| 43 | guides | can-foreigners-buy-property-south-africa | 3.2% | 0 | 0 | 6 | 1815 |
| 43 | guides | security-estates-cape-town-foreign-buyers | 0.4% | 1 | 1 | 3 | 3117 |
| 43 | projects | nineons-green-point | 4.3% | 1 | 0 | 5 | 1327 |
| 44 | guides | cape-town-remote-work-visa-property | 1% | 0 | 0 | 5 | 3594 |
| 44 | guides | cape-town-semigration-property-guide | 1.3% | 0 | 1 | 1 | 2582 |
| 44 | guides | sectional-title-levies-cape-town | 0.2% | 0 | 0 | 6 | 1666 |
| 44 | projects | camps-bay-infinity | 3.1% | 3 | 0 | 6 | 1263 |
| 44 | projects | infinity-milnerton | 0.6% | 1 | 0 | 4 | 1826 |
| 45 | guides | non-resident-rental-income-tax-south-africa | 0.8% | 0 | 0 | 2 | 2026 |
| 45 | projects | observatory-green | 0.6% | 1 | 0 | 4 | 1469 |
| 45 | projects | onehundredonm-sea-point | 1.3% | 2 | 0 | 5 | 1496 |
| 46 | guides | cost-of-buying-property-cape-town | 1.2% | 0 | 1 | 2 | 3638 |
| 46 | guides | is-cape-town-property-good-investment-2026 | 2.2% | 1 | 0 | 5 | 2628 |
| 46 | projects | amdec-hout-bay-project | 1.1% | 1 | 0 | 3 | 1602 |
| 46 | projects | rhapsody-burgundy-estate | 0.5% | 1 | 0 | 2 | 1111 |
| 47 | compare | cape-town-vs-durban-property-investment | 2.8% | 1 | 0 | 6 | 1686 |
| 47 | areas | llandudno-property-investment | 0.1% | 1 | 0 | 6 | 2510 |
| 47 | projects | chestercourt-redevelopment | 0.7% | 1 | 2 | 0 | 1800 |
| 47 | projects | makers-landing-waterfront | 0% | 0 | 0 | 4 | 1385 |
| 47 | projects | three43onb-sea-point | 1.7% | 2 | 0 | 3 | 1529 |
| 47 | news | va-waterfront-granger-bay-development | 0.7% | 0 | 0 | 0 | 1265 |
| 48 | guides | cape-town-property-scams-avoid | 0.1% | 0 | 1 | 4 | 2244 |
| 48 | guides | conveyancing-fees-cape-town | 0.4% | 0 | 0 | 3 | 2460 |
| 48 | guides | cost-of-selling-compliance-certificates | 0% | 1 | 1 | 4 | 1412 |
| 48 | guides | south-africa-capital-gains-tax-property | 0.1% | 0 | 1 | 1 | 2369 |
| 49 | guides | cape-town-digital-nomad-property-guide | 0% | 0 | 0 | 4 | 2846 |
| 49 | guides | cape-town-rates-taxes-property | 0.6% | 0 | 1 | 0 | 2374 |
| 49 | guides | due-diligence-cape-town-property | 0.2% | 0 | 1 | 4 | 3245 |
| 49 | projects | silo-district-residences | 0.5% | 1 | 0 | 1 | 2010 |
| 49 | projects | the-charlotte-cape-town | 1.6% | 0 | 0 | 3 | 2016 |
| 49 | projects | the-ridge-clifton | 0.8% | 1 | 0 | 1 | 1268 |
| 49 | developers | growthpoint-waterfront | 0% | 0 | 0 | 3 | 1689 |
| 50 | guides | cape-town-property-market-data-lightstone | 3% | 1 | 0 | 1 | 1726 |
| 50 | guides | cape-town-property-prices-by-suburb-2026 | 1.2% | 0 | 0 | 4 | 3134 |
| 50 | guides | load-shedding-property-cape-town | 0.9% | 0 | 1 | 2 | 2538 |
| 50 | guides | snagging-inspection-new-build-cape-town | 0.1% | 0 | 0 | 3 | 2336 |
| 50 | projects | oneonr-de-waterkant | 0.9% | 0 | 0 | 4 | 2298 |
| 52 | guides | airbnb-yields-by-suburb-cape-town | 0.3% | 0 | 0 | 5 | 1282 |
| 52 | guides | nhbrc-warranty-south-africa-new-build | 0.3% | 1 | 1 | 1 | 2539 |
| 52 | guides | short-term-rental-rules-cape-town | 0.4% | 0 | 0 | 6 | 2763 |
| 52 | segments | cape-town-property-for-uk-retirees | 0.4% | 0 | 0 | 2 | 2103 |
| 52 | projects | azure-camps-bay-beach | 1.7% | 3 | 0 | 3 | 1342 |
| 52 | projects | zero2one-sea-point | 1.3% | 1 | 0 | 7 | 1581 |
| 53 | guides | south-africa-transfer-duty-explained | 1.4% | 0 | 0 | 1 | 2421 |
| 53 | projects | granger-bay-waterfront | 0% | 0 | 0 | 0 | 1406 |
| 54 | guides | fica-requirements-foreign-property-buyers | 0.6% | 0 | 0 | 1 | 3284 |
| 54 | guides | non-resident-mortgage-cape-town | 0.4% | 0 | 0 | 3 | 1599 |
| 54 | guides | power-of-attorney-property-south-africa | 0.1% | 0 | 1 | 1 | 2651 |
| 54 | guides | repatriating-property-sale-proceeds | 0.3% | 1 | 0 | 1 | 1321 |
| 55 | guides | body-corporate-airbnb-ban-rules | 0.3% | 1 | 0 | 3 | 1375 |
| 55 | guides | cape-town-str-bylaw-2026-registration | 0% | 0 | 1 | 2 | 1732 |
| 55 | guides | south-africa-exchange-control-property | 1.1% | 0 | 1 | 4 | 2507 |
| 56 | guides | cape-town-utilities-costs-owners-2026 | 0.9% | 1 | 0 | 5 | 1334 |
| 60 | guides | selling-property-south-africa-non-resident | 1.9% | 1 | 0 | 5 | 1406 |
| 61 | guides | property-transfer-timeline-delays | 0.2% | 1 | 0 | 4 | 1416 |
| 61 | guides | section-35a-withholding-tax-explained | 1.5% | 1 | 0 | 5 | 1527 |
| 61 | developers | devmco-group | 0% | 0 | 0 | 1 | 1588 |
| 63 | guides | cape-town-municipal-valuation-objection-gv | 0.8% | 1 | 0 | 3 | 1444 |
