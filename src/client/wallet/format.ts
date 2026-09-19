/** Format wallet amount for sidebar / panel display. */

function asTrimmed(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** Compact currency label for the sidebar trigger. */
export function formatWalletAmount(
  balance: string | null | undefined,
  currency: string | null | undefined,
): string {
  const amount = asTrimmed(balance)
  const code = asTrimmed(currency).toUpperCase()
  if (amount.length === 0) return '—'
  if (code === 'USD') return `$${amount}`
  if (code.length === 0) return amount
  return `${amount} ${code}`
}

/** Compact points label (zh: 积分 / en: pts). */
export function formatPointsRemaining(
  points: string | null | undefined,
  locale: string | undefined,
): string {
  const amount = asTrimmed(points)
  if (amount.length === 0 || amount === '0') return '—'
  const unit = locale?.startsWith('zh') ? '积分' : 'pts'
  return `${amount} ${unit}`
}

export interface WalletTriggerLabels {
  readonly balanceLabel: string
  readonly pointsLabel: string | undefined
  readonly canRotate: boolean
}

/** Build sidebar trigger labels; rotate when subscription has remaining points. */
export function formatWalletTriggerLabels(
  balance: {
    readonly availableBalance?: string | null
    readonly currency?: string | null
    readonly subscriptionActive?: boolean | null
    readonly pointsRemaining?: string | null
  },
  locale: string | undefined,
): WalletTriggerLabels {
  const balanceLabel = formatWalletAmount(balance.availableBalance, balance.currency)
  if (!balance.subscriptionActive) {
    return { balanceLabel, pointsLabel: undefined, canRotate: false }
  }
  const pointsLabel = formatPointsRemaining(balance.pointsRemaining, locale)
  if (pointsLabel === '—') {
    return { balanceLabel, pointsLabel: undefined, canRotate: false }
  }
  return { balanceLabel, pointsLabel, canRotate: true }
}

/** Stable aria/title text listing both amounts when rotating. */
export function formatWalletTriggerAria(
  labels: WalletTriggerLabels,
  locale: string | undefined,
): string {
  if (!labels.canRotate || labels.pointsLabel === undefined) return labels.balanceLabel
  const sep = ' · '
  const balanceWord = locale?.startsWith('zh') ? '余额' : 'Balance'
  return `${balanceWord} ${labels.balanceLabel}${sep}${labels.pointsLabel}`
}

/** Sidebar trigger: prefer points when subscription is active, else USD. */
export function formatWalletTriggerLabel(
  balance: {
    readonly availableBalance?: string | null
    readonly currency?: string | null
    readonly subscriptionActive?: boolean | null
    readonly pointsRemaining?: string | null
  },
  locale: string | undefined,
): string {
  const labels = formatWalletTriggerLabels(balance, locale)
  return labels.pointsLabel ?? labels.balanceLabel
}

/** Format unix seconds for panel secondary rows; empty when unset. */
export function formatWalletUnixDate(
  unixSeconds: number | null | undefined,
  locale: string | undefined,
): string | undefined {
  if (unixSeconds === null || unixSeconds === undefined) return undefined
  if (!Number.isFinite(unixSeconds) || unixSeconds <= 0) return undefined
  try {
    return new Date(unixSeconds * 1000).toLocaleString(
      locale?.startsWith('zh') ? 'zh-CN' : 'en-US',
      { dateStyle: 'medium', timeStyle: 'short' },
    )
  } catch {
    return undefined
  }
}
