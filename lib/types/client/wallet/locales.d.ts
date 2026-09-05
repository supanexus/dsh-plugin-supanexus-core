/** Wallet sidebar locale dictionary. */
declare const zh: {
    readonly nav: "余额";
    readonly title: "SupaNexus 余额";
    readonly close: "关闭";
    readonly balanceLabel: "可用余额";
    readonly orgLabel: "组织";
    readonly refresh: "刷新";
    readonly loading: "正在加载余额…";
    readonly configureBudget: "配置预算";
    readonly visibilityHint: "仅当前模型服务商为 SupaNexus 时显示。";
    readonly budgetHint: "配额预算请登录到控制台中进行配置";
    readonly reauthHint: "会话已失效。请打开设置 → 模型，重新执行 SupaNexus 快速配置。";
    readonly hostApiMissing: "Host 余额接口未加载。请在插件目录执行 pnpm build 后完全重启 dsh web。";
    readonly error: "无法获取余额。";
    readonly notConnected: "尚未配置 SupaNexus。";
};
export type WalletDict = typeof zh;
/** Resolve locale tag to wallet dictionary accessor. */
export declare function walletT(locale: string | undefined): (key: keyof WalletDict) => string;
export {};
//# sourceMappingURL=locales.d.ts.map