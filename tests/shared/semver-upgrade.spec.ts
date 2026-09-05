import { describe, expect, it } from 'vitest'
import {
  compareSemver,
  parseSemver,
  primaryTargetRef,
  versionIndicatesUpgrade,
  type PluginListingItem,
} from '../../src/shared/plugin-market-contract.ts'

const listing: PluginListingItem = {
  id: '1',
  install_code: 'demo-plugin',
  package_name: '@supanexus/dsh-plugin-demo',
  name: 'Demo',
  description: 'Demo plugin',
  source: 'supanexus',
  layer: 'feature',
  version: '1.1.0',
  repositories: [
    {
      provider: 'github',
      url: 'https://github.com/supanexus/dsh-plugin-demo',
      default_ref: 'v1.1.0',
      sort_order: 0,
    },
  ],
}

describe('parseSemver', () => {
  it('accepts optional leading v and pre-release', () => {
    expect(parseSemver('1.0.0')).toEqual([1, 0, 0, ''])
    expect(parseSemver('v1.2.3')).toEqual([1, 2, 3, ''])
    expect(parseSemver('1.0.0-beta.1')).toEqual([1, 0, 0, 'beta.1'])
  })

  it('rejects invalid versions', () => {
    expect(parseSemver('')).toBeNull()
    expect(parseSemver('main')).toBeNull()
    expect(parseSemver('1.0')).toBeNull()
  })
})

describe('compareSemver', () => {
  it('orders numeric segments', () => {
    expect(compareSemver('1.1.0', '1.0.0')).toBe(1)
    expect(compareSemver('1.0.0', '1.1.0')).toBe(-1)
    expect(compareSemver('v1.1.0', '1.1.0')).toBe(0)
  })

  it('returns null for invalid input', () => {
    expect(compareSemver('1.0.0', 'bad')).toBeNull()
    expect(compareSemver('', '1.0.0')).toBeNull()
  })
})

describe('versionIndicatesUpgrade', () => {
  it('flags when listing version is strictly newer', () => {
    expect(versionIndicatesUpgrade('1.1.0', '1.0.0')).toBe(true)
    expect(versionIndicatesUpgrade('1.1.0', '1.1.0')).toBe(false)
    expect(versionIndicatesUpgrade('1.0.0', '1.1.0')).toBe(false)
  })

  it('ignores empty or invalid versions', () => {
    expect(versionIndicatesUpgrade('', '1.0.0')).toBe(false)
    expect(versionIndicatesUpgrade('1.1.0', '')).toBe(false)
    expect(versionIndicatesUpgrade(null, '1.0.0')).toBe(false)
    expect(versionIndicatesUpgrade('main', '1.0.0')).toBe(false)
  })
})

describe('primaryTargetRef', () => {
  it('reads default_ref from first candidate on the line', () => {
    expect(primaryTargetRef(listing, 'global')).toBe('v1.1.0')
  })
})
