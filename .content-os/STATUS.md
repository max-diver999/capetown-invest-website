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

### Baseline на main (до аудита)

| Сигнал | Значение |
|---|---|
| MDX всего | **144** (7 коллекций, incl. segments 4) |
| GEO commercial | **90/100, grade A** — 0 ниже минимума |
| `validate:content --all` | **144/144** clean |
| GSC stage | early traction — rates/taxes, STR rules, areas |
| Последний prod commit | 2026-08 (Wikidata Q140810037) |

**Главный вывод:** GEO сильный, но **self 78 / unique 81** — room for differentiation. Пилот = полный аудит + hub UX (Florida reference) + CTR на compliance guides + roadmap тем.

### Фаза 0 — аудит

**Ожидается от Claude.** Артефакты → `.content-os/reports/` и `.content-os/batches/`.

## Индексация

Только ключ **`capetown-invest-indexing`**. Cursor после «отправляй».
