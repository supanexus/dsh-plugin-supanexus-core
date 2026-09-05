/** Desktop shell bridge + web Host restart API. */
export interface WhaleDesktopBridge {
    readonly restartHost?: () => Promise<void>;
}
declare global {
    interface Window {
        whaleDesktop?: WhaleDesktopBridge;
    }
}
/** Whether the Electron shell exposes restartHost. */
export declare function canRestartHost(): boolean;
/** Request host restart when running inside the Desktop shell. */
export declare function requestHostRestart(): Promise<boolean>;
/** Desktop shell or loopback web Host restart is available. */
export declare function canRequestServiceRestart(): boolean;
/**
 * Restart Host: Desktop bridge first, otherwise loopback restart API.
 * The web API ends the current process after spawning a detached replacement.
 */
export declare function requestServiceRestart(): Promise<boolean>;
//# sourceMappingURL=desktop-bridge.d.ts.map