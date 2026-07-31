import Phaser from 'phaser';
import SCENE from './scene';

export default class ASCIIRAIN extends Phaser.Physics.Arcade.Group {
    declare scene: SCENE;
    bg: Phaser.Physics.Arcade.Image;

    constructor(world: Phaser.Physics.Arcade.World, scene: SCENE, config: Phaser.Types.Physics.Arcade.PhysicsGroupConfig) {
        super(world, scene, config);

        this.bg = scene.physics.add.image(0, 0, 'rainBG').setOrigin(0, 1);
        this.bg.setTint(scene.theme.background).setDepth(1);
        let dropWidth = 16.2;   
        let numDrops = 1024 / dropWidth;
        for(let i = 0; i < numDrops; i++) {
            let x = i * dropWidth;
            let drop = scene.physics.add.sprite(x, 0, 'asciiRain');
            drop.setDepth(50);  
            drop.setTint(scene.theme.sceneryPrimary);
            drop.disableBody(true, true); 
            this.add(drop);
        } 
    }

    rain() {
        this.bg.enableBody(true, 0, 0, true, true).setTint(this.scene.theme.background);
        this.children.iterate((child: any) => {
            child.enableBody(true, child.x, Phaser.Math.Between(-750, -1000), true, true);
            child.setVelocityY(Phaser.Math.FloatBetween(-150, 300));    
            child.setFrame(Phaser.Math.Between(0, 4));
            child.setTint(this.scene.theme.sceneryPrimary);
            return null;
        }); 
    }

    changeTint() {
        this.setTint(this.scene.theme.sceneryPrimary);
        this.bg.setTint(this.scene.theme.background);
    }
}
