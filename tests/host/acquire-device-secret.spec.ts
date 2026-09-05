import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import { acquireDeviceSecret } from '../../src/host/auth/acquire-device-secret.ts'
import type { CredentialResult } from '../../src/host/auth/harness-client.ts'
import type { Config } from '../../src/host/config.ts'
import type { SupaLine } from '../../src/shared/line.ts'

const line: SupaLine = {
  id: 'global',
  label: 'Global',
  origin: 'http://127.0.0.1:31002',
}

const config = { deviceName: 'Test Device' } as Config

vi.mock('../../src/host/auth/harness-client.ts', () => ({
  issueDeviceCredential: vi.fn(),
}))

vi.mock('../../src/host/settings/device.ts', () => ({
  ensureDeviceIdentity: vi.fn(async () => ({
    deviceId: 'device-old',
    deviceName: 'Test Device',
  })),
  rotateDeviceIdentity: vi.fn(async () => ({
    deviceId: 'device-new',
    deviceName: 'Test Device',
  })),
}))

import { issueDeviceCredential } from '../../src/host/auth/harness-client.ts'
import { rotateDeviceIdentity } from '../../src/host/settings/device.ts'

function credential(overrides: Partial<CredentialResult>): CredentialResult {
  return {
    created: true,
    secret: 'sk-test',
    apiKeyId: 'key-1',
    keyPrefix: 'sk-',
    ...overrides,
  }
}

describe('acquireDeviceSecret', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the server secret on first issue', async () => {
    vi.mocked(issueDeviceCredential).mockResolvedValueOnce(credential({ secret: 'sk-first' }))
    const result = await acquireDeviceSecret({} as Context, config, line, 'token')
    expect(result.secret).toBe('sk-first')
    expect(rotateDeviceIdentity).not.toHaveBeenCalled()
  })

  it('rotates device id and re-issues when plaintext is withheld', async () => {
    vi.mocked(issueDeviceCredential)
      .mockResolvedValueOnce(credential({ created: false, secret: '' }))
      .mockResolvedValueOnce(credential({ created: true, secret: 'sk-rotated' }))
    const result = await acquireDeviceSecret({} as Context, config, line, 'token')
    expect(rotateDeviceIdentity).toHaveBeenCalledOnce()
    expect(result.secret).toBe('sk-rotated')
    expect(result.deviceId).toBe('device-new')
  })

  it('throws when plaintext is still missing after rotation', async () => {
    vi.mocked(issueDeviceCredential)
      .mockResolvedValueOnce(credential({ created: false, secret: '' }))
      .mockResolvedValueOnce(credential({ created: false, secret: '' }))
    await expect(acquireDeviceSecret({} as Context, config, line, 'token'))
      .rejects.toThrow('未能获取 API Key')
  })
})
