/** Resolve gateway-client / console base URLs per active line. */

import { normalizeOrigin, type SupaLine } from '../../shared/line.ts'

export interface PluginCatalogOriginConfig {
  readonly pluginCatalogOrigin: string
}

export interface ConsoleOriginConfig {
  readonly consoleOrigin: string
}

/**
 * Plugin listings live on gateway-client (`/api/v1/public/plugin-listings`),
 * while `line.origin` is often gateway-openapi (`/v1` models) in local dev.
 *
 * Priority: line.pluginCatalogOrigin → top-level pluginCatalogOrigin →
 * local `:31002` → `:31000` heuristic → line.origin.
 */
export function resolvePluginCatalogOrigin(
  config: PluginCatalogOriginConfig,
  line: SupaLine,
): string {
  const fromLine = line.pluginCatalogOrigin?.trim() ?? ''
  if (fromLine.length > 0) return normalizeOrigin(fromLine)

  const configured = config.pluginCatalogOrigin.trim()
  if (configured.length > 0) return normalizeOrigin(configured)

  const origin = normalizeOrigin(line.origin)
  try {
    const url = new URL(origin)
    // Local / dev compose: OpenAPI :31002, gateway-client BFF :31000
    if ((url.hostname === '127.0.0.1' || url.hostname === 'localhost') && url.port === '31002') {
      url.port = '31000'
      return url.origin
    }
    if (url.port === '31002') {
      url.port = '31000'
      return url.origin
    }
  } catch {
    /* fall through */
  }
  return origin
}

/**
 * Console spend-budget deep link base.
 * Priority: line.consoleOrigin → top-level consoleOrigin → empty (caller must handle).
 */
export function resolveConsoleOrigin(
  config: ConsoleOriginConfig,
  line: SupaLine,
): string {
  const fromLine = line.consoleOrigin?.trim() ?? ''
  if (fromLine.length > 0) return normalizeOrigin(fromLine)
  const configured = config.consoleOrigin.trim()
  if (configured.length > 0) return normalizeOrigin(configured)
  return ''
}
