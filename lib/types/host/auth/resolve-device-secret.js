/** Resolve device API key secret from credential response + optional local store. */
/** Use freshly issued secret, or reuse the locally stored device key when the server reports created=false. */
export async function resolveDeviceSecret(credential, readLocalSecret) {
    if (credential.secret.length > 0)
        return credential.secret;
    if (!credential.created) {
        return (await readLocalSecret()) ?? '';
    }
    return '';
}
//# sourceMappingURL=resolve-device-secret.js.map