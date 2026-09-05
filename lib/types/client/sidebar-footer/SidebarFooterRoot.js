import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SkillMarketRoot } from "../skill-market/SkillMarketRoot.js";
import { WalletRoot } from "../wallet/WalletRoot.js";
import css from './sidebar-footer.module.css';
/**
 * One footer occupant stacking wallet + skill market vertically.
 * Official `.footerActions` is a row flex; two separate registrants sit side-by-side and squeeze each other.
 */
export function SidebarFooterRoot(props) {
    const { settings, ...rest } = props;
    return (_jsxs("div", { className: css.stack, children: [_jsx(WalletRoot, { ...rest, settings: settings }), _jsx(SkillMarketRoot, { ...rest, settings: settings })] }));
}
//# sourceMappingURL=SidebarFooterRoot.js.map