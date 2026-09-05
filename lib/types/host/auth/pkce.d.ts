/** PKCE S256 helpers for harness desktop OAuth. */
/** RFC 7636 code_verifier: 43–128 unreserved characters. */
export declare function generateVerifier(length?: number): string;
/** Base64url encode without padding. */
export declare function base64UrlEncode(buffer: Buffer): string;
/** S256 code_challenge from verifier. */
export declare function challengeFromVerifier(verifier: string): string;
/** Opaque OAuth state parameter. */
export declare function generateState(): string;
/** Validate verifier shape for tests and defensive checks. */
export declare function isValidVerifier(verifier: string): boolean;
//# sourceMappingURL=pkce.d.ts.map