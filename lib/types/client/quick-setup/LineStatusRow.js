import { jsxs as _jsxs } from "react/jsx-runtime";
import { quickSetupT } from "./locales.js";
import css from './quick-setup.module.css';
/** Show current resolved line and latency. */
export function LineStatusRow(props) {
    const t = quickSetupT(props.locale);
    if (props.line === undefined)
        return null;
    const latency = props.latencyMs !== undefined ? `${String(props.latencyMs)}ms` : '—';
    return (_jsxs("div", { className: css.lineRow, children: [_jsxs("span", { children: [t('line'), ": ", props.line.label] }), _jsxs("span", { children: [t('latency'), ": ", latency] })] }));
}
//# sourceMappingURL=LineStatusRow.js.map