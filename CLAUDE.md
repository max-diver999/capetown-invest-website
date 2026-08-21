# capetown-invest.com — Claude Code

Content OS pilot. Submodule: `more-group-content-os`.

**Start:** read `CLAUDE-CODE-START.md` and paste the audit prompt into chat.

**Never without Maxim ok:** mass new MDX, Astro/layout refactors, push to main, Google Indexing API.

**Indexing:** only `capetown-invest-indexing` key — see isolation policy.

**Checks:**

```bash
npm run validate:content -- --all
npm run geo:audit
npm run build && npm run audit:rendered:fail
npm run qa:full:quick
```

**Branch:** `cc/capetown-audit-*` or `cc/capetown-fix-*`

**Code reference:** `florida-estate-website` (hub UX, content-graph) — patterns only.
