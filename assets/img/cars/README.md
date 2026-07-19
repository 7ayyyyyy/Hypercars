# Car photos

The site links images from **Wikimedia Commons** (free-licensed). They are referenced by URL in `assets/data/cars.js` — the browser fetches them at runtime, no local download required.

## If you want to host images locally

1. Visit https://commons.wikimedia.org/ and find a high-resolution image for each car
2. Save into this folder, e.g. `bugatti-chiron-01.jpg`
3. In `assets/data/cars.js`, change the `images` array from URLs to relative paths like `assets/img/cars/bugatti-chiron-01.jpg`

## Why we don't ship photos in the repo

- The repo stays small and fast to clone
- Wikimedia Commons hosts are reliable and CDN-cached
- License compliance is automatic (we just link)
- New photos are picked up without any local updates
