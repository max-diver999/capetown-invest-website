import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Two-layer related-content resolver.
 *
 *  Layer 1 — curated: `relatedSlugs` in frontmatter (populated across 125 files
 *  but rendered nowhere before this module existed).
 *  Layer 2 — entity: area <-> projects in that area <-> developer behind them,
 *  derived from the `area` / `region` / `developer` fields on project entries.
 *
 * Both layers return the same shape so ArticleLayout can render them uniformly.
 */

export type GraphCollection = 'guides' | 'areas' | 'projects' | 'compare' | 'segments' | 'developers' | 'news';

export interface RelatedLink {
  href: string;
  title: string;
  description?: string;
  label: string;
}

const COLLECTIONS: GraphCollection[] = ['guides', 'areas', 'projects', 'compare', 'segments', 'developers', 'news'];

const LABELS: Record<GraphCollection, string> = {
  guides: 'Guide',
  areas: 'Area',
  projects: 'Project',
  compare: 'Comparison',
  segments: 'Buyer guide',
  developers: 'Developer',
  news: 'News',
};

type AnyEntry = CollectionEntry<GraphCollection>;

interface IndexedEntry {
  id: string;
  collection: GraphCollection;
  title: string;
  description: string;
  noindex: boolean;
  area?: string;
  region?: string;
  developer?: string;
}

let cache: IndexedEntry[] | null = null;

async function loadIndex(): Promise<IndexedEntry[]> {
  if (cache) return cache;
  const all: IndexedEntry[] = [];
  for (const collection of COLLECTIONS) {
    const entries = (await getCollection(collection)) as AnyEntry[];
    for (const entry of entries) {
      const data = entry.data as Record<string, unknown>;
      all.push({
        id: entry.id,
        collection,
        title: String(data.title ?? ''),
        description: String(data.description ?? ''),
        noindex: Boolean(data.noindex),
        area: typeof data.area === 'string' ? data.area : undefined,
        region: typeof data.region === 'string' ? data.region : undefined,
        developer: typeof data.developer === 'string' ? data.developer : undefined,
      });
    }
  }
  cache = all;
  return all;
}

function toLink(entry: IndexedEntry): RelatedLink {
  return {
    href: `/${entry.collection}/${entry.id}/`,
    title: entry.title,
    description: entry.description,
    label: LABELS[entry.collection],
  };
}

/** Normalises "Camps Bay", "camps-bay" and "camps-bay-property-investment" to a comparable key. */
function areaKey(value?: string): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/-property-investment$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Layer 1: curated relatedSlugs, resolved across every collection. */
export async function resolveRelatedSlugs(slugs: string[], selfId: string): Promise<RelatedLink[]> {
  if (!slugs.length) return [];
  const index = await loadIndex();
  const out: RelatedLink[] = [];
  for (const raw of slugs) {
    const slug = raw.replace(/^\/+|\/+$/g, '').split('/').pop() ?? raw;
    const hit = index.find((e) => e.id === slug && e.id !== selfId && !e.noindex);
    if (hit && !out.some((l) => l.href === `/${hit.collection}/${hit.id}/`)) out.push(toLink(hit));
  }
  return out;
}

/**
 * Layer 2: entity neighbours.
 * areas -> projects in that area; projects -> its area, developer and sibling projects;
 * developers -> their projects.
 */
export async function resolveRelatedEntities(
  collection: GraphCollection,
  id: string,
  limit = 4,
): Promise<RelatedLink[]> {
  const index = await loadIndex();
  const self = index.find((e) => e.collection === collection && e.id === id);
  if (!self) return [];
  const projects = index.filter((e) => e.collection === 'projects' && !e.noindex);
  const out: IndexedEntry[] = [];

  const push = (entry?: IndexedEntry) => {
    if (!entry || entry.noindex) return;
    if (entry.collection === collection && entry.id === id) return;
    if (out.some((e) => e.collection === entry.collection && e.id === entry.id)) return;
    out.push(entry);
  };

  if (collection === 'areas') {
    const key = areaKey(id);
    projects.filter((p) => areaKey(p.area) === key).forEach(push);
  }

  if (collection === 'projects') {
    const key = areaKey(self.area);
    if (key) push(index.find((e) => e.collection === 'areas' && areaKey(e.id) === key));
    if (self.developer) {
      const devKey = areaKey(self.developer);
      push(index.find((e) => e.collection === 'developers' && (areaKey(e.id).includes(devKey) || devKey.includes(areaKey(e.id)))));
    }
    projects.filter((p) => key && areaKey(p.area) === key).forEach(push);
    if (out.length < limit && self.region) {
      projects.filter((p) => p.region === self.region).forEach(push);
    }
  }

  if (collection === 'developers') {
    const devKey = areaKey(id);
    projects
      .filter((p) => {
        const k = areaKey(p.developer);
        return k && (k.includes(devKey) || devKey.includes(k));
      })
      .forEach(push);
  }

  return out.slice(0, limit).map(toLink);
}
