# Original Source Audit

**Audit date:** 2026-07-29
**Auditor:** discovery phase, no code modified
**Upstream project:** Echo-7 — "A single-pane ASCII-art platformer made with Phaser.io"
**Upstream author:** Echo-7 Team
**Upstream licence:** MIT, `Copyright (c) 2024 Echo-7 Team`
**Upstream version:** `0.7` (per `<meta name='version'>` in `index.html`, dated 8 Sept 2024)

---

## 1. Project structure

```
echo-7-playable/
├── .github/FUNDING.yml          upstream author's sponsor config
├── .gitignore
├── LICENSE                      MIT — DO NOT MODIFY
├── README.md                    upstream readme
├── favicon.ico                  495 B
├── index.html                   landing page + Phaser CDN + bootstrap
├── game.js                      Phaser.Game config
├── levels.js                    LEVELS data array (8 entries: tutorial + 7)
├── themes.js                    5 colour themes
├── server.js                    zero-dependency Node dev server, port 9999
├── classes/                     game modules (9 files, 40 KB)
│   ├── scene.js                 main scene, orchestration (16.3 KB — largest)
│   ├── player.js                player sprite + input
│   ├── platforms.js             static group
│   ├── coins.js                 collectible group
│   ├── mobs.js                  enemy group + tips text
│   ├── asciiRain.js             transition effect
│   ├── tutorial.js              level-0 scroll overlay
│   ├── tips.js                  death overlay
│   └── ui.js                    HUD, help panel, themes, fullscreen (10.2 KB)
└── assets/                      art, audio, source SVGs
```

There is **no** `package.json`, no bundler, no build step, no test suite,
no linter config, and no CI.

## 2. Phaser version and loading mechanism

| Item | Value |
|---|---|
| **Exact version** | **3.90.0** |
| Declared in | `index.html:124` |
| Load method | Remote CDN `<script>`, **not** bundled |
| URL | `//cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js` |
| Runtime-confirmed | `Phaser.VERSION === "3.90.0"`; banner logged `Phaser v3.90.0 (WebGL | Web Audio)` |
| Renderer | `Phaser.AUTO` → resolved to **WebGL** in Chromium |

The URL is **protocol-relative** (`//cdn...`). Opened from `file://` this
resolves to `file://cdn.jsdelivr.net/...` and fails — Phaser never loads. This is
one of the blockers for offline/single-file operation.

Phaser is consumed as a **global** (`Phaser.Scene`, `Phaser.Physics...`) while
game code uses **ES modules** (`import`/`export`, `<script type="module">`). Any
bundling step must preserve that global before the modules evaluate.

## 3. Game configuration

`game.js`:
- Canvas **1024 × 768**, fixed
- `backgroundColor: '#121212'`
- `scale.mode: Phaser.Scale.FIT`, `autoCenter: CENTER_BOTH`
- Arcade physics, `gravity.y: 500`, `debug: false`
- Single scene: `SCENE`

## 4. Complete game flow (verified by play-through)

### Landing screen — `index.html`
Pure HTML/CSS/JS, no Phaser. Animated typewriter subtitle ("Where ASCII
reigns" → backspaces → "rains"), then fades in a `PLAY` button and fineprint
("A platformer made with Phaser.io / By Echo-7"). Title is
`assets/title.svg` in an `<img>`. `PLAY` hides the landing div, shows `#game`,
calls `playGame()`.

`devMode` in `localStorage` auto-starts and skips the title screen.

### Tutorial — level 0, `classes/tutorial.js`
A container tweens down from `y: -700` to `y: 0` over 2 s. Shows a scroll
graphic, "Welcome to", the Echo-7 logo, and one rotating hint (cycled every
3 s in `update()`):
1. `Collect all the {$} to progress to next level`
2. `Click the [+] or [-] to toggle fullscreen`
3. `Click the [?] to see controls and options`

The tutorial has **no platforms and no enemies** — it is a safe sandbox.

### Controls
Keyboard: arrows or WASD; `SPACE`/`W`/`↑` jump; `S`/`↓` stomp;
`X` or `/` toggles help; `+`/`-` toggles fullscreen; `ENTER` pays the fine on
the death overlay.

Touch: two-pointer. Pointer 1 held on left/right half of screen moves (split at
a **hard-coded `x > 400`** — not the canvas midpoint, so the dead-zone is
off-centre); swipe down > 50 px stomps; pointer 2 down, or a tap under 150 ms,
jumps.

Controls are documented **inside the game** via the `[?]` help panel — which
already satisfies assessment requirement 8 in spirit.

### Objective
Collect all 12 coins (`{$}`) on a screen to advance. Score is dollars;
`score = level * 12` on load, so score is derived from level, not stored.

### Level progression
`levels.js` holds 8 entries (index 0 = tutorial, 1–7 = real levels), each with
`plats`, optional `staticMobs`, `dynamicMobs`, and decorative `art`.
`collectCoin()` → when `coins.countActive(true) === 0` → `levelUp()`:
increments level, persists to `localStorage`, updates HUD, replays the
transition tween. A `Phaser.Timeline` choreographs: ASCII rain → coins rain →
player slides to x=350 → old level torn down, new level built → static mobs at
2.5 s → dynamic mobs at 4 s. Input is locked (`tweening = true`) for the first
3 s of every level.

### Player death — `classes/tips.js`
`hitMob()` applies per-enemy rules:
- `mob0` (witchhazel) — kickable from the sides; fatal within ±25 px (the "hat")
- `mob1` (scuttlebot) — fatal from the sides; survivable if `player.y + 50 > mob.y` (stomp)
- `bomb` — always fatal

On death: `physics.pause()`, death SFX (seeking 2.5 s in), player switches to
`turn` anim, and a scroll overlay shows the enemy sprite, a flavour tip, and a
button (`[BUY ANTIDOTE]` / `[PAY FINE]` / `[RESURRECT]`).

### Retry flow
The death overlay is **not** a game-over. Pressing the button (or `ENTER`)
calls `payFine()` → deducts the enemy's fine from score (5/10/15) → the score
tween's `onComplete` calls `hideTips()` → physics resumes, the offending enemy
is destroyed, play continues on the same level. **There are no lives and no
fail state — score simply goes negative.**

### Final completion — `rollCredits()`
After level 7, `gameOver = true` and `update()` calls `rollCredits()`. Two
endings by score sign: "Congratulations! You earned $N by taking a walk in the
park." or "Impressive! ... you accumulated $N in debt." Then `[PLAY AGAIN]`
resets level to 0 and restarts the scene.

**Bug:** `rollCredits()` is called from `update()` with no guard, so it re-adds
the scroll images, text, and interactive button **every frame** (~60×/s) for as
long as the end screen is shown. This leaks GameObjects continuously.

## 5. Responsive and touch implementation

Only `Phaser.Scale.FIT` + `CENTER_BOTH` on a fixed 1024×768 (4:3) stage.
Confirmed at 1280×800: canvas backing store 1024×768, CSS size 1066×800,
letterboxed with black bars left/right.

This scales but does **not adapt**. In portrait the 4:3 stage shrinks to fit
width, leaving large empty bands and a tiny play area. There is no orientation
handling, no `resize` listener, no layout reflow, no on-screen touch buttons,
and no safe-area handling. Requirement 4 is only partially met.

## 6. Licence coverage

`LICENSE` is MIT and, per its terms, covers "the Software and associated
documentation files" — i.e. **the whole repository as distributed**, code and
bundled assets alike, since the author shipped them together under it. That
makes reuse legally permissible provided the copyright and permission notice are
retained.

**Covered with confidence — all first-party code:**
`index.html`, `game.js`, `levels.js`, `themes.js`, `server.js`,
all nine files in `classes/`.

**Covered, with the caveats in `docs/ASSET_AUDIT.md`:** the art and audio in
`assets/`. All SVGs carry Inkscape/sodipodi metadata consistent with original
authorship, and all three MP3s were encoded by `Lavf59.27.100` (FFmpeg) with no
third-party ID3 credits. Nothing indicates reused third-party media — but no
positive provenance statement exists either, which is why we replace the media
rather than rely on it.

**Not ours and out of scope:** Phaser 3.90.0 itself (MIT, Photon Storm /
Phaser Studio) — loaded from CDN, not vendored.

**Should be removed in our fork:** `.github/FUNDING.yml` funds the upstream
author's GitHub Sponsors. Keeping it in a fork would route sponsorship prompts
for our assessment repo to them; it is not a licence issue but is inappropriate
to carry forward.

## 7. External and runtime network dependencies

| Dependency | Where | Blocking? |
|---|---|---|
| `//cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js` | `index.html:124` | **Yes** — must be vendored |
| 44 × PNG + 3 × MP3 via `this.load.*` | `classes/scene.js:46–111` | **Yes** — must be Base64-embedded |
| `assets/title.svg` via `<img src>` | `index.html:74` | **Yes** — must be inlined |
| `favicon.ico` via `<link rel>` | `index.html:11` | Minor — inline or drop |
| 9 × ES-module `import` (separate HTTP requests) | all modules | **Yes** — must be bundled |

Verified by grep: **no** `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`,
`@font-face`, Google Fonts, analytics, or telemetry anywhere. No external
references inside any SVG. The only remote origin in the entire project is the
jsdelivr CDN. That is a clean starting point.

`localStorage` is used for `level`, `themeName`, `soundOn`, `devMode` — no
network, but see the MRAID note in `docs/ADAPTATION_PLAN.md` (storage can be
restricted or absent inside ad webviews, so it must be wrapped).

## 8. Fonts

No web fonts. Everything relies on the generic CSS `monospace` family (landing
page) or Phaser's default text rendering. Zero font network requests — but
glyph metrics vary by platform, so the ASCII art alignment is not guaranteed
identical across devices. Since the art is baked into PNGs, this mainly affects
HUD/overlay text.

## 9. Git state (important)

- Branch `main` exists with **no commits** ("No commits yet on main").
- The index is **staged with a completely different project**: 59 paths under
  `src/` (TypeScript, Vite, `tsconfig.json`, `package.json`,
  `scripts/capture-viewports.mjs`, and `src/assets/**` referencing Echo-7 /
  sentinel / reactor-core artwork), plus `AGENTS.md`, `PROJECT_STATUS.md`, and
  three `docs/*.md` files.
- **Every staged blob is 0 bytes**, and every path shows as deleted in the
  worktree. So this is an empty scaffold of an intended future structure, not
  recoverable prior work — `git show :AGENTS.md` returns nothing.
- The actual Echo-7 source is entirely **untracked**.

This matters: the staged tree tells us the intended target architecture
(Vite + TypeScript, `src/game/scenes`, Kenney-style asset names), but contains
no content. Any commit must be made deliberately, not by `git commit -a`, or it
will record 59 phantom deletions. Recommend `git reset` to clear the index
before the first real commit.

## 10. Code quality assessment

**Strengths — worth preserving:**
- Genuinely modular: one scene with swappable components; each class is one
  focused file. `README.md` documents how to add a level.
- Data-driven levels (`levels.js`) and theming (`themes.js`) cleanly separated
  from logic.
- Idiomatic Phaser 3 subclassing of `Sprite`, `Group`, `StaticGroup`,
  `Container`.
- Loading screen with a real progress bar.
- Accessibility intent: 5 themes, large fonts, both visual and audio cues.

**Weaknesses to fix in adaptation:**
- `rollCredits()` called every frame from `update()` — object leak (§4).
- Magic numbers pervasive: `1024`, `768`, `512`, `x > 400`, `frameWidth: 51.888`,
  `dropWidth = 16.2`, `y: 748`. Blocks responsive layout.
- `ui.js` hard-codes the five theme names in a container array with a
  `//todo: iterate these instead` left in place.
- `this[item] = value` in `setUserData()` writes arbitrary keys onto the scene —
  works, but fragile and hard to reason about.
- Score is `level * 12` on load, so mid-level progress and fines don't persist.
- No lives/game-over → assessment requirement 7 unmet by design.
- `server.js` sends **wrong MIME types**: its regex only matches
  `html|js|css|svg`, so PNG and MP3 are served as `text/plain`
  (verified via curl). Browsers sniff and it works, but it is incorrect and
  would break under stricter handling.
- Dead code: `healthPot.png` (commented-out loader), `typing.blend`,
  commented level template, `mobHit()` empty handler, `theme.kill` unused.
- `classes/scene.js` mixes orchestration, asset manifest, game rules, tween
  choreography, and the loading screen in one 467-line file.

## 11. Attribution obligations we must honour

To stay MIT-compliant while redistributing:
1. Keep `LICENSE` byte-for-byte, including the 2024 Echo-7 Team line.
2. State prominently in `README.md` that this is a derivative of Echo-7, with
   a link to the upstream project and its author.
3. Record the same in `THIRD_PARTY_NOTICES.md` alongside the Phaser notice.
4. Keep the MIT notice reachable from the shipped build — a credit line in the
   in-game help/credits overlay, since a single-file playable has no sidecar
   files.
5. Do **not** imply upstream endorsement of this assessment submission.
