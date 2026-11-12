(() => {
  'use strict';

  const parameters = new URLSearchParams(location.search);
  const requested = parameters.get('game');
  const rotating = requested === 'featured';
  const game = Carnival.gameForRequest(requested);
  const settings = Carnival.readSettings(location.hash);
  const heading = document.querySelector('#play-title');
  const root = document.querySelector('#game-root');
  const draw = document.querySelector('#draw');
  const drawName = document.querySelector('#draw-name');
  const drawPrompt = document.querySelector('#draw-prompt');
  const drawLink = document.querySelector('#draw-link');

  heading.textContent = settings.title || game.name;
  if (parameters.get('embed') !== '1') {
    const icon = document.querySelector('#play-icon');
    icon.src = Carnival.iconPath(game.id);
    icon.hidden = false;
  }
  document.title = `${heading.textContent} | Carnival of Opportunities`;
  document.querySelector('#play-description').textContent = game.description;
  document.querySelector('#featured-note').hidden = !rotating;
  document.querySelector('#edit-game').href = `embed.html?game=${rotating ? 'featured' : game.id}${location.hash}`;

  function reveal(option, prompt = '') {
    draw.hidden = !option;
    drawName.textContent = option?.label || '';
    drawPrompt.textContent = prompt;
    drawPrompt.hidden = !prompt;
    drawLink.hidden = !option?.url;
    if (option?.url) drawLink.href = option.url;
    else drawLink.removeAttribute('href');
  }

  if (game.id === 'orbit-wheel') {
    const frame = document.createElement('iframe');
    frame.className = 'wheel-frame';
    frame.title = 'Orbit Wheel';
    const wheelUrl = new URL('games/orbit-wheel.html?v=2', location.href);
    const wheelSettings = new URLSearchParams({ embed: '1', compact: '1', turns: settings.turns });
    for (const option of settings.options) wheelSettings.append('option', option.label);
    wheelUrl.hash = `wheel?${wheelSettings}`;
    frame.src = wheelUrl.href;
    window.addEventListener('message', event => {
      const wheelOrigin = location.protocol === 'file:' ? 'null' : location.origin;
      if (event.source !== frame.contentWindow || event.origin !== wheelOrigin) return;
      const { type, index, height } = event.data || {};
      if (type === 'carnival:wheel-start') reveal(null);
      if (type === 'carnival:wheel-result' && Number.isInteger(index)) reveal(settings.options[index]);
      if (type === 'carnival:wheel-size' && Number.isFinite(height) && height >= 250 && height <= 1000) {
        frame.style.height = `${Math.ceil(height)}px`;
      }
    });
    root.append(frame);
    return;
  }

  const gameContext = { id: game.id, root, options: settings.options, prompts: settings.prompts, reveal };
  const mount = globalThis.CarnivalExtras?.[game.id] || CarnivalGames.mount;
  mount(gameContext);
})();
