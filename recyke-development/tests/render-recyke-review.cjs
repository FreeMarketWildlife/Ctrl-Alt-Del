/* Review media from the production engine and raster renderer. Both scenes
 * preserve one source pixel per world unit. Only the whole board is zoomed.
 * Requires @napi-rs/canvas and sharp; all motion comes from normal inputs. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createCanvas } = require('@napi-rs/canvas');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..'), out = path.join(root, 'docs/review');
const box = { window: {}, document: { createElement: () => createCanvas(1, 1) } };
vm.createContext(box);
for (const file of ['jessie-motion.js', 'jessie.js', 'jane-motion.js', 'jane.js', 'enemy-mech-motion.js', 'enemy-mechs.js', 'enemy-drones.js', 'enemies.js', 'recyke-level.js', 'recyke-art.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), box); Object.assign(box, box.window);
}
const A = box.CADRecykeArt, L = box.CADRecykeLevel;
const scene = size => ({ size, game: L.create({ size, hero: 'jane', random: () => .5 }), canvas: createCanvas(size === 'big' ? 640 : 480, size === 'big' ? 360 : 270), jumped: false });
const scenes = [scene('big'), scene('mini')];
const board = createCanvas(1176, 440), context = board.getContext('2d');
const enlarged = createCanvas(board.width * 2, board.height * 2), enlargedContext = enlarged.getContext('2d');
enlargedContext.imageSmoothingEnabled = false;
function draw() {
  context.fillStyle = '#101b20'; context.fillRect(0, 0, board.width, board.height);
  A.word(context, 'RECYKE / FIRST SHIFT', 16, 15, '#d4ccad');
  A.word(context, 'SAME WORLD PIXEL GRID / SEPARATE NATIVE ROUTES', 16, 31, '#8fcac0');
  for (const [index, item] of scenes.entries()) {
    const x = index ? 680 : 16, y = index ? 142 : 56;
    A.draw(item.canvas.getContext('2d'), item.game.snapshot());
    context.fillStyle = '#42536a'; context.fillRect(x - 1, y - 1, item.canvas.width + 2, item.canvas.height + 2);
    context.drawImage(item.canvas, x, y);
    A.word(context, index ? 'SMALL / 32PX CHARACTER' : 'BIG / 96PX CHARACTER', x, y - 13, '#d4ccad');
  }
  A.word(context, 'MOVE / JUMP / FIRE / SWAP', 680, 76, '#8fcac0');
  A.word(context, 'SORTING YARD > REPAIR STATION > LINE 7', 680, 94, '#72838e');
  A.word(context, 'BOTH VERSIONS PLAYABLE WITH JESSIE OR JANE', 16, 426, '#72838e');
}
function advance() {
  for (const item of scenes) {
    const s = item.game.snapshot(), obstacle = s.platforms.find(p => p.kind !== 'ground' && !p.oneWay && p.x + p.w > s.player.x && p.y < s.player.y - 1 && p.x - s.player.x < (item.size === 'big' ? 70 : 34));
    const jump = s.player.onGround && obstacle && !item.jumped;
    item.game.update(1 / 60, { right: true, fire: true, jump: !!jump }); item.jumped = !!jump;
  }
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  draw(); enlargedContext.drawImage(board, 0, 0, enlarged.width, enlarged.height);
  fs.writeFileSync(path.join(out, 'recyke-big-small.png'), enlarged.toBuffer('image/png'));
  const frames = [], count = 64, delay = 100;
  for (let frame = 0; frame < count; frame++) {
    draw(); frames.push(Buffer.from(context.getImageData(0, 0, board.width, board.height).data));
    for (let step = 0; step < 6; step++) advance();
  }
  await sharp(Buffer.concat(frames), { raw: { width: board.width, height: board.height * count, channels: 4, pageHeight: board.height } })
    .gif({ loop: 0, delay: Array(count).fill(delay), dither: 0, colours: 256 }).toFile(path.join(out, 'recyke-playthrough.gif'));
  const meta = await sharp(path.join(out, 'recyke-playthrough.gif'), { animated: true }).metadata();
  if (meta.pages !== count || meta.pageHeight !== board.height || meta.delay.some(ms => ms !== delay)) throw new Error('Review animation timing or geometry mismatch');
  console.log(`Review exported: native ${board.width}×${board.height} comparison; static board at 2× whole-scene zoom; ${count} frames / ${count * delay} ms of normal-input play.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
