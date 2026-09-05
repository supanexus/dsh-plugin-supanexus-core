/** `supanexus` settings namespace registration. */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'

export const SUPANEXUS_NS = settingsNamespace('supanexus')

/** Persisted plugin state (not provider profile — that lives in llm-pi-ai). */
export interface SupaNexusSettings {
  deviceName: string
  deviceId: string
  resolvedLine: string
  resolvedAt: number
  latencyMs: number
  pinnedLine: string
  apiKeyId: string
  keyPrefix: string
  connectedAt: number
  /** When false, hide the sidebar balance module (default false on first install). */
  showWallet: boolean
  /** When false, hide SupaNexus brand chrome (default true). */
  showBrand: boolean
}

export const SupaNexusSettingsSchema: z<SupaNexusSettings> = z.object({
  deviceName: z.string().default(''),
  deviceId: z.string().default(''),
  resolvedLine: z.string().default(''),
  resolvedAt: z.number().default(0),
  latencyMs: z.number().default(0),
  pinnedLine: z.string().default(''),
  apiKeyId: z.string().default(''),
  keyPrefix: z.string().default(''),
  connectedAt: z.number().default(0),
  showWallet: z.boolean().default(false),
  showBrand: z.boolean().default(true),
})

export const DEFAULT_SETTINGS: SupaNexusSettings = {
  deviceName: '',
  deviceId: '',
  resolvedLine: '',
  resolvedAt: 0,
  latencyMs: 0,
  pinnedLine: '',
  apiKeyId: '',
  keyPrefix: '',
  connectedAt: 0,
  showWallet: false,
  showBrand: true,
}

/** Register the supanexus settings section when the settings service is available. */
export function registerSettingsNamespace(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(SUPANEXUS_NS, SupaNexusSettingsSchema, {
      base: DEFAULT_SETTINGS,
    })
  })
}
