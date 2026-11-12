(function () {
  'use strict';

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function piece(className) {
    const node = element('span', className);
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function button(className, text) {
    const node = element('button', className, text);
    node.type = 'button';
    return node;
  }

  function stage(root, variant, reveal) {
    const game = element('div', 'aim-game');
    const board = element('div', `aim-board aim-${variant}`);
    const controls = element('div', 'aim-controls');
    const status = element('p', 'aim-status');
    status.setAttribute('role', 'status');
    game.append(board, controls, status);
    root.replaceChildren(game);
    reveal(null);
    return { board, controls, status };
  }

  function destination(options, position) {
    // Most draws favor the area of play. Every destination still has a chance.
    if (Math.random() < .24) return options[Math.floor(Math.random() * options.length)];
    const center = Math.round(position * (options.length - 1));
    const drift = Math.max(1, Math.floor(options.length / 6));
    const low = Math.max(0, center - drift);
    const high = Math.min(options.length - 1, center + drift);
    return options[low + Math.floor(Math.random() * (high - low + 1))];
  }

  function lanePosition(lane, count) {
    return (lane + .5) * 100 / count;
  }

  function nearbyLane(lane, count, driftChance) {
    if (Math.random() >= driftChance) return lane;
    if (lane === 0) return 1;
    if (lane === count - 1) return count - 2;
    return lane + (Math.random() < .5 ? -1 : 1);
  }

  function location(node, x, y) {
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;
  }

  async function animate(node, frames, duration) {
    if (motionPreference.matches || typeof node.animate !== 'function') return;
    const animation = node.animate(frames, { duration, fill: 'both' });
    try {
      await animation.finished;
    } finally {
      animation.cancel();
    }
  }

  function ringToss({ root, options, reveal }) {
    const { board, controls, status } = stage(root, 'ring-board', reveal);
    const targets = element('fieldset', 'aim-pegs');
    targets.append(element('legend', 'aim-sr-only', 'Aim at a peg'));
    const ring = piece('aim-ring');
    ring.hidden = true;
    const toss = button('aim-action', 'Toss ring');
    let busy = false;
    const count = 5;

    const pegs = Array.from({ length: count }, (_, index) => {
      const target = element('label', 'aim-peg-target');
      const radio = element('input', 'aim-sr-only');
      radio.type = 'radio';
      radio.name = 'aim-ring-peg';
      radio.value = String(index);
      radio.checked = index === 2;
      const peg = piece('aim-peg');
      const marker = element('span', 'aim-peg-label', `Peg ${index + 1}`);
      target.append(radio, peg, marker);
      radio.addEventListener('change', () => {
        pegs.forEach(item => item.classList.remove('aim-landed'));
        ring.hidden = true;
        reveal(null);
        status.textContent = `Aiming for peg ${index + 1}.`;
      });
      return target;
    });

    toss.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      toss.setAttribute('aria-disabled', 'true');
      targets.disabled = true;
      pegs.forEach(peg => peg.classList.remove('aim-landed'));
      const aim = Number(targets.querySelector('input:checked').value);
      const landing = nearbyLane(aim, count, .29);
      const endX = lanePosition(landing, count);
      reveal(null);
      status.textContent = 'Ring in the air…';
      ring.hidden = false;
      location(ring, 50, 87);
      await animate(ring, [
        { left: '50%', top: '87%', transform: 'translate(-50%, -50%) scale(1.22) rotate(-18deg)' },
        { left: `${(50 + endX) / 2}%`, top: '10%', transform: 'translate(-50%, -50%) scale(.9) rotate(18deg)', offset: .58 },
        { left: `${endX}%`, top: '54%', transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
      ], 620);
      location(ring, endX, 54);
      pegs[landing].classList.add('aim-landed');
      status.textContent = landing === aim ? `Direct hit on peg ${landing + 1}.` : `The ring drifted onto peg ${landing + 1}.`;
      targets.disabled = false;
      toss.removeAttribute('aria-disabled');
      busy = false;
      reveal(destination(options, landing / (count - 1)));
    });

    targets.append(...pegs);
    board.append(targets, ring);
    controls.append(toss);
    status.textContent = 'Choose a peg, then toss the ring.';
  }

  function coconutShy({ root, options, reveal }) {
    const { board, status } = stage(root, 'coconut-board', reveal);
    const ball = piece('aim-coconut-ball');
    ball.hidden = true;
    const count = 3;
    let busy = false;

    const coconuts = Array.from({ length: count }, (_, index) => {
      const target = button('aim-coconut-target', '');
      target.setAttribute('aria-label', `Throw at coconut ${index + 1}`);
      target.append(piece('aim-coconut'), element('span', 'aim-coconut-number', String(index + 1)));
      target.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        coconuts.forEach(coconut => {
          coconut.classList.remove('aim-knocked', 'aim-grazed');
          coconut.setAttribute('aria-disabled', 'true');
        });
        reveal(null);
        status.textContent = `Throwing at coconut ${index + 1}…`;
        const hit = Math.random() >= .24;
        const x = lanePosition(index, count);
        ball.hidden = false;
        location(ball, 50, 86);
        await animate(ball, [
          { left: '50%', top: '86%', transform: 'translate(-50%, -50%) scale(1.35)' },
          { left: `${x}%`, top: hit ? '44%' : '68%', transform: 'translate(-50%, -50%) scale(.72)' },
        ], 430);
        ball.hidden = true;
        target.classList.add(hit ? 'aim-knocked' : 'aim-grazed');
        status.textContent = hit ? `Coconut ${index + 1} is down. Pick another to throw again.` : 'The ball clipped the shelf. You still draw a prize.';
        coconuts.forEach(coconut => coconut.removeAttribute('aria-disabled'));
        busy = false;
        reveal(destination(options, index / (count - 1)));
      });
      return target;
    });

    board.append(...coconuts, ball);
    status.textContent = 'Choose a coconut to throw at it.';
  }

  function bellStriker({ root, options, reveal }) {
    const { board, controls, status } = stage(root, 'striker-board', reveal);
    const tower = element('div', 'aim-striker-tower');
    tower.setAttribute('aria-hidden', 'true');
    const track = element('div', 'aim-striker-track');
    const marker = piece('aim-striker-marker');
    const bell = piece('aim-striker-bell');
    track.append(marker);
    tower.append(bell, track);
    board.append(tower);
    const strike = button('aim-action', 'Ready the hammer');
    const manual = element('label', 'aim-manual-power');
    const powerLabel = element('span', '', 'Power');
    const powerInput = element('input', 'aim-range');
    powerInput.type = 'range';
    powerInput.min = '0';
    powerInput.max = '100';
    powerInput.value = '65';
    manual.append(powerLabel, powerInput);
    manual.hidden = !motionPreference.matches;
    controls.append(manual, strike);

    let frame;
    let start = null;
    let power = 0;

    function showPower(value) {
      marker.style.bottom = `${value}%`;
    }

    function aim(now) {
      if (!board.isConnected) return;
      power = Math.round(50 - 50 * Math.cos((now - start) * Math.PI / 620));
      showPower(power);
      frame = requestAnimationFrame(aim);
    }

    function strikeAt(selected) {
      const final = Math.min(100, Math.max(0, selected + Math.floor(Math.random() * 17) - 8));
      const rang = final >= 86;
      showPower(final);
      board.classList.toggle('aim-rang', rang);
      status.textContent = rang ? `Bell rung at ${final}% power.` : `${final}% power. Aim for 86% to ring the bell.`;
      reveal(destination(options, final / 100));
    }

    function updateManual() {
      const value = Number(powerInput.value);
      powerInput.setAttribute('aria-valuetext', `${value}% power`);
      board.classList.remove('aim-rang');
      showPower(value);
    }

    powerInput.addEventListener('input', () => {
      updateManual();
      reveal(null);
      status.textContent = `Power set to ${powerInput.value}%.`;
    });
    if (motionPreference.matches) {
      updateManual();
      strike.textContent = 'Swing hammer';
      status.textContent = 'Set the power, then swing the hammer.';
    } else {
      status.textContent = 'Ready the hammer, then strike as the marker enters the gold band.';
    }

    strike.addEventListener('click', () => {
      if (!manual.hidden) {
        strikeAt(Number(powerInput.value));
        return;
      }
      if (start === null) {
        reveal(null);
        board.classList.remove('aim-rang');
        start = performance.now();
        power = 0;
        showPower(power);
        frame = requestAnimationFrame(aim);
        strike.textContent = 'Strike now';
        status.textContent = 'The marker is moving. Strike in the gold band.';
        return;
      }
      cancelAnimationFrame(frame);
      start = null;
      strike.textContent = 'Ready the hammer';
      strikeAt(power);
    });
  }

  function prizeCrane({ root, options, reveal }) {
    const { board, controls, status } = stage(root, 'crane-board', reveal);
    const claw = piece('aim-crane-claw');
    const capsules = element('div', 'aim-capsules');
    capsules.setAttribute('aria-hidden', 'true');
    const count = 5;
    const pockets = Array.from({ length: count }, () => piece('aim-capsule'));
    capsules.append(...pockets);
    board.append(capsules, claw);

    const position = element('input', 'aim-range');
    position.type = 'range';
    position.min = '1';
    position.max = String(count);
    position.value = '3';
    const aimControl = element('label', 'aim-crane-control');
    aimControl.append(element('span', '', 'Claw position'), position);
    const lower = button('aim-action', 'Lower claw');
    controls.append(aimControl, lower);
    let busy = false;

    function move() {
      position.setAttribute('aria-valuetext', `Capsule ${position.value} of ${count}`);
      location(claw, lanePosition(Number(position.value) - 1, count), 30);
    }

    position.addEventListener('input', () => {
      move();
      pockets.forEach(pocket => pocket.classList.remove('aim-caught'));
      status.textContent = `Claw above capsule ${position.value}.`;
      reveal(null);
    });
    lower.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      position.disabled = true;
      lower.setAttribute('aria-disabled', 'true');
      pockets.forEach(pocket => pocket.classList.remove('aim-caught'));
      const lane = Number(position.value) - 1;
      const landing = nearbyLane(lane, count, .22);
      const startX = lanePosition(lane, count);
      const endX = lanePosition(landing, count);
      reveal(null);
      status.textContent = 'Lowering the claw…';
      await animate(claw, [
        { left: `${startX}%`, top: '30%' },
        { left: `${endX}%`, top: '76%', offset: .52 },
        { left: `${endX}%`, top: '76%', offset: .68 },
        { left: `${endX}%`, top: '30%' },
      ], 910);
      position.value = String(landing + 1);
      move();
      pockets[landing].classList.add('aim-caught');
      status.textContent = landing === lane ? `Capsule ${landing + 1} caught.` : `The claw drifted and caught capsule ${landing + 1}.`;
      position.disabled = false;
      lower.removeAttribute('aria-disabled');
      busy = false;
      reveal(destination(options, landing / (count - 1)));
    });
    move();
    status.textContent = 'Line up the claw with a capsule, then lower it.';
  }

  globalThis.CarnivalExtras ||= {};
  Object.assign(globalThis.CarnivalExtras, {
    'ring-toss': ringToss,
    'coconut-shy': coconutShy,
    'bell-striker': bellStriker,
    'prize-crane': prizeCrane,
  });
}());
