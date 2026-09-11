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

  it('writes reasoningEfforts and contextWindow for GPT models', async () => {
    const mutate = vi.fn(async () => ({ ok: true as const, value: undefined }))
    const settings: SettingsWriteRemote = {
      describe: async () => ({
        ok: true as const,
        value: { namespaces: [{ ns: PROVIDER_NS, revision: 1 }] },
      }),
      mutate,
    }
    await writeSupaNexusProvider(settings, {
      baseURL: 'http://127.0.0.1:31002/v1',
      models: [{
        id: 'openai/gpt-5.6-luna',
        name: 'GPT-5.6 Luna',
        contextWindow: 1_050_000,
        input: ['text', 'image'],
        reasoningEfforts: { off: 'none', high: 'high' },
      }],
    })
    const value = mutate.mock.calls[0]?.[1]?.[0]?.value as {
      api: string
      models: Array<{ reasoningEfforts?: Record<string, string>; contextWindow?: number }>
    }
    expect(value.api).toBe(PROVIDER_API)
    expect(value.models[0]?.contextWindow).toBe(1_050_000)
    expect(value.models[0]?.reasoningEfforts?.off).toBe('none')
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
