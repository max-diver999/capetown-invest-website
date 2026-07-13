#!/usr/bin/env node
import { assessLeadSpam, looksLikeGibberish, looksLikeDotSpamEmail } from '../src/lib/lead-spam-gate.ts';

const samples = [
  ['MeJaRqtwZCEKwhiUz', true],
  ['IVIJaZJEuDDVTVqkAgMYNpx', true],
  ['awHdiySWfxyvzKezKXqmLt', true],
  ['John Smith', false],
  ['Maria', false],
  ['Christopher', false],
  ['Li Wei', false],
];

let fail = 0;
for (const [name, expect] of samples) {
  const got = looksLikeGibberish(name);
  if (got !== expect) {
    console.error(`FAIL gibberish "${name}": expected ${expect}, got ${got}`);
    fail++;
  }
}

if (!looksLikeDotSpamEmail('u.n.e.t.i.liyihiv17@gmail.com')) {
  console.error('FAIL dot email u.n.e.t should block');
  fail++;
}
if (!looksLikeDotSpamEmail('a.k.u.g.e.r.u.l.o.l0.5.6@gmail.com')) {
  console.error('FAIL dot email should block');
  fail++;
}
if (looksLikeDotSpamEmail('john.smith@gmail.com')) {
  console.error('FAIL normal dotted email should pass');
  fail++;
}

const screenshotSpam = assessLeadSpam({
  name: 'IVIJaZJEuDDVTVqkAgMYNpx',
  email: 'u.n.e.t.i.liyihiv17@gmail.com',
  message: 'awHdiySWfxyvzKezKXqmLt',
  formElapsedMs: 8000,
});
if (!screenshotSpam.spam) {
  console.error('FAIL screenshot spam should block', screenshotSpam);
  fail++;
}

const realLead = assessLeadSpam({
  name: 'John Smith',
  email: 'john@gmail.com',
  message: 'Looking for 2-bed in Sea Point, budget R5M',
  formElapsedMs: 8000,
});
if (realLead.spam) {
  console.error('FAIL real lead blocked:', realLead.reason);
  fail++;
}

const fastAutofill = assessLeadSpam({
  name: 'Maria Chen',
  email: 'maria@outlook.com',
  message: 'Interested in Century City off-plan',
  formElapsedMs: 1500,
});
if (fastAutofill.spam) {
  console.error('FAIL fast autofill real lead blocked:', fastAutofill.reason);
  fail++;
}

const botLead = assessLeadSpam({
  name: 'MeJaRqtwZCEKwhiUz',
  email: 'a.k.u.g.e.r.u.l.o.l0.5.6@gmail.com',
  message: 'OtvpAtRcNquCpvvjDZEP',
  formElapsedMs: 8000,
});
if (!botLead.spam) {
  console.error('FAIL bot lead should block');
  fail++;
}

if (assessLeadSpam({ website: 'http://spam.com', formElapsedMs: 5000 }).reason !== 'honeypot') {
  console.error('FAIL honeypot');
  fail++;
}

const hc = assessLeadSpam({ isHealthcheck: true, name: 'MeJaRqtwZCEKwhiUz' });
if (hc.spam) {
  console.error('FAIL healthcheck should bypass spam gate');
  fail++;
}

console.log(fail === 0 ? 'ALL PASS' : `${fail} FAIL`);
process.exit(fail ? 1 : 0);
