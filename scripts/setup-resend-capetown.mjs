#!/usr/bin/env node
/**
 * Resend domain setup for capetown-invest.com + Cloudflare DNS.
 * Requires FULL Resend API key (not send-only). Falls back to instructions.
 *
 * Usage:
 *   RESEND_FULL_API_KEY=re_... CLOUDFLARE_API_TOKEN=... node scripts/setup-resend-capetown.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ZONE_ID = '5d91092244d520aa79214255b1c29dae';
const DOMAIN = 'capetown-invest.com';

function loadMcpEnv() {
  const p = join(__dirname, '../../99_Системное/MCP/.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}

loadMcpEnv();

const resendKey = process.env.RESEND_FULL_API_KEY || process.env.RESEND_API_KEY || '';
const cfToken = process.env.CLOUDFLARE_API_TOKEN || '';

if (!resendKey || !cfToken) {
  console.error('Need RESEND_FULL_API_KEY (full access) and CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

const CF = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}`;

async function cf(path, opts = {}) {
  const res = await fetch(`${CF}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${cfToken}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(`${path}: ${JSON.stringify(data.errors || data)}`);
  return data;
}

async function listDns() {
  return (await cf('/dns_records?per_page=100')).result;
}

async function upsertDns(type, name, content, extra = {}) {
  const records = await listDns();
  const fullName = name === '@' ? DOMAIN : `${name}.${DOMAIN}`;
  const existing = records.find((r) => r.type === type && r.name === fullName && r.content === content);
  if (existing) {
    console.log(`  exists: ${type} ${fullName}`);
    return existing;
  }
  const body = { type, name, content, ttl: 1, proxied: false, ...extra };
  await cf('/dns_records', { method: 'POST', body: JSON.stringify(body) });
  console.log(`  created: ${type} ${fullName} → ${content}`);
}

async function main() {
  console.log(`Creating Resend domain: ${DOMAIN}`);
  const createRes = await fetch('https://api.resend.com/domains', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: DOMAIN }),
  });
  const createText = await createRes.text();
  if (!createRes.ok) {
    console.error('Resend create failed:', createRes.status, createText);
    process.exit(1);
  }
  const domain = JSON.parse(createText);
  console.log('Domain id:', domain.id, 'status:', domain.status);

  console.log('\nAdding DNS records to Cloudflare...');
  for (const rec of domain.records || []) {
    const host = rec.name?.includes(DOMAIN)
      ? rec.name.replace(`.${DOMAIN}`, '').replace(DOMAIN, '@')
      : rec.name;
    const name = host === DOMAIN ? '@' : host.replace(`.${DOMAIN}`, '');
    if (rec.type === 'MX') {
      await upsertDns('MX', name === 'send' ? 'send' : name, rec.value, { priority: rec.priority || 10 });
    } else if (rec.type === 'TXT') {
      const txt = String(rec.value).replace(/^"|"$/g, '');
      await upsertDns('TXT', name === 'send' ? 'send' : name, txt);
    } else if (rec.type === 'CNAME') {
      const target = String(rec.value).replace(/\.$/, '');
      await upsertDns('CNAME', name.replace(`.${DOMAIN}`, ''), target);
    }
  }

  console.log('\nDone. Wait 5–15 min, then verify in Resend dashboard.');
  console.log('After verified, set Vercel LEAD_FROM_EMAIL=Cape Town Invest <info@capetown-invest.com>');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
