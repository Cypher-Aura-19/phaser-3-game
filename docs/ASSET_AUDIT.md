# Asset Audit

**Audit date:** 2026-07-29
**Status:** Verification complete (unused design files excluded, active assets embedded as Base64 data URLs)

---

## 1. Size Summary in Production Build

All assets loaded by the game are imported via [assets.ts](file:///c:/Users/HP/Desktop/open%20source%20projects/mine/echo-7-playable/src/assets.ts) and bundled directly into the single production artifact `dist/index.html`.

- **Unused Assets Excluded:** Unreferenced SVGs (e.g. `ASCII_art.svg`, `art.svg`, `dude.svg`, `mobs.svg`) and the Blender source `typing.blend` (0.60 MB) are *excluded* from the production build automatically by Vite since they are not imported in the source code.
- **Embedded Asset Size:** Total embedded assets (PNGs, MP3s, SVG title logo) are loaded as Base64 data URIs.
- **Phaser 3 Engine:** Phaser 3.90.0 is imported as a local module and bundled directly.
- **Total Single-File HTML Size:** **2,084,499 bytes (~1.99 MB)**, satisfying the under 5 MB limit.

---

## 2. Audio Assets (Embedded)
The three active audio files are inlined as Base64:
- `asciiRain.mp3` (`rain`): level-transition effect
- `death.mp3` (`death`): death/damage sound
- `collectCoin.mp3` (`coin`): coin pickup sound

All licenses and credits from the upstream author remain fully attributed.
