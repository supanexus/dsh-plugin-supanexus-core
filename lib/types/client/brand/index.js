import { jsx as _jsx } from "react/jsx-runtime";
import { readShowBrand } from "../settings/useShowWalletPref.js";
import { SupaNexusBrandMark, SupaNexusBrandNameSlot } from "./Brand.js";
import { clearTabBranding, watchTabBrandingPatches } from "./patchShellBranding.js";
/**
 * When `showBrand` is on: occupy brand slots (priority -1 shadows DSH official / shell).
 * When off: dispose occupants so `ui-brand-official` or sidebar fallbacks render again.
 */
export function registerBrand(ctx, scope) {
    ctx.effect(() => {
        let disposeSlots;
        let stopPatches;
        const sync = () => {
            disposeSlots?.();
            disposeSlots = undefined;
            stopPatches?.();
            stopPatches = undefined;
            if (!readShowBrand(scope)) {
                clearTabBranding();
                return;
            }
            stopPatches = watchTabBrandingPatches();
            disposeSlots = ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.inject('sidebar.brand.name', () => ctx.slots.inject('conversation.hero.brand.mark', function* () {
                yield ctx.slots.register({
                    name: 'sidebar.brand.mark',
                    priority: -1,
                    registrant: '@supanexus/dsh-plugin-supanexus-core',
                }, SupaNexusBrandMark);
                yield ctx.slots.register({
                    name: 'sidebar.brand.name',
                    priority: -1,
                    registrant: '@supanexus/dsh-plugin-supanexus-core',
                }, () => _jsx(SupaNexusBrandNameSlot, { ctx: ctx }));
                yield ctx.slots.register({
                    name: 'conversation.hero.brand.mark',
                    priority: -1,
                    registrant: '@supanexus/dsh-plugin-supanexus-core',
                }, SupaNexusBrandMark);
            })));
        };
        sync();
        const unsub = scope.subscribe(sync);
        return () => {
            unsub();
            stopPatches?.();
            disposeSlots?.();
            clearTabBranding();
        };
    }, 'supanexus-core: brand');
}
//# sourceMappingURL=index.js.map