import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { canRequestServiceRestart, requestServiceRestart } from "./desktop-bridge.js";
import css from './skill-market.module.css';
export function InstallProgressModal({ progress, t, onClose, onStartInstall, onStartUpgrade, onStartUninstall, onToggleLog, }) {
    const logRef = useRef(null);
    const [confirmRestart, setConfirmRestart] = useState(false);
    const [restarting, setRestarting] = useState(false);
    const [restartError, setRestartError] = useState();
    const { item, phase, log, showLog, operation, targetVersion, remoteVersion } = progress;
    const isUninstall = operation === 'uninstall';
    const isUpgrade = operation === 'upgrade';
    const confirming = phase === 'confirm';
    const running = phase === 'running';
    const checkingRemoteVersion = isUpgrade && running && log.length === 0;
    const success = phase === 'success';
    const failed = phase === 'error';
    const showRestart = success && canRequestServiceRestart() && !restarting;
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
                            : t('installModalTitleFailed'));
    const upgradeConfirmHint = targetVersion !== undefined && targetVersion.length > 0
        ? t('upgradeModalConfirmHintVersion').replace('{version}', targetVersion)
        : t('upgradeModalConfirmHint');
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
                                : t('installFailed'));
    const runningLogPlaceholder = isUninstall
        ? t('uninstallModalRunning')
        : isUpgrade
            ? t('upgradeModalRunning')
            : t('installModalRunning');
    const onRestart = useCallback(async () => {
        setConfirmRestart(false);
        setRestarting(true);
        setRestartError(undefined);
        try {
            await requestServiceRestart();
            window.setTimeout(() => { window.location.reload(); }, 4000);
        }
        catch (error) {
            setRestarting(false);
            const raw = error instanceof Error ? error.message : t('restartServiceFailed');
            const message = raw === 'HOST_RESTART_API_MISSING' ? t('restartApiMissing') : raw;
            setRestartError(message);
        }
    }, [t]);
    useEffect(() => {
        if (!showLog || logRef.current === null)
            return;
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [log, showLog, phase]);
    useEffect(() => {
        if (!confirmRestart)
            return;
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                setConfirmRestart(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => { document.removeEventListener('keydown', onKeyDown); };
    }, [confirmRestart]);
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: css.installOverlay, role: "presentation", children: _jsxs("div", { className: css.installDialog, role: "dialog", "aria-modal": "true", "aria-labelledby": "skill-market-install-title", children: [_jsx("h3", { className: css.installDialogTitle, id: "skill-market-install-title", children: modalTitle }), _jsx(PluginSummary, { item: item, t: t, ...(targetVersion !== undefined && targetVersion.length > 0
                                ? { targetVersion }
                                : {}), ...(remoteVersion !== undefined && remoteVersion.length > 0
                                ? { remoteVersion }
                                : confirming && isUpgrade
                                    ? { remoteVersionUnknown: true }
                                    : {}) }), _jsx("p", { className: css.installDialogStatus, children: modalStatus }), log.length > 0 || (running && !checkingRemoteVersion) ? (_jsxs(_Fragment, { children: [!running && log.length > 0 ? (_jsx("button", { type: "button", className: css.installLogToggle, onClick: onToggleLog, children: showLog ? t('installModalHideLog') : t('installModalShowLog') })) : null, showLog || running ? (_jsx("pre", { ref: logRef, className: css.installLog, children: log.length > 0 ? log : runningLogPlaceholder })) : null] })) : null, restartError !== undefined ? (_jsx("p", { className: css.alertError, role: "alert", children: restartError })) : null, _jsxs("div", { className: css.installDialogActions, children: [confirming ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: isUninstall ? css.buttonDanger : css.button, onClick: isUninstall
                                                ? onStartUninstall
                                                : isUpgrade
                                                    ? onStartUpgrade
                                                    : onStartInstall, children: isUninstall
                                                ? t('uninstallModalStart')
                                                : isUpgrade
                                                    ? t('upgradeModalStart')
                                                    : t('installModalStart') }), _jsx("button", { type: "button", className: css.buttonSecondary, onClick: onClose, children: t('installModalCancel') })] })) : null, !confirming && showRestart ? (_jsx("button", { type: "button", className: css.button, disabled: confirmRestart, onClick: () => { setConfirmRestart(true); }, children: t('restartService') })) : null, !confirming ? (_jsx("button", { type: "button", className: css.buttonSecondary, disabled: running || restarting, onClick: onClose, children: restarting
                                        ? t('restartServiceWorkingButton')
                                        : running
                                            ? (isUninstall
                                                ? t('uninstalling')
                                                : isUpgrade
                                                    ? t('upgrading')
                                                    : t('installModalWorking'))
                                            : t('installModalClose') })) : null] }), success && showRestart && !confirmRestart && !restarting ? (_jsx("p", { className: css.installDialogHint, children: t('restartServiceHint') })) : null, success && !canRequestServiceRestart() ? (_jsx("p", { className: css.installDialogHint, children: t('restartHint') })) : null, failed ? (_jsx("p", { className: css.installDialogHint, children: t('installModalFailedHint') })) : null] }) }), confirmRestart && !restarting ? (_jsx(RestartConfirmDialog, { t: t, onConfirm: () => { void onRestart(); }, onCancel: () => { setConfirmRestart(false); } })) : null] }));
}
function RestartConfirmDialog({ t, onConfirm, onCancel, }) {
    return (_jsx("div", { className: css.confirmOverlay, role: "presentation", onClick: (event) => {
            if (event.target === event.currentTarget)
                onCancel();
        }, children: _jsxs("div", { className: css.confirmDialog, role: "alertdialog", "aria-modal": "true", "aria-labelledby": "skill-market-restart-confirm-title", "aria-describedby": "skill-market-restart-confirm-message", children: [_jsx("h4", { className: css.confirmDialogTitle, id: "skill-market-restart-confirm-title", children: t('restartServiceConfirmTitle') }), _jsx("p", { className: css.confirmDialogMessage, id: "skill-market-restart-confirm-message", children: t('restartServiceConfirm') }), _jsxs("div", { className: css.confirmDialogActions, children: [_jsx("button", { type: "button", className: css.button, onClick: onConfirm, children: t('restartServiceConfirmAction') }), _jsx("button", { type: "button", className: css.buttonSecondary, onClick: onCancel, children: t('restartServiceCancel') })] })] }) }));
}
function PluginSummary({ item, t, targetVersion, remoteVersion, remoteVersionUnknown, }) {
    return (_jsxs("dl", { className: css.installSummary, children: [_jsxs("div", { children: [_jsx("dt", { children: t('installModalPlugin') }), _jsx("dd", { children: item.name })] }), _jsxs("div", { children: [_jsx("dt", { children: t('installModalPackage') }), _jsx("dd", { children: item.package_name })] }), targetVersion !== undefined && targetVersion.length > 0 ? (_jsxs("div", { children: [_jsx("dt", { children: t('upgradeModalTargetVersion') }), _jsx("dd", { children: targetVersion })] })) : null, remoteVersion !== undefined && remoteVersion.length > 0 ? (_jsxs("div", { children: [_jsx("dt", { children: t('upgradeModalRemoteVersion') }), _jsx("dd", { children: remoteVersion })] })) : remoteVersionUnknown === true ? (_jsxs("div", { children: [_jsx("dt", { children: t('upgradeModalRemoteVersion') }), _jsx("dd", { children: t('remoteVersionUnknown') })] })) : null] }));
}
//# sourceMappingURL=InstallProgressModal.js.map