/** Stable device identity for harness credential idempotency. */

import { randomUUID } from 'node:crypto'
import { hostname } from 'node:os'
import type { Context } from '@deepseek-ai/cordis'
import type { Config } from '../config.ts'

/** Snapshot of volatile identity / connection prefs from live Config. */
export interface SupaNexusSettings {
  deviceName: string
  deviceId: string
  resolvedLine: string
  resolvedAt: number
  latencyMs: number
  pinnedLine: string
  apiKeyId: string
  keyPrefix: string
  connectedAt: number
  showWallet: boolean
  showBrand: boolean
}

/** Read the current volatile Config section. */
export function readSettings(config: Config): SupaNexusSettings {
  return {
    deviceName: config.deviceName.get(),
    deviceId: config.deviceId.get(),
    resolvedLine: config.resolvedLine.get(),
    resolvedAt: config.resolvedAt.get(),
    latencyMs: config.latencyMs.get(),
    pinnedLine: config.pinnedLine.get(),
    apiKeyId: config.apiKeyId.get(),
    keyPrefix: config.keyPrefix.get(),
    connectedAt: config.connectedAt.get(),
    showWallet: config.showWallet.get(),
    showBrand: config.showBrand.get(),
  }
}

/** Profile entry id used by `settings.update` (Loader row id). */
function entryIdOf(ctx: Context): string | undefined {
  return ctx.fiber.entry?.options.id
}

/** Ensure `deviceId` exists and return the effective device display name. */
export async function ensureDeviceIdentity(
  ctx: Context,
  config: Config,
): Promise<{ deviceId: string; deviceName: string }> {
  const settings = ctx.get('settings')
  const current = readSettings(config)
  const configuredName = config.deviceName.get()
  const deviceName = configuredName.length > 0
    ? configuredName
    : current.deviceName.length > 0
      ? current.deviceName
      : hostname()

  if (current.deviceId.length > 0) {
    return { deviceId: current.deviceId, deviceName }
  }

  const deviceId = randomUUID()
  const entry = entryIdOf(ctx)
  if (settings !== undefined && entry !== undefined) {
    await settings.update(entry, { deviceId, deviceName })
  }
  return { deviceId, deviceName }
}

/** Allocate a new device id for re-setup when the server no longer returns plaintext. */
export async function rotateDeviceIdentity(
  ctx: Context,
  config: Config,
): Promise<{ deviceId: string; deviceName: string }> {
  const settings = ctx.get('settings')
  const current = readSettings(config)
  const configuredName = config.deviceName.get()
  const deviceName = configuredName.length > 0
    ? configuredName
    : current.deviceName.length > 0
      ? current.deviceName
      : hostname()

  const deviceId = randomUUID()
  const entry = entryIdOf(ctx)
  if (settings !== undefined && entry !== undefined) {
    await settings.update(entry, { deviceId, deviceName })
  }
  return { deviceId, deviceName }
}

/** Patch volatile Config fields after a successful auth or probe. */
export async function patchSettings(
  ctx: Context,
  patch: Partial<SupaNexusSettings>,
): Promise<void> {
  const settings = ctx.get('settings')
  const entry = entryIdOf(ctx)
  if (settings === undefined || entry === undefined) return
  await settings.update(entry, patch)
}
