/* UI presents the complete native scene; it never changes individual art sizes. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('game-canvas'), context = canvas.getContext('2d');
  const stage = $('game-stage'), dialog = $('mission-dialog');
  const params = new URLSearchParams(location.search);
  let size = 'mini';
  let hero = params.get('hero') === 'jane' ? 'jane' : 'jessie';
  let game = CADRecykeLevel.create({ size, hero });
  let latest = game.snapshot(), grid, lastTime = null, lastHud = -Infinity;
  let overlay = '', previousZone = '', previousNotice = '';
  const keys = new Set(), pointers = new Map(), pulses = new Set();
  const heldControls = new Set(['left', 'right', 'fire', 'down']);
  const mapping = { KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
    KeyW: 'jump', ArrowUp: 'jump', KeyS: 'down', ArrowDown: 'down', Space: 'fire', KeyK: 'fire', KeyE: 'melee', KeyQ: 'swap' };
  const controls = [...document.querySelectorAll('[data-control]')];
  const isForm = target => target instanceof Element && !!target.closest('input,select,textarea,button,a,summary,[contenteditable="true"]');

  function setText(id, value) { const node = $(id); if (node.textContent !== String(value)) node.textContent = value; }
  function clearInput() {
    keys.clear(); pulses.clear();
    for (const [id, record] of pointers) {
      if (record.button.hasPointerCapture?.(id)) record.button.releasePointerCapture(id);
    }
    pointers.clear();
    for (const button of controls) delete button.dataset.held;
  }
  function fit() {
    if (canvas.width !== latest.view.width || canvas.height !== latest.view.height) {
      canvas.width = latest.view.width; canvas.height = latest.view.height;
      context.imageSmoothingEnabled = false;
    }
    const touchHeight = document.querySelector('.touch-controls').getBoundingClientRect().height;
    // Keep the entire playfield visible at launch, including the feet and floor.
    // If the viewport cannot fit one device pixel per art pixel, applyScene
    // preserves that minimum grid and the viewport offers horizontal panning.
    const room = Math.max(0, innerHeight - Math.max(0, stage.getBoundingClientRect().top) - touchHeight - 45);
    grid = CADPixelGrid.applyScene(canvas, { availableWidth: stage.clientWidth, availableHeight: room, maxScale: 4 });
    $('viewport-note').hidden = !grid.overflowX;
    stage.tabIndex = grid.overflowX ? 0 : -1;
  }
  function updateRoute() {
    const url = new URL(location.href); url.searchParams.set('size', size); url.searchParams.set('hero', hero);
    history.replaceState(null, '', url);
  }
  function syncChoices() {
    for (const button of document.querySelectorAll('[data-size]')) button.setAttribute('aria-pressed', String(button.dataset.size === size));
    for (const button of document.querySelectorAll('[data-hero]')) button.setAttribute('aria-pressed', String(button.dataset.hero === hero));
    setText('family-note', 'Mini / 32px characters');
    setText('hero-name', hero.toUpperCase());
    canvas.setAttribute('aria-label', `${'Mini'} ${hero === 'jane' ? 'Jane' : 'Jessie'} in Recyke. Move A/D or arrows, jump W/Up, hold S/Down to crouch, fire Space/K, melee E, swap Q, pause P.`);
    updateRoute();
  }
  function focusGame() { canvas.focus({ preventScroll: true }); }
  function closeOverlay() {
    if (dialog.open) dialog.close();
    overlay = '';
    // Resuming returns keyboard control to play instead of leaving Space bound
    // to the toolbar button that originally opened the dialog.
    focusGame();
  }
  function reset(checkpoint = false) {
    clearInput(); game.reset({ checkpoint }); game.setPaused(false); latest = game.snapshot();
    closeOverlay(); syncChoices(); render(true); focusGame(); lastTime = null;
  }
  function pause(value = !latest.paused) {
    clearInput(); game.setPaused(value); latest = game.snapshot();
    if (!value && !latest.dead && !latest.won) closeOverlay();
    render(true);
  }
  function syncOverlay() {
    const mode = latest.won ? 'won' : latest.dead ? 'dead' : latest.paused ? 'paused' : '';
    $('pause-button').setAttribute('aria-pressed', String(latest.paused));
    $('pause-button').firstChild.textContent = latest.paused ? 'Resume ' : 'Pause ';
    if (!mode) { if (overlay) closeOverlay(); return; }
    if (overlay === mode) return;
    clearInput(); overlay = mode;
    const cp = Boolean(latest.checkpoint?.active);
    const copy = mode === 'won'
      ? ['LINE 7 / REACHED', 'Shift complete.', `You made it through the Recyke. ${latest.kills || 0} machines disabled. Switch hero for your next run.`, 'Play again', 'R to play again']
      : mode === 'dead'
        ? ['SIGNAL LOST', 'Back on your feet.', cp ? 'The checkpoint is secure. Regroup there and finish the route to Line 7.' : 'The receiving yard is clear for another attempt. Watch the machines charge before they attack.', cp ? 'Retry checkpoint' : 'Try again', 'R to retry']
        : ['RUN ON HOLD', 'Take a breath.', 'The yard will wait. Your position and progress are safe.', 'Resume', 'P or Escape to resume'];
    ['dialog-eyebrow', 'dialog-title', 'dialog-description', 'dialog-primary', 'dialog-hint'].forEach((id, index) => setText(id, copy[index]));
    $('dialog-restart').hidden = mode === 'won';
    if (!dialog.open) dialog.showModal();
    $('dialog-primary').focus({ preventScroll: true });
    setText('announcements', copy[1] + ' ' + copy[2]);
  }
  function hud() {
    const p = latest.player;
    if (p.hero !== hero) { hero = p.hero; syncChoices(); }
    const maxHp = Math.max(1, p.maxHp || 100), hp = Math.max(0, Math.ceil(p.hp));
    $('health-meter').max = maxHp; $('health-meter').value = hp; $('health-meter').low = maxHp * .3; $('health-meter').high = maxHp * .6; $('health-meter').optimum = maxHp;
    setText('health-value', hp + ' / ' + maxHp);
    const progress = Math.max(0, Math.min(1, latest.progress || 0));
    $('route-progress').value = progress; setText('progress-value', Math.round(progress * 100) + '%');
    const zone = latest.zone?.name || 'Receiving yard'; setText('zone-name', zone);
    const notice = latest.notice || latest.zone?.hint || 'Reach Line 7. Follow the painted arrows through the yard.';
    setText('field-notice', notice);
    setText('checkpoint-status', latest.checkpoint?.active ? 'CHECKPOINT / SECURE' : 'CHECKPOINT / NOT REACHED');
    setText('combat-count', `${latest.kills || 0} ${(latest.kills || 0) === 1 ? 'machine' : 'machines'} disabled`);
    if (zone !== previousZone) { setText('announcements', zone + '. ' + notice); previousZone = zone; }
    else if (notice !== previousNotice && /checkpoint/i.test(notice)) setText('announcements', notice);
    previousNotice = notice;
    syncOverlay();
  }
  function render(force = false, now = performance.now()) {
    CADRecykeArt.draw(context, latest);
    if (force || now - lastHud > 100 || latest.dead || latest.won) { hud(); lastHud = now; }
  }
  function input() {
    const result = { left: false, right: false, down: false, jump: false, fire: false, melee: false, swap: false, autoFire: $('auto-fire').checked };
    for (const code of keys) if (heldControls.has(mapping[code])) result[mapping[code]] = true;
    for (const { action } of pointers.values()) if (heldControls.has(action)) result[action] = true;
    for (const action of pulses) result[action] = true;
    pulses.clear(); return result;
  }
  function frame(now) {
    const dt = lastTime === null ? 0 : Math.min(.05, Math.max(0, (now - lastTime) / 1000)); lastTime = now;
    game.update(dt, input()); latest = game.snapshot(); render(false, now);
    requestAnimationFrame(frame);
  }
  window.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    if (dialog.open) {
      if (event.code === 'KeyR' && !event.repeat) { event.preventDefault(); reset(overlay === 'dead'); }
      else if (event.code === 'KeyP' && overlay === 'paused' && !event.repeat) { event.preventDefault(); pause(false); }
      return;
    }
    if (isForm(event.target)) return;
    if (event.code === 'KeyP' || event.code === 'Escape') { event.preventDefault(); if (!event.repeat) pause(); return; }
    const action = mapping[event.code]; if (!action) return;
    event.preventDefault();
    if (!event.repeat && !heldControls.has(action)) pulses.add(action);
    keys.add(event.code);
  });
  window.addEventListener('keyup', event => { if (mapping[event.code]) keys.delete(event.code); });
  document.addEventListener('focusin', event => { if (isForm(event.target)) clearInput(); });
  function releasePointer(event) {
    const record = pointers.get(event.pointerId); if (!record) return;
    pointers.delete(event.pointerId);
    if (!Array.from(pointers.values()).some(value => value.button === record.button)) delete record.button.dataset.held;
  }
  for (const button of controls) {
    button.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault(); if (latest.paused || latest.dead || latest.won) return;
      const action = button.dataset.control; pointers.set(event.pointerId, { action, button });
      button.dataset.held = 'true'; button.setPointerCapture(event.pointerId);
      if (!heldControls.has(action)) pulses.add(action);
    });
    button.addEventListener('pointerup', releasePointer);
    button.addEventListener('pointercancel', releasePointer);
    button.addEventListener('lostpointercapture', releasePointer);
    button.addEventListener('contextmenu', event => event.preventDefault());
    // Assistive technology can activate a button without a pointer event.
    button.addEventListener('click', event => {
      if (event.detail !== 0 || latest.paused || latest.dead || latest.won) return;
      pulses.add(button.dataset.control); focusGame();
    });
  }
  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);
  window.addEventListener('blur', () => { clearInput(); if (!latest.won && !latest.dead) pause(true); lastTime = null; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); if (!latest.won && !latest.dead) pause(true); } lastTime = null; });
  $('pause-button').addEventListener('click', () => pause());
  $('restart-button').addEventListener('click', () => reset(false));
  $('dialog-primary').addEventListener('click', () => { if (overlay === 'paused') pause(false); else reset(overlay === 'dead'); });
  $('dialog-restart').addEventListener('click', () => reset(false));
  dialog.addEventListener('cancel', event => { event.preventDefault(); if (overlay === 'paused') pause(false); });
  $('auto-fire').addEventListener('change', () => { clearInput(); focusGame(); });
  for (const button of document.querySelectorAll('[data-size]')) button.addEventListener('click', () => {
    const next = button.dataset.size;
    if (next === size) { focusGame(); return; }
    clearInput(); size = next; game = CADRecykeLevel.create({ size, hero }); latest = game.snapshot();
    closeOverlay(); syncChoices(); fit(); render(true); lastTime = null; stage.scrollLeft = 0; focusGame();
    setText('announcements', `${'Mini'} version. A new shift begins.`);
  });
  for (const button of document.querySelectorAll('[data-hero]')) button.addEventListener('click', () => {
    clearInput(); hero = button.dataset.hero; game.setHero(hero); latest = game.snapshot(); syncChoices(); render(true); focusGame();
  });
  new ResizeObserver(fit).observe(stage);
  window.addEventListener('resize', fit);
  stage.addEventListener('scroll', () => CADPixelGrid.alignScene(canvas), { passive: true });
  Object.defineProperty(window, 'CADRecykeApp', { value: Object.freeze({ get game() { return game; }, snapshot: () => game.snapshot(), get grid() { return grid; } }), writable: false });
  syncChoices(); fit(); render(true); requestAnimationFrame(frame);
})();
