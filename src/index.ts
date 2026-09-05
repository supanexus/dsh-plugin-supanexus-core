/**
 * SupaNexus platform core plugin, node half.
 * Orchestrates host features (settings, line probe, OAuth); browser UI ships via `./client`.
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-connection'
import type {} from '@deepseek-ai/dsh-credentials'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-settings'
import { applyHost } from './host/index.ts'
import type { Config } from './host/config.ts'

export { Config, name, inject } from './host/config.ts'

/**
 * Register host routes and settings for SupaNexus quick setup.
 * @param ctx - Host plugin context.
 * @param config - Cordis row configuration.
 */
export function apply(ctx: Context, config: Config): void {
  applyHost(ctx, config)
}
