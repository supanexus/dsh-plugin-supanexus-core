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
  'plugins.item',
] as const

function installClientDeps(ctx: Context): void {
  ctx.provide('locale', {
    getSnapshot: () => ({ active: 'zh-CN' }),
    bind: () => (key: string) => key,
    register: () => () => {},
    subscribe: () => () => {},
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
  const form = {
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
    mutate: async () => true,
    set: async () => true,
    unset: async () => true,
  }
  ctx.provide('configForms', {
    get: () => form,
    whileServed: (_namespaces: readonly string[], register: (served: ReadonlySet<string>) => () => void) => {
      return register(new Set(['supanexus-core']))
    },
    describe: () => ({ getSnapshot: () => ({ view: { namespaces: [{ ns: 'supanexus-core' }] } }), subscribe: () => () => {}, ensure: async () => {} }),
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
      name === 'sidebar.footer.action' || name === 'plugins.item'
        ? { kind: 'list', scope: 'root' }
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
      'configForms',
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
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    await fiber.dispose()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)
  })

  it('exports brand components', () => {
    const mark = render(<SupaNexusBrandMark size={24} />)
    expect(mark.container.querySelector('svg')).not.toBeNull()
    const name = render(<SupaNexusBrandName />)
    expect(name.container.textContent).toMatch(/SupaNexus/)
  })
})
