import { describe, expect, it } from 'vitest'
import {
  buildCliInstallCommand,
  buildCliRemoveCommand,
  buildInstallSpec,
  buildInstallSpecFor,
  canUninstallPlugin,
  orderRepositories,
  type PluginListingItem,
} from '../../src/shared/plugin-market-contract.ts'

const baseItem: PluginListingItem = {
  id: '1',
  install_code: 'demo-plugin',
  package_name: '@supanexus/dsh-plugin-demo',
  name: 'Demo',
  description: 'Demo plugin',
  source: 'supanexus',
  layer: 'feature',
  repositories: [
    {
      provider: 'github',
      url: 'https://github.com/supanexus/dsh-plugin-demo',
      default_ref: 'v1.0.0',
      sort_order: 0,
    },
  ],
}

describe('buildInstallSpecFor', () => {
  it('builds github spec with ref', () => {
    expect(buildInstallSpecFor(baseItem.repositories![0]!, 'demo-plugin'))
      .toBe('github:supanexus/dsh-plugin-demo#v1.0.0')
  })

  it('builds gitee spec', () => {
    expect(buildInstallSpecFor({
      provider: 'gitee',
      url: 'https://gitee.com/org/demo.git',
      default_ref: 'main',
    }, 'demo-plugin')).toBe('gitee:org/demo#main')
  })
})

describe('buildInstallSpec', () => {
  it('builds github spec with ref', () => {
    expect(buildInstallSpec(baseItem)).toBe('github:supanexus/dsh-plugin-demo#v1.0.0')
  })

  it('builds github spec without ref', () => {
    const item: PluginListingItem = {
      ...baseItem,
      repositories: [{ ...baseItem.repositories![0]!, default_ref: null }],
    }
    expect(buildInstallSpec(item)).toBe('github:supanexus/dsh-plugin-demo')
  })

  it('falls back to install code when repo url missing', () => {
    const item: PluginListingItem = {
      ...baseItem,
      repositories: [{ provider: 'github', url: '' }],
    }
    expect(buildInstallSpec(item)).toBe('demo-plugin')
  })

  it('uses legacy single repository field', () => {
    const item: PluginListingItem = {
      ...baseItem,
      repositories: undefined,
      repository: {
        provider: 'github',
        url: 'https://github.com/supanexus/legacy',
        default_ref: 'main',
      },
    }
    expect(buildInstallSpec(item)).toBe('github:supanexus/legacy#main')
  })
})

describe('orderRepositories', () => {
  const multi: PluginListingItem = {
    ...baseItem,
    repositories: [
      { provider: 'github', url: 'https://github.com/a/b', sort_order: 0 },
      { provider: 'gitee', url: 'https://gitee.com/a/b', sort_order: 1 },
    ],
  }

  it('prefers gitee on cn line', () => {
    const ordered = orderRepositories(multi, 'cn')
    expect(ordered.map(r => r.provider)).toEqual(['gitee', 'github'])
  })

  it('prefers github on global line', () => {
    const ordered = orderRepositories(multi, 'global')
    expect(ordered.map(r => r.provider)).toEqual(['github', 'gitee'])
  })

  it('skips missing providers in preference list', () => {
    const onlyGithub: PluginListingItem = {
      ...baseItem,
      repositories: [{ provider: 'github', url: 'https://github.com/a/b' }],
    }
    expect(orderRepositories(onlyGithub, 'cn').map(r => r.provider)).toEqual(['github'])
  })
})

describe('buildCliInstallCommand', () => {
  it('includes profile and spec', () => {
    expect(buildCliInstallCommand('github:org/pkg#v1', 'web'))
      .toBe('dsh plugin --profile web add github:org/pkg#v1')
  })
})

describe('canUninstallPlugin', () => {
  it('blocks supanexus core plugin', () => {
    expect(canUninstallPlugin({
      package_name: '@supanexus/dsh-plugin-supanexus-core',
      install_code: 'supanexus-core',
    })).toBe(false)
  })

  it('allows community plugins', () => {
    expect(canUninstallPlugin({
      package_name: 'dshmarket',
      install_code: 'dshmarket',
    })).toBe(true)
  })
})

describe('buildCliRemoveCommand', () => {
  it('includes profile and package name', () => {
    expect(buildCliRemoveCommand('dshmarket', 'web'))
      .toBe('dsh plugin --profile web remove dshmarket')
  })
})
