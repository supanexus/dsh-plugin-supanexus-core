/** Brand copy keys. */
export const brandMessages = {
    'zh-CN': {
        subtitle: '智能 Agent 平台',
    },
    'en-US': {
        subtitle: 'AI Agent Platform',
    },
};
/** Resolve locale tag to brand dictionary accessor. */
export function brandT(locale) {
    const tag = locale?.startsWith('zh') ? 'zh-CN' : 'en-US';
    const dict = brandMessages[tag];
    return key => dict[key];
}
//# sourceMappingURL=locales.js.map