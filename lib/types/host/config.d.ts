/** Plugin cordis config schema and defaults. */
import z from '@deepseek-ai/schemastery';
import type { SupaLine } from '../shared/line.ts';
/** Resolved plugin configuration from cordis.patch.yml. */
export interface Config {
    lines: SupaLine[];
    pinnedLine: string;
    probeTimeoutMs: number;
    probeCacheTtlMs: number;
    deviceName: string;
    /** Profile name for `dsh plugin add` (default web). */
    profileName: string;
    /** Optional absolute path to dsh CLI bin.js. */
    dshCliEntry: string;
    /**
     * Fallback gateway-client root when a line omits `pluginCatalogOrigin`.
     * Prefer per-line values for dual-domain (.ai / .io).
     */
    pluginCatalogOrigin: string;
    /**
     * Fallback console origin when a line omits `consoleOrigin`.
     * Prefer per-line values for dual-domain (.ai / .io).
     */
    consoleOrigin: string;
}
export declare const DEFAULT_LINES: SupaLine[];
export declare const Config: z<Config>;
/** Cordis function-plugin name. */
export declare const name = "supanexus-core";
/** Host services required before routes and settings register. */
export declare const inject: readonly ["webServer", "connection", "credentials", "settings"];
//# sourceMappingURL=config.d.ts.map