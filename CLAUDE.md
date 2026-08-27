# capetown-invest.com — Claude Code

Content OS pilot. Submodule: `more-group-content-os`.

**Start:** read `CLAUDE-CODE-START.md` and paste the audit prompt into chat.

**Never without Maxim ok:** mass new MDX, Astro/layout refactors, push to main, Google Indexing API.

**Indexing:** only `capetown-invest-indexing` key — see isolation policy.

**Checks:**

```bash
npm run validate:content -- --all
npm run facts:review
npm run geo:audit
npm run build && npm run audit:rendered:fail
npm run qa:full:quick
```

**External claims:** figures about PT/MU/AE live in `.content-os/external-claims.json`, not `facts.json`. Nobody here monitors those jurisdictions, so each carries a `reviewBy` date and `npm run facts:review` fails once one passes. Reviewing means re-reading the primary source, then moving `asOf`/`reviewBy` forward or correcting every file listed.

**Branch:** `cc/capetown-audit-*` or `cc/capetown-fix-*`

**Code reference:** `florida-estate-website` (hub UX, content-graph) — patterns only.
