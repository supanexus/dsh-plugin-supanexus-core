export interface WalletPanelProps {
    readonly locale: string | undefined;
    readonly onClose: () => void;
    readonly onBalanceChange?: (label: string | undefined) => void;
}
/** Compact modal: balance + console budget deep link. */
export declare function WalletPanel({ locale, onClose, onBalanceChange }: WalletPanelProps): import("react").JSX.Element;
//# sourceMappingURL=WalletPanel.d.ts.map