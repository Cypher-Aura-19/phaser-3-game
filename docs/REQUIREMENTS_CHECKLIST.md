# Requirements Checklist

**Status as of 2026-07-30 (AppLovin/MRAID Integration & Acceptance Testing complete).**
Legend: ✅ met · ⚠️ partial · ❌ not met

| # | Requirement | Status | Evidence / Location |
|---|---|---|---|
| 1 | Complete 2D game/playable | ✅ | Fulfills 7 levels + tutorial sandboxed loop. In-game physics and mechanics fully playable. |
| 2 | Phaser 3 | ✅ | **3.90.0**, bundled locally via Vite/npm import. No CDN dependency. |
| 3 | Final playable under 5 MB | ✅ | Single HTML file `dist/applovin.html` is **2,095,648 bytes (~2.00 MB)**, well under 5,000,000 bytes. |
| 4 | Responsive portrait + landscape | ✅ | Implemented using `Phaser.Scale.RESIZE` with dynamic aspect-ratio camera zoom and HUD repositioning. HUD CTA adjusts responsively. |
| 5 | Clean, reusable, maintainable code | ✅ | Ported entirely to **strict TypeScript**. Structured under `src/classes/` with platform adapter in `src/platform/MraidAdapter.ts`. |
| 6 | Clear objective | ✅ | HUD persistently displays the objective during gameplay: *"objective: collect all currency fragments"*. |
| 7 | Explicit win and game-over states | ✅ | Implemented 3 integrity points (lives) with respawning/invulnerability flashing. Explicit **GAME OVER** and **VICTORY** overlays are rendered exactly once on the UI layer. |
| 8 | In-game instructions and controls | ✅ | Interactive `[?]` help menu displays controls, options, sound toggle, and themes at all viewports. |
| 9 | Zero console errors/warnings | ✅ | Verified by Playwright automated console test suite across 6 responsive sizes: zero game-origin warnings or errors. |
| 10 | All assets Base64/data URLs | ✅ | All code, CSS, sprites, SVG logos, and MP3 audio are imported and bundled inline. |
| 11 | One self-contained HTML build | ✅ | Emitted via Vite singlefile bundling. Works offline from a local server. |
| 12 | GitHub repo + complete README | ✅ | Updated README.md with detailed instructions. Staged phantom index cleared. |
| 13 | Only legally permitted assets | ✅ | All original ASCII PNGs and MP3 audio are legally permitted under the MIT license, with full attribution retained. |
| 14 | MRAID 2.0 + browser fallback | ✅ | Implemented via a lightweight adapter (`MraidAdapter.ts`) supporting viewability/state listening, unmuting on first interaction, and centralized CTA open redirects (with browser `window.open` fallback). |
