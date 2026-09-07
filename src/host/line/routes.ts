/** Host HTTP route: region / auth-line status for the settings card. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-connection'
import { apiErr, apiOk } from '../../shared/auth-contract.ts'
import {
  LINE_STATUS_PATH,
  toLineStatusRows,
  type LineStatusResponse,
} from '../../shared/line-contract.ts'
import type { Config } from '../config.ts'
import { isAuthLineLocked, resolveAuthLine } from './resolver.ts'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Register `GET /api/supanexus.line.status` (also auto-selects region on first call). */
export function registerLineRoutes(ctx: Context, config: Config): void {
  ctx.effect(() => ctx.connection.fetch.register({
    path: LINE_STATUS_PATH,
    methods: ['GET'],
    requestBody: 'buffered',
    fetch: async () => {
      try {
        const report = await resolveAuthLine(ctx, config)
        const body = apiOk<LineStatusResponse>({
          lines: toLineStatusRows(config.lines),
          activeLineId: report.winner.line.id,
          source: report.source ?? 'auto',
          latencyMs: report.winner.latencyMs,
          locked: isAuthLineLocked(config),
        })
        return jsonResponse(body)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '无法解析访问区域。'
        return jsonResponse(apiErr(message), 400)
      }
    },
  }), 'supanexus: line.status')
}
