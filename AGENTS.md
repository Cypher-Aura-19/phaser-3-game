# AGENTS.md — Working Agreement

Guidance for any AI agent or developer working in this repository.

## What this project is

A Phaser 3 technical assessment playable. The game is named **Echo-7: Fragment Collector**.

The repository directory is `echo-7-playable`.

## Project rules

1. **Work only inside this project directory.** No writes outside the repo root.
2. **Do not initialize a remote or publish anything** until explicitly asked.
3. **Do not add runtime network dependencies.** The final build must be fully
   offline and single-file.
4. Do not run `git config --global` to work around the repo's dubious-ownership
   warning; pass `-c safe.directory=*` per command instead (see below).

## Environment notes

- Platform: Windows 11, PowerShell primary, Bash available.
- Node is available; the repo ships a zero-dependency dev server (`server.js`).
- Run locally: `node server.js` then open <http://localhost:9999/index.html>.
- **Git ownership quirk:** `.git` is owned by a different Windows user, so git
  commands fail with "dubious ownership". Use:
  `git -c safe.directory=* <command>`

## Assessment requirements (the bar to clear)

1. Complete 2D game/playable
2. Phaser 3
3. Final playable under 5 MB
4. Responsive across portrait and landscape
5. Clean, reusable, maintainable code
6. Clear objective
7. Explicit win and game-over states
8. Instructions and controls displayed in-game
9. Zero browser console errors or warnings
10. All runtime assets embedded as Base64/data URLs
11. One self-contained AppLovin-compatible HTML build
12. GitHub repository and complete README
13. Only legally permitted assets
14. MRAID 2.0 support with a safe browser fallback

## Conventions to follow when implementation begins

- Keep the upstream architectural strength: one scene with swappable modular
  components. Do not collapse it into a single mega-file.
- ES modules in `src/`, one class per file, `PascalCase` class names.
- No hard-coded 1024×768 assumptions in new code — derive from a layout module.
- Verify with automation, not by eye: size check and console check must be
  scripted so requirements 3 and 9 are provable.

## Verification checklist before declaring any phase done

- [ ] `node server.js` serves the game with **zero** console errors/warnings
- [ ] Build artifact is a single HTML file, offline, under 5 MB
- [ ] Portrait and landscape both playable
- [ ] Win state and game-over state both reachable and visibly distinct
- [ ] In-game instructions present
- [ ] Browser-extension console noise reported separately, not as game errors
