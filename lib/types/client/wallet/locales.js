/** Wallet sidebar locale dictionary. */
const zh = {
    nav: '余额',
    title: 'SupaNexus 余额',
    close: '关闭',
    balanceLabel: '可用余额',
    orgLabel: '组织',
    refresh: '刷新',
    loading: '正在加载余额…',
    configureBudget: '配置预算',
    visibilityHint: '仅当前模型服务商为 SupaNexus 时显示。',
    budgetHint: '配额预算请登录到控制台中进行配置',
    reauthHint: '会话已失效。请打开设置 → 模型，重新执行 SupaNexus 快速配置。',
    hostApiMissing: 'Host 余额接口未加载。请在插件目录执行 pnpm build 后完全重启 dsh web。',
    error: '无法获取余额。',
    notConnected: '尚未配置 SupaNexus。',
};
const en = {
    nav: 'Balance',
    title: 'SupaNexus balance',
    close: 'Close',
    balanceLabel: 'Available balance',
    orgLabel: 'Organization',
    refresh: 'Refresh',
    loading: 'Loading balance…',
    configureBudget: 'Configure budget',
    visibilityHint: 'Shown only when the current model provider is SupaNexus.',
    budgetHint: 'Sign in to the console to configure quota budgets.',
    reauthHint: 'Session expired. Open Settings → Models and run SupaNexus Quick Setup again.',
    hostApiMissing: 'Host wallet API is missing. Run pnpm build in the plugin directory, then fully restart dsh web.',
    error: 'Could not load balance.',
    notConnected: 'SupaNexus is not configured yet.',
};
/** Resolve locale tag to wallet dictionary accessor. */
export function walletT(locale) {
    const dict = locale?.startsWith('zh') ? zh : en;
    return (key) => dict[key];
}
//# sourceMappingURL=locales.js.map