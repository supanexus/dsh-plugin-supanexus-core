/** Subscribe to boolean preferences from the bound settings scope. */
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts';
/** Effective showWallet (defaults to false while loading / missing). */
export declare function readShowWallet(scope: SettingsScope<SupaNexusUiSettings>): boolean;
/** Effective showBrand (defaults to true while loading / missing). */
export declare function readShowBrand(scope: SettingsScope<SupaNexusUiSettings>): boolean;
/** Active line id for .ai / .io site pick (`resolvedLine` → `pinnedLine` → `global`). */
export declare function readActiveLineId(scope: SettingsScope<SupaNexusUiSettings>): string;
/** React mirror of {@link readShowWallet}. */
export declare function useShowWalletPref(scope: SettingsScope<SupaNexusUiSettings>): boolean;
/** React mirror of {@link readShowBrand}. */
export declare function useShowBrandPref(scope: SettingsScope<SupaNexusUiSettings>): boolean;
/** React mirror of {@link readActiveLineId}. */
export declare function useActiveLineId(scope: SettingsScope<SupaNexusUiSettings>): string;
/** Whether the namespace is ready and accepts writes. */
export declare function useSettingsWritable(scope: SettingsScope<SupaNexusUiSettings>): {
    available: boolean;
    writable: boolean;
};
//# sourceMappingURL=useShowWalletPref.d.ts.map