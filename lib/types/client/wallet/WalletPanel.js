import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useState } from 'react';
import { WALLET_ERROR, WALLET_POLL_MS, } from "../../shared/wallet-contract.js";
import { formatPointsRemaining, formatWalletAmount, formatWalletUnixDate, } from "./format.js";
import { walletT } from "./locales.js";
import { fetchWalletBalance, fetchWalletStatus } from "./wire.js";
import css from './wallet.module.css';
/** Compact modal: account / subscription tabs + console budget deep link. */
export function WalletPanel({ locale, onClose, onBalanceChange }) {
    const t = walletT(locale);
    const tabListId = useId();
    const [tab, setTab] = useState('account');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState();
    const [error, setError] = useState();
    const [sessionRevoked, setSessionRevoked] = useState(false);
    const [credentialMismatch, setCredentialMismatch] = useState(false);
    const [usagePoliciesUrl, setUsagePoliciesUrl] = useState();
    const load = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        setSessionRevoked(false);
        setCredentialMismatch(false);
        const dict = walletT(locale);
        try {
            const status = await fetchWalletStatus();
            setUsagePoliciesUrl(status.usagePoliciesUrl);
            if (status.connected && status.credentialAligned === false) {
                setData(undefined);
                setCredentialMismatch(true);
                setError(dict('keyMismatchHint'));
                onBalanceChange?.(undefined);
                return;
            }
            const balance = await fetchWalletBalance(locale);
            setData(balance);
            setUsagePoliciesUrl(balance.usagePoliciesUrl);
            onBalanceChange?.(balance);
        }
        catch (cause) {
            setData(undefined);
            onBalanceChange?.(undefined);
            const err = cause;
            if (err.message === 'HOST_API_NOT_FOUND' || err.message === 'not found') {
                setError(dict('hostApiMissing'));
            }
            else if (err.code === WALLET_ERROR.sessionRevoked) {
                setSessionRevoked(true);
                setError(dict('reauthHint'));
            }
            else if (err.code === WALLET_ERROR.credentialMismatch) {
                setCredentialMismatch(true);
                setError(dict('keyMismatchHint'));
            }
            else {
                setError(err.message.length > 0 ? err.message : dict('error'));
            }
        }
        finally {
            setLoading(false);
        }
    }, [locale, onBalanceChange]);
    useEffect(() => {
        void load();
    }, [load]);
    useEffect(() => {
        if (sessionRevoked || credentialMismatch)
            return;
        const timer = window.setInterval(() => {
            void load();
        }, WALLET_POLL_MS);
        return () => { window.clearInterval(timer); };
    }, [credentialMismatch, load, sessionRevoked]);
    const openBudget = useCallback(() => {
        const url = usagePoliciesUrl ?? data?.usagePoliciesUrl;
        if (url === undefined || url.length === 0)
            return;
        window.open(url, '_blank', 'noopener,noreferrer');
    }, [data?.usagePoliciesUrl, usagePoliciesUrl]);
    const budgetUrl = usagePoliciesUrl ?? data?.usagePoliciesUrl;
    const resetAt = data === undefined
        ? undefined
        : formatWalletUnixDate(data.nextPointsResetAtUnix, locale);
    const periodEnd = data === undefined
        ? undefined
        : formatWalletUnixDate(data.periodEndUnix, locale);
    const softHint = sessionRevoked || credentialMismatch;
    return (_jsxs("div", { className: css.panel, role: "dialog", "aria-modal": "true", "aria-labelledby": "supanexus-wallet-title", children: [_jsxs("div", { className: css.header, children: [_jsx("h2", { className: css.title, id: "supanexus-wallet-title", children: t('title') }), _jsx("button", { type: "button", className: css.closeBtn, "aria-label": t('close'), onClick: onClose, children: "\u00D7" })] }), loading && data === undefined && !credentialMismatch ? (_jsx("p", { className: css.status, children: t('loading') })) : null, data !== undefined ? (_jsxs(_Fragment, { children: [_jsx("div", { className: css.tabBar, children: _jsxs("div", { className: css.segmentGroup, role: "tablist", "aria-label": t('title'), id: tabListId, children: [_jsx("button", { type: "button", role: "tab", "aria-selected": tab === 'account', className: tab === 'account' ? css.segmentButtonActive : css.segmentButton, onClick: () => { setTab('account'); }, children: t('tabAccount') }), _jsx("button", { type: "button", role: "tab", "aria-selected": tab === 'subscription', className: tab === 'subscription' ? css.segmentButtonActive : css.segmentButton, onClick: () => { setTab('subscription'); }, children: t('tabSubscription') })] }) }), tab === 'account' ? (_jsxs("div", { className: css.balanceBlock, role: "tabpanel", children: [_jsx("p", { className: css.balanceLabel, children: t('balanceLabel') }), _jsx("p", { className: css.balanceValue, children: formatWalletAmount(data.availableBalance, data.currency) }), data.name.length > 0 ? (_jsxs("p", { className: css.orgRow, children: [t('orgLabel'), ': ', data.name] })) : null] })) : (_jsxs("div", { className: css.balanceBlock, role: "tabpanel", children: [_jsx("p", { className: css.balanceLabel, children: t('pointsLabel') }), _jsx("p", { className: css.balanceValue, children: formatPointsRemaining(data.pointsRemaining, locale) }), data.pointsGranted.length > 0 && data.pointsGranted !== '0' ? (_jsxs("p", { className: css.orgRow, children: [t('pointsGrantedLabel'), ': ', formatPointsRemaining(data.pointsGranted, locale)] })) : null, _jsx("p", { className: css.balanceLabel, children: t('planLabel') }), _jsx("p", { className: data.planName.length > 0 ? css.balanceSecondary : css.orgRow, children: data.planName.length > 0 ? data.planName : t('noPlan') }), data.subscriptionStatus.length > 0 ? (_jsxs("p", { className: css.orgRow, children: [t('subscriptionStatusLabel'), ': ', data.subscriptionStatus] })) : null, resetAt !== undefined ? (_jsxs("p", { className: css.orgRow, children: [t('resetAtLabel'), ': ', resetAt] })) : null, periodEnd !== undefined ? (_jsxs("p", { className: css.orgRow, children: [t('periodEndLabel'), ': ', periodEnd] })) : null] }))] })) : null, _jsx("p", { className: css.notice, children: t('visibilityHint') }), error !== undefined ? (_jsx("p", { className: softHint ? css.hint : css.error, children: error })) : (_jsx("p", { className: css.hint, children: t('budgetHint') })), _jsxs("div", { className: css.actions, children: [_jsx("button", { type: "button", className: css.button, disabled: budgetUrl === undefined || budgetUrl.length === 0 || credentialMismatch, onClick: openBudget, children: t('configureBudget') }), _jsx("button", { type: "button", className: css.buttonSecondary, disabled: loading, onClick: () => { void load(); }, children: t('refresh') })] })] }));
}
//# sourceMappingURL=WalletPanel.js.map