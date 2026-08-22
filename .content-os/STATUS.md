# Content status — capetown-invest.com

> **Единственный файл «где мы сейчас».** Claude Code и Cursor читают его первым после `git pull origin main`.

## Источник правды

- Репозиторий: `max-diver999/capetown-invest-website`, ветка **`main`**
- Программа: `more-group-content-os/programs/capetown-invest.yaml`
- Процесс: `docs/WORKFLOW-GITHUB.md`
- **Цель пилота:** больше лидов с намерением купить в Кейптауне — полный аудит, улучшения кодом и корпуса, план контента
- **Автономия Claude:** `more-group-content-os/policies/claude-autonomous-decisions.md`

## Content OS pilot — подключён (2026-08-21)

| Артефакт | Путь |
|---|---|
| Паспорт | `.content-os/site-passport.yaml` |
| Analytics snapshot | `more-group-content-os/analytics-snapshots/capetown-invest-website/2026-08-21.json` |
| Приоритеты GSC | `docs/PRIORITY-CTR-LEADS.md` |
| GEO baseline | `docs/CONTENT_QUALITY_AUDIT.md` |
| Живой отчёт | `src/pages/site-report/` |

## Фаза 0 — аудит: ✅ выполнена (2026-08-21)

Артефакты в ветке `claude/capetown-content-audit-h6qbx7`:

| Документ | Что внутри |
|---|---|
| `.content-os/reports/AUDIT-REPORT-2026-08-21.md` | корпус + rendered HTML + GSC |
| `.content-os/reports/CODE-AUDIT-2026-08-21.md` | код vs Florida pilot |
| `.content-os/batches/corpus-cleanup-roadmap-2026-08-21.md` | 11 волн зачистки |
| `.content-os/batches/code-improvements-roadmap-2026-08-21.md` | 6 код-волн |
| `.content-os/batches/content-roadmap-2026-08-21.md` + `topics-proposal.json` | 50 статей, 10 волн |

**Главная находка аудита:** коммит `9cda569` (04.07.2026, «geo: lift full corpus to 90+», +16 460 строк в 152 файлах) вставил под почти каждый H2 авто-генерированные блоки с перепутанными цифрами. GEO 90/100 был накручен ими: rubric «stats» оплачивался галлюцинированными финансовыми утверждениями в индексируемом тексте («R892 non-resident LTV confirmation», «179.6% withholding», битые токены `r,`, `undefined`), плюс утечка white-label бренда «MORE Group» ×841.

## Фаза 1 — исполнение: ✅ выполнена (2026-08-21)

### Корпус (144 MDX)

| Что сделано | Объём |
|---|---|
| Удалено мусорных блоков | **5 400+** (7 семейств: buyer-desk-flags, MORE Group snapshots, DD notes, junk Benchmark-таблицы, heading-echo openers, битые токены) |
| Написано разделов взамен пустых | **141** секция реального экспертного текста |
| Нормализовано заголовков | **815** (снят «?» у не-вопросов, восстановлена капитализация) + 4 шаблонных семейства переименованы |
| Битые внутренние ссылки | 18 → **0** |
| Orphan-страницы (rendered) | 14 → **0** (медиана 9 входящих ссылок на страницу) |
| Межфайловые дубли абзацев | 9 семейств → **3** (остались только легальные дисклеймеры) |
| «MORE Group» / мусорные маркеры | 841 → **0** |
| «MODELED» | 2 729 → 472 (≤8 на файл) |

Числовые конфликты устранены: устаревшая шкала transfer duty (R1,100,000) заменена на действующую SARS-таблицу с 01.04.2025; R11.3bn приведён к единому определению (Atlantic Seaboard + City Bowl); национальный рост размечен как realised 2025 vs forecast 2026; Blouberg yield согласован с area-страницей; в таблицу prices-by-suburb добавлено пояснение базы расчёта.

Titles: сняты дубли «Guide 2026 Guide 2026» (5 файлов), убрана неподтверждённая статистика «75% of blocks restrict it» с топ-страницы GSC, переименована страница несуществующего проекта, 11 слабых заголовков усилены цифрой/выгодой.

### Код

- **Навигация:** мобильное меню (раньше сайт был недоступен с телефона), центральный `src/data/nav.ts`, полный футер с pillar-блоком и WhatsApp.
- **Content graph:** `src/lib/content-graph.ts` — `relatedSlugs` (мертвы в 125 файлах) + entity-связи район↔проекты↔застройщик; рендерятся `RelatedLinks` и видимые `Breadcrumbs`.
- **Хабы:** `HubLayout` для всех 7 коллекций — кластеризация, интро со ссылками, jump-nav, hub-FAQ, лид-форма, `CollectionPage` + `ItemList` JSON-LD.
- **Схемы:** `WebSite` сайтвайд, `NewsArticle` для новостей, `ApartmentComplex` на проектах, гейт двойного `FAQPage`, из `sameAs` убраны самоссылки.
- **Соцпревью:** отрендерен брендовый `og-default.png` 1200×630 вместо SVG-фавиконки, абсолютный og:image + `og:image:alt` + `twitter:image`.
- **Прочее:** `<title>` без бренд-суффикса, когда тот не влезает в 60 символов; sitemap с `lastmod`; страница 404; hero получил осмысленный alt + width/height + fetchpriority; LeadForm работает при нескольких формах на странице, валидирует телефон, уникальные id; цены проектов переведены с мёртвого `priceFromUsd` на `priceFromZAR`; аналитика переименована из `investGulfTrack`, валюта лида ZAR.
- **Гейты:** `cloudinary-gate`, `indexnow-log`, `record-submitted` вендорены в `scripts/lib/` — `validate:content` и `qa:full` теперь работают на чистом клоне и в CI. Удалён `submit-all-50.sh` (слал mexico-invest URL под ключом Кейптауна), а также скрипты и манифесты Mexico/Spain/Singapore и мёртвый `homeProjects.ts`.

### Метрики после Фазы 1

| Сигнал | До | После |
|---|---|---|
| `validate:content --all` | 144/144, но гейт падал на чистом клоне | **144/144 clean, гейт работает в CI** |
| `build` + `audit:rendered:fail` (local) | 0 ошибок | **0 ошибок** |
| Битые внутренние ссылки | 18 | **0** |
| Orphan-страницы (rendered) | 14 | **0**, медиана 9 входящих ссылок |
| Мусорные блоки в production HTML | ~5 400 | **0** |
| «MORE Group» на публичных страницах | 841 | **0** |
| Дубли FAQPage | 120+ страниц | **0** |
| Title > 60 символов | 148 из 161 | **0** (средняя 52) |
| Дубли title / description | 0 / 0 | **0 / 0** |
| GEO commercial | 90/100 (накручен мусором) → 64 честных | **77/100, grade B**, худшая страница 70/100 при минимуме 60 |
| GEO rubric answer / stats | 63 / 74 (после снятия мусора) | **82 / 91** |
| Слов в корпусе | ~590 000 (с мусором) | **260 000** живого текста |

GEO-цифры не сравнимы с июльскими напрямую: тот скор оплачивался мусорными блоками, которые рубрика засчитывала как «citability». Сейчас те же критерии выполнены настоящими самодостаточными абзацами, а сама рубрика перестала награждать за «MORE Group» и «underwriting snapshot».

## Что дальше

1. **Cursor: перенести 139 hero на Cloudinary.** Инструкция — `docs/HERO-IMAGES-CLOUDINARY.md`. У Claude в облаке нет ключей, всё остальное подготовлено: `npm run images:manifest` → `npm run images:mirror`. Код уже умеет Cloudinary-трансформации.
2. Волны нового контента C1–C10 по `content-roadmap-2026-08-21.md` (50 статей) — **Wave C1 опубликована 22.08** (см. ниже), C2 следующая.

### Wave C1 — опубликована (2026-08-22, «ок» Максима)

5 статей, каждая написана вручную и держит GEO ≥90/100 при coverage 100%:

| Slug | GEO | Угол |
|---|---|---|
| guides/cape-town-str-bylaw-2026-registration | 90 | Драфт STR by-law (авг 2026): регистрация, comments до 5 Oct 2026 |
| guides/airbnb-yields-by-suburb-cape-town | 90 | ROI-таблица: Airbtics/AirROI данные × наши цены покупки |
| guides/body-corporate-airbnb-ban-rules | 90 | Paddock-прецедент, 75% special resolution, CSOS |
| guides/cape-town-municipal-valuation-objection-gv | 90 | GV2025: новый счёт rates, апелляции, R620k exemption |
| guides/cape-town-utilities-costs-owners-2026 | 90 | Тарифы 2026/27 + отмена fixed charges судом |

Корпус: **147 MDX**, sitemap 162 URL. Новые страницы вписаны в кластеры хаба, получили 4–7 входящих ссылок каждая, llms.txt перегенерирован. Данные строятся на событиях после июня 2026 (драфт by-law, суд SAPOA/AfriForum, принятый бюджет 29.06), которых нет у конкурентов.

### Сделано после первой сводки

- **Слияние каннибалов выполнено** (Максим, 21.08): `hidden-costs-buying-property-cape-town` → `cost-of-buying-property-cape-town`, `cape-town-property-investment-checklist` → `how-to-buy-property-cape-town-step-by-step`. Уникальный материал перенесён, FAQ объединены, внутренние ссылки перенаправлены, 301 в `vercel.json`. Обе страницы дают 79 и 80/100 при coverage 100%. Корпус: **142 MDX**.

## Индексация

Только ключ **`capetown-invest-indexing`**. Cursor после «отправляй».
