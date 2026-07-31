import Phaser from 'phaser';
import TUTORIAL from './tutorial';
import UI from './ui';
import TIPS from './tips';
import PLAYER from './player';
import PLATFORMS from './platforms';
import COINS from './coins';
import MOBS from './mobs';
import ASCIIRAIN from './asciiRain';
import { LEVELS } from '../levels';
import { themes, Theme } from '../themes';
import { GAME_CONFIG } from '../config';
import { ASSETS } from '../assets';
import { MraidAdapter } from '../platform/MraidAdapter';

export default class SCENE extends Phaser.Scene {
    // Game state variables
    devMode!: number;
    level!: number;
    themeName!: string;
    soundOn!: string;
    tick!: number;
    tweening!: boolean;
    tipsShowing!: boolean;
    gameOver!: boolean;
    maxLevel!: number;
    score!: number;
    integrity!: number;
    invulnerable!: boolean;
    theme!: Theme;

    // Game objects
    ui!: UI;
    tips!: TIPS;
    base!: Phaser.Physics.Arcade.StaticGroup;
    platforms!: PLATFORMS;
    player!: PLAYER;
    coins!: COINS;
    asciiRain!: ASCIIRAIN;
    mobs!: MOBS;
    art!: Phaser.GameObjects.Image[];
    tutorial!: TUTORIAL;

    // Audio
    rainFX!: Phaser.Sound.BaseSound;
    coinFX!: Phaser.Sound.BaseSound;
    deathFX!: Phaser.Sound.BaseSound;

    // UI camera
    uiCamera!: Phaser.Cameras.Scene2D.Camera;

    constructor() {
        super("SCENE");
    }

    getUserData(item: string, defaultValue: string): string {
        let data = localStorage.getItem(item);
        if(!data && defaultValue) {
            this.setUserData(item, defaultValue);
            data = defaultValue;
        }
        return data || defaultValue;
    }

    setUserData(item: string, value: string) {        
        localStorage.setItem(item, value);
        (this as any)[item] = value;
    }

    init() {   
        this.devMode = parseInt(this.getUserData("devMode", "0")); 
        this.level = parseInt(this.getUserData("level", "0"));   
        this.themeName = this.getUserData("themeName", "Textarea");
        this.soundOn = this.getUserData("soundOn", "1");

        this.tick = 0;
        this.tweening = true;
        this.tipsShowing = false;
        this.gameOver = false;
        this.maxLevel = LEVELS.length - 1;
        this.score = this.level * 12; // 12 stars per level 
        this.theme = themes[this.themeName] || themes.Textarea;
        this.integrity = GAME_CONFIG.maxIntegrity;
        this.invulnerable = false;
        this.art = [];
    }

    preload() {          
        this.showLoadingScreen();

        // Load all images from Base64 assets
        for (const [key, value] of Object.entries(ASSETS.images)) {
            if (key === 'dude' || key === 'asciiRain') {
                const frameWidth = key === 'dude' ? 51.888 : 16.6;
                const frameHeight = key === 'dude' ? 98 : 2074;
                this.load.spritesheet(key, value, { frameWidth, frameHeight });
            } else {
                this.load.image(key, value);
            }
        }

        // Load all audio from Base64 assets
        for (const [key, value] of Object.entries(ASSETS.audio)) {
            this.load.audio(key, value);
        }
    }

    create () {       
        const world = this.physics.world;

        this.cameras.main.setBackgroundColor(this.theme.background);
        
        // Setup separate UI camera
        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.setScroll(0, 0);

        this.ui = new UI(this);
        this.tips = new TIPS(this);
        
        this.base = this.physics.add.staticGroup();
        this.base.create(512, 748, 'ground').setDepth(75).setTint(this.theme.ground);
        this.platforms = new PLATFORMS(world, this, {}); 

        this.player = new PLAYER(this, 375, 300, 'dude', 0);        
        this.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, 1024, 768, true, true, false, true); // don't collide with top of screen

        this.coins = new COINS(world, this, {
            key: 'coin',
            repeat: 11,
            setXY: { x: 42, y: 0, stepX: 85 }
        } as any);
        this.asciiRain = new ASCIIRAIN(world, this, {});
        this.mobs = new MOBS(world, this, {});
                    
        this.physics.add.collider(this.player, this.base);  
        this.physics.add.collider(this.player, this.platforms);          
        this.physics.add.collider(this.mobs, this.base); 
        this.physics.add.collider(this.mobs, this.platforms);
        this.physics.add.collider(this.coins, this.base);
        this.physics.add.collider(this.coins, this.platforms);

        this.physics.add.collider(this.mobs, this.mobs, this.mobHit, undefined, this);
        this.physics.add.collider(this.player, this.mobs, this.hitMob, undefined, this);  
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);

        if(this.level === 0) {
            this.buildLevel();
        }
        this.playTween();
        
        this.rainFX = this.sound.add('rain');
        this.coinFX = this.sound.add('coin');
        this.deathFX = this.sound.add('death');
        
        // Hide the loading indicator now that assets are loaded and scene is running
        const loadingIndicator = document.getElementById("loadingIndicator");
        if (loadingIndicator) {
            loadingIndicator.style.display = "none";
        }

        // Determine initial mute and pause state based on landing page and MRAID visibility
        const mraid = (window as any).mraid;
        const isViewable = mraid ? mraid.isViewable() : true;
        const isHidden = mraid ? mraid.getState() === 'hidden' : false;
        const landingPage = document.getElementById("landingPage");
        const isLandingPageVisible = landingPage && landingPage.style.display !== "none";

        if (!isViewable || isHidden || isLandingPageVisible) {
            this.physics.pause();
            this.sound.mute = true;
        } else {
            if (MraidAdapter.hasInteracted && this.soundOn === "1") {
                this.sound.mute = false;
                this.rainFX.play();
            } else {
                this.sound.mute = true;
            }
        }

        // Hook up sound toggling
        if (this.soundOn !== "1") {
            this.ui.toggleSound();
        }

        // Listen for landing page play button click
        const handleStartGame = () => {
            this.physics.resume();
            if (MraidAdapter.hasInteracted && this.soundOn === "1") {
                this.sound.mute = false;
                if (!this.rainFX.isPlaying) {
                    this.rainFX.play();
                }
            }
        };
        window.addEventListener('start-game', handleStartGame);

        // Listen for global user interaction to unmute audio
        const handleFirstInteraction = () => {
            const landingPageCheck = document.getElementById("landingPage");
            const isLandingPageVisibleCheck = landingPageCheck && landingPageCheck.style.display !== "none";
            const mraidCheck = (window as any).mraid;
            const isViewableCheck = mraidCheck ? mraidCheck.isViewable() : true;
            const isHiddenCheck = mraidCheck ? mraidCheck.getState() === 'hidden' : false;

            if (!isLandingPageVisibleCheck && isViewableCheck && !isHiddenCheck && this.soundOn === "1") {
                this.sound.mute = false;
                if (!this.rainFX.isPlaying) {
                    this.rainFX.play();
                }
            }
        };
        window.addEventListener('first-interaction', handleFirstInteraction);

        // Listen for MRAID viewable and state change events
        const handleViewableChange = (e: any) => {
            const viewable = e.detail.viewable;
            this.handleMraidViewable(viewable);
        };
        window.addEventListener('mraid-viewable-change', handleViewableChange);

        const handleStateChange = (e: any) => {
            const state = e.detail.state;
            this.handleMraidState(state);
        };
        window.addEventListener('mraid-state-change', handleStateChange);

        // Teardown DOM listeners on scene shutdown/destroy to prevent duplicate events or memory leaks
        const cleanup = () => {
            window.removeEventListener('start-game', handleStartGame);
            window.removeEventListener('first-interaction', handleFirstInteraction);
            window.removeEventListener('mraid-viewable-change', handleViewableChange);
            window.removeEventListener('mraid-state-change', handleStateChange);
        };
        this.events.once('shutdown', cleanup);
        this.events.once('destroy', cleanup);

        // Expose scene on window for automated acceptance tests
        (window as any).gameScene = this;

        // Configure camera visibility lists
        this.setupCameraIgnores();

        // Listen for resizing
        this.scale.on('resize', this.handleResize, this);
        this.handleResize(this.scale.gameSize);
    }

    setupCameraIgnores() {
        // UI Camera should ignore all game elements
        this.uiCamera.ignore(this.player);
        this.uiCamera.ignore(this.base.getChildren());
        this.uiCamera.ignore(this.platforms.getChildren());
        this.uiCamera.ignore(this.coins.getChildren());
        this.uiCamera.ignore(this.asciiRain.getChildren());
        this.uiCamera.ignore(this.mobs.getChildren());

        // Main camera should ignore UI container
        this.cameras.main.ignore(this.ui.container);
        
        // Also ensure any dynamically added art is ignored by UI camera
        this.art.forEach(a => this.uiCamera.ignore(a));
    }
    
    update (time: number, delta: number) { 
        if (!MraidAdapter.hasInteracted) {
            this.sound.mute = true;
        }
        if(!this.gameOver && !this.tweening) {
            this.player.move();
            if(time - this.tick > 3000) {
                this.tick = time;
                this.coins.bounce();
                if(this.level === 0) {
                    this.tutorial.changeHint();
                }
            }
        }
    }

    handleResize(gameSize: Phaser.Structs.Size) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.uiCamera.setSize(width, height);

        // Zoom the main camera to fit the 1024x768 coordinate space
        const baseWidth = 1024;
        const baseHeight = 768;
        const zoom = Math.min(width / baseWidth, height / baseHeight);

        this.cameras.main.setZoom(zoom);
        this.cameras.main.centerOn(baseWidth / 2, baseHeight / 2);

        // Re-align HUD/overlays
        if (this.ui) this.ui.reposition(width, height);
        if (this.tips) this.tips.reposition(width, height);
    }

    collectCoin(player: any, coin: any) {
        coin.body.enable = false;
        coin.active = false; // Set inactive immediately so countActive(true) detects 0 on last coin collection
        this.tweens.killTweensOf(coin);
        coin.setTint(this.theme.safe);
        this.tweens.add({
            targets: coin,
            scaleX: 1.6,
            scaleY: 1.6,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                coin.disableBody(true, true);
                coin.alpha = 1;
                coin.scaleX = 1;
                coin.scaleY = 1;
            }
        });
    
        this.ui.updateScore(this.score + 1);
        if (!this.gameOver && this.coins.countActive(true) === 0) {
            this.levelUp();
        }
    }

    hitMob(player: any, mob: any) {
        if (this.invulnerable || this.gameOver) return;

        switch(mob.key) {
            case 'mob0': // witchhazel
                if((player.x > mob.x - 25) && (player.x < mob.x + 25)) {
                    this.killPlayer(player, mob);
                }
                break;
            case 'mob1': // scuttlebot
                if(player.y + 50 > mob.y) {
                    this.killPlayer(player, mob);
                }
                break;
            default:
                this.killPlayer(player, mob);
                break;
        }
    }

    mobHit(mob1: any, mob2: any) {
        // Handle mob collisions if needed
    }

    killPlayer(player: PLAYER, mob: any) {
        this.integrity--;
        this.ui.updateIntegrity(this.integrity);
        this.deathFX.play({seek: 2.5});

        if (this.integrity <= 0) {
            this.tips.showGameOver("Integrity Depleted");
            this.cameras.main.ignore(this.tips.overlayGroup!);
            return;
        }

        this.physics.pause();
        this.invulnerable = true;
        
        // Damage flash: red (danger) then white (playerInvulnerable)
        player.setTint(this.theme.danger);
        player.anims.play('turn');

        this.time.delayedCall(250, () => {
            if (player.active) {
                player.setTint(this.theme.playerInvulnerable);
            }
        });

        this.time.delayedCall(500, () => {
            if (!player.active) return;
            player.setPosition(375, 300);
            player.setVelocity(0, 0);
            this.physics.resume();

            // Flash effect for invulnerability: alternate magenta and white with controlled blinking
            let isMagenta = true;
            const flashTimer = this.time.addEvent({
                delay: GAME_CONFIG.flashInterval,
                callback: () => {
                    if (player.active) {
                        player.setTint(isMagenta ? this.theme.player : this.theme.playerInvulnerable);
                        isMagenta = !isMagenta;
                        player.visible = !player.visible;
                    }
                },
                loop: true
            });

            this.time.delayedCall(GAME_CONFIG.invulnerabilityDuration, () => {
                flashTimer.destroy();
                if (player.active) {
                    player.visible = true;
                    this.invulnerable = false;
                    player.setTint(this.theme.player);
                }
            });
        });
    }

    levelUp() { 
        if(this.ui.helpShowing) {
            this.ui.showHelp(false);
        }

        let lvl = this.level;
        lvl++; 

        if(lvl > this.maxLevel) {
            this.tips.showVictory();
            this.cameras.main.ignore(this.tips.overlayGroup!);
        } else { 
            this.level = lvl;
            localStorage.setItem("level", this.level.toString());       
            this.ui.updateLevel(this.level);
            this.rainFX.play();
            this.playTween();
        } 
    }

    buildLevel() { 
        let lvl = this.level;
        let LEVEL = LEVELS[lvl]; 
        if(lvl === 0) {
            this.tutorial = new TUTORIAL(this, 512, -700); 
            // Main camera ignores tutorial UI because it's managed as UI
            this.uiCamera.ignore(this.tutorial);
        } else {
            if (LEVEL.plats) {
                this.platforms.build(LEVEL.plats);  
            }
        }

        if(LEVEL && LEVEL.art) {
            let n = LEVEL.art.length;
            for(let i = 0; i < n; i++){
                let artConfig = LEVEL.art[i];
                let tint = this.theme.sceneryPrimary;
                if (artConfig.key.startsWith('cloud') || artConfig.key === 'moon' || artConfig.key === 'star') {
                    tint = this.theme.sceneryPrimary;
                } else if (artConfig.key.startsWith('tree')) {
                    tint = this.theme.scenerySecondary;
                } else if (artConfig.key.startsWith('flower') || artConfig.key.startsWith('shrub') || artConfig.key.startsWith('mushroom')) {
                    tint = (i % 2 === 0) ? this.theme.safe : this.theme.sceneryPrimary;
                }
                let img = this.add.image(artConfig.x, artConfig.y, artConfig.key).setDepth(0).setOrigin(0, 1)
                    .setTint(tint);
                this.art.push(img);
                this.uiCamera.ignore(img);
            }
        }
    }

    addMobs(type: "staticMobs" | "dynamicMobs") {
        let lvl = this.level;   
        let mobs = LEVELS[lvl][type];
        if(mobs) {
            let n = mobs.length;
            for(let i = 0; i < n; i++) {
                const mobData = mobs[i];
                this.mobs.spawn(mobData[0], mobData[1], mobData[2], mobData[3]);
            }
            this.uiCamera.ignore(this.mobs.getChildren());
        }
    }

    killMobs() {
        if(this.mobs) this.mobs.clear(true, true);
    }

    demoLevel() {
        if(this.tutorial) {
            this.tutorial.active = false;
            this.tutorial.destroy();
        }
        if(this.platforms) this.platforms.clear(true, true);
        if(this.art) {
            let n = this.art.length;
            for(let i = 0; i < n; i++) {
                this.art[i].destroy();
            }
            this.art = [];
        }
    }

    playTween() {
        let params: any[] = [{
            at: 0,
            run: () => {
                this.tweening = true;
                if(!this.devMode) this.asciiRain.rain();
            }
        }, {
            at: 1500,
            run: () => {
                this.coins.rain();
            }
        }, {
            at: 3000,
            run: () => {
                this.tweening = false;
            }
        }];

        if(this.level === 0) {
            params.push({
                at: 1000,
                tween: {
                    targets: this.tutorial,
                    y: 0, 
                    ease: 'Power0',
                    duration: 2000
                }
            });
        } else {
            params.push({
                at: 0,
                run: () => {           
                    this.player.setDepth(75);
                    this.killMobs();
                }
            }, {
                at: 500,
                tween: {
                    targets: this.player,
                    x: 350,
                    ease: 'Power0',
                    duration: 1500
                }
            }, {
                at: 2000,
                run: () => {             
                    this.demoLevel();
                    this.buildLevel();
                }
            }, {
                at: 2500,
                run: () => {
                    this.addMobs("staticMobs");
                }
            }, {
                at: 4000,
                run: () => {
                    this.addMobs("dynamicMobs");
                }
            });
        }

        const timeline = this.add.timeline(params);
        timeline.play();
    }
    
    showLoadingScreen() {
        const htmlProgressBar = document.getElementById("loadingProgressBar");
        const htmlProgressText = document.getElementById("loadingProgressText");

        this.load.on('progress', (value: number) => {
            const percentage = Math.floor(value * 100);
            if (htmlProgressBar) {
                htmlProgressBar.style.width = `${percentage}%`;
            }
            if (htmlProgressText) {
                htmlProgressText.innerText = `Loading... ${percentage}%`;
            }
        });

        this.load.on('complete', () => {
            const loadingIndicator = document.getElementById("loadingIndicator");
            if (loadingIndicator) {
                loadingIndicator.style.display = "none";
            }
        });
    }

    handleMraidViewable(viewable: boolean) {
        console.log(`[DEBUG SCENE] handleMraidViewable called with viewable=${viewable}`);
        if (viewable) {
            const landingPage = document.getElementById("landingPage");
            const isLandingPageVisible = landingPage && landingPage.style.display !== "none";
            if (!isLandingPageVisible && !this.gameOver && !this.tweening && (!this.ui || !this.ui.helpShowing)) {
                this.physics.resume();
            }
            if (MraidAdapter.hasInteracted && this.soundOn === "1") {
                this.sound.mute = false;
                (this.sound as any).mraidMuted = false;
                console.log(`[DEBUG SCENE] sound.mute set to false (unmuted)`);
            }
        } else {
            this.physics.pause();
            this.sound.mute = true;
            (this.sound as any).mraidMuted = true;
            console.log(`[DEBUG SCENE] sound.mute set to true (muted), constructor: ${this.sound.constructor.name}, current: ${this.sound.mute}`);
        }
    }

    handleMraidState(state: string) {
        if (state === 'hidden') {
            this.physics.pause();
            this.sound.mute = true;
        }
    }

    openCta() {
        MraidAdapter.openCta();
    }
}
