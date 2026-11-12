(function () {
  'use strict';

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(className, text, label) {
    const node = element('button', className, text);
    node.type = 'button';
    if (label) node.setAttribute('aria-label', label);
    return node;
  }

  function decoration(className) {
    const node = element('span', className);
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function deal(items, count) {
    const pool = [...items];
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const draw = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[draw]] = [pool[draw], pool[index]];
    }
    return Array.from({ length: count }, (_, index) => pool[index % pool.length]);
  }

  function markChoice(choices, selected) {
    choices.forEach(choice => {
      choice.classList.toggle('booth-chosen', choice === selected);
      choice.tabIndex = selected && choice !== selected ? -1 : 0;
      if (selected) choice.setAttribute('aria-disabled', 'true');
      else choice.removeAttribute('aria-disabled');
    });
  }

  function duckPond({ root, options, reveal }) {
    const board = element('div', 'booth-pond');
    const actions = element('div', 'booth-actions');
    const replay = button('booth-replay', 'Reshuffle the pond');
    let prizes;
    let picked = false;

    const ducks = Array.from({ length: 6 }, (_, index) => {
      const duck = button('booth-duck-choice', undefined, `Pick duck ${index + 1}`);
      const shape = decoration('booth-duck');
      shape.append(decoration('booth-duck-body'), decoration('booth-duck-head'));
      duck.append(shape);
      duck.addEventListener('click', () => {
        if (picked) return;
        picked = true;
        markChoice(ducks, duck);
        replay.hidden = false;
        reveal(prizes[index]);
      });
      return duck;
    });

    function reset() {
      prizes = deal(options, ducks.length);
      picked = false;
      markChoice(ducks, null);
      replay.hidden = true;
      reveal(null);
    }

    replay.addEventListener('click', () => {
      reset();
      ducks[0].focus();
    });
    board.append(...ducks);
    actions.append(replay);
    root.replaceChildren(board, actions);
    reset();
  }

  function pegDrop({ root, options, reveal }) {
    const laneCount = 5;
    const binCount = Math.min(7, options.length);
    const lanes = element('div', 'booth-lanes');
    lanes.setAttribute('role', 'group');
    lanes.setAttribute('aria-label', 'Release lanes');
    const board = element('div', 'booth-drop');
    board.setAttribute('aria-hidden', 'true');
    const pegs = element('div', 'booth-pegs');
    const bins = element('div', 'booth-bins');
    const token = decoration('booth-token');
    let falling = false;
    let animation;

    for (let row = 0; row < 7; row += 1) {
      const line = element('div', 'booth-peg-row');
      for (let column = 0; column < 7 + row % 2; column += 1) {
        line.append(decoration('booth-peg'));
      }
      pegs.append(line);
    }

    const pockets = Array.from({ length: binCount }, () => decoration('booth-bin'));
    bins.append(...pockets);
    board.append(pegs, bins, token);
    token.hidden = true;

    function draw(lane) {
      const center = Math.round((options.length - 1) * lane / (laneCount - 1));
      const spread = Math.max(1, Math.ceil(options.length / 5));
      // A lane favors nearby outcomes while leaving every ticket reachable.
      if (Math.random() < 0.2) return Math.floor(Math.random() * options.length);
      const first = Math.max(0, center - spread);
      const last = Math.min(options.length - 1, center + spread);
      return first + Math.floor(Math.random() * (last - first + 1));
    }

    function drop(lane) {
      if (falling) return;
      falling = true;
      animation?.cancel();
      markChoice(releases, releases[lane]);
      pockets.forEach(pocket => pocket.classList.remove('booth-landing'));
      reveal(null);
      token.hidden = false;

      const index = draw(lane);
      const pocket = Math.floor(index * binCount / options.length);
      const startX = (lane + 0.5) * 100 / laneCount;
      const endX = (pocket + 0.5) * 100 / binCount;
      const stops = [{ left: `${startX}%`, top: '5%' }];
      for (let step = 1; step <= 7; step += 1) {
        const progress = step / 8;
        const offset = (Math.random() - 0.5) * 24;
        const x = Math.max(6, Math.min(94, startX + (endX - startX) * progress + offset));
        stops.push({ left: `${x}%`, top: `${9 + step * 10}%` });
      }
      stops.push({ left: `${endX}%`, top: '91%' });

      function finish() {
        if (!root.contains(board)) return;
        token.style.left = `${endX}%`;
        token.style.top = '91%';
        animation?.cancel();
        animation = undefined;
        pockets[pocket].classList.add('booth-landing');
        markChoice(releases, null);
        falling = false;
        reveal(options[index]);
      }

      if (matchMedia('(prefers-reduced-motion: reduce)').matches || typeof token.animate !== 'function') {
        finish();
      } else {
        animation = token.animate(stops, { duration: 1020, fill: 'forwards' });
        animation.finished.then(finish, () => {});
      }
    }

    const releases = Array.from({ length: laneCount }, (_, index) => {
      const release = button('booth-lane', String(index + 1), `Drop from lane ${index + 1}`);
      release.addEventListener('click', () => drop(index));
      return release;
    });
    lanes.append(...releases);
    root.replaceChildren(lanes, board);
    reveal(null);
  }

  function balloonMixer({ root, options, prompts, reveal }) {
    const board = element('div', 'booth-balloons');
    const actions = element('div', 'booth-actions');
    const replay = button('booth-replay', 'Refill the balloons');
    const availablePrompts = prompts.length ? prompts : ['Find a surprising detail', 'Share it with someone curious', 'Try a small experiment'];
    const selections = { project: null, action: null };

    function makePool(name, label, items, describe) {
      const section = element('fieldset', 'booth-balloon-pool');
      const group = element('div', 'booth-balloon-row');
      const picked = element('p', 'booth-balloon-result');
      picked.setAttribute('role', 'status');
      let prizes;

      const balloons = Array.from({ length: 3 }, (_, index) => {
        const balloon = button('booth-balloon-choice', undefined, `Pop ${name} balloon ${index + 1}`);
        balloon.append(decoration('booth-balloon'), decoration('booth-string'));
        balloon.addEventListener('click', () => {
          if (selections[name] !== null) return;
          selections[name] = prizes[index];
          markChoice(balloons, balloon);
          picked.textContent = describe(selections[name]);
          if (selections.project !== null && selections.action !== null) {
            reveal(selections.project, selections.action);
          }
        });
        return balloon;
      });

      group.append(...balloons);
      section.append(element('legend', 'booth-balloon-label', label), group, picked);
      return {
        section,
        first: balloons[0],
        reset() {
          selections[name] = null;
          prizes = deal(items, balloons.length);
          picked.textContent = '';
          markChoice(balloons, null);
        },
      };
    }

    const project = makePool('project', 'Pick a project', options, prize => prize.label);
    const action = makePool('action', 'Pick an action', availablePrompts, prompt => prompt);

    function reset() {
      project.reset();
      action.reset();
      reveal(null);
    }

    replay.addEventListener('click', () => {
      reset();
      project.first.focus();
    });
    board.append(project.section, action.section);
    actions.append(replay);
    root.replaceChildren(board, actions);
    reset();
  }

  const games = new Map([
    ['duck-pond', duckPond],
    ['peg-drop', pegDrop],
    ['balloon-mixer', balloonMixer],
  ]);

  window.CarnivalGames = {
    mount({ id, root, options = [], prompts = [], reveal }) {
      const game = games.get(id);
      if (!game || !root || typeof reveal !== 'function') return false;
      if (!options.length) {
        root.replaceChildren(element('p', 'booth-empty', 'Add a destination to play.'));
        reveal(null);
      } else {
        game({ root, options, prompts, reveal });
      }
      return true;
    },
  };
}());
