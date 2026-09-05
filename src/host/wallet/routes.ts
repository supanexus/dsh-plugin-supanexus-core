/** Host routes for wallet status + balance (Harness refresh + wallet). */

import type { Context } from '@deepseek-ai/cordis'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import type {} from '@deepseek-ai/dsh-client-connection'
import {
  apiErr,
  apiOk,
} from '../../shared/auth-contract.ts'
import {
  CREDENTIAL_REF,
  REFRESH_CREDENTIAL_REF,
} from '../../shared/provider.ts'
import { findLine, type SupaLine } from '../../shared/line.ts'
import {
  WALLET_ERROR,
  WALLET_PATH,
  WALLET_STATUS_PATH,
  buildUsagePoliciesUrl,
  type WalletBalanceResponse,
  type WalletStatusResponse,
} from '../../shared/wallet-contract.ts'
import type { Config } from '../config.ts'
import { resolveLine } from '../line/resolver.ts'
import { resolveConsoleOrigin } from '../plugin-market/catalog-origin.ts'
import { readSettings } from '../settings/device.ts'
import {
  fetchWallet,
  messageForCode,
  refreshSession,
} from '../auth/harness-client.ts'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

interface AccessCache {
  readonly accessToken: string
  readonly expiresAt: number
  readonly lineId: string
}

let accessCache: AccessCache | undefined

/** Test helper: clear in-memory access token cache. */
export function resetWalletAccessCache(): void {
  accessCache = undefined
}

async function isApiKeyConfigured(ctx: Context): Promise<boolean> {
  const info = await ctx.credentials.describe(credentialRef(CREDENTIAL_REF))
  return info.configured
}

async function resolveRefreshToken(ctx: Context): Promise<string | undefined> {
  const resolved = await ctx.credentials.resolve(credentialRef(REFRESH_CREDENTIAL_REF))
  const value = resolved?.value?.trim()
  return value !== undefined && value.length > 0 ? value : undefined
}

async function ensureAccessToken(
  ctx: Context,
  config: Config,
  locale: string | undefined,
): Promise<{ accessToken: string; lineId: string }> {
  const settings = readSettings(ctx)
  const now = Date.now()
  if (
    accessCache !== undefined
    && accessCache.expiresAt > now + 15_000
    && (settings.resolvedLine.length === 0 || accessCache.lineId === settings.resolvedLine)
  ) {
    return { accessToken: accessCache.accessToken, lineId: accessCache.lineId }
  }

  const refreshToken = await resolveRefreshToken(ctx)
  if (refreshToken === undefined) {
    throw Object.assign(new Error('会话已失效，请重新快速配置。'), {
      code: WALLET_ERROR.sessionRevoked,
    })
  }

  let line = settings.resolvedLine.length > 0
    ? findLine(config.lines, settings.resolvedLine)
    : undefined
  if (line === undefined) {
    const { winner } = await resolveLine(ctx, config)
    line = winner.line
  }

  try {
    const tokens = await refreshSession(line, refreshToken, locale)
    await ctx.credentials.set(credentialRef(REFRESH_CREDENTIAL_REF), tokens.refreshToken)
    accessCache = {
      accessToken: tokens.accessToken,
      expiresAt: now + Math.max(30, tokens.expiresIn - 30) * 1000,
      lineId: line.id,
    }
    return { accessToken: tokens.accessToken, lineId: line.id }
  } catch (error: unknown) {
    accessCache = undefined
    const message = error instanceof Error ? error.message : messageForCode('harness.session_revoked')
    throw Object.assign(new Error(message), { code: WALLET_ERROR.sessionRevoked })
  }
}

function pickLineForConsole(ctx: Context, config: Config): SupaLine {
  const settings = readSettings(ctx)
  if (settings.resolvedLine.length > 0) {
    const hit = findLine(config.lines, settings.resolvedLine)
    if (hit !== undefined) return hit
  }
  return findLine(config.lines, 'global') ?? config.lines[0]!
}

function usagePoliciesUrlFor(config: Config, line: SupaLine): string {
  return buildUsagePoliciesUrl(resolveConsoleOrigin(config, line))
}

/** Register wallet status and balance Host API routes. */
export function registerWalletRoutes(ctx: Context, config: Config): void {
  ctx.effect(() => ctx.connection.fetch.register({
    path: WALLET_STATUS_PATH,
    methods: ['GET'],
    fetch: async () => {
      try {
        const connected = await isApiKeyConfigured(ctx)
        const settings = readSettings(ctx)
        const body = apiOk<WalletStatusResponse>({
          connected,
          usagePoliciesUrl: usagePoliciesUrlFor(config, pickLineForConsole(ctx, config)),
          ...(settings.keyPrefix.length > 0 ? { keyPrefix: settings.keyPrefix } : {}),
        })
        return jsonResponse(body)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '无法读取连接状态。'
        return jsonResponse(apiErr(message), 500)
      }
    },
  }), 'supanexus: wallet.status')

  ctx.effect(() => ctx.connection.fetch.register({
    path: WALLET_PATH,
    methods: ['GET'],
    fetch: async (request) => {
      try {
        const connected = await isApiKeyConfigured(ctx)
        if (!connected) {
          return jsonResponse(apiErr('尚未配置 SupaNexus，请先完成快速配置。', WALLET_ERROR.notConnected), 400)
        }

        const settings = readSettings(ctx)
        const deviceId = settings.deviceId.trim()
        if (deviceId.length === 0) {
          return jsonResponse(apiErr('缺少设备标识，请重新快速配置。', WALLET_ERROR.noDevice), 400)
        }

        const locale = new URL(request.url).searchParams.get('locale') ?? undefined
        const { accessToken } = await ensureAccessToken(ctx, config, locale)
        const line = findLine(config.lines, settings.resolvedLine)
          ?? (await resolveLine(ctx, config)).winner.line
        const wallet = await fetchWallet(
          line,
          accessToken,
          deviceId,
          locale,
        )

        const body = apiOk<WalletBalanceResponse>({
          connected: true,
          organizationId: wallet.organizationId,
          name: wallet.name,
          availableBalance: wallet.availableBalance,
          currency: wallet.currency,
          usagePoliciesUrl: usagePoliciesUrlFor(config, line),
          ...(settings.keyPrefix.length > 0 ? { keyPrefix: settings.keyPrefix } : {}),
        })
        return jsonResponse(body)
      } catch (error: unknown) {
        const code = typeof error === 'object' && error !== null && 'code' in error
          && typeof (error as { code: unknown }).code === 'string'
          ? (error as { code: string }).code
          : undefined
        const message = error instanceof Error ? error.message : '无法获取余额。'
        const status = code === WALLET_ERROR.sessionRevoked ? 401 : 400
        return jsonResponse(apiErr(message, code), status)
      }
    },
  }), 'supanexus: wallet')
}
