# Claude Code — capetown-invest.com

Environment: **MORE Group Content**  
Repo: **max-diver999/capetown-invest-website**

```bash
git pull origin main
git submodule update --init --recursive
```

Read order:

1. `.content-os/STATUS.md`
2. `.content-os/site-passport.yaml`
3. `more-group-content-os/programs/capetown-invest.yaml`
4. `more-group-content-os/policies/claude-autonomous-decisions.md`
5. `more-group-content-os/policies/corpus-cleanup-mode.md`
6. `more-group-content-os/policies/publishing-gates.md`
7. `docs/PRIORITY-CTR-LEADS.md` + `docs/CONTENT_QUALITY_AUDIT.md`
8. `more-group-content-os/analytics-snapshots/capetown-invest-website/2026-08-21.json`
9. `src/pages/site-report/index.astro`
10. `CLAUDE.md`

**Full audit prompt (copy to chat):**

```text
Pull main + submodule. capetown-invest.com — Content OS pilot (EN, ~144 MDX, 7 collections incl. segments).

Прочитай STATUS, site-passport, programs/capetown-invest.yaml, PRIORITY-CTR-LEADS, CONTENT_QUALITY_AUDIT, analytics snapshot, site-report.

GEO 90/100 (grade A, 0 hard fails). Rubric: self 78, unique 81 — усилить дифференциацию. validate 144/144 clean. Задача: полный аудит + roadmap улучшений + план будущего контента (после «ок»).

Фаза 0 — четыре блока, потом СТОП:

A) КОРПУС (все 144 MDX): rates/taxes, STR rules, Lightstone/market data, Atlantic Seaboard areas, projects (Winelands, Val de Vie), compare (Cape Town vs Dubai), segments (4). Каннибализация, orphans, FAQ/schema, consultation + shortlist bridges.

B) RENDERED HTML: npm run build + audit:rendered:fail + qa:full:quick — hero, alt, JSON-LD, lead forms.

C) КОД: сравни с Florida pilot — hubs guides/areas/projects/compare/segments, nav, content-graph, breadcrumbs. site-report gaps. CODE-AUDIT + code-improvements-roadmap.

D) GSC: cape-town-rates-taxes-property (468 imp), short-term-rental-rules (378 imp), market-forecast-2026-2027 (219 imp) — title/meta + direct answers.

Артефакты (commit в ветку cc/capetown-audit-*):
- .content-os/reports/AUDIT-REPORT-{date}.md
- .content-os/reports/CODE-AUDIT-{date}.md
- .content-os/batches/corpus-cleanup-roadmap-{date}.md
- .content-os/batches/code-improvements-roadmap-{date}.md
- .content-os/batches/content-roadmap-{date}.md
- topics-proposal.json

СТОП: не пиши MDX массово, не меняй Astro/layouts, не PR на main, не push, не индексация. Жди «ок» от Максима на roadmaps.

Индексация — только Cursor после «отправляй», ключ capetown-invest-indexing only.
```
