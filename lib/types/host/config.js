/** Plugin cordis config schema and defaults. */
import z from '@deepseek-ai/schemastery';
const lineSchema = z.object({
    id: z.string().required(),
    label: z.string().required(),
    origin: z.string().required(),
    harnessOrigin: z.string(),
    pluginCatalogOrigin: z.string(),
    consoleOrigin: z.string(),
});
export const DEFAULT_LINES = [
    {
        id: 'global',
        label: 'Global',
        origin: 'https://api.supanexus.ai',
        harnessOrigin: 'https://gateway-harness.supanexus.ai',
        pluginCatalogOrigin: 'https://gateway-client.supanexus.ai',
        consoleOrigin: 'https://console.supanexus.ai',
    },
    {
        id: 'cn',
        label: '中国大陆',
        origin: 'https://api.supanexus.io',
        harnessOrigin: 'https://gateway-harness.supanexus.io',
        pluginCatalogOrigin: 'https://gateway-client.supanexus.io',
        consoleOrigin: 'https://console.supanexus.io',
    },
];
export const Config = z.object({
    lines: z.array(lineSchema).default([
        {
            id: 'global',
            label: 'Global',
            origin: 'https://api.supanexus.ai',
            harnessOrigin: 'https://gateway-harness.supanexus.ai',
            pluginCatalogOrigin: 'https://gateway-client.supanexus.ai',
            consoleOrigin: 'https://console.supanexus.ai',
        },
        {
            id: 'cn',
            label: '中国大陆',
            origin: 'https://api.supanexus.io',
            harnessOrigin: 'https://gateway-harness.supanexus.io',
            pluginCatalogOrigin: 'https://gateway-client.supanexus.io',
            consoleOrigin: 'https://console.supanexus.io',
        },
    ]),
    pinnedLine: z.string().default(''),
    probeTimeoutMs: z.number().step(1).min(500).max(30_000).default(2500),
    probeCacheTtlMs: z.number().step(1).min(0).max(3_600_000).default(600_000),
    deviceName: z.string().default(''),
    profileName: z.string().default('web'),
    dshCliEntry: z.string().default(''),
    pluginCatalogOrigin: z.string().default(''),
    consoleOrigin: z.string().default(''),
});
/** Cordis function-plugin name. */
export const name = 'supanexus-core';
/** Host services required before routes and settings register. */
export const inject = ['webServer', 'connection', 'credentials', 'settings'];
//# sourceMappingURL=config.js.map