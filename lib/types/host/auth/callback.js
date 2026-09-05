/** OAuth loopback callback handler (system browser, no session cookie). */
import { credentialRef } from '@deepseek-ai/dsh-credentials';
import { dataPlaneBase } from "../../shared/line.js";
import { CREDENTIAL_REF, REFRESH_CREDENTIAL_REF, } from "../../shared/provider.js";
import { consumeState, completeFlow, failFlow, setPhase, } from "./flow-store.js";
import { exchangeToken, listModels } from "./harness-client.js";
import { acquireDeviceSecret } from "./acquire-device-secret.js";
import { renderErrorPage, renderSuccessPage } from "./callback-page.js";
import { patchSettings } from "../settings/device.js";
/** True when the TCP peer is loopback. */
export function isLoopbackRemote(req) {
    const remote = req.socket.remoteAddress ?? '';
    return remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
}
/** Handle GET /supanexus/oauth/callback?code=&state= */
export async function handleOAuthCallback(ctx, config, req, res) {
    if (!isLoopbackRemote(req)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('forbidden');
        return;
    }
    const host = req.headers.host ?? '127.0.0.1';
    const url = new URL(req.url ?? '/', `http://${host}`);
    const code = url.searchParams.get('code') ?? '';
    const state = url.searchParams.get('state') ?? '';
    if (code.length === 0 || state.length === 0) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderErrorPage('缺少授权参数。'));
        return;
    }
    const flow = consumeState(state);
    if (flow === undefined) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderErrorPage('授权状态无效或已使用，请重新快速配置。'));
        return;
    }
    try {
        setPhase(flow.flowId, 'exchanging');
        const tokens = await exchangeToken(flow.line, {
            code,
            codeVerifier: flow.verifier,
            redirectUri: flow.redirectUri,
        }, flow.locale);
        setPhase(flow.flowId, 'credential');
        const { secret, credential } = await acquireDeviceSecret(ctx, config, flow.line, tokens.accessToken, flow.locale);
        await ctx.credentials.set(credentialRef(CREDENTIAL_REF), secret);
        if (tokens.refreshToken.length > 0) {
            await ctx.credentials.set(credentialRef(REFRESH_CREDENTIAL_REF), tokens.refreshToken);
        }
        const models = await listModels(flow.line, secret);
        const baseURL = dataPlaneBase(flow.line);
        await patchSettings(ctx, {
            apiKeyId: credential.apiKeyId,
            keyPrefix: credential.keyPrefix,
            connectedAt: Math.floor(Date.now() / 1000),
            resolvedLine: flow.line.id,
        });
        completeFlow(flow.flowId, {
            baseURL,
            models,
            credentialRef: CREDENTIAL_REF,
            line: flow.line,
        });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderSuccessPage(flow.locale));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : '授权失败。';
        failFlow(flow.flowId, message);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderErrorPage(message, flow.locale));
    }
}
//# sourceMappingURL=callback.js.map