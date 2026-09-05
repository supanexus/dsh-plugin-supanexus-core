import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { buildOfficialSiteUrl } from '../../shared/official-site.ts'
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts'
import { useActiveLineId } from '../settings/useShowWalletPref.ts'
import { useClientLocale } from '../use-client-locale.ts'
import { SkillMarketPanel } from './SkillMarketPanel.tsx'
import { skillMarketT } from './locales.ts'
import { useSkillMarket } from './useSkillMarket.ts'
import css from './skill-market.module.css'

function SkillMarketIcon({ size }: { readonly size: number }) {
  // 2×2 app grid — reads as “applications / plugins”, not a generic list.
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export interface SkillMarketRootProps extends PropsRuntime<'sidebar.footer.action'> {
  readonly ctx: ClientContext
  readonly settings: SettingsScope<SupaNexusUiSettings>
}

/** Sidebar footer trigger + skill market modal. */
export function SkillMarketRoot({ wide, ctx, settings }: SkillMarketRootProps) {
  const locale = useClientLocale(ctx)
  const t = skillMarketT(locale)
  const lineId = useActiveLineId(settings)
  const officialSiteUrl = useMemo(
    () => buildOfficialSiteUrl({ lineId, locale: locale ?? null }),
    [lineId, locale],
  )
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const state = useSkillMarket({ ctx, locale, open })
  const close = useCallback(() => { setOpen(false) }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [close, open])

  return (
    <div className={css.layer}>
      <button
        type="button"
        className={wide ? css.trigger : `${css.trigger} ${css.rail}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={titleId}
        onClick={() => { setOpen(value => !value) }}
      >
        <SkillMarketIcon size={wide ? 16 : 18} />
        {wide && <span className={css.triggerLabel} id={titleId}>{t('nav')}</span>}
      </button>
      {open && (
        <div className={css.overlay} role="presentation">
          <div className={css.mask} aria-hidden="true" onClick={close} />
          <SkillMarketPanel state={state} onClose={close} officialSiteUrl={officialSiteUrl} />
        </div>
      )}
    </div>
  )
}
