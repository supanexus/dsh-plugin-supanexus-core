/** Local SlotMap augmentation for settings.plugin.item (avoids value-import of ui-settings-plugins). */
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        /** One plugin card in the Plugins settings tab, keyed by settings namespace. */
        'settings.plugin.item': {
            kind: 'keyed';
            scope: 'root';
            owner: {
                children?: never;
            };
        };
    }
}
export {};
//# sourceMappingURL=slot-contract.d.ts.map