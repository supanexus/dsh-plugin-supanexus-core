import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { fetchListingByCode, fetchPublicCategories, fetchPublicListings } from '../../src/host/plugin-market/gateway-client.ts'

describe('plugin market gateway client', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch)
  })

  it('unwraps list envelope', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({
      code: 'ok',
      data: {
        items: [{ id: 'x', install_code: 'x' }],
        total_count: 1,
        page: 1,
        page_size: 20,
        has_next_page: false,
      },
    }), { status: 200 }))

    const data = await fetchPublicListings('http://127.0.0.1:31002', new URLSearchParams('locale=zh-CN'))
    expect(data.items).toHaveLength(1)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:31002/api/v1/public/plugin-listings?locale=zh-CN',
      { method: 'GET' },
    )
  })

  it('fetches listing by install code', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({
      code: 'ok',
      data: {
        id: '1',
        install_code: 'supanexus-core',
        package_name: '@supanexus/dsh-plugin-supanexus-core',
      },
    }), { status: 200 }))

    const item = await fetchListingByCode('http://127.0.0.1:31002', 'supanexus-core', 'zh-CN')
    expect(item.install_code).toBe('supanexus-core')
  })

  it('throws on gateway error', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({
      code: 'error',
      message: 'not found',
    }), { status: 404 }))

    await expect(fetchListingByCode('http://127.0.0.1:31002', 'missing'))
      .rejects.toThrow('not found')
  })

  it('unwraps category list envelope', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({
      code: 'ok',
      data: {
        items: [{ id: 'c1', slug: 'core-capability', name: 'Core', sort_order: 100 }],
      },
    }), { status: 200 }))

    const data = await fetchPublicCategories('http://127.0.0.1:31002', new URLSearchParams('locale=zh-CN'))
    expect(data.items).toHaveLength(1)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:31002/api/v1/public/plugin-categories?locale=zh-CN',
      { method: 'GET' },
    )
  })
})
