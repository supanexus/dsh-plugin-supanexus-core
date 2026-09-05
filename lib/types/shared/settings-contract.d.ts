/** Settings namespace shared by Host registration and Client cards. */
export declare const SUPANEXUS_SETTINGS_NS: "supanexus";
/** Field that controls sidebar balance visibility. */
export declare const SHOW_WALLET_FIELD: "showWallet";
/** Field that controls SupaNexus brand chrome (sidebar + hero + tab). */
export declare const SHOW_BRAND_FIELD: "showBrand";
/** Client-facing subset of the `supanexus` settings section. */
export interface SupaNexusUiSettings {
    /** Sidebar balance entry (default false on first install). */
    showWallet: boolean;
    /** SupaNexus brand mark / name / hero / tab patches (default true). */
    showBrand: boolean;
    /** Active dual-line id after connect (`global` | `cn`); drives .ai / .io sites. */
    resolvedLine?: string;
    /** User-pinned line preference when set. */
    pinnedLine?: string;
}
//# sourceMappingURL=settings-contract.d.ts.map