import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { useQuickSetup } from './useQuickSetup.ts'
import { quickSetupT } from './locales.ts'
import css from './quick-setup.module.css'

export interface QuickSetupCardProps {
  readonly ctx: ClientContext
  readonly locale: string | undefined
}

/** Models footer card: one-click SupaNexus OAuth setup. */
export function QuickSetupCard(props: QuickSetupCardProps) {
  const t = quickSetupT(props.locale)
  const state = useQuickSetup({ ctx: props.ctx, locale: props.locale })
  const busy = state.phase === 'starting' || state.phase === 'writing'

  return (
    <section className={css.quickSetupCard} aria-label={t('title')}>
      <h3 className={css.title}>{t('title')}</h3>
      <p className={css.description}>{t('description')}</p>
      {state.phase === 'awaiting-approval' && (
        <p className={css.status}>{t('awaiting')}</p>
      )}
      {state.phase === 'writing' && (
        <p className={css.status}>{t('writing')}</p>
      )}
      {state.phase === 'done' && state.message !== undefined && (
        <p className={css.success}>{state.message}</p>
      )}
      {state.phase === 'error' && state.message !== undefined && (
        <p className={css.error}>{state.message}</p>
      )}
      <div className={css.actions}>
        <button
          type="button"
          className={css.button}
          disabled={busy}
          onClick={() => { void state.start() }}
        >
          {t('quickSetup')}
        </button>
        {state.phase === 'awaiting-approval' && (
          <button type="button" className={css.buttonSecondary} onClick={state.reopenAuth}>
            {t('reopenAuth')}
          </button>
        )}
      </div>
    </section>
  )
}
