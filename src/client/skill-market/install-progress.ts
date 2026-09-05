import type { PluginListingItem } from '../../shared/plugin-market-contract.ts'

export type MarketOperation = 'install' | 'uninstall' | 'upgrade'

export type InstallProgressPhase = 'confirm' | 'running' | 'success' | 'error'

export interface InstallProgressState {
  readonly operation: MarketOperation
  readonly item: PluginListingItem
  readonly phase: InstallProgressPhase
  readonly log: string
  readonly showLog: boolean
  readonly provider?: string
  readonly errorMessage?: string
  /** Target listing version shown on upgrade confirm. */
  readonly targetVersion?: string
  /** Remote package.json version at operational ref. */
  readonly remoteVersion?: string
}
