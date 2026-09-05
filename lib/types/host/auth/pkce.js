/** PKCE S256 helpers for harness desktop OAuth. */
import { createHash, randomBytes } from 'node:crypto';
const VERIFIER_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
const VERIFIER_LENGTH = 64;
/** RFC 7636 code_verifier: 43–128 unreserved characters. */
export function generateVerifier(length = VERIFIER_LENGTH) {
    const bytes = randomBytes(length);
    let out = '';
    for (let i = 0; i < length; i++) {
        out += VERIFIER_ALPHABET[bytes[i] % VERIFIER_ALPHABET.length];
    }
    return out;
}
/** Base64url encode without padding. */
export function base64UrlEncode(buffer) {
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
/** S256 code_challenge from verifier. */
export function challengeFromVerifier(verifier) {
    return base64UrlEncode(createHash('sha256').update(verifier).digest());
}
/** Opaque OAuth state parameter. */
export function generateState() {
    return base64UrlEncode(randomBytes(32));
}
/** Validate verifier shape for tests and defensive checks. */
export function isValidVerifier(verifier) {
    return /^[A-Za-z0-9\-._~]{43,128}$/.test(verifier);
}
//# sourceMappingURL=pkce.js.map