/* Native raster, complete animation/export, workshop, and approved-hero checks.
 * NODE_PATH must expose Playwright. CHROME_PATH can select local Chrome.
 * UPDATE_ASSETS=1 saves sheets only after the raster and metadata checks pass.
 * SKIP_UI=1 is useful while developing the renderer; the release check uses UI.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('playwright');

const project = path.resolve(__dirname, '..');
const base = process.env.BASE_URL || 'http://127.0.0.1:8033';
const review = process.env.REVIEW_DIR || '/private/tmp/enemy-review';
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const expectedIds = ['sentinel', 'bastion', 'scrapper', 'watcher', 'manta', 'collector'];
const selectedIds = process.env.ENEMY_IDS ? process.env.ENEMY_IDS.split(',') : expectedIds;

(async () => {
  const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'enemy-heroes-baseline.json'), 'utf8'));
  for (const [file, expected] of Object.entries(baseline.files)) {
    assert.equal(sha256(fs.readFileSync(path.join(project, file))), expected, `${file}: approved hero changed`);
  }
  fs.mkdirSync(review, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/enemies.html');
    await page.waitForFunction(() => typeof CADEnemies !== 'undefined');

    const results = await page.evaluate(selected => {
      const A = CADEnemies;
      const groundStates = ['idle', 'walk', 'run', 'charge', 'fire', 'run-fire', 'melee', 'jump', 'hurt', 'death'];
      const droneStates = ['idle', 'patrol', 'rush', 'charge', 'fire', 'hurt', 'death'];
      const check = (condition, message) => { if (!condition) failures.push(message); };
      const failures = [], enemies = {};
      let rasters = 0;
      const cv = document.createElement('canvas'), margin = 64;
      const hash = data => {
        let h = 2166136261;
        for (let i = 0; i < data.length; i++) h = Math.imul(h ^ data[i], 16777619);
        return h >>> 0;
      };
      function largestComponent(data, width, height) {
        const seen = new Uint8Array(width * height), queue = new Int32Array(width * height);
        let largest = 0;
        for (let start = 0; start < seen.length; start++) {
          if (seen[start] || !data[start * 4 + 3]) continue;
          let head = 0, tail = 1;
          queue[0] = start; seen[start] = 1;
          while (head < tail) {
            const pixel = queue[head++], x = pixel % width, y = Math.floor(pixel / width);
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
              const next = ny * width + nx;
              if (!seen[next] && data[next * 4 + 3]) {
                seen[next] = 1; queue[tail++] = next;
              }
            }
          }
          largest = Math.max(largest, tail);
        }
        return largest;
      }
      for (const entry of A.entries.filter(entry => selected.includes(entry.id))) {
        const id = entry.id, isGround = ['sentinel', 'bastion', 'scrapper'].includes(id);
        const states = A.states(id), timings = A.durations(id), palette = A.palette(id);
        const expectedStates = isGround ? groundStates : droneStates;
        check(states.length === expectedStates.length && expectedStates.every(s => states.includes(s)), `${id}: complete action set`);
        check(palette.length === 16 && new Set(palette).size === 16, `${id}: exactly 16 unique colors`);
        const colors = new Set(palette.map(value => parseInt(value.slice(1), 16)));
        const metadata = A.metadata(id);
        check(metadata.sourcePixelWorldUnits === 1, `${id}: source pixel/world unit relationship`);
        check(metadata.columns === 12, `${id}: fixed 12-column sheet`);
        check(JSON.stringify(metadata.rows) === JSON.stringify(states), `${id}: metadata row order`);
        check(JSON.stringify(metadata.palette) === JSON.stringify(palette), `${id}: metadata palette`);
        check(JSON.stringify(metadata.timingMs) === JSON.stringify(timings), `${id}: canonical frame timings`);
        const item = enemies[id] = { metadata, bounds: {}, poseCounts: {}, sheets: {} };
        for (const size of ['big', 'mini']) {
          const spec = A.specs[size];
          const expected = size === 'big' ? { width: 128, height: 128, anchor: [64, 112], extent: 96 } : { width: 48, height: 48, anchor: [20, 40], extent: 32 };
          check(spec.width === expected.width && spec.height === expected.height && JSON.stringify(spec.anchor) === JSON.stringify(expected.anchor), `${id}/${size}: native cell and anchor`);
          cv.width = spec.width + margin * 2; cv.height = spec.height + margin * 2;
          const c = cv.getContext('2d', { willReadFrequently: true });
          const draw = (state, frame, facing = 1, time = 0) => {
            c.clearRect(0, 0, cv.width, cv.height);
            A.draw(c, id, size, margin + spec.anchor[0], margin + spec.anchor[1], { state, frame, facing, time });
            return c.getImageData(0, 0, cv.width, cv.height).data;
          };
          item.bounds[size] = {}; item.poseCounts[size] = {};
          for (const state of states) {
            const timing = timings[state], poses = new Set();
            check(Array.isArray(timing) && timing.length > 0 && timing.length <= 12 && timing.every(t => Number.isFinite(t) && t > 0), `${id}/${state}: positive timings and valid pose count`);
            check(metadata.frameCounts[state] === timing.length, `${id}/${state}: exported frame count`);
            check(typeof metadata.loops[state] === 'boolean', `${id}/${state}: loop recommendation`);
            if (state === 'death') check(metadata.loops[state] === false, `${id}: death must hold its final pose in gameplay`);
            let ms = 0;
            for (let frame = 0; frame < timing.length; frame++) {
              for (const facing of [1, -1]) {
                const data = draw(state, frame, facing, ms / 1000); rasters++;
                let count = 0, minX = cv.width, maxX = -1, minY = cv.height, maxY = -1;
                let badAlpha = false, badColor = false;
                for (let i = 0; i < data.length; i += 4) {
                  if (!data[i + 3]) continue;
                  const pixel = i / 4, x = pixel % cv.width, y = Math.floor(pixel / cv.width);
                  count++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                  if (data[i + 3] !== 255) badAlpha = true;
                  if (!colors.has((data[i] << 16) | (data[i + 1] << 8) | data[i + 2])) badColor = true;
                }
                const label = `${id}/${size}/${state}/${frame}/${facing}`;
                check(count > (size === 'big' ? 70 : 8), `${label}: empty or disappearing model`);
                check(!badAlpha, `${label}: antialiased/translucent pixel`);
                check(!badColor, `${label}: color outside palette`);
                check(minX >= margin && minY >= margin && maxX < margin + spec.width && maxY < margin + spec.height, `${label}: overflow [${[minX - margin, minY - margin, maxX - margin, maxY - margin]}]`);
                const connected = largestComponent(data, cv.width, cv.height);
                check(connected >= count * .72, `${label}: disconnected anatomy/core (${connected}/${count})`);
                if (state === 'idle' && frame === 0) {
                  const extent = isGround ? maxY - minY + 1 : maxX - minX + 1;
                  check(extent === expected.extent, `${label}: ${isGround ? 'standing height' : 'neutral span'} ${extent}, expected ${expected.extent}`);
                  if (isGround) check(maxY === margin + spec.anchor[1] - 1, `${label}: feet baseline`);
                  if (facing === 1) item.bounds[size] = { width: maxX - minX + 1, height: maxY - minY + 1, top: minY - margin, bottom: maxY - margin, left: minX - margin, right: maxX - margin };
                }
                if (isGround && state !== 'death' && (CADEnemyMechMotion.contactFrames[state] || []).includes(frame)) {
                  check(maxY === margin + spec.anchor[1] - 1, `${label}: planted foot left the floor`);
                }
                if (facing === 1) poses.add(hash(data));
              }
              if (isGround) {
                const pose = CADEnemyMechMotion.sample(size, state, frame), dimension = CADEnemyMechMotion.dimensions[size];
                for (const limb of ['near', 'far']) {
                  const leg = pose[limb];
                  for (const [a, b, length] of [[leg.hip, leg.knee, dimension.thigh], [leg.knee, leg.ankle, dimension.shin]]) {
                    check(Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1]) - length) <= 1.5, `${id}/${size}/${state}/${frame}: ${limb} leg length changed`);
                  }
                }
                if (state === 'run-fire') check(JSON.stringify(pose) === JSON.stringify(CADEnemyMechMotion.sample(size, 'run', frame)), `${id}/${size}/${frame}: firing changed locomotion`);
              }
              check(A.frameAt(id, state, (ms + .001) / 1000) === frame, `${id}/${state}: frame start ${frame}`);
              check(A.frameAt(id, state, (ms + timing[frame] / 2) / 1000) === frame, `${id}/${state}: frame midpoint ${frame}`);
              ms += timing[frame];
            }
            item.poseCounts[size][state] = poses.size;
            if (timing.length >= 3 && state !== 'idle') check(poses.size >= 3, `${id}/${size}/${state}: needs at least three distinct poses`);
            if (state === 'idle') check(poses.size >= 2, `${id}/${size}: idle animation is static`);
            check(A.frameAt(id, state, ms / 1000 + .000001) === 0, `${id}/${state}: preview loop boundary`);
            check(A.frameAt(id, state, -.000001) === timing.length - 1, `${id}/${state}: reverse preview loop`);
          }
          const sheet = A.sheet(id, size);
          check(sheet.width === spec.width * 12 && sheet.height === spec.height * states.length, `${id}/${size}: native sheet dimensions`);
          const sheetContext = sheet.getContext('2d', { willReadFrequently: true });
          for (let row = 0; row < states.length; row++) {
            const state = states[row], timing = timings[state];
            for (let col = 0; col < 12; col++) {
              const frame = Math.min(col, timing.length - 1), time = timing.slice(0, frame).reduce((a, b) => a + b, 0) / 1000;
              draw(state, frame, 1, time);
              check(hash(sheetContext.getImageData(col * spec.width, row * spec.height, spec.width, spec.height).data) === hash(c.getImageData(margin, margin, spec.width, spec.height).data), `${id}/${size}/${state}/${col}: exported cell differs from renderer`);
            }
          }
          item.sheets[size] = sheet.toDataURL();
        }
      }
      return { failures, rasters, enemies, ids: Object.keys(enemies) };
    }, selectedIds);
    assert.deepEqual(results.ids, selectedIds, 'requested enemy archetypes');
    if (!process.env.ENEMY_IDS) assert.deepEqual(errors, [], 'enemy workshop JavaScript errors');
    if (results.failures.length) console.error(JSON.stringify({ failures: results.failures, enemies: Object.fromEntries(Object.entries(results.enemies).map(([id, item]) => [id, { bounds: item.bounds, poseCounts: item.poseCounts }])) }, null, 2));
    for (const [id, item] of Object.entries(results.enemies)) for (const size of ['big', 'mini']) {
      fs.writeFileSync(path.join(review, `${id}-${size}-all-states.png`), Buffer.from(item.sheets[size].split(',')[1], 'base64'));
    }
    assert.deepEqual(results.failures, [], 'native raster and metadata failures');
    for (const [id, item] of Object.entries(results.enemies)) {
      for (const size of ['big', 'mini']) {
        const bytes = Buffer.from(item.sheets[size].split(',')[1], 'base64');
        if (process.env.UPDATE_ASSETS === '1') {
          fs.mkdirSync(path.join(project, 'assets/enemies', id), { recursive: true });
          fs.writeFileSync(path.join(project, 'assets/enemies', id, `${id}-${size}.png`), bytes);
        }
      }
      if (process.env.UPDATE_ASSETS === '1') fs.writeFileSync(path.join(project, 'assets/enemies', id, `${id}-animation.json`), JSON.stringify(item.metadata, null, 2) + '\n');
    }

    if (process.env.SKIP_UI !== '1') {
      await page.locator('#pause').click();
      assert.deepEqual(await page.locator('#enemy option').evaluateAll(options => options.map(option => option.value)), expectedIds);
      for (const [id, item] of Object.entries(results.enemies)) {
        await page.locator('#enemy').selectOption(id);
        assert.deepEqual(await page.locator('#motion option').evaluateAll(options => options.map(option => option.value)), item.metadata.rows, `${id}: all workshop actions`);
        const movement = item.metadata.rows.includes('run') ? 'run' : 'patrol';
        await page.locator('#motion').selectOption(movement);
        for (let frame = 0; frame < item.metadata.frameCounts[movement]; frame++) {
          assert.match(await page.locator('#frame-info').textContent(), new RegExp(`/ ${frame + 1} OF ${item.metadata.frameCounts[movement]} / ${item.metadata.timingMs[movement][frame]} ms$`), `${id}: complete frame stepping`);
          await page.locator('#step').click();
        }
        assert.match(await page.locator('#frame-info').textContent(), /\/ 1 OF 12 \//, `${id}: next-frame control wraps all 12 poses`);
        for (const state of item.metadata.rows) {
          await page.locator('#motion').selectOption(state);
          for (const size of ['big', 'mini']) {
            const strip = page.locator(`#${size}-strip`), spec = item.metadata.sizes[size];
            assert.equal(await strip.evaluate(canvas => canvas.width), spec.width * item.metadata.frameCounts[state], `${id}/${size}/${state}: all poses visible in strip`);
            const data = await strip.evaluate(canvas => canvas.toDataURL());
            fs.writeFileSync(path.join(review, `${id}-${size}-${state}-sequence.png`), Buffer.from(data.split(',')[1], 'base64'));
          }
        }
        for (const size of ['big', 'mini']) {
          const pending = page.waitForEvent('download');
          await page.locator(`[data-export="${size}"]`).click();
          const download = await pending;
          assert.equal(download.suggestedFilename(), `${id}-${size}.png`);
          assert.equal(sha256(fs.readFileSync(await download.path())), sha256(Buffer.from(item.sheets[size].split(',')[1], 'base64')), `${id}/${size}: workshop export equals validated renderer`);
        }
        const pending = page.waitForEvent('download'); await page.locator('#metadata').click(); const download = await pending;
        assert.equal(download.suggestedFilename(), `${id}-animation.json`);
        assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(), 'utf8')), JSON.parse(JSON.stringify(item.metadata)), `${id}: workshop metadata equals canonical JSON metadata`);
      }
      await page.locator('#enemy').selectOption('sentinel'); await page.locator('#motion').selectOption('run');
      const scene = page.locator('#comparison');
      const snapshot = () => scene.evaluate(canvas => canvas.toDataURL());
      let before = await snapshot(); await page.locator('#step').click(); assert.notEqual(await snapshot(), before, 'step updates pose');
      before = await snapshot(); await page.locator('#face').click(); assert.notEqual(await snapshot(), before, 'turn updates facing'); await page.locator('#face').click();
      before = await snapshot(); await page.locator('#silhouette').check(); assert.notEqual(await snapshot(), before, 'silhouette updates pixels'); await page.locator('#silhouette').uncheck();
      await page.locator('#compare-hero').selectOption('none'); before = await snapshot();
      for (const hero of ['jessie', 'jane']) {
        await page.locator('#compare-hero').selectOption(hero); assert.notEqual(await snapshot(), before, `${hero}: approved hero comparison added`);
        await page.locator('.scene').screenshot({ path: path.join(review, `enemy-${hero}-comparison.png`) });
      }
      await page.locator('#background').selectOption('light'); await page.locator('.scene').screenshot({ path: path.join(review, 'enemy-light-comparison.png') });
      await page.locator('#background').selectOption('dark'); await page.screenshot({ path: path.join(review, 'enemy-workshop.png'), fullPage: true });
      await checkCatalog(browser, results);
      for (const [width, height, dpr] of [[1440, 1000, 1], [390, 844, 3], [844, 390, 3], [800, 600, 1.25]]) {
        const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr });
        const responsive = await context.newPage(); await responsive.goto(base + '/enemies.html');
        const values = await responsive.evaluate(() => Array.from(document.querySelectorAll('canvas')).map(canvas => {
          const rect = canvas.getBoundingClientRect();
          return { id: canvas.id, sx: rect.width * devicePixelRatio / canvas.width, sy: rect.height * devicePixelRatio / canvas.height, smoothing: canvas.getContext('2d').imageSmoothingEnabled, overflow: document.documentElement.scrollWidth > innerWidth };
        }));
        for (const value of values) {
          assert.ok(Math.abs(value.sx - value.sy) < .001, `${value.id}: uniform scene scale at ${width}/${dpr}`);
          assert.ok(Math.abs(value.sx - Math.round(value.sx)) < .001, `${value.id}: whole device pixels at ${width}/${dpr}`);
          assert.equal(value.smoothing, false); assert.equal(value.overflow, false);
        }
        await context.close();
      }
    }
    for (const hero of ['jessie', 'jane']) {
      const p = await browser.newPage(); await p.goto(base + '/' + hero + '.html');
      const hashes = await p.evaluate(async name => {
        const A = name === 'jessie' ? CADJessie : CADJane;
        return Object.fromEntries(await Promise.all(['big', 'mini'].map(async size => {
          const cv = A.sheet(size), pixels = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
          const digest = await crypto.subtle.digest('SHA-256', pixels);
          return [size, Array.from(new Uint8Array(digest)).map(value => value.toString(16).padStart(2, '0')).join('')];
        })));
      }, hero);
      assert.deepEqual(hashes, baseline.renderRGBA[hero], `${hero}: rendered sheets must remain pixel-for-pixel identical`);
      await p.close();
    }
    if (!process.env.ENEMY_IDS) assert.deepEqual(errors, []);
    console.log(`Enemies: ${results.rasters} native rasters across ${selectedIds.length} archetypes, both sizes and facings passed. Native dimensions, 16 opaque colors, connected cores, fixed neutral extents, complete action timings, and exact exports verified. ${process.env.SKIP_UI === '1' ? 'UI checks skipped for renderer development.' : 'Workshop, downloads, catalog, aliases, and desktop/mobile pixel grids verified.'} Jessie and Jane remain pixel-for-pixel unchanged. Review: ${review}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

async function checkCatalog(browser, results) {
  const errors = [];
  for (const [id, item] of Object.entries(results.enemies)) {
    // Separate contexts keep Chrome's repeated-download limiter from suppressing
    // the eleventh rapid export in this automated review of all twelve models.
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/codex.html#' + id + '-big'); await page.locator('#pause').click();
    for (const size of ['big', 'mini']) {
      await page.locator(`[data-asset="${id}-${size}"]`).click();
      assert.deepEqual(await page.locator('#motion option').evaluateAll(options => options.map(option => option.value)), item.metadata.rows, `${id}/${size}: complete catalog action set`);
      assert.equal(await page.locator('.palette i').count(), 16, `${id}/${size}: catalog palette`);
      assert.match(await page.locator('#character-workshop-link').getAttribute('href'), /enemies\.html/);
      await page.locator('#motion').selectOption('idle');
      const extent = await page.locator('#art').evaluate((canvas, ground) => {
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let min = Infinity, max = -1;
        for (let i = 3; i < data.length; i += 4) if (data[i]) {
          const pixel = (i - 3) / 4, coordinate = ground ? Math.floor(pixel / canvas.width) : pixel % canvas.width;
          min = Math.min(min, coordinate); max = Math.max(max, coordinate);
        }
        return max - min + 1;
      }, item.metadata.group === 'Mechs');
      assert.equal(extent, size === 'big' ? 96 : 32, `${id}/${size}: catalog preserves the native height or neutral span`);
      const pending = page.waitForEvent('download'); await page.locator('#export').click(); const download = await pending;
      const png = fs.readFileSync(await download.path()), spec = item.metadata.sizes[size];
      assert.equal(png.readUInt32BE(16), spec.width, `${id}/${size}: native frame export width`);
      assert.equal(png.readUInt32BE(20), spec.height, `${id}/${size}: native frame export height`);
    }
    await page.close();
  }
  // Alias cases are the legacy study names, retaining existing bookmarked links.
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  for (const [legacy, current] of [['sentinel', 'sentinel-big'], ['bastion', 'bastion-big'], ['scrapper', 'scrapper-big'], ['watcher', 'watcher-big'], ['manta', 'manta-big'], ['collector', 'collector-big']]) {
    await page.goto(base + '/codex.html#' + legacy);
    await page.waitForURL(url => url.hash === '#' + current);
  }
  assert.deepEqual(errors, [], 'catalog JavaScript errors'); await page.close();
}
