/** Quick-setup copy keys. */
export declare const quickSetupMessages: {
    readonly 'zh-CN': {
        readonly title: "SupaNexus 快速配置";
        readonly description: "登录授权后自动添加 SupaNexus 模型提供方，无需手填 API Key。";
        readonly quickSetup: "快速配置";
        readonly reopenAuth: "重新打开授权页";
        readonly awaiting: "请在浏览器中完成授权…";
        readonly writing: "正在写入模型提供方…";
        readonly done: "SupaNexus 已配置，可在上方列表中使用。";
        readonly error: "配置失败";
        readonly hostApiMissing: "Host 端接口未就绪。请在插件目录执行 pnpm build，然后完全重启 dsh web / Desktop（仅刷新浏览器不够）。";
        readonly unauthorized: "会话未授权，请关闭页面后用终端里带 ?token= 的 dsh web 地址重新打开。";
    };
    readonly 'en-US': {
        readonly title: "SupaNexus Quick Setup";
        readonly description: "Sign in to add the SupaNexus provider automatically — no API key typing.";
        readonly quickSetup: "Quick setup";
        readonly reopenAuth: "Reopen authorization";
        readonly awaiting: "Complete authorization in your browser…";
        readonly writing: "Writing model provider…";
        readonly done: "SupaNexus is configured. Use it in the list above.";
        readonly error: "Setup failed";
        readonly hostApiMissing: "Host API is not ready. Run pnpm build in the plugin directory, then fully restart dsh web / Desktop (refreshing the browser is not enough).";
        readonly unauthorized: "Session is not authorized. Close this tab and reopen using the dsh web URL with ?token= from your terminal.";
    };
};
export type QuickSetupLocale = keyof typeof quickSetupMessages;
export type QuickSetupKey = keyof typeof quickSetupMessages['zh-CN'];
/** Resolve locale tag to a supported quick-setup dictionary. */
export declare function quickSetupT(locale: string | undefined): (key: QuickSetupKey) => string;
//# sourceMappingURL=locales.d.ts.map