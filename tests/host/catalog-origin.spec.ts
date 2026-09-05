import { describe, expect, it } from 'vitest'
import {
  resolveConsoleOrigin,
  resolvePluginCatalogOrigin,
} from '../../src/host/plugin-market/catalog-origin.ts'
import type { SupaLine } from '../../src/shared/line.ts'

const line31002: SupaLine = {
  id: 'global',
  label: 'Global',
  origin: 'http://127.0.0.1:31002',
}

const globalProd: SupaLine = {
  id: 'global',
  label: 'Global',
  origin: 'https://api.supanexus.ai',
  harnessOrigin: 'https://gateway-harness.supanexus.ai',
  pluginCatalogOrigin: 'https://gateway-client.supanexus.ai',
  consoleOrigin: 'https://console.supanexus.ai',
}

const cnProd: SupaLine = {
  id: 'cn',
  label: '中国大陆',
  origin: 'https://api.supanexus.io',
  harnessOrigin: 'https://gateway-harness.supanexus.io',
  pluginCatalogOrigin: 'https://gateway-client.supanexus.io',
  consoleOrigin: 'https://console.supanexus.io',
}

describe('resolvePluginCatalogOrigin', () => {
  it('prefers per-line pluginCatalogOrigin', () => {
    expect(resolvePluginCatalogOrigin({
      pluginCatalogOrigin: 'https://fallback.example.com',
    }, globalProd)).toBe('https://gateway-client.supanexus.ai')
    expect(resolvePluginCatalogOrigin({
      pluginCatalogOrigin: '',
    }, cnProd)).toBe('https://gateway-client.supanexus.io')
  })

  it('uses top-level pluginCatalogOrigin when line omits it', () => {
    expect(resolvePluginCatalogOrigin({
      pluginCatalogOrigin: 'https://client.example.com',
    }, line31002)).toBe('https://client.example.com')
  })

  it('maps local OpenAPI :31002 to gateway-client :31000', () => {
    expect(resolvePluginCatalogOrigin({
      pluginCatalogOrigin: '',
    }, line31002)).toBe('http://127.0.0.1:31000')
  })

  it('maps remote :31002 host to :31000', () => {
    expect(resolvePluginCatalogOrigin({
      pluginCatalogOrigin: '',
    }, {
      ...line31002,
      origin: 'http://172.31.30.133:31002',
    })).toBe('http://172.31.30.133:31000')
  })
})

describe('resolveConsoleOrigin', () => {
  it('prefers per-line consoleOrigin', () => {
    expect(resolveConsoleOrigin({ consoleOrigin: 'https://fallback.example.com' }, globalProd))
      .toBe('https://console.supanexus.ai')
    expect(resolveConsoleOrigin({ consoleOrigin: '' }, cnProd))
      .toBe('https://console.supanexus.io')
  })

  it('falls back to top-level consoleOrigin', () => {
    expect(resolveConsoleOrigin({ consoleOrigin: 'http://localhost:5173' }, line31002))
      .toBe('http://localhost:5173')
  })
})
