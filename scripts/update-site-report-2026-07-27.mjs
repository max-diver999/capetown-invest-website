#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const fp = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/pages/site-report/index.astro');
let s = fs.readFileSync(fp, 'utf8');

const front = `const reportDate = '27 July 2026';
const reportVersion = 'v2.1';
const launchDate = '10 June 2026';
const dataThrough = '24 July 2026';

const monthlyGsc = [
  { month: 'Jun 2026', label: 'Jun', clicks: 4, impressions: 432, position: 15.7, note: '18 Jun first impressions · avg pos improving late month' },
  { month: 'Jul 2026', label: 'Jul', clicks: 18, impressions: 1327, position: 8.7, note: 'Through 24 Jul · GSC lag 2–3 days' },
];

const monthlyGa4 = [
  { month: 'Jun', sessions: 69 },
  { month: 'Jul', sessions: 108 },
];

const contentBreakdown = [
  { type: 'Guides', count: 59, words: 276000, color: '#2d7a5e' },
  { type: 'Areas', count: 26, words: 112001, color: '#8b5cf6' },
  { type: 'Projects', count: 28, words: 91917, color: '#4e9e7e' },
  { type: 'Comparisons', count: 15, words: 58913, color: '#d97706' },
  { type: 'Developers', count: 7, words: 24363, color: '#60a5fa' },
  { type: 'Segments', count: 4, words: 18167, color: '#0891b2' },
  { type: 'News', count: 5, words: 9058, color: '#9ca3af' },
];

const weeklyMetrics = [
  { week: '2–8 Jun', gscClicks: 0, gscImp: 0, gscPos: '—', ga4: 0, bingC: 0, aeoQueries: 0, aeoTop10: 0, geoScore: '—', geoMdx: '96+' },
  { week: '9–15 Jun', gscClicks: 0, gscImp: 0, gscPos: '—', ga4: 0, bingC: 0, aeoQueries: 0, aeoTop10: 0, geoScore: '—', geoMdx: '110+' },
  { week: '16–22 Jun', gscClicks: 3, gscImp: 186, gscPos: '22.8', ga4: 56, bingC: 0, aeoQueries: 28, aeoTop10: 4, geoScore: '—', geoMdx: '116' },
  { week: '23–29 Jun', gscClicks: 1, gscImp: 206, gscPos: '10.0', ga4: 11, bingC: 0, aeoQueries: 7, aeoTop10: 0, geoScore: '—', geoMdx: '116' },
  { week: '30 Jun – 6 Jul', gscClicks: 3, gscImp: 446, gscPos: '7.9', ga4: 17, bingC: 0, aeoQueries: 2, aeoTop10: 0, geoScore: '—', geoMdx: '116' },
  { week: '7–13 Jul', gscClicks: 5, gscImp: 466, gscPos: '9.0', ga4: 23, bingC: 0, aeoQueries: 9, aeoTop10: 0, geoScore: '85→90', geoMdx: '144' },
  { week: '14–20 Jul', gscClicks: 4, gscImp: 283, gscPos: '9.1', ga4: 35, bingC: 2, aeoQueries: 3, aeoTop10: 1, geoScore: '90', geoMdx: '144' },
  { week: '21–27 Jul', gscClicks: 6, gscImp: 172, gscPos: '9.6', ga4: 35, bingC: 3, aeoQueries: 3, aeoTop10: 0, geoScore: '90', geoMdx: '144' },
];

const totalClicks = monthlyGsc.reduce((s, m) => s + m.clicks, 0);
const totalImp = monthlyGsc.reduce((s, m) => s + m.impressions, 0);
const totalWords = contentBreakdown.reduce((s, c) => s + c.words, 0);
const totalFiles = contentBreakdown.reduce((s, c) => s + c.count, 0);
const clicksDelta = 0;
const maxImp = Math.max(...monthlyGsc.map(m => m.impressions));`;

s = s.replace(
  /const reportDate = '25 June 2026';[\s\S]*?const maxImp = Math\.max\(\.\.\.monthlyGsc\.map\(m => m\.impressions\)\);/,
  front,
);

s = s.replace(
  /<div class="live-badge"><span class="live-dot"><\/span> 116 MDX · 131 sitemap · gap 0<\/div>/,
  '<div class="live-badge"><span class="live-dot"></span> 144 MDX · 159 sitemap · GEO 90+ · spam gate live</div>',
);

const glance = `  <div class="stats-grid">
    <div class="stat-card">
      <div class="num teal">159</div>
      <div class="label">URLs in sitemap</div>
      <div class="sublabel">28 projects · 59 guides · 26 areas · 15 compare · live 27 Jul</div>
    </div>
    <div class="stat-card">
      <div class="num amber">0</div>
      <div class="label">Ahrefs DR</div>
      <div class="sublabel">Pre-baseline · link building Q3 target DR 5–10</div>
    </div>
    <div class="stat-card">
      <div class="num">~590K</div>
      <div class="label">SEO words</div>
      <div class="sublabel">144 MDX · ~4 100 avg · corpus GEO 90+</div>
    </div>
    <div class="stat-card">
      <div class="num teal">20</div>
      <div class="label">GSC click URLs</div>
      <div class="sublabel">18 Jun–24 Jul · guides + areas + projects</div>
    </div>
    <div class="stat-card">
      <div class="num">7</div>
      <div class="label">Collections + hubs</div>
      <div class="sublabel">guides · projects · areas · compare · developers · segments · news</div>
    </div>
    <div class="stat-card">
      <div class="num amber">22</div>
      <div class="label">GSC clicks</div>
      <div class="sublabel">1 759 imp · CTR 1.25% · avg pos 10.4</div>
    </div>
    <div class="stat-card">
      <div class="num teal">177</div>
      <div class="label">GA4 sessions</div>
      <div class="sublabel">17 Jun–26 Jul · lead API 200 · spam filter 13 Jul</div>
    </div>
  </div>`;

s = s.replace(/  <div class="stats-grid">[\s\S]*?  <\/div>\n\n\n  <!-- ═══ GROWTH DASHBOARD/, `${glance}\n\n\n  <!-- ═══ GROWTH DASHBOARD`);

s = s.replace(
  '<span class="kpi-delta neutral">Early index</span>\n      <div class="kpi-sub">Since launch · Google Search Console</div>',
  '<span class="kpi-delta up">↑ +350% Jul</span>\n      <div class="kpi-sub">22 total · 18 in Jul · Google Search Console</div>',
);
s = s.replace(
  '<div class="kpi-value">61</div>\n      <span class="kpi-delta up">↑ First crawl</span>\n      <div class="kpi-sub">Jun 2026 cumulative</div>',
  '<div class="kpi-value">177</div>\n      <span class="kpi-delta up">↑ Jul 108</span>\n      <div class="kpi-sub">17 Jun–26 Jul · GA4</div>',
);
s = s.replace(
  '<div class="kpi-sub">198 total · first impressions 18 Jun</div>',
  '<div class="kpi-sub">1 759 total · peak day 105 imp (5 Jul)</div>',
);

const weeklyBlock = `  <section class="section">
    <div class="section-head">
      <div>
        <h2>Weekly SEO / AEO / GEO (last 8 weeks)</h2>
        <p>Calendar weeks Mon–Sun · GSC through {dataThrough} · GA4 through 26 Jul · GEO score from corpus audit (snapshot, not historical API).</p>
      </div>
      <span class="badge-src">GSC + GA4 + Bing MCP · {reportDate}</span>
    </div>
    <div class="card">
      <div class="card-title">Week-over-week</div>
      <div class="pulse-table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>GSC clicks</th>
              <th>GSC imp</th>
              <th>Avg pos</th>
              <th>GA4 sessions</th>
              <th>Bing clk</th>
              <th>AEO queries</th>
              <th>Top-10 queries</th>
              <th>GEO score</th>
              <th>MDX</th>
            </tr>
          </thead>
          <tbody>
            {weeklyMetrics.map(w => (
              <tr>
                <td><strong>{w.week}</strong></td>
                <td class="num">{w.gscClicks}</td>
                <td>{w.gscImp.toLocaleString('en-US')}</td>
                <td>{w.gscPos}</td>
                <td>{w.ga4}</td>
                <td>{w.bingC}</td>
                <td>{w.aeoQueries}</td>
                <td>{w.aeoTop10}</td>
                <td>{w.geoScore}</td>
                <td>{w.geoMdx}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div class="insight">
        <strong>Momentum:</strong> impressions scaled 7× from late June to early July; avg position moved from ~23 to ~9. GEO corpus lifted to 90/100 commercial min in mid-July. Bing first clicks from 14 Jul week.
      </div>
    </div>
  </section>

`;

if (!s.includes('Weekly SEO / AEO / GEO')) {
  s = s.replace(
    '  <section class="section">\n    <div class="section-head">\n      <div>\n        <h2>SEO momentum — daily trend</h2>',
    weeklyBlock + '  <section class="section">\n    <div class="section-head">\n      <div>\n        <h2>SEO momentum — daily trend</h2>',
  );
}

const chartPayload = {
  monthlyGsc: [
    { label: 'Jun', clicks: 4, impressions: 432 },
    { label: 'Jul', clicks: 18, impressions: 1327 },
  ],
  monthlyGa4: [
    { month: 'Jun', sessions: 69 },
    { month: 'Jul', sessions: 108 },
  ],
  contentBreakdown: [
    { type: 'Guides', count: 59, color: '#2d7a5e' },
    { type: 'Areas', count: 26, color: '#8b5cf6' },
    { type: 'Projects', count: 28, color: '#4e9e7e' },
    { type: 'Comparisons', count: 15, color: '#d97706' },
    { type: 'Developers', count: 7, color: '#60a5fa' },
    { type: 'Segments', count: 4, color: '#0891b2' },
    { type: 'News', count: 5, color: '#9ca3af' },
  ],
  dailyRaw: [
    { d: '06-18', c: 0, i: 22 },
    { d: '06-19', c: 2, i: 67 },
    { d: '06-20', c: 0, i: 41 },
    { d: '06-21', c: 1, i: 36 },
    { d: '06-22', c: 0, i: 20 },
    { d: '06-23', c: 1, i: 12 },
    { d: '06-24', c: 0, i: 12 },
    { d: '06-25', c: 0, i: 15 },
    { d: '06-26', c: 0, i: 23 },
    { d: '06-27', c: 0, i: 48 },
    { d: '06-28', c: 0, i: 41 },
    { d: '06-29', c: 0, i: 55 },
    { d: '06-30', c: 0, i: 40 },
    { d: '07-01', c: 0, i: 49 },
    { d: '07-02', c: 1, i: 83 },
    { d: '07-03', c: 0, i: 69 },
    { d: '07-04', c: 1, i: 46 },
    { d: '07-05', c: 1, i: 105 },
    { d: '07-06', c: 0, i: 54 },
    { d: '07-07', c: 0, i: 76 },
    { d: '07-08', c: 1, i: 82 },
    { d: '07-09', c: 1, i: 85 },
    { d: '07-10', c: 0, i: 49 },
    { d: '07-11', c: 0, i: 59 },
    { d: '07-12', c: 2, i: 60 },
    { d: '07-13', c: 1, i: 55 },
    { d: '07-14', c: 0, i: 45 },
    { d: '07-15', c: 0, i: 39 },
    { d: '07-16', c: 1, i: 29 },
    { d: '07-17', c: 1, i: 45 },
    { d: '07-18', c: 0, i: 49 },
    { d: '07-19', c: 0, i: 35 },
    { d: '07-20', c: 2, i: 41 },
    { d: '07-21', c: 1, i: 44 },
    { d: '07-22', c: 3, i: 38 },
    { d: '07-23', c: 2, i: 47 },
    { d: '07-24', c: 0, i: 43 },
  ],
};

s = s.replace(
  /<script type="application\/json" id="chart-data">[\s\S]*?<\/script>/,
  `<script type="application/json" id="chart-data">${JSON.stringify(chartPayload)}</script>`,
);

s = s.replace(
  '<strong>Cape Town Invest</strong> · capetown-invest.com · Report updated 25 Jun 2026 v2.0 · 131 sitemap URLs · ~335K words · GSC 4 clicks / 198 imp (10 Jun–24 Jun) · GA4 61 sessions · 48 git commits<br>',
  '<strong>Cape Town Invest</strong> · capetown-invest.com · Report updated 27 Jul 2026 v2.1 · 159 sitemap · ~590K words · GSC 22 clicks / 1 759 imp (18 Jun–24 Jul) · GA4 177 sessions · Bing 5 clicks<br>',
);

const changelogTop = `    <div class="changelog-item">
      <div class="changelog-date">27 Jul 2026 v2.1</div>
      <div class="changelog-content">
        <div class="changelog-title">Site report refresh + GEO 90 corpus + lead spam gate</div>
        <div class="changelog-desc">144 MDX · 159 sitemap · GSC 22 clk / 1.8k imp · GA4 177 sessions · Bing 5 clk · weekly SEO/AEO/GEO table · top-100 indexing batch.</div>
        <div class="changelog-tags"><span class="tag green">Report</span><span class="tag blue">GSC</span><span class="tag amber">GEO</span></div>
      </div>
    </div>`;

s = s.replace(
  /    <div class="changelog-item">\n      <div class="changelog-date">25 Jun 2026 v2.0<\/div>[\s\S]*?<\/div>\n    <\/div>\n    <div class="changelog-item">\n      <div class="changelog-date">19 Jun 2026<\/div>/,
  changelogTop + '\n    <div class="changelog-item">\n      <div class="changelog-date">25 Jun 2026 v2.0</div>\n      <div class="changelog-content">\n        <div class="changelog-title">Site report v2.0 — full MORE Group template + live GSC/GA4</div>\n        <div class="changelog-desc">116 MDX · 131 sitemap · first GSC clicks (4) · 198 impressions · GA4 61 sessions.</div>\n        <div class="changelog-tags"><span class="tag green">Report</span><span class="tag blue">GSC</span></div>\n      </div>\n    </div>\n    <div class="changelog-item">\n      <div class="changelog-date">19 Jun 2026</div>',
);

s = s.replace(
  '<p class="pulse-footer-note">Updated 25 Jun 2026 via GSC API · period 10 Jun – 24 Jun · EN site — Google + Bing only</p>',
  '<p class="pulse-footer-note">Updated 27 Jul 2026 via GSC + GA4 + Bing MCP · GSC 18 Jun – 24 Jul · GA4 through 26 Jul · EN site</p>',
);

s = s.replace(
  '<p style="font-size:12px;color:#9ca3af;margin-top:2px;">capetown-invest.com · 10 Jun – 24 Jun 2026 · Web search · Updated 25 Jun via GSC API</p>',
  '<p style="font-size:12px;color:#9ca3af;margin-top:2px;">capetown-invest.com · 18 Jun – 24 Jul 2026 · Web search · Updated 27 Jul via GSC API</p>',
);

s = s.replace(
  /Updated 25 Jun 2026[\s\S]*?<\/div>\n    <\/div>\n\n    <!-- Period comparison -->/,
  `Updated 27 Jul 2026\n      </div>\n    </div>\n\n    <!-- Period comparison -->`,
);

fs.writeFileSync(fp, s);
console.log('Updated', fp);
