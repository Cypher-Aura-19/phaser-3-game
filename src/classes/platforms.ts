import Phaser from 'phaser';
import SCENE from './scene';
import { PlatConfig } from '../levels';

export default class PLATFORMS extends Phaser.Physics.Arcade.StaticGroup {
    declare scene: SCENE;

    constructor(world: Phaser.Physics.Arcade.World, scene: SCENE, config: Phaser.Types.Physics.Arcade.PhysicsGroupConfig) {
        super(world, scene, config);
    }

    build(platform: PlatConfig[]) {
        let numPlats = platform.length;
        for(let i = 0; i < numPlats; i++) {
            let p = platform[i];
            let plat = this.create(p.x, p.y, p.key).setOrigin(0, 0).setDepth(0).refreshBody();

            // Alternate color tints of floating platforms purposefully
            let tint = (i % 2 === 0) ? this.scene.theme.platformTop : this.scene.theme.platformBody;
            plat.setTint(tint);

            // can jump up through
            if(p.key === 'platform0') { // !!!!!!!
                // Only allow collision when falling onto the platform
                plat.body.checkCollision.up = true;
                plat.body.checkCollision.down = false;
                plat.body.checkCollision.left = false;
                plat.body.checkCollision.right = false;
            }
        }
    }
}
