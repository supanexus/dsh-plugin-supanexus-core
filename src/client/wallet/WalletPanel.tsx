import { useCallback, useEffect, useState } from 'react'
import { WALLET_ERROR, WALLET_POLL_MS, type WalletBalanceResponse } from '../../shared/wallet-contract.ts'
import { formatWalletAmount } from './format.ts'
import { walletT } from './locales.ts'
import { fetchWalletBalance, fetchWalletStatus } from './wire.ts'
import css from './wallet.module.css'

export interface WalletPanelProps {
  readonly locale: string | undefined
  readonly onClose: () => void
  readonly onBalanceChange?: (label: string | undefined) => void
}

/** Compact modal: balance + console budget deep link. */
export function WalletPanel({ locale, onClose, onBalanceChange }: WalletPanelProps) {
  const t = walletT(locale)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<WalletBalanceResponse | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [sessionRevoked, setSessionRevoked] = useState(false)
  const [usagePoliciesUrl, setUsagePoliciesUrl] = useState<string | undefined>()

  const load = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    setSessionRevoked(false)
    const dict = walletT(locale)
    try {
      const status = await fetchWalletStatus()
      setUsagePoliciesUrl(status.usagePoliciesUrl)
      const balance = await fetchWalletBalance(locale)
      setData(balance)
      setUsagePoliciesUrl(balance.usagePoliciesUrl)
      onBalanceChange?.(formatWalletAmount(balance.availableBalance, balance.currency))
    } catch (cause: unknown) {
      setData(undefined)
      const err = cause as Error & { code?: string }
      if (err.message === 'HOST_API_NOT_FOUND' || err.message === 'not found') {
        setError(dict('hostApiMissing'))
      } else if (err.code === WALLET_ERROR.sessionRevoked) {
        setSessionRevoked(true)
        setError(dict('reauthHint'))
      } else {
        setError(err.message.length > 0 ? err.message : dict('error'))
      }
    } finally {
      setLoading(false)
    }
  }, [locale, onBalanceChange])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (sessionRevoked) return
    const timer = window.setInterval(() => {
      void load()
    }, WALLET_POLL_MS)
    return () => { window.clearInterval(timer) }
  }, [load, sessionRevoked])

  const openBudget = useCallback(() => {
    const url = usagePoliciesUrl ?? data?.usagePoliciesUrl
    if (url === undefined || url.length === 0) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [data?.usagePoliciesUrl, usagePoliciesUrl])

  const budgetUrl = usagePoliciesUrl ?? data?.usagePoliciesUrl

  return (
    <div className={css.panel} role="dialog" aria-modal="true" aria-labelledby="supanexus-wallet-title">
      <div className={css.header}>
        <h2 className={css.title} id="supanexus-wallet-title">{t('title')}</h2>
        <button type="button" className={css.closeBtn} aria-label={t('close')} onClick={onClose}>
          ×
        </button>
      </div>

      {loading && data === undefined ? (
        <p className={css.status}>{t('loading')}</p>
      ) : null}

      {data !== undefined ? (
        <div className={css.balanceBlock}>
          <p className={css.balanceLabel}>{t('balanceLabel')}</p>
          <p className={css.balanceValue}>
            {formatWalletAmount(data.availableBalance, data.currency)}
          </p>
          {data.name.trim().length > 0 ? (
            <p className={css.orgRow}>
              {t('orgLabel')}
              {': '}
              {data.name}
            </p>
          ) : null}
        </div>
      ) : null}

      <p className={css.notice}>{t('visibilityHint')}</p>

      {error !== undefined ? (
        <p className={sessionRevoked ? css.hint : css.error}>{error}</p>
      ) : (
        <p className={css.hint}>{t('budgetHint')}</p>
      )}

      <div className={css.actions}>
        <button
          type="button"
          className={css.button}
          disabled={budgetUrl === undefined || budgetUrl.length === 0}
          onClick={openBudget}
        >
          {t('configureBudget')}
        </button>
        <button
          type="button"
          className={css.buttonSecondary}
          disabled={loading}
          onClick={() => { void load() }}
        >
          {t('refresh')}
        </button>
      </div>
    </div>
  )
}
