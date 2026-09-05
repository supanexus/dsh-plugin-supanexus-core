/** Line / region status API shared by Host routes and Client settings. */
import type { SupaLine } from './line.ts';
export declare const LINE_STATUS_PATH: "/api/supanexus.line.status";
/** Where the active auth / region line came from. */
export type AuthLineSource = 'config' | 'user' | 'auto';
/** One selectable region row for the settings UI. */
export interface LineStatusRow {
    readonly id: string;
    readonly label: string;
}
/** Successful line.status response. */
export interface LineStatusResponse {
    readonly lines: readonly LineStatusRow[];
    readonly activeLineId: string;
    readonly source: AuthLineSource;
    readonly latencyMs: number;
    /** True when cordis `config.pinnedLine` locks the region. */
    readonly locked: boolean;
}
/** Map configured lines to UI rows (id + label only). */
export declare function toLineStatusRows(lines: readonly SupaLine[]): readonly LineStatusRow[];
//# sourceMappingURL=line-contract.d.ts.map