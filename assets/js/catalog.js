(() => {
  'use strict';

  const canonical = 'https://auraofintelligence.github.io/carnival-of-opportunities/';
  const repository = 'https://github.com/auraofintelligence/carnival-of-opportunities';
  const games = [
    { id: 'orbit-wheel', name: 'Orbit Wheel', type: 'Spin', description: 'Aim for a slice or let the wheel decide. Four strength settings and a small nudge of luck change where it stops.' },
    { id: 'duck-pond', name: 'Duck Pond', type: 'Pick', description: 'Pick a duck to discover the project, prompt or little opportunity hiding underneath.' },
    { id: 'peg-drop', name: 'Peg Drop', type: 'Drop', description: 'Choose a lane and follow a token through a board of pegs to its landing slot.' },
    { id: 'balloon-mixer', name: 'Balloon Mixer', type: 'Mix', description: 'Pop a balloon from each bunch to pair a destination with something to try there.' },
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
  const strengths = ['under-1', '1', '2', '3'];
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
      turns: strengths.includes(settings?.turns) ? settings.turns : '2',
    };
  }

  function playerUrl(base, id, settings, embed = true) {
    const url = new URL('play.html', base);
    url.searchParams.set('game', id);
    if (embed) url.searchParams.set('embed', '1');
    if (settings) url.hash = new URLSearchParams({ settings: JSON.stringify(settings) }).toString();
    return url;
  }

  globalThis.Carnival = { canonical, repository, games, destinations, prompts, strengths, gameById, featuredAt, featured, cleanText, safeDestination, readSettings, playerUrl };
})();
