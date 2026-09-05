/** Concurrent /healthz line racing with TTL cache. */
import type { Config } from '../config.ts';
import { type ResolvedLine, type SupaLine } from '../../shared/line.ts';
import type { LineProbeEntry } from '../../shared/auth-contract.ts';
import type { Context } from '@deepseek-ai/cordis';
export type FetchProbe = (url: string, signal: AbortSignal) => Promise<Response>;
export interface ProbeReport {
    readonly winner: ResolvedLine;
    readonly entries: readonly LineProbeEntry[];
}
/** Probe one line; any HTTP response counts as reachable. */
export declare function probeLine(line: SupaLine, timeoutMs: number, doFetch?: FetchProbe): Promise<LineProbeEntry>;
/** Resolve the best line, honoring pinnedLine and cache unless forced. */
export declare function resolveLine(ctx: Context, config: Config, options?: {
    force?: boolean;
    pinnedOverride?: string;
    doFetch?: FetchProbe;
}): Promise<ProbeReport>;
/** Test helper: clear resolver cache. */
export declare function resetLineCache(): void;
//# sourceMappingURL=resolver.d.ts.map