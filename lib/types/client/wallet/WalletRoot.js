import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useState } from 'react';
import { WALLET_POLL_MS } from "../../shared/wallet-contract.js";
import { useShowWalletPref } from "../settings/useShowWalletPref.js";
import { useClientLocale } from "../use-client-locale.js";
import { formatWalletAmount } from "./format.js";
import { useActiveModelProvider } from "./useActiveModelProvider.js";
import { shouldShowWallet } from "./visibility.js";
import { WalletPanel } from "./WalletPanel.js";
import { walletT } from "./locales.js";
import { fetchWalletBalance, fetchWalletStatus } from "./wire.js";
import css from './wallet.module.css';
function WalletIcon({ size }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: [_jsx("rect", { x: "1.5", y: "3.5", width: "13", height: "9", rx: "2", stroke: "currentColor", strokeWidth: "1.2" }), _jsx("path", { d: "M1.5 6.5h13", stroke: "currentColor", strokeWidth: "1.2" }), _jsx("circle", { cx: "11.5", cy: "9.5", r: "1", fill: "currentColor" })] }));
}
/**
 * Sidebar balance row (amount as label) + detail modal.
 * Visible when the plugin setting allows it, SupaNexus is connected, and the
 * active session's model provider is `supanexus`.
 */
export function WalletRoot({ wide, ctx, settings }) {
    const locale = useClientLocale(ctx);
    const t = walletT(locale);
    const provider = useActiveModelProvider(ctx);
    const showWalletPref = useShowWalletPref(settings);
    const [connected, setConnected] = useState(false);
    const [amountLabel, setAmountLabel] = useState();
    const [open, setOpen] = useState(false);
    const titleId = useId();
    const close = useCallback(() => { setOpen(false); }, []);
    const visible = shouldShowWallet(connected, provider, showWalletPref);
    const refresh = useCallback(async () => {
        try {
            const status = await fetchWalletStatus();
            if (!status.connected) {
                setConnected(false);
                setAmountLabel(undefined);
                return;
            }
            setConnected(true);
            try {
                const balance = await fetchWalletBalance(locale);
                setAmountLabel(formatWalletAmount(balance.availableBalance, balance.currency));
            }
            catch {
                setAmountLabel(undefined);
            }
        }
        catch {
            setConnected(false);
            setAmountLabel(undefined);
        }
    }, [locale]);
    useEffect(() => {
        void refresh();
        const timer = window.setInterval(() => { void refresh(); }, WALLET_POLL_MS);
        return () => { window.clearInterval(timer); };
    }, [refresh]);
    useEffect(() => {
        if (!visible && open)
            setOpen(false);
    }, [open, visible]);
    useEffect(() => {
        if (!open)
            return;
        void refresh();
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                close();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => { document.removeEventListener('keydown', onKeyDown); };
    }, [close, open, refresh]);
    if (!visible)
        return null;
    const display = amountLabel ?? t('nav');
    const title = amountLabel === undefined
        ? `${t('nav')} — ${t('visibilityHint')}`
        : `${t('nav')} ${amountLabel} — ${t('visibilityHint')}`;
    return (_jsxs("div", { className: css.layer, children: [_jsxs("button", { type: "button", className: wide ? css.trigger : `${css.trigger} ${css.rail}`, "aria-haspopup": "dialog", "aria-expanded": open, "aria-label": title, title: title, onClick: () => { setOpen(value => !value); }, children: [_jsx(WalletIcon, { size: wide ? 16 : 18 }), wide && _jsx("span", { className: `${css.triggerLabel} ${css.amountLabel}`, id: titleId, children: display })] }), open && (_jsxs("div", { className: css.overlay, role: "presentation", children: [_jsx("div", { className: css.mask, "aria-hidden": "true", onClick: close }), _jsx(WalletPanel, { locale: locale, onClose: close, onBalanceChange: setAmountLabel })] }))] }));
}
//# sourceMappingURL=WalletRoot.js.map