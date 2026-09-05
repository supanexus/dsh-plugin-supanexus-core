/** Issue a device API key; rotate device_id once when the server withholds plaintext. */

import type { Context } from '@deepseek-ai/cordis'
import type { SupaLine } from '../../shared/line.ts'
import type { Config } from '../config.ts'
import { ensureDeviceIdentity, rotateDeviceIdentity } from '../settings/device.ts'
import { issueDeviceCredential, type CredentialResult } from './harness-client.ts'

export interface AcquiredDeviceSecret {
  readonly secret: string
  readonly credential: CredentialResult
  readonly deviceId: string
}

/** Issue device credential; re-issue under a fresh device_id when plaintext is withheld. */
export async function acquireDeviceSecret(
  ctx: Context,
  config: Config,
  line: SupaLine,
  accessToken: string,
  locale?: string,
): Promise<AcquiredDeviceSecret> {
  let { deviceId, deviceName } = await ensureDeviceIdentity(ctx, config)
  let credential = await issueDeviceCredential(
    line,
    accessToken,
    { deviceId, deviceName },
    locale,
  )

  if (credential.secret.length === 0) {
    const rotated = await rotateDeviceIdentity(ctx, config)
    deviceId = rotated.deviceId
    deviceName = rotated.deviceName
    credential = await issueDeviceCredential(
      line,
      accessToken,
      { deviceId, deviceName },
      locale,
    )
  }

  if (credential.secret.length === 0) {
    throw new Error('未能获取 API Key，请重新授权。')
  }

  return { secret: credential.secret, credential, deviceId }
}
