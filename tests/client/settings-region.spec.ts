// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { readActiveLineId } from '../../src/client/settings/useShowWalletPref.ts'
import { settingsCardT } from '../../src/client/settings/locales.ts'
import { fetchLineStatus } from '../../src/client/settings/line-wire.ts'
import { PINNED_LINE_FIELD } from '../../src/shared/settings-contract.ts'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SupaNexusUiSettings } from '../../src/shared/settings-contract.ts'

function fakeScope(value: Partial<SupaNexusUiSettings>): SettingsScope<SupaNexusUiSettings> {
  return {
    getSnapshot: () => ({
      status: 'ready',
      writable: true,
      value: {
        showWallet: false,
        showBrand: true,
        ...value,
      },
    }),
    subscribe: () => () => {},
    set: async () => {},
  } as unknown as SettingsScope<SupaNexusUiSettings>
}

describe('settings region helpers', () => {
  it('prefers pinnedLine over resolvedLine', () => {
    expect(readActiveLineId(fakeScope({
      pinnedLine: 'cn',
      resolvedLine: 'global',
    }))).toBe('cn')
  })

  it('falls back to resolvedLine then global', () => {
    expect(readActiveLineId(fakeScope({ resolvedLine: 'cn' }))).toBe('cn')
    expect(readActiveLineId(fakeScope({}))).toBe('global')
  })

  it('exposes zh/en region copy', () => {
    expect(settingsCardT('zh-CN')('region')).toBe('访问区域')
    expect(settingsCardT('zh-CN')('regionGlobal')).toBe('全球')
    expect(settingsCardT('zh-CN')('regionCn')).toBe('中国大陆')
    expect(settingsCardT('en-US')('region')).toBe('Access region')
  })

  it('exports pinnedLine field constant', () => {
    expect(PINNED_LINE_FIELD).toBe('pinnedLine')
  })

  it('fetchLineStatus parses host envelope', async () => {
    const original = globalThis.fetch
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      ok: true,
      lines: [
        { id: 'global', label: 'Global' },
        { id: 'cn', label: '中国大陆' },
      ],
      activeLineId: 'cn',
      source: 'auto',
      latencyMs: 42,
      locked: false,
    }), { status: 200 }))
    try {
      const status = await fetchLineStatus()
      expect(status.activeLineId).toBe('cn')
      expect(status.locked).toBe(false)
      expect(status.lines).toHaveLength(2)
    } finally {
      globalThis.fetch = original
    }
  })
})
