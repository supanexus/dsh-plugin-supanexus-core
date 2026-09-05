// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { fetchWalletBalance, fetchWalletStatus } from '../../src/client/wallet/wire.ts'

describe('wallet wire', () => {
  it('maps plain-text 404 responses to a readable error', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response('not found', { status: 404 })
    try {
      await expect(fetchWalletStatus()).rejects.toThrow('not found')
      await expect(fetchWalletBalance()).rejects.toThrow('not found')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('parses wallet status envelope', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response(JSON.stringify({
      ok: true,
      connected: true,
      usagePoliciesUrl: 'http://localhost:5173/usage-policies',
      keyPrefix: 'sk-snx',
    }), { status: 200 })
    try {
      const status = await fetchWalletStatus()
      expect(status.connected).toBe(true)
      expect(status.usagePoliciesUrl).toContain('/usage-policies')
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
