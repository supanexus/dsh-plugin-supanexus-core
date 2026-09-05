/** Host feature orchestration entry. */
import { registerSettingsNamespace } from "./settings/namespace.js";
import { registerAuthRoutes } from "./auth/routes.js";
import { registerPluginMarketRoutes } from "./plugin-market/index.js";
import { registerWalletRoutes } from "./wallet/index.js";
/** Apply all host-side SupaNexus features. */
export function applyHost(ctx, config) {
    registerSettingsNamespace(ctx);
    registerAuthRoutes(ctx, config);
    registerPluginMarketRoutes(ctx, config);
    registerWalletRoutes(ctx, config);
}
//# sourceMappingURL=index.js.map