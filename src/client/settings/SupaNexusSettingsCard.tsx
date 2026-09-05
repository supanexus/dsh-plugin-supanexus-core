import { useCallback, useEffect, useState } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from './slot-contract.ts'
import {
  PINNED_LINE_FIELD,
  SHOW_BRAND_FIELD,
  SHOW_WALLET_FIELD,
  type SupaNexusUiSettings,
} from '../../shared/settings-contract.ts'
import type { LineStatusRow } from '../../shared/line-contract.ts'
import { useClientLocale } from '../use-client-locale.ts'
import { settingsCardT } from './locales.ts'
import { fetchLineStatus } from './line-wire.ts'
import {
  readActiveLineId,
  useSettingsWritable,
  useShowBrandPref,
  useShowWalletPref,
} from './useShowWalletPref.ts'
import css from './settings-card.module.css'

/** Same chevron path as `IconChevronDownOutline14` (avoid cross-package value import). */
function ChevronDown({ className }: { readonly className: string }) {
  return (
    <svg width={14} height={14} className={className} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

const FALLBACK_LINES: readonly LineStatusRow[] = [
  { id: 'global', label: 'Global' },
  { id: 'cn', label: '中国大陆' },
]

export interface SupaNexusSettingsCardProps extends PropsRuntime<'settings.plugin.item'> {
  readonly ctx: ClientContext
  readonly scope: SettingsScope<SupaNexusUiSettings>
}

/** Plugin-config card: region + balance + brand visibility. */
export function SupaNexusSettingsCard(props: SupaNexusSettingsCardProps) {
  const { ctx, scope } = props
  const locale = useClientLocale(ctx)
  const t = settingsCardT(locale)
  const showWallet = useShowWalletPref(scope)
  const showBrand = useShowBrandPref(scope)
  const { available, writable } = useSettingsWritable(scope)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [regionLoading, setRegionLoading] = useState(false)
  const [regionLocked, setRegionLocked] = useState(false)
  const [regionLines, setRegionLines] = useState<readonly LineStatusRow[]>(FALLBACK_LINES)
  const [activeLineId, setActiveLineId] = useState(() => readActiveLineId(scope))

  useEffect(() => scope.subscribe(() => {
    setActiveLineId(readActiveLineId(scope))
  }), [scope])

  useEffect(() => {
    if (!open || !available) return
    let cancelled = false
    setRegionLoading(true)
    void fetchLineStatus()
      .then((status) => {
        if (cancelled) return
        setRegionLines(status.lines.length > 0 ? status.lines : FALLBACK_LINES)
        setActiveLineId(status.activeLineId)
        setRegionLocked(status.locked)
      })
      .catch(() => {
        /* keep snapshot / fallback */
      })
      .finally(() => {
        if (!cancelled) setRegionLoading(false)
      })
    return () => { cancelled = true }
  }, [open, available])

  const onToggle = useCallback(async (field: typeof SHOW_WALLET_FIELD | typeof SHOW_BRAND_FIELD, checked: boolean) => {
    if (!writable || saving) return
    setSaving(true)
    try {
      await scope.set(field, checked)
    } finally {
      setSaving(false)
    }
  }, [scope, saving, writable])

  const onSelectRegion = useCallback(async (lineId: string) => {
    if (!writable || saving || regionLocked || lineId === activeLineId) return
    setSaving(true)
    try {
      await scope.set(PINNED_LINE_FIELD, lineId)
      setActiveLineId(lineId)
    } finally {
      setSaving(false)
    }
  }, [activeLineId, regionLocked, saving, scope, writable])

  if (!available) return null

  const title = t('title')
  const regionDisabled = !writable || saving || regionLocked || regionLoading

  return (
    <li className={open ? `${css.card} ${css.cardOpen}` : css.card}>
      <button
        type="button"
        className={css.header}
        aria-expanded={open}
        aria-label={`${t(open ? 'collapse' : 'expand')}: ${title}`}
        onClick={() => { setOpen(value => !value) }}
      >
        <span className={css.headText}>
          <span className={css.name}>{title}</span>
          <span className={css.description}>{t('description')}</span>
        </span>
        <ChevronDown className={[css.chevron, open ? css.chevronOpen : undefined].filter(Boolean).join(' ')} />
      </button>
      {open ? (
        <div className={css.body}>
          {!writable ? <p className={css.readOnly} role="status">{t('readOnly')}</p> : null}
          <div className={css.field}>
            <span className={css.row} style={{ cursor: 'default' }}>{t('region')}</span>
            <div
              className={css.segment}
              role="radiogroup"
              aria-label={t('region')}
              aria-busy={regionLoading}
            >
              {regionLines.map((line) => {
                const selected = line.id === activeLineId
                const label = line.id === 'cn'
                  ? t('regionCn')
                  : line.id === 'global'
                    ? t('regionGlobal')
                    : line.label
                return (
                  <button
                    key={line.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={selected ? `${css.segmentBtn} ${css.segmentBtnActive}` : css.segmentBtn}
                    disabled={regionDisabled}
                    onClick={() => { void onSelectRegion(line.id) }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <p className={css.hint}>
              {regionLocked
                ? t('regionLocked')
                : regionLoading
                  ? t('regionLoading')
                  : t('regionHint')}
            </p>
          </div>
          <div className={css.field}>
            <label className={writable ? css.row : `${css.row} ${css.rowDisabled}`}>
              <input
                className={css.checkbox}
                type="checkbox"
                checked={showWallet}
                disabled={!writable || saving}
                onChange={(event) => { void onToggle(SHOW_WALLET_FIELD, event.target.checked) }}
              />
              <span>{t('showWallet')}</span>
            </label>
            <p className={css.hint}>{t('showWalletHint')}</p>
          </div>
          <div className={css.field}>
            <label className={writable ? css.row : `${css.row} ${css.rowDisabled}`}>
              <input
                className={css.checkbox}
                type="checkbox"
                checked={showBrand}
                disabled={!writable || saving}
                onChange={(event) => { void onToggle(SHOW_BRAND_FIELD, event.target.checked) }}
              />
              <span>{t('showBrand')}</span>
            </label>
            <p className={css.hint}>{t('showBrandHint')}</p>
          </div>
        </div>
      ) : null}
    </li>
  )
}
