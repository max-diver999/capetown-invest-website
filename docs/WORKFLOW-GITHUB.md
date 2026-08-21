# GitHub workflow — capetown-invest.com pilot

## Repos

| Repo | Role |
|---|---|
| `max-diver999/capetown-invest-website` | Site + `.content-os` |
| `max-diver999/more-group-content-os` | Registry, program, snapshots, policies (submodule) |

## Claude

1. Branch `cc/capetown-audit-YYYYMMDD` from `main`
2. Phase 0 artifacts only
3. Open PR; **do not merge**

## Cursor (after Maxim «ок»)

1. Merge with git identity `max-diver999 <maks.shchegolev@gmail.com>`
2. validate → build → `qa:full:quick`
3. Push → Vercel
4. Indexing on «отправляй» — preflight `capetown-invest-indexing`

## Submodule

```bash
cd capetown-invest-website
git submodule update --remote more-group-content-os
git add more-group-content-os && git commit -m "chore: bump content-os submodule"
```
