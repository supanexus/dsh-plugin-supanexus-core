/** Harness gateway HTTP client (envelope parsing + OAuth endpoints). */
import { type SupaLine } from '../../shared/line.ts';
import type { ProviderModelEntry } from '../../shared/auth-contract.ts';
export interface TokenResult {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly expiresIn: number;
}
export interface CredentialResult {
    readonly created: boolean;
    readonly secret: string;
    readonly apiKeyId: string;
    readonly keyPrefix: string;
}
/** Map harness error codes to user-facing copy. */
export declare function messageForCode(code: string, fallback?: string): string;
/** Build the browser-opened authorize URL (GET redirect). */
export declare function buildAuthorizeUrl(line: SupaLine, params: {
    redirectUri: string;
    codeChallenge: string;
    state: string;
    deviceName?: string;
    locale?: string;
}): string;
/** Exchange authorization code for harness JWT pair. */
export declare function exchangeToken(line: SupaLine, body: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
}, locale?: string): Promise<TokenResult>;
/** Issue or reuse device API key. */
export declare function issueDeviceCredential(line: SupaLine, accessToken: string, body: {
    deviceId: string;
    deviceName: string;
}, locale?: string): Promise<CredentialResult>;
/** Rotate harness JWT pair with a refresh token (old refresh is revoked). */
export declare function refreshSession(line: SupaLine, refreshToken: string, locale?: string): Promise<TokenResult>;
export interface WalletResult {
    readonly organizationId: string;
    readonly name: string;
    readonly availableBalance: string;
    readonly currency: string;
}
/** Read organization balance for the device credential. */
export declare function fetchWallet(line: SupaLine, accessToken: string, deviceId: string, locale?: string): Promise<WalletResult>;
/**
 * Map harness `architecture.input_modalities` to pi-ai `input`.
 * Missing modalities default to text-only (safe under-claim).
 */
export declare function inputFromModalities(modalities: readonly string[] | undefined): readonly ('text' | 'image')[];
/** List models from the data plane using the device API key. */
export declare function listModels(line: SupaLine, apiKey: string): Promise<readonly ProviderModelEntry[]>;
/** Minimal fallback when model discovery fails. */
export declare const FALLBACK_MODELS: readonly ProviderModelEntry[];
//# sourceMappingURL=harness-client.d.ts.map