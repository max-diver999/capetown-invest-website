/**
 * Append-only log of successful IndexNow submissions.
 *
 * Vendored into this repo so indexnow-submit.mjs runs from a clean clone; the
 * log lives under .content-os/ next to the other pilot state.
 */
import fs from 'node:fs';
import path from 'node:path';

const LOG_PATH = path.resolve('.content-os/indexing-log.jsonl');

export function logIndexNowSuccess(scriptPath, urls, channel = 'bing') {
  const entry = {
    at: new Date().toISOString(),
    script: path.basename(scriptPath),
    channel,
    count: urls.length,
    urls,
  };
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`);
  return entry;
}
