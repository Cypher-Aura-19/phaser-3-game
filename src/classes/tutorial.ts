import Phaser from 'phaser';
import SCENE from './scene';

export default class TUTORIAL extends Phaser.GameObjects.Container {
    declare scene: SCENE;
    scroll: Phaser.GameObjects.Image;
    headerTxt: Phaser.GameObjects.Text;
    titleText: Phaser.GameObjects.Text;
    hint: Phaser.GameObjects.Text;
    hintIdx: number;
    hints: string[];

    constructor(scene: SCENE, x: number, y: number) {  
        super(scene, x, y);
        scene.add.existing(this);

        let theme = this.scene.theme;
        
        this.scroll = scene.add.image(0, 350, 'scroll').setTint(theme.overlay);
        this.headerTxt = scene.add.text(0, 225, 'Welcome to', {
            fontSize: '24pt', color: '#FFF'
        }).setOrigin(0.5).setTint(theme.player);                

        // ASCII-style title text — ECHO-7
        this.titleText = scene.add.text(0, 295, 'ECHO-7', {
            fontSize: '42pt',
            fontFamily: 'monospace',
            color: '#FFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setTint(theme.hudPrimary);

        this.hintIdx = 0;
        this.hints = [
            'Collect all the {$} to progress to next level',
            'Click the [+] or [-] to toggle fullscreen',
            'Click the [?] to see controls and options'
        ];
        this.hint = scene.add.text(0, 400, this.hints[0], {
            fontSize: '18pt', color: '#FFF', fontStyle: 'italic'
        }).setOrigin(0.5).setTint(theme.text);
        
        this.add([this.scroll, this.headerTxt, this.titleText, this.hint]);
        this.setDepth(0);
    }

    changeHint() {
        if(this.hintIdx < 2) {
            this.hintIdx++;
        } else {
            this.hintIdx = 0;
        }
        this.hint.setText(this.hints[this.hintIdx]);
    }

    changeTint() {
        let theme = this.scene.theme;

        this.scroll.setTint(theme.overlay);
        this.headerTxt.setTint(theme.player);
        this.titleText.setTint(theme.hudPrimary);
        this.hint.setTint(theme.text);
    }
}
