/** Locales for the SupaNexus plugin settings card. */
export interface SettingsCardCopy {
    readonly title: string;
    readonly description: string;
    readonly region: string;
    readonly regionHint: string;
    readonly regionGlobal: string;
    readonly regionCn: string;
    readonly regionLocked: string;
    readonly regionLoading: string;
    readonly showWallet: string;
    readonly showWalletHint: string;
    readonly showBrand: string;
    readonly showBrandHint: string;
    readonly readOnly: string;
    readonly expand: string;
    readonly collapse: string;
}
export declare function settingsCardT(locale: string | undefined): (key: keyof SettingsCardCopy) => string;
//# sourceMappingURL=locales.d.ts.map