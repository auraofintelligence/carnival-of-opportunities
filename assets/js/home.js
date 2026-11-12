(() => {
  'use strict';

  const { games, destinations, gameById, featured, iconPath } = Carnival;
  const today = featured();
  const game = gameById(today.id);
  document.querySelector('#daily-name').textContent = game.name;
  const dailyIcon = document.querySelector('#daily-icon');
  dailyIcon.src = iconPath(game.id);
  dailyIcon.hidden = false;
  document.querySelector('#daily-date').textContent = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(`${today.date}T00:00:00Z`));

  const list = document.querySelector('#game-list');
  const cards = games.map(item => {
    const card = document.querySelector('#game-card').content.cloneNode(true);
    const element = card.querySelector('.game-card');
    card.querySelector('img').src = iconPath(item.id);
    card.querySelector('h3').textContent = item.name;
    card.querySelector('p').textContent = item.description;
    card.querySelector('a').href = `play.html?game=${item.id}`;
    list.append(card);
    return { item, element };
  });

  const filters = [...document.querySelectorAll('[data-category]')];
  const search = document.querySelector('#game-search');
  const count = document.querySelector('#game-count');
  let category = 'all';

  function filterGames() {
    const query = search.value.trim().toLowerCase();
    let matches = 0;
    for (const { item, element } of cards) {
      const visible = (category === 'all' || item.category === category)
        && `${item.name} ${item.description}`.toLowerCase().includes(query);
      element.hidden = !visible;
      if (visible) matches++;
    }
    count.textContent = matches ? `${matches} ${matches === 1 ? 'game' : 'games'}` : 'No games match. Try another search or category.';
  }

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      category = filter.dataset.category;
      for (const item of filters) item.setAttribute('aria-pressed', String(item === filter));
      filterGames();
    });
  }
  search.addEventListener('input', filterGames);
  document.querySelector('#catalogue-controls').hidden = false;
  filterGames();

  for (const { label, url } of destinations.slice(0, 4)) {
    const link = document.createElement('a');
    link.className = 'network-link';
    link.textContent = label;
    link.href = url;
    document.querySelector('#network-links').append(link);
  }
})();
