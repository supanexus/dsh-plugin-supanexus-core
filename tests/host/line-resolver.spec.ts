import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/host/settings/device.ts', () => ({
  readSettings: () => ({
    deviceName: '',
    deviceId: '',
    resolvedLine: '',
    resolvedAt: 0,
    latencyMs: 0,
    pinnedLine: '',
    apiKeyId: '',
    keyPrefix: '',
    connectedAt: 0,
  }),
  patchSettings: async () => {},
  ensureDeviceIdentity: async () => ({ deviceId: 'device-1', deviceName: 'test' }),
}))

import { probeLine, resetLineCache, resolveLine } from '../../src/host/line/resolver.ts'
import type { SupaLine } from '../../src/shared/line.ts'

const DEFAULT_LINES: SupaLine[] = [
  {
    id: 'global',
    label: 'Global',
    origin: 'http://127.0.0.1:31002',
    harnessOrigin: 'http://127.0.0.1:31005',
  },
  {
    id: 'cn',
    label: '中国大陆',
    origin: 'http://127.0.0.1:31002',
    harnessOrigin: 'http://127.0.0.1:31005',
  },
]

const config = {
  lines: [...DEFAULT_LINES],
  pinnedLine: '',
  probeTimeoutMs: 2500,
  probeCacheTtlMs: 600_000,
  deviceName: '',
}

const globalLine = DEFAULT_LINES[0]!

function mockCtx() {
  return {} as never
}

describe('line-resolver', () => {
  beforeEach(() => {
    resetLineCache()
  })

  it('picks the faster reachable line', async () => {
    const report = await resolveLine(mockCtx(), config, {
      doFetch: async (url) => {
        if (url.includes('.ai')) {
          await new Promise(resolve => setTimeout(resolve, 30))
        }
        return new Response('ok')
      },
    })
    expect(report.winner.line.id).toBe('cn')
  })

  it('treats HTTP error responses as reachable', async () => {
    const entry = await probeLine(globalLine, 1000, async () => new Response('', { status: 404 }))
    expect(entry.reachable).toBe(true)
    expect(entry.latencyMs).not.toBeNull()
  })

  it('short-circuits pinned lines without probing', async () => {
    const pinnedConfig = { ...config, pinnedLine: 'cn' }
    let called = false
    const report = await resolveLine(mockCtx(), pinnedConfig, {
      doFetch: async () => {
        called = true
        return new Response('ok')
      },
    })
    expect(called).toBe(false)
    expect(report.winner.line.id).toBe('cn')
  })

  it('throws when every line is unreachable', async () => {
    await expect(resolveLine(mockCtx(), config, {
      doFetch: async () => { throw new Error('network') },
    })).rejects.toThrow('两条线路均不可达')
  })

  it('serves cached winner within TTL unless forced', async () => {
    const doFetch = async (url: string) => new Response(url)
    await resolveLine(mockCtx(), config, { doFetch })
    let calls = 0
    await resolveLine(mockCtx(), config, {
      doFetch: async (url) => {
        calls += 1
        return new Response(url)
      },
    })
    expect(calls).toBe(0)
    await resolveLine(mockCtx(), config, { force: true, doFetch: async () => new Response('x') })
    expect(calls).toBe(0)
  })
})
