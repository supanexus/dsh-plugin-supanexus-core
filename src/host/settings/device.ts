/** Stable device identity for harness credential idempotency. */

import { randomUUID } from 'node:crypto'
import { hostname } from 'node:os'
import type { Context } from '@deepseek-ai/cordis'
import type { Config } from '../config.ts'
import {
  DEFAULT_SETTINGS,
  SUPANEXUS_NS,
  type SupaNexusSettings,
} from './namespace.ts'

/** Read the current supanexus settings section or defaults. */
export function readSettings(ctx: Context): SupaNexusSettings {
  const settings = ctx.get('settings')
  if (settings === undefined) return { ...DEFAULT_SETTINGS }
  const section = settings.get(SUPANEXUS_NS) as SupaNexusSettings | undefined
  return section === undefined ? { ...DEFAULT_SETTINGS } : { ...section }
}

/** Ensure `deviceId` exists and return the effective device display name. */
export async function ensureDeviceIdentity(
  ctx: Context,
  config: Config,
): Promise<{ deviceId: string; deviceName: string }> {
  const settings = ctx.get('settings')
  const current = readSettings(ctx)
  const deviceName = config.deviceName.length > 0
    ? config.deviceName
    : current.deviceName.length > 0
      ? current.deviceName
      : hostname()

  if (current.deviceId.length > 0) {
    return { deviceId: current.deviceId, deviceName }
  }

  const deviceId = randomUUID()
  if (settings !== undefined) {
    await settings.update(SUPANEXUS_NS, { deviceId, deviceName })
  }
  return { deviceId, deviceName }
}

/** Allocate a new device id for re-setup when the server no longer returns plaintext. */
export async function rotateDeviceIdentity(
  ctx: Context,
  config: Config,
): Promise<{ deviceId: string; deviceName: string }> {
  const settings = ctx.get('settings')
  const current = readSettings(ctx)
  const deviceName = config.deviceName.length > 0
    ? config.deviceName
    : current.deviceName.length > 0
      ? current.deviceName
      : hostname()

  const deviceId = randomUUID()
  if (settings !== undefined) {
    await settings.update(SUPANEXUS_NS, { deviceId, deviceName })
  }
  return { deviceId, deviceName }
}

/** Patch supanexus settings after a successful auth or probe. */
export async function patchSettings(
  ctx: Context,
  patch: Partial<SupaNexusSettings>,
): Promise<void> {
  const settings = ctx.get('settings')
  if (settings === undefined) return
  await settings.update(SUPANEXUS_NS, patch)
}
