// Import images
import scroll from '../assets/tutorialUI/scroll.png';
import scrollBG from '../assets/tutorialUI/scrollBG.png';
import dude from '../assets/dude/dude.png';
import ground from '../assets/platforms/ground.png';
import platform0 from '../assets/platforms/platform0.png';
import platform1 from '../assets/platforms/platform1.png';
import platform2 from '../assets/platforms/platform2.png';
import platform3 from '../assets/platforms/platform3.png';
import platform4 from '../assets/platforms/platform4.png';
import platform5 from '../assets/platforms/platform5.png';
import platform6 from '../assets/platforms/platform6.png';
import platform7 from '../assets/platforms/platform7.png';
import coin from '../assets/mobs/coin.png';
import mob0 from '../assets/mobs/mob0.png';
import mob1 from '../assets/mobs/mob1.png';
import bomb from '../assets/mobs/bomb.png';
import asciiRain from '../assets/asciiRain/asciiRain.png';
import rainBG from '../assets/asciiRain/rainBG.png';

// Import art
import cloud0 from '../assets/art/cloud0.png';
import cloud1 from '../assets/art/cloud1.png';
import tree0 from '../assets/art/tree0.png';
import tree1 from '../assets/art/tree1.png';
import tree2 from '../assets/art/tree2.png';
import tree3 from '../assets/art/tree3.png';
import shrub0 from '../assets/art/shrub0.png';
import mushroom0 from '../assets/art/mushroom0.png';
import mushroom1 from '../assets/art/mushroom1.png';
import flower0 from '../assets/art/flower0.png';
import flower1 from '../assets/art/flower1.png';
import flower2 from '../assets/art/flower2.png';
import flower3 from '../assets/art/flower3.png';
import flower4 from '../assets/art/flower4.png';
import tower0 from '../assets/art/tower0.png';
import hut from '../assets/art/hut.png';
import rat from '../assets/art/rat.png';
import wagon from '../assets/art/wagon.png';
import moon from '../assets/art/moon.png';
import star from '../assets/art/star.png';
import barn from '../assets/art/barn.png';

// Import audio
import rainAudio from '../assets/soundFX/asciiRain.mp3';
import coinAudio from '../assets/soundFX/collectCoin.mp3';
import deathAudio from '../assets/soundFX/death.mp3';

export const ASSETS = {
    images: {
        scroll,
        scrollBG,
        dude,
        ground,
        platform0,
        platform1,
        platform2,
        platform3,
        platform4,
        platform5,
        platform6,
        platform7,
        coin,
        mob0,
        mob1,
        bomb,
        asciiRain,
        rainBG,
        cloud0,
        cloud1,
        tree0,
        tree1,
        tree2,
        tree3,
        shrub0,
        mushroom0,
        mushroom1,
        flower0,
        flower1,
        flower2,
        flower3,
        flower4,
        tower0,
        hut,
        rat,
        wagon,
        moon,
        star,
        barn
    },
    audio: {
        rain: rainAudio,
        coin: coinAudio,
        death: deathAudio
    }
};
export type AssetKey = keyof typeof ASSETS.images | keyof typeof ASSETS.audio;
