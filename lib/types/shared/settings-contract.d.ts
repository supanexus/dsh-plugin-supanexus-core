/** Settings namespace shared by Host registration and Client cards. */
/**
 * Profile entry id from `cordis.patch.yml` (`supanexus-core`).
 * dsh ≥ 0.1.7 projects volatile Config fields under this id into `configForms`.
 */
export declare const SUPANEXUS_SETTINGS_NS: "supanexus-core";
/** Field that controls sidebar balance visibility. */
export declare const SHOW_WALLET_FIELD: "showWallet";
/** Field that controls SupaNexus brand chrome (sidebar + hero + tab). */
export declare const SHOW_BRAND_FIELD: "showBrand";
/** Field that pins the platform region (`global` | `cn`). */
export declare const PINNED_LINE_FIELD: "pinnedLine";
/** Client-facing subset of the SupaNexus volatile Config form. */
export interface SupaNexusUiSettings {
    /** Sidebar balance entry (default true; still gated by connection + provider). */
    showWallet: boolean;
    /** SupaNexus brand mark / name / hero / tab patches (default true). */
    showBrand: boolean;
    /** Active dual-line id after connect / auto-select (`global` | `cn`). */
    resolvedLine?: string;
    /** User-selected region preference (`global` | `cn`); drives auth / console / wallet. */
    pinnedLine?: string;
}
//# sourceMappingURL=settings-contract.d.ts.map