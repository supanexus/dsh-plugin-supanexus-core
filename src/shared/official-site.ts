/** SupaNexus official marketing site (.ai / .io) from dual-line config. */

/** Production official site for the Global / .ai fleet. */
export const OFFICIAL_SITE_AI = 'https://supanexus.ai' as const

/** Production official site for the CN / .io fleet. */
export const OFFICIAL_SITE_IO = 'https://supanexus.io' as const

/**
 * Pick official site base from line id or API origin host.
 * - `cn` or `*.supanexus.io` → https://supanexus.io
 * - otherwise (incl. `global`, `*.supanexus.ai`, unset) → https://supanexus.ai
 */
export function resolveOfficialSiteBase(options: {
  readonly lineId?: string | null
  readonly lineOrigin?: string | null
} = {}): typeof OFFICIAL_SITE_AI | typeof OFFICIAL_SITE_IO {
  const id = options.lineId?.trim().toLowerCase() ?? ''
  if (id === 'cn') return OFFICIAL_SITE_IO

  const origin = options.lineOrigin?.trim().toLowerCase() ?? ''
  if (origin.includes('supanexus.io')) return OFFICIAL_SITE_IO
  if (origin.includes('supanexus.ai')) return OFFICIAL_SITE_AI

  return OFFICIAL_SITE_AI
}

/**
 * Official site URL with locale path (`/zh` or `/en`), matching official site routing.
 */
export function buildOfficialSiteUrl(options: {
  readonly lineId?: string | null
  readonly lineOrigin?: string | null
  readonly locale?: string | null
} = {}): string {
  const base = resolveOfficialSiteBase(options)
  const segment = options.locale?.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  return `${base}/${segment}`
}
