(() => {
  'use strict';

  const { games, destinations, gameById, featured } = Carnival;
  const today = featured();
  const game = gameById(today.id);
  document.querySelector('#daily-name').textContent = game.name;
  document.querySelector('#daily-date').textContent = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(`${today.date}T00:00:00Z`));

  for (const item of games) {
    const card = document.querySelector('#game-card').content.cloneNode(true);
    const art = card.querySelector('.game-art');
    art.classList.add(`art-${item.id}`);
    card.querySelector('.game-type').textContent = item.type;
    card.querySelector('h3').textContent = item.name;
    card.querySelector('p').textContent = item.description;
    const link = card.querySelector('a');
    link.href = `play.html?game=${item.id}`;
    link.setAttribute('aria-label', `Play ${item.name}`);
    document.querySelector('#game-list').append(card);
  }

  for (const { label, url } of destinations.slice(0, 4)) {
    const link = document.createElement('a');
    link.className = 'network-link';
    link.textContent = label;
    link.href = url;
    document.querySelector('#network-links').append(link);
  }
})();
