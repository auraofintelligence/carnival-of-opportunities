(() => {
  'use strict';

  const canonical = 'https://auraofintelligence.github.io/carnival-of-opportunities/';
  const repository = 'https://github.com/auraofintelligence/carnival-of-opportunities';
  const games = [
    { id: 'orbit-wheel', name: 'Orbit Wheel', category: 'chance', description: 'Set a fractional spin, then see what a small nudge of luck puts under the pointer.' },
    { id: 'duck-pond', name: 'Duck Pond', category: 'chance', description: 'Pick a floating duck to uncover the destination hiding underneath.' },
    { id: 'peg-drop', name: 'Peg Drop', category: 'aim', description: 'Choose a lane and follow a token as it bounces towards a landing slot.' },
    { id: 'balloon-mixer', name: 'Balloon Mixer', category: 'mix', prompts: true, description: 'Pop a balloon from each bunch to pair a destination with something to try there.' },
    { id: 'lucky-ticket', name: 'Lucky Ticket', category: 'chance', description: 'Draw from a stack of raffle tickets. Each destination comes up once before the stack is reset.' },
    { id: 'coin-toss', name: 'Coin Toss', category: 'chance', description: 'Call heads or tails, then flip a brass coin and see where it sends you.' },
    { id: 'dice-duel', name: 'Dice Duel', category: 'chance', description: 'Call higher, lower or a tie against the house, then roll a pair of dice.' },
    { id: 'shell-shuffle', name: 'Shell Shuffle', category: 'aim', description: 'Keep an eye on the hidden bead as three walnut shells trade places.' },
    { id: 'ring-toss', name: 'Ring Toss', category: 'aim', description: 'Pick a peg and toss a ring. A little drift can send it to a neighbour.' },
    { id: 'coconut-shy', name: 'Coconut Shy', category: 'aim', description: 'Take aim at the coconut stand and throw to knock a destination loose.' },
    { id: 'bell-striker', name: 'Bell Striker', category: 'aim', description: 'Time the strike and see how high the puck climbs on its way to the bell.' },
    { id: 'prize-crane', name: 'Prize Crane', category: 'aim', description: 'Slide the claw across a row of capsules, then lower it for a surprise.' },
    { id: 'postcard-pair', name: 'Postcard Pair', category: 'mix', prompts: true, description: 'Draw a place and a brief from two postcard decks. Keep one while you redraw the other.' },
    { id: 'fortune-cookie', name: 'Fortune Cookie', category: 'mix', prompts: true, description: 'Crack open a cookie for a destination and a small prompt to take with you.' },
    { id: 'mystery-doors', name: 'Mystery Doors', category: 'chance', description: 'Choose a door and see which corner of the network opens behind it.' },
    { id: 'constellation-draw', name: 'Constellation Draw', category: 'mix', prompts: true, description: 'Connect two stars to find a destination and something to do there.' },
  ];
  const destinations = [
    { label: 'Find an Aura project', url: 'https://auraofintelligence.github.io/find.html' },
    { label: 'Strange but True', url: 'https://auraofintelligence.github.io/strange-but-true/' },
    { label: 'Mutual Futures', url: 'https://auraofintelligence.github.io/mutual-futures/' },
    { label: 'Grain by Grain', url: 'https://auraofintelligence.github.io/grain-by-grain/' },
    { label: 'Explore an Aura pathway', url: 'https://auraofintelligence.github.io/pathways/index.html' },
    { label: 'GAJRA Earth', url: 'https://gajra.earth/' },
  ];
  const prompts = ['Find an idea worth borrowing.', 'Pick one thing you could try in ten minutes.', 'Make a connection to another project.', 'Find something you’d share with a friend.'];
  const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Brisbane', year: 'numeric', month: '2-digit', day: '2-digit' });

  function featuredAt(now = new Date()) {
    const parts = Object.fromEntries(dateFormatter.formatToParts(now).map(part => [part.type, part.value]));
    const date = `${parts.year}-${parts.month}-${parts.day}`;
    const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
    const index = ((day % games.length) + games.length) % games.length;
    return { date, id: games[index].id };
  }

  function featured(now = new Date()) {
    const today = featuredAt(now);
    const published = globalThis.CARNIVAL_FEATURED;
    return published?.date === today.date && published?.id === today.id ? published : today;
  }

  function gameById(id) {
    return games.find(game => game.id === id);
  }

  function gameForRequest(id) {
    return gameById(id === 'featured' ? featured().id : id) || games[0];
  }

  function iconPath(id) {
    return `assets/images/icons/${id}.webp`;
  }

  function startingStrength(value) {
    const turns = value === 'under-1' ? .5 : Number(value);
    return turns >= .25 && turns <= 3 ? String(Math.round(turns * 100) / 100) : '2';
  }

  function cleanText(value, limit) {
    return typeof value === 'string' ? Array.from(value.trim()).slice(0, limit).join('') : '';
  }

  function safeDestination(value) {
    if (typeof value !== 'string' || !value.trim() || value.length > 1024) return '';
    try {
      const url = new URL(value.trim());
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
    } catch {
      return '';
    }
  }

  function readSettings(hash) {
    let settings;
    try {
      settings = JSON.parse(new URLSearchParams(hash.slice(1)).get('settings') || '{}');
    } catch {
      settings = {};
    }
    const options = Array.isArray(settings?.options) ? settings.options.slice(0, 32).map(option => ({
      label: cleanText(option?.label, 80), url: safeDestination(option?.url),
    })).filter(option => option.label) : [];
    const customPrompts = Array.isArray(settings?.prompts) ? settings.prompts.slice(0, 24).map(prompt => cleanText(prompt, 120)).filter(Boolean) : [];
    return {
      title: cleanText(settings?.title, 80),
      options: options.length >= 2 ? options : destinations,
      prompts: customPrompts.length ? customPrompts : prompts,
      turns: startingStrength(settings?.turns),
    };
  }

  function playerUrl(base, id, settings, embed = true) {
    const url = new URL('play.html', base);
    url.searchParams.set('game', id);
    if (embed) url.searchParams.set('embed', '1');
    if (settings) url.hash = new URLSearchParams({ settings: JSON.stringify(settings) }).toString();
    return url;
  }

  globalThis.Carnival = { canonical, repository, games, destinations, prompts, gameById, gameForRequest, iconPath, startingStrength, featuredAt, featured, cleanText, safeDestination, readSettings, playerUrl };
})();
