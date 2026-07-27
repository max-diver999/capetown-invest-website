# CtaBox — mid-page CTA (cheap prep)

Component: `src/components/CtaBox.astro` (same pattern as mexico-invest).

## Insert in MDX (after first major section)

```mdx
import CtaBox from '../../../components/CtaBox.astro';

<CtaBox
  title="Investing in Cape Town from abroad?"
  description="Share your budget and target suburb. Independent shortlist within one business day. No developer pressure."
  href="/get-shortlist/"
/>
```

Adjust import depth: `guides/` → `../../../components/`, `areas/` → same.

## Suggested placements (expensive model)

| MDX file | Suggested title hook |
|----------|---------------------|
| cape-town-rates-taxes-property.mdx | After rates table: link to foreign-buyer + shortlist |
| short-term-rental-rules-cape-town.mdx | After STR rules summary |
| cape-town-property-market-forecast-2026-2027.mdx | After forecast TL;DR |
| buy-cape-town-property-foreigner.mdx | After step-by-step block |

Also add 2 internal links in prose to `/guides/buy-cape-town-property-foreigner/` and `/get-shortlist/`.

No em dash in copy.
