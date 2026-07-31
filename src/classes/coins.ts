import Phaser from 'phaser';
import SCENE from './scene';

export default class COINS extends Phaser.Physics.Arcade.Group {
    declare scene: SCENE;

    constructor(world: Phaser.Physics.Arcade.World, scene: SCENE, config: Phaser.Types.Physics.Arcade.PhysicsGroupConfig) {
        super(world, scene, config);
        this.children.iterate((child: any) => {
            child.setDepth(20);
            child.setTint(scene.theme.collectible);
            child.disableBody(true, true);
            return null;
        }); 
    }

    rain() {
        this.children.iterate((child: any) => {
            child.enableBody(true, child.x, Phaser.Math.FloatBetween(-25, -75), true, true);
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
            child.setVelocityY(Phaser.Math.FloatBetween(0, 250));
            child.setTint(this.scene.theme.collectible);

            // Clean up any existing tween on this coin first
            this.scene.tweens.killTweensOf(child);

            // Add persistent pulse tween
            this.scene.tweens.add({
                targets: child,
                scaleX: 1.15,
                scaleY: 1.15,
                duration: 600 + Phaser.Math.Between(-50, 50),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            return null;
        });
    }

    bounce() {
        this.children.iterate((child: any) => {
            if(child.body && child.body.touching && child.body.touching.down) {
                child.setVelocityY(Phaser.Math.FloatBetween(-25, -75));
            }
            return null;
        });
    }
}
