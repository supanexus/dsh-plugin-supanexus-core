// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { startAuth } from '../../src/client/quick-setup/wire.ts'

describe('quick-setup wire', () => {
  it('maps plain-text 404 responses to a readable error', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response('not found', { status: 404 })
    try {
      await expect(startAuth()).rejects.toThrow('not found')
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
