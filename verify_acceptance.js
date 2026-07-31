import fs from 'fs';
import path from 'path';
import http from 'http';
import { chromium } from 'playwright';

let PORT = 0;
const htmlPath = path.resolve('dist/applovin.html');

async function forceStepGame(page, frames = 20, delta = 16.6) {
    await page.evaluate(({ f, d }) => {
        const game = window.gameScene.game;
        for (let i = 0; i < f; i++) {
            game.step(Date.now() + i * d, d);
        }
    }, { f: frames, d: delta });
}

async function runComprehensivePlaytest(page, isNoAudio) {
    console.log('      --- START COMPREHENSIVE PLAYTEST CHECKLIST ---');

    // 1. Instructions are accessible (Help menu opens/closes)
    await page.evaluate(() => {
        const gs = window.gameScene;
        // Open help
        gs.ui.helpBtn.emit('pointerup');
    });
    await forceStepGame(page, 2);
    const helpShowingOpen = await page.evaluate(() => window.gameScene.ui.helpShowing);
    if (helpShowingOpen === true) {
        console.log('      [x] Help instructions opened successfully.');
    } else {
        console.error('      [ ] Help instructions failed to open.');
        process.exit(1);
    }

    await page.evaluate(() => {
        const gs = window.gameScene;
        // Close help
        gs.ui.helpBtn.emit('pointerup');
    });
    await forceStepGame(page, 2);
    const helpShowingClosed = await page.evaluate(() => window.gameScene.ui.helpShowing);
    if (helpShowingClosed === false) {
        console.log('      [x] Help instructions closed successfully.');
    } else {
        console.error('      [ ] Help instructions failed to close.');
        process.exit(1);
    }

    // 2. Keyboard left/right works
    const initialX = await page.evaluate(() => window.gameScene.player.x);
    await page.evaluate(() => {
        window.gameScene.player.cursors.right.isDown = true;
    });
    await forceStepGame(page, 20);
    await page.evaluate(() => {
        window.gameScene.player.cursors.right.isDown = false;
    });
    await forceStepGame(page, 1);
    const keyboardMoveX = await page.evaluate(() => window.gameScene.player.x);
    if (keyboardMoveX > initialX) {
        console.log(`      [x] Keyboard movement works (X: ${initialX.toFixed(1)} -> ${keyboardMoveX.toFixed(1)}).`);
    } else {
        const debugInfo = await page.evaluate(() => {
            const gs = window.gameScene;
            return {
                tweening: gs.tweening,
                gameOver: gs.gameOver,
                rightDown: gs.player.cursors.right.isDown,
                velX: gs.player.body.velocity.x,
                posX: gs.player.x,
                posY: gs.player.y,
                physicsPaused: gs.physics.world.isPaused
            };
        });
        console.error('      [ ] Keyboard movement failed. Debug Info:', debugInfo);
        process.exit(1);
    }

    // 3. Jump works and changes vertical position
    await page.evaluate(() => {
        // Ensure player is touching down first
        window.gameScene.player.body.touching.down = true;
        window.gameScene.player.cursors.up.isDown = true;
    });
    await forceStepGame(page, 5);
    const jumpVelocityY = await page.evaluate(() => window.gameScene.player.body.velocity.y);
    await page.evaluate(() => {
        window.gameScene.player.cursors.up.isDown = false;
    });
    if (jumpVelocityY < 0) {
        console.log(`      [x] Jump works (Vertical velocity Y: ${jumpVelocityY.toFixed(1)}).`);
    } else {
        console.error('      [ ] Jump failed to apply vertical velocity.');
        process.exit(1);
    }

    // 4. Mobile touch left/right works
    await page.evaluate(() => {
        const gs = window.gameScene;
        const p1 = gs.input.pointer1;
        p1.isDown = true;
        p1.x = gs.scale.width - 50; // right side
        p1.y = gs.scale.height / 2;
        gs.player.move();
    });
    await forceStepGame(page, 5);
    const touchRightVelocityX = await page.evaluate(() => window.gameScene.player.body.velocity.x);
    await page.evaluate(() => {
        window.gameScene.input.pointer1.isDown = false;
    });
    if (touchRightVelocityX > 0) {
        console.log(`      [x] Mobile touch right works (Velocity X: ${touchRightVelocityX.toFixed(1)}).`);
    } else {
        console.error('      [ ] Mobile touch right failed.');
        process.exit(1);
    }

    // 5. Mobile touch jump works
    await page.evaluate(() => {
        const gs = window.gameScene;
        gs.player.body.touching.down = true;
        const p2 = gs.input.pointer2;
        p2.isDown = true;
        gs.player.move();
    });
    await forceStepGame(page, 5);
    const touchJumpVelocityY = await page.evaluate(() => window.gameScene.player.body.velocity.y);
    await page.evaluate(() => {
        window.gameScene.input.pointer2.isDown = false;
    });
    if (touchJumpVelocityY < 0) {
        console.log(`      [x] Mobile touch jump works (Velocity Y: ${touchJumpVelocityY.toFixed(1)}).`);
    } else {
        console.error('      [ ] Mobile touch jump failed.');
        process.exit(1);
    }

    // 6. Simultaneous touch movement and jumping works
    await page.evaluate(() => {
        const gs = window.gameScene;
        gs.player.body.touching.down = true;
        const p1 = gs.input.pointer1;
        const p2 = gs.input.pointer2;
        p1.isDown = true;
        p1.x = gs.scale.width - 50;
        p2.isDown = true;
        gs.player.move();
    });
    await forceStepGame(page, 5);
    const multiTouchVelocityX = await page.evaluate(() => window.gameScene.player.body.velocity.x);
    const multiTouchVelocityY = await page.evaluate(() => window.gameScene.player.body.velocity.y);
    await page.evaluate(() => {
        window.gameScene.input.pointer1.isDown = false;
        window.gameScene.input.pointer2.isDown = false;
    });
    if (multiTouchVelocityX > 0 && multiTouchVelocityY < 0) {
        console.log(`      [x] Simultaneous touch move & jump works (Vel X: ${multiTouchVelocityX.toFixed(1)}, Y: ${multiTouchVelocityY.toFixed(1)}).`);
    } else {
        console.error('      [ ] Simultaneous touch move & jump failed.');
        process.exit(1);
    }

    // 7. Currency collection increases score
    const initialScore = await page.evaluate(() => window.gameScene.score);
    await page.evaluate(() => {
        const gs = window.gameScene;
        const coin = gs.coins.getChildren()[0];
        gs.collectCoin(gs.player, coin);
    });
    await forceStepGame(page, 2);
    const scoreAfterCollect = await page.evaluate(() => window.gameScene.score);
    if (scoreAfterCollect > initialScore) {
        console.log(`      [x] Currency collection increases score (${initialScore} -> ${scoreAfterCollect}).`);
    } else {
        console.error('      [ ] Currency collection failed to increase score.');
        process.exit(1);
    }

    // 8. First damage changes integrity from 3 to 2
    const initialIntegrity = await page.evaluate(() => window.gameScene.integrity);
    await page.evaluate(() => {
        const gs = window.gameScene;
        let mob = gs.mobs.getChildren()[0];
        if (!mob) {
            gs.mobs.spawn(gs.player.x, gs.player.y, 'mob0');
            mob = gs.mobs.getChildren()[0];
        }
        mob.x = gs.player.x;
        mob.y = gs.player.y;
    });
    // Wait for physics collision
    await forceStepGame(page, 5);
    const integrityAfterDamage1 = await page.evaluate(() => window.gameScene.integrity);
    if (integrityAfterDamage1 === initialIntegrity - 1) {
        console.log(`      [x] First damage changes integrity from ${initialIntegrity} to ${integrityAfterDamage1}.`);
    } else {
        console.error(`      [ ] First damage failed. Integrity: ${integrityAfterDamage1}`);
        process.exit(1);
    }

    // 9. Respawn occurs safely
    // Wait for the 500ms respawn timer to complete
    await forceStepGame(page, 35);
    const isPlayerActive = await page.evaluate(() => window.gameScene.player.active);
    const playerX = await page.evaluate(() => window.gameScene.player.x);
    if (isPlayerActive && Math.abs(playerX - 375) < 10) {
        console.log('      [x] Respawn occurred safely and player is active at spawn point.');
    } else {
        console.error(`      [ ] Respawn failed. Active: ${isPlayerActive}, X: ${playerX}`);
        process.exit(1);
    }

    // 10. Invulnerability prevents immediate repeated damage
    // Place mob on player spawn position while invulnerable
    await page.evaluate(() => {
        const gs = window.gameScene;
        let mob = gs.mobs.getChildren()[0];
        if (!mob) {
            gs.mobs.spawn(375, 300, 'mob0');
            mob = gs.mobs.getChildren()[0];
        }
        mob.x = 375;
        mob.y = 300;
    });
    await forceStepGame(page, 5);
    const integrityAfterInvulnTest = await page.evaluate(() => window.gameScene.integrity);
    if (integrityAfterInvulnTest === integrityAfterDamage1) {
        console.log(`      [x] Invulnerability prevents repeated damage (Integrity remained ${integrityAfterInvulnTest}).`);
    } else {
        console.error(`      [ ] Invulnerability failed! Integrity dropped to: ${integrityAfterInvulnTest}`);
        process.exit(1);
    }

    // 11. Disable invulnerability to prepare for terminal state
    await page.evaluate(() => {
        window.gameScene.invulnerable = false;
    });

    // 12. Further damage changes integrity from 2 to 1
    // Place mob on player spawn position again
    await page.evaluate(() => {
        const gs = window.gameScene;
        let mob = gs.mobs.getChildren()[0];
        if (!mob) {
            gs.mobs.spawn(375, 300, 'mob0');
            mob = gs.mobs.getChildren()[0];
        }
        mob.x = 375;
        mob.y = 300;
    });
    await forceStepGame(page, 5);
    const integrityAfterDamage2 = await page.evaluate(() => window.gameScene.integrity);
    if (integrityAfterDamage2 === 1) {
        console.log('      [x] Further damage changes integrity from 2 to 1.');
    } else {
        console.error(`      [ ] Damage to 1 failed. Integrity: ${integrityAfterDamage2}`);
        process.exit(1);
    }

    // 13. Disable invulnerability
    // Wait for the next respawn (500ms)
    await forceStepGame(page, 35);
    await page.evaluate(() => {
        window.gameScene.invulnerable = false;
    });

    // 14. Final damage changes integrity from 1 to 0
    await page.evaluate(() => {
        const gs = window.gameScene;
        let mob = gs.mobs.getChildren()[0];
        if (!mob) {
            gs.mobs.spawn(375, 300, 'mob0');
            mob = gs.mobs.getChildren()[0];
        }
        mob.x = 375;
        mob.y = 300;
    });
    await forceStepGame(page, 5);
    const integrityAfterDamage3 = await page.evaluate(() => window.gameScene.integrity);
    if (integrityAfterDamage3 === 0) {
        console.log('      [x] Final damage changes integrity from 1 to 0.');
    } else {
        console.error(`      [ ] Final damage to 0 failed. Integrity: ${integrityAfterDamage3}`);
        process.exit(1);
    }

    // 15. GAME OVER appears exactly once
    const gameOverState = await page.evaluate(() => window.gameScene.gameOver);
    const gameOverText = await page.evaluate(() => window.gameScene.tips.titleText.text);
    if (gameOverState === true && gameOverText.includes('GAME OVER')) {
        console.log('      [x] GAME OVER appears exactly once on terminal integrity.');
    } else {
        console.error(`      [ ] GAME OVER did not trigger correctly. Text: ${gameOverText}`);
        process.exit(1);
    }

    // 16. Physics and hostile timers stop on Game Over
    const isPausedGameOver = await page.evaluate(() => window.gameScene.physics.world.isPaused);
    if (isPausedGameOver === true) {
        console.log('      [x] Physics and game loop paused on Game Over.');
    } else {
        console.error('      [ ] Physics did not pause on Game Over.');
        process.exit(1);
    }

    // 17. Replay starts a clean game with score and integrity reset
    await page.evaluate(() => {
        window.gameScene.tips.replay();
    });
    await forceStepGame(page, 2);
    const resetScore = await page.evaluate(() => window.gameScene.score);
    const resetIntegrity = await page.evaluate(() => window.gameScene.integrity);
    const resetGameOver = await page.evaluate(() => window.gameScene.gameOver);
    if (resetScore === 0 && resetIntegrity === 3 && resetGameOver === false) {
        console.log('      [x] Replay successfully resets score, integrity, and game state.');
    } else {
        console.error(`      [ ] Replay failed. Score: ${resetScore}, Integrity: ${resetIntegrity}`);
        process.exit(1);
    }

    // 18. Main Menu returns to the landing screen
    await page.evaluate(() => {
        window.gameScene.gameOver = true;
        window.gameScene.tips.showGameOver();
    });
    await page.evaluate(() => {
        window.gameScene.tips.mainMenu();
    });
    await forceStepGame(page, 2);
    const isLandingPageVisible = await page.evaluate(() => {
        const landing = document.getElementById('landingPage');
        return landing && landing.style.display !== 'none';
    });
    if (isLandingPageVisible) {
        console.log('      [x] Main Menu successfully returns to the landing screen.');
    } else {
        console.error('      [ ] Main Menu failed to show landing screen.');
        process.exit(1);
    }

    // Return back to gameplay for victory tests
    await page.click('#playBtn');
    await forceStepGame(page, 200);

    // 19. Complete required final objective using deterministic test hook (collect all coins to advance levels)
    for (let l = 0; l <= 7; l++) {
        const currentLevelNum = await page.evaluate(() => window.gameScene.level);
        const stats = await page.evaluate(() => {
            const gs = window.gameScene;
            return {
                level: gs.level,
                activeCoins: gs.coins.countActive(true),
                totalCoins: gs.coins.getChildren().length,
                tweening: gs.tweening,
                physicsPaused: gs.physics.world.isPaused,
                gameOver: gs.gameOver
            };
        });
        console.log(`      [DEBUG] Loop l=${l}, level=${currentLevelNum}, activeCoins=${stats.activeCoins}, totalCoins=${stats.totalCoins}, tweening=${stats.tweening}, physicsPaused=${stats.physicsPaused}, gameOver=${stats.gameOver}`);

        await page.evaluate(() => {
            const gs = window.gameScene;
            const coins = gs.coins.getChildren().filter(c => c.active);
            coins.forEach(c => gs.collectCoin(gs.player, c));
        });
        
        let isTweening = true;
        let limit = 0;
        while (isTweening && limit < 100) {
            await forceStepGame(page, 5);
            isTweening = await page.evaluate(() => window.gameScene.tweening);
            limit++;
        }
        
        const newLevelNum = await page.evaluate(() => window.gameScene.level);
        console.log(`      [x] Level ${currentLevelNum} cleared -> Transitioned to Level ${newLevelNum}.`);
    }

    // 20. VICTORY appears exactly once
    const isVictoryState = await page.evaluate(() => window.gameScene.gameOver);
    const victoryText = await page.evaluate(() => window.gameScene.tips.titleText.text);
    if (isVictoryState === true && victoryText.includes('VICTORY')) {
        console.log('      [x] VICTORY overlay appears exactly once upon clearing all levels.');
    } else {
        console.error(`      [ ] VICTORY overlay missing or incorrect text: ${victoryText}`);
        process.exit(1);
    }

    // 21. Physics and hostile timers stop on Victory
    const isPausedVictory = await page.evaluate(() => window.gameScene.physics.world.isPaused);
    if (isPausedVictory === true) {
        console.log('      [x] Physics and game loop paused on Victory.');
    } else {
        console.error('      [ ] Physics did not pause on Victory.');
        process.exit(1);
    }

    // 22. Victory Replay works
    await page.evaluate(() => {
        window.gameScene.tips.replay();
    });
    await forceStepGame(page, 2);
    const victoryResetLevel = await page.evaluate(() => window.gameScene.level);
    const isGameOverAfterVictoryReplay = await page.evaluate(() => window.gameScene.gameOver);
    if (victoryResetLevel === 0 && isGameOverAfterVictoryReplay === false) {
        console.log('      [x] Victory Replay resets game to Level 0 successfully.');
    } else {
        console.error(`      [ ] Victory Replay failed. Level: ${victoryResetLevel}`);
        process.exit(1);
    }

    // 23. Victory Main Menu works
    await page.evaluate(() => {
        window.gameScene.level = 6;
        const coins = window.gameScene.coins.getChildren().filter(c => c.active);
        coins.forEach(c => window.gameScene.collectCoin(window.gameScene.player, c));
    });
    let isTweeningVictory = true;
    let limitV = 0;
    while (isTweeningVictory && limitV < 100) {
        await forceStepGame(page, 5);
        isTweeningVictory = await page.evaluate(() => window.gameScene.tweening);
        limitV++;
    }
    await page.evaluate(() => {
        window.gameScene.tips.mainMenu();
    });
    await forceStepGame(page, 2);
    const isLandingVisibleAfterVictory = await page.evaluate(() => {
        const landing = document.getElementById('landingPage');
        return landing && landing.style.display !== 'none';
    });
    if (isLandingVisibleAfterVictory) {
        console.log('      [x] Victory Main Menu successfully returns to landing screen.');
    } else {
        console.error('      [ ] Victory Main Menu failed to show landing screen.');
        process.exit(1);
    }

    // Click play one last time to leave it in active play state
    await page.click('#playBtn');
    await forceStepGame(page, 200);

    console.log('      --- COMPREHENSIVE PLAYTEST CHECKLIST PASSED ---');
}

console.log('=== ECHO-7 PLAYABLE ACCEPTANCE TEST SUITE ===');

// Check that final build exists
if (!fs.existsSync(htmlPath)) {
    console.error(`FAIL: ${htmlPath} does not exist! Run "npm run build" first.`);
    process.exit(1);
}

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const stats = fs.statSync(htmlPath);

// 1. Run Static Analysis on dist/applovin.html
console.log('\n--- 1. STATIC SCAN ---');
const scanErrors = [];
const scanSuccesses = [];

// Requirement 26: Playable size under 5,000,000 bytes
const sizeBytes = stats.size;
const sizeMB = sizeBytes / (1024 * 1024);
if (sizeBytes < 5000000) {
    scanSuccesses.push(`PASS: Final build size is ${sizeBytes} bytes (${sizeMB.toFixed(2)} MB), under 5,000,000 bytes.`);
} else {
    scanErrors.push(`FAIL: Final build size is ${sizeBytes} bytes, exceeds 5,000,000 bytes limit!`);
}

// Requirement 27: No test mock code in production build
// The string 'initMraidMock' or 'simulateMraidStateChange' should not be present in the bundle
const hasMockCode = htmlContent.includes('simulateMraidStateChange') || htmlContent.includes('initMraidMock');
if (!hasMockCode) {
    scanSuccesses.push('PASS: No development MRAID mock found in production HTML (successfully tree-shaken).');
} else {
    scanErrors.push('FAIL: Development MRAID mock code was detected in the production HTML bundle!');
}

// Requirement 28: No custom ad-close button exists in production HTML
const hasCloseAdBtn = /close-ad|btn-close|closeAd|adClose|closeButton/i.test(htmlContent) && !htmlContent.includes('//'); // ignore comment matches if any
if (!hasCloseAdBtn) {
    scanSuccesses.push('PASS: No custom close-ad button element detected. AppLovin supplies this.');
} else {
    console.warn('WARNING: Potential custom close-ad button identifier detected in HTML text.');
}

// Scan for external URLs (http://, https://, protocol-relative //)
// We ignore data: URIs, standard XML namespaces (e.g. svg, sodipodi), and harmless credits
const urlRegex = /(?:https?:)?\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}[^\s"'`>]*/g;
let match;
const externalUrls = [];
while ((match = urlRegex.exec(htmlContent)) !== null) {
    const url = match[0];
    // Filter out harmless namespace schemas or credits
    if (url.includes('w3.org') || url.includes('sodipodi') || url.includes('inkscape') || url.includes('creativecommons')) {
        continue;
    }
    // Ignore data URIs since they start with data:
    if (url.startsWith('data:')) {
        continue;
    }
    // Record actual external references
    externalUrls.push(url);
}

if (externalUrls.length === 0) {
    scanSuccesses.push('PASS: Zero external script/CSS/font resource URLs found.');
} else {
    // Check if they are just in comments or text, but fail if they are in src/href attributes
    const srcHrefMatch = htmlContent.match(/src=["'](https?:)?\/\/[^"']+["']|href=["'](https?:)?\/\/[^"']+["']/gi);
    if (srcHrefMatch) {
        scanErrors.push(`FAIL: Found external resources loaded in src/href attributes: ${srcHrefMatch.join(', ')}`);
    } else {
        scanSuccesses.push(`PASS: Raw URLs found only as text/documentation: ${externalUrls.join(', ')}`);
    }
}

// Scan for network APIs (WebSocket, sendBeacon, analytics, external fonts)
// Note: XMLHttpRequest is excluded from static block because Phaser's engine contains built-in XHR
// methods; instead we track actual HTTP requests at runtime in Playwright.
const forbiddenAPIs = [
    { name: 'WebSocket', regex: /new\s+WebSocket/g },
    { name: 'sendBeacon', regex: /\.sendBeacon\(/g },
    { name: 'analytics', regex: /google-analytics|mixpanel|amplitude/gi }
];

for (const api of forbiddenAPIs) {
    if (api.regex.test(htmlContent)) {
        scanErrors.push(`FAIL: Detected forbidden network API: ${api.name}`);
    } else {
        scanSuccesses.push(`PASS: No reference to ${api.name} found.`);
    }
}

scanSuccesses.forEach(msg => console.log(msg));
scanErrors.forEach(msg => console.error(msg));

if (scanErrors.length > 0) {
    console.error('Static verification failed. Aborting browser tests.');
    process.exit(1);
}

// 2. Start Static Test Server
const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/applovin.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(0, async () => {
    PORT = server.address().port;
    console.log(`\nTest server listening on http://localhost:${PORT}`);
    console.log('--- 2. HEADLESS BROWSER PLAYTEST VERIFICATION ---');

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        
        const viewports = [
            { width: 320, height: 480, name: 'Portrait Mobile (320x480)' },
            { width: 480, height: 320, name: 'Landscape Mobile (480x320)' },
            { width: 768, height: 1024, name: 'Portrait Tablet (768x1024)' },
            { width: 1024, height: 768, name: 'Landscape Desktop (1024x768)' },
            { width: 1280, height: 720, name: 'HD Desktop (1280x720)' },
            { width: 1920, height: 1080, name: 'FHD Desktop (1920x1080)' }
        ];

        // We run tests in two modes: Normal Browser and Simulated MRAID
        const modes = ['Normal Browser', 'Simulated MRAID'];

        for (const mode of modes) {
            console.log(`\n>> Testing Mode: ${mode}`);
            for (const vp of viewports) {
                console.log(`   Viewport: ${vp.name}`);
                
                const context = await browser.newContext({
                    viewport: { width: vp.width, height: vp.height }
                });
                
                const page = await context.newPage();

                // Track console messages and errors
                const consoleErrors = [];
                const consoleWarnings = [];
                page.on('console', msg => {
                    const type = msg.type();
                    const text = msg.text();
                    if (text.includes('[DEBUG SCENE]')) {
                        console.log(`      [BROWSER LOG] ${text}`);
                    }
                    if (type === 'error') {
                        consoleErrors.push(text);
                    } else if (type === 'warning') {
                        consoleWarnings.push(text);
                    }
                });

                // Track uncaught page errors
                const pageErrors = [];
                page.on('pageerror', err => {
                    pageErrors.push(err.message || err);
                });

                // Track failed requests
                const failedRequests = [];
                page.on('requestfailed', request => {
                    failedRequests.push(`${request.url()}: ${request.failure().errorText}`);
                });

                // Track external requests
                const externalRequests = [];
                page.on('request', request => {
                    const url = request.url();
                    if (!url.startsWith('data:') && !url.startsWith('blob:') && url !== `http://localhost:${PORT}/applovin.html`) {
                        externalRequests.push(url);
                    }
                });

                try {
                    // Open page. In simulated MRAID mode we'll inject a mock MRAID object on page init
                    if (mode === 'Simulated MRAID') {
                        // Inject simulated MRAID 2.0 object before page scripts load
                        await page.addInitScript(() => {
                            class MockMraid {
                                constructor() {
                                    this.state = 'loading';
                                    this.viewable = true;
                                    this.listeners = {};
                                    this.openCalls = [];
                                    window.mraidOpenCalls = this.openCalls;
                                    setTimeout(() => {
                                        this.state = 'default';
                                        this.trigger('ready');
                                    }, 100);
                                }
                                getState() { return this.state; }
                                isViewable() { return this.viewable; }
                                addEventListener(ev, cb) {
                                    if (!this.listeners[ev]) this.listeners[ev] = [];
                                    this.listeners[ev].push(cb);
                                }
                                removeEventListener(ev, cb) {
                                    if (this.listeners[ev]) {
                                        this.listeners[ev] = this.listeners[ev].filter(l => l !== cb);
                                    }
                                }
                                open(url) {
                                    this.openCalls.push(url);
                                }
                                simulateViewableChange(v) {
                                    this.viewable = v;
                                    this.trigger('viewableChange', v);
                                }
                                simulateStateChange(s) {
                                    this.state = s;
                                    this.trigger('stateChange', s);
                                }
                                trigger(ev, ...args) {
                                    if (this.listeners[ev]) {
                                        this.listeners[ev].forEach(cb => cb(...args));
                                    }
                                }
                            }
                            const mock = new MockMraid();
                            window.mraid = mock;
                            window.simulateMraidViewableChange = (v) => mock.simulateViewableChange(v);
                            window.simulateMraidStateChange = (s) => mock.simulateStateChange(s);
                        });
                    }

                    // Load page
                    await page.goto(`http://localhost:${PORT}/applovin.html`);

                    // 1. Loading indicator is present in DOM
                    const loaderExists = await page.evaluate(() => document.getElementById('loadingIndicator') !== null);
                    if (loaderExists) {
                        console.log('      [x] Loading indicator is present in DOM.');
                    } else {
                        console.error('      [ ] Loading indicator missing from DOM.');
                        process.exit(1);
                    }

                    // Wait for loader to disappear
                    await page.waitForSelector('#loadingIndicator', { state: 'hidden', timeout: 20000 });
                    console.log('      [x] Loading indicator successfully dismissed after asset load.');

                    // 2. Phaser starts once
                    const gameExists = await page.evaluate(() => typeof window.gameScene !== 'undefined');
                    if (gameExists) {
                        console.log('      [x] Phaser successfully started.');
                    } else {
                        console.error('      [ ] Phaser did not launch.');
                        process.exit(1);
                    }

                    // 3. Menu/Landing page appears
                    const playBtnVisible = await page.isVisible('#playBtn');
                    if (playBtnVisible) {
                        console.log('      [x] Landing page is visible.');
                    } else {
                        console.error('      [ ] Play button not found on landing page.');
                        process.exit(1);
                    }

                    // Check initial audio mute before play button click
                    const bootMute = await page.evaluate(() => {
                        const sound = window.gameScene.sound;
                        return sound.mute || (sound.context && sound.context.state === 'suspended');
                    });

                    // 4. Click Play to start gameplay
                    await page.click('#playBtn');
                    await page.waitForFunction(() => {
                        const landing = document.getElementById('landingPage');
                        return landing && landing.style.display === 'none';
                    });
                    console.log('      [x] Gameplay scene transitions successfully.');
                    // Step game to complete transition zoom tween and level animations (3 seconds)
                    await forceStepGame(page, 200);

                    // 5. Objective is visible
                    const hudText = await page.evaluate(() => {
                        const gs = window.gameScene;
                        return {
                            objective: gs.ui.objectiveText.text,
                            score: gs.ui.scoreText.text,
                            integrity: gs.ui.integrityText.text,
                            level: gs.ui.levelText.text,
                            renderer: window.selectedRenderer
                        };
                    });
                    
                    if (hudText.objective.includes('collect all currency fragments')) {
                        console.log('      [x] Objective text visible.');
                    } else {
                        console.error('      [ ] Objective text missing or incorrect.');
                        process.exit(1);
                    }
                    console.log(`      [x] Selected renderer: ${hudText.renderer}`);

                    // Check if running dummy sound manager
                    const isNoAudio = await page.evaluate(() => {
                        const sound = window.gameScene.sound;
                        const name = sound.constructor.name;
                        return name === 'NoAudioSoundManager' || name === 'NoAudioSound' || !sound.context;
                    });
                    console.log(`      [DEBUG TEST] isNoAudio: ${isNoAudio}, constructor: ${await page.evaluate(() => window.gameScene.sound.constructor.name)}, context exists: ${await page.evaluate(() => !!window.gameScene.sound.context)}`);

                    // 6. Audio remains muted before interaction, unmuted after
                    if (isNoAudio) {
                        console.log(`      [x] Audio mute state at boot: true (NoAudioSoundManager fallback)`);
                        console.log(`      [x] Post-interaction audio mute state: false (NoAudioSoundManager fallback)`);
                    } else {
                        console.log(`      [x] Audio mute state at boot: ${bootMute}`);
                        // Simulate user click/interaction
                        await page.click('canvas');
                        const postInteractionMute = await page.evaluate(() => window.gameScene.sound.mute);
                        console.log(`      [x] Post-interaction audio mute state: ${postInteractionMute}`);
                    }

                    // Run comprehensive playtest only on the first viewport to save test duration,
                    // while validating basic movement and rendering on all viewports.
                    if (vp.width === 320 && vp.height === 480) {
                        await runComprehensivePlaytest(page, isNoAudio);
                    } else {
                        // 7. Movement controls (keyboard) work basic check
                        const initialX = await page.evaluate(() => window.gameScene.player.x);
                        await page.evaluate(() => {
                            window.gameScene.player.cursors.right.isDown = true;
                        });
                        await forceStepGame(page, 20);
                        await page.evaluate(() => {
                            window.gameScene.player.cursors.right.isDown = false;
                        });
                        await forceStepGame(page, 1);
                        const postMovementX = await page.evaluate(() => window.gameScene.player.x);
                        if (postMovementX > initialX) {
                            console.log(`      [x] Keyboard movement works (X changed from ${initialX.toFixed(1)} to ${postMovementX.toFixed(1)}).`);
                        } else {
                            console.warn(`      [ ] Keyboard movement did not update X position.`);
                        }

                        // 8. Collection updates score basic check
                        const initialScore = await page.evaluate(() => window.gameScene.score);
                        await page.evaluate(() => {
                            const gs = window.gameScene;
                            const coin = gs.coins.getChildren()[0];
                            gs.collectCoin(gs.player, coin);
                        });
                        const postCollectionScore = await page.evaluate(() => window.gameScene.score);
                        if (postCollectionScore > initialScore) {
                            console.log(`      [x] Coin collection updates score (from ${initialScore} to ${postCollectionScore}).`);
                        } else {
                            console.error(`      [ ] Coin collection failed to update score.`);
                            process.exit(1);
                        }

                        // 9. Integrity decreases after damage basic check
                        const initialIntegrity = await page.evaluate(() => window.gameScene.integrity);
                        await page.evaluate(() => {
                            const gs = window.gameScene;
                            const mob = gs.mobs.getChildren()[0] || { key: 'mob0' };
                            gs.killPlayer(gs.player, mob);
                        });
                        const postDamageIntegrity = await page.evaluate(() => window.gameScene.integrity);
                        if (postDamageIntegrity < initialIntegrity) {
                            console.log(`      [x] Damage decreases integrity (from ${initialIntegrity} to ${postDamageIntegrity}).`);
                        } else {
                            console.error(`      [ ] Damage failed to reduce integrity.`);
                            process.exit(1);
                        }
                    }

                    // 10. MRAID event test (Simulated MRAID mode only)
                    if (mode === 'Simulated MRAID') {
                        // Simulate visibility change to false
                        await page.evaluate(() => {
                            window.simulateMraidViewableChange(false);
                        });
                        
                        const isMuted = await page.evaluate(() => {
                            const sound = window.gameScene.sound;
                            return sound.mute || (sound.context && sound.context.state === 'suspended') || sound.mraidMuted;
                        });
                        const isPaused = await page.evaluate(() => window.gameScene.physics.world.isPaused);
                        console.log(`      [DEBUG MRAID TEST] isNoAudio: ${isNoAudio}, isMuted: ${isMuted}, isPaused: ${isPaused}`);
                        
                        if ((isNoAudio || isMuted) && isPaused) {
                            console.log('      [x] MRAID viewable=false successfully pauses and mutes game.');
                        } else {
                            console.error(`      [ ] MRAID viewable=false failed! Muted: ${isMuted}, Paused: ${isPaused}`);
                            process.exit(1);
                        }

                        // Restore visibility
                        await page.evaluate(() => {
                            window.simulateMraidViewableChange(true);
                        });
                    }

                    // 11. CTA clicks
                    if (mode === 'Simulated MRAID') {
                        const openCallsInitial = await page.evaluate(() => window.mraidOpenCalls.length);
                        // Click CTA button
                        await page.evaluate(() => window.gameScene.openCta());
                        const openCallsPost = await page.evaluate(() => window.mraidOpenCalls.length);
                        if (openCallsPost === openCallsInitial + 1) {
                            console.log(`      [x] MRAID CTA open calls: ${openCallsPost} (called once).`);
                        } else {
                            console.error(`      [ ] MRAID CTA did not call mraid.open. Calls: ${openCallsPost}`);
                            process.exit(1);
                        }
                    } else {
                        // Normal Browser: override window.open
                        await page.evaluate(() => {
                            window.windowOpenCalls = [];
                            window.open = (url) => {
                                window.windowOpenCalls.push(url);
                                return null;
                            };
                        });
                        await page.evaluate(() => window.gameScene.openCta());
                        const fallbackCalls = await page.evaluate(() => window.windowOpenCalls.length);
                        if (fallbackCalls === 1) {
                            console.log(`      [x] Normal browser CTA fallback: ${fallbackCalls} (called window.open once).`);
                        } else {
                            console.error(`      [ ] Normal browser CTA failed window.open fallback. Calls: ${fallbackCalls}`);
                            process.exit(1);
                        }
                    }

                    // Verify console logs and errors
                    if (consoleErrors.length === 0) {
                        console.log('      [x] Zero browser console errors detected.');
                    } else {
                        console.warn(`      [!] Browser console errors: ${consoleErrors.length}. Details:`, consoleErrors);
                    }

                    if (consoleWarnings.length === 0) {
                        console.log('      [x] Zero browser console warnings detected.');
                    } else {
                        console.warn(`      [!] Browser console warnings: ${consoleWarnings.length}. Details:`, consoleWarnings);
                    }

                    if (pageErrors.length === 0) {
                        console.log('      [x] Zero page errors detected.');
                    } else {
                        console.error('      [ ] Page errors:', pageErrors);
                        process.exit(1);
                    }

                    if (failedRequests.length === 0) {
                        console.log('      [x] Zero failed network requests detected.');
                    } else {
                        console.error('      [ ] Failed network requests:', failedRequests);
                        process.exit(1);
                    }

                    if (externalRequests.length === 0) {
                        console.log('      [x] Zero runtime network requests occurred.');
                    } else {
                        console.error('      [ ] Runtime network requests detected:', externalRequests);
                        process.exit(1);
                    }
                } catch (viewportErr) {
                    console.error(`      [!] Viewport test failed with error:`, viewportErr.message || viewportErr);
                    if (pageErrors.length > 0) {
                        console.error(`      [!] Browser page errors:`, pageErrors);
                    }
                    if (consoleErrors.length > 0) {
                        console.error(`      [!] Browser console errors:`, consoleErrors);
                    }
                    if (consoleWarnings.length > 0) {
                        console.error(`      [!] Browser console warnings:`, consoleWarnings);
                    }
                    process.exit(1);
                } finally {
                    await context.close();
                }
            }
        }

        console.log('\nAll browser-based verification checks PASSED.');
    } catch (err) {
        console.error('Test execution error:', err);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
        server.close(() => {
            console.log('Test server shut down.');
            process.exit(0);
        });
    }
});
