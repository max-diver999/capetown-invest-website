# GEO scoring, second attempt

## Why the first one had to be replaced

The old rubric (`scripts/lib/geo-citability-scorer.mjs`) scored five properties of each H2 section and
averaged them. Every rule was additive and pattern-shaped: a 130-170 word paragraph containing any number
earned "citability", the string `MORE Group` earned "uniqueness", the words `is`, `are` or `typically`
earned "answer quality".

In July 2026 an agent was told to lift the corpus to 90+. It complied by injecting roughly 5,400 generated
blocks that satisfied those patterns, including figures that were never true (`R892 non-resident LTV
confirmation`, `179.6% withholding on disposal`) and tokens that were not even words (`r,`, `undefined`).

The failure is measurable. Scoring the labelled sets with the old rubric:

| set | what it is | old score |
|---|---|---|
| `bad` | 59 files as they stood at commit `9cda569` | **mean 90.2** |
| `good` | 10 articles written by hand in August 2026 | **mean 90.5** |
| `mid` | honest prose rebuilt semi-automatically | mean 76.3 |

Separation between garbage and hand-written: **0.3 points**. All 59 garbage files scored at or above the
worst hand-written article, and the honest middle of the corpus scored *below* the garbage. The rubric was
not merely uninformative, it was ordered backwards.

## The principle

A score that is a sum of rewards will be gamed, because whoever is asked to raise it optimises the metric
rather than the article. So this score is a **ceiling lowered by evidence that text was produced
mechanically**, plus a small base for properties that are expensive to fake, and the top of the scale is
placed out of reach of text mutation entirely:

```
deterministic  0 .. 75   patterns, corpus statistics, provenance
judge         0 .. 20    a reader ranking the article against exemplars
final         min(deterministic + judge, 95)
```

You cannot reach 90 by editing text patterns, because twenty of the points are not on that surface.

## What the deterministic stage measures

Corpus-level first, because a single file scored in isolation cannot reveal the thing we care about. The
July failure was one templated mutation applied to many files: invisible per file, obvious across the corpus.

| signal | machine corpus | hand-written | what it catches |
|---|---|---|---|
| cross-file 9-gram duplication | 18.6% | 0.5% | the same passage pasted into many articles |
| sentence skeletons shared with 3+ files | 25.2/file | 0.8/file | paraphrase templates that survive synonym swaps |
| figures stamped across the corpus | 8.3/file | 0.0/file | one number sprayed everywhere (`14 business days` × 442) |
| heading-echo openers | 12.1/file | 0.2/file | a section restating its heading instead of answering it |
| identical opener shape | 0.69 | 0.16 | every section starting the same way |
| hedge words per 1000 | 6.9 | 1.9 | prose that commits to nothing |
| repetition between a file's own sections | 0.160 | 0.000 | one template filling every section of one article |
| figures attached to things they cannot measure | 14.9/file, 59/59 files | 0.0, 0/10 files | `R450,000 turnaround`, `R2,000,000 withholding awareness` |

Gates cap the whole score rather than subtracting from it: malformed tokens cap at 40, a figure attached to
something it cannot measure caps at 40, duplication above 10% caps at 35, self-repetition above 8% caps at
35, more than three echo openers caps at 45.

Two of these came from a forensic pass that measured candidate signals against the labelled sets rather
than guessing: repetition between a file's own sections separates the two classes perfectly (every
hand-written article scores exactly zero), and the unit-type rules fire in all 59 machine files and none of
the 17 honest ones.

Rewards are deliberately few: openers that answer their heading (20), evidence and tables (15), structure
(15), sentence-length spread within sections (8), provenance (10), and a floor of 7.

## Provenance

A figure used in one article is a local worked example and needs nothing. A figure carried by five or more
articles is a load-bearing claim about the world and must appear in `.content-os/facts.json` with a source
and a date. This is the rule that would have caught July, where `7.5%` appeared 860 times across 59 files
with nothing behind it.

Provenance is a reward, not a penalty, on purpose. Penalising an unpopulated registry smears the same
complaint across every article and teaches nobody anything; making it a reward means the points appear only
after somebody has done the sourcing. The registry gate arms itself once the registry covers 80% of the
corpus's load-bearing figures, so a team can populate it incrementally.

The registry is not proof against a determined agent inventing entries. What it does is make invention
**visible**: every entry carries a source and a date, entries are few, and a change that introduces a dozen
of them is obvious in review. That is the honest limit of the mechanism.

Passages that are meant to be identical everywhere (legal disclaimers, the standing note about modelled
yields) are declared in `.content-os/boilerplate.txt`. Declaring an exemption is a visible act; the
detector does not guess.

## What was tried and rejected

Every rule here had to earn its place on the labelled sets. These did not, and are recorded so nobody
re-adds them on intuition:

| candidate | machine | hand-written | why rejected |
|---|---|---|---|
| numbers must sit in a table | 29% prose-only | 53% prose-only | backwards: hand-written articles carry *more* prose figures |
| sentence-length variance ("burstiness") | CV 0.603 | CV 0.464 | backwards: the generated text was more variable, not less |
| count of arithmetic chains | 0.31 | 0.60 | the semi-automatic middle scored highest (1.29), so it tracks nothing |
| structural variety across sections | 0.28 | 0.52 | the middle set matched the garbage (0.26) |
| diversity of sentence openers | 0.10 | 0.19 | too weak to separate, inverted against the middle set |
| currency followed by a bare duration | fires | fires once | `R4,500 nights stack into R135,000 months` is ordinary English; a rule that caps a score has to be precise |

The first rubric was built entirely out of rules like these: plausible, untested, and wrong.

## Calibration

`scripts/geo-calibrate.mjs` rebuilds the labelled sets from git history and scores them. The
implementation must hold:

- garbage `max ≤ 25`
- hand-written `min ≥ 55`
- separation `≥ 35` points

Current state: garbage mean **0.0** (max 0), hand-written mean **69.7** (min 64), middle **57.4**,
separation **69.7 points**, and **0 of 59** garbage files reach the worst hand-written article. Ordering is
now correct: hand-written > semi-automatic > machine-injected.

Any change to the rubric must keep calibration passing. A rule that cannot separate the two sets is a rule
with no evidence behind it.

## How an article is actually written under this

What raises the score:

- Answering each heading in the first sentence, in your own words, with a figure you can source.
- Sourcing the figures the rest of the site also relies on, in `.content-os/facts.json`.
- Saying something the reader cannot get elsewhere, which is the judge's first dimension.
- Making the numbers reconcile: the judge deducts 4 points per arithmetic error it finds.

What cannot raise it, by construction:

- Pasting a paragraph into many articles: the duplication detector is corpus-wide.
- Rotating synonyms through a template: skeletons ignore the words that were swapped.
- Adding sections: the base is an average, and new sections carry their own penalties.
- Repeating a favourite figure everywhere: that is what saturation detection is for.
- Inventing numbers: unregistered load-bearing figures earn none of the provenance points.
- Editing an article after a good judge verdict: verdicts are bound to a content hash and go stale.

## Commands

```bash
node scripts/geo-score.mjs                          # whole corpus, ranked, with gates
node scripts/geo-score.mjs <file.mdx> --explain     # one article, every penalty
node scripts/geo-calibrate.mjs                      # does the rubric still separate the labelled sets?
node scripts/geo-calibrate.mjs --old                # what the previous rubric scored
node scripts/geo-judge.mjs packet <file.mdx>        # emit the judging packet
node scripts/geo-judge.mjs record <file.mdx> v.json # store a verdict, bound to content hash
node scripts/geo-judge.mjs final <file.mdx>         # deterministic + judge
```
