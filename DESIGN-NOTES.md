# Carnival of Opportunities design notes

## The Aura family

- **Aura of Intelligence** uses a branded header, a short row of primary links and a separate Index for its larger network. The local stylesheet uses near-black `#05070c`, deep blue `#0a1420`, violet `#7c4dff`, amethyst `#c9a6ff`, gold `#ffcf6e`, teal `#2be3c2` and pale text `#f6f4ff`. The carnival can carry that dark base and use warm fairground lights to mark the games. [Aura of Intelligence](https://auraofintelligence.github.io/)
- **Strange but True** brings the market-stall spirit to the palette with night ink `#101020`, purple `#8f4dff`, cyan `#5fd8ff` and gold `#ffd166`. It pairs short explanations with a clear next action. Use the same direct language for playing a game, opening the result or copying an embed. [Strange but True](https://auraofintelligence.github.io/strange-but-true/)
- **Mutual Futures** puts its main topics in the header and the wider collection behind an All chapters control. Keep Play, Embeds and the site index easy to reach on a phone, with related Aura projects and the licence in the footer. [Mutual Futures](https://auraofintelligence.github.io/mutual-futures/)
- **Grain by Grain** uses concept imagery to make each part of a connected system feel like a place to explore, and credits that imagery and the Public Source licence in the footer. The local Joyful Responsible Abundance source extends that approach with full-width WebP heroes, a dark overlay behind the headline, descriptive alt text and explicit AI-generated image credits. [Grain by Grain](https://auraofintelligence.github.io/grain-by-grain/)

The repository owner is `auraofintelligence`. Use the established **Strange But True Public Source Licence** with attribution to Luke Nathan Hayes / Strange But True / Aura of Intelligence. The local `strange-but-true-cosmic-nexus/LICENCE.md` supplies the text. Update its project description and attribution identifiers for Carnival of Opportunities and leave the licence terms as written.

## Midway games and how they translate

- **Duck Pond.** Talley’s version lets the visitor choose a numbered floating duck to reveal a prize. A single selection works well for drawing an idea, project or conversation starter, including on a small screen. [Talley Amusements Duck Pond](https://talleyamusements.com/attraction/duck-pond/)
- **Disc Drop.** Hersheypark drops a disc down a board and uses the landing space to determine the result. A digital peg board can show the path to a category or project, with a text result and an immediate reveal for people who prefer reduced motion. [Hersheypark Chocolatetown Disc Drop](https://www.hersheypark.com/things-to-do/games/candymonium-disc-drop)
- **Balloon Pop.** Dreamland’s physical game uses darts to pop a chosen balloon. A browser version can make each balloon a selectable target with a hidden prompt, so mouse, touch and keyboard can all reveal an outcome. [Dreamland Amusements Balloons](https://dreamlandamusements.com/carnival-ride-rentals/games-balloon-pop/)
- **Orbit Wheel.** Carry forward the working wheel, including the spin button and four strength stops. For network discovery, a winning slice can become a suggested place to visit. Keep the visitor in control of whether to follow the link.

## Hero art

Both heroes were created with built-in image generation and packaged as WebP.

- [`assets/images/carnival-hero.webp`](assets/images/carnival-hero.webp) — A luminous carnival at blue hour on an Australian foreshore, with a vintage painted prize wheel under a striped tent in the right foreground, amber festoon bulbs and cyan paths like a star map. Dark, open midnight-navy space on the left supports the page heading. Realistic cinematic editorial photography with deep aubergine, gold, mint and lilac, tactile materials and light grain. Landscape 3:2, composed to crop wide. No signage, lettering, logos or watermark.
- [`assets/images/workshop-hero.webp`](assets/images/workshop-hero.webp) — A close tabletop view of a carnival game stall at twilight, with a violet wooden peg board, mint and yellow tokens, a coin, lavender cards and blank raffle tickets. Dark lower-left space for the heading, with amber lantern light and midnight blue, tactile wood and enamel, and restrained grain. Landscape 3:2. No people, lettering, logos or watermark.

## GitHub Pages crawl integration

The project’s `robots.txt` belongs at its own domain root if it moves to a dedicated host. On `auraofintelligence.github.io/carnival-of-opportunities/`, the shared host’s `robots.txt` controls crawling. The scoped integration belongs in the separate `auraofintelligence.github.io` repository, following the existing Redlands Civic Lab change in commit `89fc7ab`. [Google crawler documentation](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)

- Add `Allow: /carnival-of-opportunities/` to the existing `*`, `OAI-SearchBot` and `Claude-SearchBot` groups.
- Add `Disallow: /carnival-of-opportunities/` to the existing `GPTBot`, `ClaudeBot` and `Google-Extended` groups.
- Add `Sitemap: https://auraofintelligence.github.io/carnival-of-opportunities/sitemap.xml` once after the sitemap is published. Keep the other projects’ directives intact. Crawl preferences and the licence serve separate purposes.
