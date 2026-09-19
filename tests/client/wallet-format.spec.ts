import { describe, expect, it } from 'vitest'
import {
  formatPointsRemaining,
  formatWalletAmount,
  formatWalletTriggerAria,
  formatWalletTriggerLabel,
  formatWalletTriggerLabels,
} from '../../src/client/wallet/format.ts'

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

describe('formatPointsRemaining', () => {
  it('formats zh and en units', () => {
    expect(formatPointsRemaining('70', 'zh-CN')).toBe('70 积分')
    expect(formatPointsRemaining('70', 'en-US')).toBe('70 pts')
  })

  it('handles empty or zero', () => {
    expect(formatPointsRemaining('0', 'zh-CN')).toBe('—')
    expect(formatPointsRemaining('  ', 'en')).toBe('—')
  })
})

describe('formatWalletTriggerLabels', () => {
  it('enables rotation when subscription has remaining points', () => {
    expect(formatWalletTriggerLabels({
      availableBalance: '12.34',
      currency: 'USD',
      subscriptionActive: true,
      pointsRemaining: '70',
    }, 'zh-CN')).toEqual({
      balanceLabel: '$12.34',
      pointsLabel: '70 积分',
      canRotate: true,
    })
  })

  it('disables rotation without subscription', () => {
    expect(formatWalletTriggerLabels({
      availableBalance: '12.34',
      currency: 'USD',
      subscriptionActive: false,
      pointsRemaining: '0',
    }, 'zh-CN')).toEqual({
      balanceLabel: '$12.34',
      pointsLabel: undefined,
      canRotate: false,
    })
  })
})

describe('formatWalletTriggerAria', () => {
  it('lists both amounts when rotating', () => {
    expect(formatWalletTriggerAria({
      balanceLabel: '$12.34',
      pointsLabel: '70 积分',
      canRotate: true,
    }, 'zh-CN')).toBe('余额 $12.34 · 70 积分')
  })
})

describe('formatWalletTriggerLabel', () => {
  it('prefers points when subscription is active', () => {
    expect(formatWalletTriggerLabel({
      availableBalance: '12.34',
      currency: 'USD',
      subscriptionActive: true,
      pointsRemaining: '70',
    }, 'zh-CN')).toBe('70 积分')
  })

  it('falls back to USD when no subscription', () => {
    expect(formatWalletTriggerLabel({
      availableBalance: '12.34',
      currency: 'USD',
      subscriptionActive: false,
      pointsRemaining: '0',
    }, 'zh-CN')).toBe('$12.34')
  })
})
