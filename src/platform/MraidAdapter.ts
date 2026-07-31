import { GAME_CONFIG } from '../config';

let initialized = false;

export const MraidAdapter = {
    hasInteracted: false,
    mraidPresent: false,

    init(onReady: () => void) {
        if (initialized) return;

        const bootstrap = () => {
            if (initialized) return;
            initialized = true;
            onReady();
        };

        // Setup interaction listeners
        const handleInteraction = () => {
            if (MraidAdapter.hasInteracted) return;
            MraidAdapter.hasInteracted = true;
            
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            
            window.dispatchEvent(new CustomEvent('first-interaction'));
        };
        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        // Safe check for window.mraid
        const mraid = (window as any).mraid;
        if (mraid) {
            MraidAdapter.mraidPresent = true;
            
            // Forward events to custom window events so Phaser scene can listen to them without duplication
            mraid.addEventListener('viewableChange', (viewable: boolean) => {
                window.dispatchEvent(new CustomEvent('mraid-viewable-change', { detail: { viewable } }));
            });
            mraid.addEventListener('stateChange', (state: string) => {
                window.dispatchEvent(new CustomEvent('mraid-state-change', { detail: { state } }));
            });

            const state = mraid.getState();
            if (state === 'loading') {
                // Setup timeout safety (2 seconds)
                const timeoutId = setTimeout(() => {
                    console.warn("MRAID ready event timed out, bootstrapping anyway.");
                    bootstrap();
                }, 2000);

                mraid.addEventListener('ready', () => {
                    clearTimeout(timeoutId);
                    bootstrap();
                });
            } else {
                bootstrap();
            }
        } else {
            // No MRAID, bootstrap immediately
            bootstrap();
        }
    },

    openCta() {
        const url = GAME_CONFIG.ctaUrl;
        const mraid = (window as any).mraid;
        if (mraid && typeof mraid.open === 'function') {
            mraid.open(url);
        } else {
            window.open(url, '_blank');
        }
    }
};
