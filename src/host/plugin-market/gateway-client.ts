/** Fetch plugin plaza public API on gateway-client (line.origin). */

import { normalizeOrigin } from '../../shared/line.ts'
import type { PluginListingItem, PluginListingsListData, PluginCategoriesListData } from '../../shared/plugin-market-contract.ts'

interface GatewayEnvelope<T> {
  readonly code?: string
  readonly message?: string
  readonly data?: T
}

async function readGatewayJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  let body: GatewayEnvelope<T>
  try {
    body = JSON.parse(text) as GatewayEnvelope<T>
  } catch {
    const snippet = text.trim().slice(0, 160)
    throw new Error(
      snippet.length > 0 ? snippet : `HTTP ${String(response.status)}`,
    )
  }
  if (!response.ok || body.code !== 'ok' || body.data === undefined) {
    const message = typeof body.message === 'string' && body.message.length > 0
      ? body.message
      : `HTTP ${String(response.status)}`
    throw new Error(message)
  }
  return body.data
}

/** List published plugin listings. */
export async function fetchPublicListings(
  origin: string,
  params: URLSearchParams,
): Promise<PluginListingsListData> {
  const base = normalizeOrigin(origin)
  const url = `${base}/api/v1/public/plugin-listings?${params.toString()}`
  const response = await fetch(url, { method: 'GET' })
  return readGatewayJson<PluginListingsListData>(response)
}

/** Fetch one listing by install code. */
export async function fetchListingByCode(
  origin: string,
  installCode: string,
  locale?: string,
): Promise<PluginListingItem> {
  const base = normalizeOrigin(origin)
  const params = new URLSearchParams()
  if (locale !== undefined && locale.length > 0) params.set('locale', locale)
  const qs = params.size > 0 ? `?${params.toString()}` : ''
  const url = `${base}/api/v1/public/plugin-listings/by-code/${encodeURIComponent(installCode)}${qs}`
  const response = await fetch(url, { method: 'GET' })
  return readGatewayJson<PluginListingItem>(response)
}

/** List published plugin categories. */
export async function fetchPublicCategories(
  origin: string,
  params: URLSearchParams,
): Promise<PluginCategoriesListData> {
  const base = normalizeOrigin(origin)
  const url = `${base}/api/v1/public/plugin-categories?${params.toString()}`
  const response = await fetch(url, { method: 'GET' })
  return readGatewayJson<PluginCategoriesListData>(response)
}
