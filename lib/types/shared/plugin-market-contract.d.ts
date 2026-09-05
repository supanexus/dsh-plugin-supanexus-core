/** Plugin plaza (skill market) shared contract — types, paths, install spec helpers. */
export declare const PLUGIN_LISTINGS_PATH: "/api/supanexus.plugin-listings";
export declare const PLUGIN_CATEGORIES_PATH: "/api/supanexus.plugin-categories";
/** GET with `?installCode=` — connection.fetch only supports GET/HEAD. */
export declare const PLUGIN_INSTALL_PATH: "/api/supanexus.plugin-install";
/** GET — loopback-only Host relaunch for web / local dsh web. */
export declare const RESTART_HOST_PATH: "/api/supanexus.restart-host";
/** GET with `?packageName=` — remove an installed plugin from the profile. */
export declare const PLUGIN_UNINSTALL_PATH: "/api/supanexus.plugin-uninstall";
/** GET with `?installCodes=` — batch upgrade hints for installed plugins. */
export declare const PLUGIN_UPGRADE_STATUS_PATH: "/api/supanexus.plugin-upgrade-status";
/** GET with `?installCode=` — fetch remote package.json version at operational ref. */
export declare const PLUGIN_REMOTE_VERSION_PATH: "/api/supanexus.plugin-remote-version";
/** GET with `?packageNames=` — batch enabled/disabled state from user patch layer. */
export declare const PLUGIN_TOGGLE_STATUS_PATH: "/api/supanexus.plugin-toggle-status";
/** GET with `?packageName=&enabled=` — enable/disable via cordis.patch.yml. */
export declare const PLUGIN_TOGGLE_PATH: "/api/supanexus.plugin-toggle";
export declare const PROTECTED_UNINSTALL_PACKAGE_NAME: "@supanexus/dsh-plugin-supanexus-core";
export declare const PROTECTED_UNINSTALL_INSTALL_CODE: "supanexus-core";
export type PluginListingSource = 'supanexus' | 'dsh_community';
export type PluginListingLayer = 'core' | 'feature';
export type RepositoryProvider = 'github' | 'gitee' | 'npm';
export interface PluginListingRepository {
    readonly provider: RepositoryProvider;
    readonly url: string;
    readonly default_ref?: string | null;
    readonly sort_order?: number;
}
export interface PluginListingItem {
    readonly id: string;
    readonly install_code: string;
    readonly package_name: string;
    readonly name: string;
    readonly description: string;
    readonly source: PluginListingSource;
    readonly layer: PluginListingLayer;
    readonly icon_url?: string | null;
    readonly homepage_url?: string | null;
    readonly docs_url?: string | null;
    readonly repositories?: readonly PluginListingRepository[];
    readonly repository?: PluginListingRepository;
    readonly category_id?: string | null;
    readonly category_slug?: string | null;
    readonly category_name?: string | null;
    /** Operational listing version for upgrade hints (e.g. "1.1.0"). */
    readonly version?: string | null;
}
export interface PluginCategoryItem {
    readonly id: string;
    readonly slug: string;
    readonly name: string;
    readonly sort_order: number;
}
export interface PluginCategoriesListData {
    readonly items: readonly PluginCategoryItem[];
}
export interface PluginListingsListData {
    readonly items: readonly PluginListingItem[];
    readonly total_count: number;
    readonly page: number;
    readonly page_size: number;
    readonly has_next_page: boolean;
}
export interface PluginInstallRequest {
    readonly installCode: string;
}
export interface PluginInstallAttempt {
    readonly provider: RepositoryProvider;
    readonly spec: string;
    readonly ok: boolean;
    readonly message?: string;
    readonly cliCommand?: string;
    readonly stdout?: string;
    readonly stderr?: string;
}
export interface PluginInstallSuccess {
    readonly ok: true;
    readonly spec: string;
    readonly packageName: string;
    readonly provider: RepositoryProvider;
    readonly needsRestart: true;
    readonly cliCommand: string;
    readonly attempts?: readonly PluginInstallAttempt[];
}
export interface PluginInstallFailure {
    readonly ok: false;
    readonly message: string;
    readonly code?: string;
    readonly attempts?: readonly PluginInstallAttempt[];
}
export declare function formatInstallAttemptsLog(attempts: readonly PluginInstallAttempt[]): string;
export type PluginInstallResponse = PluginInstallSuccess | PluginInstallFailure;
export interface PluginUninstallSuccess {
    readonly ok: true;
    readonly packageName: string;
    readonly needsRestart: true;
    readonly cliCommand: string;
    readonly stdout?: string;
    readonly stderr?: string;
}
export interface PluginUninstallFailure {
    readonly ok: false;
    readonly message: string;
    readonly code?: string;
    readonly log?: string;
}
export type PluginUninstallResponse = PluginUninstallSuccess | PluginUninstallFailure;
/** Per-plugin upgrade hint returned by the Host upgrade-status API. */
export interface PluginUpgradeStatusEntry {
    readonly install_code: string;
    /** True when semver(listing.version) > semver(installed package.json version). */
    readonly upgradeable: boolean;
    readonly installed_version: string | null;
    readonly listing_version: string | null;
}
export interface PluginUpgradeStatusData {
    readonly items: readonly PluginUpgradeStatusEntry[];
}
export interface PluginRemoteVersionData {
    readonly version: string | null;
    readonly provider: RepositoryProvider | null;
}
export interface PluginToggleStatusEntry {
    readonly package_name: string;
    readonly enabled: boolean;
    readonly row_ids: readonly string[];
    readonly toggleable: boolean;
}
export interface PluginToggleStatusData {
    readonly items: readonly PluginToggleStatusEntry[];
}
export interface PluginToggleResult {
    readonly package_name: string;
    readonly enabled: boolean;
    readonly row_ids: readonly string[];
    readonly needsRefresh: boolean;
}
/** Whether skill market may offer uninstall for this listing. */
export declare function canUninstallPlugin(item: Pick<PluginListingItem, 'package_name' | 'install_code'>): boolean;
/** Whether skill market may offer enable/disable for this listing. */
export declare function canTogglePlugin(item: Pick<PluginListingItem, 'package_name' | 'install_code'>): boolean;
export declare function formatCommandLog(run: {
    readonly cliCommand: string;
    readonly stdout?: string;
    readonly stderr?: string;
    readonly message?: string;
}): string;
/** 按线路偏好排出候选渠道；cn 优先 gitee，global 优先 github。 */
export declare function orderRepositories(item: PluginListingItem, lineId: string): readonly PluginListingRepository[];
/** 单渠道 → `dsh plugin add` spec。 */
export declare function buildInstallSpecFor(repo: PluginListingRepository, installCode: string): string;
/** Build `dsh plugin add` package spec from a listing row (first candidate). */
export declare function buildInstallSpec(item: PluginListingItem, lineId?: string): string;
/** Full CLI command shown to users (profile placeholder). */
export declare function buildCliInstallCommand(spec: string, profile?: string): string;
/** Full CLI remove command shown to users (profile placeholder). */
export declare function buildCliRemoveCommand(packageName: string, profile?: string): string;
/** 展示用：取第一个可用仓库 URL（不区分线路）。 */
export declare function primaryRepositoryUrl(item: PluginListingItem): string | undefined;
export declare function repositoryProviderLabel(provider: RepositoryProvider): string;
type SemverParts = readonly [major: number, minor: number, patch: number, prerelease: string];
/** Parse `major.minor.patch` with optional leading `v` and pre-release suffix. */
export declare function parseSemver(version: string): SemverParts | null;
/** Compare two semver strings; returns null when either side is invalid. */
export declare function compareSemver(left: string, right: string): number | null;
/** Whether the operational listing version is strictly newer than the installed version. */
export declare function versionIndicatesUpgrade(listingVersion: string | null | undefined, installedVersion: string | null | undefined): boolean;
/** Operational default_ref from the first repository candidate on the active line. */
export declare function primaryTargetRef(item: PluginListingItem, lineId: string): string;
export {};
//# sourceMappingURL=plugin-market-contract.d.ts.map