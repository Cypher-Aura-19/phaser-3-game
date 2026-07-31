import Phaser from 'phaser';
import SCENE from './scene';
import { GAME_CONFIG } from '../config';

export default class TIPS {
    scene: SCENE;
    overlayGroup: Phaser.GameObjects.Group | null = null;
    titleText: Phaser.GameObjects.Text | null = null;
    isShown: boolean = false;

    constructor(scene: SCENE) {  
        this.scene = scene;
        
        scene.input.keyboard?.on('keydown-ENTER', () => {
            if(this.isShown) {
                this.replay();
            }
        });
    }

    showGameOver(reason: string) {
        if (this.isShown) return;
        this.isShown = true;
        this.scene.gameOver = true;
        this.scene.physics.pause();
        this.scene.killMobs();

        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;
        const theme = this.scene.theme;

        const bg = this.scene.add.image(centerX, centerY, 'scrollBG').setDepth(150).setTint(theme.background).setAlpha(0.9);
        const scroll = this.scene.add.image(centerX, centerY, 'scroll').setDepth(151).setTint(theme.overlay);

        this.titleText = this.scene.add.text(centerX, centerY - 140, 'GAME OVER', {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '32pt',
            fontStyle: 'bold',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.danger);

        const reasonText = this.scene.add.text(centerX, centerY - 60, reason, {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '18pt',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.text);

        const scoreText = this.scene.add.text(centerX, centerY + 10, `Final Score: $${this.scene.score}`, {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '22pt',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.collectible);

        const ctaBtn = this.scene.add.text(centerX, centerY + 50, '[PLAY NOW]', {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '20pt',
            fontStyle: 'bold',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.collectible).setInteractive();

        ctaBtn.on('pointerup', () => {
            this.scene.openCta();
        });
        ctaBtn.on('pointerover', () => ctaBtn.setTint(theme.safe));
        ctaBtn.on('pointerout', () => ctaBtn.setTint(theme.collectible));

        const replayBtn = this.scene.add.text(centerX, centerY + 95, '[REPLAY]', {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '20pt',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.player).setInteractive();

        replayBtn.on('pointerup', () => {
            this.replay();
        });
        replayBtn.on('pointerover', () => replayBtn.setTint(theme.safe));
        replayBtn.on('pointerout', () => replayBtn.setTint(theme.player));

        const menuBtn = this.scene.add.text(centerX, centerY + 140, '[MAIN MENU]', {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '20pt',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.hudPrimary).setInteractive();

        menuBtn.on('pointerup', () => {
            this.mainMenu();
        });
        menuBtn.on('pointerover', () => menuBtn.setTint(theme.safe));
        menuBtn.on('pointerout', () => menuBtn.setTint(theme.hudPrimary));

        this.overlayGroup = this.scene.add.group([bg, scroll, this.titleText, reasonText, scoreText, ctaBtn, replayBtn, menuBtn]);
    }

    showVictory() {
        if (this.isShown) return;
        this.isShown = true;
        this.scene.gameOver = true;
        this.scene.physics.pause();
        this.scene.killMobs();

        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;
        const theme = this.scene.theme;

        const bg = this.scene.add.image(centerX, centerY, 'scrollBG').setDepth(150).setTint(theme.background).setAlpha(0.9);
        const scroll = this.scene.add.image(centerX, centerY, 'scroll').setDepth(151).setTint(theme.overlay);

        this.titleText = this.scene.add.text(centerX, centerY - 140, 'VICTORY!', {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '32pt',
            fontStyle: 'bold',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.safe);

        const congratsText = this.scene.add.text(centerX, centerY - 60, 'Welcome to Echo!', {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '18pt',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.hudPrimary);

        const scoreText = this.scene.add.text(centerX, centerY + 10, `Final Score: $${this.scene.score}`, {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '22pt',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.collectible);

        const ctaBtn = this.scene.add.text(centerX, centerY + 50, '[PLAY NOW]', {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '20pt',
            fontStyle: 'bold',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.collectible).setInteractive();

        ctaBtn.on('pointerup', () => {
            this.scene.openCta();
        });
        ctaBtn.on('pointerover', () => ctaBtn.setTint(theme.safe));
        ctaBtn.on('pointerout', () => ctaBtn.setTint(theme.collectible));

        const replayBtn = this.scene.add.text(centerX, centerY + 95, '[REPLAY]', {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '20pt',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.safe).setInteractive();

        replayBtn.on('pointerup', () => {
            this.replay();
        });
        replayBtn.on('pointerover', () => replayBtn.setTint(theme.hudSecondary));
        replayBtn.on('pointerout', () => replayBtn.setTint(theme.safe));

        const menuBtn = this.scene.add.text(centerX, centerY + 140, '[MAIN MENU]', {
            fontFamily: GAME_CONFIG.fontFamily,
            fontSize: '20pt',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(152).setTint(theme.hudPrimary).setInteractive();

        menuBtn.on('pointerup', () => {
            this.mainMenu();
        });
        menuBtn.on('pointerover', () => menuBtn.setTint(theme.safe));
        menuBtn.on('pointerout', () => menuBtn.setTint(theme.hudPrimary));

        this.overlayGroup = this.scene.add.group([bg, scroll, this.titleText, congratsText, scoreText, ctaBtn, replayBtn, menuBtn]);
    }

    reposition(width: number, height: number) {
        if (this.isShown && this.overlayGroup) {
            const centerX = width / 2;
            const centerY = height / 2;
            const children = this.overlayGroup.getChildren();
            if (children.length >= 8) {
                (children[0] as Phaser.GameObjects.Image).setPosition(centerX, centerY);
                (children[1] as Phaser.GameObjects.Image).setPosition(centerX, centerY);
                (children[2] as Phaser.GameObjects.Text).setPosition(centerX, centerY - 140);
                (children[3] as Phaser.GameObjects.Text).setPosition(centerX, centerY - 60);
                (children[4] as Phaser.GameObjects.Text).setPosition(centerX, centerY + 10);
                (children[5] as Phaser.GameObjects.Text).setPosition(centerX, centerY + 50);
                (children[6] as Phaser.GameObjects.Text).setPosition(centerX, centerY + 95);
                (children[7] as Phaser.GameObjects.Text).setPosition(centerX, centerY + 140);
            }
        }
    }

    hideTips() {
        // Stub for compatibility with UI trigger hide
    }

    replay() {
        this.isShown = false;
        this.scene.gameOver = false;
        this.scene.level = 0;
        this.scene.score = 0;
        this.scene.integrity = GAME_CONFIG.maxIntegrity;
        this.scene.setUserData("level", "0");
        this.scene.setUserData("score", "0");
        if (this.overlayGroup) {
            this.overlayGroup.destroy(true, true);
            this.overlayGroup = null;
        }
        this.titleText = null;
        this.scene.scene.restart();
    }

    mainMenu() {
        this.isShown = false;
        this.scene.gameOver = false;
        if (this.overlayGroup) {
            this.overlayGroup.destroy(true, true);
            this.overlayGroup = null;
        }
        this.titleText = null;
        
        this.scene.level = 0;
        this.scene.score = 0;
        this.scene.integrity = GAME_CONFIG.maxIntegrity;
        this.scene.setUserData("level", "0");
        this.scene.setUserData("score", "0");
        this.scene.physics.pause();
        this.scene.sound.mute = true;
        this.scene.scene.restart();

        const gameCanvas = document.getElementById("game");
        const landingPage = document.getElementById("landingPage");
        if (gameCanvas) gameCanvas.style.display = "none";
        if (landingPage) landingPage.style.display = "flex";
        
        const subtitle = document.getElementById("subtitle");
        const playBtn = document.getElementById("playBtn");
        const fineprint = document.getElementById("fineprint");
        if (subtitle) subtitle.innerText = "";
        if (playBtn) playBtn.style.opacity = "0";
        if (fineprint) fineprint.style.opacity = "0";
        
        window.dispatchEvent(new CustomEvent('show-main-menu'));
    }
}
