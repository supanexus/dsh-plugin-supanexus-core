/** Compute upgrade hints from operational listing version vs installed package.json. */
import { versionIndicatesUpgrade, } from "../../shared/plugin-market-contract.js";
import { readInstalledPackageVersion } from "./profile-deps.js";
/** Build one upgrade-status row for an installed listing. */
export function buildUpgradeStatusEntry(listing, options) {
    const installedVersion = readInstalledPackageVersion(options.profileName, listing.package_name) ?? null;
    const listingVersion = listing.version?.trim() ?? '';
    const upgradeable = versionIndicatesUpgrade(listingVersion.length > 0 ? listingVersion : null, installedVersion);
    return {
        install_code: listing.install_code,
        upgradeable,
        installed_version: installedVersion,
        listing_version: listingVersion.length > 0 ? listingVersion : null,
    };
}
//# sourceMappingURL=upgrade-status.js.map