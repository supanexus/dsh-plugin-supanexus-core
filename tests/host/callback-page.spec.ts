import { describe, expect, it } from 'vitest'
import {
  callbackLocale,
  escapeHtml,
  renderErrorPage,
  renderSuccessPage,
} from '../../src/host/auth/callback-page.ts'

describe('callback-page', () => {
  it('picks locale from flow tag', () => {
    expect(callbackLocale('zh-CN')).toBe('zh-CN')
    expect(callbackLocale('en-US')).toBe('en-US')
    expect(callbackLocale(undefined)).toBe('en-US')
  })

  it('escapes error detail to prevent HTML injection', () => {
    const html = renderErrorPage('<script>alert(1)</script>', 'zh-CN')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })

  it('renders localized success copy and auto-close script', () => {
    const html = renderSuccessPage('zh-CN')
    expect(html).toContain('授权成功')
    expect(html).toContain('window.close()')
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })
})
