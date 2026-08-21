import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

/** Frontmatter dates keyed by public URL, so the sitemap can carry real lastmod values. */
function buildLastmodMap() {
  const root = path.resolve('./src/content');
  const map = new Map();
  if (!fs.existsSync(root)) return map;
  for (const collection of fs.readdirSync(root)) {
    const dir = path.join(root, collection);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const updated = raw.match(/^updatedDate:\s*(\S+)/m)?.[1];
      const published = raw.match(/^pubDate:\s*(\S+)/m)?.[1];
      const stamp = (updated || published || '').replace(/["']/g, '');
      if (!stamp) continue;
      const slug = file.replace(/\.mdx?$/, '');
      map.set(`https://capetown-invest.com/${collection}/${slug}/`, new Date(stamp).toISOString());
    }
  }
  return map;
}

const LASTMOD = buildLastmodMap();

export default defineConfig({
  site: 'https://capetown-invest.com',
  output: 'static',
  trailingSlash: 'always',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter(page) {
        const excluded = [
          '/thanks/',
          '/site-report/',
        ];
        return !excluded.some((path) => page.includes(path));
      },
      serialize(item) {
        const lastmod = LASTMOD.get(item.url);
        if (lastmod) item = { ...item, lastmod };
        if (item.url === 'https://capetown-invest.com/') {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        if (item.url.includes('/guides/')) {
          return { ...item, priority: 0.85, changefreq: 'weekly' };
        }
        if (item.url.includes('/segments/')) {
          return { ...item, priority: 0.82, changefreq: 'weekly' };
        }
        if (item.url.includes('/areas/') || item.url.includes('/compare/')) {
          return { ...item, priority: 0.8, changefreq: 'weekly' };
        }
        if (item.url.includes('/projects/')) {
          return { ...item, priority: 0.75, changefreq: 'weekly' };
        }
        if (item.url.includes('/developers/')) {
          return { ...item, priority: 0.72, changefreq: 'monthly' };
        }
        if (item.url.includes('/news/')) {
          return { ...item, priority: 0.65, changefreq: 'weekly' };
        }
        return { ...item, priority: 0.7, changefreq: 'monthly' };
      },
    }),
    mdx(),
  ],
});
