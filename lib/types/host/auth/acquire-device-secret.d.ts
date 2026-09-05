/** Issue a device API key; rotate device_id once when the server withholds plaintext. */
import type { Context } from '@deepseek-ai/cordis';
import type { SupaLine } from '../../shared/line.ts';
import type { Config } from '../config.ts';
import { type CredentialResult } from './harness-client.ts';
export interface AcquiredDeviceSecret {
    readonly secret: string;
    readonly credential: CredentialResult;
    readonly deviceId: string;
}
/** Issue device credential; re-issue under a fresh device_id when plaintext is withheld. */
export declare function acquireDeviceSecret(ctx: Context, config: Config, line: SupaLine, accessToken: string, locale?: string): Promise<AcquiredDeviceSecret>;
//# sourceMappingURL=acquire-device-secret.d.ts.map