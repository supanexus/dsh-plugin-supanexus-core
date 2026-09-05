/** Locales for the SupaNexus plugin settings card. */
const ZH = {
    title: 'SupaNexus',
    description: '平台连接与侧栏展示相关选项。',
    region: '访问区域',
    regionHint: '中国大陆访问更快。仅改变授权、控制台与余额线路；插件下载线路由「插件市场」单独设置。',
    regionGlobal: '全球',
    regionCn: '中国大陆',
    regionLocked: '管理员已锁定访问区域，无法在此切换。',
    regionLoading: '正在探测最快线路…',
    showWallet: '在侧栏显示余额',
    showWalletHint: '关闭后侧栏不再显示余额入口；仅在当前模型服务商为 SupaNexus 时才会出现该入口。',
    showBrand: '显示 SupaNexus 品牌样式',
    showBrandHint: '关闭后恢复 DSH 默认品牌（侧栏 Logo/名称、对话区标识与标题、浏览器标签页）。',
    readOnly: '当前连接为只读，无法保存更改。',
    expand: '展开',
    collapse: '收起',
};
const EN = {
    title: 'SupaNexus',
    description: 'Connection and sidebar display options.',
    region: 'Access region',
    regionHint: 'Mainland China may be faster. This only changes auth, console, and balance routes; plugin downloads are configured under Plugin Market.',
    regionGlobal: 'Global',
    regionCn: 'Mainland China',
    regionLocked: 'Access region is locked by admin configuration.',
    regionLoading: 'Detecting the fastest line…',
    showWallet: 'Show balance in sidebar',
    showWalletHint: 'When off, the sidebar balance entry is hidden. It only appears when the current model provider is SupaNexus.',
    showBrand: 'Show SupaNexus branding',
    showBrandHint: 'When off, restores the default DSH brand (sidebar mark/name, conversation hero, and browser tab).',
    readOnly: 'This connection is read-only; changes cannot be saved.',
    expand: 'Expand',
    collapse: 'Collapse',
};
export function settingsCardT(locale) {
    const table = locale?.toLowerCase().startsWith('zh') ? ZH : EN;
    return (key) => table[key];
}
//# sourceMappingURL=locales.js.map