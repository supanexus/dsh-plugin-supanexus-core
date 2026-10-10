import { useCallback, useEffect, useState } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
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

const FALLBACK_LINES: readonly LineStatusRow[] = [
  { id: 'global', label: 'Global' },
  { id: 'cn', label: '中国大陆' },
]

export interface SupaNexusSettingsCardProps extends PropsRuntime<'plugins.item'>, PropsLocale<'supanexus.settings'> {
  readonly ctx: ClientContext
  readonly scope: ConfigForm<SupaNexusUiSettings>
}

/** Plugins page contribution: summary one-liner or full settings form. */
export function SupaNexusSettingsCard(props: SupaNexusSettingsCardProps) {
  const { ctx, scope, view, t: slotT } = props
  const locale = useClientLocale(ctx)
  const t = settingsCardT(locale)
  const showWallet = useShowWalletPref(scope)
  const showBrand = useShowBrandPref(scope)
  const { available, writable } = useSettingsWritable(scope)
  const [saving, setSaving] = useState(false)
  const [regionLoading, setRegionLoading] = useState(false)
  const [regionLocked, setRegionLocked] = useState(false)
  const [regionLines, setRegionLines] = useState<readonly LineStatusRow[]>(FALLBACK_LINES)
  const [activeLineId, setActiveLineId] = useState(() => readActiveLineId(scope))

  useEffect(() => scope.subscribe(() => {
    setActiveLineId(readActiveLineId(scope))
  }), [scope])

  useEffect(() => {
    if (view !== 'page' || !available) return
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
  }, [available, view])

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

  if (view === 'summary') return slotT('description')
  if (!available) return null

  const regionDisabled = !writable || saving || regionLocked || regionLoading

  return (
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
  )
}
