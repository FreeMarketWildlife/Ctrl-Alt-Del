const assert = require('node:assert/strict');
const grid = require('../pixel-grid.js');

function scene(width, height, left = 0, top = 0) {
  const context = { imageSmoothingEnabled: true };
  return { width, height, style: {}, getContext: () => context,
    getBoundingClientRect: () => ({ left, top }) };
}

// Desktop whole-scene fit, including a height-limited viewport.
assert.equal(grid.fitScale(scene(480, 270), 1280, 800, 1), 2);
assert.equal(grid.fitScale(scene(480, 270), 1280, 500, 1), 1);

// Retina phones can display a complete 480px scene on a 320px CSS surface
// with every original art pixel still occupying exactly 2 device pixels.
const phone = scene(480, 270, 17.2, 10.1);
const mobile = grid.applyScene(phone, { availableWidth: 390, availableHeight: 300, dpr: 3 });
assert.equal(mobile.scale, 2);
assert.equal(mobile.cssWidth, 320);
assert.equal(mobile.cssHeight, 180);
assert.equal(mobile.overflowX, false);
assert.equal(phone.style.width, '320px');
assert.equal(phone.getContext().imageSmoothingEnabled, false);
assert.ok(Math.abs((17.2 + mobile.origin.x) * 3 - Math.round(17.2 * 3)) < 1e-9);
assert.ok(Math.abs((10.1 + mobile.origin.y) * 3 - Math.round(10.1 * 3)) < 1e-9);

// All drawings inside a combined scene inherit one scale. Different native
// cell dimensions do not change the size of the scene's individual pixels.
const combined = scene(240, 144);
const comparison = grid.applyScene(combined, { availableWidth: 760, availableHeight: 420, dpr: 2 });
assert.equal(comparison.scale, 5);
assert.equal(comparison.cssWidth / combined.width, comparison.cssHeight / combined.height);
assert.equal(comparison.cssWidth * comparison.dpr, combined.width * comparison.scale);
assert.equal(comparison.cssHeight * comparison.dpr, combined.height * comparison.scale);

// Low-density small screens report a need for scrolling/cropping; never
// silently introduce fractional device pixels or alter native geometry.
const small = scene(480, 270);
const cropped = grid.applyScene(small, { availableWidth: 390, availableHeight: 220, dpr: 1 });
assert.equal(cropped.scale, 1);
assert.equal(cropped.overflowX, true);
assert.equal(cropped.overflowY, true);
assert.equal(small.width, 480);
assert.equal(small.height, 270);

// Explicit inspection zoom is whole-scene and can be bounded.
assert.equal(grid.applyScene(scene(128, 128), { scale: 8, maxScale: 4, dpr: 2 }).scale, 4);
assert.equal(grid.fitScale(scene(480, 270), 768, Infinity, 1.25), 2);
assert.throws(() => grid.applyScene(scene(64, 64), { scale: 1.5 }), /whole device pixels/);
assert.throws(() => grid.fitScale(scene(480, 270), 390, 300, 0), /density/);
assert.throws(() => grid.fitScale(scene(0, 64), 390), /dimensions/);
assert.throws(() => grid.fitScale(scene(64, 64), Infinity), /finite/);
assert.throws(() => grid.fitScale(scene(64, 64), NaN), /width/);

console.log('Pixel grid: integer desktop/mobile scaling, shared scene grid, origin alignment and overflow checks passed.');
