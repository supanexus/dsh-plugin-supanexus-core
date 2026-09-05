import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { canTogglePlugin, canUninstallPlugin, type PluginCategoryItem, type PluginListingItem, type PluginToggleStatusEntry, type PluginUpgradeStatusEntry } from '../../shared/plugin-market-contract.ts'
import { fetchPluginRemoteVersion, fetchPluginToggleStatus, fetchPluginUpgradeStatus, installPlugin, listPluginCategories, listPluginListings, setPluginEnabled, uninstallPlugin } from './wire.ts'
import { skillMarketLocaleParam, skillMarketT } from './locales.ts'
import { InstallPluginError } from './install-error.ts'
import type { InstallProgressState } from './install-progress.ts'
import type { InstallTab } from './install-tab.ts'

const PAGE_SIZE = 12

export interface UseSkillMarketOptions {
  readonly ctx: ClientContext
  readonly locale: string | undefined
  readonly open: boolean
}

async function loadInventory(
  ctx: ClientContext,
): Promise<ReadonlySet<string>> {
  const result = await ctx.remote.pluginInventory.list()
  if (!result.ok) return new Set()
  const names = new Set<string>()
  for (const entry of result.value.entries) {
    names.add(entry.moduleName)
    names.add(entry.moduleName.replace(/^@/, ''))
  }
  return names
}

function isInstalled(
  item: PluginListingItem,
  installed: ReadonlySet<string>,
): boolean {
  if (installed.has(item.package_name)) return true
  const short = item.package_name.includes('/')
    ? item.package_name.slice(item.package_name.indexOf('/') + 1)
    : item.package_name
  return installed.has(short)
}

export function useSkillMarket({ ctx, locale, open }: UseSkillMarketOptions) {
  const t = useMemo(() => skillMarketT(locale), [locale])
  const apiLocale = useMemo(() => skillMarketLocaleParam(locale), [locale])
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<readonly PluginListingItem[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('all')
  const [layer, setLayer] = useState('all')
  const [category, setCategory] = useState('all')
  const [categories, setCategories] = useState<readonly PluginCategoryItem[]>([])
  const [error, setError] = useState<string | undefined>()
  const [installedNames, setInstalledNames] = useState<ReadonlySet<string>>(new Set())
  const [installingCode, setInstallingCode] = useState<string | undefined>()
  const [uninstallingCode, setUninstallingCode] = useState<string | undefined>()
  const [installProgress, setInstallProgress] = useState<InstallProgressState | undefined>()
  const [installTab, setInstallTab] = useState<InstallTab>('not_installed')
  const [upgradeByCode, setUpgradeByCode] = useState<Readonly<Record<string, PluginUpgradeStatusEntry>>>({})
  const [toggleByPackage, setToggleByPackage] = useState<Readonly<Record<string, PluginToggleStatusEntry>>>({})
  const [togglingPackage, setTogglingPackage] = useState<string | undefined>()
  const operationLockRef = useRef(false)

  const isOperating = installProgress?.phase === 'running' || togglingPackage !== undefined
  const hasOperationModal = installProgress !== undefined

  const refreshInventory = useCallback(async () => {
    try {
      setInstalledNames(await loadInventory(ctx))
    } catch {
      setInstalledNames(new Set())
    }
  }, [ctx])

  const load = useCallback(async (pageNum: number, append: boolean) => {
    setLoading(true)
    setError(undefined)
    try {
      const data = await listPluginListings({
        locale: apiLocale,
        page: pageNum,
        page_size: PAGE_SIZE,
        ...(query.length > 0 ? { q: query } : {}),
        ...(source !== 'all' ? { source } : {}),
        ...(layer !== 'all' ? { layer } : {}),
        ...(category !== 'all' ? { category } : {}),
      })
      setItems(prev => (append ? [...prev, ...(data.items ?? [])] : (data.items ?? [])))
      setHasNext(!!data.has_next_page)
      setPage(data.page ?? pageNum)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : t('loadFailed')
      setError(message === 'HOST_API_NOT_FOUND' ? t('hostApiMissing') : message)
      if (!append) setItems([])
    } finally {
      setLoading(false)
    }
  }, [apiLocale, query, source, layer, category, t])

  useEffect(() => {
    if (!open) return
    void listPluginCategories({ locale: apiLocale }).then((data) => {
      setCategories(data.items ?? [])
    }).catch(() => {
      setCategories([])
    })
  }, [open, apiLocale])

  useEffect(() => {
    if (!open) return
    void refreshInventory()
  }, [open, refreshInventory])

  useEffect(() => {
    if (!open) return
    void load(1, false)
  }, [open, query, source, layer, category, load])

  const refreshUpgradeStatus = useCallback(async (codes: readonly string[]) => {
    if (codes.length === 0) {
      setUpgradeByCode({})
      return
    }
    try {
      const data = await fetchPluginUpgradeStatus(codes, apiLocale)
      const next: Record<string, PluginUpgradeStatusEntry> = {}
      for (const entry of data.items ?? []) {
        next[entry.install_code] = entry
      }
      setUpgradeByCode(next)
    } catch {
      setUpgradeByCode({})
    }
  }, [apiLocale])

  useEffect(() => {
    if (!open || installTab !== 'installed') return
    const codes = items
      .filter(item => isInstalled(item, installedNames))
      .map(item => item.install_code)
    void refreshUpgradeStatus(codes)
  }, [open, installTab, items, installedNames, refreshUpgradeStatus])

  const refreshToggleStatus = useCallback(async (packageNames: readonly string[]) => {
    if (packageNames.length === 0) {
      setToggleByPackage({})
      return
    }
    try {
      const data = await fetchPluginToggleStatus(packageNames)
      const next: Record<string, PluginToggleStatusEntry> = {}
      for (const entry of data.items ?? []) {
        next[entry.package_name] = entry
      }
      setToggleByPackage(next)
    } catch {
      setToggleByPackage({})
    }
  }, [])

  useEffect(() => {
    if (!open || installTab !== 'installed') return
    const names = items
      .filter(item => isInstalled(item, installedNames))
      .map(item => item.package_name)
    void refreshToggleStatus(names)
  }, [open, installTab, items, installedNames, refreshToggleStatus])

  const onSearch = useCallback(() => {
    setQuery(keyword.trim())
  }, [keyword])

  const closeInstallProgress = useCallback(() => {
    setInstallProgress(undefined)
    setInstallingCode(undefined)
    setUninstallingCode(undefined)
  }, [])

  const toggleInstallLog = useCallback(() => {
    setInstallProgress(prev => (
      prev === undefined ? prev : { ...prev, showLog: !prev.showLog }
    ))
  }, [])

  const runInstall = useCallback(async (item: PluginListingItem) => {
    if (operationLockRef.current) return
    operationLockRef.current = true
    setInstallingCode(item.install_code)
    setInstallProgress({
      operation: 'install',
      item,
      phase: 'running',
      log: '',
      showLog: true,
    })
    setError(undefined)
    try {
      const result = await installPlugin(item.install_code, apiLocale)
      const log = result.log ?? (result.cliCommand.length > 0 ? `$ ${result.cliCommand}\n` : '')
      setInstallProgress({
        operation: 'install',
        item,
        phase: 'success',
        log,
        showLog: true,
        provider: result.provider,
      })
      await refreshInventory()
      if (installTab === 'installed') {
        await refreshUpgradeStatus([item.install_code])
      }
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : t('installFailed')
      const message = raw === 'HOST_API_NOT_FOUND' ? t('hostApiMissing') : raw
      const log = e instanceof InstallPluginError ? (e.log ?? '') : ''
      setInstallProgress({
        operation: 'install',
        item,
        phase: 'error',
        log,
        showLog: true,
        errorMessage: message,
      })
    } finally {
      setInstallingCode(undefined)
      operationLockRef.current = false
    }
  }, [apiLocale, installTab, refreshInventory, refreshUpgradeStatus, t])

  const onInstall = useCallback((item: PluginListingItem) => {
    if (operationLockRef.current || hasOperationModal) return
    setInstallProgress({
      operation: 'install',
      item,
      phase: 'confirm',
      log: '',
      showLog: false,
    })
  }, [hasOperationModal])

  const startInstall = useCallback(() => {
    if (installProgress?.operation !== 'install' || installProgress.phase !== 'confirm') return
    void runInstall(installProgress.item)
  }, [installProgress, runInstall])

  const runUpgrade = useCallback(async (
    item: PluginListingItem,
    targetVersion?: string,
    remoteVersion?: string,
  ) => {
    if (operationLockRef.current) return
    operationLockRef.current = true
    setInstallingCode(item.install_code)
    const versionFields = {
      ...(targetVersion !== undefined && targetVersion.length > 0 ? { targetVersion } : {}),
      ...(remoteVersion !== undefined && remoteVersion.length > 0 ? { remoteVersion } : {}),
    }
    setInstallProgress({
      operation: 'upgrade',
      item,
      phase: 'running',
      log: '',
      showLog: true,
      ...versionFields,
    })
    setError(undefined)
    try {
      const result = await installPlugin(item.install_code, apiLocale)
      const log = result.log ?? (result.cliCommand.length > 0 ? `$ ${result.cliCommand}\n` : '')
      setInstallProgress({
        operation: 'upgrade',
        item,
        phase: 'success',
        log,
        showLog: true,
        provider: result.provider,
        ...versionFields,
      })
      await refreshInventory()
      await refreshUpgradeStatus([item.install_code])
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : t('upgradeFailed')
      const message = raw === 'HOST_API_NOT_FOUND' ? t('hostApiMissing') : raw
      const log = e instanceof InstallPluginError ? (e.log ?? '') : ''
      setInstallProgress({
        operation: 'upgrade',
        item,
        phase: 'error',
        log,
        showLog: true,
        errorMessage: message,
        ...versionFields,
      })
    } finally {
      setInstallingCode(undefined)
      operationLockRef.current = false
    }
  }, [apiLocale, refreshInventory, refreshUpgradeStatus, t])

  const onUpgrade = useCallback((item: PluginListingItem) => {
    if (operationLockRef.current || hasOperationModal) return
    const status = upgradeByCode[item.install_code]
    if (status?.upgradeable !== true) return
    const listingVersion = status.listing_version ?? item.version?.trim() ?? undefined
    operationLockRef.current = true
    setInstallProgress({
      operation: 'upgrade',
      item,
      phase: 'running',
      log: '',
      showLog: false,
      ...(listingVersion !== undefined && listingVersion.length > 0 ? { targetVersion: listingVersion } : {}),
    })
    void (async () => {
      try {
        const remote = await fetchPluginRemoteVersion(item.install_code, apiLocale)
        setInstallProgress({
          operation: 'upgrade',
          item,
          phase: 'confirm',
          log: '',
          showLog: false,
          ...(listingVersion !== undefined && listingVersion.length > 0 ? { targetVersion: listingVersion } : {}),
          ...(remote.version !== null && remote.version.length > 0 ? { remoteVersion: remote.version } : {}),
        })
      } catch {
        setInstallProgress({
          operation: 'upgrade',
          item,
          phase: 'confirm',
          log: '',
          showLog: false,
          ...(listingVersion !== undefined && listingVersion.length > 0 ? { targetVersion: listingVersion } : {}),
        })
      } finally {
        operationLockRef.current = false
      }
    })()
  }, [apiLocale, hasOperationModal, upgradeByCode])

  const startUpgrade = useCallback(() => {
    if (installProgress?.operation !== 'upgrade' || installProgress.phase !== 'confirm') return
    void runUpgrade(installProgress.item, installProgress.targetVersion, installProgress.remoteVersion)
  }, [installProgress, runUpgrade])

  const runUninstall = useCallback(async (item: PluginListingItem) => {
    if (operationLockRef.current) return
    operationLockRef.current = true
    setUninstallingCode(item.install_code)
    setInstallProgress({
      operation: 'uninstall',
      item,
      phase: 'running',
      log: '',
      showLog: true,
    })
    setError(undefined)
    try {
      const result = await uninstallPlugin(item.package_name, item.install_code)
      const log = result.log ?? (result.cliCommand.length > 0 ? `$ ${result.cliCommand}\n` : '')
      setInstallProgress({
        operation: 'uninstall',
        item,
        phase: 'success',
        log,
        showLog: true,
      })
      await refreshInventory()
      if (installTab === 'installed') {
        await refreshUpgradeStatus([item.install_code])
      }
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : t('uninstallFailed')
      const message = raw === 'HOST_API_NOT_FOUND' ? t('hostApiMissing') : raw
      const log = e instanceof InstallPluginError ? (e.log ?? '') : ''
      setInstallProgress({
        operation: 'uninstall',
        item,
        phase: 'error',
        log,
        showLog: true,
        errorMessage: message,
      })
    } finally {
      setUninstallingCode(undefined)
      operationLockRef.current = false
    }
  }, [installTab, refreshInventory, refreshUpgradeStatus, t])

  const onUninstall = useCallback((item: PluginListingItem) => {
    if (operationLockRef.current || hasOperationModal || !canUninstallPlugin(item)) return
    setInstallProgress({
      operation: 'uninstall',
      item,
      phase: 'confirm',
      log: '',
      showLog: false,
    })
  }, [hasOperationModal])

  const startUninstall = useCallback(() => {
    if (installProgress?.operation !== 'uninstall' || installProgress.phase !== 'confirm') return
    void runUninstall(installProgress.item)
  }, [installProgress, runUninstall])

  const checkInstalled = useCallback(
    (item: PluginListingItem) => isInstalled(item, installedNames),
    [installedNames],
  )

  const checkCanUninstall = useCallback(
    (item: PluginListingItem) => canUninstallPlugin(item),
    [],
  )

  const getUpgradeStatus = useCallback(
    (item: PluginListingItem) => upgradeByCode[item.install_code],
    [upgradeByCode],
  )

  const checkCanToggle = useCallback(
    (item: PluginListingItem) => canTogglePlugin(item),
    [],
  )

  const getToggleStatus = useCallback(
    (item: PluginListingItem) => toggleByPackage[item.package_name],
    [toggleByPackage],
  )

  const onToggle = useCallback((item: PluginListingItem, enabled: boolean) => {
    if (operationLockRef.current || hasOperationModal || !canTogglePlugin(item)) return
    operationLockRef.current = true
    setTogglingPackage(item.package_name)
    void (async () => {
      try {
        const result = await setPluginEnabled(item.package_name, enabled)
        setToggleByPackage(prev => ({
          ...prev,
          [item.package_name]: {
            package_name: item.package_name,
            enabled: result.enabled,
            row_ids: result.row_ids,
            toggleable: true,
          },
        }))
        if (result.needsRefresh) {
          window.setTimeout(() => { window.location.reload() }, 1200)
        }
      } catch (e: unknown) {
        const raw = e instanceof Error ? e.message : t('toggleFailed')
        setError(raw === 'HOST_API_NOT_FOUND' ? t('hostApiMissing') : raw)
      } finally {
        setTogglingPackage(undefined)
        operationLockRef.current = false
      }
    })()
  }, [hasOperationModal, t])

  return {
    t,
    loading,
    items,
    page,
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
    installingCode,
    uninstallingCode,
    togglingPackage,
    isOperating,
    hasOperationModal,
    installProgress,
    installedNames,
    installTab,
    setInstallTab,
    upgradeByCode,
    toggleByPackage,
    onSearch,
    onInstall,
    startInstall,
    onUpgrade,
    startUpgrade,
    onUninstall,
    startUninstall,
    closeInstallProgress,
    toggleInstallLog,
    loadMore: () => { void load(page + 1, true) },
    isInstalled: checkInstalled,
    canUninstall: checkCanUninstall,
    canToggle: checkCanToggle,
    getToggleStatus,
    onToggle,
    getUpgradeStatus,
  }
}

export type SkillMarketState = ReturnType<typeof useSkillMarket>
