/* Shared presentation for complete pixel-art scenes. Source geometry and
   gameplay coordinates stay native; only the finished scene is enlarged. */
(() => {
  'use strict';
  if (!window.CADPixelGrid) return;
  let queued = false;
  const scenes = [...document.querySelectorAll('canvas[data-pixel-scene]')];
  const number = value => Number.parseFloat(value) || 0;

  function contentWidth(element) {
    const style = getComputedStyle(element);
    return Math.max(0, element.clientWidth - number(style.paddingLeft) - number(style.paddingRight));
  }

  function viewport() {
    return { width: document.documentElement.clientWidth, height: window.innerHeight };
  }

  function limits(canvas) {
    const mode = canvas.dataset.pixelScene, view = viewport();
    if (mode === 'wallpaper') return { availableWidth: view.width, availableHeight: view.height };
    if (mode === 'game') {
      const shell = canvas.closest('.game-shell'), style = getComputedStyle(shell);
      return {
        availableWidth: Math.max(1, view.width - number(style.paddingLeft) - number(style.paddingRight)),
        availableHeight: Math.max(1, view.height - number(style.paddingTop) - number(style.paddingBottom))
      };
    }
    return {
      availableWidth: contentWidth(canvas.parentElement),
      availableHeight: canvas.dataset.pixelHeight ? Number(canvas.dataset.pixelHeight) : Infinity
    };
  }

  function render() {
    queued = false;
    const dpr = window.devicePixelRatio || 1;
    const visible = scenes.filter(canvas => canvas.getClientRects().length);
    const groups = new Map();
    for (const canvas of visible) {
      const group = canvas.dataset.pixelGroup;
      if (group) {
        const bounds = limits(canvas);
        const fit = CADPixelGrid.fitScale(canvas, bounds.availableWidth, bounds.availableHeight, dpr);
        groups.set(group, Math.min(groups.get(group) ?? Infinity, fit));
      }
    }
    for (const canvas of visible) {
      const mode = canvas.dataset.pixelScene, bounds = limits(canvas);
      let scale = groups.get(canvas.dataset.pixelGroup);
      if (mode === 'wallpaper') {
        scale = Math.max(1, Math.ceil(Math.max(bounds.availableWidth * dpr / canvas.width,
          bounds.availableHeight * dpr / canvas.height)));
        Object.assign(canvas.style, { inset: 'auto', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' });
      }
      const result = CADPixelGrid.applyScene(canvas, { ...bounds, dpr, scale });
      canvas.dataset.pixelScale = String(result.scale);
      if (mode === 'game') {
        const frame = canvas.parentElement;
        // Keep controls and the game message attached to the fitted scene.
        // Portrait touch controls already use the viewport in play.css.
        Object.assign(frame.style, { width: result.cssWidth + 'px', height: result.cssHeight + 'px', border: '0' });
        frame.style.outline = '1px solid #21172e';
        const shell = canvas.closest('.game-shell');
        const portrait = matchMedia('(orientation: portrait) and (max-width: 900px)').matches;
        const look = shell.querySelector('.look-zone');
        if (look) {
          look.style.height = portrait ? result.cssHeight + 'px' : '';
          look.style.width = portrait ? result.cssWidth * .68 + 'px' : '';
          look.style.right = portrait ? (bounds.availableWidth - result.cssWidth) / 2 + 'px' : '';
        }
      } else if (mode !== 'wallpaper') {
        const holder = canvas.parentElement;
        if (result.overflowX) {
          holder.style.overflowX = 'auto';
          if (getComputedStyle(holder).display === 'flex') holder.style.justifyContent = 'flex-start';
        } else {
          holder.style.overflowX = '';
          if (getComputedStyle(holder).display === 'flex' && holder.classList.contains('screen')) holder.style.justifyContent = 'center';
        }
      }
    }
    // Sizing one scene can move later scenes; align after every size is final.
    for (const canvas of visible) CADPixelGrid.alignScene(canvas, dpr);
  }

  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(render); }
  }

  const resize = new ResizeObserver(schedule);
  for (const parent of new Set(scenes.map(canvas => canvas.parentElement))) resize.observe(parent);
  const dimensions = new MutationObserver(schedule);
  for (const canvas of scenes) dimensions.observe(canvas, { attributes: true, attributeFilter: ['width', 'height'] });
  const shell = document.getElementById('gameShell');
  if (shell) {
    new MutationObserver(schedule).observe(shell, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(schedule).observe(document.getElementById('touchControls'), { childList: true });
  }
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  window.CADPixelScenes = Object.freeze({ refresh: schedule });
  schedule();
})();
