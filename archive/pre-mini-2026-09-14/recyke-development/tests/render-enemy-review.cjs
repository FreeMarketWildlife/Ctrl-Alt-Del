/* Review media from the production native renderer. Requires @napi-rs/canvas
 * and sharp. Every figure shares one source-pixel grid; only the complete scene
 * is enlarged by an integer zoom. Native sprite sheets are separate assets.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createCanvas } = require('@napi-rs/canvas');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const box = { window: {}, document: { createElement: () => createCanvas(1, 1) } };
vm.createContext(box);
for (const file of ['jessie-motion.js', 'jessie.js', 'jane-motion.js', 'jane.js', 'enemy-mech-motion.js', 'enemy-mechs.js', 'enemy-drones.js', 'enemies.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), box);
  Object.assign(box, box.window);
}
const A = box.window.CADEnemies;
const width = 552, height = 352, cellWidth = 184, cellHeight = 160;
const canvas = createCanvas(width, height), c = canvas.getContext('2d');
const zoom = createCanvas(width * 3, height * 3), z = zoom.getContext('2d');
z.imageSmoothingEnabled = false;
const out = path.join(root, 'docs/review');

function scene(time, animated) {
  c.fillStyle = '#202b36'; c.fillRect(0, 0, width, height);
  c.fillStyle = '#d4dae0'; c.font = '10px monospace';
  c.fillText('ENEMY ROSTER / BIG + MINI / ONE WORLD PIXEL GRID', 12, 16);
  A.entries.forEach((entry, index) => {
    const x = index % 3 * cellWidth, y = Math.floor(index / 3) * cellHeight + 24;
    c.fillStyle = '#293644';
    for (let gx = x + 8; gx < x + cellWidth - 4; gx += 16) c.fillRect(gx, y + 24, 1, 108);
    for (let gy = y + 36; gy < y + 132; gy += 16) c.fillRect(x + 8, gy, cellWidth - 16, 1);
    c.fillStyle = '#60717c'; c.fillRect(x + 8, y + 132, cellWidth - 16, 1);
    c.fillStyle = A.palette(entry.id)[14]; c.font = '9px monospace';
    c.fillText(entry.name.toUpperCase(), x + 10, y + 15);
    const states = A.states(entry.id);
    const state = animated ? (states.includes('run') ? 'run' : 'patrol') : 'idle';
    const frame = animated ? A.frameAt(entry.id, state, time) : 0;
    A.draw(c, entry.id, 'big', x + 64, y + 132, { state, frame, time });
    A.draw(c, entry.id, 'mini', x + 146, y + 132, { state, frame, time });
    c.fillStyle = '#adbbc5'; c.font = '8px monospace';
    c.fillText('BIG', x + 54, y + 148); c.fillText('MINI', x + 134, y + 148);
    if (animated) c.fillText(state.toUpperCase(), x + 11, y + 148);
  });
  z.clearRect(0, 0, zoom.width, zoom.height);
  z.drawImage(canvas, 0, 0, zoom.width, zoom.height);
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  scene(0, false);
  fs.writeFileSync(path.join(out, 'enemy-roster.png'), zoom.toBuffer('image/png'));
  // Ground runs last 600 ms; aerial patrols last 1080 ms. Their shared 5400 ms
  // period makes the review loop cleanly without resetting an unfinished pose.
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const periods = A.entries.map(entry => {
    const state = A.states(entry.id).includes('run') ? 'run' : 'patrol';
    return A.durations(entry.id)[state].reduce((sum, ms) => sum + ms, 0);
  });
  const period = periods.reduce((a, b) => a * b / gcd(a, b));
  const frames = [], delay = 50, count = period / delay;
  zoom.width = width * 2; zoom.height = height * 2; z.imageSmoothingEnabled = false;
  for (let frame = 0; frame < count; frame++) {
    scene(frame * delay / 1000, true);
    frames.push(Buffer.from(z.getImageData(0, 0, zoom.width, zoom.height).data));
  }
  await sharp(Buffer.concat(frames), {
    raw: { width: zoom.width, height: zoom.height * count, channels: 4, pageHeight: zoom.height }
  }).gif({ loop: 0, delay: Array(count).fill(delay), dither: 0, colours: 128 }).toFile(path.join(out, 'enemy-animation.gif'));
  const meta = await sharp(path.join(out, 'enemy-animation.gif'), { animated: true }).metadata();
  if (meta.pages !== count || meta.pageHeight !== zoom.height || meta.delay.some(ms => ms !== delay)) throw new Error('Incorrect review GIF frames or timing');
  console.log(`Enemy roster exported at whole-scene 3×; animation at 2×. Native scene: ${width}×${height}; GIF: ${meta.pages} frames, ${delay} ms each, ${period} ms seamless shared period.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
