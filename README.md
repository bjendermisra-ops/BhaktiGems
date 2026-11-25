# Bhakti Gems

Devotional match-three web game with 100 level configurations in five chapters, an actual 7×8 match engine, cascades, row/column/rainbow/burst powers, garden objectives, boosters, win/lose flows, virtual mandir decorations, optional sounds and music, local progress, and English/Hindi/Marathi UI. No backend, accounts, ads, or real-money purchases.

## Run
Serve the repository root using any static HTTPS host (or `python -m http.server 8080` on localhost). Vercel is configured for static hosting. The service worker precaches the game and artwork; the first online visit is required for offline play. Progress lives in local storage on the current device/browser.

## Artwork
`assets/` contains separate WebP sprites, backgrounds, decorations, and original reference-derived artwork. The interface renders interactive controls and dynamic state as DOM elements; decorative reference artwork is not a functional screenshot overlay.

## Tests
Run `node tests/engine.test.js` for engine invariant tests. Real-device and final art-direction review are recommended before app-store release. Levels are generated configurations, not individually play-tested handcrafted puzzles.
