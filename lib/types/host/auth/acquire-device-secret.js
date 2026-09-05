/** Issue a device API key; rotate device_id once when the server withholds plaintext. */
import { ensureDeviceIdentity, rotateDeviceIdentity } from "../settings/device.js";
import { issueDeviceCredential } from "./harness-client.js";
/** Issue device credential; re-issue under a fresh device_id when plaintext is withheld. */
export async function acquireDeviceSecret(ctx, config, line, accessToken, locale) {
    let { deviceId, deviceName } = await ensureDeviceIdentity(ctx, config);
    let credential = await issueDeviceCredential(line, accessToken, { deviceId, deviceName }, locale);
    if (credential.secret.length === 0) {
        const rotated = await rotateDeviceIdentity(ctx, config);
        deviceId = rotated.deviceId;
        deviceName = rotated.deviceName;
        credential = await issueDeviceCredential(line, accessToken, { deviceId, deviceName }, locale);
    }
    if (credential.secret.length === 0) {
        throw new Error('未能获取 API Key，请重新授权。');
    }
    return { secret: credential.secret, credential, deviceId };
}
//# sourceMappingURL=acquire-device-secret.js.map