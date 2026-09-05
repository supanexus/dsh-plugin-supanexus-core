import type { PluginInstallAttempt } from '../../shared/plugin-market-contract.ts'

export class InstallPluginError extends Error {
  readonly attempts?: readonly PluginInstallAttempt[]
  readonly log?: string

  constructor(message: string, options?: {
    readonly attempts?: readonly PluginInstallAttempt[]
    readonly log?: string
  }) {
    super(message)
    this.name = 'InstallPluginError'
    if (options?.attempts !== undefined) this.attempts = options.attempts
    if (options?.log !== undefined) this.log = options.log
  }
}
