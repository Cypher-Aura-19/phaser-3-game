# Manual Acceptance Checklist

This document details the step-by-step procedure for a reviewer to manually verify **Echo-7: Fragment Collector** in various modes, device configurations, and offline environments. Verified successfully on 2026-07-30.

---

## 1. Local Setup
1. From the repository root, start the local development server:
   ```bash
   node server.js
   ```
2. The server will run at: `http://localhost:9999/`

---

## 2. Desktop Browser Verification
Open a desktop web browser (e.g. Chrome, Edge, Firefox) and navigate to:
`http://localhost:9999/dist/applovin.html`

### 2.1 Boot & Preload
- [ ] Verify that a high-contrast cyan/magenta neon loading indicator appears immediately with a progress spinner and percentage counter.
- [ ] Confirm that once the loading bar hits 100%, the loader disappears, and the landing page typewriter animations start.
- [ ] Check the browser developer console (F12) to verify there are **zero console errors or warnings**.

### 2.2 Audio Interaction Lock
- [ ] Confirm that no game audio (specifically the transition rain sound) plays during the landing page or when the game starts.
- [ ] Click the **PLAY** button to begin the game.
- [ ] Click or touch anywhere on the game canvas, or press a keyboard key. Confirm that the background rain sound starts *only after* this first genuine user interaction.
- [ ] Open the in-game help menu by pressing `X` or clicking `[?]`. Click the `[X] sound` setting to turn sound off and verify all audio mutes. Click it again to unmute.

### 2.3 Gameplay Controls
- [ ] Press `A` or `Left Arrow` / `D` or `Right Arrow` to move the ASCII character left and right. Verify movement is smooth.
- [ ] Press `W`, `Space`, or `Up Arrow` to jump. Confirm the jumping animation plays and character physics works.
- [ ] Press `S` or `Down Arrow` to stomp. Verify that the character descends rapidly.

### 2.4 Mechanics & Health (Integrity)
- [ ] Navigate the player to touch yellow coin fragments (`$`). Verify they scale up and fade away cleanly, the score increases, and the collection SFX plays.
- [ ] Let the player fall on a magenta mob hazard.
  - [ ] Confirm that integrity decreases by one point on the HUD (displayed as `integrity: III` -> `integrity: II` -> `integrity: I`).
  - [ ] Confirm the player flashes red-to-white for invulnerability feedback.
  - [ ] Verify that during the 1.5-second invulnerability duration, the player cannot receive additional damage.

### 2.5 Game Over and Victory
- [ ] Deplete all three integrity points. Confirm that the `GAME OVER` screen appears exactly once with `Final Score`, `[PLAY NOW]`, `[REPLAY]`, and `[MAIN MENU]` buttons.
- [ ] Click `[REPLAY]` and confirm the scene restarts, resetting level to 0, score to $0, and integrity to 3.
- [ ] Complete all 7 levels. Confirm that the `VICTORY!` screen appears exactly once with `[PLAY NOW]`, `[REPLAY]`, and `[MAIN MENU]`.

---

## 3. Mobile Emulation & Resizing
Open browser developer tools (F12) and toggle mobile device emulation.

### 3.1 Portrait Emulation (e.g., iPhone SE, 320x480)
- [ ] Set viewport size to `320x480` and refresh the page.
- [ ] Verify that the HTML loading indicator, landing page, and game canvas scale down proportionally.
- [ ] Verify that the `[PLAY NOW]` CTA button on the HUD is centered below the level/objective texts to prevent overlapping.
- [ ] Test mobile touch controls:
  - [ ] Touch the left half of the screen to move left.
  - [ ] Touch the right half of the screen to move right.
  - [ ] Tap anywhere to jump.
  - [ ] Swipe down to stomp.

### 3.2 Landscape Emulation (e.g., 480x320, 1280x720)
- [ ] Set viewport size to `480x320` or `1280x720`.
- [ ] Verify the scene reflows dynamically, scaling with proper camera zoom and centering.
- [ ] Verify that the HUD controls are readable and do not overflow.

### 3.3 Dynamic Resize / Rotation
- [ ] Drag the browser window edges to change the viewport size dynamically.
- [ ] Confirm that the game view camera adjusts its zoom level instantly to keep the 1024x768 coordinates centered and fully visible without black bars or letterboxing cutoff.

---

## 4. CTA (Click-Through) Verification
- [ ] Navigate to the victory overlay, game over overlay, or look at the HUD.
- [ ] Click the `[PLAY NOW]` button.
- [ ] Confirm that the browser attempts to open `https://www.applovin.com` (or the configured campaign URL) in a new tab.
- [ ] Confirm that the click-through occurs **only** from a direct user click on the CTA button (never automatically or from gameplay key movements).

---

## 5. Offline Capabilities
- [ ] Disconnect your local machine from the internet (or check "Offline" in Chrome DevTools Network panel).
- [ ] Clear browser cache.
- [ ] Refresh `http://localhost:9999/dist/applovin.html`.
- [ ] Verify that the game boots and plays completely with full visual and audio assets without calling any external CDNs.
