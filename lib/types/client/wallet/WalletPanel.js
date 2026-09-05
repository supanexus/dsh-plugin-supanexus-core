import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { WALLET_ERROR, WALLET_POLL_MS } from "../../shared/wallet-contract.js";
import { formatWalletAmount } from "./format.js";
import { walletT } from "./locales.js";
import { fetchWalletBalance, fetchWalletStatus } from "./wire.js";
import css from './wallet.module.css';
/** Compact modal: balance + console budget deep link. */
export function WalletPanel({ locale, onClose, onBalanceChange }) {
    const t = walletT(locale);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState();
    const [error, setError] = useState();
    const [sessionRevoked, setSessionRevoked] = useState(false);
    const [usagePoliciesUrl, setUsagePoliciesUrl] = useState();
    const load = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        setSessionRevoked(false);
        const dict = walletT(locale);
        try {
            const status = await fetchWalletStatus();
            setUsagePoliciesUrl(status.usagePoliciesUrl);
            const balance = await fetchWalletBalance(locale);
            setData(balance);
            setUsagePoliciesUrl(balance.usagePoliciesUrl);
            onBalanceChange?.(formatWalletAmount(balance.availableBalance, balance.currency));
        }
        catch (cause) {
            setData(undefined);
            const err = cause;
            if (err.message === 'HOST_API_NOT_FOUND' || err.message === 'not found') {
                setError(dict('hostApiMissing'));
            }
            else if (err.code === WALLET_ERROR.sessionRevoked) {
                setSessionRevoked(true);
                setError(dict('reauthHint'));
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
        if (sessionRevoked)
            return;
        const timer = window.setInterval(() => {
            void load();
        }, WALLET_POLL_MS);
        return () => { window.clearInterval(timer); };
    }, [load, sessionRevoked]);
    const openBudget = useCallback(() => {
        const url = usagePoliciesUrl ?? data?.usagePoliciesUrl;
        if (url === undefined || url.length === 0)
            return;
        window.open(url, '_blank', 'noopener,noreferrer');
    }, [data?.usagePoliciesUrl, usagePoliciesUrl]);
    const budgetUrl = usagePoliciesUrl ?? data?.usagePoliciesUrl;
    return (_jsxs("div", { className: css.panel, role: "dialog", "aria-modal": "true", "aria-labelledby": "supanexus-wallet-title", children: [_jsxs("div", { className: css.header, children: [_jsx("h2", { className: css.title, id: "supanexus-wallet-title", children: t('title') }), _jsx("button", { type: "button", className: css.closeBtn, "aria-label": t('close'), onClick: onClose, children: "\u00D7" })] }), loading && data === undefined ? (_jsx("p", { className: css.status, children: t('loading') })) : null, data !== undefined ? (_jsxs("div", { className: css.balanceBlock, children: [_jsx("p", { className: css.balanceLabel, children: t('balanceLabel') }), _jsx("p", { className: css.balanceValue, children: formatWalletAmount(data.availableBalance, data.currency) }), data.name.trim().length > 0 ? (_jsxs("p", { className: css.orgRow, children: [t('orgLabel'), ': ', data.name] })) : null] })) : null, _jsx("p", { className: css.notice, children: t('visibilityHint') }), error !== undefined ? (_jsx("p", { className: sessionRevoked ? css.hint : css.error, children: error })) : (_jsx("p", { className: css.hint, children: t('budgetHint') })), _jsxs("div", { className: css.actions, children: [_jsx("button", { type: "button", className: css.button, disabled: budgetUrl === undefined || budgetUrl.length === 0, onClick: openBudget, children: t('configureBudget') }), _jsx("button", { type: "button", className: css.buttonSecondary, disabled: loading, onClick: () => { void load(); }, children: t('refresh') })] })] }));
}
//# sourceMappingURL=WalletPanel.js.map