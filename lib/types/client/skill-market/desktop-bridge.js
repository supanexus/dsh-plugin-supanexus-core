/** Desktop shell bridge + web Host restart API. */
import { restartHostService } from "./wire.js";
/** Whether the Electron shell exposes restartHost. */
export function canRestartHost() {
    return typeof window.whaleDesktop?.restartHost === 'function';
}
/** Request host restart when running inside the Desktop shell. */
export async function requestHostRestart() {
    const restart = window.whaleDesktop?.restartHost;
    if (typeof restart !== 'function')
        return false;
    await restart();
    return true;
}
/** Desktop shell or loopback web Host restart is available. */
export function canRequestServiceRestart() {
    return canRestartHost() || isLoopbackBrowserOrigin();
}
function isLoopbackBrowserOrigin() {
    if (typeof window === 'undefined')
        return false;
    const host = window.location.hostname.toLowerCase();
    return host === '127.0.0.1' || host === 'localhost' || host === '::1';
}
/**
 * Restart Host: Desktop bridge first, otherwise loopback restart API.
 * The web API ends the current process after spawning a detached replacement.
 */
export async function requestServiceRestart() {
    if (canRestartHost()) {
        return requestHostRestart();
    }
    await restartHostService();
    return true;
}
//# sourceMappingURL=desktop-bridge.js.map