// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  fetchWalletBalance,
  fetchWalletStatus,
  normalizeWalletBalance,
} from '../../src/client/wallet/wire.ts'

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
      credentialAligned: true,
      usagePoliciesUrl: 'http://localhost:5173/usage-policies',
      keyPrefix: 'sk-snx',
    }), { status: 200 })
    try {
      const status = await fetchWalletStatus()
      expect(status.connected).toBe(true)
      expect(status.credentialAligned).toBe(true)
      expect(status.usagePoliciesUrl).toContain('/usage-policies')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('normalizes legacy balance payloads missing points fields', () => {
    const normalized = normalizeWalletBalance({
      connected: true,
      organizationId: 'org-1',
      name: 'Org',
      availableBalance: '12.34',
      currency: 'USD',
    } as never)
    expect(normalized.planName).toBe('')
    expect(normalized.pointsRemaining).toBe('0')
    expect(normalized.pointsGranted).toBe('0')
    expect(normalized.subscriptionActive).toBe(false)
    expect(normalized.nextPointsResetAtUnix).toBe(0)
  })

  it('fills defaults when fetch returns legacy wallet body', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response(JSON.stringify({
      ok: true,
      connected: true,
      organizationId: 'org-1',
      name: '飞鸟传媒',
      availableBalance: '101.714105',
      currency: 'USD',
      usagePoliciesUrl: 'http://localhost:5173/usage-policies',
    }), { status: 200 })
    try {
      const balance = await fetchWalletBalance()
      expect(balance.name).toBe('飞鸟传媒')
      expect(balance.planName).toBe('')
      expect(balance.pointsRemaining).toBe('0')
      expect(() => balance.planName.trim()).not.toThrow()
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
