/** Resolve device API key secret from credential response + optional local store. */
import type { CredentialResult } from './harness-client.ts';
/** Use freshly issued secret, or reuse the locally stored device key when the server reports created=false. */
export declare function resolveDeviceSecret(credential: CredentialResult, readLocalSecret: () => Promise<string | undefined>): Promise<string>;
//# sourceMappingURL=resolve-device-secret.d.ts.map