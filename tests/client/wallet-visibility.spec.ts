import { describe, expect, it } from 'vitest'
import { shouldShowWallet } from '../../src/client/wallet/visibility.ts'

describe('shouldShowWallet', () => {
  it('hides when not connected', () => {
    expect(shouldShowWallet(false, 'supanexus')).toBe(false)
  })

  it('hides for non-SupaNexus providers', () => {
    expect(shouldShowWallet(true, 'deepseek-official')).toBe(false)
    expect(shouldShowWallet(true, null)).toBe(false)
    expect(shouldShowWallet(true, undefined)).toBe(false)
  })

  it('shows only when connected, provider is supanexus, and pref is on', () => {
    expect(shouldShowWallet(true, 'supanexus', true)).toBe(true)
  })

  it('hides when the plugin setting disables the balance module', () => {
    expect(shouldShowWallet(true, 'supanexus', false)).toBe(false)
  })

  it('defaults showWallet to false when omitted', () => {
    expect(shouldShowWallet(true, 'supanexus')).toBe(false)
  })
})
