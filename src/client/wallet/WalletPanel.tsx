import { useCallback, useEffect, useId, useState } from 'react'
import {
  WALLET_ERROR,
  WALLET_POLL_MS,
  type WalletBalanceResponse,
} from '../../shared/wallet-contract.ts'
import {
  formatPointsRemaining,
  formatWalletAmount,
  formatWalletUnixDate,
} from './format.ts'
import { walletT } from './locales.ts'
import { fetchWalletBalance, fetchWalletStatus } from './wire.ts'
import css from './wallet.module.css'

export interface WalletPanelProps {
  readonly locale: string | undefined
  readonly onClose: () => void
  readonly onBalanceChange?: (balance: WalletBalanceResponse | undefined) => void
}

type WalletTab = 'account' | 'subscription'

/** Compact modal: account / subscription tabs + console budget deep link. */
export function WalletPanel({ locale, onClose, onBalanceChange }: WalletPanelProps) {
  const t = walletT(locale)
  const tabListId = useId()
  const [tab, setTab] = useState<WalletTab>('account')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<WalletBalanceResponse | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [sessionRevoked, setSessionRevoked] = useState(false)
  const [credentialMismatch, setCredentialMismatch] = useState(false)
  const [usagePoliciesUrl, setUsagePoliciesUrl] = useState<string | undefined>()

  const load = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    setSessionRevoked(false)
    setCredentialMismatch(false)
    const dict = walletT(locale)
    try {
      const status = await fetchWalletStatus()
      setUsagePoliciesUrl(status.usagePoliciesUrl)
      if (status.connected && status.credentialAligned === false) {
        setData(undefined)
        setCredentialMismatch(true)
        setError(dict('keyMismatchHint'))
        onBalanceChange?.(undefined)
        return
      }
      const balance = await fetchWalletBalance(locale)
      setData(balance)
      setUsagePoliciesUrl(balance.usagePoliciesUrl)
      onBalanceChange?.(balance)
    } catch (cause: unknown) {
      setData(undefined)
      onBalanceChange?.(undefined)
      const err = cause as Error & { code?: string }
      if (err.message === 'HOST_API_NOT_FOUND' || err.message === 'not found') {
        setError(dict('hostApiMissing'))
      } else if (err.code === WALLET_ERROR.sessionRevoked) {
        setSessionRevoked(true)
        setError(dict('reauthHint'))
      } else if (err.code === WALLET_ERROR.credentialMismatch) {
        setCredentialMismatch(true)
        setError(dict('keyMismatchHint'))
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
    if (sessionRevoked || credentialMismatch) return
    const timer = window.setInterval(() => {
      void load()
    }, WALLET_POLL_MS)
    return () => { window.clearInterval(timer) }
  }, [credentialMismatch, load, sessionRevoked])

  const openBudget = useCallback(() => {
    const url = usagePoliciesUrl ?? data?.usagePoliciesUrl
    if (url === undefined || url.length === 0) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [data?.usagePoliciesUrl, usagePoliciesUrl])

  const budgetUrl = usagePoliciesUrl ?? data?.usagePoliciesUrl
  const resetAt = data === undefined
    ? undefined
    : formatWalletUnixDate(data.nextPointsResetAtUnix, locale)
  const periodEnd = data === undefined
    ? undefined
    : formatWalletUnixDate(data.periodEndUnix, locale)
  const softHint = sessionRevoked || credentialMismatch

  return (
    <div className={css.panel} role="dialog" aria-modal="true" aria-labelledby="supanexus-wallet-title">
      <div className={css.header}>
        <h2 className={css.title} id="supanexus-wallet-title">{t('title')}</h2>
        <button type="button" className={css.closeBtn} aria-label={t('close')} onClick={onClose}>
          ×
        </button>
      </div>

      {loading && data === undefined && !credentialMismatch ? (
        <p className={css.status}>{t('loading')}</p>
      ) : null}

      {data !== undefined ? (
        <>
          <div className={css.tabBar}>
            <div className={css.segmentGroup} role="tablist" aria-label={t('title')} id={tabListId}>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'account'}
                className={tab === 'account' ? css.segmentButtonActive : css.segmentButton}
                onClick={() => { setTab('account') }}
              >
                {t('tabAccount')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'subscription'}
                className={tab === 'subscription' ? css.segmentButtonActive : css.segmentButton}
                onClick={() => { setTab('subscription') }}
              >
                {t('tabSubscription')}
              </button>
            </div>
          </div>

          {tab === 'account' ? (
            <div className={css.balanceBlock} role="tabpanel">
              <p className={css.balanceLabel}>{t('balanceLabel')}</p>
              <p className={css.balanceValue}>
                {formatWalletAmount(data.availableBalance, data.currency)}
              </p>
              {data.name.length > 0 ? (
                <p className={css.orgRow}>
                  {t('orgLabel')}
                  {': '}
                  {data.name}
                </p>
              ) : null}
            </div>
          ) : (
            <div className={css.balanceBlock} role="tabpanel">
              <p className={css.balanceLabel}>{t('pointsLabel')}</p>
              <p className={css.balanceValue}>
                {formatPointsRemaining(data.pointsRemaining, locale)}
              </p>
              {data.pointsGranted.length > 0 && data.pointsGranted !== '0' ? (
                <p className={css.orgRow}>
                  {t('pointsGrantedLabel')}
                  {': '}
                  {formatPointsRemaining(data.pointsGranted, locale)}
                </p>
              ) : null}

              <p className={css.balanceLabel}>{t('planLabel')}</p>
              <p className={data.planName.length > 0 ? css.balanceSecondary : css.orgRow}>
                {data.planName.length > 0 ? data.planName : t('noPlan')}
              </p>
              {data.subscriptionStatus.length > 0 ? (
                <p className={css.orgRow}>
                  {t('subscriptionStatusLabel')}
                  {': '}
                  {data.subscriptionStatus}
                </p>
              ) : null}
              {resetAt !== undefined ? (
                <p className={css.orgRow}>
                  {t('resetAtLabel')}
                  {': '}
                  {resetAt}
                </p>
              ) : null}
              {periodEnd !== undefined ? (
                <p className={css.orgRow}>
                  {t('periodEndLabel')}
                  {': '}
                  {periodEnd}
                </p>
              ) : null}
            </div>
          )}
        </>
      ) : null}

      <p className={css.notice}>{t('visibilityHint')}</p>

      {error !== undefined ? (
        <p className={softHint ? css.hint : css.error}>{error}</p>
      ) : (
        <p className={css.hint}>{t('budgetHint')}</p>
      )}

      <div className={css.actions}>
        <button
          type="button"
          className={css.button}
          disabled={budgetUrl === undefined || budgetUrl.length === 0 || credentialMismatch}
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
