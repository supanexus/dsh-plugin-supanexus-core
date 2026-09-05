/** Harness gateway HTTP client (envelope parsing + OAuth endpoints). */
import { dataPlaneBase, harnessBase } from "../../shared/line.js";
const USER_MESSAGES = {
    'harness.code_invalid': '授权码无效或已过期，请重新授权。',
    'harness.pkce_mismatch': '授权校验失败，请重新开始快速配置。',
    'harness.invalid_redirect_uri': '回跳地址无效，请检查插件配置。',
    'harness.authorize_request_expired': '授权请求已过期，请重新打开授权页。',
    'harness.session_revoked': '会话已失效，请重新授权。',
    'harness.invalid_input': '请求参数无效。',
    'tenant.no_project_available': '账号暂无可用项目，请前往控制台创建项目。',
    'common.too_many_requests': '请求过于频繁，请稍后重试。',
    'common.unauthenticated': '未授权，请重新登录。',
    'common.upstream_unavailable': '服务暂时不可用，请稍后重试。',
};
/** Map harness error codes to user-facing copy. */
export function messageForCode(code, fallback) {
    return USER_MESSAGES[code] ?? fallback ?? '授权失败，请重试。';
}
async function parseEnvelope(response) {
    const body = await response.json();
    if (body.code !== 'ok') {
        throw new Error(messageForCode(body.code, body.message));
    }
    return body.data;
}
function localeHeaders(locale) {
    if (locale === undefined || locale.length === 0)
        return {};
    const normalized = locale.startsWith('zh') ? 'zh-CN' : 'en-US';
    return {
        'Accept-Language': normalized,
        'X-Locale': normalized,
    };
}
/** Build the browser-opened authorize URL (GET redirect). */
export function buildAuthorizeUrl(line, params) {
    const base = harnessBase(line);
    const url = new URL(`${base}/auth/authorize`);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('code_challenge', params.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', params.state);
    if (params.deviceName !== undefined && params.deviceName.length > 0) {
        url.searchParams.set('device_name', params.deviceName);
    }
    if (params.locale !== undefined && params.locale.length > 0) {
        url.searchParams.set('locale', params.locale.startsWith('zh') ? 'zh-CN' : 'en-US');
    }
    return url.toString();
}
/** Exchange authorization code for harness JWT pair. */
export async function exchangeToken(line, body, locale) {
    const base = harnessBase(line);
    const response = await fetch(`${base}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...localeHeaders(locale) },
        body: JSON.stringify({
            code: body.code,
            code_verifier: body.codeVerifier,
            redirect_uri: body.redirectUri,
        }),
    });
    const data = await parseEnvelope(response);
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
    };
}
/** Issue or reuse device API key. */
export async function issueDeviceCredential(line, accessToken, body, locale) {
    const base = harnessBase(line);
    const response = await fetch(`${base}/devices/credential`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            ...localeHeaders(locale),
        },
        body: JSON.stringify({
            device_id: body.deviceId,
            device_name: body.deviceName,
            project_id: '',
        }),
    });
    const data = await parseEnvelope(response);
    return {
        created: data.created,
        secret: data.secret,
        apiKeyId: data.api_key_id,
        keyPrefix: data.key_prefix,
    };
}
/** Rotate harness JWT pair with a refresh token (old refresh is revoked). */
export async function refreshSession(line, refreshToken, locale) {
    const base = harnessBase(line);
    const response = await fetch(`${base}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...localeHeaders(locale) },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await parseEnvelope(response);
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
    };
}
/** Read organization balance for the device credential. */
export async function fetchWallet(line, accessToken, deviceId, locale) {
    const base = harnessBase(line);
    const url = new URL(`${base}/wallet`);
    url.searchParams.set('device_id', deviceId);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            ...localeHeaders(locale),
        },
    });
    const data = await parseEnvelope(response);
    return {
        organizationId: data.organization_id,
        name: data.name,
        availableBalance: data.available_balance,
        currency: data.currency,
    };
}
/**
 * Map harness `architecture.input_modalities` to pi-ai `input`.
 * Missing modalities default to text-only (safe under-claim).
 */
export function inputFromModalities(modalities) {
    if (modalities === undefined || modalities.length === 0)
        return ['text'];
    const hasImage = modalities.some(item => item === 'image');
    return hasImage ? ['text', 'image'] : ['text'];
}
/** List models from the data plane using the device API key. */
export async function listModels(line, apiKey) {
    const base = dataPlaneBase(line);
    const response = await fetch(`${base}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok)
        return FALLBACK_MODELS;
    const payload = await response.json();
    const models = payload.data ?? [];
    if (models.length === 0)
        return FALLBACK_MODELS;
    return models.map(model => ({
        id: model.id,
        ...model.name === undefined ? {} : { name: model.name },
        input: inputFromModalities(model.architecture?.input_modalities),
    }));
}
/** Minimal fallback when model discovery fails. */
export const FALLBACK_MODELS = [
    {
        id: 'supanexus/default',
        name: 'SupaNexus Default',
        contextWindow: 65536,
        input: ['text'],
    },
];
//# sourceMappingURL=harness-client.js.map