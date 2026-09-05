/** Auth-line pinning + env-line healthz racing (separate caches). */
import type { Context } from '@deepseek-ai/cordis';
import type { LineProbeEntry } from '../../shared/auth-contract.ts';
import type { AuthLineSource } from '../../shared/line-contract.ts';
import { type ResolvedLine, type SupaLine } from '../../shared/line.ts';
import type { Config } from '../config.ts';
export type { AuthLineSource } from '../../shared/line-contract.ts';
export type FetchProbe = (url: string, signal: AbortSignal) => Promise<Response>;
export interface ProbeReport {
    readonly winner: ResolvedLine;
    readonly entries: readonly LineProbeEntry[];
    /** Auth resolution only: who chose the line. */
    readonly source?: AuthLineSource;
}
export type FetchProbeOptions = {
    doFetch?: FetchProbe;
};
/** Probe one line; any HTTP response counts as reachable. */
export declare function probeLine(line: SupaLine, timeoutMs: number, doFetch?: FetchProbe): Promise<LineProbeEntry>;
/**
 * Resolve the auth / platform region line.
 * Priority (non-empty string wins): pinnedOverride → config.pinnedLine → settings.pinnedLine → probe.
 * First auto probe also writes `pinnedLine` so the settings UI shows a selection.
 */
export declare function resolveAuthLine(ctx: Context, config: Config, options?: {
    pinnedOverride?: string;
    doFetch?: FetchProbe;
}): Promise<ProbeReport>;
/**
 * Resolve the plugin-market env line via healthz racing.
 * Uses an independent TTL cache and never writes auth settings.
 */
export declare function resolveEnvLine(_ctx: Context, config: Config, options?: {
    force?: boolean;
    doFetch?: FetchProbe;
}): Promise<ProbeReport>;
/** Whether cordis config locks the region (UI should disable switching). */
export declare function isAuthLineLocked(config: Config): boolean;
/** Test helper: clear env-line probe cache. */
export declare function resetLineCache(): void;
/** Alias for {@link resetLineCache}. */
export declare const resetEnvLineCache: typeof resetLineCache;
//# sourceMappingURL=resolver.d.ts.map