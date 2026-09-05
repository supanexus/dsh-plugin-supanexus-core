/** Settings namespace shared by Host registration and Client cards. */
export declare const SUPANEXUS_SETTINGS_NS: "supanexus";
/** Field that controls sidebar balance visibility. */
export declare const SHOW_WALLET_FIELD: "showWallet";
/** Field that controls SupaNexus brand chrome (sidebar + hero + tab). */
export declare const SHOW_BRAND_FIELD: "showBrand";
/** Field that pins the platform region (`global` | `cn`). */
export declare const PINNED_LINE_FIELD: "pinnedLine";
/** Client-facing subset of the `supanexus` settings section. */
export interface SupaNexusUiSettings {
    /** Sidebar balance entry (default false on first install). */
    showWallet: boolean;
    /** SupaNexus brand mark / name / hero / tab patches (default true). */
    showBrand: boolean;
    /** Active dual-line id after connect / auto-select (`global` | `cn`). */
    resolvedLine?: string;
    /** User-selected region preference (`global` | `cn`); drives auth / console / wallet. */
    pinnedLine?: string;
}
//# sourceMappingURL=settings-contract.d.ts.map