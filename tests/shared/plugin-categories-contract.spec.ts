import { describe, expect, it } from 'vitest'
import {
  PLUGIN_CATEGORIES_PATH,
  PLUGIN_LISTINGS_PATH,
  type PluginCategoryItem,
} from '../../src/shared/plugin-market-contract.ts'

describe('plugin categories contract', () => {
  it('exposes stable Host paths', () => {
    expect(PLUGIN_LISTINGS_PATH).toBe('/api/supanexus.plugin-listings')
    expect(PLUGIN_CATEGORIES_PATH).toBe('/api/supanexus.plugin-categories')
  })

  it('accepts category item shape', () => {
    const item: PluginCategoryItem = {
      id: 'd0000001-0001-4001-8001-000000000001',
      slug: 'core-capability',
      name: 'Core capability',
      sort_order: 100,
    }
    expect(item.slug).toBe('core-capability')
  })
})
