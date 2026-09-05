/** Browser fetch for region / line status. */

import {
  LINE_STATUS_PATH,
  type LineStatusResponse,
} from '../../shared/line-contract.ts'

interface OkBody {
  readonly ok: true
}

type StatusBody = LineStatusResponse & OkBody

async function parseJson<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { ok?: boolean; message?: string }
  if (!response.ok || body.ok === false) {
    const message = typeof body.message === 'string' && body.message.length > 0
      ? body.message
      : `HTTP ${String(response.status)}`
    throw new Error(message)
  }
  return body as T
}

/** Resolve (and auto-pin on first call) the auth region line. */
export async function fetchLineStatus(): Promise<LineStatusResponse> {
  const response = await fetch(new URL(LINE_STATUS_PATH, window.location.origin))
  return parseJson<StatusBody>(response)
}
