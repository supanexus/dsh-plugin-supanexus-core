import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  buildAuthorizeUrl,
  fetchWallet,
  inputFromModalities,
  listModels,
  messageForCode,
  refreshSession,
} from '../../src/host/auth/harness-client.ts'
import { buildUsagePoliciesUrl } from '../../src/shared/wallet-contract.ts'
import type { SupaLine } from '../../src/shared/line.ts'

const line: SupaLine = {
  id: 'global',
  label: 'Global',
  origin: 'http://127.0.0.1:31002',
  harnessOrigin: 'http://127.0.0.1:31005',
}

describe('harness-client', () => {
  it('maps known harness error codes to user-facing copy', () => {
    expect(messageForCode('harness.pkce_mismatch')).toContain('校验失败')
    expect(messageForCode('tenant.no_project_available')).toContain('项目')
    expect(messageForCode('unknown.code', 'fallback')).toBe('fallback')
  })

  it('builds authorize URLs with exact redirect_uri and locale', () => {
    const redirectUri = 'http://127.0.0.1:3210/supanexus/oauth/callback'
    const url = new URL(buildAuthorizeUrl(line, {
      redirectUri,
      codeChallenge: 'challenge',
      state: 'state-1',
      deviceName: 'My Mac',
      locale: 'zh-CN',
    }))
    expect(url.origin).toBe('http://127.0.0.1:31005')
    expect(url.pathname).toBe('/harness/v1/auth/authorize')
    expect(url.searchParams.get('redirect_uri')).toBe(redirectUri)
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.searchParams.get('locale')).toBe('zh-CN')
  })

  it('maps input_modalities to pi-ai input', () => {
    expect(inputFromModalities(undefined)).toEqual(['text'])
    expect(inputFromModalities([])).toEqual(['text'])
    expect(inputFromModalities(['text'])).toEqual(['text'])
    expect(inputFromModalities(['text', 'image'])).toEqual(['text', 'image'])
    expect(inputFromModalities(['image'])).toEqual(['text', 'image'])
  })
})

describe('harness-client refresh + wallet', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('refreshSession posts refresh_token and maps envelope', async () => {
    globalThis.fetch = vi.fn(async (input, init) => {
      expect(String(input)).toBe('http://127.0.0.1:31005/harness/v1/auth/refresh')
      expect(init?.method).toBe('POST')
      const body = JSON.parse(String(init?.body)) as { refresh_token: string }
      expect(body.refresh_token).toBe('rt-old')
      return new Response(JSON.stringify({
        code: 'ok',
        data: {
          access_token: 'at-new',
          refresh_token: 'rt-new',
          expires_in: 900,
          token_type: 'Bearer',
        },
      }), { status: 200 })
    }) as typeof fetch

    const tokens = await refreshSession(line, 'rt-old', 'zh-CN')
    expect(tokens.accessToken).toBe('at-new')
    expect(tokens.refreshToken).toBe('rt-new')
    expect(tokens.expiresIn).toBe(900)
  })

  it('fetchWallet passes device_id and Authorization', async () => {
    globalThis.fetch = vi.fn(async (input, init) => {
      const url = new URL(String(input))
      expect(url.pathname).toBe('/harness/v1/wallet')
      expect(url.searchParams.get('device_id')).toBe('device-1')
      const headers = init?.headers as Record<string, string>
      expect(headers.Authorization).toBe('Bearer access-1')
      return new Response(JSON.stringify({
        code: 'ok',
        data: {
          organization_id: 'org-1',
          name: 'Default',
          available_balance: '12.34',
          currency: 'USD',
        },
      }), { status: 200 })
    }) as typeof fetch

    const wallet = await fetchWallet(line, 'access-1', 'device-1')
    expect(wallet.availableBalance).toBe('12.34')
    expect(wallet.currency).toBe('USD')
    expect(wallet.organizationId).toBe('org-1')
  })

  it('listModels maps architecture.input_modalities onto input', async () => {
    globalThis.fetch = vi.fn(async (input) => {
      expect(String(input)).toBe('http://127.0.0.1:31002/v1/models')
      return new Response(JSON.stringify({
        data: [
          {
            id: 'moonshot/kimi-vision',
            name: 'Kimi Vision',
            architecture: { input_modalities: ['text', 'image'] },
          },
          {
            id: 'zhipu/glm-text',
            name: 'GLM Text',
            architecture: { input_modalities: ['text'] },
          },
          { id: 'bare/no-arch' },
        ],
      }), { status: 200 })
    }) as typeof fetch

    const models = await listModels(line, 'key-1')
    expect(models).toEqual([
      { id: 'moonshot/kimi-vision', name: 'Kimi Vision', input: ['text', 'image'] },
      { id: 'zhipu/glm-text', name: 'GLM Text', input: ['text'] },
      { id: 'bare/no-arch', input: ['text'] },
    ])
  })
})

describe('wallet-contract', () => {
  it('builds usage-policies URL from console origin', () => {
    expect(buildUsagePoliciesUrl('http://localhost:5173')).toBe('http://localhost:5173/usage-policies')
    expect(buildUsagePoliciesUrl('http://localhost:5173/')).toBe('http://localhost:5173/usage-policies')
  })
})
