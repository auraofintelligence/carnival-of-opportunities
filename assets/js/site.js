(() => {
  'use strict';

  if (document.documentElement.classList.contains('embedded')) return;
  const turns = document.querySelector('.page-turns');
  if (turns?.dataset.page === 'play') {
    const id = new URLSearchParams(location.search).get('game');
    const game = Carnival.gameForRequest(id);
    const index = Carnival.games.indexOf(game);
    const settings = location.hash.startsWith('#settings=') ? location.hash : '';
    const previous = Carnival.games[index - 1];
    const next = Carnival.games[index + 1];
    const previousLink = turns.querySelector('[rel="prev"]');
    const nextLink = turns.querySelector('[rel="next"]');
    previousLink.href = previous ? `play.html?game=${previous.id}${settings}` : 'index.html#games';
    previousLink.querySelector('strong').textContent = previous?.name || 'The Midway';
    nextLink.href = next ? `play.html?game=${next.id}${settings}` : `embed.html?game=${game.id}${settings}`;
    nextLink.querySelector('strong').textContent = next?.name || 'Embed Studio';
  }

  const top = document.querySelector('[data-to-top]');
  if (!top) return;
  const update = () => { top.hidden = window.scrollY < 300; };
  window.addEventListener('scroll', update, { passive: true });
  top.addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('.brand')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  update();
})();
