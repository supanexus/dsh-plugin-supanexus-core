/** Line model and URL derivation — single source of truth for host and client. */
/** One Global / CN access line. */
export interface SupaLine {
    readonly id: string;
    readonly label: string;
    /** OpenAPI data plane (models / chat). */
    readonly origin: string;
    /** Harness auth plane; omit to reuse `origin`. */
    readonly harnessOrigin?: string;
    /** Plugin plaza gateway-client; omit → top-level / port heuristic. */
    readonly pluginCatalogOrigin?: string;
    /** Developer console for spend-budget links; omit → top-level. */
    readonly consoleOrigin?: string;
}
/** Outcome of a line probe. */
export interface ResolvedLine {
    readonly line: SupaLine;
    readonly latencyMs: number;
    readonly resolvedAt: number;
}
/** Strip trailing slashes from an origin URL. */
export declare function normalizeOrigin(origin: string): string;
/** Harness API base for one line (`{harnessOrigin ?? origin}/harness/v1`). */
export declare function harnessBase(line: SupaLine): string;
/** OpenAPI data-plane base for provider `baseURL` (`{origin}/v1`). */
export declare function dataPlaneBase(line: SupaLine): string;
/** Health probe target (`{origin}/healthz`). */
export declare function probeUrl(line: SupaLine): string;
/** Find a line by id in the configured table. */
export declare function findLine(lines: readonly SupaLine[], id: string): SupaLine | undefined;
//# sourceMappingURL=line.d.ts.map