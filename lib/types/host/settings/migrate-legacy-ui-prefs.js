/**
 * Lift pre-0.1.7 `settings.yaml` section `supanexus` into volatile Config.
 *
 * Engine imports `settings.yaml` by section id → entry id. Our Host entry is
 * `supanexus-core`, so the old `supanexus` section was rejected and left in
 * `settings.yaml.imported` — dropping `showWallet` / `showBrand`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { patchSettings } from "./device.js";
const LEGACY_SECTION = 'supanexus';
const MARKER_FILE = 'supanexus-core-ui-prefs.migrated';
function readLegacyUiPrefs(home) {
    const imported = join(home, 'settings.yaml.imported');
    if (!existsSync(imported))
        return undefined;
    try {
        const doc = parseYaml(readFileSync(imported, 'utf8'));
        const section = doc?.[LEGACY_SECTION];
        if (section === null || typeof section !== 'object' || Array.isArray(section))
            return undefined;
        return section;
    }
    catch {
        return undefined;
    }
}
/**
 * One-shot: copy legacy UI prefs into the live entry when the marker is absent.
 * @param ctx - Host plugin context (needs `settings` + `profileContext`).
 * @param config - Live volatile Config.
 */
export async function migrateLegacyUiPrefs(ctx, config) {
    const profile = ctx.get('profileContext');
    if (profile === undefined)
        return;
    const marker = join(profile.home, MARKER_FILE);
    if (existsSync(marker))
        return;
    const legacy = readLegacyUiPrefs(profile.home);
    const patch = {};
    if (typeof legacy?.showWallet === 'boolean')
        patch.showWallet = legacy.showWallet;
    if (typeof legacy?.showBrand === 'boolean')
        patch.showBrand = legacy.showBrand;
    // No legacy file: still mark done so we do not re-scan every boot.
    if (Object.keys(patch).length === 0) {
        try {
            const { writeFileSync } = await import('node:fs');
            writeFileSync(marker, `${new Date().toISOString()}\n`, 'utf8');
        }
        catch {
            // ignore
        }
        return;
    }
    // Prefer legacy values only when the live volatile still looks unset / defaulted.
    const next = {};
    if (patch.showWallet !== undefined && config.showWallet.get() !== patch.showWallet) {
        next.showWallet = patch.showWallet;
    }
    if (patch.showBrand !== undefined && config.showBrand.get() !== patch.showBrand) {
        next.showBrand = patch.showBrand;
    }
    if (Object.keys(next).length > 0) {
        await patchSettings(ctx, next);
    }
    try {
        const { writeFileSync } = await import('node:fs');
        writeFileSync(marker, `${new Date().toISOString()}\n`, 'utf8');
    }
    catch {
        // ignore
    }
}
//# sourceMappingURL=migrate-legacy-ui-prefs.js.map