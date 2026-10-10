/** Host feature orchestration entry. */
import { registerAuthRoutes } from "./auth/routes.js";
import { registerLineRoutes } from "./line/routes.js";
import { registerPluginMarketRoutes } from "./plugin-market/index.js";
import { registerWalletRoutes } from "./wallet/index.js";
/** Apply all host-side SupaNexus features. */
export function applyHost(ctx, config) {
    // Volatile Config fields project into settings/configForms automatically (dsh ≥ 0.1.7).
    registerLineRoutes(ctx, config);
    registerAuthRoutes(ctx, config);
    registerPluginMarketRoutes(ctx, config);
    registerWalletRoutes(ctx, config);
}
//# sourceMappingURL=index.js.map