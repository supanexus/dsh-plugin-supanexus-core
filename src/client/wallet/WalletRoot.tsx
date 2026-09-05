import { useCallback, useEffect, useId, useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts'
import { WALLET_POLL_MS } from '../../shared/wallet-contract.ts'
import { useShowWalletPref } from '../settings/useShowWalletPref.ts'
import { useClientLocale } from '../use-client-locale.ts'
import { formatWalletAmount } from './format.ts'
import { useActiveModelProvider } from './useActiveModelProvider.ts'
import { shouldShowWallet } from './visibility.ts'
import { WalletPanel } from './WalletPanel.tsx'
import { walletT } from './locales.ts'
import { fetchWalletBalance, fetchWalletStatus } from './wire.ts'
import css from './wallet.module.css'

function WalletIcon({ size }: { readonly size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="3.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11.5" cy="9.5" r="1" fill="currentColor" />
    </svg>
  )
}

export interface WalletRootProps extends PropsRuntime<'sidebar.footer.action'> {
  readonly ctx: ClientContext
  readonly settings: SettingsScope<SupaNexusUiSettings>
}

/**
 * Sidebar balance row (amount as label) + detail modal.
 * Visible when the plugin setting allows it, SupaNexus is connected, and the
 * active session's model provider is `supanexus`.
 */
export function WalletRoot({ wide, ctx, settings }: WalletRootProps) {
  const locale = useClientLocale(ctx)
  const t = walletT(locale)
  const provider = useActiveModelProvider(ctx)
  const showWalletPref = useShowWalletPref(settings)
  const [connected, setConnected] = useState(false)
  const [amountLabel, setAmountLabel] = useState<string | undefined>()
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const close = useCallback(() => { setOpen(false) }, [])
  const visible = shouldShowWallet(connected, provider, showWalletPref)

  const refresh = useCallback(async () => {
    try {
      const status = await fetchWalletStatus()
      if (!status.connected) {
        setConnected(false)
        setAmountLabel(undefined)
        return
      }
      setConnected(true)
      try {
        const balance = await fetchWalletBalance(locale)
        setAmountLabel(formatWalletAmount(balance.availableBalance, balance.currency))
      } catch {
        setAmountLabel(undefined)
      }
    } catch {
      setConnected(false)
      setAmountLabel(undefined)
    }
  }, [locale])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => { void refresh() }, WALLET_POLL_MS)
    return () => { window.clearInterval(timer) }
  }, [refresh])

  useEffect(() => {
    if (!visible && open) setOpen(false)
  }, [open, visible])

  useEffect(() => {
    if (!open) return
    void refresh()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [close, open, refresh])

  if (!visible) return null

  const display = amountLabel ?? t('nav')
  const title = amountLabel === undefined
    ? `${t('nav')} — ${t('visibilityHint')}`
    : `${t('nav')} ${amountLabel} — ${t('visibilityHint')}`

  return (
    <div className={css.layer}>
      <button
        type="button"
        className={wide ? css.trigger : `${css.trigger} ${css.rail}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={title}
        title={title}
        onClick={() => { setOpen(value => !value) }}
      >
        <WalletIcon size={wide ? 16 : 18} />
        {wide && <span className={`${css.triggerLabel} ${css.amountLabel}`} id={titleId}>{display}</span>}
      </button>
      {open && (
        <div className={css.overlay} role="presentation">
          <div className={css.mask} aria-hidden="true" onClick={close} />
          <WalletPanel locale={locale} onClose={close} onBalanceChange={setAmountLabel} />
        </div>
      )}
    </div>
  )
}
