/** Browser fetch wrappers for plugin market Host API routes. */
import { type PluginInstallResponse, type PluginCategoriesListData, type PluginListingsListData, type PluginUninstallResponse, type PluginUpgradeStatusData, type PluginRemoteVersionData, type PluginToggleResult, type PluginToggleStatusData } from '../../shared/plugin-market-contract.ts';
export interface ListPluginListingsParams {
    readonly locale?: string;
    readonly source?: string;
    readonly layer?: string;
    readonly category?: string;
    readonly q?: string;
    readonly page?: number;
    readonly page_size?: number;
}
/** List published plugins via Host proxy. */
export declare function listPluginListings(params?: ListPluginListingsParams): Promise<PluginListingsListData>;
/** List plugin categories via Host proxy. */
export declare function listPluginCategories(params?: {
    readonly locale?: string;
}): Promise<PluginCategoriesListData>;
/** Install a plugin by install code via Host bridge (GET; connection.fetch is GET-only). */
export declare function installPlugin(installCode: string, locale?: string): Promise<Extract<PluginInstallResponse, {
    ok: true;
}> & {
    readonly log?: string;
}>;
/** Uninstall a plugin by package name via Host bridge. */
export declare function uninstallPlugin(packageName: string, installCode?: string): Promise<Extract<PluginUninstallResponse, {
    ok: true;
}> & {
    readonly log?: string;
}>;
/** Batch upgrade hints for installed plugins via Host bridge. */
export declare function fetchPluginUpgradeStatus(installCodes: readonly string[], locale?: string): Promise<PluginUpgradeStatusData>;
/** Fetch remote package.json version for upgrade confirm. */
export declare function fetchPluginRemoteVersion(installCode: string, locale?: string): Promise<PluginRemoteVersionData>;
/** Batch enabled/disabled state for installed plugins. */
export declare function fetchPluginToggleStatus(packageNames: readonly string[]): Promise<PluginToggleStatusData>;
/** Toggle one installed plugin via profile cordis.patch.yml. */
export declare function setPluginEnabled(packageName: string, enabled: boolean): Promise<PluginToggleResult>;
/** Restart dsh web Host via loopback API (web profile). */
export declare function restartHostService(): Promise<void>;
//# sourceMappingURL=wire.d.ts.map