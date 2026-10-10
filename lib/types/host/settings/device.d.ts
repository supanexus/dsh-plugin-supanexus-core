/** Stable device identity for harness credential idempotency. */
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from '../config.ts';
/** Snapshot of volatile identity / connection prefs from live Config. */
export interface SupaNexusSettings {
    deviceName: string;
    deviceId: string;
    resolvedLine: string;
    resolvedAt: number;
    latencyMs: number;
    pinnedLine: string;
    apiKeyId: string;
    keyPrefix: string;
    connectedAt: number;
    showWallet: boolean;
    showBrand: boolean;
}
/** Read the current volatile Config section. */
export declare function readSettings(config: Config): SupaNexusSettings;
/** Ensure `deviceId` exists and return the effective device display name. */
export declare function ensureDeviceIdentity(ctx: Context, config: Config): Promise<{
    deviceId: string;
    deviceName: string;
}>;
/** Allocate a new device id for re-setup when the server no longer returns plaintext. */
export declare function rotateDeviceIdentity(ctx: Context, config: Config): Promise<{
    deviceId: string;
    deviceName: string;
}>;
/** Patch volatile Config fields after a successful auth or probe. */
export declare function patchSettings(ctx: Context, patch: Partial<SupaNexusSettings>): Promise<void>;
//# sourceMappingURL=device.d.ts.map