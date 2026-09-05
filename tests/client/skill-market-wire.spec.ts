// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { installPlugin } from '../../src/client/skill-market/wire.ts'
import { InstallPluginError } from '../../src/client/skill-market/install-error.ts'

describe('skill-market wire', () => {
  it('maps plain-text 404 responses to a readable error', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response('not found', { status: 404 })
    try {
      await expect(installPlugin('demo')).rejects.toThrow('not found')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('calls install endpoint with installCode query', async () => {
    const originalFetch = globalThis.fetch
    let called = ''
    globalThis.fetch = async (input) => {
      called = String(input)
      return new Response(JSON.stringify({
        ok: true,
        spec: 'github:org/pkg',
        packageName: '@org/pkg',
        needsRestart: true,
        cliCommand: 'dsh plugin --profile web add github:org/pkg',
      }), { status: 200 })
    }
    try {
      const result = await installPlugin('demo', 'zh-CN')
      expect(called).toContain('/api/supanexus.plugin-install')
      expect(called).toContain('installCode=demo')
      expect(result.spec).toBe('github:org/pkg')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('throws InstallPluginError with install log on failure', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response(JSON.stringify({
      ok: false,
      message: 'gitee: failed',
      code: 'INSTALL_FAILED',
      attempts: [{
        provider: 'gitee',
        spec: 'gitee:org/pkg',
        ok: false,
        cliCommand: 'node cli.js plugin --profile web add gitee:org/pkg',
        stderr: 'network error',
      }],
      log: '[gitee] node cli.js plugin --profile web add gitee:org/pkg\nnetwork error',
    }), { status: 400 })
    try {
      await expect(installPlugin('demo')).rejects.toBeInstanceOf(InstallPluginError)
      try {
        await installPlugin('demo')
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(InstallPluginError)
        const installError = error as InstallPluginError
        expect(installError.log).toContain('gitee:org/pkg')
        expect(installError.attempts?.length).toBe(1)
      }
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
