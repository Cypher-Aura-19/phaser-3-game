import playGame from './game';
import titleSvg from '../assets/title.svg';
import { MraidAdapter } from './platform/MraidAdapter';

const playBtn = document.getElementById("playBtn");
const landingPage = document.getElementById("landingPage");
const gameCanvas = document.getElementById("game");
const titleLogo = document.getElementById("titleLogo") as HTMLImageElement | null;

function setupDom() {
    if (titleLogo) {
        titleLogo.src = titleSvg;
    }

    if (playBtn) {
        const devMode = parseInt(localStorage.getItem("devMode") || "0");
        if (devMode) {
            if (landingPage && gameCanvas) {
                landingPage.style.display = "none";
                gameCanvas.style.display = "flex";
            }
        }

        playBtn.onclick = () => {
            if (landingPage && gameCanvas) {
                landingPage.style.display = "none";
                gameCanvas.style.display = "flex";
                // Dispatch start-game event so scene knows to start playing audio and physics
                window.dispatchEvent(new CustomEvent('start-game'));
            }
        };
    }

    // Wire landing page CTA button
    const landingCtaBtn = document.getElementById("landingCtaBtn");
    if (landingCtaBtn) {
        landingCtaBtn.onclick = () => {
            MraidAdapter.openCta();
        };
    }

    // Start Phaser immediately to load assets and enable loading progress in custom HTML loader
    playGame();

    triggerTypewriter();
}

function bootstrap() {
    MraidAdapter.init(() => {
        setupDom();
    });
}

// In development, dynamically load MRAID 2.0 Mock first.
// Vite's tree-shaking will completely strip this block out in production build.
if (import.meta.env.DEV) {
    import('./platform/MraidMock').then((module) => {
        module.initMraidMock();
        bootstrap();
    });
} else {
    bootstrap();
}

// Support restarting from terminal state main menu
window.addEventListener('show-main-menu', () => {
    const subtitle = document.getElementById("subtitle");
    const fineprint = document.getElementById("fineprint");
    const ctaContainer = document.getElementById("ctaContainer");
    if (subtitle && playBtn && fineprint) {
        subtitle.innerText = "";
        playBtn.style.opacity = "0";
        playBtn.classList.remove("fadeIn");
        fineprint.style.opacity = "0";
        fineprint.classList.remove("fadeIn", "delayed");
        if (ctaContainer) {
            ctaContainer.style.opacity = "0";
            ctaContainer.classList.remove("fadeIn");
        }
        
        triggerTypewriter();
    }
});

function triggerTypewriter() {
    const subtitle = document.getElementById("subtitle");
    const h1 = document.getElementsByTagName('h1')[0];
    const playBtn = document.getElementById("playBtn");
    const fineprint = document.getElementById("fineprint");
    const ctaContainer = document.getElementById("ctaContainer");

    if (!subtitle || !h1 || !playBtn || !fineprint) return;

    let txt = "Where ASCII reigns";
    let rTxt = 'ains';
    let frame = 0, r = 0;

    const timer = setInterval(() => {
        if(h1.offsetWidth) {
            let startFrame = 7;
            let len0 = startFrame + txt.length;
            let pause = len0 + 3;
            let len1 = pause + 5;
            let len2 = len1 + 4;
            if(frame > startFrame && frame <= len0) {
                subtitle.innerText = txt.substring(0, frame - startFrame);                  
            } else if(frame <= pause) {
                // thinking
            } else if(frame <= len1) {
                let s = subtitle.innerText;
                let l = s.length - 1;
                subtitle.innerText = s.substring(0, l);
            } else if(frame <= len2) {
                subtitle.innerText += rTxt[r];
                r++;
            } else {
                clearInterval(timer);
                playBtn.classList.add("fadeIn");
                if (ctaContainer) {
                    ctaContainer.classList.add("fadeIn");
                }
                playBtn.focus();
                fineprint.className = "fadeIn delayed";
            }
            frame++;
        }
    }, 100);
}
