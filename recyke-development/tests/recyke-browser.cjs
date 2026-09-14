/* Real UI input and scene presentation checks. Requires Playwright + Chrome.
 * Browser time advances through requestAnimationFrame; movement is delivered by
 * keyboard/touch events. No teleporting or forced engine state for completion.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8034';
const review = process.env.REVIEW_DIR || '/private/tmp/recyke-review';
const viewports = [
  { name: 'desktop', viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 },
  { name: 'fractional-density', viewport: { width: 900, height: 760 }, deviceScaleFactor: 1.25 },
  { name: 'retina', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 },
  { name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  { name: 'phone-landscape', viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  { name: 'narrow-1x', viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true }
];
const snap = page => page.evaluate(() => CADRecykeApp.snapshot());
async function settle(page, milliseconds = 100) { await page.clock.runFor(milliseconds); }
async function open(page, size = 'mini', hero = 'jane') {
  await page.goto(base + `/recyke.html?size=${size}&hero=${hero}`);
  await page.waitForFunction(() => window.CADRecykeApp && window.CADRecykeArt);
  await page.locator(`[data-size="${size}"]`).click();
  await page.locator(`[data-hero="${hero}"]`).click();
  await settle(page, 64);
  const state = await snap(page);
  assert.equal(state.size, size); assert.equal(state.player.hero, hero);
  return state;
}
function near(actual, expected, message, tolerance = .05) { assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`); }
async function checkGrid(page, config, size) {
  const m = await page.locator('#game-canvas').evaluate(canvas => {
    const r = canvas.getBoundingClientRect(), stage = document.querySelector('#game-stage'), dpr = devicePixelRatio;
    return { w: canvas.width, h: canvas.height, cssW: r.width, cssH: r.height, x: r.x, y: r.y,
      sx: r.width * dpr / canvas.width, sy: r.height * dpr / canvas.height,
      smoothing: canvas.getContext('2d').imageSmoothingEnabled,
      bodyWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth,
      stageClient: stage.clientWidth, stageScroll: stage.scrollWidth, overflow: getComputedStyle(stage).overflowX };
  });
  assert.deepEqual([m.w, m.h], size === 'big' ? [640, 360] : [480, 270], `${config.name}/${size}: native scene dimensions`);
  assert.ok(Math.round(m.sx) >= 1, `${config.name}: pixel downscaling`);
  near(m.sx, Math.round(m.sx), `${config.name}/${size}: whole device-pixel zoom`);
  near(m.sy, m.sx, `${config.name}/${size}: uniform scene zoom`);
  near(m.x * config.deviceScaleFactor, Math.round(m.x * config.deviceScaleFactor), `${config.name}/${size}: aligned scene x`);
  near(m.y * config.deviceScaleFactor, Math.round(m.y * config.deviceScaleFactor), `${config.name}/${size}: aligned scene y`);
  assert.equal(m.smoothing, false, `${config.name}/${size}: no image smoothing`);
  assert.ok(m.bodyWidth <= m.viewportWidth + 1, `${config.name}/${size}: page-level horizontal overflow ${JSON.stringify(m)}`);
  if (m.cssW > m.stageClient + 1) assert.ok(['auto', 'scroll'].includes(m.overflow) && m.stageScroll >= m.cssW, `${config.name}/${size}: native scene overflow must be inside its container`);
  return { device: config.name, size, scale: Math.round(m.sx), native: [m.w, m.h] };
}
async function checkLinks(page) {
  const links = await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.href));
  for (const href of new Set(links.filter(href => href.startsWith(locationOrigin(base))))) {
    const response = await page.request.get(href);
    assert.ok(response.ok(), `navigation link returned ${response.status()}: ${href}`);
  }
}
function locationOrigin(url) { return new URL(url).origin; }
async function stopAndCheck(page, message) {
  await settle(page, 400); const first = await snap(page);
  await settle(page, 300); const second = await snap(page);
  near(second.player.x, first.player.x, message, .02);
  assert.doesNotMatch(second.player.state, /fire/, message + ': firing input also released');
}
async function checkKeyboard(page, size, hero) {
  await open(page, size, hero); await page.locator('#game-canvas').focus();
  let before = await snap(page);
  await page.keyboard.down('d'); await settle(page, 300); await page.keyboard.up('d');
  assert.ok((await snap(page)).player.x > before.player.x + 5, `${size}/${hero}: keyboard movement`);
  await stopAndCheck(page, `${size}/${hero}: keyup clears movement`);
  before = await snap(page);
  await page.keyboard.down('w'); await settle(page, 90); await page.keyboard.up('w');
  assert.ok((await snap(page)).player.y < before.player.y - 2, `${size}/${hero}: jump rises from floor`);
  await settle(page, 900);
  // The swap control must change the active art family without resetting position.
  before = await snap(page);
  await page.keyboard.press('q'); await settle(page, 32);
  const swapped = await snap(page);
  assert.notEqual(swapped.player.hero, before.player.hero, `${size}/${hero}: hero swap`);
  near(swapped.player.x, before.player.x, `${size}/${hero}: hero swap preserves position`, 2);
  // Pausing with a movement key held must clear the held action on resume.
  await page.locator('#game-canvas').focus(); await page.keyboard.down('d'); await settle(page, 120);
  await page.locator('#pause-button').click();
  assert.equal((await snap(page)).paused, true, `${size}/${hero}: pause button`);
  const frozen = await snap(page); await settle(page, 300);
  near((await snap(page)).player.x, frozen.player.x, `${size}/${hero}: paused simulation`);
  await page.keyboard.up('d'); await page.locator('#dialog-primary').click();
  assert.equal((await snap(page)).paused, false, `${size}/${hero}: resume`);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'game-canvas', `${size}/${hero}: resume restores gameplay keyboard focus`);
  await stopAndCheck(page, `${size}/${hero}: pause clears movement`);
  // Browser focus loss cannot strand a key or keep simulation running.
  await page.locator('#game-canvas').focus(); await page.keyboard.down('d'); await settle(page, 100);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  assert.equal((await snap(page)).paused, true, `${size}/${hero}: blur auto-pauses`);
  await page.keyboard.up('d'); await page.locator('#dialog-primary').click();
  await stopAndCheck(page, `${size}/${hero}: blur clears movement`);
  await page.locator('#restart-button').click();
  await settle(page, 32);
  const restarted = await snap(page);
  assert.equal(restarted.won, false); assert.equal(restarted.dead, false);
  assert.ok(restarted.player.x < before.player.x, `${size}/${hero}: restart starts the route again`);
  await page.locator('#auto-fire').check(); await settle(page, 100);
  assert.ok((await snap(page)).shots.some(shot => !shot.hostile), `${size}/${hero}: automatic fire assist`);
  for (let frame = 0; frame < 16; frame++) {
    await settle(page, 32);
    assert.match((await snap(page)).player.state, /fire/, `${size}/${hero}: held fire keeps the weapon pose between shots`);
  }
  await page.locator('#auto-fire').uncheck(); await settle(page, 250);
  await page.keyboard.press('e'); await settle(page, 32);
  assert.equal((await snap(page)).player.state, 'jab', `${size}/${hero}: melee action`);
}
async function checkTouch(context, page, size) {
  await open(page, size, 'jane');
  await page.locator('[data-control="right"]').scrollIntoViewIfNeeded();
  const controls = await page.locator('[data-control]').evaluateAll(nodes => nodes.map(node => {
    const r = node.getBoundingClientRect(); return { action: node.dataset.control, x: r.x, y: r.y, w: r.width, h: r.height };
  }));
  for (const control of controls) assert.ok(control.w >= 40 && control.h >= 40, `touch target ${control.action} too small`);
  const right = controls.find(c => c.action === 'right'), fire = controls.find(c => c.action === 'fire');
  const session = await context.newCDPSession(page);
  const points = [right, fire].map((c, index) => ({ x: c.x + c.w / 2, y: c.y + c.h / 2, id: index + 1 }));
  const before = await snap(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points });
  await settle(page, 320);
  const during = await snap(page);
  assert.ok(during.player.x > before.player.x + 5, `${size}: simultaneous touch movement`);
  assert.ok(/fire/.test(during.player.state) || during.shots.some(shot => shot.owner === 'player' || shot.friendly), `${size}: simultaneous touch firing`);
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await stopAndCheck(page, `${size}: touch cancellation clears movement`);
  await session.detach();
}
async function checkCompletion(page, size, hero) {
  await open(page, size, hero); await page.locator('#game-canvas').focus();
  await page.keyboard.down('d'); await page.keyboard.down('Space');
  let current = await snap(page), didJump = false;
  const visited = new Set([current.zone.name]), captures = new Set();
  for (let tick = 0; tick < 550 && !current.won && !current.dead; tick++) {
    const obstacle = current.platforms.find(platform => platform.kind !== 'ground' && !platform.oneWay && platform.x + platform.w > current.player.x && platform.y < current.player.y - 1 && platform.x - current.player.x < (size === 'big' ? 70 : 34));
    if (current.player.onGround && obstacle && !didJump) { await page.keyboard.down('w'); didJump = true; }
    else if (didJump) { await page.keyboard.up('w'); didJump = false; }
    await settle(page, 80); current = await snap(page); visited.add(current.zone.name);
    for (const [name, progress] of [['crossing', .19], ['repair', .53], ['depot', .90]]) if (current.progress >= progress && !captures.has(name)) {
      captures.add(name);
      const png = await page.locator('#game-canvas').evaluate(canvas => canvas.toDataURL());
      fs.writeFileSync(path.join(review, `recyke-${size}-${name}.png`), Buffer.from(png.split(',')[1], 'base64'));
    }
  }
  await page.keyboard.up('w'); await page.keyboard.up('d'); await page.keyboard.up('Space');
  assert.equal(current.dead, false, `${size}/${hero}: normal-input route died at ${current.player.x}`);
  assert.equal(current.won, true, `${size}/${hero}: normal-input route stopped at ${current.player.x}`);
  assert.equal(current.checkpoint.active, true, `${size}/${hero}: repair station reached`);
  assert.equal(current.enemies.find(enemy => enemy.gate).dead, true, `${size}/${hero}: gate guard defeated`);
  assert.equal(visited.size, current.zones.length, `${size}/${hero}: complete route traversed`);
  assert.ok(current.enemies.filter(enemy => enemy.drone && enemy.dead).length >= 2, `${size}/${hero}: flying targets can be hit`);
  assert.equal(await page.locator('#mission-dialog').evaluate(dialog => dialog.open), true, `${size}/${hero}: completion dialog`);
  const winX = current.player.x; await page.keyboard.down('d'); await settle(page, 300);
  near((await snap(page)).player.x, winX, `${size}/${hero}: victory freezes movement`);
  await page.locator('#dialog-primary').click(); await page.keyboard.up('d');
  await stopAndCheck(page, `${size}/${hero}: victory replay clears held movement`);
  assert.equal((await snap(page)).won, false, `${size}/${hero}: replay resets completed route`);
  return { size, hero, time: current.time, kills: current.kills, hp: current.player.hp };
}
async function checkDeath(page, size) {
  await open(page, size, 'jane'); await page.locator('#game-canvas').focus();
  await page.keyboard.down('d'); await settle(page, 1200); await page.keyboard.up('d');
  await settle(page, 30000);
  const lost = await snap(page);
  assert.equal(lost.dead, true, `${size}: enemy attacks can defeat an idle player`);
  assert.equal(lost.checkpoint.active, false, `${size}: pre-checkpoint defeat`);
  assert.match(await page.locator('#dialog-primary').textContent(), /try again/i, `${size}: correct retry without checkpoint`);
  const x = lost.player.x; await page.keyboard.down('d'); await settle(page, 300);
  near((await snap(page)).player.x, x, `${size}: defeat freezes movement`);
  await page.locator('#dialog-primary').click(); await page.keyboard.up('d');
  await stopAndCheck(page, `${size}: defeat retry clears held movement`);
  const retry = await snap(page);
  assert.equal(retry.dead, false); assert.equal(retry.player.hp, retry.player.maxHp);
  near(retry.player.x, retry.config.spawn.x, `${size}: retry begins at spawn`);
}
let browser;
(async () => {
  fs.mkdirSync(review, { recursive: true });
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const results = [], errors = [];
  const desktop = await browser.newContext(viewports[0]); const page = await desktop.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install({ time: new Date('2026-09-14T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-09-14T12:00:01Z'));
  for (const size of ['mini']) for (const hero of ['jessie', 'jane']) { await checkKeyboard(page, size, hero); console.log(`Keyboard PASS: ${size}/${hero}`); }
  await checkLinks(page);
  const playthroughs = [];
  for (const size of ['mini']) { playthroughs.push(await checkCompletion(page, size, size === 'big' ? 'jane' : 'jessie')); console.log(`Completion PASS: ${size}`); }
  for (const size of ['mini']) { await checkDeath(page, size); console.log(`Defeat and retry PASS: ${size}`); }
  for (const config of viewports) {
    const context = await browser.newContext(config), responsive = await context.newPage();
    responsive.on('pageerror', error => errors.push(`${config.name}: ${error.message}`));
    await responsive.clock.install({ time: new Date('2026-09-14T12:00:00Z') });
    await responsive.clock.pauseAt(new Date('2026-09-14T12:00:01Z'));
    for (const size of ['mini']) {
      await open(responsive, size, 'jane');
      results.push(await checkGrid(responsive, config, size));
      if (config.name === 'phone') await checkTouch(context, responsive, size);
      if (config.name === 'desktop' || config.name === 'phone') await responsive.screenshot({ path: path.join(review, `recyke-${size}-${config.name}.png`), fullPage: true });
    }
    await context.close();
  }
  assert.deepEqual(errors, [], 'browser runtime errors');
  console.log(`PASS: both mini heroes through keyboard, pause/resume, blur/restart; multi-touch movement/fire/cancel; ${results.length} native-grid viewport combinations; valid navigation links.`);
  console.log(JSON.stringify({ grids: results, playthroughs }));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => browser?.close());
