# Lead growth prep (cheap pass)

Generated for handoff to expensive model. Do not edit by hand unless re-running `node scripts/lead-growth-prep/build-handoff.mjs`.

| File | Purpose |
|------|---------|
| ctr-queue.md | 12 URLs + current title/description |
| www-audit.txt | www/apex redirect status |
| broken-images-top.txt | 404/400 on high-impression MDX |
| README.md | this file |

## Already done in repo (cheap pass)

- LeadForm: `lead_submit` GA4 via investGulfTrack when API accepted !== false; spam → /thanks/ without event; real lead → /thanks/?lead=1 (+ generate_lead on thanks page)
- CtaBox.astro component ready (insert into MDX by expensive model)
- test-lead-spam-gate.mjs: ALL PASS

## Not deployed until push

Commit LeadForm + CtaBox when ready for production.
