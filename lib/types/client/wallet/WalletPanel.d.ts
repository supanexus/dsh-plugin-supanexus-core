import { type WalletBalanceResponse } from '../../shared/wallet-contract.ts';
export interface WalletPanelProps {
    readonly locale: string | undefined;
    readonly onClose: () => void;
    readonly onBalanceChange?: (balance: WalletBalanceResponse | undefined) => void;
}
/** Compact modal: account / subscription tabs + console budget deep link. */
export declare function WalletPanel({ locale, onClose, onBalanceChange }: WalletPanelProps): import("react").JSX.Element;
//# sourceMappingURL=WalletPanel.d.ts.map