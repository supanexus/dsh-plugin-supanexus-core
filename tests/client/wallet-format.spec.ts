import { describe, expect, it } from 'vitest'
import { formatWalletAmount } from '../../src/client/wallet/format.ts'

describe('formatWalletAmount', () => {
  it('prefixes USD with dollar sign', () => {
    expect(formatWalletAmount('12.34', 'USD')).toBe('$12.34')
    expect(formatWalletAmount('12.34', 'usd')).toBe('$12.34')
  })

  it('appends other currency codes', () => {
    expect(formatWalletAmount('100', 'CNY')).toBe('100 CNY')
  })

  it('handles empty amount', () => {
    expect(formatWalletAmount('  ', 'USD')).toBe('—')
  })
})
