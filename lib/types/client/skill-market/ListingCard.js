import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { PluginListingIcon } from "./PluginListingIcon.js";
import css from './skill-market.module.css';
function PluginToggleSwitch({ item, state, }) {
    const { t, togglingPackage, isOperating, hasOperationModal, canToggle, getToggleStatus, onToggle, } = state;
    const toggleStatus = getToggleStatus(item);
    if (!canToggle(item) || (toggleStatus?.row_ids?.length ?? 0) === 0)
        return null;
    const enabled = toggleStatus?.enabled !== false;
    const busy = togglingPackage === item.package_name || isOperating || hasOperationModal;
    return (_jsxs("label", { className: `${css.toggleRow}${enabled ? ` ${css.toggleRowEnabled}` : ''}`, title: enabled ? t('pluginEnabled') : t('pluginDisabled'), children: [_jsx("span", { className: css.toggleLabel, children: enabled ? t('pluginEnabled') : t('pluginDisabled') }), _jsxs("span", { className: css.toggleSwitch, children: [_jsx("input", { type: "checkbox", checked: enabled, disabled: busy, "aria-label": enabled ? t('toggleDisable') : t('toggleEnable'), onChange: (event) => { onToggle(item, event.target.checked); } }), _jsx("span", { className: css.toggleTrack, "aria-hidden": "true" }), _jsx("span", { className: css.toggleThumb, "aria-hidden": "true" })] })] }));
}
function CardActions({ item, state, docs, homepage, className, }) {
    const { t, installingCode, uninstallingCode, isOperating, hasOperationModal, isInstalled, canUninstall, getUpgradeStatus, onInstall, onUpgrade, onUninstall, } = state;
    const installed = isInstalled(item);
    const upgradeStatus = getUpgradeStatus(item);
    const upgradeable = installed && upgradeStatus?.upgradeable === true;
    const installBusy = installingCode === item.install_code;
    const uninstallBusy = uninstallingCode === item.install_code;
    const operationBusy = isOperating || hasOperationModal;
    const showUninstall = installed && canUninstall(item);
    return (_jsxs("div", { className: className ?? css.cardFooter, children: [installed ? _jsx(PluginToggleSwitch, { item: item, state: state }) : null, upgradeable ? (_jsx("button", { type: "button", className: css.buttonSm, disabled: operationBusy, onClick: () => { void onUpgrade(item); }, children: installBusy
                    ? t('upgrading')
                    : upgradeStatus?.listing_version !== null && upgradeStatus?.listing_version !== undefined
                        ? t('upgradeTo').replace('{version}', upgradeStatus.listing_version)
                        : item.version !== undefined && item.version !== null && item.version.length > 0
                            ? t('upgradeTo').replace('{version}', item.version)
                            : t('upgrade') })) : null, showUninstall ? (_jsx("button", { type: "button", className: css.buttonSmDanger, disabled: operationBusy, onClick: () => { void onUninstall(item); }, children: uninstallBusy ? t('uninstalling') : t('uninstall') })) : !upgradeable ? (_jsx("button", { type: "button", className: css.buttonSm, disabled: installed || operationBusy, onClick: () => { void onInstall(item); }, children: installBusy
                    ? t('installing')
                    : installed
                        ? t('installed')
                        : operationBusy
                            ? t('installWait')
                            : t('install') })) : null, docs !== undefined && docs.length > 0 && (_jsx("a", { className: css.linkButtonGhost, href: docs, target: "_blank", rel: "noreferrer", children: t('openDocs') })), homepage !== undefined && homepage.length > 0 && homepage !== docs && (_jsx("a", { className: css.linkButtonGhost, href: homepage, target: "_blank", rel: "noreferrer", children: t('openHomepage') }))] }));
}
function CardDescription({ text, className }) {
    const value = text.trim();
    return (_jsx("p", { className: className ?? '', title: value, children: value }));
}
function CardTitleRow({ item, version, }) {
    const label = version?.trim();
    return (_jsxs("div", { className: css.cardTitleRow, children: [_jsx("h3", { className: css.cardTitle, children: item.name }), label !== undefined && label.length > 0 ? (_jsxs("span", { className: `${css.badge} ${css.badgeVersion}`, children: ["v", label] })) : null] }));
}
function resolveCardVersion(item, installed, installedVersion) {
    if (installed)
        return installedVersion?.trim() || null;
    return item.version?.trim() || null;
}
function CardMeta({ item, t, upgradeable, disabled }) {
    return (_jsxs("div", { className: css.cardMeta, children: [disabled ? (_jsx("span", { className: `${css.badge} ${css.badgeDisabled}`, children: t('pluginDisabled') })) : null, upgradeable ? (_jsx("span", { className: `${css.badge} ${css.badgeUpgrade}`, children: t('upgradeAvailable') })) : null, _jsx("span", { className: `${css.badge} ${item.source === 'supanexus' ? css.badgeSourceSupanexus : css.badgeSourceCommunity}`, children: item.source === 'supanexus' ? t('sourceSupanexus') : t('sourceCommunity') }), _jsx("span", { className: `${css.badge} ${item.layer === 'core' ? css.badgeLayerCore : css.badgeLayerFeature}`, children: item.layer === 'core' ? t('layerCore') : t('layerFeature') })] }));
}
function CardBody({ item, t, upgradeable, disabled, version }) {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.cardHead, children: [_jsx(PluginListingIcon, { url: item.icon_url, name: item.name }), _jsxs("div", { className: css.cardHeadText, children: [_jsx(CardTitleRow, { item: item, version: version }), _jsx("p", { className: css.cardCode, title: item.package_name, children: item.package_name })] })] }), _jsx(CardMeta, { item: item, t: t, upgradeable: upgradeable, disabled: disabled }), _jsx(CardDescription, { text: item.description ?? '', className: css.cardDesc })] }));
}
export function ListingCard({ item, state, layout }) {
    const { t, isInstalled, getUpgradeStatus, getToggleStatus } = state;
    const docs = item.docs_url?.trim();
    const homepage = item.homepage_url?.trim();
    const isList = layout === 'cols1';
    const actionProps = { item, state, docs, homepage };
    const installed = isInstalled(item);
    const upgradeStatus = getUpgradeStatus(item);
    const upgradeable = installed && upgradeStatus?.upgradeable === true;
    const toggleStatus = getToggleStatus(item);
    const pluginDisabled = installed && toggleStatus?.enabled === false;
    const cardVersion = resolveCardVersion(item, installed, upgradeStatus?.installed_version);
    const cardClass = `${css.card} ${isList ? css.cardList : css.cardGrid}${pluginDisabled ? ` ${css.cardDisabled}` : ''}`;
    if (isList) {
        return (_jsxs("article", { className: cardClass, children: [_jsxs("div", { className: css.cardListTop, children: [_jsxs("div", { className: css.cardListLead, children: [_jsx(PluginListingIcon, { url: item.icon_url, name: item.name }), _jsxs("div", { className: css.cardListText, children: [_jsx(CardTitleRow, { item: item, version: cardVersion }), _jsx("p", { className: css.cardCodeList, title: item.package_name, children: item.package_name }), _jsx(CardMeta, { item: item, t: t, upgradeable: upgradeable, disabled: pluginDisabled })] })] }), _jsx(CardActions, { ...actionProps, className: css.cardListActions })] }), _jsx(CardDescription, { text: item.description ?? '', className: css.cardDescList })] }));
    }
    return (_jsxs("article", { className: cardClass, children: [_jsx("div", { className: css.cardBody, children: _jsx(CardBody, { item: item, t: t, upgradeable: upgradeable, disabled: pluginDisabled, version: cardVersion }) }), _jsx(CardActions, { ...actionProps })] }));
}
//# sourceMappingURL=ListingCard.js.map