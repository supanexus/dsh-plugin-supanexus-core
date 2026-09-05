/** Fetch plugin package.json from Git hosting at an operational ref. */
import type { PluginListingRepository } from '../../shared/plugin-market-contract.ts';
export interface RemotePackageManifest {
    readonly name: string;
    readonly version: string;
    readonly provider: PluginListingRepository['provider'];
}
/** Build a raw package.json URL for one repository channel and ref. */
export declare function buildRemotePackageJsonUrl(repo: PluginListingRepository, ref: string): string | undefined;
/** Fetch and parse remote package.json; tries candidates in order. */
export declare function fetchRemotePackageManifest(candidates: readonly PluginListingRepository[], targetRef: string, fetchImpl?: typeof fetch): Promise<RemotePackageManifest | undefined>;
//# sourceMappingURL=remote-package-json.d.ts.map