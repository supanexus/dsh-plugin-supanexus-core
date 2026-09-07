/** `supanexus` settings namespace registration. */
import z from '@deepseek-ai/schemastery';
export const SUPANEXUS_NS = 'supanexus';
export const SupaNexusSettingsSchema = z.object({
    deviceName: z.string().default(''),
    deviceId: z.string().default(''),
    resolvedLine: z.string().default(''),
    resolvedAt: z.number().default(0),
    latencyMs: z.number().default(0),
    pinnedLine: z.string().default(''),
    apiKeyId: z.string().default(''),
    keyPrefix: z.string().default(''),
    connectedAt: z.number().default(0),
    showWallet: z.boolean().default(false),
    showBrand: z.boolean().default(true),
});
export const DEFAULT_SETTINGS = {
    deviceName: '',
    deviceId: '',
    resolvedLine: '',
    resolvedAt: 0,
    latencyMs: 0,
    pinnedLine: '',
    apiKeyId: '',
    keyPrefix: '',
    connectedAt: 0,
    showWallet: false,
    showBrand: true,
};
/** Register the supanexus settings section when the settings service is available. */
export function registerSettingsNamespace(ctx) {
    ctx.inject(['settings'], (settingsCtx) => {
        settingsCtx.settings.register(SUPANEXUS_NS, SupaNexusSettingsSchema, {
            base: DEFAULT_SETTINGS,
        });
    });
}
//# sourceMappingURL=namespace.js.map