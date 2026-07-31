# Echo-7: Fragment Collector

**Echo-7: Fragment Collector** is an ASCII-art 2D platformer built with Phaser 3. You play as a rogue data packet navigating a glitching digital station, collecting currency fragments across 7 procedurally-staged levels while dodging hostile entities. The game features a neon-cyberpunk visual identity, 5 selectable color themes, MRAID 2.0 / AppLovin ad-SDK compatibility, and a fully offline, single-file HTML build.

---

## Objective

Collect **all currency fragments (`$`)** on each level before losing all three **integrity points**.

- **Win** — Clear all 7 levels
- **Game Over** — Lose all 3 integrity points by colliding with enemies

---

## Controls

### Keyboard
| Action | Key |
|--------|-----|
| Move left / right | `A` / `D` or Arrow keys |
| Jump | `W`, `↑`, or `Space` |
| Stomp (fast-fall) | `S` or `↓` |
| Help / Options | `X` or `/` |
| Fullscreen | `+` / `-` |

### Touch (Mobile)
| Action | Gesture |
|--------|---------|
| Move | Hold left / right half of screen |
| Jump | Tap anywhere |
| Stomp | Swipe down |

---

## Installing & Running Locally

**Prerequisites:** Node.js ≥ 18

```bash
# Clone and install
git clone https://github.com/Cypher-Aura-19/phaser-3-game.git
cd echo-7-playable
npm install

# Run dev server (hot-reload)
npm run dev
# → opens http://localhost:5173

# Alternatively, use the zero-dependency static server
node server.js
# → open http://localhost:9999/index.html
```

### Production Build

Produces a **single, fully self-contained HTML file** (all assets Base64-inlined):

```bash
npm run build
# Output: dist/applovin.html  (AppLovin-compatible)
#         dist/index.html     (standard browser)
```

### Type-check

```bash
npm run typecheck
```

### Automated Acceptance Tests

Requires a running server (`node server.js` or `npm run dev`):

```bash
npm run test:acceptance
# Runs 28 checks across 6 viewport sizes in both Normal and simulated MRAID modes
```

---

## Project Structure

```
src/
├── main.ts              Landing page bootstrap & MRAID init
├── game.ts              Phaser game config
├── assets.ts            Base64 asset registry (images + audio)
├── config.ts            Game constants (speeds, integrity, font…)
├── themes.ts            5 color palette definitions
├── levels.ts            Level layout data (platforms, art, mobs)
├── classes/
│   ├── scene.ts         Main Phaser scene — orchestrates everything
│   ├── ui.ts            HUD + help/options overlay
│   ├── player.ts        Player sprite, keyboard & touch controls
│   ├── tutorial.ts      Level-0 tutorial panel
│   ├── tips.ts          Victory / Game-Over overlays
│   ├── coins.ts         Collectible fragment group
│   ├── mobs.ts          Enemy spawning & behavior
│   ├── platforms.ts     Platform group builder
│   └── asciiRain.ts     Background ASCII-rain particle effect
└── platform/
    └── MraidAdapter.ts  MRAID 2.0 integration with browser fallback
assets/                  Source sprites, audio, art (PNG / MP3 / SVG)
dist/                    Build output (generated — do not edit)
docs/                    Internal planning & audit docs
```

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Game engine | Phaser 3.90.0 (bundled) | Required by assessment |
| Language | TypeScript (strict) | Type-safety, better IDE support |
| Bundler | Vite + vite-plugin-singlefile | Zero-dependency single-file output |
| Ad SDK | MRAID 2.0 | AppLovin compatibility |
| Testing | Playwright | Headless cross-viewport automation |

---

## Assumptions, Trade-offs & Future Improvements

### Assumptions
- The AppLovin MRAID environment provides the close button — no custom close UI is included.
- CTA destination URL (`ctaUrl` in `src/config.ts`) is set to `https://www.applovin.com` as a placeholder; this must be updated to the final campaign link before submission.
- The MRAID mock (`src/platform/MraidMock.ts`) is dev-only and is fully tree-shaken from the production build.

### Trade-offs
- **Single scene architecture** — all 7 levels share one Phaser scene, which avoids costly scene teardown/init cycles. The trade-off is slightly more complex state management inside `scene.ts`.
- **Phaser.Scale.RESIZE + camera zoom** — chosen over fixed-canvas scaling because it gives pixel-perfect letterboxing across portrait and landscape without restarting the game.
- **ASCII aesthetics** — the monospace-text art keeps asset sizes tiny (the entire art library is < 100 KB before inlining), leaving plenty of headroom under the 5 MB cap.

### What I'd Do with More Time
- **Audio polish** — add ambient synth loop, jump SFX, and level-up fanfare; currently only rain, coin, and death sounds are present.
- **More level variety** — introduce moving platforms, timed hazards, and a boss final level.
- **Leaderboard / persistence** — replace `localStorage` score with a lightweight cloud save via a single POST request.
- **Accessibility** — add reduced-motion mode and keyboard-navigable menus.
- **Visual particle effects** — replace the CSS spinner loader with an in-game Phaser particle burst on level transition.
