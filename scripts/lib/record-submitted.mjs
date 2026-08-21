/**
 * Record URLs submitted to a search engine's indexing API.
 *
 * Vendored into this repo so submit-google-explicit.mjs runs from a clean
 * clone. siteFolder is kept in the record because the shared tooling this
 * replaces was multi-site.
 */
import fs from 'node:fs';
import path from 'node:path';

const LOG_PATH = path.resolve('.content-os/indexing-log.jsonl');

export function recordSubmitted({ siteFolder, urls, channel = 'google' }) {
  const entry = {
    at: new Date().toISOString(),
    site: siteFolder,
    channel,
    count: urls.length,
    urls,
  };
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`);
  return entry;
}
