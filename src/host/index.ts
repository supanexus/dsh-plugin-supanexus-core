/** Host feature orchestration entry. */

import type { Context } from '@deepseek-ai/cordis'
import type { Config } from './config.ts'
import { registerSettingsNamespace } from './settings/namespace.ts'
import { registerAuthRoutes } from './auth/routes.ts'
import { registerLineRoutes } from './line/routes.ts'
import { registerPluginMarketRoutes } from './plugin-market/index.ts'
import { registerWalletRoutes } from './wallet/index.ts'

/** Apply all host-side SupaNexus features. */
export function applyHost(ctx: Context, config: Config): void {
  registerSettingsNamespace(ctx)
  registerLineRoutes(ctx, config)
  registerAuthRoutes(ctx, config)
  registerPluginMarketRoutes(ctx, config)
  registerWalletRoutes(ctx, config)
}
