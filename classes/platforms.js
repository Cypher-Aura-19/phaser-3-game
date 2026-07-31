export default class PLATFORMS extends Phaser.Physics.Arcade.StaticGroup {
    constructor(world, scene, config) {
        super(world, scene, config); 
        scene.add.existing(this); 
        scene.physics.add.existing(this);
    }

    build(platform) {
        let numPlats = platform.length;
        for(let i = 0; i < numPlats; i++) {
            let p = platform[i];
            //console.log(p);
            let plat = this.create(p.x, p.y, p.key).setOrigin(0, 0).setDepth(0).refreshBody();

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