// End-to-end playthrough of EVERY mission step in headless Chromium, using real pointer input
// on the 3D canvas (prop positions are projected to screen pixels through window.__sim.project).
// Usage: npm run build && npm run e2e   [-- --only m0-1,m1-2] [--mobile-only]
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = 4179;
const BASE = `http://localhost:${PORT}/electrician-sim-us/`;
const OUT = 'e2e-out';
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const SHOTS = !args.includes('--no-shots');

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const root = '/opt/pw-browsers';
  if (existsSync(root)) {
    for (const d of readdirSync(root).filter((x) => x.startsWith('chromium-'))) {
      const p = `${root}/${d}/chrome-linux/chrome`;
      if (existsSync(p)) return p;
    }
  }
  return undefined; // let playwright find its own
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const log = (...a) => console.log(...a);
function fail(msg) {
  failures++;
  console.error('  ✗ ' + msg);
}

async function waitFor(page, fn, arg, timeout = 8000) {
  return page.waitForFunction(fn, arg, { timeout, polling: 50 });
}

const state = (page) => page.evaluate(() => window.__sim.state());

async function camSettled(page) {
  await waitFor(page, () => window.__sim?.camSettled === true);
  await sleep(250); // damping
}

/** Screen position of a prop; asserts it's on screen and not covered by the HUD. */
async function propPoint(page, id) {
  const p = await page.evaluate((pid) => {
    const r = window.__sim.project(pid);
    if (!r) return null;
    const el = document.elementFromPoint(r.x, r.y);
    return { ...r, onCanvas: el?.tagName === 'CANVAS', el: el ? el.tagName + '.' + el.className : null };
  }, id);
  if (!p) throw new Error(`prop ${id} not found in scene`);
  if (!p.visible) throw new Error(`prop ${id} is off-screen`);
  if (!p.onCanvas) throw new Error(`prop ${id} is covered by HUD (${p.el})`);
  return p;
}

async function clickProp(page, id) {
  const p = await propPoint(page, id);
  await page.mouse.move(p.x, p.y);
  await sleep(40);
  await page.mouse.down();
  await sleep(40);
  await page.mouse.up();
  await sleep(120);
}

async function tapProp(page, id) {
  const p = await propPoint(page, id);
  await page.touchscreen.tap(p.x, p.y);
  await sleep(150);
}

async function dragProp(page, src, tgt) {
  const a = await propPoint(page, src);
  const b = await propPoint(page, tgt);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 6 });
  await page.mouse.move(b.x, b.y, { steps: 6 });
  await sleep(60);
  await page.mouse.up();
  await sleep(200);
}

async function doHold(page, step) {
  const mid = (step.zone[0] + step.zone[1]) / 2;
  for (let attempt = 0; attempt < 4; attempt++) {
    const btn = await page.$('[data-testid=hold-btn]');
    if (!btn) break;
    const box = await btn.boundingBox();
    const ms = (step.durationMs * mid) / step.max;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await sleep(ms);
    await page.mouse.up();
    await sleep(200);
    const s = await state(page);
    if (s.step.done) return attempt;
  }
  throw new Error('hold never landed in the zone');
}

async function solveStep(page, step, mobile) {
  const tap = mobile ? tapProp : clickProp;
  switch (step.type) {
    case 'dialogue':
      return;
    case 'click':
      for (const id of step.targets) {
        await tap(page, id);
        const s = await state(page);
        if (!s.step.clicked.includes(id)) throw new Error(`click on ${id} did not register`);
      }
      return;
    case 'drag-connect':
      for (const [src, tgt] of Object.entries(step.pairs)) {
        if (mobile) {
          await tapProp(page, src);
          await tapProp(page, tgt);
        } else await dragProp(page, src, tgt);
        const s = await state(page);
        if (s.step.connections[src] !== tgt) throw new Error(`connect ${src}→${tgt} did not register`);
        await sleep(350); // moved props animate
      }
      return;
    case 'choose-option': {
      const i = step.options.findIndex((o) => o.correct);
      await page.click(`[data-option="${i}"]`);
      return;
    }
    case 'measure':
      await page.click(`[data-mode="${step.expect.mode}"]`);
      await tap(page, step.expect.pair[0]);
      await tap(page, step.expect.pair[1]);
      {
        const s = await state(page);
        if (s.step.probes.red !== step.expect.pair[0] || s.step.probes.black !== step.expect.pair[1]) throw new Error(`probes not placed: ${JSON.stringify(s.step.probes)}`);
      }
      await page.click('[data-testid=meter-confirm]');
      return;
    case 'hold-action':
      await doHold(page, step);
      return;
    case 'inspect': {
      const ids = step.mode === 'learn' ? step.points.map((p) => p.id) : step.points.filter((p) => p.defect).map((p) => p.id);
      for (const id of ids) {
        const sel = `[data-hotspot="${id}"]`;
        const covered = await page.evaluate((s) => {
          const b = document.querySelector(s);
          if (!b) return 'missing';
          const r = b.getBoundingClientRect();
          const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return el === b ? null : el ? el.tagName + '.' + el.className : 'nothing';
        }, sel);
        if (covered) throw new Error(`hotspot ${id} not clickable (${covered})`);
        await page.click(sel);
        await sleep(80);
      }
      if (step.mode === 'find') await page.click('[data-testid=inspect-report]');
      return;
    }
  }
}

async function playMission(page, id, { mobile = false, tag = '' } = {}) {
  await page.goto(`${BASE}#/mission/${id}`);
  await page.waitForSelector('[data-testid=step-panel]');
  const mission = await page.evaluate((mid) => window.__sim.missions[mid], id);
  for (let i = 0; i < mission.steps.length; i++) {
    const step = mission.steps[i];
    await waitFor(page, (n) => window.__sim.state().stepIndex === n, i);
    await camSettled(page);
    try {
      await solveStep(page, step, mobile);
      await waitFor(page, () => window.__sim.state().step.done === true, undefined, 4000);
    } catch (e) {
      fail(`${id}${tag} step ${step.id} (${step.type}): ${e.message}`);
      await page.screenshot({ path: `${OUT}/FAIL-${id}${tag}-${step.id}.png` });
      return false;
    }
    const s = await state(page);
    if (s.mistakes) fail(`${id}${tag} step ${step.id}: correct solution produced ${s.mistakes} mistake(s)`);
    if (SHOTS) await page.screenshot({ path: `${OUT}/${id}${tag}-${String(i + 1).padStart(2, '0')}-${step.type}.png` });
    await page.click('[data-testid=continue]');
  }
  await page.waitForSelector('[data-testid=results]');
  const failed = await page.getAttribute('[data-testid=results]', 'data-failed');
  const res = (await state(page)).result;
  if (failed !== 'false') fail(`${id}${tag}: mission ended failed`);
  if (SHOTS) await page.screenshot({ path: `${OUT}/${id}${tag}-99-results.png` });
  log(`  ✓ ${id}${tag}: ${mission.steps.length} steps · score ${res.scores.total} · ★${res.scores.stars}`);
  return true;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe' });
  let up = false;
  for (let i = 0; i < 60 && !up; i++) {
    try {
      const r = await fetch(BASE);
      up = r.ok;
    } catch {
      await sleep(250);
    }
  }
  if (!up) throw new Error('preview server did not start (did you run npm run build?)');

  const browser = await chromium.launch({
    executablePath: findChromium(),
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const errors = [];
  const watch = (page) => {
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console: ${m.text()}`);
    });
  };

  try {
    // ---------- desktop: menu → module → every mission ----------
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    watch(page);
    await page.goto(BASE);
    await page.waitForSelector('[data-testid=menu]');
    if (SHOTS) await page.screenshot({ path: `${OUT}/00-menu.png`, fullPage: true });
    const ids = await page.evaluate(() => {
      const mods = document.querySelectorAll('[data-module]');
      return Array.from(mods).map((m) => m.getAttribute('data-module'));
    });
    log(`menu shows ${ids.length} modules`);
    if (ids.length !== 11) fail(`expected 11 modules in menu, got ${ids.length}`);

    await page.click('[data-module=m0]');
    await page.waitForSelector('[data-testid=module]');
    if (SHOTS) await page.screenshot({ path: `${OUT}/00-module-m0.png` });

    const available = await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      return Object.keys(window.__sim.missions).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    });
    const list = only ? available.filter((m) => only.includes(m)) : available;
    log(`playing ${list.length} missions (desktop, mouse)…`);
    for (const id of list) await playMission(page, id);

    // progress persisted
    const prog = await page.evaluate(() => window.__sim.progress());
    for (const id of list) if (!prog[id]?.completed) fail(`progress not saved for ${id}`);
    await page.goto(BASE);
    await page.reload();
    await page.waitForSelector('[data-testid=menu]');
    if (SHOTS) await page.screenshot({ path: `${OUT}/00-menu-progress.png`, fullPage: true });

    // ---------- failure paths / engine features ----------
    if (!only || only.includes('m0-1')) {
      log('failure paths…');
      await page.goto(`${BASE}#/mission/m0-1`);
      await page.waitForSelector('[data-testid=step-panel]');
      await page.click('[data-testid=continue]');
      await page.click('[data-testid=continue]');
      await camSettled(page);
      // wrong PPE → mistake feedback
      await clickProp(page, 'cap');
      let s = await state(page);
      if (s.mistakes !== 1 || s.feedback?.kind !== 'bad') fail('wrong click did not register as a mistake');
      // hint
      await page.click('[data-testid=hint]');
      s = await state(page);
      if (s.hints !== 1) fail('hint not counted');
      if (SHOTS) await page.screenshot({ path: `${OUT}/zz-hint.png` });
      // term card + language
      await page.click('.bubble .term');
      await page.waitForSelector('[data-testid=term-card]');
      if (SHOTS) await page.screenshot({ path: `${OUT}/zz-termcard.png` });
      await page.click('.modal-backdrop', { position: { x: 5, y: 5 } });
      const esText = await page.textContent('.bubble');
      await page.click('[data-lang=en]');
      const enText = await page.textContent('.bubble');
      if (esText === enText) fail('language toggle did not change the bubble text');
      if (SHOTS) await page.screenshot({ path: `${OUT}/zz-english.png` });
      await page.click('[data-lang=es]');
      // finish PPE then pick the unsafe cord answer → safety fail
      const m = await page.evaluate(() => window.__sim.missions['m0-1']);
      for (const id of m.steps[2].targets) await clickProp(page, id);
      await page.click('[data-testid=continue]'); // s3 → s4
      await page.click(`[data-option="0"]`);
      await page.click('[data-testid=continue]'); // s4 → s5
      await page.click('[data-testid=continue]'); // s5 → s6
      await camSettled(page);
      await page.click('[data-hotspot="female"]');
      await page.click('[data-testid=inspect-report]');
      s = await state(page);
      if (s.feedback?.key !== 'ui.inspect.falsePositive') fail('false positive inspect not detected');
      await page.click('[data-hotspot="plug"]');
      await page.click('[data-hotspot="cut"]');
      await page.click('[data-testid=inspect-report]');
      await page.click('[data-testid=continue]'); // → s7
      const unsafe = m.steps[6].options.findIndex((o) => o.unsafe);
      await page.click(`[data-option="${unsafe}"]`);
      await page.waitForSelector('[data-testid=results][data-failed=true]');
      const explain = await page.textContent('[data-testid=fail-explain]');
      if (!explain || explain.length < 40) fail('safety fail explanation missing');
      if (SHOTS) await page.screenshot({ path: `${OUT}/zz-safety-fail.png` });
      await page.click('[data-testid=retry]');
      await page.waitForSelector('[data-testid=step-panel][data-step=s1]');
      s = await state(page);
      if (s.status !== 'playing' || s.mistakes !== 0) fail('retry did not reset the mission');
      log('  ✓ mistakes, hint, term card, ES/EN, inspect false-positive, safety fail, retry');
    }
    await ctx.close();

    // ---------- mobile portrait: touch taps ----------
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const mpage = await mctx.newPage();
    watch(mpage);
    const mobileList = (only ?? ['m0-1', 'm0-3', 'm1-4']).filter((m) => available.includes(m));
    log(`playing ${mobileList.length} missions (mobile, touch)…`);
    for (const id of mobileList) await playMission(mpage, id, { mobile: true, tag: '-mobile' });
    await mpage.goto(BASE);
    await mpage.waitForSelector('[data-testid=menu]');
    if (SHOTS) await mpage.screenshot({ path: `${OUT}/00-menu-mobile.png` });
    await mctx.close();
  } finally {
    await browser.close();
    server.kill();
  }

  const relevant = errors.filter((e) => !/GPU stall|WebGL|swiftshader|Automatic fallback/i.test(e));
  for (const e of relevant) fail(e);
  if (failures) {
    console.error(`\nE2E FAILED: ${failures} problem(s)`);
    process.exit(1);
  }
  log('\nE2E PASSED');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
