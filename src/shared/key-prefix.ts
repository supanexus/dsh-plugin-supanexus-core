/** Match a live API key secret against the OAuth-stored key_prefix. */

/**
 * True when `secret` matches harness `key_prefix` (`secret[:16] + "…"` or full secret).
 * Empty `keyPrefix` cannot be checked → returns true (avoid false positives on legacy data).
 */
export function matchesStoredKeyPrefix(secret: string, keyPrefix: string): boolean {
  const raw = secret.trim()
  const prefix = keyPrefix.trim()
  if (prefix.length === 0) return true
  if (raw.length === 0) return false
  if (raw === prefix) return true
  const stem = prefix.replace(/(?:\u2026|\.\.\.)$/u, '')
  if (stem.length === 0) return false
  return raw.startsWith(stem)
}
