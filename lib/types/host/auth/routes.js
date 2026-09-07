/** Host HTTP routes: connection.fetch API + OAuth callback. */
import { randomUUID } from 'node:crypto';
import { apiErr, apiOk, } from "../../shared/auth-contract.js";
import { OAUTH_CALLBACK_PATH } from "../../shared/provider.js";
import { resolveAuthLine } from "../line/resolver.js";
import { ensureDeviceIdentity } from "../settings/device.js";
import { challengeFromVerifier, generateState, generateVerifier, } from "./pkce.js";
import { buildAuthorizeUrl } from "./harness-client.js";
import { createFlow, getFlow, } from "./flow-store.js";
import { handleOAuthCallback } from "./callback.js";
function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
function flowStatus(flow) {
    if (flow.phase === 'done' && flow.result !== undefined) {
        return {
            phase: 'done',
            flowId: flow.flowId,
            line: flow.result.line,
            baseURL: flow.result.baseURL,
            models: flow.result.models,
            credentialRef: flow.result.credentialRef,
        };
    }
    if (flow.phase === 'error') {
        return {
            phase: 'error',
            flowId: flow.flowId,
            message: flow.errorMessage ?? '授权失败。',
        };
    }
    return {
        phase: flow.phase,
        flowId: flow.flowId,
        authorizeUrl: flow.authorizeUrl,
        line: flow.line,
    };
}
/** Register plugin API routes and OAuth callback on the host. */
export function registerAuthRoutes(ctx, config) {
    const redirectUri = () => `http://127.0.0.1:${ctx.webServer.port}${OAUTH_CALLBACK_PATH}`;
    ctx.effect(() => ctx.connection.fetch.register({
        path: '/api/supanexus.auth.start',
        methods: ['GET'],
        requestBody: 'buffered',
        fetch: async (request) => {
            try {
                const url = new URL(request.url);
                const locale = url.searchParams.get('locale') ?? undefined;
                const { winner } = await resolveAuthLine(ctx, config);
                const verifier = generateVerifier();
                const challenge = challengeFromVerifier(verifier);
                const state = generateState();
                const flowId = randomUUID();
                const { deviceName } = await ensureDeviceIdentity(ctx, config);
                const uri = redirectUri();
                const authorizeUrl = buildAuthorizeUrl(winner.line, {
                    redirectUri: uri,
                    codeChallenge: challenge,
                    state,
                    deviceName,
                    ...(locale !== undefined ? { locale } : {}),
                });
                createFlow({
                    flowId,
                    line: winner.line,
                    verifier,
                    state,
                    redirectUri: uri,
                    authorizeUrl,
                    ...(locale !== undefined ? { locale } : {}),
                });
                const body = apiOk({
                    flowId,
                    authorizeUrl,
                    line: winner.line,
                    latencyMs: winner.latencyMs,
                });
                return jsonResponse(body);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '无法启动授权。';
                return jsonResponse(apiErr(message), 400);
            }
        },
    }), 'supanexus: auth.start');
    ctx.effect(() => ctx.connection.fetch.register({
        path: '/api/supanexus.auth.status',
        methods: ['GET'],
        requestBody: 'buffered',
        fetch: async (request) => {
            const flowId = new URL(request.url).searchParams.get('flowId') ?? '';
            const flow = getFlow(flowId);
            if (flow === undefined) {
                return jsonResponse(apiErr('授权流程不存在或已过期。'), 404);
            }
            return jsonResponse(apiOk(flowStatus(flow)));
        },
    }), 'supanexus: auth.status');
    ctx.effect(() => ctx.webServer.register({
        kind: 'exact',
        path: OAUTH_CALLBACK_PATH,
        handler: (req, res) => { void handleOAuthCallback(ctx, config, req, res); },
    }), 'supanexus: oauth callback');
}
//# sourceMappingURL=routes.js.map