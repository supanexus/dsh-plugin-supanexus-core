/** Format wallet amount for sidebar / panel display. */
/** Compact currency label for the sidebar trigger. */
export declare function formatWalletAmount(balance: string | null | undefined, currency: string | null | undefined): string;
/** Compact points label (zh: 积分 / en: pts). */
export declare function formatPointsRemaining(points: string | null | undefined, locale: string | undefined): string;
export interface WalletTriggerLabels {
    readonly balanceLabel: string;
    readonly pointsLabel: string | undefined;
    readonly canRotate: boolean;
}
/** Build sidebar trigger labels; rotate when subscription has remaining points. */
export declare function formatWalletTriggerLabels(balance: {
    readonly availableBalance?: string | null;
    readonly currency?: string | null;
    readonly subscriptionActive?: boolean | null;
    readonly pointsRemaining?: string | null;
}, locale: string | undefined): WalletTriggerLabels;
/** Stable aria/title text listing both amounts when rotating. */
export declare function formatWalletTriggerAria(labels: WalletTriggerLabels, locale: string | undefined): string;
/** Sidebar trigger: prefer points when subscription is active, else USD. */
export declare function formatWalletTriggerLabel(balance: {
    readonly availableBalance?: string | null;
    readonly currency?: string | null;
    readonly subscriptionActive?: boolean | null;
    readonly pointsRemaining?: string | null;
}, locale: string | undefined): string;
/** Format unix seconds for panel secondary rows; empty when unset. */
export declare function formatWalletUnixDate(unixSeconds: number | null | undefined, locale: string | undefined): string | undefined;
//# sourceMappingURL=format.d.ts.map