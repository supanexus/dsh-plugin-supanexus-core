/** Hero headline DOM patches until official slots ship. */
import { readShowBrand } from "../settings/useShowWalletPref.js";
import { clearHeroChrome, watchHeroChromePatches } from "./patchHeroHeadline.js";
/** Watch and patch hero chrome copy when brand styling is enabled. */
export function registerHero(ctx, scope) {
    ctx.effect(() => {
        let stopPatches;
        const sync = () => {
            stopPatches?.();
            stopPatches = undefined;
            if (readShowBrand(scope)) {
                stopPatches = watchHeroChromePatches();
            }
            else if (typeof document !== 'undefined' && document.body !== null) {
                clearHeroChrome(document.body);
            }
        };
        sync();
        const unsub = scope.subscribe(sync);
        return () => {
            unsub();
            stopPatches?.();
        };
    }, 'supanexus-core: hero-chrome');
}
//# sourceMappingURL=index.js.map