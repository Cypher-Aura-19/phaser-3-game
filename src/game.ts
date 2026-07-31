import Phaser from 'phaser';
import SCENE from './classes/scene';

function checkWebGL(): boolean {
    try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
        if (!gl) return false;

        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(fb);

        return status === gl.FRAMEBUFFER_COMPLETE;
    } catch (e) {
        return false;
    }
}

const isWebGLSupported = checkWebGL();
const rendererType = isWebGLSupported ? Phaser.WEBGL : Phaser.CANVAS;

// Record selected renderer in the automated test result without adding production console output
(window as any).selectedRenderer = isWebGLSupported ? 'webgl' : 'canvas';

const config: Phaser.Types.Core.GameConfig = {
    parent: "game",
    type: rendererType,
    width: window.innerWidth, 
    height: window.innerHeight,    
    backgroundColor: '#121212',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500, x: 0 },
            debug: false,
            fps: 60,
            fixedStep: true
        }
    },
    scene: [ SCENE ]
};

export default function playGame() {
    new Phaser.Game(config);
}
export { config };

