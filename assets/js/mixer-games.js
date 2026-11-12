(() => {
  'use strict';

  const fallbackPrompts = ['Find an idea worth borrowing.', 'Try a different route.', 'Find something worth sharing.'];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(className, text) {
    const node = element('button', className, text);
    node.type = 'button';
    return node;
  }

  function decorative(className) {
    const node = element('span', className);
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function shuffled(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const draw = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[draw]] = [copy[draw], copy[index]];
    }
    return copy;
  }

  function drawFrom(items) {
    let pile = [];
    let previous;
    return () => {
      if (!pile.length) {
        pile = shuffled(items);
        if (pile.length > 1 && pile[0] === previous) pile.push(pile.shift());
      }
      previous = pile.shift();
      return previous;
    };
  }

  function choicesFor(items, count) {
    const draw = drawFrom(items);
    return Array.from({ length: count }, draw);
  }

  function gameFrame(root, variant, instruction, replayLabel) {
    const booth = element('section', `mix-game mix-${variant}`);
    const message = element('p', 'mix-message', instruction);
    message.setAttribute('role', 'status');
    const tray = element('div', `mix-tray mix-${variant}-tray`);
    const replay = button('mix-replay', replayLabel);
    const actions = element('div', 'mix-actions');
    replay.hidden = true;
    actions.append(replay);
    booth.append(message, tray, actions);
    root.replaceChildren(booth);
    return { message, tray, replay };
  }

  function lockChoices(choices, locked) {
    for (const choice of choices) {
      if (locked) choice.setAttribute('aria-disabled', 'true');
      else choice.removeAttribute('aria-disabled');
      choice.tabIndex = locked && choice.getAttribute('aria-pressed') !== 'true' ? -1 : 0;
    }
  }

  function postcardPair({ root, options, prompts = [], reveal }) {
    const instruction = 'Draw a destination and a way to explore it.';
    const { message, tray, replay } = gameFrame(root, 'postcards', instruction, 'Start a new pair');
    const destinationDraw = drawFrom(options);
    const promptDraw = drawFrom(prompts.length ? prompts : fallbackPrompts);
    let destination;
    let prompt;

    const destinationCard = button('mix-postcard mix-destination');
    const promptCard = button('mix-postcard mix-action');
    const destinationLabel = element('span', 'mix-card-caption', 'Destination');
    const promptLabel = element('span', 'mix-card-caption', 'Action');
    const destinationValue = element('strong', 'mix-card-value');
    const promptValue = element('strong', 'mix-card-value');
    destinationCard.append(destinationLabel, destinationValue);
    promptCard.append(promptLabel, promptValue);

    function update() {
      destinationValue.textContent = destination?.label || 'Draw a place';
      promptValue.textContent = prompt || 'Draw an action';
      destinationCard.classList.toggle('mix-filled', Boolean(destination));
      promptCard.classList.toggle('mix-filled', Boolean(prompt));
      replay.hidden = !destination && !prompt;
      if (destination && prompt) {
        message.textContent = 'Your pair is ready. Draw either card again to try a different pairing.';
        reveal(destination, prompt);
      } else {
        message.textContent = destination ? 'Now draw an action.' : prompt ? 'Now draw a destination.' : instruction;
        reveal(null);
      }
    }

    destinationCard.addEventListener('click', () => { destination = destinationDraw(); update(); });
    promptCard.addEventListener('click', () => { prompt = promptDraw(); update(); });
    replay.addEventListener('click', () => {
      destination = undefined;
      prompt = undefined;
      update();
      destinationCard.focus();
    });
    tray.append(destinationCard, promptCard);
    update();
  }

  function fortuneCookie({ root, options, prompts = [], reveal }) {
    const instruction = 'Pick a cookie to crack open its fortune.';
    const { message, tray, replay } = gameFrame(root, 'fortune', instruction, 'Serve fresh cookies');
    const strip = element('p', 'mix-fortune-strip');
    strip.setAttribute('aria-hidden', 'true');
    const promptDraw = prompts.length ? drawFrom(prompts) : null;
    let fortunes;
    let cracked = false;

    const cookies = Array.from({ length: 3 }, (_, index) => {
      const cookie = button('mix-cookie');
      const biscuit = decorative('mix-biscuit');
      biscuit.append(decorative('mix-biscuit-half'), decorative('mix-biscuit-half'));
      cookie.append(biscuit, element('span', 'mix-choice-label', `Cookie ${index + 1}`));
      cookie.setAttribute('aria-pressed', 'false');
      cookie.addEventListener('click', () => {
        if (cracked) return;
        cracked = true;
        cookie.setAttribute('aria-pressed', 'true');
        lockChoices(cookies, true);
        const option = fortunes[index];
        const prompt = promptDraw?.();
        strip.textContent = prompt || option.label;
        strip.hidden = false;
        message.textContent = 'Your fortune is open.';
        replay.hidden = false;
        reveal(option, prompt);
      });
      return cookie;
    });

    function reset() {
      fortunes = choicesFor(options, cookies.length);
      cracked = false;
      for (const cookie of cookies) cookie.setAttribute('aria-pressed', 'false');
      lockChoices(cookies, false);
      strip.hidden = true;
      replay.hidden = true;
      message.textContent = instruction;
      reveal(null);
    }

    replay.addEventListener('click', () => { reset(); cookies[0].focus(); });
    tray.append(...cookies);
    tray.after(strip);
    reset();
  }

  function mysteryDoors({ root, options, reveal }) {
    const instruction = 'Open a door to find the destination behind it.';
    const { message, tray, replay } = gameFrame(root, 'doors', instruction, 'Shuffle the doors');
    let destinations;
    let opened = false;
    const doors = Array.from({ length: 3 }, (_, index) => {
      const door = button('mix-door');
      const casing = decorative('mix-door-casing');
      casing.append(decorative('mix-door-leaf'));
      door.append(casing, element('span', 'mix-choice-label', `Door ${index + 1}`));
      door.setAttribute('aria-pressed', 'false');
      door.addEventListener('click', () => {
        if (opened) return;
        opened = true;
        door.setAttribute('aria-pressed', 'true');
        lockChoices(doors, true);
        message.textContent = `Door ${index + 1} is open.`;
        replay.hidden = false;
        reveal(destinations[index]);
      });
      return door;
    });

    function reset() {
      destinations = choicesFor(options, doors.length);
      opened = false;
      for (const door of doors) door.setAttribute('aria-pressed', 'false');
      lockChoices(doors, false);
      message.textContent = instruction;
      replay.hidden = true;
      reveal(null);
    }

    replay.addEventListener('click', () => { reset(); doors[0].focus(); });
    tray.append(...doors);
    reset();
  }

  function constellationDraw({ root, options, prompts = [], reveal }) {
    const instruction = 'Connect two stars to draw a destination and an action.';
    const { message, tray, replay } = gameFrame(root, 'stars', instruction, 'Draw a new sky');
    const points = [[17, 54], [30, 27], [47, 69], [63, 22], [82, 55]];
    const beam = decorative('mix-beam');
    const selected = [];
    let destinations;
    let actions;

    function connect() {
      if (selected.length !== 2) return;
      const [start, end] = selected.map(index => points[index]);
      const x = (end[0] - start[0]) / 100 * tray.clientWidth;
      const y = (end[1] - start[1]) / 100 * tray.clientHeight;
      beam.style.left = `${start[0]}%`;
      beam.style.top = `${start[1]}%`;
      beam.style.width = `${Math.hypot(x, y)}px`;
      beam.style.rotate = `${Math.atan2(y, x)}rad`;
    }

    const stars = points.map(([left, top], index) => {
      const star = button('mix-star');
      star.setAttribute('aria-label', `Choose star ${index + 1}`);
      star.setAttribute('aria-pressed', 'false');
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      star.append(decorative('mix-star-light'));
      star.addEventListener('click', () => {
        if (selected.length === 2 || selected.includes(index)) return;
        selected.push(index);
        star.setAttribute('aria-pressed', 'true');
        if (selected.length === 1) {
          message.textContent = 'Choose a second star to finish the constellation.';
        } else {
          beam.hidden = false;
          connect();
          lockChoices(stars, true);
          replay.hidden = false;
          message.textContent = 'Your constellation is complete.';
          reveal(destinations[selected[0]], actions[selected[1]]);
        }
      });
      return star;
    });

    function reset() {
      destinations = choicesFor(options, points.length);
      actions = choicesFor(prompts.length ? prompts : fallbackPrompts, points.length);
      selected.length = 0;
      for (const star of stars) star.setAttribute('aria-pressed', 'false');
      lockChoices(stars, false);
      beam.hidden = true;
      message.textContent = instruction;
      replay.hidden = true;
      reveal(null);
    }

    replay.addEventListener('click', () => { reset(); stars[0].focus(); });
    tray.append(beam, ...stars);
    if (typeof ResizeObserver === 'function') new ResizeObserver(connect).observe(tray);
    reset();
  }

  globalThis.CarnivalExtras ||= {};
  Object.assign(globalThis.CarnivalExtras, {
    'postcard-pair': postcardPair,
    'fortune-cookie': fortuneCookie,
    'mystery-doors': mysteryDoors,
    'constellation-draw': constellationDraw,
  });
})();
