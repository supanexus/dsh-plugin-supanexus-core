import { describe, expect, it } from 'vitest'
import { buildRemotePackageJsonUrl } from '../../src/host/plugin-market/remote-package-json.ts'

describe('buildRemotePackageJsonUrl', () => {
  it('builds github raw url', () => {
    expect(buildRemotePackageJsonUrl({
      provider: 'github',
      url: 'https://github.com/supanexus/demo.git',
    }, 'v1.1.0')).toBe(
      'https://raw.githubusercontent.com/supanexus/demo/v1.1.0/package.json',
    )
  })

  it('builds gitee raw url', () => {
    expect(buildRemotePackageJsonUrl({
      provider: 'gitee',
      url: 'https://gitee.com/org/demo',
    }, 'main')).toBe(
      'https://gitee.com/org/demo/raw/main/package.json',
    )
  })
})
