/**
 * Lift pre-0.1.7 `settings.yaml` section `supanexus` into volatile Config.
 *
 * Engine imports `settings.yaml` by section id → entry id. Our Host entry is
 * `supanexus-core`, so the old `supanexus` section was rejected and left in
 * `settings.yaml.imported` — dropping `showWallet` / `showBrand`.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from '../config.ts';
/**
 * One-shot: copy legacy UI prefs into the live entry when the marker is absent.
 * @param ctx - Host plugin context (needs `settings` + `profileContext`).
 * @param config - Live volatile Config.
 */
export declare function migrateLegacyUiPrefs(ctx: Context, config: Config): Promise<void>;
//# sourceMappingURL=migrate-legacy-ui-prefs.d.ts.map