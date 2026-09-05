import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuickSetup } from "./useQuickSetup.js";
import { quickSetupT } from "./locales.js";
import css from './quick-setup.module.css';
/** Models footer card: one-click SupaNexus OAuth setup. */
export function QuickSetupCard(props) {
    const t = quickSetupT(props.locale);
    const state = useQuickSetup({ ctx: props.ctx, locale: props.locale });
    const busy = state.phase === 'starting' || state.phase === 'writing';
    return (_jsxs("section", { className: css.quickSetupCard, "aria-label": t('title'), children: [_jsx("h3", { className: css.title, children: t('title') }), _jsx("p", { className: css.description, children: t('description') }), state.phase === 'awaiting-approval' && (_jsx("p", { className: css.status, children: t('awaiting') })), state.phase === 'writing' && (_jsx("p", { className: css.status, children: t('writing') })), state.phase === 'done' && state.message !== undefined && (_jsx("p", { className: css.success, children: state.message })), state.phase === 'error' && state.message !== undefined && (_jsx("p", { className: css.error, children: state.message })), _jsxs("div", { className: css.actions, children: [_jsx("button", { type: "button", className: css.button, disabled: busy, onClick: () => { void state.start(); }, children: t('quickSetup') }), state.phase === 'awaiting-approval' && (_jsx("button", { type: "button", className: css.buttonSecondary, onClick: state.reopenAuth, children: t('reopenAuth') }))] })] }));
}
//# sourceMappingURL=QuickSetupCard.js.map