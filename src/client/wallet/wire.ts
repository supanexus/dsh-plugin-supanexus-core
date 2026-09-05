/** Browser fetch wrappers for wallet Host API routes. */

import {
  WALLET_PATH,
  WALLET_STATUS_PATH,
  type WalletBalanceResponse,
  type WalletStatusResponse,
} from '../../shared/wallet-contract.ts'

interface OkBody {
  readonly ok: true
}

type StatusBody = WalletStatusResponse & OkBody
type BalanceBody = WalletBalanceResponse & OkBody

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  const text = await response.text()
  if (text.length === 0) return {}
  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: text }
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const body = await readResponseBody(response) as T & {
    ok?: boolean
    message?: string
    code?: string
  }
  if (!response.ok || body.ok === false) {
    if (response.status === 404) {
      throw new Error(
        typeof body.message === 'string' && body.message.length > 0
          ? body.message
          : 'HOST_API_NOT_FOUND',
      )
    }
    const message = typeof body.message === 'string' && body.message.length > 0
      ? body.message
      : `HTTP ${String(response.status)}`
    const error = new Error(message) as Error & { code?: string }
    if (typeof body.code === 'string') error.code = body.code
    throw error
  }
  return body as T
}

/** Probe whether SupaNexus credentials exist (sidebar visibility). */
export async function fetchWalletStatus(): Promise<WalletStatusResponse> {
  const url = new URL(WALLET_STATUS_PATH, window.location.origin)
  const response = await fetch(url)
  return parseJson<StatusBody>(response)
}

/** Fetch organization balance via Host (refresh + wallet). */
export async function fetchWalletBalance(locale?: string): Promise<WalletBalanceResponse> {
  const url = new URL(WALLET_PATH, window.location.origin)
  if (locale !== undefined && locale.length > 0) url.searchParams.set('locale', locale)
  const response = await fetch(url)
  return parseJson<BalanceBody>(response)
}
