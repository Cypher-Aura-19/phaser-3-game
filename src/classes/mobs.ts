import Phaser from 'phaser';
import SCENE from './scene';

export interface MobSprite extends Phaser.Physics.Arcade.Sprite {
    key: string;
    tip: string;
    fine: number;
    button: string;
}

export default class MOBS extends Phaser.Physics.Arcade.Group {
    declare scene: SCENE;

    constructor(world: Phaser.Physics.Arcade.World, scene: SCENE, config: Phaser.Types.Physics.Arcade.PhysicsGroupConfig) {
        super(world, scene, config);
    }

    spawn(x: number, y: number, key: string, dir?: string) {
        const mob = this.create(x, y, key) as MobSprite;
        mob.setTint(key === 'bomb' ? this.scene.theme.danger : this.scene.theme.enemy);
        mob.key = key;
        
        if (key === 'bomb') {
            mob.setBounce(1, 1);
            // subtle hazard warning pulse
            this.scene.tweens.add({
                targets: mob,
                alpha: 0.7,
                yoyo: true,
                repeat: -1,
                duration: 500
            });
        } else {
            mob.setBounce(0.2, 0.2);
        }
        
        switch(key) {
            case "mob0": //witchhazel
                mob.setMass(1);
                mob.tip = `
                Witchazel is fun to kick around, but
                 watch out for its poisonous thorn!`;
                mob.fine = 5;
                mob.button = `BUY ANTIDOTE`;
                break;
            case "mob1": //scuttlebot
                {
                    let vx = (dir === 'right') ? 75 : -75;
                    mob.setVelocity(vx, 0);
                    mob.setMass(20);
                    mob.tip = `
                    Scuttlebots have a job to do, 
                      so stay out of their way!`;
                    mob.fine = 10;
                    mob.button = `PAY FINE`;
                }
                break;
            case "bomb":
                mob.setCollideWorldBounds(true);
                mob.setVelocity(-100, 50);
                mob.tip = `
                   Spiky bombs don't explode,
                but they will crush your skull!`;
                mob.fine = 15;
                mob.button = `RESURRECT`;
                break;
            default:
                break;
        }
    }
}
