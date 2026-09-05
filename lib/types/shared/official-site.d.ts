/** SupaNexus official marketing site (.ai / .io) from dual-line config. */
/** Production official site for the Global / .ai fleet. */
export declare const OFFICIAL_SITE_AI: "https://supanexus.ai";
/** Production official site for the CN / .io fleet. */
export declare const OFFICIAL_SITE_IO: "https://supanexus.io";
/**
 * Pick official site base from line id or API origin host.
 * - `cn` or `*.supanexus.io` → https://supanexus.io
 * - otherwise (incl. `global`, `*.supanexus.ai`, unset) → https://supanexus.ai
 */
export declare function resolveOfficialSiteBase(options?: {
    readonly lineId?: string | null;
    readonly lineOrigin?: string | null;
}): typeof OFFICIAL_SITE_AI | typeof OFFICIAL_SITE_IO;
/**
 * Official site URL with locale path (`/zh` or `/en`), matching official site routing.
 */
export declare function buildOfficialSiteUrl(options?: {
    readonly lineId?: string | null;
    readonly lineOrigin?: string | null;
    readonly locale?: string | null;
}): string;
//# sourceMappingURL=official-site.d.ts.map