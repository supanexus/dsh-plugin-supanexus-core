/** Browser fetch wrappers for SupaNexus host API routes. */

import {
  AUTH_START_PATH,
  AUTH_STATUS_PATH,
  type AuthStartResponse,
  type AuthStatusResponse,
} from '../../shared/auth-contract.ts'

interface OkBody {
  readonly ok: true
}

type StartBody = AuthStartResponse & OkBody
type StatusBody = AuthStatusResponse & OkBody

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
  const body = await readResponseBody(response) as T & { ok?: boolean; message?: string }
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
    throw new Error(message)
  }
  return body as T
}

/** Start OAuth flow; host resolves the pinned / auto region line. */
export async function startAuth(locale?: string): Promise<AuthStartResponse> {
  const url = new URL(AUTH_START_PATH, window.location.origin)
  if (locale !== undefined && locale.length > 0) url.searchParams.set('locale', locale)
  const response = await fetch(url)
  return parseJson<StartBody>(response)
}

/** Poll auth flow status. */
export async function fetchAuthStatus(flowId: string): Promise<AuthStatusResponse> {
  const url = new URL(AUTH_STATUS_PATH, window.location.origin)
  url.searchParams.set('flowId', flowId)
  const response = await fetch(url)
  return parseJson<StatusBody>(response)
}
