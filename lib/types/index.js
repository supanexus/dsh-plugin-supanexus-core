/**
 * SupaNexus platform core plugin, node half.
 * Orchestrates host features (settings, line probe, OAuth); browser UI ships via `./client`.
 */
import { applyHost } from "./host/index.js";
export { Config, name, inject } from "./host/config.js";
/**
 * Register host routes and settings for SupaNexus quick setup.
 * @param ctx - Host plugin context.
 * @param config - Cordis row configuration.
 */
export function apply(ctx, config) {
    applyHost(ctx, config);
}
//# sourceMappingURL=index.js.map