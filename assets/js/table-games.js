(() => {
  'use strict';

  function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(text, action, primary = false) {
    const node = element('button', `table-button${primary ? ' table-button-primary' : ''}`, text);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }

  function randomIndex(length) {
    return Math.floor(Math.random() * length);
  }

  function table(root, name) {
    const panel = element('div', 'table-game');
    const board = element('div', `table-board table-${name}`);
    const status = element('p', 'table-status');
    status.setAttribute('role', 'status');
    panel.append(board, status);
    root.replaceChildren(panel);
    return { panel, board, status };
  }

  function predict(label, labels, onChoose) {
    const controls = element('div', 'table-controls');
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', label);
    labels.forEach((text, index) => controls.append(button(text, () => onChoose(index))));
    return controls;
  }

  function lock(controls, busy) {
    for (const control of controls.children) {
      control.setAttribute('aria-disabled', String(busy));
    }
  }

  function animate(node, keyframes, duration) {
    if (typeof node.animate !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return Promise.resolve();
    }
    return node.animate(keyframes, { duration, easing: 'ease-in-out' }).finished.catch(() => {});
  }

  function luckyTicket({ root, options, reveal }) {
    const { panel, board, status } = table(root, 'ticket-board');
    const ticket = element('div', 'table-ticket');
    const face = element('div', 'table-ticket-face');
    const title = element('span', 'table-ticket-title', 'Lucky Ticket');
    const serial = element('span', 'table-ticket-serial');
    const stub = element('span', 'table-ticket-stub', 'Admit one');
    const controls = element('div', 'table-controls');
    let deck;
    let drawing = false;

    face.append(title, serial);
    ticket.append(face, stub);
    board.append(ticket);

    function showCount() {
      status.textContent = deck.length ? `${deck.length} ${deck.length === 1 ? 'ticket' : 'tickets'} left to draw.` : 'All tickets have been drawn. Shuffle the deck to play again.';
    }

    function reset() {
      if (drawing) return;
      deck = options.map((option, index) => ({ option, number: index + 1 }));
      serial.textContent = `${deck.length} tickets in the deck`;
      lock(controls, false);
      shuffleButton.disabled = true;
      showCount();
      reveal(null);
    }

    const drawButton = button('Draw a ticket', async () => {
      if (drawing || !deck.length) return;
      drawing = true;
      lock(controls, true);
      reveal(null);
      const [drawn] = deck.splice(randomIndex(deck.length), 1);
      serial.textContent = `No. ${String(drawn.number).padStart(2, '0')}`;
      await animate(ticket, [
        { transform: 'translateY(.8rem) rotate(-7deg)', opacity: .45 },
        { transform: 'translateY(-.3rem) rotate(2deg)', opacity: 1, offset: .72 },
        { transform: 'translateY(0) rotate(-3deg)', opacity: 1 },
      ], 430);
      if (!root.contains(panel)) return;
      drawing = false;
      lock(controls, false);
      drawButton.setAttribute('aria-disabled', String(!deck.length));
      shuffleButton.disabled = false;
      showCount();
      reveal(drawn.option);
    }, true);

    const shuffleButton = button('Shuffle all tickets', () => {
      if (drawing) return;
      drawButton.focus();
      reset();
    });
    controls.append(drawButton, shuffleButton);
    panel.append(controls);
    reset();
  }

  function coinToss({ root, options, reveal }) {
    const { panel, board, status } = table(root, 'coin-board');
    const coin = element('div', 'table-coin');
    coin.setAttribute('aria-hidden', 'true');
    coin.append(element('span', 'table-coin-face table-coin-heads', 'H'), element('span', 'table-coin-face table-coin-tails', 'T'));
    board.append(coin);
    let tossing = false;
    let face = 0;
    const sides = ['Heads', 'Tails'];
    const controls = predict('Call the coin toss', ['Call heads', 'Call tails'], async call => {
      if (tossing) return;
      tossing = true;
      lock(controls, true);
      status.textContent = 'The coin is in the air.';
      reveal(null);
      const outcome = randomIndex(2);
      await animate(coin, [
        { transform: `translateY(0) rotateY(${face * 180}deg)` },
        { transform: 'translateY(-2.2rem) rotateY(630deg)', offset: .47 },
        { transform: `translateY(0) rotateY(${1080 + outcome * 180}deg)` },
      ], 640);
      if (!root.contains(panel)) return;
      face = outcome;
      coin.style.transform = `rotateY(${face * 180}deg)`;
      status.textContent = face === call ? `${sides[face]}. You called it.` : `${sides[face]}. You called ${sides[call].toLowerCase()}.`;
      tossing = false;
      lock(controls, false);
      reveal(options[randomIndex(options.length)]);
    });
    status.textContent = 'Choose a side to toss the coin.';
    panel.append(controls);
    reveal(null);
  }

  const pipLayouts = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];

  function die(label, initial) {
    const group = element('div', 'table-die-group');
    const shape = element('div', 'table-die');
    shape.setAttribute('aria-hidden', 'true');
    const pips = Array.from({ length: 9 }, () => element('span', 'table-pip'));
    shape.append(...pips);
    group.append(shape, element('span', 'table-die-label', label));
    function show(value) {
      pips.forEach((pip, index) => pip.classList.toggle('table-pip-visible', pipLayouts[value].includes(index)));
    }
    show(initial);
    return { group, shape, show };
  }

  function diceDuel({ root, options, reveal }) {
    const { panel, board, status } = table(root, 'dice-board');
    const player = die('You', 3);
    const house = die('House', 4);
    board.append(player.group, house.group);
    let rolling = false;
    const predictions = [1, 0, -1];
    const controls = predict('Predict your roll against the house', ['Higher', 'Tie', 'Lower'], async choice => {
      if (rolling) return;
      rolling = true;
      lock(controls, true);
      status.textContent = 'Both dice are rolling.';
      reveal(null);
      const yourRoll = 1 + randomIndex(6);
      const houseRoll = 1 + randomIndex(6);
      const playerShake = [
        { transform: 'rotate(-7deg)' },
        { transform: 'translate(.35rem, -.9rem) rotate(35deg)' },
        { transform: 'translate(-.4rem, -.4rem) rotate(-32deg)' },
        { transform: 'rotate(-7deg)' },
      ];
      const houseShake = [
        { transform: 'rotate(8deg)' },
        { transform: 'translate(-.55rem, -.6rem) rotate(-42deg)' },
        { transform: 'translate(.45rem, -.9rem) rotate(30deg)' },
        { transform: 'rotate(8deg)' },
      ];
      await Promise.all([animate(player.shape, playerShake, 490), animate(house.shape, houseShake, 570)]);
      if (!root.contains(panel)) return;
      player.show(yourRoll);
      house.show(houseRoll);
      const calledIt = Math.sign(yourRoll - houseRoll) === predictions[choice];
      status.textContent = `You rolled ${yourRoll}. The house rolled ${houseRoll}. ${calledIt ? 'You called it.' : 'Try another call.'}`;
      rolling = false;
      lock(controls, false);
      reveal(options[randomIndex(options.length)]);
    });
    status.textContent = 'Will your roll be higher than the house, lower, or a tie?';
    panel.append(controls);
    reveal(null);
  }

  function shellShuffle({ root, options, reveal }) {
    const { panel, board, status } = table(root, 'shell-board');
    const controls = element('div', 'table-controls');
    const transcript = element('details', 'table-shuffle-log');
    const clue = element('p', 'table-shuffle-clue');
    transcript.append(element('summary', 'table-shuffle-summary', 'Read the shuffle'), clue);
    const pairs = [[0, 1], [0, 2], [1, 2]];
    let prizes;
    let tokenIndex;
    let phase;

    const shells = Array.from({ length: 3 }, (_, index) => {
      const pick = element('button', 'table-shell-slot');
      pick.type = 'button';
      pick.setAttribute('aria-label', `Pick shell ${index + 1}`);
      const shell = element('span', 'table-shell');
      const token = element('span', 'table-shell-token');
      shell.setAttribute('aria-hidden', 'true');
      token.setAttribute('aria-hidden', 'true');
      pick.append(token, shell, element('span', 'table-shell-number', String(index + 1)));
      pick.addEventListener('click', () => {
        if (phase !== 'pick') return;
        phase = 'finished';
        pick.classList.add('table-shell-picked');
        shells[tokenIndex].pick.classList.add('table-shell-show-token');
        shells.forEach(item => item.pick.setAttribute('aria-disabled', 'true'));
        shuffle.setAttribute('aria-disabled', 'false');
        shuffle.textContent = 'Set up a new round';
        status.textContent = tokenIndex === index ? 'You found the token.' : `The token was under shell ${tokenIndex + 1}.`;
        reveal(prizes[index]);
      });
      return { pick, shell };
    });

    function reset() {
      phase = 'peek';
      tokenIndex = randomIndex(shells.length);
      const remaining = [...options];
      prizes = shells.map(() => {
        if (remaining.length) return remaining.splice(randomIndex(remaining.length), 1)[0];
        return options[randomIndex(options.length)];
      });
      shells.forEach(({ pick }, index) => {
        pick.disabled = true;
        pick.removeAttribute('aria-disabled');
        pick.classList.remove('table-shell-picked');
        pick.classList.toggle('table-shell-show-token', tokenIndex === index);
      });
      shuffle.textContent = 'Shuffle the shells';
      transcript.hidden = true;
      transcript.open = false;
      status.textContent = `The token starts under shell ${tokenIndex + 1}.`;
      reveal(null);
    }

    async function swap(left, right) {
      const a = shells[left].shell;
      const b = shells[right].shell;
      const distance = b.getBoundingClientRect().left - a.getBoundingClientRect().left;
      await Promise.all([
        animate(a, [
          { transform: 'translate(0, 0)' },
          { transform: `translate(${distance / 2}px, -.8rem)` },
          { transform: `translate(${distance}px, 0)` },
        ], 260),
        animate(b, [
          { transform: 'translate(0, 0)' },
          { transform: `translate(${-distance / 2}px, .75rem)` },
          { transform: `translate(${-distance}px, 0)` },
        ], 260),
      ]);
      if (tokenIndex === left) tokenIndex = right;
      else if (tokenIndex === right) tokenIndex = left;
      [prizes[left], prizes[right]] = [prizes[right], prizes[left]];
    }

    const shuffle = button('Shuffle the shells', async () => {
      if (phase === 'finished') {
        reset();
        return;
      }
      if (phase !== 'peek') return;
      phase = 'mix';
      const startingShell = tokenIndex + 1;
      const swaps = [];
      shells[tokenIndex].pick.classList.remove('table-shell-show-token');
      shuffle.setAttribute('aria-disabled', 'true');
      shuffle.textContent = 'Shuffling…';
      status.textContent = 'Follow the shell with the token.';
      for (let step = 0; step < 4; step += 1) {
        const allowed = pairs.filter(pair => pair !== swaps.at(-1));
        const pair = allowed[randomIndex(allowed.length)];
        swaps.push(pair);
        await swap(...pair);
        if (!root.contains(panel)) return;
      }
      const moves = swaps.map(([left, right]) => `${left + 1} with ${right + 1}`).join(', then ');
      clue.textContent = `The token started under shell ${startingShell}. Shells switched ${moves}.`;
      transcript.hidden = false;
      phase = 'pick';
      status.textContent = 'Choose the shell hiding the token.';
      shuffle.textContent = 'Set up a new round';
      shells.forEach(({ pick }) => { pick.disabled = false; });
      shells[0].pick.focus({ preventScroll: true });
    }, true);

    controls.append(shuffle);
    board.append(...shells.map(item => item.pick));
    panel.append(controls, transcript);
    reset();
  }

  globalThis.CarnivalExtras ??= {};
  Object.assign(globalThis.CarnivalExtras, {
    'lucky-ticket': luckyTicket,
    'coin-toss': coinToss,
    'dice-duel': diceDuel,
    'shell-shuffle': shellShuffle,
  });
})();
