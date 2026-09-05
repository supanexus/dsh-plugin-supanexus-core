/** Resolve gateway-client / console base URLs per active line. */
import { type SupaLine } from '../../shared/line.ts';
export interface PluginCatalogOriginConfig {
    readonly pluginCatalogOrigin: string;
}
export interface ConsoleOriginConfig {
    readonly consoleOrigin: string;
}
/**
 * Plugin listings live on gateway-client (`/api/v1/public/plugin-listings`),
 * while `line.origin` is often gateway-openapi (`/v1` models) in local dev.
 *
 * Priority: line.pluginCatalogOrigin → top-level pluginCatalogOrigin →
 * local `:31002` → `:31000` heuristic → line.origin.
 */
export declare function resolvePluginCatalogOrigin(config: PluginCatalogOriginConfig, line: SupaLine): string;
/**
 * Console spend-budget deep link base.
 * Priority: line.consoleOrigin → top-level consoleOrigin → empty (caller must handle).
 */
export declare function resolveConsoleOrigin(config: ConsoleOriginConfig, line: SupaLine): string;
//# sourceMappingURL=catalog-origin.d.ts.map