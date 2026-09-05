// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  FAVICON_SVG,
  patchDocumentProductTitle,
  patchFavicon,
  PRODUCT_TITLE,
} from '../../src/client/brand/patchShellBranding.ts'

describe('patchTabBranding', () => {
  it('replaces the default product title and session suffixes', () => {
    document.title = 'DSH 本地构建'
    patchDocumentProductTitle()
    expect(document.title).toBe(PRODUCT_TITLE)

    document.title = '新会话 — DSH 本地构建'
    patchDocumentProductTitle()
    expect(document.title).toBe(`新会话 — ${PRODUCT_TITLE}`)
  })

  it('installs the SupaNexus favicon', () => {
    document.head.innerHTML = '<link rel="icon" type="image/svg+xml" href="/favicon.svg">'
    patchFavicon()
    const link = document.querySelector('link[rel="icon"]')
    expect(link?.getAttribute('href')?.startsWith('data:image/svg+xml,')).toBe(true)
    expect(FAVICON_SVG).toContain('#1212F9')
  })
})
