# Hypercars Encyclopedia

A static, multi-page website showcasing 22 of the world's most extreme hypercars, with procedural 3D car renderings and detailed specifications for each.

## Quick start

This is a pure static site — no build step, no server required. Just open `index.html` in a modern browser.

For the best experience (correct module loading, no `file://` CORS issues), serve it locally:

```bash
cd hypercars-site

# Option 1: Python (no install needed if you have Python)
python3 -m http.server 8000

# Option 2: Node
npx -y serve .

# Option 3: any static server
```

Then visit http://localhost:8000

## Tech

- **HTML / CSS / vanilla JS** — no frameworks, no build step
- **Three.js** loaded from CDN for the 3D showroom
- **Google Fonts** (Manrope, Inter) for typography
- **Wikimedia Commons** for hypercar photography (linked, free-licensed)

## Structure

```
hypercars-site/
├── index.html           Home — 3D hero + featured cars
├── garage.html          Full 22-car grid with filter & sort
├── car.html             Detail page (?id=<slug>)
├── compare.html         Side-by-side compare tool
├── ranking.html         Power / speed leaderboard
├── about.html           About the project
└── assets/
    ├── css/             Design system + page styles
    ├── js/              Page logic + Three.js showroom
    ├── data/cars.js     Master car database
    └── img/cars/        Local photo cache (optional)
```

## Pages

- **Home** — Full-bleed 3D rotating hypercar, headline, by-the-numbers stats
- **Garage** — Browse all 22 cars, filter by powertrain / decade / price, sort by any spec
- **Car detail** — Spec sheet, narrative, photo gallery, 3D viewer
- **Compare** — Pick 2-3 cars and see them in a highlighted comparison table
- **Ranking** — Sortable leaderboard with animated counters and bar charts
- **About** — Project background, data sources, credits

## Notes

- The 3D cars are **stylized procedural silhouettes** built from Three.js primitives — not photo-real, but consistent across all 22 cars and runs in any browser
- Photos are linked from Wikimedia Commons (free licenses). If a network block prevents loading, the site falls back to gradient placeholder cards
- The site respects `prefers-reduced-motion` and meets WCAG AA contrast

## Credits

- Design: UI/UX Pro Max skill
- 3D: Three.js (MIT license)
- Data: Manufacturer specifications, publicly published figures
- Images: Wikimedia Commons contributors
