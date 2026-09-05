import z from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { homedir, hostname, tmpdir } from "node:os";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
//#region lib/types/host/settings/namespace.js
/** `supanexus` settings namespace registration. */
const SUPANEXUS_NS = settingsNamespace("supanexus");
const SupaNexusSettingsSchema = z.object({
	deviceName: z.string().default(""),
	deviceId: z.string().default(""),
	resolvedLine: z.string().default(""),
	resolvedAt: z.number().default(0),
	latencyMs: z.number().default(0),
	pinnedLine: z.string().default(""),
	apiKeyId: z.string().default(""),
	keyPrefix: z.string().default(""),
	connectedAt: z.number().default(0),
	showWallet: z.boolean().default(false),
	showBrand: z.boolean().default(true)
});
const DEFAULT_SETTINGS = {
	deviceName: "",
	deviceId: "",
	resolvedLine: "",
	resolvedAt: 0,
	latencyMs: 0,
	pinnedLine: "",
	apiKeyId: "",
	keyPrefix: "",
	connectedAt: 0,
	showWallet: false,
	showBrand: true
};
/** Register the supanexus settings section when the settings service is available. */
function registerSettingsNamespace(ctx) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(SUPANEXUS_NS, SupaNexusSettingsSchema, { base: DEFAULT_SETTINGS });
	});
}
//#endregion
//#region lib/types/shared/auth-contract.js
function apiOk(data) {
	return {
		ok: true,
		...data
	};
}
function apiErr(message, code) {
	return {
		ok: false,
		message,
		...code === void 0 ? {} : { code }
	};
}
//#endregion
//#region lib/types/shared/provider.js
/** Credential ref written by Host; referenced in provider profile. */
const CREDENTIAL_REF = "SUPANEXUS_API_KEY";
/** Refresh token credential ref (Host-only, not in settings). */
const REFRESH_CREDENTIAL_REF = "SUPANEXUS_REFRESH_TOKEN";
/** OAuth callback path on the local dsh web server (exact route). */
const OAUTH_CALLBACK_PATH = "/supanexus/oauth/callback";
//#endregion
//#region lib/types/shared/line.js
/** Line model and URL derivation — single source of truth for host and client. */
/** Strip trailing slashes from an origin URL. */
function normalizeOrigin(origin) {
	return origin.replace(/\/+$/, "");
}
/** Harness API base for one line (`{harnessOrigin ?? origin}/harness/v1`). */
function harnessBase(line) {
	return `${normalizeOrigin(line.harnessOrigin ?? line.origin)}/harness/v1`;
}
/** OpenAPI data-plane base for provider `baseURL` (`{origin}/v1`). */
function dataPlaneBase(line) {
	return `${normalizeOrigin(line.origin)}/v1`;
}
/** Health probe target (`{origin}/healthz`). */
function probeUrl(line) {
	return `${normalizeOrigin(line.origin)}/healthz`;
}
/** Find a line by id in the configured table. */
function findLine(lines, id) {
	return lines.find((line) => line.id === id);
}
//#endregion
//#region lib/types/host/settings/device.js
/** Stable device identity for harness credential idempotency. */
/** Read the current supanexus settings section or defaults. */
function readSettings(ctx) {
	const settings = ctx.get("settings");
	if (settings === void 0) return { ...DEFAULT_SETTINGS };
	const section = settings.get(SUPANEXUS_NS);
	return section === void 0 ? { ...DEFAULT_SETTINGS } : { ...section };
}
/** Ensure `deviceId` exists and return the effective device display name. */
async function ensureDeviceIdentity(ctx, config) {
	const settings = ctx.get("settings");
	const current = readSettings(ctx);
	const deviceName = config.deviceName.length > 0 ? config.deviceName : current.deviceName.length > 0 ? current.deviceName : hostname();
	if (current.deviceId.length > 0) return {
		deviceId: current.deviceId,
		deviceName
	};
	const deviceId = randomUUID();
	if (settings !== void 0) await settings.update(SUPANEXUS_NS, {
		deviceId,
		deviceName
	});
	return {
		deviceId,
		deviceName
	};
}
/** Allocate a new device id for re-setup when the server no longer returns plaintext. */
async function rotateDeviceIdentity(ctx, config) {
	const settings = ctx.get("settings");
	const current = readSettings(ctx);
	const deviceName = config.deviceName.length > 0 ? config.deviceName : current.deviceName.length > 0 ? current.deviceName : hostname();
	const deviceId = randomUUID();
	if (settings !== void 0) await settings.update(SUPANEXUS_NS, {
		deviceId,
		deviceName
	});
	return {
		deviceId,
		deviceName
	};
}
/** Patch supanexus settings after a successful auth or probe. */
async function patchSettings(ctx, patch) {
	const settings = ctx.get("settings");
	if (settings === void 0) return;
	await settings.update(SUPANEXUS_NS, patch);
}
//#endregion
//#region lib/types/host/line/resolver.js
/** Concurrent /healthz line racing with TTL cache. */
const defaultFetch = (url, signal) => fetch(url, {
	method: "GET",
	signal
});
let cached;
let cacheExpiresAt = 0;
/** Probe one line; any HTTP response counts as reachable. */
async function probeLine(line, timeoutMs, doFetch = defaultFetch) {
	const started = performance.now();
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		await doFetch(probeUrl(line), controller.signal);
		return {
			line,
			latencyMs: Math.round(performance.now() - started),
			reachable: true
		};
	} catch {
		return {
			line,
			latencyMs: null,
			reachable: false
		};
	} finally {
		clearTimeout(timer);
	}
}
function pickWinner(lines, entries) {
	const reachable = entries.filter((entry) => entry.reachable && entry.latencyMs !== null).sort((left, right) => {
		const delta = (left.latencyMs ?? 0) - (right.latencyMs ?? 0);
		if (delta !== 0) return delta;
		return lines.findIndex((line) => line.id === left.line.id) - lines.findIndex((line) => line.id === right.line.id);
	});
	if (reachable.length === 0) throw new Error("两条线路均不可达，请检查网络后重试。");
	const best = reachable[0];
	return {
		line: best.line,
		latencyMs: best.latencyMs ?? 0,
		resolvedAt: Date.now()
	};
}
/** Resolve the best line, honoring pinnedLine and cache unless forced. */
async function resolveLine(ctx, config, options = {}) {
	const settings = readSettings(ctx);
	const pinned = options.pinnedOverride ?? config.pinnedLine ?? settings.pinnedLine;
	const now = Date.now();
	if (!options.force && cached !== void 0 && now < cacheExpiresAt && pinned.length === 0) {
		const hit = cached;
		return {
			winner: hit,
			entries: config.lines.map((line) => ({
				line,
				latencyMs: line.id === hit.line.id ? hit.latencyMs : null,
				reachable: line.id === hit.line.id
			}))
		};
	}
	if (pinned.length > 0) {
		const line = findLine(config.lines, pinned);
		if (line === void 0) throw new Error(`未知线路：${pinned}`);
		const winner = {
			line,
			latencyMs: 0,
			resolvedAt: now
		};
		cached = winner;
		cacheExpiresAt = now + config.probeCacheTtlMs;
		await patchSettings(ctx, {
			resolvedLine: line.id,
			resolvedAt: now,
			latencyMs: 0,
			pinnedLine: pinned
		});
		return {
			winner,
			entries: config.lines.map((entry) => ({
				line: entry,
				latencyMs: entry.id === line.id ? 0 : null,
				reachable: entry.id === line.id
			}))
		};
	}
	const entries = await Promise.all(config.lines.map((line) => probeLine(line, config.probeTimeoutMs, options.doFetch)));
	const winner = pickWinner(config.lines, entries);
	cached = winner;
	cacheExpiresAt = now + config.probeCacheTtlMs;
	await patchSettings(ctx, {
		resolvedLine: winner.line.id,
		resolvedAt: winner.resolvedAt,
		latencyMs: winner.latencyMs
	});
	return {
		winner,
		entries
	};
}
//#endregion
//#region lib/types/host/auth/pkce.js
/** PKCE S256 helpers for harness desktop OAuth. */
const VERIFIER_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
const VERIFIER_LENGTH = 64;
/** RFC 7636 code_verifier: 43–128 unreserved characters. */
function generateVerifier(length = VERIFIER_LENGTH) {
	const bytes = randomBytes(length);
	let out = "";
	for (let i = 0; i < length; i++) out += VERIFIER_ALPHABET[bytes[i] % 66];
	return out;
}
/** Base64url encode without padding. */
function base64UrlEncode(buffer) {
	return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
/** S256 code_challenge from verifier. */
function challengeFromVerifier(verifier) {
	return base64UrlEncode(createHash("sha256").update(verifier).digest());
}
/** Opaque OAuth state parameter. */
function generateState() {
	return base64UrlEncode(randomBytes(32));
}
//#endregion
//#region lib/types/host/auth/harness-client.js
/** Harness gateway HTTP client (envelope parsing + OAuth endpoints). */
const USER_MESSAGES = {
	"harness.code_invalid": "授权码无效或已过期，请重新授权。",
	"harness.pkce_mismatch": "授权校验失败，请重新开始快速配置。",
	"harness.invalid_redirect_uri": "回跳地址无效，请检查插件配置。",
	"harness.authorize_request_expired": "授权请求已过期，请重新打开授权页。",
	"harness.session_revoked": "会话已失效，请重新授权。",
	"harness.invalid_input": "请求参数无效。",
	"tenant.no_project_available": "账号暂无可用项目，请前往控制台创建项目。",
	"common.too_many_requests": "请求过于频繁，请稍后重试。",
	"common.unauthenticated": "未授权，请重新登录。",
	"common.upstream_unavailable": "服务暂时不可用，请稍后重试。"
};
/** Map harness error codes to user-facing copy. */
function messageForCode(code, fallback) {
	return USER_MESSAGES[code] ?? fallback ?? "授权失败，请重试。";
}
async function parseEnvelope(response) {
	const body = await response.json();
	if (body.code !== "ok") throw new Error(messageForCode(body.code, body.message));
	return body.data;
}
function localeHeaders(locale) {
	if (locale === void 0 || locale.length === 0) return {};
	const normalized = locale.startsWith("zh") ? "zh-CN" : "en-US";
	return {
		"Accept-Language": normalized,
		"X-Locale": normalized
	};
}
/** Build the browser-opened authorize URL (GET redirect). */
function buildAuthorizeUrl(line, params) {
	const base = harnessBase(line);
	const url = new URL(`${base}/auth/authorize`);
	url.searchParams.set("redirect_uri", params.redirectUri);
	url.searchParams.set("code_challenge", params.codeChallenge);
	url.searchParams.set("code_challenge_method", "S256");
	url.searchParams.set("state", params.state);
	if (params.deviceName !== void 0 && params.deviceName.length > 0) url.searchParams.set("device_name", params.deviceName);
	if (params.locale !== void 0 && params.locale.length > 0) url.searchParams.set("locale", params.locale.startsWith("zh") ? "zh-CN" : "en-US");
	return url.toString();
}
/** Exchange authorization code for harness JWT pair. */
async function exchangeToken(line, body, locale) {
	const base = harnessBase(line);
	const data = await parseEnvelope(await fetch(`${base}/auth/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...localeHeaders(locale)
		},
		body: JSON.stringify({
			code: body.code,
			code_verifier: body.codeVerifier,
			redirect_uri: body.redirectUri
		})
	}));
	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		expiresIn: data.expires_in
	};
}
/** Issue or reuse device API key. */
async function issueDeviceCredential(line, accessToken, body, locale) {
	const base = harnessBase(line);
	const data = await parseEnvelope(await fetch(`${base}/devices/credential`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
			...localeHeaders(locale)
		},
		body: JSON.stringify({
			device_id: body.deviceId,
			device_name: body.deviceName,
			project_id: ""
		})
	}));
	return {
		created: data.created,
		secret: data.secret,
		apiKeyId: data.api_key_id,
		keyPrefix: data.key_prefix
	};
}
/** Rotate harness JWT pair with a refresh token (old refresh is revoked). */
async function refreshSession(line, refreshToken, locale) {
	const base = harnessBase(line);
	const data = await parseEnvelope(await fetch(`${base}/auth/refresh`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...localeHeaders(locale)
		},
		body: JSON.stringify({ refresh_token: refreshToken })
	}));
	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		expiresIn: data.expires_in
	};
}
/** Read organization balance for the device credential. */
async function fetchWallet(line, accessToken, deviceId, locale) {
	const base = harnessBase(line);
	const url = new URL(`${base}/wallet`);
	url.searchParams.set("device_id", deviceId);
	const data = await parseEnvelope(await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			...localeHeaders(locale)
		}
	}));
	return {
		organizationId: data.organization_id,
		name: data.name,
		availableBalance: data.available_balance,
		currency: data.currency
	};
}
/**
* Map harness `architecture.input_modalities` to pi-ai `input`.
* Missing modalities default to text-only (safe under-claim).
*/
function inputFromModalities(modalities) {
	if (modalities === void 0 || modalities.length === 0) return ["text"];
	return modalities.some((item) => item === "image") ? ["text", "image"] : ["text"];
}
/** List models from the data plane using the device API key. */
async function listModels(line, apiKey) {
	const base = dataPlaneBase(line);
	const response = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
	if (!response.ok) return FALLBACK_MODELS;
	const models = (await response.json()).data ?? [];
	if (models.length === 0) return FALLBACK_MODELS;
	return models.map((model) => ({
		id: model.id,
		...model.name === void 0 ? {} : { name: model.name },
		input: inputFromModalities(model.architecture?.input_modalities)
	}));
}
/** Minimal fallback when model discovery fails. */
const FALLBACK_MODELS = [{
	id: "supanexus/default",
	name: "SupaNexus Default",
	contextWindow: 65536,
	input: ["text"]
}];
//#endregion
//#region lib/types/host/auth/flow-store.js
/** In-memory OAuth flow state (one flow per quick-setup attempt). */
const FLOW_TTL_MS = 6e5;
const flows = /* @__PURE__ */ new Map();
const stateIndex = /* @__PURE__ */ new Map();
function pruneExpired(now = Date.now()) {
	for (const [id, flow] of flows) if (now - flow.createdAt > FLOW_TTL_MS) {
		flows.delete(id);
		stateIndex.delete(flow.state);
	}
}
/** Register a new flow; line is immutable for the lifetime of the flow. */
function createFlow(entry) {
	pruneExpired();
	const flow = {
		...entry,
		phase: "awaiting-approval",
		createdAt: Date.now(),
		consumed: false
	};
	flows.set(flow.flowId, flow);
	stateIndex.set(flow.state, flow.flowId);
	return flow;
}
/** Lookup by flow id. */
function getFlow(flowId) {
	pruneExpired();
	return flows.get(flowId);
}
/** Lookup by OAuth state (callback). */
function getFlowByState(state) {
	pruneExpired();
	const flowId = stateIndex.get(state);
	if (flowId === void 0) return void 0;
	return flows.get(flowId);
}
/** Mark state consumed to prevent replay. */
function consumeState(state) {
	const flow = getFlowByState(state);
	if (flow === void 0 || flow.consumed) return void 0;
	flow.consumed = true;
	return flow;
}
function setPhase(flowId, phase) {
	const flow = flows.get(flowId);
	if (flow !== void 0) flow.phase = phase;
}
function completeFlow(flowId, result) {
	const flow = flows.get(flowId);
	if (flow === void 0) return;
	flow.phase = "done";
	flow.result = result;
}
function failFlow(flowId, message) {
	const flow = flows.get(flowId);
	if (flow === void 0) return;
	flow.phase = "error";
	flow.errorMessage = message;
}
//#endregion
//#region lib/types/host/auth/acquire-device-secret.js
/** Issue a device API key; rotate device_id once when the server withholds plaintext. */
/** Issue device credential; re-issue under a fresh device_id when plaintext is withheld. */
async function acquireDeviceSecret(ctx, config, line, accessToken, locale) {
	let { deviceId, deviceName } = await ensureDeviceIdentity(ctx, config);
	let credential = await issueDeviceCredential(line, accessToken, {
		deviceId,
		deviceName
	}, locale);
	if (credential.secret.length === 0) {
		const rotated = await rotateDeviceIdentity(ctx, config);
		deviceId = rotated.deviceId;
		deviceName = rotated.deviceName;
		credential = await issueDeviceCredential(line, accessToken, {
			deviceId,
			deviceName
		}, locale);
	}
	if (credential.secret.length === 0) throw new Error("未能获取 API Key，请重新授权。");
	return {
		secret: credential.secret,
		credential,
		deviceId
	};
}
//#endregion
//#region lib/types/host/auth/callback-page.js
/** Self-contained OAuth loopback result pages (no external assets). */
const COPY = {
	"zh-CN": {
		success: {
			title: "授权成功",
			message: "SupaNexus 已连接，可以返回应用继续使用。",
			hint: "若窗口未自动关闭，请手动关闭此标签页。",
			autoClose: "窗口将在 {seconds} 秒后自动关闭…"
		},
		error: {
			title: "授权失败",
			message: "未能完成 SupaNexus 快速配置。",
			hint: "请关闭此窗口，返回应用后点击「重新打开授权页」重试。",
			autoClose: ""
		}
	},
	"en-US": {
		success: {
			title: "Authorization complete",
			message: "SupaNexus is connected. You can return to the app.",
			hint: "If this tab does not close automatically, close it manually.",
			autoClose: "This tab will close in {seconds}s…"
		},
		error: {
			title: "Authorization failed",
			message: "SupaNexus quick setup could not be completed.",
			hint: "Close this tab, return to the app, and choose Reopen authorization.",
			autoClose: ""
		}
	}
};
/** Normalize flow locale to a supported callback page language. */
function callbackLocale(locale) {
	return locale?.startsWith("zh") ? "zh-CN" : "en-US";
}
/** Escape text for safe HTML interpolation. */
function escapeHtml(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function pageShell(kind, locale, detail, autoCloseSeconds) {
	const copy = COPY[locale][kind];
	const accent = kind === "success" ? "#1212F9" : "#DC2626";
	const icon = kind === "success" ? "<path d=\"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/>" : "<path d=\"M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/>";
	const countdown = autoCloseSeconds !== void 0 && copy.autoClose.length > 0 ? `<p class="countdown" id="countdown">${escapeHtml(copy.autoClose.replace("{seconds}", String(autoCloseSeconds)))}</p>` : "";
	const autoCloseScript = kind === "success" ? `<script>
(function () {
  var seconds = ${String(autoCloseSeconds ?? 3)};
  var countdown = document.getElementById('countdown');
  function tick() {
    if (countdown) {
      countdown.textContent = ${JSON.stringify(copy.autoClose)}.replace('{seconds}', String(seconds));
    }
    if (seconds <= 0) {
      window.close();
      return;
    }
    seconds -= 1;
    window.setTimeout(tick, 1000);
  }
  window.setTimeout(tick, 1000);
  window.close();
})();
<\/script>` : "";
	return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SupaNexus · ${escapeHtml(copy.title)}</title>
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      color: #0f172a;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background: linear-gradient(180deg, #020617 0%, #0f172a 100%);
        color: #e2e8f0;
      }
      .card { background: #111827; border-color: #1f2937; }
      .detail { color: #cbd5e1; }
      .hint { color: #94a3b8; }
    }
    .card {
      width: min(100%, 420px);
      padding: 28px 24px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      text-align: center;
    }
    .mark {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      border-radius: 12px;
      background: ${accent};
      display: grid;
      place-items: center;
      color: #fff;
    }
    .mark svg { width: 28px; height: 28px; }
    h1 {
      margin: 0 0 8px;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .detail {
      margin: 0 0 8px;
      font-size: 0.95rem;
      line-height: 1.5;
      color: #334155;
    }
    .error-detail {
      margin: 12px 0 0;
      padding: 12px;
      border-radius: 10px;
      background: rgba(220, 38, 38, 0.08);
      color: #b91c1c;
      font-size: 0.875rem;
      line-height: 1.45;
      text-align: left;
      word-break: break-word;
    }
    .hint, .countdown {
      margin: 12px 0 0;
      font-size: 0.8125rem;
      line-height: 1.45;
      color: #64748b;
    }
  </style>
</head>
<body>
  <main class="card" role="main">
    <div class="mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>
    </div>
    <h1>${escapeHtml(copy.title)}</h1>
    <p class="detail">${escapeHtml(copy.message)}</p>
    ${kind === "error" ? `<p class="error-detail">${escapeHtml(detail)}</p>` : ""}
    <p class="hint">${escapeHtml(copy.hint)}</p>
    ${countdown}
  </main>
  ${autoCloseScript}
</body>
</html>`;
}
/** Render the OAuth success page shown after quick setup completes. */
function renderSuccessPage(locale) {
	return pageShell("success", callbackLocale(locale), "", 3);
}
/** Render the OAuth error page with a safe, escaped detail message. */
function renderErrorPage(message, locale) {
	return pageShell("error", callbackLocale(locale), message);
}
//#endregion
//#region lib/types/host/auth/callback.js
/** OAuth loopback callback handler (system browser, no session cookie). */
/** True when the TCP peer is loopback. */
function isLoopbackRemote(req) {
	const remote = req.socket.remoteAddress ?? "";
	return remote === "127.0.0.1" || remote === "::1" || remote === "::ffff:127.0.0.1";
}
/** Handle GET /supanexus/oauth/callback?code=&state= */
async function handleOAuthCallback(ctx, config, req, res) {
	if (!isLoopbackRemote(req)) {
		res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("forbidden");
		return;
	}
	const host = req.headers.host ?? "127.0.0.1";
	const url = new URL(req.url ?? "/", `http://${host}`);
	const code = url.searchParams.get("code") ?? "";
	const state = url.searchParams.get("state") ?? "";
	if (code.length === 0 || state.length === 0) {
		res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
		res.end(renderErrorPage("缺少授权参数。"));
		return;
	}
	const flow = consumeState(state);
	if (flow === void 0) {
		res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
		res.end(renderErrorPage("授权状态无效或已使用，请重新快速配置。"));
		return;
	}
	try {
		setPhase(flow.flowId, "exchanging");
		const tokens = await exchangeToken(flow.line, {
			code,
			codeVerifier: flow.verifier,
			redirectUri: flow.redirectUri
		}, flow.locale);
		setPhase(flow.flowId, "credential");
		const { secret, credential } = await acquireDeviceSecret(ctx, config, flow.line, tokens.accessToken, flow.locale);
		await ctx.credentials.set(credentialRef(CREDENTIAL_REF), secret);
		if (tokens.refreshToken.length > 0) await ctx.credentials.set(credentialRef(REFRESH_CREDENTIAL_REF), tokens.refreshToken);
		const models = await listModels(flow.line, secret);
		const baseURL = dataPlaneBase(flow.line);
		await patchSettings(ctx, {
			apiKeyId: credential.apiKeyId,
			keyPrefix: credential.keyPrefix,
			connectedAt: Math.floor(Date.now() / 1e3),
			resolvedLine: flow.line.id
		});
		completeFlow(flow.flowId, {
			baseURL,
			models,
			credentialRef: CREDENTIAL_REF,
			line: flow.line
		});
		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		res.end(renderSuccessPage(flow.locale));
	} catch (error) {
		const message = error instanceof Error ? error.message : "授权失败。";
		failFlow(flow.flowId, message);
		res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
		res.end(renderErrorPage(message, flow.locale));
	}
}
//#endregion
//#region lib/types/host/auth/routes.js
/** Host HTTP routes: connection.fetch API + OAuth callback. */
function jsonResponse$2(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}
function flowStatus(flow) {
	if (flow.phase === "done" && flow.result !== void 0) return {
		phase: "done",
		flowId: flow.flowId,
		line: flow.result.line,
		baseURL: flow.result.baseURL,
		models: flow.result.models,
		credentialRef: flow.result.credentialRef
	};
	if (flow.phase === "error") return {
		phase: "error",
		flowId: flow.flowId,
		message: flow.errorMessage ?? "授权失败。"
	};
	return {
		phase: flow.phase,
		flowId: flow.flowId,
		authorizeUrl: flow.authorizeUrl,
		line: flow.line
	};
}
/** Register plugin API routes and OAuth callback on the host. */
function registerAuthRoutes(ctx, config) {
	const redirectUri = () => `http://127.0.0.1:${ctx.webServer.port}${OAUTH_CALLBACK_PATH}`;
	ctx.effect(() => ctx.connection.fetch.register({
		path: "/api/supanexus.auth.start",
		methods: ["GET"],
		fetch: async (request) => {
			try {
				const locale = new URL(request.url).searchParams.get("locale") ?? void 0;
				const { winner } = await resolveLine(ctx, config, { force: true });
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
					...locale !== void 0 ? { locale } : {}
				});
				createFlow({
					flowId,
					line: winner.line,
					verifier,
					state,
					redirectUri: uri,
					authorizeUrl,
					...locale !== void 0 ? { locale } : {}
				});
				return jsonResponse$2(apiOk({
					flowId,
					authorizeUrl,
					line: winner.line,
					latencyMs: winner.latencyMs
				}));
			} catch (error) {
				return jsonResponse$2(apiErr(error instanceof Error ? error.message : "无法启动授权。"), 400);
			}
		}
	}), "supanexus: auth.start");
	ctx.effect(() => ctx.connection.fetch.register({
		path: "/api/supanexus.auth.status",
		methods: ["GET"],
		fetch: async (request) => {
			const flow = getFlow(new URL(request.url).searchParams.get("flowId") ?? "");
			if (flow === void 0) return jsonResponse$2(apiErr("授权流程不存在或已过期。"), 404);
			return jsonResponse$2(apiOk(flowStatus(flow)));
		}
	}), "supanexus: auth.status");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: OAUTH_CALLBACK_PATH,
		handler: (req, res) => {
			handleOAuthCallback(ctx, config, req, res);
		}
	}), "supanexus: oauth callback");
}
//#endregion
//#region lib/types/shared/plugin-market-contract.js
/** Plugin plaza (skill market) shared contract — types, paths, install spec helpers. */
const PLUGIN_LISTINGS_PATH = "/api/supanexus.plugin-listings";
const PLUGIN_CATEGORIES_PATH = "/api/supanexus.plugin-categories";
/** GET with `?installCode=` — connection.fetch only supports GET/HEAD. */
const PLUGIN_INSTALL_PATH = "/api/supanexus.plugin-install";
/** GET — loopback-only Host relaunch for web / local dsh web. */
const RESTART_HOST_PATH = "/api/supanexus.restart-host";
/** GET with `?packageName=` — remove an installed plugin from the profile. */
const PLUGIN_UNINSTALL_PATH = "/api/supanexus.plugin-uninstall";
/** GET with `?installCodes=` — batch upgrade hints for installed plugins. */
const PLUGIN_UPGRADE_STATUS_PATH = "/api/supanexus.plugin-upgrade-status";
/** GET with `?installCode=` — fetch remote package.json version at operational ref. */
const PLUGIN_REMOTE_VERSION_PATH = "/api/supanexus.plugin-remote-version";
/** GET with `?packageNames=` — batch enabled/disabled state from user patch layer. */
const PLUGIN_TOGGLE_STATUS_PATH = "/api/supanexus.plugin-toggle-status";
/** GET with `?packageName=&enabled=` — enable/disable via cordis.patch.yml. */
const PLUGIN_TOGGLE_PATH = "/api/supanexus.plugin-toggle";
function formatInstallAttemptsLog(attempts) {
	const blocks = [];
	for (const attempt of attempts) {
		const lines = [`[${attempt.provider}] ${attempt.cliCommand ?? attempt.spec}`];
		if (attempt.stdout !== void 0 && attempt.stdout.trim().length > 0) lines.push(attempt.stdout.trimEnd());
		if (attempt.stderr !== void 0 && attempt.stderr.trim().length > 0) lines.push(attempt.stderr.trimEnd());
		if (!attempt.ok && attempt.message !== void 0 && attempt.message.length > 0) lines.push(attempt.message);
		blocks.push(lines.join("\n"));
	}
	return blocks.join("\n\n");
}
/** Whether skill market may offer uninstall for this listing. */
function canUninstallPlugin(item) {
	if (item.install_code === "supanexus-core") return false;
	if (item.package_name === "@supanexus/dsh-plugin-supanexus-core") return false;
	return !item.package_name.endsWith("dsh-plugin-supanexus-core");
}
/** Whether skill market may offer enable/disable for this listing. */
function canTogglePlugin(item) {
	return canUninstallPlugin(item);
}
function formatCommandLog(run) {
	const lines = [run.cliCommand];
	if (run.stdout !== void 0 && run.stdout.trim().length > 0) lines.push(run.stdout.trimEnd());
	if (run.stderr !== void 0 && run.stderr.trim().length > 0) lines.push(run.stderr.trimEnd());
	if (run.message !== void 0 && run.message.length > 0) lines.push(run.message);
	return lines.join("\n");
}
const PROVIDER_PREFERENCE_CN = [
	"gitee",
	"github",
	"npm"
];
const PROVIDER_PREFERENCE_GLOBAL = [
	"github",
	"gitee",
	"npm"
];
function listRepositories(item) {
	if (item.repositories !== void 0 && item.repositories.length > 0) return item.repositories;
	if (item.repository !== void 0) return [item.repository];
	return [];
}
/** 按线路偏好排出候选渠道；cn 优先 gitee，global 优先 github。 */
function orderRepositories(item, lineId) {
	const repos = listRepositories(item);
	if (repos.length === 0) return [];
	const order = lineId === "cn" ? PROVIDER_PREFERENCE_CN : PROVIDER_PREFERENCE_GLOBAL;
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const provider of order) {
		const hit = repos.find((r) => r.provider === provider);
		if (hit !== void 0 && !seen.has(hit.provider)) {
			seen.add(hit.provider);
			out.push(hit);
		}
	}
	for (const repo of repos) if (!seen.has(repo.provider)) out.push(repo);
	return out;
}
/** 单渠道 → `dsh plugin add` spec。 */
function buildInstallSpecFor(repo, installCode) {
	const repoUrl = repo.url?.trim() ?? "";
	if (repoUrl.length === 0) return installCode;
	try {
		const u = new URL(repoUrl);
		if (u.hostname === "github.com" || u.hostname === "www.github.com") {
			const slug = u.pathname.replace(/^\/+/, "").replace(/\.git$/, "");
			const ref = repo.default_ref?.trim();
			return ref !== void 0 && ref.length > 0 ? `github:${slug}#${ref}` : `github:${slug}`;
		}
		if (u.hostname === "gitee.com" || u.hostname === "www.gitee.com") {
			const slug = u.pathname.replace(/^\/+/, "").replace(/\.git$/, "");
			const ref = repo.default_ref?.trim();
			return ref !== void 0 && ref.length > 0 ? `gitee:${slug}#${ref}` : `gitee:${slug}`;
		}
	} catch {}
	return installCode;
}
/** Full CLI command shown to users (profile placeholder). */
function buildCliInstallCommand(spec, profile = "web") {
	return `dsh plugin --profile ${profile} add ${spec}`;
}
/** Full CLI remove command shown to users (profile placeholder). */
function buildCliRemoveCommand(packageName, profile = "web") {
	return `dsh plugin --profile ${profile} remove ${packageName}`;
}
/** Parse `major.minor.patch` with optional leading `v` and pre-release suffix. */
function parseSemver(version) {
	const trimmed = version.trim();
	const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(trimmed);
	if (match === null) return null;
	return [
		Number(match[1]),
		Number(match[2]),
		Number(match[3]),
		match[4] ?? ""
	];
}
/** Compare two semver strings; returns null when either side is invalid. */
function compareSemver(left, right) {
	const a = parseSemver(left);
	const b = parseSemver(right);
	if (a === null || b === null) return null;
	if (a[0] !== b[0]) return a[0] - b[0];
	if (a[1] !== b[1]) return a[1] - b[1];
	if (a[2] !== b[2]) return a[2] - b[2];
	if (a[3] === b[3]) return 0;
	if (a[3] === "") return 1;
	if (b[3] === "") return -1;
	return a[3].localeCompare(b[3]);
}
/** Whether the operational listing version is strictly newer than the installed version. */
function versionIndicatesUpgrade(listingVersion, installedVersion) {
	const listing = listingVersion?.trim() ?? "";
	const installed = installedVersion?.trim() ?? "";
	if (listing.length === 0 || installed.length === 0) return false;
	const cmp = compareSemver(listing, installed);
	return cmp !== null && cmp > 0;
}
/** Operational default_ref from the first repository candidate on the active line. */
function primaryTargetRef(item, lineId) {
	const [first] = orderRepositories(item, lineId);
	return first?.default_ref?.trim() ?? "";
}
//#endregion
//#region lib/types/host/plugin-market/catalog-origin.js
/** Resolve gateway-client / console base URLs per active line. */
/**
* Plugin listings live on gateway-client (`/api/v1/public/plugin-listings`),
* while `line.origin` is often gateway-openapi (`/v1` models) in local dev.
*
* Priority: line.pluginCatalogOrigin → top-level pluginCatalogOrigin →
* local `:31002` → `:31000` heuristic → line.origin.
*/
function resolvePluginCatalogOrigin(config, line) {
	const fromLine = line.pluginCatalogOrigin?.trim() ?? "";
	if (fromLine.length > 0) return normalizeOrigin(fromLine);
	const configured = config.pluginCatalogOrigin.trim();
	if (configured.length > 0) return normalizeOrigin(configured);
	const origin = normalizeOrigin(line.origin);
	try {
		const url = new URL(origin);
		if ((url.hostname === "127.0.0.1" || url.hostname === "localhost") && url.port === "31002") {
			url.port = "31000";
			return url.origin;
		}
		if (url.port === "31002") {
			url.port = "31000";
			return url.origin;
		}
	} catch {}
	return origin;
}
/**
* Console spend-budget deep link base.
* Priority: line.consoleOrigin → top-level consoleOrigin → empty (caller must handle).
*/
function resolveConsoleOrigin(config, line) {
	const fromLine = line.consoleOrigin?.trim() ?? "";
	if (fromLine.length > 0) return normalizeOrigin(fromLine);
	const configured = config.consoleOrigin.trim();
	if (configured.length > 0) return normalizeOrigin(configured);
	return "";
}
//#endregion
//#region lib/types/host/plugin-market/gateway-client.js
/** Fetch plugin plaza public API on gateway-client (line.origin). */
async function readGatewayJson(response) {
	const text = await response.text();
	let body;
	try {
		body = JSON.parse(text);
	} catch {
		const snippet = text.trim().slice(0, 160);
		throw new Error(snippet.length > 0 ? snippet : `HTTP ${String(response.status)}`);
	}
	if (!response.ok || body.code !== "ok" || body.data === void 0) {
		const message = typeof body.message === "string" && body.message.length > 0 ? body.message : `HTTP ${String(response.status)}`;
		throw new Error(message);
	}
	return body.data;
}
/** List published plugin listings. */
async function fetchPublicListings(origin, params) {
	const url = `${normalizeOrigin(origin)}/api/v1/public/plugin-listings?${params.toString()}`;
	return readGatewayJson(await fetch(url, { method: "GET" }));
}
/** Fetch one listing by install code. */
async function fetchListingByCode(origin, installCode, locale) {
	const base = normalizeOrigin(origin);
	const params = new URLSearchParams();
	if (locale !== void 0 && locale.length > 0) params.set("locale", locale);
	const qs = params.size > 0 ? `?${params.toString()}` : "";
	const url = `${base}/api/v1/public/plugin-listings/by-code/${encodeURIComponent(installCode)}${qs}`;
	return readGatewayJson(await fetch(url, { method: "GET" }));
}
/** List published plugin categories. */
async function fetchPublicCategories(origin, params) {
	const url = `${normalizeOrigin(origin)}/api/v1/public/plugin-categories?${params.toString()}`;
	return readGatewayJson(await fetch(url, { method: "GET" }));
}
//#endregion
//#region lib/types/host/plugin-market/remote-package-json.js
/** Fetch plugin package.json from Git hosting at an operational ref. */
function githubSlug(repoUrl) {
	try {
		const u = new URL(repoUrl);
		if (u.hostname !== "github.com" && u.hostname !== "www.github.com") return void 0;
		return u.pathname.replace(/^\/+/, "").replace(/\.git$/, "");
	} catch {
		return;
	}
}
function giteeSlug(repoUrl) {
	try {
		const u = new URL(repoUrl);
		if (u.hostname !== "gitee.com" && u.hostname !== "www.gitee.com") return void 0;
		return u.pathname.replace(/^\/+/, "").replace(/\.git$/, "");
	} catch {
		return;
	}
}
/** Build a raw package.json URL for one repository channel and ref. */
function buildRemotePackageJsonUrl(repo, ref) {
	const repoUrl = repo.url?.trim() ?? "";
	if (repoUrl.length === 0) return void 0;
	const targetRef = ref.trim().length > 0 ? ref.trim() : "HEAD";
	if (repo.provider === "github") {
		const slug = githubSlug(repoUrl);
		if (slug === void 0) return void 0;
		return `https://raw.githubusercontent.com/${slug}/${targetRef}/package.json`;
	}
	if (repo.provider === "gitee") {
		const slug = giteeSlug(repoUrl);
		if (slug === void 0) return void 0;
		return `https://gitee.com/${slug}/raw/${targetRef}/package.json`;
	}
}
/** Fetch and parse remote package.json; tries candidates in order. */
async function fetchRemotePackageManifest(candidates, targetRef, fetchImpl = fetch) {
	for (const repo of candidates) {
		const url = buildRemotePackageJsonUrl(repo, targetRef);
		if (url === void 0) continue;
		try {
			const response = await fetchImpl(url, { method: "GET" });
			if (!response.ok) continue;
			const body = await response.json();
			const version = body.version?.trim();
			const name = body.name?.trim();
			if (version === void 0 || version.length === 0) continue;
			if (name === void 0 || name.length === 0) continue;
			return {
				name,
				version,
				provider: repo.provider
			};
		} catch {}
	}
}
//#endregion
//#region lib/types/host/plugin-market/install-runner.js
/** Run `dsh plugin add` from the Host process. */
function nodeProcess$1() {
	return process;
}
function envString(key) {
	const value = nodeProcess$1().env[key];
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
/** Resolve CLI entry for `node <entry> plugin --profile …`. */
function resolveCliEntry(config) {
	if (config.dshCliEntry.length > 0) {
		if (!existsSync(config.dshCliEntry)) throw new Error(`DSH CLI 入口不存在：${config.dshCliEntry}`);
		return config.dshCliEntry;
	}
	const fromEnv = envString("DSH_CLI_ENTRY");
	if (fromEnv !== void 0 && existsSync(fromEnv)) return fromEnv;
	const workdir = nodeProcess$1().cwd();
	const candidates = [
		join(workdir, "apps/cli/lib/bin.js"),
		join(workdir, "engine/apps/cli/lib/bin.js"),
		join(workdir, "../engine/apps/cli/lib/bin.js"),
		join(workdir, "../../engine/apps/cli/lib/bin.js")
	];
	for (const candidate of candidates) if (existsSync(candidate)) return candidate;
	throw new Error("DSH CLI 未找到。请设置 DSH_CLI_ENTRY 或先在 engine 目录执行 pnpm run build。");
}
/** Resolve Node binary for spawning the CLI. */
function resolveNodeBinary() {
	return envString("WHALE_DSH_NODE") ?? envString("DSH_NODE") ?? nodeProcess$1().execPath;
}
/** Execute profile plugin install via staged CLI. */
function runProfilePluginInstall(config, spec) {
	return runProfilePluginCommand(config, "add", spec);
}
/** Execute profile plugin remove via staged CLI. */
function runProfilePluginRemove(config, packageName) {
	return runProfilePluginCommand(config, "remove", packageName);
}
function runProfilePluginCommand(config, subcommand, target) {
	const cliEntry = resolveCliEntry(config);
	const nodeBinary = resolveNodeBinary();
	const profile = config.profileName;
	const engineCwd = join(cliEntry, "..", "..", "..");
	const args = [
		cliEntry,
		"plugin",
		"--profile",
		profile,
		subcommand,
		target
	];
	const cliCommand = `${nodeBinary} ${args.join(" ")}`;
	const result = spawnSync(nodeBinary, args, {
		cwd: existsSync(engineCwd) ? engineCwd : nodeProcess$1().cwd(),
		encoding: "utf8",
		shell: nodeProcess$1().platform === "win32"
	});
	const exitCode = result.status ?? 1;
	const stderr = typeof result.stderr === "string" ? result.stderr : "";
	const stdout = typeof result.stdout === "string" ? result.stdout : "";
	if (result.error !== void 0) {
		if (result.error.code === "ENOENT") return {
			ok: false,
			exitCode: 127,
			stderr: "pnpm 或 node 未找到，请确认已安装 pnpm 并可在 PATH 中调用。",
			stdout,
			cliCommand
		};
		return {
			ok: false,
			exitCode,
			stderr: result.error.message,
			stdout,
			cliCommand
		};
	}
	return {
		ok: exitCode === 0,
		exitCode,
		stderr,
		stdout,
		cliCommand
	};
}
//#endregion
//#region lib/types/host/plugin-market/profile-deps.js
/** Read installed plugin dependency specs from the active DSH profile. */
const DSH_HOME_ENV = "DSH_HOME";
function expandHomePath(path) {
	if (path === "~") return homedir();
	if (path.startsWith("~/") || path.startsWith("~\\")) return join(homedir(), path.slice(2));
	return path;
}
/** Resolve Harness home (`$DSH_HOME` or `~/.dsh`). */
function resolveDshHome() {
	const fromEnv = process.env[DSH_HOME_ENV];
	if (fromEnv !== void 0 && fromEnv.trim().length > 0) return resolve(expandHomePath(fromEnv.trim()));
	return join(homedir(), ".dsh");
}
/** Resolve one profile directory under Harness home. */
function resolveProfileDir(profileName) {
	return join(resolveDshHome(), "profiles", profileName);
}
function packageInstallDir(profileDir, packageName) {
	if (packageName.startsWith("@")) {
		const slash = packageName.indexOf("/");
		return join(profileDir, "node_modules", packageName.slice(0, slash), packageName.slice(slash + 1));
	}
	return join(profileDir, "node_modules", packageName);
}
/** Installed package.json `version` when the dependency is materialized under the profile. */
function readInstalledPackageVersion(profileName, packageName) {
	const profileDir = resolveProfileDir(profileName);
	const packageJsonPath = join(packageInstallDir(profileDir, packageName), "package.json");
	if (!existsSync(packageJsonPath)) return void 0;
	try {
		const version = JSON.parse(readFileSync(packageJsonPath, "utf8")).version?.trim();
		return version !== void 0 && version.length > 0 ? version : void 0;
	} catch {
		return;
	}
}
//#endregion
//#region lib/types/host/plugin-market/patch-layer.js
/**
* Profile user patch layer toggles — write `disabled: true|false` into
* `cordis.patch.yml` (ported in simplified form from dsh-market / dsh-plugin-hub).
*/
const ROW_ID_RE = /^[A-Za-z0-9_.-]+$/u;
let writeQueue = Promise.resolve();
function queuedWrite(fn) {
	const run = writeQueue.then(fn, fn);
	writeQueue = run.then(() => void 0, () => void 0);
	return run;
}
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
function rowBlock(rowId, disabled) {
	return `- id: ${rowId}\n  disabled: ${disabled ? "true" : "false"}\n`;
}
/** Line-wise scan of disable/force rows in the user patch layer. */
function readUserPatchState(patchPath) {
	const disables = [];
	const forced = [];
	let text = "";
	try {
		text = readFileSync(patchPath, "utf8");
	} catch {
		return {
			disables,
			forced
		};
	}
	const lines = text.split(/\r?\n/u);
	for (let index = 0; index < lines.length; index += 1) {
		const disableRow = /^- id: ([A-Za-z0-9_.-]+)\s*$/u.exec(lines[index] ?? "");
		if (disableRow === null) continue;
		const next = lines[index + 1] ?? "";
		if (/^ {2}disabled: true\s*$/u.test(next)) {
			const rowId = disableRow[1];
			if (rowId !== void 0) disables.push(rowId);
		} else if (/^ {2}disabled: false\s*$/u.test(next)) {
			const rowId = disableRow[1];
			if (rowId !== void 0) forced.push(rowId);
		}
	}
	return {
		disables,
		forced
	};
}
/** Insert row ids declared by a package bundle patch. */
function bundleInsertIds(profileDir, packageName) {
	const packageDir = join(profileDir, "node_modules", ...packageName.split("/"));
	const ids = /* @__PURE__ */ new Set();
	const patchPaths = [];
	try {
		const declared = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")).dsh?.bundle?.patch?.trim();
		if (declared !== void 0 && declared.length > 0) patchPaths.push(join(packageDir, declared));
	} catch {}
	patchPaths.push(join(packageDir, "cordis.patch.yml"));
	for (const patchPath of patchPaths) {
		if (!existsSync(patchPath)) continue;
		try {
			const text = readFileSync(patchPath, "utf8");
			let inInsert = false;
			for (const line of text.split(/\r?\n/u)) {
				if (/^- insert:\s*$/u.test(line)) {
					inInsert = true;
					continue;
				}
				if (/^- /u.test(line)) inInsert = false;
				if (!inInsert) continue;
				const match = /^ {4}- id: ([A-Za-z0-9_.-]+)/u.exec(line);
				if (match?.[1] !== void 0) ids.add(match[1]);
			}
		} catch {}
	}
	return [...ids];
}
function withPlaceholderRestored(text) {
	if (text.replace(/^[ \t]*#.*$/gmu, "").trim() !== "") return text;
	const uncommented = text.replace(/^[ \t]*#[ \t]*\[[ \t]*\][ \t]*(?:\r?\n|$)/mu, "[]\n");
	if (uncommented !== text) return uncommented;
	return text === "" || text.endsWith("\n") ? `${text}[]\n` : `${text}\n[]\n`;
}
function appendPatchEntry(patchPath, block) {
	let text = "";
	try {
		text = readFileSync(patchPath, "utf8");
	} catch {}
	if (text.trim() === "") {
		writeFileSync(patchPath, block);
		return {
			ok: true,
			reason: null
		};
	}
	const withoutComments = text.replace(/^[ \t]*#.*$/gmu, "").trim();
	if (withoutComments === "") {
		const next = text.endsWith("\n") ? text : `${text}\n`;
		writeFileSync(patchPath, `${next}${block}`);
		return {
			ok: true,
			reason: null
		};
	}
	if (withoutComments === "[]" || withoutComments === "[ ]") {
		const commented = text.replace(/^[ \t]*\[[ \t]*\][ \t]*(?:#.*)?(?:\r?\n|$)/mu, "# []\n");
		const next = commented.endsWith("\n") ? commented : `${commented}\n`;
		writeFileSync(patchPath, `${next}${block}`);
		return {
			ok: true,
			reason: null
		};
	}
	const next = text.endsWith("\n") ? text : `${text}\n`;
	writeFileSync(patchPath, `${next}${block}`);
	return {
		ok: true,
		reason: null
	};
}
function disableRow(patchPath, rowId) {
	return queuedWrite(async () => {
		if (!ROW_ID_RE.test(rowId)) return {
			ok: false,
			reason: `行 id 含特殊字符 / invalid row id ${rowId}`
		};
		if (readUserPatchState(patchPath).disables.includes(rowId)) return {
			ok: true,
			reason: null
		};
		return appendPatchEntry(patchPath, rowBlock(rowId, true));
	});
}
function enableRow(patchPath, rowId) {
	return queuedWrite(async () => {
		if (!ROW_ID_RE.test(rowId)) return {
			ok: false,
			reason: `行 id 含特殊字符 / invalid row id ${rowId}`
		};
		const blockRe = new RegExp(`^- id: ['\"]?${escapeRegExp(rowId)}['\"]?\\r?\\n  disabled: true\\r?\\n`, "mu");
		const text = (() => {
			try {
				return readFileSync(patchPath, "utf8");
			} catch {
				return "";
			}
		})();
		if (blockRe.test(text)) {
			writeFileSync(patchPath, withPlaceholderRestored(text.replace(blockRe, "")));
			return {
				ok: true,
				reason: null
			};
		}
		if (readUserPatchState(patchPath).forced.includes(rowId)) return {
			ok: true,
			reason: null
		};
		return appendPatchEntry(patchPath, rowBlock(rowId, false));
	});
}
function packageEnabled(profileName, packageName) {
	const profileDir = resolveProfileDir(profileName);
	const patchPath = join(profileDir, "cordis.patch.yml");
	const rowIds = bundleInsertIds(profileDir, packageName);
	if (rowIds.length === 0) return {
		enabled: true,
		rowIds
	};
	const state = readUserPatchState(patchPath);
	const disabled = rowIds.some((id) => state.disables.includes(id));
	return {
		enabled: rowIds.some((id) => state.forced.includes(id)) || !disabled,
		rowIds
	};
}
async function setPackageEnabled(profileName, packageName, enabled) {
	const profileDir = resolveProfileDir(profileName);
	const patchPath = join(profileDir, "cordis.patch.yml");
	const rowIds = bundleInsertIds(profileDir, packageName);
	if (rowIds.length === 0) return {
		ok: false,
		reason: "该插件没有可开关的 bundle 行 / no bundle rows to toggle",
		rowIds
	};
	let last = {
		ok: true,
		reason: null
	};
	for (const rowId of rowIds) {
		const result = enabled ? await enableRow(patchPath, rowId) : await disableRow(patchPath, rowId);
		if (!result.ok) last = result;
	}
	return {
		...last,
		rowIds
	};
}
//#endregion
//#region lib/types/host/plugin-market/restart-host.js
/** Relaunch the current dsh Host process (loopback-only API). */
const LOOPBACK_HOSTS = /* @__PURE__ */ new Set([
	"127.0.0.1",
	"localhost",
	"::1"
]);
/** node:http bridge rewrites request URLs to this internal origin. */
const INTERNAL_BRIDGE_HOST = "dsh.internal";
const HELPER_DELAY_MS = 1500;
const PARENT_EXIT_DELAY_MS = 500;
function parseHostname(host) {
	const trimmed = host.trim().toLowerCase();
	if (trimmed.startsWith("[")) {
		const end = trimmed.indexOf("]");
		return end >= 0 ? trimmed.slice(1, end) : trimmed;
	}
	return trimmed.split(":")[0] ?? trimmed;
}
/** Hostname the caller intended to reach (bridge-aware). */
function resolveRequestHostname(request) {
	const urlHost = new URL(request.url).hostname.toLowerCase();
	if (urlHost !== INTERNAL_BRIDGE_HOST) return urlHost;
	const headerHost = request.headers.get("host")?.trim();
	if (headerHost === void 0 || headerHost.length === 0) return urlHost;
	return parseHostname(headerHost);
}
function nodeProcess() {
	return process;
}
/** The exact boot invocation the detached restart helper replays. */
function restartLaunch() {
	const proc = nodeProcess();
	return {
		file: proc.execPath,
		args: proc.argv.slice(1),
		cwd: proc.cwd(),
		viaShell: proc.platform === "win32"
	};
}
/** Platform-correct spawn invocation for the replacement host. */
function respawnInvocation(launch, platform = nodeProcess().platform) {
	if (platform !== "win32") return {
		file: launch.file,
		args: launch.args,
		viaShell: launch.viaShell,
		detached: true
	};
	const quote = (part) => `'${part.replace(/'/g, "''")}'`;
	return {
		file: "powershell.exe",
		args: [
			"-NoProfile",
			"-WindowStyle",
			"Hidden",
			"-Command",
			[`& ${quote(launch.file)}`, ...launch.args.map(quote)].join(" ")
		],
		viaShell: false,
		detached: false
	};
}
/** Reject proxied or non-loopback restart requests. */
function isDirectLoopbackRequest(request) {
	const host = resolveRequestHostname(request);
	if (!LOOPBACK_HOSTS.has(host)) return false;
	const forwardedFor = request.headers.get("x-forwarded-for")?.trim();
	if (forwardedFor !== void 0 && forwardedFor.length > 0) return false;
	const forwardedHost = request.headers.get("x-forwarded-host")?.trim();
	if (forwardedHost !== void 0 && forwardedHost.length > 0) return false;
	const forwardedProto = request.headers.get("x-forwarded-proto")?.trim();
	if (forwardedProto !== void 0 && forwardedProto.length > 0) return false;
	const forwarded = request.headers.get("forwarded")?.trim();
	if (forwarded !== void 0 && forwarded.length > 0) return false;
	return true;
}
/**
* Spawn a detached helper that waits for this process to exit and free its port,
* then relaunch dsh with the same argv/env/cwd.
*/
function scheduleHostRelaunch(kill = (pid, signal) => {
	nodeProcess().kill(pid, signal);
}) {
	const proc = nodeProcess();
	const launch = restartLaunch();
	const spawned = respawnInvocation(launch);
	const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
	const logOut = join(tmpdir(), `supanexus-restart-${stamp}.out.log`);
	const logErr = join(tmpdir(), `supanexus-restart-${stamp}.err.log`);
	const helperCode = [
		"const { spawn } = require('node:child_process')",
		"const fs = require('node:fs')",
		`const file = ${JSON.stringify(spawned.file)}`,
		`const args = ${JSON.stringify(spawned.args)}`,
		`const cwd = ${JSON.stringify(launch.cwd)}`,
		`const viaShell = ${JSON.stringify(spawned.viaShell)}`,
		`const detached = ${JSON.stringify(spawned.detached)}`,
		`const logOut = ${JSON.stringify(logOut)}`,
		`const logErr = ${JSON.stringify(logErr)}`,
		`setTimeout(() => {`,
		"  try {",
		"    const out = fs.openSync(logOut, 'a')",
		"    const err = fs.openSync(logErr, 'a')",
		"    const child = spawn(file, args, { cwd, detached, stdio: ['ignore', out, err], env: process.env, shell: viaShell })",
		"    child.unref()",
		"  } catch {}",
		`}, ${String(HELPER_DELAY_MS)})`
	].join("\n");
	const helper = spawn(proc.execPath, ["-e", helperCode], {
		detached: true,
		stdio: "ignore",
		env: proc.env
	});
	helper.unref();
	setTimeout(() => {
		kill(proc.pid, "SIGTERM");
	}, PARENT_EXIT_DELAY_MS);
	return {
		pid: proc.pid,
		helperPid: helper.pid,
		logOut,
		logErr
	};
}
//#endregion
//#region lib/types/host/plugin-market/upgrade-status.js
/** Compute upgrade hints from operational listing version vs installed package.json. */
/** Build one upgrade-status row for an installed listing. */
function buildUpgradeStatusEntry(listing, options) {
	const installedVersion = readInstalledPackageVersion(options.profileName, listing.package_name) ?? null;
	const listingVersion = listing.version?.trim() ?? "";
	const upgradeable = versionIndicatesUpgrade(listingVersion.length > 0 ? listingVersion : null, installedVersion);
	return {
		install_code: listing.install_code,
		upgradeable,
		installed_version: installedVersion,
		listing_version: listingVersion.length > 0 ? listingVersion : null
	};
}
//#endregion
//#region lib/types/host/plugin-market/routes.js
/** Host HTTP routes: plugin plaza proxy + install bridge. */
function jsonResponse$1(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}
function normalizeLocale(raw) {
	if (raw !== null && raw.startsWith("zh")) return "zh-CN";
	if (raw === "zh-CN" || raw === "en-US") return raw;
	return raw !== null && raw.length > 0 ? raw : "zh-CN";
}
function formatInstallError(run) {
	if (run.stderr.includes("allowBuilds")) return run.stderr;
	return run.stderr.trim().length > 0 ? run.stderr.trim() : `安装失败（退出码 ${String(run.exitCode)}）`;
}
function tryInstallWithFallback(config, listing, candidates) {
	const attempts = [];
	for (const repo of candidates) {
		const spec = buildInstallSpecFor(repo, listing.install_code);
		const run = runProfilePluginInstall(config, spec);
		const attemptBase = {
			provider: repo.provider,
			spec,
			cliCommand: run.cliCommand,
			stdout: run.stdout,
			stderr: run.stderr
		};
		if (run.ok) {
			const successAttempts = [...attempts, {
				...attemptBase,
				ok: true
			}];
			return { success: {
				ok: true,
				spec,
				packageName: listing.package_name,
				provider: repo.provider,
				needsRestart: true,
				cliCommand: buildCliInstallCommand(spec, config.profileName),
				attempts: successAttempts
			} };
		}
		attempts.push({
			...attemptBase,
			ok: false,
			message: formatInstallError(run)
		});
	}
	const summary = attempts.map((a) => `${a.provider}: ${a.message ?? "failed"}`).join("; ");
	return {
		failure: summary.length > 0 ? summary : "所有渠道安装均失败。",
		attempts
	};
}
/** Register plugin market Host API routes. */
function registerPluginMarketRoutes(ctx, config) {
	ctx.effect(() => ctx.connection.fetch.register({
		path: PLUGIN_LISTINGS_PATH,
		methods: ["GET"],
		fetch: async (request) => {
			try {
				const url = new URL(request.url);
				const { winner } = await resolveLine(ctx, config);
				const catalogOrigin = resolvePluginCatalogOrigin(config, winner.line);
				const params = new URLSearchParams(url.searchParams);
				if (!params.has("locale")) params.set("locale", normalizeLocale(url.searchParams.get("locale")));
				return jsonResponse$1(apiOk(await fetchPublicListings(catalogOrigin, params)));
			} catch (error) {
				return jsonResponse$1(apiErr(error instanceof Error ? error.message : "无法加载插件列表。"), 400);
			}
		}
	}), "supanexus: plugin-listings");
	ctx.effect(() => ctx.connection.fetch.register({
		path: PLUGIN_CATEGORIES_PATH,
		methods: ["GET"],
		fetch: async (request) => {
			try {
				const url = new URL(request.url);
				const { winner } = await resolveLine(ctx, config);
				const catalogOrigin = resolvePluginCatalogOrigin(config, winner.line);
				const params = new URLSearchParams(url.searchParams);
				if (!params.has("locale")) params.set("locale", normalizeLocale(url.searchParams.get("locale")));
				return jsonResponse$1(apiOk(await fetchPublicCategories(catalogOrigin, params)));
			} catch (error) {
				return jsonResponse$1(apiErr(error instanceof Error ? error.message : "无法加载插件分类。"), 400);
			}
		}
	}), "supanexus: plugin-categories");
	ctx.effect(() => ctx.connection.fetch.register({
		path: PLUGIN_INSTALL_PATH,
		methods: ["GET"],
		fetch: async (request) => {
			try {
				const url = new URL(request.url);
				if (url.searchParams.get("action")?.trim() === "restart") {
					if (!isDirectLoopbackRequest(request)) return jsonResponse$1(apiErr("仅允许本机 loopback 请求重启 Host。"), 403);
					scheduleHostRelaunch();
					return jsonResponse$1(apiOk({ restarting: true }), 202);
				}
				const installCode = url.searchParams.get("installCode")?.trim() ?? "";
				if (installCode.length === 0) return jsonResponse$1(apiErr("缺少 installCode。"), 400);
				const locale = normalizeLocale(url.searchParams.get("locale"));
				const { winner } = await resolveLine(ctx, config);
				const listing = await fetchListingByCode(resolvePluginCatalogOrigin(config, winner.line), installCode, locale);
				const candidates = orderRepositories(listing, winner.line.id);
				if (candidates.length === 0) return jsonResponse$1(apiErr("该插件未配置可用仓库渠道。"), 400);
				const result = tryInstallWithFallback(config, listing, candidates);
				if ("failure" in result) return jsonResponse$1({
					ok: false,
					message: result.failure,
					code: "INSTALL_FAILED",
					attempts: result.attempts,
					log: formatInstallAttemptsLog(result.attempts)
				}, 400);
				return jsonResponse$1(apiOk(result.success));
			} catch (error) {
				return jsonResponse$1(apiErr(error instanceof Error ? error.message : "安装失败。"), 400);
			}
		}
	}), "supanexus: plugin-install");
	ctx.effect(() => ctx.connection.fetch.register({
		path: PLUGIN_UNINSTALL_PATH,
		methods: ["GET"],
		fetch: async (request) => {
			try {
				const url = new URL(request.url);
				const packageName = url.searchParams.get("packageName")?.trim() ?? "";
				if (packageName.length === 0) return jsonResponse$1(apiErr("缺少 packageName。"), 400);
				if (!canUninstallPlugin({
					package_name: packageName,
					install_code: ""
				})) return jsonResponse$1(apiErr("该插件不允许卸载。"), 403);
				const installCode = url.searchParams.get("installCode")?.trim() ?? "";
				if (installCode.length > 0 && !canUninstallPlugin({
					package_name: packageName,
					install_code: installCode
				})) return jsonResponse$1(apiErr("该插件不允许卸载。"), 403);
				const run = runProfilePluginRemove(config, packageName);
				const cliCommand = buildCliRemoveCommand(packageName, config.profileName);
				if (!run.ok) {
					const message = run.stderr.trim().length > 0 ? run.stderr.trim() : `卸载失败（退出码 ${String(run.exitCode)}）`;
					return jsonResponse$1({
						ok: false,
						message,
						code: "UNINSTALL_FAILED",
						log: formatCommandLog({
							...run,
							message
						})
					}, 400);
				}
				return jsonResponse$1(apiOk({
					packageName,
					needsRestart: true,
					cliCommand,
					stdout: run.stdout,
					stderr: run.stderr,
					log: formatCommandLog(run)
				}));
			} catch (error) {
				return jsonResponse$1(apiErr(error instanceof Error ? error.message : "卸载失败。"), 400);
			}
		}
	}), "supanexus: plugin-uninstall");
	ctx.effect(() => ctx.connection.fetch.register({
		path: PLUGIN_UPGRADE_STATUS_PATH,
		methods: ["GET"],
		fetch: async (request) => {
			try {
				const url = new URL(request.url);
				const installCodes = (url.searchParams.get("installCodes")?.trim() ?? "").split(",").map((code) => code.trim()).filter((code) => code.length > 0);
				if (installCodes.length === 0) return jsonResponse$1(apiErr("缺少 installCodes。"), 400);
				const locale = normalizeLocale(url.searchParams.get("locale"));
				const { winner } = await resolveLine(ctx, config);
				const catalogOrigin = resolvePluginCatalogOrigin(config, winner.line);
				return jsonResponse$1(apiOk({ items: await Promise.all(installCodes.map(async (installCode) => {
					try {
						return buildUpgradeStatusEntry(await fetchListingByCode(catalogOrigin, installCode, locale), { profileName: config.profileName });
					} catch {
						return {
							install_code: installCode,
							upgradeable: false,
							installed_version: null,
							listing_version: null
						};
					}
				})) }));
			} catch (error) {
				return jsonResponse$1(apiErr(error instanceof Error ? error.message : "无法检查插件更新。"), 400);
			}
		}
	}), "supanexus: plugin-upgrade-status");
	ctx.effect(() => ctx.connection.fetch.register({
		path: PLUGIN_REMOTE_VERSION_PATH,
		methods: ["GET"],
		fetch: async (request) => {
			try {
				const url = new URL(request.url);
				const installCode = url.searchParams.get("installCode")?.trim() ?? "";
				if (installCode.length === 0) return jsonResponse$1(apiErr("缺少 installCode。"), 400);
				const locale = normalizeLocale(url.searchParams.get("locale"));
				const { winner } = await resolveLine(ctx, config);
				const listing = await fetchListingByCode(resolvePluginCatalogOrigin(config, winner.line), installCode, locale);
				const targetRef = primaryTargetRef(listing, winner.line.id);
				const remote = await fetchRemotePackageManifest(orderRepositories(listing, winner.line.id), targetRef);
				return jsonResponse$1(apiOk({
					version: remote?.version ?? null,
					provider: remote?.provider ?? null
				}));
			} catch (error) {
				return jsonResponse$1(apiErr(error instanceof Error ? error.message : "无法读取远端 package.json 版本。"), 400);
			}
		}
	}), "supanexus: plugin-remote-version");
	ctx.effect(() => ctx.connection.fetch.register({
		path: PLUGIN_TOGGLE_STATUS_PATH,
		methods: ["GET"],
		fetch: async (request) => {
			try {
				const packageNames = (new URL(request.url).searchParams.get("packageNames")?.trim() ?? "").split(",").map((name) => name.trim()).filter((name) => name.length > 0);
				if (packageNames.length === 0) return jsonResponse$1(apiErr("缺少 packageNames。"), 400);
				return jsonResponse$1(apiOk({ items: packageNames.map((packageName) => {
					const toggleable = canTogglePlugin({
						package_name: packageName,
						install_code: ""
					});
					const status = packageEnabled(config.profileName, packageName);
					return {
						package_name: packageName,
						enabled: status.enabled,
						row_ids: status.rowIds,
						toggleable
					};
				}) }));
			} catch (error) {
				return jsonResponse$1(apiErr(error instanceof Error ? error.message : "无法读取插件开关状态。"), 400);
			}
		}
	}), "supanexus: plugin-toggle-status");
	ctx.effect(() => ctx.connection.fetch.register({
		path: PLUGIN_TOGGLE_PATH,
		methods: ["GET"],
		fetch: async (request) => {
			try {
				const url = new URL(request.url);
				const packageName = url.searchParams.get("packageName")?.trim() ?? "";
				if (packageName.length === 0) return jsonResponse$1(apiErr("缺少 packageName。"), 400);
				if (!canTogglePlugin({
					package_name: packageName,
					install_code: ""
				})) return jsonResponse$1(apiErr("该插件不允许开关。"), 403);
				const enabledParam = url.searchParams.get("enabled")?.trim().toLowerCase() ?? "";
				if (enabledParam !== "true" && enabledParam !== "false") return jsonResponse$1(apiErr("enabled 须为 true 或 false。"), 400);
				const enabled = enabledParam === "true";
				const result = await setPackageEnabled(config.profileName, packageName, enabled);
				if (!result.ok) return jsonResponse$1(apiErr(result.reason ?? "开关写入失败。"), 400);
				return jsonResponse$1(apiOk({
					package_name: packageName,
					enabled,
					row_ids: result.rowIds,
					needsRefresh: true
				}));
			} catch (error) {
				return jsonResponse$1(apiErr(error instanceof Error ? error.message : "插件开关失败。"), 400);
			}
		}
	}), "supanexus: plugin-toggle");
	ctx.effect(() => ctx.connection.fetch.register({
		path: RESTART_HOST_PATH,
		methods: ["GET"],
		fetch: async (request) => {
			if (!isDirectLoopbackRequest(request)) return jsonResponse$1(apiErr("仅允许本机 loopback 请求重启 Host。"), 403);
			scheduleHostRelaunch();
			return jsonResponse$1(apiOk({ restarting: true }), 202);
		}
	}), "supanexus: restart-host");
}
//#endregion
//#region lib/types/shared/wallet-contract.js
/** Host ↔ Client contract for SupaNexus wallet / budget deep-link. */
/** Lightweight connection probe for sidebar visibility. */
const WALLET_STATUS_PATH = "/api/supanexus.wallet.status";
/** Fetch organization balance (Host refreshes harness session first). */
const WALLET_PATH = "/api/supanexus.wallet";
/** Console path for spend budget / usage policies. */
const USAGE_POLICIES_PATH = "/usage-policies";
/** Build the console spend-budget URL from a configured origin. */
function buildUsagePoliciesUrl(consoleOrigin) {
	return `${consoleOrigin.replace(/\/+$/, "")}${USAGE_POLICIES_PATH}`;
}
/** Error codes returned on wallet failures (Client branching). */
const WALLET_ERROR = {
	notConnected: "wallet.not_connected",
	sessionRevoked: "wallet.session_revoked",
	noDevice: "wallet.no_device"
};
//#endregion
//#region lib/types/host/wallet/routes.js
/** Host routes for wallet status + balance (Harness refresh + wallet). */
function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}
let accessCache;
async function isApiKeyConfigured(ctx) {
	return (await ctx.credentials.describe(credentialRef(CREDENTIAL_REF))).configured;
}
async function resolveRefreshToken(ctx) {
	const value = (await ctx.credentials.resolve(credentialRef(REFRESH_CREDENTIAL_REF)))?.value?.trim();
	return value !== void 0 && value.length > 0 ? value : void 0;
}
async function ensureAccessToken(ctx, config, locale) {
	const settings = readSettings(ctx);
	const now = Date.now();
	if (accessCache !== void 0 && accessCache.expiresAt > now + 15e3 && (settings.resolvedLine.length === 0 || accessCache.lineId === settings.resolvedLine)) return {
		accessToken: accessCache.accessToken,
		lineId: accessCache.lineId
	};
	const refreshToken = await resolveRefreshToken(ctx);
	if (refreshToken === void 0) throw Object.assign(/* @__PURE__ */ new Error("会话已失效，请重新快速配置。"), { code: WALLET_ERROR.sessionRevoked });
	let line = settings.resolvedLine.length > 0 ? findLine(config.lines, settings.resolvedLine) : void 0;
	if (line === void 0) {
		const { winner } = await resolveLine(ctx, config);
		line = winner.line;
	}
	try {
		const tokens = await refreshSession(line, refreshToken, locale);
		await ctx.credentials.set(credentialRef(REFRESH_CREDENTIAL_REF), tokens.refreshToken);
		accessCache = {
			accessToken: tokens.accessToken,
			expiresAt: now + Math.max(30, tokens.expiresIn - 30) * 1e3,
			lineId: line.id
		};
		return {
			accessToken: tokens.accessToken,
			lineId: line.id
		};
	} catch (error) {
		accessCache = void 0;
		const message = error instanceof Error ? error.message : messageForCode("harness.session_revoked");
		throw Object.assign(new Error(message), { code: WALLET_ERROR.sessionRevoked });
	}
}
function pickLineForConsole(ctx, config) {
	const settings = readSettings(ctx);
	if (settings.resolvedLine.length > 0) {
		const hit = findLine(config.lines, settings.resolvedLine);
		if (hit !== void 0) return hit;
	}
	return findLine(config.lines, "global") ?? config.lines[0];
}
function usagePoliciesUrlFor(config, line) {
	return buildUsagePoliciesUrl(resolveConsoleOrigin(config, line));
}
/** Register wallet status and balance Host API routes. */
function registerWalletRoutes(ctx, config) {
	ctx.effect(() => ctx.connection.fetch.register({
		path: WALLET_STATUS_PATH,
		methods: ["GET"],
		fetch: async () => {
			try {
				const connected = await isApiKeyConfigured(ctx);
				const settings = readSettings(ctx);
				return jsonResponse(apiOk({
					connected,
					usagePoliciesUrl: usagePoliciesUrlFor(config, pickLineForConsole(ctx, config)),
					...settings.keyPrefix.length > 0 ? { keyPrefix: settings.keyPrefix } : {}
				}));
			} catch (error) {
				return jsonResponse(apiErr(error instanceof Error ? error.message : "无法读取连接状态。"), 500);
			}
		}
	}), "supanexus: wallet.status");
	ctx.effect(() => ctx.connection.fetch.register({
		path: WALLET_PATH,
		methods: ["GET"],
		fetch: async (request) => {
			try {
				if (!await isApiKeyConfigured(ctx)) return jsonResponse(apiErr("尚未配置 SupaNexus，请先完成快速配置。", WALLET_ERROR.notConnected), 400);
				const settings = readSettings(ctx);
				const deviceId = settings.deviceId.trim();
				if (deviceId.length === 0) return jsonResponse(apiErr("缺少设备标识，请重新快速配置。", WALLET_ERROR.noDevice), 400);
				const locale = new URL(request.url).searchParams.get("locale") ?? void 0;
				const { accessToken } = await ensureAccessToken(ctx, config, locale);
				const line = findLine(config.lines, settings.resolvedLine) ?? (await resolveLine(ctx, config)).winner.line;
				const wallet = await fetchWallet(line, accessToken, deviceId, locale);
				return jsonResponse(apiOk({
					connected: true,
					organizationId: wallet.organizationId,
					name: wallet.name,
					availableBalance: wallet.availableBalance,
					currency: wallet.currency,
					usagePoliciesUrl: usagePoliciesUrlFor(config, line),
					...settings.keyPrefix.length > 0 ? { keyPrefix: settings.keyPrefix } : {}
				}));
			} catch (error) {
				const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code : void 0;
				const message = error instanceof Error ? error.message : "无法获取余额。";
				const status = code === WALLET_ERROR.sessionRevoked ? 401 : 400;
				return jsonResponse(apiErr(message, code), status);
			}
		}
	}), "supanexus: wallet");
}
//#endregion
//#region lib/types/host/index.js
/** Host feature orchestration entry. */
/** Apply all host-side SupaNexus features. */
function applyHost(ctx, config) {
	registerSettingsNamespace(ctx);
	registerAuthRoutes(ctx, config);
	registerPluginMarketRoutes(ctx, config);
	registerWalletRoutes(ctx, config);
}
//#endregion
//#region lib/types/host/config.js
/** Plugin cordis config schema and defaults. */
const lineSchema = z.object({
	id: z.string().required(),
	label: z.string().required(),
	origin: z.string().required(),
	harnessOrigin: z.string(),
	pluginCatalogOrigin: z.string(),
	consoleOrigin: z.string()
});
const Config = z.object({
	lines: z.array(lineSchema).default([{
		id: "global",
		label: "Global",
		origin: "https://api.supanexus.ai",
		harnessOrigin: "https://gateway-harness.supanexus.ai",
		pluginCatalogOrigin: "https://gateway-client.supanexus.ai",
		consoleOrigin: "https://console.supanexus.ai"
	}, {
		id: "cn",
		label: "中国大陆",
		origin: "https://api.supanexus.io",
		harnessOrigin: "https://gateway-harness.supanexus.io",
		pluginCatalogOrigin: "https://gateway-client.supanexus.io",
		consoleOrigin: "https://console.supanexus.io"
	}]),
	pinnedLine: z.string().default(""),
	probeTimeoutMs: z.number().step(1).min(500).max(3e4).default(2500),
	probeCacheTtlMs: z.number().step(1).min(0).max(36e5).default(6e5),
	deviceName: z.string().default(""),
	profileName: z.string().default("web"),
	dshCliEntry: z.string().default(""),
	pluginCatalogOrigin: z.string().default(""),
	consoleOrigin: z.string().default("")
});
/** Cordis function-plugin name. */
const name = "supanexus-core";
/** Host services required before routes and settings register. */
const inject = [
	"webServer",
	"connection",
	"credentials",
	"settings"
];
//#endregion
//#region lib/types/index.js
/**
* SupaNexus platform core plugin, node half.
* Orchestrates host features (settings, line probe, OAuth); browser UI ships via `./client`.
*/
/**
* Register host routes and settings for SupaNexus quick setup.
* @param ctx - Host plugin context.
* @param config - Cordis row configuration.
*/
function apply(ctx, config) {
	applyHost(ctx, config);
}
//#endregion
export { Config, apply, inject, name };
