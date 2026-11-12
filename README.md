# Carnival of Opportunities

Small luck games that can lead people to projects, prompts and opportunities across the Aura of Intelligence network. Play on the [midway](https://auraofintelligence.github.io/carnival-of-opportunities/) or make a custom game in the [Embed Studio](https://auraofintelligence.github.io/carnival-of-opportunities/embed.html).

| Game | How it works |
| --- | --- |
| **Orbit Wheel** | Set the strength slider to Under 1, 1, 2 or 3 full turns. Press Spin for a random pick or tap a slice to aim with a little drift. |
| **Duck Pond** | Pick a duck to reveal a hidden destination. Shuffle the pond for another draw. |
| **Peg Drop** | Choose a release lane and watch the token bounce into a slot. |
| **Balloon Mixer** | Pop one balloon from each bunch to pair a destination with an action. |
| **Today’s featured game** | One iframe URL cycles through the catalogue by the Brisbane date. |

## Add a game to another site

1. Open **Embed Studio** and choose a game. Give it a custom title if useful.
2. Enter 2–32 destinations, one per line. Use `Name | https://example.com/page` for a clickable result or enter a plain label for a prize or prompt. Add an action list for the Balloon Mixer and a starting strength for the wheel.
3. Choose **Update preview** and play a round. Copy the iframe into the destination site’s HTML, or choose **Copy Codex prompt** and tell Codex which site and section to edit.

Each copied iframe carries its own settings in the URL fragment. Keep the full `src` when moving it between sites. The game reveals a link after a draw and lets the visitor decide when to open it.

## Preview and publish

Open `index.html` directly for a local preview. To serve the same files over HTTP, run `python -m http.server 8000` from the repository and visit `http://localhost:8000/`.

Run `node scripts/build.mjs` to produce the public site in `dist/`. In **Settings → Pages**, set **Source** to **GitHub Actions**. The Pages workflow deploys on pushes to `main`, on manual dispatch, and daily at 5:17 am Brisbane time. Each build writes that day’s feature into the published bundle. The browser calculates the same result using the Brisbane date when loading the site, including when a scheduled build is delayed. An open game keeps its current round until the page reloads. [GitHub Pages publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [Workflow scheduling](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

To change the rotation order or the starter destination pool, edit `assets/js/catalog.js`. Each pinned game retains its URL. The rotating embed uses `play.html?game=featured&embed=1`.

## Discovery and licence

`sitemap.xml` lists the public landing, play and embed studio pages. The project includes a crawler-policy reference in `robots.txt`. On the shared `auraofintelligence.github.io` host, the root site’s `robots.txt` controls the project path. [Design notes](DESIGN-NOTES.md) include the scoped root directives and the sources behind the visual design and the games.

Luke Nathan Hayes / Strange But True / Aura of Intelligence. See the [Strange But True Public Source Licence](LICENCE.md) for reuse and attribution terms.

Archivo is bundled under its [SIL Open Font License](assets/fonts/Archivo-OFL.txt).
