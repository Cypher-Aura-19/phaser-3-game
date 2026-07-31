import Phaser from 'phaser';
import SCENE from './scene';
import { themes } from '../themes';
import { GAME_CONFIG } from '../config';

export default class UI {
    scene: SCENE;
    helpShowing: boolean;
    fsBtnClicked: boolean;

    // UI elements
    container: Phaser.GameObjects.Container;
    scoreText: Phaser.GameObjects.Text;
    levelText: Phaser.GameObjects.Text;
    integrityText: Phaser.GameObjects.Text;
    objectiveText: Phaser.GameObjects.Text;
    helpBtn: Phaser.GameObjects.Text;
    fsBtn: Phaser.GameObjects.Text;
    ctaBtn: Phaser.GameObjects.Text;

    // Help overlay elements (created dynamically)
    helpGroup: Phaser.GameObjects.Group | null;
    helpScrollBG?: Phaser.GameObjects.Image;
    helpScroll?: Phaser.GameObjects.Image;
    clearData?: Phaser.GameObjects.Text;
    controlsText?: Phaser.GameObjects.Text;
    optsText?: Phaser.GameObjects.Text;
    optFS?: Phaser.GameObjects.Text;
    optSound?: Phaser.GameObjects.Text;
    themesText?: Phaser.GameObjects.Text;
    themeOpts: Record<string, Phaser.GameObjects.Text>;

    constructor(scene: SCENE) {  
        this.scene = scene;
        this.helpShowing = false;
        this.fsBtnClicked = false;
        this.helpGroup = null;
        this.themeOpts = {};

        const fontStyle = { 
            fontSize: '18pt', 
            color: '#FFF',
            fontFamily: GAME_CONFIG.fontFamily
        };
        
        // Create HUD texts with semantic coloring
        this.scoreText = scene.add.text(16, 16, `score: $${scene.score}`, fontStyle)
            .setTint(scene.theme.hudPrimary);
        
        this.integrityText = scene.add.text(16, 48, `integrity: ${'I'.repeat(scene.integrity)}`, fontStyle)
            .setTint(this.getIntegrityColor(scene.integrity));

        this.levelText = scene.add.text(512, 24, `level: ${scene.level} / ${scene.maxLevel}`, fontStyle)
            .setOrigin(0.5).setTint(scene.theme.hudSecondary);

        this.objectiveText = scene.add.text(512, 54, `objective: collect all currency fragments`, {
            fontSize: '12pt',
            color: '#FFF',
            fontFamily: GAME_CONFIG.fontFamily,
            fontStyle: 'italic'
        }).setOrigin(0.5).setTint(scene.theme.text);
        
        // Help button
        this.helpBtn = scene.add.text(1024 - 100, 16, '[?]', fontStyle).setOrigin(1, 0)
            .setInteractive().setTint(scene.theme.hudPrimary);
        this.helpBtn.on('pointerup', () => {            
            this.showHelp(!this.helpShowing);
        });                
        
        scene.input.keyboard?.on('keydown-X', () => {
            this.showHelp(!this.helpShowing);
        });
        scene.input.keyboard?.on('keydown-FORWARD_SLASH', () => {
            this.showHelp(!this.helpShowing);
        });

        // Fullscreen button
        const fs = this.scene.scale.isFullscreen ? '[-]' : '[+]';
        this.fsBtn = scene.add.text(1024 - 16, 16, fs, fontStyle).setOrigin(1, 0)
            .setInteractive().setTint(scene.theme.hudPrimary);
        this.fsBtn.on('pointerup', () => {
            this.toggleFullscreen();
        });
        
        scene.input.keyboard?.on('keydown-PLUS', () => {
            this.toggleFullscreen();
        });
        scene.input.keyboard?.on('keydown-MINUS', () => {
            this.toggleFullscreen();
        });

        // Add interactive hover effects
        this.applyHUDButtonHover(this.helpBtn, scene.theme.hudPrimary, scene.theme.hudSecondary);
        this.applyHUDButtonHover(this.fsBtn, scene.theme.hudPrimary, scene.theme.hudSecondary);

        document.addEventListener("fullscreenchange", () => { 
            if(this.fsBtnClicked) {
                this.fsBtnClicked = false;
            } else {       
                let fsChar = this.scene.scale.isFullscreen ? 'X' : ' ';
                if(this.helpShowing && this.optFS) {
                    this.optFS.setText(`[${fsChar}] fullscreen`);
                }
                const btnText = this.scene.scale.isFullscreen ? '[-]' : '[+]';
                this.fsBtn.setText(btnText);
            }
        });

        // CTA Button
        this.ctaBtn = scene.add.text(1024 - 200, 16, '[PLAY NOW]', fontStyle).setOrigin(1, 0)
            .setInteractive().setTint(scene.theme.collectible);
        this.ctaBtn.on('pointerup', () => {
            this.scene.openCta();
        });
        this.applyHUDButtonHover(this.ctaBtn, scene.theme.collectible, scene.theme.safe);

        this.container = scene.add.container(0, 0, [
            this.scoreText, this.integrityText, this.levelText, this.objectiveText, this.helpBtn, this.fsBtn, this.ctaBtn
        ]);
        this.container.setDepth(100);

        this.reposition(scene.scale.width, scene.scale.height);
    }

    getIntegrityColor(lives: number): number {
        if (lives >= 3) return this.scene.theme.safe;      // Green
        if (lives === 2) return this.scene.theme.warning;   // Amber
        return this.scene.theme.danger;                     // Red
    }

    applyHUDButtonHover(btn: Phaser.GameObjects.Text, normalTint: number, hoverTint: number) {
        btn.on('pointerover', () => btn.setTint(hoverTint));
        btn.on('pointerout', () => btn.setTint(normalTint));
    }

    applyMenuButtonHover(btn: Phaser.GameObjects.Text, isSelectedCheck: () => boolean) {
        btn.on('pointerover', () => btn.setTint(this.scene.theme.safe)); // Green on hover
        btn.on('pointerout', () => {
            btn.setTint(isSelectedCheck() ? this.scene.theme.hudPrimary : this.scene.theme.text);
        });
    }

    reposition(width: number, height: number) {
        this.scoreText.setPosition(16, 16);
        this.integrityText.setPosition(16, 48);
        this.levelText.setPosition(width / 2, 24);
        this.objectiveText.setPosition(width / 2, 54);
        this.helpBtn.setPosition(width - 100, 16);
        this.fsBtn.setPosition(width - 16, 16);

        if (width < 600) {
            this.ctaBtn.setOrigin(0.5, 0);
            this.ctaBtn.setPosition(width / 2, 80);
        } else {
            this.ctaBtn.setOrigin(1, 0);
            this.ctaBtn.setPosition(width - 200, 16);
        }

        if (width < 480) {
            this.scoreText.setFontSize('14pt');
            this.integrityText.setFontSize('14pt');
            this.levelText.setFontSize('14pt');
            this.objectiveText.setFontSize('9pt');
            this.helpBtn.setFontSize('14pt');
            this.fsBtn.setFontSize('14pt');
        } else {
            this.scoreText.setFontSize('18pt');
            this.integrityText.setFontSize('18pt');
            this.levelText.setFontSize('18pt');
            this.objectiveText.setFontSize('12pt');
            this.helpBtn.setFontSize('18pt');
            this.fsBtn.setFontSize('18pt');
        }

        if (this.helpShowing && this.helpGroup) {
            const centerX = width / 2;
            const centerY = height / 2;
            this.helpScrollBG?.setPosition(centerX, centerY);
            this.helpScroll?.setPosition(centerX, centerY);
            this.clearData?.setPosition(centerX + 160, centerY - 230);
            this.controlsText?.setPosition(centerX - 300, centerY - 170);
            this.optsText?.setPosition(centerX + 50, centerY - 170);
            this.optFS?.setPosition(centerX + 50, centerY - 120);
            this.optSound?.setPosition(centerX + 50, centerY - 90);
            this.themesText?.setPosition(centerX + 50, centerY - 50);

            const themeNames = Object.keys(themes);
            themeNames.forEach((name, i) => {
                const opt = this.themeOpts[name];
                if (opt) {
                    opt.setPosition(centerX + 50, centerY + (i * 30));
                }
            });
        }
    }
    
    updateScore(newScore: number) {   
        let score = this.scene.score;  
        this.scene.score = newScore;
        let diff = (newScore - score);
        let inc = diff < 0 ? -1 : 1;
        let configs: any[] = [];         

        let d = Math.abs(diff);
        for(let i = 0; i < d; i++) {
            configs.push({
                targets: this.scoreText,
                duration: 75,
                scaleY: 1.01,
                yoyo: true,
                onStart: () => {
                    score += inc; 
                    this.scoreText.setText('score: $' + score);
                    this.scene.coinFX.play();
                } 
            });
        } 
        
        this.scene.tweens.chain({
            tweens: configs,
            onComplete: () => {
                if(this.scene.tipsShowing) {
                    this.scene.tips.hideTips();
                }
            }
        });
    }

    updateLevel(level: number) {
        this.levelText.setText(`level: ${level} / ${this.scene.maxLevel}`);
    }

    updateIntegrity(integrity: number) {
        this.integrityText.setText(`integrity: ${'I'.repeat(Math.max(0, integrity))}`);
        this.integrityText.setTint(this.getIntegrityColor(integrity));

        // Add a micro-pulse scale animation to the integrity HUD text
        this.scene.tweens.add({
            targets: this.integrityText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            repeat: 1
        });
    }

    toggleFullscreen() {        
        this.fsBtnClicked = true;
        let fsChar = this.scene.scale.isFullscreen ? ' ' : 'X';
        if(this.helpShowing && this.optFS) {
            this.optFS.setText(`[${fsChar}] fullscreen`);
        }
        const btnText = this.scene.scale.isFullscreen ? '[+]' : '[-]';
        this.fsBtn.setText(btnText);
        if(this.scene.scale.isFullscreen) {
            this.scene.scale.stopFullscreen();
        } else {
            this.scene.scale.startFullscreen();
        }
    }

    showHelp(show: boolean) {     
        if(show) {   
            let fontStyle = { fontSize: '20px', color: '#FFF', fontFamily: GAME_CONFIG.fontFamily };
            let colours = this.scene.theme;

            if(this.scene.level !== 0) { 
                this.scene.physics.pause();
            }

            const centerX = this.scene.scale.width / 2;
            const centerY = this.scene.scale.height / 2;

            this.helpBtn.setText("[X]");
            this.helpScrollBG = this.scene.add.image(centerX, centerY, 'scrollBG')
                .setTint(colours.background).setDepth(97).setAlpha(0.9);
            this.helpScroll = this.scene.add.image(centerX, centerY, 'scroll')
                .setTint(colours.overlay).setDepth(98);
                
            // clear browser data button
            this.clearData = this.scene.add.text(centerX + 160, centerY - 230, ``, fontStyle).setTint(colours.hudPrimary).setInteractive().setDepth(99);
            const addClearDataBtn = () => {
                if (this.clearData) {
                    this.clearData.setText(`[DELETE DATA]`);
                    this.clearData.on('pointerup', () => {
                        localStorage.clear();
                        if (this.clearData) this.clearData.setText(``);
                    });
                    this.applyMenuButtonHover(this.clearData, () => false);
                }
            };
            if(localStorage.length) {
                addClearDataBtn();
            }

            // left side controls text
            this.controlsText = this.scene.add.text(centerX - 300, centerY - 170, `
CONTROLS:

KEYBOARD
w,a,s,d or arrow keys

TWO-FINGER TOUCH
move: hold left/right 
      side of screen
jump: tap anywhere
stomp: swipe down
            `, fontStyle).setTint(colours.text).setDepth(99);

            // right side options
            this.optsText = this.scene.add.text(centerX + 50, centerY - 170, `
OPTIONS:`, fontStyle).setTint(colours.enemy).setDepth(99);

            let fsChar = this.scene.scale.isFullscreen ? 'X' : ' ';
            this.optFS = this.scene.add.text(centerX + 50, centerY - 120, `[${fsChar}] fullscreen`,
                fontStyle).setInteractive().setTint(colours.hudPrimary).setDepth(99);
            this.optFS.on('pointerup', () => {
                this.toggleFullscreen();
            });
            this.applyMenuButtonHover(this.optFS, () => this.scene.scale.isFullscreen);

            let sChar = this.scene.soundOn === '1' ? 'X' : ' ';
            this.optSound = this.scene.add.text(centerX + 50, centerY - 90, `[${sChar}] sound`, fontStyle).setInteractive().setTint(colours.hudPrimary).setDepth(99);
            this.optSound.on('pointerup', () => {       
                let soundOn = parseInt(this.scene.soundOn);      
                soundOn = 1 - soundOn;
                sChar = soundOn ? 'X' : ' ';
                if (this.optSound) this.optSound.setText(`[${sChar}] sound`);
                this.scene.setUserData("soundOn", soundOn.toString());
                this.toggleSound();
                addClearDataBtn();
            });
            this.applyMenuButtonHover(this.optSound, () => this.scene.soundOn === '1');

            this.themesText = this.scene.add.text(centerX + 50, centerY - 50, `
THEMES:`, fontStyle).setTint(colours.enemy).setDepth(99);
            
            this.themeOpts = {};
            let themeNames = Object.keys(themes);
            themeNames.forEach((name, i) => {
                let heightOffset = centerY + (i * 30);
                let sel = (name === this.scene.themeName) ? 'X' : ' ';
                const btn = this.scene.add.text(centerX + 50, heightOffset, `[${sel}] ${name}`, fontStyle)
                    .setInteractive().setTint(sel === 'X' ? colours.hudPrimary : colours.text).setDepth(99);
                
                btn.on('pointerup', () => {
                    let cur = this.scene.themeName;
                    this.themeOpts[cur].setText(`[ ] ${cur}`).setTint(colours.text);
                    btn.setText(`[X] ${name}`).setTint(colours.hudPrimary);
                    this.changeTheme(name);
                    addClearDataBtn();
                });
                
                this.applyMenuButtonHover(btn, () => name === this.scene.themeName);
                this.themeOpts[name] = btn;
            });
            
            this.helpGroup = this.scene.add.group([
                this.helpScrollBG, 
                this.helpScroll, 
                this.controlsText, 
                this.clearData,
                this.optsText, 
                this.optFS, 
                this.optSound,
                this.themesText,
                ...Object.values(this.themeOpts)
            ]);
        } else {
            if(!this.scene.tipsShowing) this.scene.physics.resume();
            this.helpBtn.setText("[?]");
            if (this.helpGroup) {
                this.helpGroup.destroy(true, true);
                this.helpGroup = null;
            }
        }
        
        this.helpShowing = show;
    }

    toggleSound() {  
        let mute = 1 - parseInt(this.scene.soundOn);       
        (this.scene.rainFX as any).mute = (mute === 1);
        (this.scene.coinFX as any).mute = (mute === 1);
        (this.scene.deathFX as any).mute = (mute === 1);
    }

    changeTint() {
        let colours = this.scene.theme;
        this.scoreText.setTint(colours.hudPrimary);
        this.levelText.setTint(colours.hudSecondary);
        this.integrityText.setTint(this.getIntegrityColor(this.scene.integrity));
        this.objectiveText.setTint(colours.text);
        this.helpBtn.setTint(colours.hudPrimary);
        this.fsBtn.setTint(colours.hudPrimary);
        this.ctaBtn.setTint(colours.collectible);

        if(this.helpShowing) {
            this.helpScrollBG?.setTint(colours.background);
            this.helpScroll?.setTint(colours.overlay);
            this.controlsText?.setTint(colours.text);
            this.clearData?.setTint(colours.hudPrimary);
            this.optsText?.setTint(colours.enemy);
            this.optFS?.setTint(this.scene.scale.isFullscreen ? colours.hudPrimary : colours.text);
            this.optSound?.setTint(this.scene.soundOn === '1' ? colours.hudPrimary : colours.text);
            this.themesText?.setTint(colours.enemy);
            for(let key in this.themeOpts) {
                const isSelected = key === this.scene.themeName;
                this.themeOpts[key].setTint(isSelected ? colours.hudPrimary : colours.text);
            }
        }
    }

    changeTheme(themeName: string) {
        let theme = this.scene.theme = themes[themeName];
        this.scene.themeName = themeName;
        this.scene.setUserData("themeName", themeName);

        this.scene.cameras.main.setBackgroundColor(theme.background);
        this.changeTint();
        
        if(this.scene.player) this.scene.player.setTint(theme.player);
        if(this.scene.base) {
            this.scene.base.getChildren().forEach((child: any) => child.setTint(theme.ground));
        }
        if(this.scene.coins) {
            this.scene.coins.children.iterate((child: any) => {
                child.setTint(theme.collectible);
                return null;
            });
        }
        if(this.scene.platforms) {
            this.scene.platforms.children.iterate((child: any, index: number) => {
                let tint = (index % 2 === 0) ? theme.platformTop : theme.platformBody;
                child.setTint(tint);
                return null;
            });
        }
        if(this.scene.mobs) {
            this.scene.mobs.children.iterate((child: any) => {
                child.setTint(child.key === 'bomb' ? theme.danger : theme.enemy);
                return null;
            });
        }

        if(this.scene.tutorial?.active) this.scene.tutorial.changeTint();
        if(this.scene.asciiRain) this.scene.asciiRain.changeTint();

        if(this.scene.art) {
            let n = this.scene.art.length;
            for(let i = 0; i < n; i++) {
                let piece = this.scene.art[i];
                let tint = theme.sceneryPrimary;
                if (piece.texture.key.startsWith('cloud') || piece.texture.key === 'moon' || piece.texture.key === 'star') {
                    tint = theme.sceneryPrimary;
                } else if (piece.texture.key.startsWith('tree')) {
                    tint = theme.scenerySecondary;
                } else if (piece.texture.key.startsWith('flower') || piece.texture.key.startsWith('shrub') || piece.texture.key.startsWith('mushroom')) {
                    tint = (i % 2 === 0) ? theme.safe : theme.sceneryPrimary;
                }
                piece.setTint(tint);
            }
        }
    }
}
