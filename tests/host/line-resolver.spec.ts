import { beforeEach, describe, expect, it, vi } from 'vitest'

const settingsState = {
  deviceName: '',
  deviceId: '',
  resolvedLine: '',
  resolvedAt: 0,
  latencyMs: 0,
  pinnedLine: '',
  apiKeyId: '',
  keyPrefix: '',
  connectedAt: 0,
  showWallet: false,
  showBrand: true,
}

const patchSettings = vi.fn(async (ctx: unknown, patch: Record<string, unknown>) => {
  Object.assign(settingsState, patch)
})

vi.mock('../../src/host/settings/device.ts', () => ({
  readSettings: () => ({ ...settingsState }),
  patchSettings: (ctx: unknown, patch: Record<string, unknown>) => patchSettings(ctx, patch),
  ensureDeviceIdentity: async () => ({ deviceId: 'device-1', deviceName: 'test' }),
}))

import {
  isAuthLineLocked,
  probeLine,
  resetEnvLineCache,
  resetLineCache,
  resolveAuthLine,
  resolveEnvLine,
} from '../../src/host/line/resolver.ts'
import type { SupaLine } from '../../src/shared/line.ts'

const DEFAULT_LINES: SupaLine[] = [
  {
    id: 'global',
    label: 'Global',
    origin: 'https://api.supanexus.ai',
    harnessOrigin: 'https://gateway-harness.supanexus.ai',
  },
  {
    id: 'cn',
    label: '中国大陆',
    origin: 'https://api.supanexus.io',
    harnessOrigin: 'https://gateway-harness.supanexus.io',
  },
]

const baseConfig = {
  lines: [...DEFAULT_LINES],
  pinnedLine: '',
  probeTimeoutMs: 2500,
  probeCacheTtlMs: 600_000,
  deviceName: '',
  profileName: 'web',
  dshCliEntry: '',
  pluginCatalogOrigin: '',
  consoleOrigin: '',
}

const globalLine = DEFAULT_LINES[0]!

function mockCtx() {
  return {} as never
}

function resetSettings(): void {
  settingsState.deviceName = ''
  settingsState.deviceId = ''
  settingsState.resolvedLine = ''
  settingsState.resolvedAt = 0
  settingsState.latencyMs = 0
  settingsState.pinnedLine = ''
  settingsState.apiKeyId = ''
  settingsState.keyPrefix = ''
  settingsState.connectedAt = 0
  settingsState.showWallet = false
  settingsState.showBrand = true
  patchSettings.mockClear()
}

describe('line-resolver', () => {
  beforeEach(() => {
    resetLineCache()
    resetEnvLineCache()
    resetSettings()
  })

  it('resolveAuthLine picks the faster reachable line and writes pinnedLine', async () => {
    const report = await resolveAuthLine(mockCtx(), baseConfig, {
      doFetch: async (url) => {
        if (url.includes('.ai')) {
          await new Promise(resolve => setTimeout(resolve, 30))
        }
        return new Response('ok')
      },
    })
    expect(report.winner.line.id).toBe('cn')
    expect(report.source).toBe('auto')
    expect(settingsState.pinnedLine).toBe('cn')
    expect(settingsState.resolvedLine).toBe('cn')
  })

  it('honors settings.pinnedLine over probe (bug regression)', async () => {
    settingsState.pinnedLine = 'global'
    let called = false
    const report = await resolveAuthLine(mockCtx(), baseConfig, {
      doFetch: async () => {
        called = true
        return new Response('ok')
      },
    })
    expect(called).toBe(false)
    expect(report.winner.line.id).toBe('global')
    expect(report.source).toBe('user')
  })

  it('config.pinnedLine wins over settings.pinnedLine', async () => {
    settingsState.pinnedLine = 'global'
    const locked = { ...baseConfig, pinnedLine: 'cn' }
    const report = await resolveAuthLine(mockCtx(), locked, {
      doFetch: async () => new Response('ok'),
    })
    expect(report.winner.line.id).toBe('cn')
    expect(report.source).toBe('config')
    expect(isAuthLineLocked(locked)).toBe(true)
  })

  it('pinnedOverride wins over config and settings', async () => {
    settingsState.pinnedLine = 'cn'
    const locked = { ...baseConfig, pinnedLine: 'cn' }
    const report = await resolveAuthLine(mockCtx(), locked, {
      pinnedOverride: 'global',
      doFetch: async () => new Response('ok'),
    })
    expect(report.winner.line.id).toBe('global')
    expect(report.source).toBe('user')
  })

  it('treats HTTP error responses as reachable', async () => {
    const entry = await probeLine(globalLine, 1000, async () => new Response('', { status: 404 }))
    expect(entry.reachable).toBe(true)
    expect(entry.latencyMs).not.toBeNull()
  })

  it('throws when every line is unreachable for auth', async () => {
    await expect(resolveAuthLine(mockCtx(), baseConfig, {
      doFetch: async () => { throw new Error('network') },
    })).rejects.toThrow('两条线路均不可达')
  })

  it('resolveEnvLine does not write settings and caches independently', async () => {
    settingsState.pinnedLine = 'global'
    const report = await resolveEnvLine(mockCtx(), baseConfig, {
      doFetch: async (url) => {
        if (url.includes('.ai')) {
          await new Promise(resolve => setTimeout(resolve, 30))
        }
        return new Response('ok')
      },
    })
    expect(report.winner.line.id).toBe('cn')
    expect(settingsState.pinnedLine).toBe('global')
    expect(patchSettings).not.toHaveBeenCalled()

    let calls = 0
    await resolveEnvLine(mockCtx(), baseConfig, {
      doFetch: async () => {
        calls += 1
        return new Response('ok')
      },
    })
    expect(calls).toBe(0)

    await resolveEnvLine(mockCtx(), baseConfig, {
      force: true,
      doFetch: async () => {
        calls += 1
        return new Response('ok')
      },
    })
    expect(calls).toBe(2)
  })

  it('resolveAuthLine does not use env cache', async () => {
    await resolveEnvLine(mockCtx(), baseConfig, {
      doFetch: async () => new Response('ok'),
    })
    settingsState.pinnedLine = ''
    settingsState.resolvedLine = ''
    const report = await resolveAuthLine(mockCtx(), baseConfig, {
      doFetch: async (url) => {
        if (url.includes('.ai')) {
          await new Promise(resolve => setTimeout(resolve, 30))
        }
        return new Response('ok')
      },
    })
    expect(report.winner.line.id).toBe('cn')
    expect(report.source).toBe('auto')
  })
})
