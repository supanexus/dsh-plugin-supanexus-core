/** Stable device identity for harness credential idempotency. */
import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
/** Read the current volatile Config section. */
export function readSettings(config) {
    return {
        deviceName: config.deviceName.get(),
        deviceId: config.deviceId.get(),
        resolvedLine: config.resolvedLine.get(),
        resolvedAt: config.resolvedAt.get(),
        latencyMs: config.latencyMs.get(),
        pinnedLine: config.pinnedLine.get(),
        apiKeyId: config.apiKeyId.get(),
        keyPrefix: config.keyPrefix.get(),
        connectedAt: config.connectedAt.get(),
        showWallet: config.showWallet.get(),
        showBrand: config.showBrand.get(),
    };
}
/** Profile entry id used by `settings.update` (Loader row id). */
function entryIdOf(ctx) {
    return ctx.fiber.entry?.options.id;
}
/** Ensure `deviceId` exists and return the effective device display name. */
export async function ensureDeviceIdentity(ctx, config) {
    const settings = ctx.get('settings');
    const current = readSettings(config);
    const configuredName = config.deviceName.get();
    const deviceName = configuredName.length > 0
        ? configuredName
        : current.deviceName.length > 0
            ? current.deviceName
            : hostname();
    if (current.deviceId.length > 0) {
        return { deviceId: current.deviceId, deviceName };
    }
    const deviceId = randomUUID();
    const entry = entryIdOf(ctx);
    if (settings !== undefined && entry !== undefined) {
        await settings.update(entry, { deviceId, deviceName });
    }
    return { deviceId, deviceName };
}
/** Allocate a new device id for re-setup when the server no longer returns plaintext. */
export async function rotateDeviceIdentity(ctx, config) {
    const settings = ctx.get('settings');
    const current = readSettings(config);
    const configuredName = config.deviceName.get();
    const deviceName = configuredName.length > 0
        ? configuredName
        : current.deviceName.length > 0
            ? current.deviceName
            : hostname();
    const deviceId = randomUUID();
    const entry = entryIdOf(ctx);
    if (settings !== undefined && entry !== undefined) {
        await settings.update(entry, { deviceId, deviceName });
    }
    return { deviceId, deviceName };
}
/** Patch volatile Config fields after a successful auth or probe. */
export async function patchSettings(ctx, patch) {
    const settings = ctx.get('settings');
    const entry = entryIdOf(ctx);
    if (settings === undefined || entry === undefined)
        return;
    await settings.update(entry, patch);
}
//# sourceMappingURL=device.js.map