import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { PINNED_LINE_FIELD, SHOW_BRAND_FIELD, SHOW_WALLET_FIELD, } from "../../shared/settings-contract.js";
import { useClientLocale } from "../use-client-locale.js";
import { settingsCardT } from "./locales.js";
import { fetchLineStatus } from "./line-wire.js";
import { readActiveLineId, useSettingsWritable, useShowBrandPref, useShowWalletPref, } from "./useShowWalletPref.js";
import css from './settings-card.module.css';
const FALLBACK_LINES = [
    { id: 'global', label: 'Global' },
    { id: 'cn', label: '中国大陆' },
];
/** Plugins page contribution: summary one-liner or full settings form. */
export function SupaNexusSettingsCard(props) {
    const { ctx, scope, view, t: slotT } = props;
    const locale = useClientLocale(ctx);
    const t = settingsCardT(locale);
    const showWallet = useShowWalletPref(scope);
    const showBrand = useShowBrandPref(scope);
    const { available, writable } = useSettingsWritable(scope);
    const [saving, setSaving] = useState(false);
    const [regionLoading, setRegionLoading] = useState(false);
    const [regionLocked, setRegionLocked] = useState(false);
    const [regionLines, setRegionLines] = useState(FALLBACK_LINES);
    const [activeLineId, setActiveLineId] = useState(() => readActiveLineId(scope));
    useEffect(() => scope.subscribe(() => {
        setActiveLineId(readActiveLineId(scope));
    }), [scope]);
    useEffect(() => {
        if (view !== 'page' || !available)
            return;
        let cancelled = false;
        setRegionLoading(true);
        void fetchLineStatus()
            .then((status) => {
            if (cancelled)
                return;
            setRegionLines(status.lines.length > 0 ? status.lines : FALLBACK_LINES);
            setActiveLineId(status.activeLineId);
            setRegionLocked(status.locked);
        })
            .catch(() => {
            /* keep snapshot / fallback */
        })
            .finally(() => {
            if (!cancelled)
                setRegionLoading(false);
        });
        return () => { cancelled = true; };
    }, [available, view]);
    const onToggle = useCallback(async (field, checked) => {
        if (!writable || saving)
            return;
        setSaving(true);
        try {
            await scope.set(field, checked);
        }
        finally {
            setSaving(false);
        }
    }, [scope, saving, writable]);
    const onSelectRegion = useCallback(async (lineId) => {
        if (!writable || saving || regionLocked || lineId === activeLineId)
            return;
        setSaving(true);
        try {
            await scope.set(PINNED_LINE_FIELD, lineId);
            setActiveLineId(lineId);
        }
        finally {
            setSaving(false);
        }
    }, [activeLineId, regionLocked, saving, scope, writable]);
    if (view === 'summary')
        return slotT('description');
    if (!available)
        return null;
    const regionDisabled = !writable || saving || regionLocked || regionLoading;
    return (_jsxs("div", { className: css.body, children: [!writable ? _jsx("p", { className: css.readOnly, role: "status", children: t('readOnly') }) : null, _jsxs("div", { className: css.field, children: [_jsx("span", { className: css.row, style: { cursor: 'default' }, children: t('region') }), _jsx("div", { className: css.segment, role: "radiogroup", "aria-label": t('region'), "aria-busy": regionLoading, children: regionLines.map((line) => {
                            const selected = line.id === activeLineId;
                            const label = line.id === 'cn'
                                ? t('regionCn')
                                : line.id === 'global'
                                    ? t('regionGlobal')
                                    : line.label;
                            return (_jsx("button", { type: "button", role: "radio", "aria-checked": selected, className: selected ? `${css.segmentBtn} ${css.segmentBtnActive}` : css.segmentBtn, disabled: regionDisabled, onClick: () => { void onSelectRegion(line.id); }, children: label }, line.id));
                        }) }), _jsx("p", { className: css.hint, children: regionLocked
                            ? t('regionLocked')
                            : regionLoading
                                ? t('regionLoading')
                                : t('regionHint') })] }), _jsxs("div", { className: css.field, children: [_jsxs("label", { className: writable ? css.row : `${css.row} ${css.rowDisabled}`, children: [_jsx("input", { className: css.checkbox, type: "checkbox", checked: showWallet, disabled: !writable || saving, onChange: (event) => { void onToggle(SHOW_WALLET_FIELD, event.target.checked); } }), _jsx("span", { children: t('showWallet') })] }), _jsx("p", { className: css.hint, children: t('showWalletHint') })] }), _jsxs("div", { className: css.field, children: [_jsxs("label", { className: writable ? css.row : `${css.row} ${css.rowDisabled}`, children: [_jsx("input", { className: css.checkbox, type: "checkbox", checked: showBrand, disabled: !writable || saving, onChange: (event) => { void onToggle(SHOW_BRAND_FIELD, event.target.checked); } }), _jsx("span", { children: t('showBrand') })] }), _jsx("p", { className: css.hint, children: t('showBrandHint') })] })] }));
}
//# sourceMappingURL=SupaNexusSettingsCard.js.map