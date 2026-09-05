import { useCallback, useEffect, useRef, useState } from 'react'
import type { PluginListingItem } from '../../shared/plugin-market-contract.ts'
import type { SkillMarketState } from './useSkillMarket.ts'
import type { InstallProgressState } from './install-progress.ts'
import { canRequestServiceRestart, requestServiceRestart } from './desktop-bridge.ts'
import css from './skill-market.module.css'

export interface InstallProgressModalProps {
  readonly progress: InstallProgressState
  readonly t: SkillMarketState['t']
  readonly onClose: () => void
  readonly onStartInstall: () => void
  readonly onStartUpgrade: () => void
  readonly onStartUninstall: () => void
  readonly onToggleLog: () => void
}

export function InstallProgressModal({
  progress,
  t,
  onClose,
  onStartInstall,
  onStartUpgrade,
  onStartUninstall,
  onToggleLog,
}: InstallProgressModalProps) {
  const logRef = useRef<HTMLPreElement>(null)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [restartError, setRestartError] = useState<string | undefined>()
  const { item, phase, log, showLog, operation, targetVersion, remoteVersion } = progress
  const isUninstall = operation === 'uninstall'
  const isUpgrade = operation === 'upgrade'
  const confirming = phase === 'confirm'
  const running = phase === 'running'
  const checkingRemoteVersion = isUpgrade && running && log.length === 0
  const success = phase === 'success'
  const failed = phase === 'error'
  const showRestart = success && canRequestServiceRestart() && !restarting

  const modalTitle = restarting
    ? t('restartServiceWorking')
    : confirming
      ? (isUninstall
        ? t('uninstallModalTitleConfirm')
        : isUpgrade
          ? t('upgradeModalTitleConfirm')
          : t('installModalTitleConfirm'))
      : running
        ? (isUninstall
          ? t('uninstallModalTitleRunning')
          : isUpgrade
            ? t('upgradeModalTitleRunning')
            : t('installModalTitleRunning'))
        : success
          ? (isUninstall
            ? t('uninstallModalTitleSuccess')
            : isUpgrade
              ? t('upgradeModalTitleSuccess')
              : t('installModalTitleSuccess'))
          : (isUninstall
            ? t('uninstallModalTitleFailed')
            : isUpgrade
              ? t('upgradeModalTitleFailed')
              : t('installModalTitleFailed'))

  const upgradeConfirmHint = targetVersion !== undefined && targetVersion.length > 0
    ? t('upgradeModalConfirmHintVersion').replace('{version}', targetVersion)
    : t('upgradeModalConfirmHint')

  const modalStatus = restarting
    ? t('restartServiceWorkingHint')
    : checkingRemoteVersion
      ? t('checkingRemoteVersion')
      : confirming
      ? (isUninstall
        ? t('uninstallModalConfirmHint')
        : isUpgrade
          ? upgradeConfirmHint
          : t('installModalConfirmHint'))
      : running
        ? (isUninstall
          ? t('uninstallModalRunning')
          : isUpgrade
            ? (checkingRemoteVersion ? t('checkingRemoteVersion') : t('upgradeModalRunning'))
            : t('installModalRunning'))
        : success
          ? (isUninstall
            ? t('uninstallOk')
            : isUpgrade
              ? (targetVersion !== undefined && targetVersion.length > 0
                ? t('upgradeOkVersion').replace('{version}', targetVersion)
                : t('upgradeOk'))
              : t('installOkVia').replace('{provider}', progress.provider ?? ''))
          : progress.errorMessage ?? (isUninstall
            ? t('uninstallFailed')
            : isUpgrade
              ? t('upgradeFailed')
              : t('installFailed'))

  const runningLogPlaceholder = isUninstall
    ? t('uninstallModalRunning')
    : isUpgrade
      ? t('upgradeModalRunning')
      : t('installModalRunning')

  const onRestart = useCallback(async () => {
    setConfirmRestart(false)
    setRestarting(true)
    setRestartError(undefined)
    try {
      await requestServiceRestart()
      window.setTimeout(() => { window.location.reload() }, 4000)
    } catch (error: unknown) {
      setRestarting(false)
      const raw = error instanceof Error ? error.message : t('restartServiceFailed')
      const message = raw === 'HOST_RESTART_API_MISSING' ? t('restartApiMissing') : raw
      setRestartError(message)
    }
  }, [t])

  useEffect(() => {
    if (!showLog || logRef.current === null) return
    logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log, showLog, phase])

  useEffect(() => {
    if (!confirmRestart) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setConfirmRestart(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [confirmRestart])

  return (
    <>
      <div className={css.installOverlay} role="presentation">
        <div
          className={css.installDialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="skill-market-install-title"
        >
          <h3 className={css.installDialogTitle} id="skill-market-install-title">
            {modalTitle}
          </h3>
          <PluginSummary
            item={item}
            t={t}
            {...(targetVersion !== undefined && targetVersion.length > 0
              ? { targetVersion }
              : {})}
            {...(remoteVersion !== undefined && remoteVersion.length > 0
              ? { remoteVersion }
              : confirming && isUpgrade
                ? { remoteVersionUnknown: true }
                : {})}
          />
          <p className={css.installDialogStatus}>
            {modalStatus}
          </p>
          {log.length > 0 || (running && !checkingRemoteVersion) ? (
            <>
              {!running && log.length > 0 ? (
                <button
                  type="button"
                  className={css.installLogToggle}
                  onClick={onToggleLog}
                >
                  {showLog ? t('installModalHideLog') : t('installModalShowLog')}
                </button>
              ) : null}
              {showLog || running ? (
                <pre ref={logRef} className={css.installLog}>
                  {log.length > 0 ? log : runningLogPlaceholder}
                </pre>
              ) : null}
            </>
          ) : null}
          {restartError !== undefined ? (
            <p className={css.alertError} role="alert">{restartError}</p>
          ) : null}
          <div className={css.installDialogActions}>
            {confirming ? (
              <>
                <button
                  type="button"
                  className={isUninstall ? css.buttonDanger : css.button}
                  onClick={isUninstall
                    ? onStartUninstall
                    : isUpgrade
                      ? onStartUpgrade
                      : onStartInstall}
                >
                  {isUninstall
                    ? t('uninstallModalStart')
                    : isUpgrade
                      ? t('upgradeModalStart')
                      : t('installModalStart')}
                </button>
                <button
                  type="button"
                  className={css.buttonSecondary}
                  onClick={onClose}
                >
                  {t('installModalCancel')}
                </button>
              </>
            ) : null}
            {!confirming && showRestart ? (
              <button
                type="button"
                className={css.button}
                disabled={confirmRestart}
                onClick={() => { setConfirmRestart(true) }}
              >
                {t('restartService')}
              </button>
            ) : null}
            {!confirming ? (
              <button
                type="button"
                className={css.buttonSecondary}
                disabled={running || restarting}
                onClick={onClose}
              >
                {restarting
                  ? t('restartServiceWorkingButton')
                  : running
                    ? (isUninstall
                      ? t('uninstalling')
                      : isUpgrade
                        ? t('upgrading')
                        : t('installModalWorking'))
                    : t('installModalClose')}
              </button>
            ) : null}
          </div>
          {success && showRestart && !confirmRestart && !restarting ? (
            <p className={css.installDialogHint}>{t('restartServiceHint')}</p>
          ) : null}
          {success && !canRequestServiceRestart() ? (
            <p className={css.installDialogHint}>{t('restartHint')}</p>
          ) : null}
          {failed ? (
            <p className={css.installDialogHint}>{t('installModalFailedHint')}</p>
          ) : null}
        </div>
      </div>
      {confirmRestart && !restarting ? (
        <RestartConfirmDialog
          t={t}
          onConfirm={() => { void onRestart() }}
          onCancel={() => { setConfirmRestart(false) }}
        />
      ) : null}
    </>
  )
}

function RestartConfirmDialog({
  t,
  onConfirm,
  onCancel,
}: {
  readonly t: SkillMarketState['t']
  readonly onConfirm: () => void
  readonly onCancel: () => void
}) {
  return (
    <div
      className={css.confirmOverlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        className={css.confirmDialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="skill-market-restart-confirm-title"
        aria-describedby="skill-market-restart-confirm-message"
      >
        <h4 className={css.confirmDialogTitle} id="skill-market-restart-confirm-title">
          {t('restartServiceConfirmTitle')}
        </h4>
        <p className={css.confirmDialogMessage} id="skill-market-restart-confirm-message">
          {t('restartServiceConfirm')}
        </p>
        <div className={css.confirmDialogActions}>
          <button type="button" className={css.button} onClick={onConfirm}>
            {t('restartServiceConfirmAction')}
          </button>
          <button type="button" className={css.buttonSecondary} onClick={onCancel}>
            {t('restartServiceCancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

function PluginSummary({
  item,
  t,
  targetVersion,
  remoteVersion,
  remoteVersionUnknown,
}: {
  readonly item: PluginListingItem
  readonly t: SkillMarketState['t']
  readonly targetVersion?: string
  readonly remoteVersion?: string
  readonly remoteVersionUnknown?: boolean
}) {
  return (
    <dl className={css.installSummary}>
      <div>
        <dt>{t('installModalPlugin')}</dt>
        <dd>{item.name}</dd>
      </div>
      <div>
        <dt>{t('installModalPackage')}</dt>
        <dd>{item.package_name}</dd>
      </div>
      {targetVersion !== undefined && targetVersion.length > 0 ? (
        <div>
          <dt>{t('upgradeModalTargetVersion')}</dt>
          <dd>{targetVersion}</dd>
        </div>
      ) : null}
      {remoteVersion !== undefined && remoteVersion.length > 0 ? (
        <div>
          <dt>{t('upgradeModalRemoteVersion')}</dt>
          <dd>{remoteVersion}</dd>
        </div>
      ) : remoteVersionUnknown === true ? (
        <div>
          <dt>{t('upgradeModalRemoteVersion')}</dt>
          <dd>{t('remoteVersionUnknown')}</dd>
        </div>
      ) : null}
    </dl>
  )
}
