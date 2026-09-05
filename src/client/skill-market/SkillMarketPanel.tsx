import { useMemo, useState } from 'react'
import type { SkillMarketState } from './useSkillMarket.ts'
import { ListingCard } from './ListingCard.tsx'
import { InstallProgressModal } from './InstallProgressModal.tsx'
import type { SkillMarketLayout } from './layout.ts'
import { GridCols3Icon, ListCol1Icon } from './LayoutIcons.tsx'
import css from './skill-market.module.css'

export interface SkillMarketPanelProps {
  readonly state: SkillMarketState
  readonly onClose: () => void
  /** Resolved SupaNexus official site (.ai / .io + locale). */
  readonly officialSiteUrl: string
}

const DSH_PLUGIN_GITHUB_TOPIC_URL = 'https://github.com/topics/dsh-plugin'

export function SkillMarketPanel({ state, onClose, officialSiteUrl }: SkillMarketPanelProps) {
  const {
    t,
    loading,
    items,
    hasNext,
    keyword,
    setKeyword,
    source,
    setSource,
    layer,
    setLayer,
    category,
    setCategory,
    categories,
    error,
    installProgress,
    closeInstallProgress,
    startInstall,
    startUpgrade,
    startUninstall,
    toggleInstallLog,
    onSearch,
    loadMore,
    isInstalled,
    installTab,
    setInstallTab,
  } = state
  const [layout, setLayout] = useState<SkillMarketLayout>('cols3')
  const [categorySidebarOpen, setCategorySidebarOpen] = useState(true)

  const visibleItems = useMemo(
    () => items.filter(item => (
      installTab === 'installed' ? isInstalled(item) : !isInstalled(item)
    )),
    [items, installTab, isInstalled],
  )

  const emptyMessage = installTab === 'installed' ? t('emptyInstalled') : t('emptyNotInstalled')

  return (
    <div className={css.panel} role="dialog" aria-modal="true" aria-labelledby="skill-market-title">
      <header className={css.header}>
        <div className={css.titleBlock}>
          <h2 className={css.title} id="skill-market-title">{t('title')}</h2>
          <p className={css.subtitle}>{t('subtitle')}</p>
        </div>
        <div className={css.headerActions}>
          <a
            className={css.headerLink}
            href={officialSiteUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t('officialSite')}
          </a>
          <a
            className={css.headerLink}
            href={DSH_PLUGIN_GITHUB_TOPIC_URL}
            target="_blank"
            rel="noreferrer"
          >
            {t('githubPlugins')}
          </a>
          <button type="button" className={css.closeButton} aria-label={t('close')} onClick={onClose}>
            ×
          </button>
        </div>
      </header>
      <div className={css.body}>
        <div className={css.bodyLayout}>
          <aside
            className={`${css.categorySidebar} ${categorySidebarOpen ? '' : css.categorySidebarCollapsed}`}
            aria-label={t('categoryNavTitle')}
          >
            <div className={css.categorySidebarHead}>
              {categorySidebarOpen ? (
                <span className={css.categorySidebarTitle}>{t('categoryNavTitle')}</span>
              ) : null}
              <button
                type="button"
                className={css.sidebarToggle}
                aria-label={categorySidebarOpen ? t('collapseCategories') : t('expandCategories')}
                aria-expanded={categorySidebarOpen}
                onClick={() => { setCategorySidebarOpen((open) => !open) }}
              >
                {categorySidebarOpen ? '‹' : '›'}
              </button>
            </div>
            {categorySidebarOpen ? (
              <nav className={css.categoryNav} aria-label={t('categoryNavTitle')}>
                <button
                  type="button"
                  className={`${css.categoryNavItem} ${category === 'all' ? css.categoryNavItemActive : ''}`}
                  aria-current={category === 'all' ? 'true' : undefined}
                  onClick={() => { setCategory('all') }}
                >
                  {t('categoryAll')}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${css.categoryNavItem} ${category === c.slug ? css.categoryNavItemActive : ''}`}
                    aria-current={category === c.slug ? 'true' : undefined}
                    onClick={() => { setCategory(c.slug) }}
                  >
                    {c.name || c.slug}
                  </button>
                ))}
              </nav>
            ) : null}
          </aside>

          <div className={css.mainContent}>
            <div className={css.tabBar}>
              <div className={css.segmentGroup} role="tablist" aria-label={t('title')}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={installTab === 'not_installed'}
                  className={installTab === 'not_installed' ? css.segmentButtonActive : css.segmentButton}
                  onClick={() => { setInstallTab('not_installed') }}
                >
                  {t('tabNotInstalled')}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={installTab === 'installed'}
                  className={installTab === 'installed' ? css.segmentButtonActive : css.segmentButton}
                  onClick={() => { setInstallTab('installed') }}
                >
                  {t('tabInstalled')}
                </button>
              </div>
            </div>
        <div className={css.toolbar}>
          <select
            className={css.select}
            value={source}
            onChange={(e) => { setSource(e.target.value) }}
            aria-label={t('filterAll')}
          >
            <option value="all">{t('filterAll')}</option>
            <option value="supanexus">{t('sourceSupanexus')}</option>
            <option value="dsh_community">{t('sourceCommunity')}</option>
          </select>
          <select
            className={css.select}
            value={layer}
            onChange={(e) => { setLayer(e.target.value) }}
            aria-label={t('layerAll')}
          >
            <option value="all">{t('layerAll')}</option>
            <option value="core">{t('layerCore')}</option>
            <option value="feature">{t('layerFeature')}</option>
          </select>
          <input
            className={css.searchInput}
            value={keyword}
            placeholder={t('searchPlaceholder')}
            onChange={(e) => { setKeyword(e.target.value) }}
            onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }}
          />
          <button type="button" className={css.buttonSecondary} onClick={onSearch}>
            {t('searchPlaceholder').replace('…', '')}
          </button>
          <div
            className={`${css.segmentGroup} ${css.segmentGroupEnd}`}
            role="group"
            aria-label={t('layoutLabel')}
          >
            <button
              type="button"
              className={layout === 'cols3'
                ? `${css.segmentButtonActive} ${css.segmentButtonIcon}`
                : `${css.segmentButton} ${css.segmentButtonIcon}`}
              aria-pressed={layout === 'cols3'}
              aria-label={t('layoutCols3')}
              title={t('layoutCols3')}
              onClick={() => { setLayout('cols3') }}
            >
              <GridCols3Icon />
            </button>
            <button
              type="button"
              className={layout === 'cols1'
                ? `${css.segmentButtonActive} ${css.segmentButtonIcon}`
                : `${css.segmentButton} ${css.segmentButtonIcon}`}
              aria-pressed={layout === 'cols1'}
              aria-label={t('layoutCols1')}
              title={t('layoutCols1')}
              onClick={() => { setLayout('cols1') }}
            >
              <ListCol1Icon />
            </button>
          </div>
        </div>

        {error !== undefined && (
          <p className={css.alertError} role="alert">{error}</p>
        )}

        <div className={css.gridScroll}>
          {loading && items.length === 0 ? (
            <p className={css.loading}>{t('searchPlaceholder')}</p>
          ) : visibleItems.length === 0 ? (
            <p className={css.empty}>{items.length === 0 ? t('empty') : emptyMessage}</p>
          ) : (
            <div className={`${css.grid} ${layout === 'cols3' ? css.gridCols3 : css.gridCols1}`}>
              {visibleItems.map(item => (
                <ListingCard key={item.id} item={item} state={state} layout={layout} />
              ))}
            </div>
          )}
        </div>

        {hasNext && (
          <div className={css.footer}>
            <button type="button" className={css.buttonSecondary} disabled={loading} onClick={loadMore}>
              {t('loadMore')}
            </button>
          </div>
        )}
          </div>
        </div>
      </div>
      {installProgress !== undefined ? (
        <InstallProgressModal
          progress={installProgress}
          t={t}
          onClose={closeInstallProgress}
          onStartInstall={startInstall}
          onStartUpgrade={startUpgrade}
          onStartUninstall={startUninstall}
          onToggleLog={toggleInstallLog}
        />
      ) : null}
    </div>
  )
}
