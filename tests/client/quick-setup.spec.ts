import { describe, expect, it, vi } from 'vitest'
import {
  PROVIDER_API,
  PROVIDER_DISPLAY_NAME,
  PROVIDER_NS,
  PROVIDER_ROUTE_ID,
  CREDENTIAL_REF,
} from '../../src/shared/provider.ts'
import { writeSupaNexusProvider, type SettingsWriteRemote } from '../../src/client/quick-setup/provider-write.ts'

describe('provider-write', () => {
  it('writes a single supanexus provider with the status baseURL', async () => {
    const mutate = vi.fn(async () => ({ ok: true as const, value: undefined }))
    const settings: SettingsWriteRemote = {
      describe: async () => ({
        ok: true as const,
        value: { namespaces: [{ ns: PROVIDER_NS, revision: 3 }] },
      }),
      mutate,
    }
    await writeSupaNexusProvider(settings, {
      baseURL: 'http://127.0.0.1:31002/v1',
      models: [{ id: 'supanexus/default', name: 'Default' }],
    })
    expect(mutate).toHaveBeenCalledWith(
      PROVIDER_NS,
      [{
        op: 'set',
        path: ['providers', PROVIDER_ROUTE_ID],
        value: {
          displayName: PROVIDER_DISPLAY_NAME,
          apiKeyEnv: CREDENTIAL_REF,
          api: PROVIDER_API,
          baseURL: 'http://127.0.0.1:31002/v1',
          models: [{ id: 'supanexus/default', name: 'Default' }],
        },
      }],
      3,
    )
  })

  it('unwraps describe RemoteResult before reading revision', async () => {
    const mutate = vi.fn(async () => ({ ok: true as const, value: undefined }))
    const settings: SettingsWriteRemote = {
      describe: async () => ({
        ok: true as const,
        value: {
          namespaces: [{ ns: 'other', revision: 1 }, { ns: PROVIDER_NS, revision: 7 }],
        },
      }),
      mutate,
    }
    await writeSupaNexusProvider(settings, {
      baseURL: 'http://127.0.0.1:31002/v1',
      models: [{ id: 'm1' }],
    })
    expect(mutate).toHaveBeenCalledWith(PROVIDER_NS, expect.any(Array), 7)
  })

  it('retries once on settings-conflict', async () => {
    let revision = 1
    const mutate = vi.fn(async (_ns, _ops, expected) => {
      if (expected === 1) {
        return { ok: false as const, error: { message: 'conflict', code: 'settings-conflict' } }
      }
      return { ok: true as const, value: undefined }
    })
    const settings: SettingsWriteRemote = {
      describe: async () => ({
        ok: true as const,
        value: { namespaces: [{ ns: PROVIDER_NS, revision: revision++ }] },
      }),
      mutate,
    }
    await writeSupaNexusProvider(settings, {
      baseURL: 'http://127.0.0.1:31002/v1',
      models: [{ id: 'm1' }],
    })
    expect(mutate).toHaveBeenCalledTimes(2)
  })
})
