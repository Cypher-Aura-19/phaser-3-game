class MockMraid {
    private state: 'loading' | 'default' | 'expanded' | 'resized' | 'hidden' = 'loading';
    private viewable: boolean = true;
    private listeners: Record<string, Function[]> = {};

    constructor() {
        // Dev console indicator
        console.log("[MRAID Mock] Initializing MRAID 2.0 Mock...");
        
        // Initialize mraidOpenCalls tracker
        (window as any).mraidOpenCalls = [];

        // Transition from loading to default shortly after boot
        setTimeout(() => {
            if (this.state === 'loading') {
                this.state = 'default';
                console.log("[MRAID Mock] State transitioned to 'default', triggering 'ready'");
                this.trigger('ready');
            }
        }, 300);
    }

    getState() {
        return this.state;
    }

    isViewable() {
        return this.viewable;
    }

    addEventListener(event: string, callback: (...args: any[]) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    removeEventListener(event: string, callback: Function) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    open(url: string) {
        console.log(`[MRAID Mock] open() called with URL: ${url}`);
        (window as any).mraidOpenCalls.push(url);
    }

    // Simulator helpers for tests and developer checks
    public simulateViewableChange(viewable: boolean) {
        this.viewable = viewable;
        console.log(`[MRAID Mock] Simulating viewableChange: ${viewable}`);
        this.trigger('viewableChange', viewable);
    }

    public simulateStateChange(state: 'loading' | 'default' | 'expanded' | 'resized' | 'hidden') {
        this.state = state;
        console.log(`[MRAID Mock] Simulating stateChange: ${state}`);
        this.trigger('stateChange', state);
    }

    private trigger(event: string, ...args: any[]) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(...args));
        }
    }
}

export function initMraidMock() {
    if (!(window as any).mraid) {
        const mock = new MockMraid();
        (window as any).mraid = mock;
        
        // Expose simulator helpers on window for automated browser tests
        (window as any).simulateMraidViewableChange = (viewable: boolean) => mock.simulateViewableChange(viewable);
        (window as any).simulateMraidStateChange = (state: any) => mock.simulateStateChange(state);
    }
}
