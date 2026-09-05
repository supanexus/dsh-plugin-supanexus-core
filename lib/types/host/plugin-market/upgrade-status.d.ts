/** Compute upgrade hints from operational listing version vs installed package.json. */
import { type PluginListingItem, type PluginUpgradeStatusEntry } from '../../shared/plugin-market-contract.ts';
export interface BuildUpgradeStatusOptions {
    readonly profileName: string;
}
/** Build one upgrade-status row for an installed listing. */
export declare function buildUpgradeStatusEntry(listing: PluginListingItem, options: BuildUpgradeStatusOptions): PluginUpgradeStatusEntry;
//# sourceMappingURL=upgrade-status.d.ts.map