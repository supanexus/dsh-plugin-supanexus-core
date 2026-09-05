/** Fetch plugin plaza public API on gateway-client (line.origin). */
import type { PluginListingItem, PluginListingsListData, PluginCategoriesListData } from '../../shared/plugin-market-contract.ts';
/** List published plugin listings. */
export declare function fetchPublicListings(origin: string, params: URLSearchParams): Promise<PluginListingsListData>;
/** Fetch one listing by install code. */
export declare function fetchListingByCode(origin: string, installCode: string, locale?: string): Promise<PluginListingItem>;
/** List published plugin categories. */
export declare function fetchPublicCategories(origin: string, params: URLSearchParams): Promise<PluginCategoriesListData>;
//# sourceMappingURL=gateway-client.d.ts.map