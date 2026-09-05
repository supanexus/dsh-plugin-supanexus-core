import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { buildOfficialSiteUrl } from "../../shared/official-site.js";
import { useActiveLineId } from "../settings/useShowWalletPref.js";
import { useClientLocale } from "../use-client-locale.js";
import { SkillMarketPanel } from "./SkillMarketPanel.js";
import { skillMarketT } from "./locales.js";
import { useSkillMarket } from "./useSkillMarket.js";
import css from './skill-market.module.css';
function SkillMarketIcon({ size }) {
    // 2×2 app grid — reads as “applications / plugins”, not a generic list.
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: [_jsx("rect", { x: "2", y: "2", width: "5", height: "5", rx: "1.2", stroke: "currentColor", strokeWidth: "1.2" }), _jsx("rect", { x: "9", y: "2", width: "5", height: "5", rx: "1.2", stroke: "currentColor", strokeWidth: "1.2" }), _jsx("rect", { x: "2", y: "9", width: "5", height: "5", rx: "1.2", stroke: "currentColor", strokeWidth: "1.2" }), _jsx("rect", { x: "9", y: "9", width: "5", height: "5", rx: "1.2", stroke: "currentColor", strokeWidth: "1.2" })] }));
}
/** Sidebar footer trigger + skill market modal. */
export function SkillMarketRoot({ wide, ctx, settings }) {
    const locale = useClientLocale(ctx);
    const t = skillMarketT(locale);
    const lineId = useActiveLineId(settings);
    const officialSiteUrl = useMemo(() => buildOfficialSiteUrl({ lineId, locale: locale ?? null }), [lineId, locale]);
    const [open, setOpen] = useState(false);
    const titleId = useId();
    const state = useSkillMarket({ ctx, locale, open });
    const close = useCallback(() => { setOpen(false); }, []);
    useEffect(() => {
        if (!open)
            return;
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                close();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => { document.removeEventListener('keydown', onKeyDown); };
    }, [close, open]);
    return (_jsxs("div", { className: css.layer, children: [_jsxs("button", { type: "button", className: wide ? css.trigger : `${css.trigger} ${css.rail}`, "aria-haspopup": "dialog", "aria-expanded": open, "aria-labelledby": titleId, onClick: () => { setOpen(value => !value); }, children: [_jsx(SkillMarketIcon, { size: wide ? 16 : 18 }), wide && _jsx("span", { className: css.triggerLabel, id: titleId, children: t('nav') })] }), open && (_jsxs("div", { className: css.overlay, role: "presentation", children: [_jsx("div", { className: css.mask, "aria-hidden": "true", onClick: close }), _jsx(SkillMarketPanel, { state: state, onClose: close, officialSiteUrl: officialSiteUrl })] }))] }));
}
//# sourceMappingURL=SkillMarketRoot.js.map