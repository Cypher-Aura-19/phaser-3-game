/** Core game constants — edit here to tune gameplay without touching scene logic. */
export const GAME_CONFIG = {
    parent: "game",
    width: 1024,
    height: 768,
    backgroundColor: '#121212',
    
    // Gameplay constants
    playerSpeed: 260,
    playerJumpVelocity: -400,
    playerStompVelocity: 330,
    gravityY: 500,
    maxIntegrity: 3,
    invulnerabilityDuration: 1500, // ms
    flashInterval: 100, // ms
    
    // Level & scoring constants
    coinsPerLevel: 12,
    
    // UI Styling constants
    fontFamily: 'monospace',
    uiFontSize: '24pt',
    titleFontSize: 'xx-large',
    
    // Local storage keys
    storageKeys: {
        devMode: 'devMode',
        level: 'level',
        themeName: 'themeName',
        soundOn: 'soundOn'
    },
    
    // Centralized CTA Destination URL (AppLovin click-through)
    // Replace this placeholder with the actual campaign/store URL before submission.
    ctaUrl: 'https://www.applovin.com'
};

