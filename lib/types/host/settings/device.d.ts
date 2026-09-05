/** Stable device identity for harness credential idempotency. */
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from '../config.ts';
import { type SupaNexusSettings } from './namespace.ts';
/** Read the current supanexus settings section or defaults. */
export declare function readSettings(ctx: Context): SupaNexusSettings;
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
/** Patch supanexus settings after a successful auth or probe. */
export declare function patchSettings(ctx: Context, patch: Partial<SupaNexusSettings>): Promise<void>;
//# sourceMappingURL=device.d.ts.map