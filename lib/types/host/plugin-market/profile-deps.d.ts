/** Read installed plugin dependency specs from the active DSH profile. */
/** Resolve Harness home (`$DSH_HOME` or `~/.dsh`). */
export declare function resolveDshHome(): string;
/** Resolve one profile directory under Harness home. */
export declare function resolveProfileDir(profileName: string): string;
/** Installed package.json `version` when the dependency is materialized under the profile. */
export declare function readInstalledPackageVersion(profileName: string, packageName: string): string | undefined;
//# sourceMappingURL=profile-deps.d.ts.map