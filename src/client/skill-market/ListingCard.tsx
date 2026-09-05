import type { PluginListingItem } from '../../shared/plugin-market-contract.ts'
import { PluginListingIcon } from './PluginListingIcon.tsx'
import type { SkillMarketState } from './useSkillMarket.ts'
import type { SkillMarketLayout } from './layout.ts'
import css from './skill-market.module.css'

export interface ListingCardProps {
  readonly item: PluginListingItem
  readonly state: SkillMarketState
  readonly layout: SkillMarketLayout
}

function PluginToggleSwitch({
  item,
  state,
}: {
  readonly item: PluginListingItem
  readonly state: SkillMarketState
}) {
  const {
    t,
    togglingPackage,
    isOperating,
    hasOperationModal,
    canToggle,
    getToggleStatus,
    onToggle,
  } = state
  const toggleStatus = getToggleStatus(item)
  if (!canToggle(item) || (toggleStatus?.row_ids?.length ?? 0) === 0) return null

  const enabled = toggleStatus?.enabled !== false
  const busy = togglingPackage === item.package_name || isOperating || hasOperationModal

  return (
    <label
      className={`${css.toggleRow}${enabled ? ` ${css.toggleRowEnabled}` : ''}`}
      title={enabled ? t('pluginEnabled') : t('pluginDisabled')}
    >
      <span className={css.toggleLabel}>{enabled ? t('pluginEnabled') : t('pluginDisabled')}</span>
      <span className={css.toggleSwitch}>
        <input
          type="checkbox"
          checked={enabled}
          disabled={busy}
          aria-label={enabled ? t('toggleDisable') : t('toggleEnable')}
          onChange={(event) => { onToggle(item, event.target.checked) }}
        />
        <span className={css.toggleTrack} aria-hidden="true" />
        <span className={css.toggleThumb} aria-hidden="true" />
      </span>
    </label>
  )
}

function CardActions({
  item,
  state,
  docs,
  homepage,
  className,
}: {
  readonly item: PluginListingItem
  readonly state: SkillMarketState
  readonly docs: string | undefined
  readonly homepage: string | undefined
  readonly className?: string | undefined
}) {
  const {
    t,
    installingCode,
    uninstallingCode,
    isOperating,
    hasOperationModal,
    isInstalled,
    canUninstall,
    getUpgradeStatus,
    onInstall,
    onUpgrade,
    onUninstall,
  } = state
  const installed = isInstalled(item)
  const upgradeStatus = getUpgradeStatus(item)
  const upgradeable = installed && upgradeStatus?.upgradeable === true
  const installBusy = installingCode === item.install_code
  const uninstallBusy = uninstallingCode === item.install_code
  const operationBusy = isOperating || hasOperationModal
  const showUninstall = installed && canUninstall(item)

  return (
    <div className={className ?? css.cardFooter}>
      {installed ? <PluginToggleSwitch item={item} state={state} /> : null}
      {upgradeable ? (
        <button
          type="button"
          className={css.buttonSm}
          disabled={operationBusy}
          onClick={() => { void onUpgrade(item) }}
        >
          {installBusy
            ? t('upgrading')
            : upgradeStatus?.listing_version !== null && upgradeStatus?.listing_version !== undefined
              ? t('upgradeTo').replace('{version}', upgradeStatus.listing_version)
              : item.version !== undefined && item.version !== null && item.version.length > 0
                ? t('upgradeTo').replace('{version}', item.version)
                : t('upgrade')}
        </button>
      ) : null}
      {showUninstall ? (
        <button
          type="button"
          className={css.buttonSmDanger}
          disabled={operationBusy}
          onClick={() => { void onUninstall(item) }}
        >
          {uninstallBusy ? t('uninstalling') : t('uninstall')}
        </button>
      ) : !upgradeable ? (
        <button
          type="button"
          className={css.buttonSm}
          disabled={installed || operationBusy}
          onClick={() => { void onInstall(item) }}
        >
          {installBusy
            ? t('installing')
            : installed
              ? t('installed')
              : operationBusy
                ? t('installWait')
                : t('install')}
        </button>
      ) : null}
      {docs !== undefined && docs.length > 0 && (
        <a className={css.linkButtonGhost} href={docs} target="_blank" rel="noreferrer">
          {t('openDocs')}
        </a>
      )}
      {homepage !== undefined && homepage.length > 0 && homepage !== docs && (
        <a className={css.linkButtonGhost} href={homepage} target="_blank" rel="noreferrer">
          {t('openHomepage')}
        </a>
      )}
    </div>
  )
}

function CardDescription({ text, className }: {
  readonly text: string
  readonly className: string | undefined
}) {
  const value = text.trim()
  return (
    <p className={className ?? ''} title={value}>
      {value}
    </p>
  )
}

function CardTitleRow({
  item,
  version,
}: {
  readonly item: PluginListingItem
  readonly version?: string | null | undefined
}) {
  const label = version?.trim()
  return (
    <div className={css.cardTitleRow}>
      <h3 className={css.cardTitle}>{item.name}</h3>
      {label !== undefined && label.length > 0 ? (
        <span className={`${css.badge} ${css.badgeVersion}`}>
          v
          {label}
        </span>
      ) : null}
    </div>
  )
}

function resolveCardVersion(
  item: PluginListingItem,
  installed: boolean,
  installedVersion: string | null | undefined,
): string | null {
  if (installed) return installedVersion?.trim() || null
  return item.version?.trim() || null
}

function CardMeta({ item, t, upgradeable, disabled }: {
  readonly item: PluginListingItem
  readonly t: SkillMarketState['t']
  readonly upgradeable: boolean
  readonly disabled: boolean
}) {
  return (
    <div className={css.cardMeta}>
      {disabled ? (
        <span className={`${css.badge} ${css.badgeDisabled}`}>
          {t('pluginDisabled')}
        </span>
      ) : null}
      {upgradeable ? (
        <span className={`${css.badge} ${css.badgeUpgrade}`}>
          {t('upgradeAvailable')}
        </span>
      ) : null}
      <span
        className={`${css.badge} ${
          item.source === 'supanexus' ? css.badgeSourceSupanexus : css.badgeSourceCommunity
        }`}
      >
        {item.source === 'supanexus' ? t('sourceSupanexus') : t('sourceCommunity')}
      </span>
      <span
        className={`${css.badge} ${
          item.layer === 'core' ? css.badgeLayerCore : css.badgeLayerFeature
        }`}
      >
        {item.layer === 'core' ? t('layerCore') : t('layerFeature')}
      </span>
    </div>
  )
}

function CardBody({ item, t, upgradeable, disabled, version }: {
  readonly item: PluginListingItem
  readonly t: SkillMarketState['t']
  readonly upgradeable: boolean
  readonly disabled: boolean
  readonly version?: string | null | undefined
}) {
  return (
    <>
      <div className={css.cardHead}>
        <PluginListingIcon url={item.icon_url} name={item.name} />
        <div className={css.cardHeadText}>
          <CardTitleRow item={item} version={version} />
          <p className={css.cardCode} title={item.package_name}>
            {item.package_name}
          </p>
        </div>
      </div>
      <CardMeta item={item} t={t} upgradeable={upgradeable} disabled={disabled} />
      <CardDescription text={item.description ?? ''} className={css.cardDesc} />
    </>
  )
}

export function ListingCard({ item, state, layout }: ListingCardProps) {
  const { t, isInstalled, getUpgradeStatus, getToggleStatus } = state
  const docs = item.docs_url?.trim()
  const homepage = item.homepage_url?.trim()
  const isList = layout === 'cols1'
  const actionProps = { item, state, docs, homepage }
  const installed = isInstalled(item)
  const upgradeStatus = getUpgradeStatus(item)
  const upgradeable = installed && upgradeStatus?.upgradeable === true
  const toggleStatus = getToggleStatus(item)
  const pluginDisabled = installed && toggleStatus?.enabled === false
  const cardVersion = resolveCardVersion(item, installed, upgradeStatus?.installed_version)
  const cardClass = `${css.card} ${isList ? css.cardList : css.cardGrid}${pluginDisabled ? ` ${css.cardDisabled}` : ''}`

  if (isList) {
    return (
      <article className={cardClass}>
        <div className={css.cardListTop}>
          <div className={css.cardListLead}>
            <PluginListingIcon url={item.icon_url} name={item.name} />
            <div className={css.cardListText}>
              <CardTitleRow item={item} version={cardVersion} />
              <p className={css.cardCodeList} title={item.package_name}>
                {item.package_name}
              </p>
              <CardMeta item={item} t={t} upgradeable={upgradeable} disabled={pluginDisabled} />
            </div>
          </div>
          <CardActions {...actionProps} className={css.cardListActions} />
        </div>
        <CardDescription text={item.description ?? ''} className={css.cardDescList} />
      </article>
    )
  }

  return (
    <article className={cardClass}>
      <div className={css.cardBody}>
        <CardBody
          item={item}
          t={t}
          upgradeable={upgradeable}
          disabled={pluginDisabled}
          version={cardVersion}
        />
      </div>
      <CardActions {...actionProps} />
    </article>
  )
}
