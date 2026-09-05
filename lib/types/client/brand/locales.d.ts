/** Brand copy keys. */
export declare const brandMessages: {
    readonly 'zh-CN': {
        readonly subtitle: "智能 Agent 平台";
    };
    readonly 'en-US': {
        readonly subtitle: "AI Agent Platform";
    };
};
export type BrandLocale = keyof typeof brandMessages;
export type BrandKey = keyof typeof brandMessages['zh-CN'];
/** Resolve locale tag to brand dictionary accessor. */
export declare function brandT(locale: string | undefined): (key: BrandKey) => string;
//# sourceMappingURL=locales.d.ts.map