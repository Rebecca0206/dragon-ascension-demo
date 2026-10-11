# Dragon Ascension — browser game
Static site, no build step. Open index.html via any static HTTPS host (GitHub Pages, Netlify, Render Static Site, Cloudflare Pages).
- Publish directory: this `game/` folder. (cards_node.js is for Node tests only; it's harmless if deployed.)
- AR ("View in AR / 3D") needs HTTPS and a phone with ARCore (Android Chrome → Scene Viewer/WebXR) or iOS Safari (Quick Look via models/*.usdz).
- model-viewer loads from unpkg CDN (internet needed for 3D/AR; the game itself works offline once loaded).
- Saves: localStorage key `dragonAscensionSave_v1` (per browser/device).
Local test: `python3 -m http.server 8000` then open http://localhost:8000
