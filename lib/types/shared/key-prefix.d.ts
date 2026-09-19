/** Match a live API key secret against the OAuth-stored key_prefix. */
/**
 * True when `secret` matches harness `key_prefix` (`secret[:16] + "…"` or full secret).
 * Empty `keyPrefix` cannot be checked → returns true (avoid false positives on legacy data).
 */
export declare function matchesStoredKeyPrefix(secret: string, keyPrefix: string): boolean;
//# sourceMappingURL=key-prefix.d.ts.map