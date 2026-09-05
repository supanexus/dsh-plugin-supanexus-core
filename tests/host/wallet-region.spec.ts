import { beforeEach, describe, expect, it, vi } from 'vitest'

const settingsState = {
  deviceName: 'Mac',
  deviceId: 'device-1',
  resolvedLine: 'global',
  resolvedAt: 0,
  latencyMs: 0,
  pinnedLine: 'global',
  apiKeyId: 'key-1',
  keyPrefix: 'sk-…',
  connectedAt: 1,
  showWallet: true,
  showBrand: true,
}

vi.mock('../../src/host/settings/device.ts', () => ({
  readSettings: () => ({ ...settingsState }),
  patchSettings: async (_ctx: unknown, patch: Record<string, unknown>) => {
    Object.assign(settingsState, patch)
  },
}))

const refreshSession = vi.fn(async (line: { id: string }) => ({
  accessToken: `access-${line.id}`,
  refreshToken: `refresh-${line.id}`,
  expiresIn: 3600,
}))

const fetchWallet = vi.fn(async () => ({
  organizationId: 'org-1',
  name: 'Org',
  availableBalance: '1.00',
  currency: 'USD',
}))

vi.mock('../../src/host/auth/harness-client.ts', () => ({
  refreshSession: (...args: unknown[]) => refreshSession(...args as [never]),
  fetchWallet: (...args: unknown[]) => fetchWallet(...args as never[]),
  messageForCode: (code: string) => code,
}))

vi.mock('../../src/host/line/resolver.ts', async () => {
  const actual = await vi.importActual<typeof import('../../src/host/line/resolver.ts')>(
    '../../src/host/line/resolver.ts',
  )
  return {
    ...actual,
    resolveAuthLine: vi.fn(async () => {
      const id = settingsState.pinnedLine || settingsState.resolvedLine || 'global'
      const line = {
        id,
        label: id,
        origin: id === 'cn' ? 'https://api.supanexus.io' : 'https://api.supanexus.ai',
        harnessOrigin: id === 'cn'
          ? 'https://gateway-harness.supanexus.io'
          : 'https://gateway-harness.supanexus.ai',
        consoleOrigin: id === 'cn'
          ? 'https://console.supanexus.io'
          : 'https://console.supanexus.ai',
      }
      return {
        winner: { line, latencyMs: 0, resolvedAt: Date.now() },
        entries: [],
        source: 'user' as const,
      }
    }),
  }
})

import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { WALLET_PATH } from '../../src/shared/wallet-contract.ts'
import { CREDENTIAL_REF, REFRESH_CREDENTIAL_REF } from '../../src/shared/provider.ts'
import {
  registerWalletRoutes,
  resetWalletAccessCache,
} from '../../src/host/wallet/routes.ts'

const config = {
  lines: [
    {
      id: 'global',
      label: 'Global',
      origin: 'https://api.supanexus.ai',
      harnessOrigin: 'https://gateway-harness.supanexus.ai',
      consoleOrigin: 'https://console.supanexus.ai',
      pluginCatalogOrigin: 'https://gateway-client.supanexus.ai',
    },
    {
      id: 'cn',
      label: '中国大陆',
      origin: 'https://api.supanexus.io',
      harnessOrigin: 'https://gateway-harness.supanexus.io',
      consoleOrigin: 'https://console.supanexus.io',
      pluginCatalogOrigin: 'https://gateway-client.supanexus.io',
    },
  ],
  pinnedLine: '',
  probeTimeoutMs: 2500,
  probeCacheTtlMs: 600_000,
  deviceName: '',
  profileName: 'web',
  dshCliEntry: '',
  pluginCatalogOrigin: '',
  consoleOrigin: '',
}

function makeCtx() {
  let handler: ((request: Request) => Promise<Response>) | undefined
  const ctx = {
    effect: (fn: () => unknown) => { fn(); return () => {} },
    connection: {
      fetch: {
        register: (opts: { path: string; fetch: (request: Request) => Promise<Response> }) => {
          if (opts.path === WALLET_PATH) handler = opts.fetch
          return () => {}
        },
      },
    },
    credentials: {
      describe: async (ref: ReturnType<typeof credentialRef>) => ({
        configured: ref === credentialRef(CREDENTIAL_REF),
      }),
      resolve: async (ref: ReturnType<typeof credentialRef>) => {
        if (ref === credentialRef(REFRESH_CREDENTIAL_REF)) {
          return { value: 'refresh-token' }
        }
        return undefined
      },
      set: async () => {},
    },
  }
  return {
    ctx: ctx as never,
    callWallet: async () => {
      if (handler === undefined) throw new Error('wallet handler missing')
      return handler(new Request(`http://127.0.0.1${WALLET_PATH}`))
    },
  }
}

describe('wallet region switch', () => {
  beforeEach(() => {
    resetWalletAccessCache()
    refreshSession.mockClear()
    fetchWallet.mockClear()
    settingsState.pinnedLine = 'global'
    settingsState.resolvedLine = 'global'
  })

  it('invalidates access cache when pinnedLine changes and refreshes on the new line', async () => {
    const { ctx, callWallet } = makeCtx()
    registerWalletRoutes(ctx, config)

    const first = await callWallet()
    expect(first.status).toBe(200)
    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(refreshSession.mock.calls[0]![0]).toMatchObject({ id: 'global' })

    await callWallet()
    expect(refreshSession).toHaveBeenCalledTimes(1)

    settingsState.pinnedLine = 'cn'
    settingsState.resolvedLine = 'cn'
    const second = await callWallet()
    expect(second.status).toBe(200)
    expect(refreshSession).toHaveBeenCalledTimes(2)
    expect(refreshSession.mock.calls[1]![0]).toMatchObject({ id: 'cn' })
    expect(fetchWallet.mock.calls.at(-1)![0]).toMatchObject({ id: 'cn' })
  })
})
