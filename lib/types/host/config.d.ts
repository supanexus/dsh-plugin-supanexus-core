/** Plugin cordis config schema and defaults. */
import type { Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { SupaLine } from '../shared/line.ts';
/**
 * Resolved plugin configuration from cordis.patch.yml.
 * Runtime-writable prefs are `Volatile` so Host `settings.update(entryId, …)`
 * and Client `configForms` can project them (dsh ≥ 0.1.7).
 */
export interface Config {
    lines: SupaLine[];
    /**
     * Non-volatile region lock from the bundle patch. When non-empty, the
     * settings UI disables switching (same role as pre-0.1.7 `config.pinnedLine`).
     */
    forcePinnedLine: string;
    /** User / auto-probe region pin (`global` | `cn`). */
    pinnedLine: Volatile<string>;
    probeTimeoutMs: number;
    probeCacheTtlMs: number;
    deviceName: Volatile<string>;
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
    deviceId: Volatile<string>;
    resolvedLine: Volatile<string>;
    resolvedAt: Volatile<number>;
    latencyMs: Volatile<number>;
    apiKeyId: Volatile<string>;
    keyPrefix: Volatile<string>;
    connectedAt: Volatile<number>;
    /**
     * When false, hide the sidebar balance module.
     * Default true: still gated by connection + active SupaNexus provider.
     */
    showWallet: Volatile<boolean>;
    /** When false, hide SupaNexus brand chrome (default true). */
    showBrand: Volatile<boolean>;
}
export declare const DEFAULT_LINES: SupaLine[];
export declare const Config: z<Config>;
/** Cordis function-plugin name. */
export declare const name = "supanexus-core";
/** Host services required before routes and settings writes. */
export declare const inject: readonly ["webServer", "connection", "credentials", "settings"];
//# sourceMappingURL=config.d.ts.map