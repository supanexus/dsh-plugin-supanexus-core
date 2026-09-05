import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import css from './skill-market.module.css';
export function PluginListingIcon({ url, name, }) {
    const [failed, setFailed] = useState(false);
    const iconUrl = url?.trim();
    if (iconUrl === undefined || iconUrl.length === 0 || failed) {
        return (_jsx("span", { className: css.cardIconFallback, "aria-hidden": true, children: _jsxs("svg", { viewBox: "0 0 24 24", width: "16", height: "16", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 2 2 7l10 5 10-5-10-5Z" }), _jsx("path", { d: "m2 17 10 5 10-5" }), _jsx("path", { d: "m2 12 10 5 10-5" })] }) }));
    }
    return (_jsx("img", { src: iconUrl, alt: name, className: css.cardIcon, onError: () => { setFailed(true); } }));
}
//# sourceMappingURL=PluginListingIcon.js.map