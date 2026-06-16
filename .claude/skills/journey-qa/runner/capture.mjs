// Headless, MCP-free journey capture runner.
//
// Drives a real headless browser (Playwright) against your TARGET app, performs
// deterministic setup (viewport + optional login), navigates to each journey's
// page, and captures the page STATE: visible text, links, buttons, inputs,
// headings, images, console + network errors, plus a screenshot. An LLM judge
// (or you) then reads these dumps and scores each journey against its
// `expected_observations`.
//
// READ-ONLY by design: it logs in and loads pages but never submits mutating
// forms (no create/CRUD/registration), so it is safe against staging. The only
// writes are successful test logins. Negative / error-path journeys (wrong
// password, gating) are better executed by the blind `journey-tester` agent via
// Playwright MCP — this runner just captures page state for the judge.
//
// Everything is config/env driven — NO hardcoded hosts, passwords or UI labels.
//
// Usage:
//   TEST_PASSWORD=... node runner/capture.mjs                 # all journeys
//   node runner/capture.mjs J001 J009                         # specific ids
//   node runner/capture.mjs --category C_admin
// Inputs:
//   journeys file:  $JOURNEY_FILE   (default ./journeys.json)
//   config file:    $JOURNEY_CONFIG (default ./journey-qa.config.json)
//   hosts override: $JOURNEY_BASE / $JOURNEY_ADMIN_BASE
//   password:       $TEST_PASSWORD  (required for non-anonymous journeys)

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const CWD = process.cwd();
const JOURNEY_FILE = process.env.JOURNEY_FILE || path.join(CWD, 'journeys.json');
const CONFIG_FILE = process.env.JOURNEY_CONFIG || path.join(CWD, 'journey-qa.config.json');

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { if (fallback !== undefined) return fallback; throw new Error(`Cannot read ${p}: ${e.message}`); }
}

const journeysAll = readJson(JOURNEY_FILE);
const cfg = readJson(CONFIG_FILE, {});
const labels = cfg.labels || {};
const auth = cfg.auth || {};
const fixtures = cfg.fixtures || {};

const BASE = process.env.JOURNEY_BASE || cfg.base_url;
const ADMIN_BASE = process.env.JOURNEY_ADMIN_BASE || cfg.admin_base_url || BASE;
const PASSWORD = process.env.TEST_PASSWORD || '';
const DEFAULT_VP = cfg.viewport || { width: 1280, height: 800 };

if (!BASE) { console.error('No base_url. Set JOURNEY_BASE or config.base_url.'); process.exit(1); }

const OUT = path.join(CWD, 'journey-results');
const CAPTURES = path.join(OUT, 'captures');
const SHOTS = path.join(OUT, 'screenshots');
const STATES = path.join(OUT, '.states');
for (const d of [OUT, CAPTURES, SHOTS, STATES]) fs.mkdirSync(d, { recursive: true });

const rx = (key, fallback) => new RegExp(labels[key] || fallback, 'i');
const safe = (s) => s.replace(/[^a-z0-9]/gi, '_');

// ---- CLI filter ----
const args = process.argv.slice(2);
let selected = journeysAll;
if (args.length) {
  const ci = args.indexOf('--category');
  if (ci !== -1) selected = journeysAll.filter((j) => j.category === args[ci + 1]);
  else { const ids = new Set(args.map((s) => s.toUpperCase())); selected = journeysAll.filter((j) => ids.has(j.id)); }
}

function resolveBase(j) {
  // A journey may set `base: "admin"`; otherwise admin-ish categories use ADMIN_BASE.
  if (j.base === 'admin') return ADMIN_BASE;
  if (j.base === 'app') return BASE;
  if (/admin|superadmin/i.test(j.category || '') && ADMIN_BASE) return ADMIN_BASE;
  return BASE;
}
const targetPath = (j) => j.probe_path || j.starting_url || '/';

async function clickByName(page, re) {
  let btn = page.getByRole('button', { name: re }).first();
  if (!(await btn.count())) btn = page.getByRole('link', { name: re }).first();
  if (!(await btn.count())) btn = page.locator('button[type="submit"]').first();
  await btn.click();
}

async function login(page, base, email) {
  if (!PASSWORD) return { ok: false, url: page.url(), errText: 'TEST_PASSWORD not set' };
  try {
    await page.goto(base + (auth.login_path || '/login'), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);
    const emailLoc = page.locator('input[type="email"], input[name="email"], input[name="username"], input[autocomplete="email"], input[type="text"]').first();
    await emailLoc.waitFor({ state: 'visible', timeout: 15000 });
    await emailLoc.fill(email);
    if (auth.two_step) {
      await clickByName(page, rx('continue', 'continue|next'));
      await page.locator('input[type="password"]').first().waitFor({ state: 'visible', timeout: 15000 });
    }
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await clickByName(page, rx('submit_login', 'log\\s*in|sign in'));
    await page.waitForTimeout(2500);
    const url = page.url();
    const notPath = auth.success_path_is_not || (auth.login_path || '/login');
    const ok = !new RegExp(notPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(new URL(url).pathname);
    const errText = ok ? '' : (await page.evaluate(() => document.body.innerText || '').catch(() => '')).slice(0, 500);
    return { ok, url, errText };
  } catch (e) {
    return { ok: false, url: page.url(), errText: String(e).slice(0, 200) };
  }
}

const stateCache = {};
async function ensureState(browser, base, email) {
  const key = `${base}|${email}`;
  if (key in stateCache) return stateCache[key];
  const ctx = await browser.newContext({ viewport: DEFAULT_VP });
  const page = await ctx.newPage();
  const loginRes = await login(page, base, email);
  let statePath = null;
  if (loginRes.ok) { statePath = path.join(STATES, `${safe(key)}.json`); await ctx.storageState({ path: statePath }); }
  await ctx.close();
  stateCache[key] = { statePath, loginRes };
  return stateCache[key];
}

async function waitForApp(page) {
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  for (let i = 0; i < 12; i++) {
    const len = await page.evaluate(() => (document.body?.innerText || '').trim().length).catch(() => 0);
    if (len > 50) return;
    await page.waitForTimeout(500);
  }
}

async function snapshot(page) {
  const title = await page.title().catch(() => '');
  const url = page.url();
  const bodyText = (await page.evaluate(() => document.body?.innerText || '').catch(() => '')).slice(0, 4500);
  const grab = (sel, fn) => page.$$eval(sel, fn).catch(() => []);
  const links = await grab('a', (els) => els.map((e) => ({ t: (e.innerText || '').trim(), href: e.getAttribute('href') })).filter((x) => x.t).slice(0, 120));
  const buttons = await grab('button,[role="button"]', (els) => [...new Set(els.map((e) => (e.innerText || e.getAttribute('aria-label') || '').trim()).filter(Boolean))].slice(0, 120));
  const inputs = await grab('input,textarea,select', (els) => els.map((e) => ({ type: e.getAttribute('type') || e.tagName.toLowerCase(), ph: e.getAttribute('placeholder') || '', name: e.getAttribute('name') || '', aria: e.getAttribute('aria-label') || '' })).slice(0, 70));
  const headings = await grab('h1,h2,h3', (els) => els.map((e) => (e.innerText || '').trim()).filter(Boolean).slice(0, 60));
  const imgs = await grab('img', (els) => els.map((e) => ({ alt: e.getAttribute('alt') || '', src: (e.getAttribute('src') || '').slice(0, 80) })).slice(0, 40));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2).catch(() => null);
  return { title, url, bodyText, links, buttons, inputs, headings, imgs, hasHorizontalOverflow: overflow };
}

async function runJourney(browser, j) {
  const consoleErrors = [], netErrors = [];
  const isAnon = j.actor === 'anonymous' || !j.actor;
  const viewport = j.viewport || DEFAULT_VP;
  const base = resolveBase(j);
  const email = isAnon ? null : (fixtures[j.actor]?.email);

  let storageState, loginRes = null;
  if (!isAnon) {
    if (!email) loginRes = { ok: false, errText: `no fixture email for actor "${j.actor}"` };
    else { const s = await ensureState(browser, base, email); storageState = s.statePath || undefined; loginRes = s.loginRes; }
  }

  const ctx = await browser.newContext({ viewport, storageState });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('response', (r) => { if (r.status() >= 400) netErrors.push(`${r.status()} ${r.url().slice(0, 120)}`); });

  let capture = null, actionNote = '';
  let p = targetPath(j);
  if (storageState && p === (auth.login_path || '/login')) { p = '/'; actionNote = 'authed via storageState; login path → / to observe logged-in state'; }
  if (j.probe_path) actionNote = `probe → ${p}`;
  try {
    await page.goto(base + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForApp(page);
    await page.waitForTimeout(700);
    capture = await snapshot(page);
    await page.screenshot({ path: path.join(SHOTS, `${j.id}.png`), fullPage: false }).catch(() => {});
  } catch (e) { actionNote += ` [nav err: ${String(e).slice(0, 140)}]`; }
  finally { await ctx.close(); }

  const dump = {
    id: j.id, category: j.category, title: j.title, actor: j.actor,
    starting_url: j.starting_url, target: { base, path: p }, intent: j.intent,
    negative: !!j.negative, expected_observations: j.expected_observations,
    requires: j.requires || [], skip_if: j.skip_if || null, viewport,
    login: loginRes ? { ok: loginRes.ok, errText: loginRes.errText } : (isAnon ? 'anonymous' : 'no-login'),
    actionNote, consoleErrors: consoleErrors.slice(0, 15), netErrors: netErrors.slice(0, 15), capture,
  };
  fs.writeFileSync(path.join(CAPTURES, `${j.id}.json`), JSON.stringify(dump, null, 2));
  const lg = typeof dump.login === 'object' ? dump.login.ok : dump.login;
  console.log(`${j.id} ${j.category} ${capture ? 'ok' : 'NO_CAPTURE'} base=${base.replace(/^https?:\/\//, '')} login=${lg} cerr=${consoleErrors.length} nerr=${netErrors.length}`);
  return dump;
}

(async () => {
  if (!PASSWORD && selected.some((j) => j.actor && j.actor !== 'anonymous'))
    console.warn('⚠ TEST_PASSWORD not set — non-anonymous journeys will not log in.');
  const browser = await chromium.launch({ headless: true });
  console.log(`Running ${selected.length} journeys (base=${BASE}${ADMIN_BASE !== BASE ? `, admin=${ADMIN_BASE}` : ''})`);
  for (const j of selected) {
    try { await runJourney(browser, j); }
    catch (e) {
      console.log(`${j.id} FATAL ${String(e).slice(0, 160)}`);
      fs.writeFileSync(path.join(CAPTURES, `${j.id}.json`), JSON.stringify({ id: j.id, category: j.category, fatal: String(e) }, null, 2));
    }
  }
  await browser.close();
  console.log(`DONE → ${OUT}`);
})();
