/** Self-contained OAuth loopback result pages (no external assets). */
export type CallbackPageKind = 'success' | 'error';
/** Normalize flow locale to a supported callback page language. */
export declare function callbackLocale(locale: string | undefined): 'zh-CN' | 'en-US';
/** Escape text for safe HTML interpolation. */
export declare function escapeHtml(value: string): string;
/** Render the OAuth success page shown after quick setup completes. */
export declare function renderSuccessPage(locale?: string): string;
/** Render the OAuth error page with a safe, escaped detail message. */
export declare function renderErrorPage(message: string, locale?: string): string;
//# sourceMappingURL=callback-page.d.ts.map