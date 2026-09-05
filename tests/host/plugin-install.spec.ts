import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { resolveCliEntry } from '../../src/host/plugin-market/install-runner.ts'
import type { Config } from '../../src/host/config.ts'

const existingCli = join(process.cwd(), 'package.json')

const config: Config = {
  lines: [],
  pinnedLine: '',
  probeTimeoutMs: 2500,
  probeCacheTtlMs: 600000,
  deviceName: '',
  profileName: 'web',
  dshCliEntry: '/tmp/does-not-exist-cli.js',
}

describe('install runner', () => {
  it('prefers configured dshCliEntry when it exists', () => {
    expect(existsSync(existingCli)).toBe(true)
    expect(resolveCliEntry({
      ...config,
      dshCliEntry: existingCli,
    })).toBe(existingCli)
  })

  it('throws when configured cli entry is missing', () => {
    expect(() => resolveCliEntry(config)).toThrow('DSH CLI 入口不存在')
  })
})
