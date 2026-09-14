/* Native scene integration regression. Requires @napi-rs/canvas.
 * Scene probes change only review snapshots, never gameplay state or win tests.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { createCanvas } = require('@napi-rs/canvas');
const project = path.resolve(__dirname, '..');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'recyke-heroes-enemies-baseline.json')));
for (const [file, hash] of Object.entries(baseline.files)) assert.equal(sha256(fs.readFileSync(path.join(project, file))), hash, `${file}: approved character/enemy master changed`);
const box = { window: {}, document: { createElement: () => createCanvas(1, 1) }, console };
vm.createContext(box);
for (const file of ['jessie-motion.js', 'jessie.js', 'jane-motion.js', 'jane.js', 'enemy-mech-motion.js', 'enemy-mechs.js', 'enemy-drones.js', 'enemies.js', 'recyke-level.js', 'recyke-art.js']) {
  vm.runInContext(fs.readFileSync(path.join(project, file), 'utf8'), box, { filename: file });
  Object.assign(box, box.window);
}
const A = box.CADRecykeArt, L = box.CADRecykeLevel;
assert.equal(typeof A.draw, 'function'); assert.equal(typeof L.create, 'function');
const calls = [];
for (const [key, kind] of [['CADJessie', 'jessie'], ['CADJane', 'jane'], ['CADEnemies', 'enemy']]) {
  const api = box[key], original = api.draw;
  api.draw = function (ctx, ...args) {
    const matrix = ctx.getTransform();
    assert.ok(Math.abs(matrix.a) === 1 && Math.abs(matrix.d) === 1 && matrix.b === 0 && matrix.c === 0, `${kind}: independently scaled or rotated character`);
    assert.ok(Number.isInteger(matrix.e) && Number.isInteger(matrix.f), `${kind}: fractional scene origin`);
    calls.push({ kind, args });
    return original.call(api, ctx, ...args);
  };
}
const rendered = [], colors = new Set();
for (const size of ['big', 'mini']) for (const hero of ['jessie', 'jane']) {
  const game = L.create({ size, hero });
  const snapshot = game.snapshot();
  assert.deepEqual([snapshot.view.width, snapshot.view.height], size === 'big' ? [640, 360] : [480, 270]);
  const canvas = createCanvas(snapshot.view.width, snapshot.view.height), context = canvas.getContext('2d');
  const wrapped = new Proxy(context, {
    set(target, property, value) {
      if (property === 'fillStyle' || property === 'strokeStyle') {
        if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) colors.add(parseInt(value.slice(1), 16));
      }
      if (property === 'globalAlpha') assert.equal(value, 1, 'translucency blends the source palette');
      target[property] = value; return true;
    },
    get(target, property) {
      if (property === 'fillText' || property === 'strokeText') return () => assert.fail('Native world text must use raster pixel glyphs');
      if (property === 'drawImage') return (...args) => {
        assert.equal(target.imageSmoothingEnabled, false, 'scene image smoothing enabled');
        const image = args[0];
        if (args.length === 5) assert.deepEqual(args.slice(3), [image.width, image.height], 'image resized inside the native world');
        if (args.length === 9) assert.deepEqual(args.slice(3, 5), args.slice(7), 'image region resized inside the native world');
        return target.drawImage(...args);
      };
      const value = target[property]; return typeof value === 'function' ? value.bind(target) : value;
    }
  });
  // A fractional camera catches subpixel parallax/translation problems. The
  // renderer alone must snap the final world raster, including backgrounds.
  const length = snapshot.config.worldWidth;
  for (const camera of [0, 137.375, Math.max(0, length / 2), Math.max(0, length - snapshot.view.width)]) {
    const sample = { ...snapshot, camera, time: 1.375 };
    const before = calls.length;
    A.draw(wrapped, sample);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const offPalette = new Set(); let transparent = 0;
    for (let i = 0; i < data.length; i += 4) {
      assert.ok(data[i + 3] === 0 || data[i + 3] === 255, `${size}/${hero}/${camera}: partially transparent source pixel`);
      if (!data[i + 3]) { transparent++; continue; }
      const rgb = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      if (!colors.has(rgb)) offPalette.add('#' + rgb.toString(16).padStart(6, '0'));
    }
    assert.equal(transparent, 0, `${size}/${hero}/${camera}: scene has unpainted pixels`);
    assert.deepEqual([...offPalette], [], `${size}/${hero}/${camera}: antialiasing or untracked palette colors`);
    for (const call of calls.slice(before)) {
      const renderedSize = call.kind === 'enemy' ? call.args[1] : call.args[0];
      assert.equal(renderedSize, size, `${call.kind}: wrong native model family in ${size} scene`);
    }
    rendered.push({ size, hero, camera, pixels: canvas.width * canvas.height });
  }
}
assert.ok(calls.some(call => call.kind === 'jessie') && calls.some(call => call.kind === 'jane'), 'both approved heroes integrated');
assert.ok(calls.some(call => call.kind === 'enemy'), 'approved enemy models integrated');
console.log(`PASS: ${Object.keys(baseline.files).length} approved master hashes unchanged; ${rendered.length} native scene probes; opaque palette pixels, no sprite scaling, integer origins, and both size families.`);
