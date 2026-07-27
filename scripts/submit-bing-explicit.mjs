#!/usr/bin/env node
/** Bing IndexNow — explicit URLs only (capetown-invest.com). Never api.indexnow.org. */
import { readFileSync } from 'node:fs';

// Must match the verification file served at /<KEY>.txt (public/).
const KEY = 'ed9b70276c0ff4672e566b062652592b';
const HOST = 'capetown-invest.com';
const BASE = `https://${HOST}`;

const arg = process.argv[2];
let urls = process.argv.slice(2).filter((u) => /^https?:\/\//.test(u));

if (urls.length === 0 && arg && arg.endsWith('.txt')) {
  urls = readFileSync(arg, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((u) => /^https?:\/\//.test(u));
}

if (!urls.length) {
  console.error('Usage: node scripts/submit-bing-explicit.mjs URL ...');
  console.error('   or: node scripts/submit-bing-explicit.mjs scripts/wave6-8-urls.txt');
  process.exit(1);
}

const body = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: `${BASE}/${KEY}.txt`,
  urlList: urls,
});

const res = await fetch('https://www.bing.com/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body,
});

console.log(`Bing IndexNow: ${res.status} ${res.statusText} (${urls.length} URLs)`);
if (![200, 202].includes(res.status)) {
  console.log(await res.text());
  process.exit(1);
}
