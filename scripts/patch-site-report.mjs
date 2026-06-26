#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fp = path.join(__dirname, '../src/pages/site-report/index.astro');
let html = fs.readFileSync(fp, 'utf8');

const start = html.indexOf('    <!-- Indexation status -->');
const end = html.indexOf('      <div class="section-title">Next steps');
if (start === -1 || end === -1) throw new Error('markers not found');

const middle = `    <!-- Indexation status -->
    <div class="pulse-card" style="margin-top:16px;">
      <div class="pulse-card-title">
        <span style="width:8px;height:8px;border-radius:50%;display:inline-block;background:#a78bfa;"></span>
        Indexation Status — Google Search Console + Sitemap
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
        <div style="text-align:center;padding:16px;background:#f0faf5;border-radius:10px;border:1px solid #c6e8da;">
          <div style="font-size:28px;font-weight:900;color:#2d7a5e;">131</div>
          <div style="font-size:11px;color:#7a7a6e;margin-top:4px;font-weight:700;">URLs in sitemap</div>
          <div style="font-size:10px;color:#aaa;margin-top:2px;">Live 200 OK · 25 Jun · noindex filter active</div>
        </div>
        <div style="text-align:center;padding:16px;background:#dcfce7;border-radius:10px;border:1px solid #86efac;">
          <div style="font-size:28px;font-weight:900;color:#16a34a;">8</div>
          <div style="font-size:11px;color:#7a7a6e;margin-top:4px;font-weight:700;">URLs with clicks</div>
          <div style="font-size:10px;color:#aaa;margin-top:2px;">GSC · 10 Jun–24 Jun window</div>
        </div>
        <div style="text-align:center;padding:16px;background:#dbeafe;border-radius:10px;border:1px solid #93c5fd;">
          <div style="font-size:28px;font-weight:900;color:#2563eb;">184</div>
          <div style="font-size:11px;color:#7a7a6e;margin-top:4px;font-weight:700;">Submitted (log)</div>
          <div style="font-size:10px;color:#aaa;margin-top:2px;">capetown-invest-indexing · gap 0</div>
        </div>
        <div style="text-align:center;padding:16px;background:#ffedd5;border-radius:10px;border:1px solid #fdba74;">
          <div style="font-size:28px;font-weight:900;color:#c2410c;">116</div>
          <div style="font-size:11px;color:#7a7a6e;margin-top:4px;font-weight:700;">MDX in repo</div>
          <div style="font-size:10px;color:#aaa;margin-top:2px;">53 guides · 21 projects · 21 areas</div>
        </div>
      </div>
    </div>

    <div class="pulse-card" style="margin-top:16px;">
      <div class="pulse-card-title">
        <span style="width:8px;height:8px;border-radius:50%;display:inline-block;background:#fbbf24;"></span>
        Google Analytics 4 — June 2026
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
        <div style="text-align:center;padding:16px;background:#fef3c7;border-radius:10px;border:1px solid #fde68a;">
          <div style="font-size:28px;font-weight:900;color:#b45309;">61</div>
          <div style="font-size:11px;color:#7a7a6e;margin-top:4px;font-weight:700;">Sessions</div>
        </div>
        <div style="text-align:center;padding:16px;background:#dbeafe;border-radius:10px;border:1px solid #93c5fd;">
          <div style="font-size:28px;font-weight:900;color:#2563eb;">61</div>
          <div style="font-size:11px;color:#7a7a6e;margin-top:4px;font-weight:700;">Users</div>
        </div>
        <div style="text-align:center;padding:16px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
          <div style="font-size:28px;font-weight:900;color:#16a34a;">64</div>
          <div style="font-size:11px;color:#7a7a6e;margin-top:4px;font-weight:700;">Pageviews</div>
        </div>
        <div style="text-align:center;padding:16px;background:#f0faf5;border-radius:10px;border:1px solid #c6e8da;">
          <div style="font-size:28px;font-weight:900;color:#2d7a5e;">✓</div>
          <div style="font-size:11px;color:#7a7a6e;margin-top:4px;font-weight:700;">Lead API 200</div>
        </div>
      </div>
    </div>

    <p class="pulse-footer-note">Updated 25 Jun 2026 via GSC API · period 10 Jun – 24 Jun · EN site — Google + Bing only</p>
  </div>

  <div class="section-title">Technical setup</div>
  <div class="info-grid">
    <div class="info-card">
      <h3>Infrastructure</h3>
      <div class="info-row"><span class="key">Framework</span><span class="val">Astro 5 + MDX</span></div>
      <div class="info-row"><span class="key">Hosting</span><span class="val">Vercel (auto-deploy)</span></div>
      <div class="info-row"><span class="key">Domain</span><span class="val"><a href="https://capetown-invest.com/" target="_blank">capetown-invest.com</a></span></div>
      <div class="info-row"><span class="key">Lead API</span><span class="val">Telegram · dedicated bot</span></div>
      <div class="info-row"><span class="key">QA</span><span class="val">npm run qa:full</span></div>
    </div>
    <div class="info-card">
      <h3>Indexing isolation</h3>
      <div class="info-row"><span class="key">GCP project</span><span class="val">capetown-invest-indexing</span></div>
      <div class="info-row"><span class="key">GSC MCP</span><span class="val">search-console-capetown-invest</span></div>
      <div class="info-row"><span class="key">GA4 MCP</span><span class="val">ga4-analytics-capetown-invest</span></div>
      <div class="info-row"><span class="key">NOT shared with</span><span class="val">soy-braid / mexico / invest-gulf</span></div>
    </div>
  </div>

  <div class="section-title">Launch changelog</div>
  <div class="changelog">
    <div class="changelog-item">
      <div class="changelog-date">25 Jun 2026 v2.0</div>
      <div class="changelog-content">
        <div class="changelog-title">Site report v2.0 — full MORE Group template + live GSC/GA4</div>
        <div class="changelog-desc">116 MDX · 131 sitemap · first GSC clicks (4) · 198 impressions · GA4 61 sessions · batches #3–4 + Opus pillar polish.</div>
        <div class="changelog-tags"><span class="tag green">Report</span><span class="tag blue">GSC</span></div>
      </div>
    </div>
    <div class="changelog-item">
      <div class="changelog-date">19 Jun 2026</div>
      <div class="changelog-content">
        <div class="changelog-title">Batch #4 — Camps Bay Infinity, WEX1 Woodstock, La'Mare Hout Bay</div>
        <div class="changelog-desc">Portfolio spam debunk · qa:full 5/5 · explicit Google + Bing batches.</div>
        <div class="changelog-tags"><span class="tag green">Content</span></div>
      </div>
    </div>
    <div class="changelog-item">
      <div class="changelog-date">18 Jun 2026</div>
      <div class="changelog-content">
        <div class="changelog-title">Batch #3 — Vivante Village, Pearl Valley, Venice House CBD</div>
        <div class="changelog-desc">Winelands + CBD pillars · carry-cost workbook · audit structure fixes.</div>
        <div class="changelog-tags"><span class="tag green">Content</span><span class="tag amber">Pillar</span></div>
      </div>
    </div>
    <div class="changelog-item">
      <div class="changelog-date">10 Jun 2026</div>
      <div class="changelog-content">
        <div class="changelog-title">Cape Town site launch</div>
        <div class="changelog-desc">Dedicated GCP capetown-invest-indexing · MCP trio · 96→116 MDX corpus shipped in June.</div>
        <div class="changelog-tags"><span class="tag blue">Launch</span></div>
      </div>
    </div>
  </div>

`;

html = html.slice(0, start) + middle + html.slice(end);
fs.writeFileSync(fp, html);
console.log('patched', fp);
