/**
 * Profile user patch layer toggles — write `disabled: true|false` into
 * `cordis.patch.yml` (ported in simplified form from dsh-market / dsh-plugin-hub).
 */
export interface PatchState {
    readonly disables: readonly string[];
    readonly forced: readonly string[];
}
/** Line-wise scan of disable/force rows in the user patch layer. */
export declare function readUserPatchState(patchPath: string): PatchState;
/** Insert row ids declared by a package bundle patch. */
export declare function bundleInsertIds(profileDir: string, packageName: string): string[];
export declare function disableRow(patchPath: string, rowId: string): Promise<{
    ok: boolean;
    reason: string | null;
}>;
export declare function enableRow(patchPath: string, rowId: string): Promise<{
    ok: boolean;
    reason: string | null;
}>;
export declare function packageEnabled(profileName: string, packageName: string): {
    enabled: boolean;
    rowIds: readonly string[];
};
export declare function setPackageEnabled(profileName: string, packageName: string, enabled: boolean): Promise<{
    ok: boolean;
    reason: string | null;
    rowIds: readonly string[];
}>;
//# sourceMappingURL=patch-layer.d.ts.map