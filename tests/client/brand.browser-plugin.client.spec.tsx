// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { SlotRegistry } from '../../../../../../engine/packages/client/ui-renderer/src/client/index.ts'
import { apply, inject } from '../../src/client/index.ts'
import { SupaNexusBrandMark, SupaNexusBrandName } from '../../src/client/brand/Brand.tsx'

afterEach(() => {
  cleanup()
})

const HOLES = [
  'sidebar.brand.mark',
  'sidebar.brand.name',
  'conversation.hero.brand.mark',
  'settings.models.footer',
  'sidebar.footer.action',
  'settings.plugin.item',
] as const

function installClientDeps(ctx: Context): void {
  ctx.provide('locale', {
    getSnapshot: () => ({ active: 'zh-CN' }),
  })
  ctx.provide('connection', { isLoopback: true, api: {} })
  ctx.provide('remote', {
    settings: {
      describe: async () => ({ namespaces: [] }),
      mutate: async () => ({ ok: true as const }),
    },
  })
  ctx.provide('remote.settings', ctx.get('remote').settings)
  ctx.provide('remote.pluginInventory', {
    list: async () => ({
      ok: true as const,
      value: { entries: [] },
    }),
  })
  ctx.provide('settingsScope', {
    bind: () => ({
      getSnapshot: () => ({
        status: 'ready' as const,
        value: { showWallet: true, showBrand: true },
        base: undefined,
        user: undefined,
        revision: 1,
        writable: true,
        mode: 'host' as const,
      }),
      subscribe: () => () => {},
      mutate: async () => {},
      set: async () => {},
      unset: async () => {},
    }),
  })
}

async function bench(declare = true) {
  const ctx = new Context()
  installClientDeps(ctx)
  await ctx.plugin(SlotRegistry).await()
  const slots = ctx.get('slots') as SlotRegistry
  const declareHoles = () => slots.register({
    name: 'root',
    children: Object.fromEntries(HOLES.map(name => [
      name,
      name === 'sidebar.footer.action'
        ? { kind: 'list', scope: 'root' }
        : name === 'settings.plugin.item'
          ? { kind: 'keyed', scope: 'root' }
          : { kind: 'single', scope: 'root' },
    ])),
  } as never, () => null)
  const disposeHoles = declare ? declareHoles() : undefined
  return { ctx, slots, declareHoles, disposeHoles }
}

describe('supanexus browser client plugin', () => {
  it('declares client services used by brand, hero, and quick-setup', () => {
    expect(inject).toEqual([
      'slots',
      'remote',
      'remote.settings',
      'remote.pluginInventory',
      'locale',
      'connection',
      'settingsScope',
    ])
  })

  it('fills declarations before or after apply and removes every occupant on teardown', async () => {
    const before = await bench()
    const fiber = before.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    before.disposeHoles?.()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)
    before.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    await fiber.dispose()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)

    const after = await bench(false)
    await after.ctx.plugin({ inject: [...inject], apply }).await()
    for (const hole of HOLES) expect(after.slots.entries(hole)).toHaveLength(0)
    after.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(after.slots.entries(hole)).toHaveLength(1)
  })

  it('renders the SupaNexus name stack and honors requested mark sizes', () => {
    const zh = render(<SupaNexusBrandName locale="zh-CN" />)
    expect(zh.getByLabelText('SupaNexus').textContent).toBe('SupaNexus')
    expect(zh.getByText('智能 Agent 平台')).toBeTruthy()
    zh.unmount()

    const en = render(<SupaNexusBrandName locale="en-US" />)
    expect(en.getByText('AI Agent Platform')).toBeTruthy()
    en.unmount()

    const mark = render(<SupaNexusBrandMark size={34} className="hero-mark" />)
    expect(mark.container.querySelector('svg')?.getAttribute('width')).toBe('34')
    expect(mark.container.querySelector('svg')?.getAttribute('class')).toBe('hero-mark')
    mark.rerender(<SupaNexusBrandMark size={24} />)
    expect(mark.container.querySelector('svg')?.getAttribute('width')).toBe('24')
  })
})
