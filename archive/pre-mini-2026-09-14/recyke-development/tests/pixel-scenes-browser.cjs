const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const previewURL = process.env.PREVIEW_URL || 'http://127.0.0.1:8026';
let browser;
(async () => {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  const results = [];
  for (const config of [
    { name: 'desktop', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
    { name: 'portrait', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    { name: 'landscape', viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  ]) {
    const context = await browser.newContext(config);
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const path of ['world.html', 'characters.html', 'chase.html', 'play.html?mode=chase', 'play.html?mode=fps', 'play.html']) {
      await page.goto(previewURL + '/' + path);
      if (path === 'play.html') {
        const start = page.locator('[data-go="levelOne"]');
        if (config.hasTouch) await start.tap(); else await start.click();
      }
      await page.waitForTimeout(220);
      const measurements = await page.evaluate(() => [...document.querySelectorAll('canvas[data-pixel-scene]')].filter(c => c.getClientRects().length).map(c => {
        const r = c.getBoundingClientRect(), dpr = devicePixelRatio;
        return { id: c.id || c.dataset.asset, width: c.width, height: c.height, w: r.width, h: r.height, x: r.x, y: r.y,
          sx: r.width * dpr / c.width, sy: r.height * dpr / c.height, scale: Number(c.dataset.pixelScale), mode: c.dataset.pixelScene };
      }));
      for (const m of measurements) {
        assert.ok(Number.isInteger(m.scale) && m.scale >= 1, JSON.stringify(m));
        assert.ok(Math.abs(m.sx - m.scale) < .001 && Math.abs(m.sy - m.scale) < .001, JSON.stringify(m));
        assert.ok(Math.abs(m.x * config.deviceScaleFactor - Math.round(m.x * config.deviceScaleFactor)) < .04, JSON.stringify(m));
        assert.ok(Math.abs(m.y * config.deviceScaleFactor - Math.round(m.y * config.deviceScaleFactor)) < .04, JSON.stringify(m));
        if (m.mode !== 'wallpaper') assert.ok(m.w <= config.viewport.width + 1, JSON.stringify(m));
      }
      if (config.hasTouch && path.startsWith('play.html')) {
        const controls = await page.locator('.virtual-stick, .touch-btn').evaluateAll(es => es.map(e => {
          const r = e.getBoundingClientRect(); return { name: e.className, x: r.x, y: r.y, w: r.width, h: r.height };
        }));
        for (const c of controls) assert.ok(c.w > 0 && c.x >= -1 && c.y >= -1 && c.x + c.w <= config.viewport.width + 1 && c.y + c.h <= config.viewport.height + 1, JSON.stringify({ path, c }));
      }
      if (path === 'play.html') {
        await page.evaluate(() => {
          const original = CADCharacters.draw;
          CADCharacters.draw = function (ctx, name, x, feet, pose) { if (name === 'jessie') window.testJessieX = x; return original(ctx, name, x, feet, pose); };
        });
        await page.waitForTimeout(80);
        const before = await page.evaluate(() => window.testJessieX);
        if (config.hasTouch) {
          const stick = await page.locator('.virtual-stick').boundingBox(), fire = await page.locator('.touch-btn.fire').boundingBox();
          const session = await context.newCDPSession(page);
          const points = [{ x: stick.x + stick.width * .8, y: stick.y + stick.height / 2, id: 1 }, { x: fire.x + fire.width / 2, y: fire.y + fire.height / 2, id: 2 }];
          await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points });
          await page.waitForTimeout(320);
          assert.ok(await page.locator('.touch-btn.fire').evaluate(e => e.classList.contains('pressed')));
          await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        } else {
          await page.keyboard.down('d'); await page.waitForTimeout(320); await page.keyboard.up('d');
        }
        const after = await page.evaluate(() => window.testJessieX);
        assert.ok(after > before + 10, JSON.stringify({ before, after, device: config.name }));
      }
      results.push({ device: config.name, page: path, scenes: measurements.map(m => [m.id, m.scale, m.w, m.h]) });
    }
    assert.deepEqual(errors, [], config.name);
    await context.close();
  }
  await browser.close();
  console.log(`Pixel scene browser checks passed: ${results.length} desktop/mobile page combinations, integer device pixels, aligned origins, control bounds, keyboard movement, and simultaneous touch movement/fire.`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => browser?.close());
