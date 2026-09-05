import type { SupaLine } from '../../shared/line.ts';
import { type QuickSetupKey } from './locales.ts';
export interface LineStatusRowProps {
    readonly line: SupaLine | undefined;
    readonly latencyMs: number | undefined;
    readonly locale: string | undefined;
}
/** Show current resolved line and latency. */
export declare function LineStatusRow(props: LineStatusRowProps): import("react").JSX.Element | null;
export type { QuickSetupKey };
//# sourceMappingURL=LineStatusRow.d.ts.map