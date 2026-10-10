/** Subscribe to boolean preferences from the bound ConfigForm. */
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts';
/** Effective showWallet (defaults to true while loading / missing). */
export declare function readShowWallet(scope: ConfigForm<SupaNexusUiSettings>): boolean;
/** Effective showBrand (defaults to true while loading / missing). */
export declare function readShowBrand(scope: ConfigForm<SupaNexusUiSettings>): boolean;
/** Active line id for .ai / .io site pick (`pinnedLine` → `resolvedLine` → `global`). */
export declare function readActiveLineId(scope: ConfigForm<SupaNexusUiSettings>): string;
/** React mirror of {@link readShowWallet}. */
export declare function useShowWalletPref(scope: ConfigForm<SupaNexusUiSettings>): boolean;
/** React mirror of {@link readShowBrand}. */
export declare function useShowBrandPref(scope: ConfigForm<SupaNexusUiSettings>): boolean;
/** React mirror of {@link readActiveLineId}. */
export declare function useActiveLineId(scope: ConfigForm<SupaNexusUiSettings>): string;
/** Whether the namespace is ready and accepts writes. */
export declare function useSettingsWritable(scope: ConfigForm<SupaNexusUiSettings>): {
    available: boolean;
    writable: boolean;
};
//# sourceMappingURL=useShowWalletPref.d.ts.map