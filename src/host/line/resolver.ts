/** Concurrent /healthz line racing with TTL cache. */

import type { Config } from '../config.ts'
import { findLine, probeUrl, type ResolvedLine, type SupaLine } from '../../shared/line.ts'
import type { LineProbeEntry } from '../../shared/auth-contract.ts'
import { readSettings, patchSettings } from '../settings/device.ts'
import type { Context } from '@deepseek-ai/cordis'

export type FetchProbe = (url: string, signal: AbortSignal) => Promise<Response>

const defaultFetch: FetchProbe = (url, signal) => fetch(url, { method: 'GET', signal })

let cached: ResolvedLine | undefined
let cacheExpiresAt = 0

export interface ProbeReport {
  readonly winner: ResolvedLine
  readonly entries: readonly LineProbeEntry[]
}

/** Probe one line; any HTTP response counts as reachable. */
export async function probeLine(
  line: SupaLine,
  timeoutMs: number,
  doFetch: FetchProbe = defaultFetch,
): Promise<LineProbeEntry> {
  const started = performance.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    await doFetch(probeUrl(line), controller.signal)
    return {
      line,
      latencyMs: Math.round(performance.now() - started),
      reachable: true,
    }
  } catch {
    return { line, latencyMs: null, reachable: false }
  } finally {
    clearTimeout(timer)
  }
}

function pickWinner(
  lines: readonly SupaLine[],
  entries: readonly LineProbeEntry[],
): ResolvedLine {
  const reachable = entries
    .filter(entry => entry.reachable && entry.latencyMs !== null)
    .sort((left, right) => {
      const delta = (left.latencyMs ?? 0) - (right.latencyMs ?? 0)
      if (delta !== 0) return delta
      return lines.findIndex(line => line.id === left.line.id)
        - lines.findIndex(line => line.id === right.line.id)
    })
  if (reachable.length === 0) {
    throw new Error('两条线路均不可达，请检查网络后重试。')
  }
  const best = reachable[0]!
  return {
    line: best.line,
    latencyMs: best.latencyMs ?? 0,
    resolvedAt: Date.now(),
  }
}

/** Resolve the best line, honoring pinnedLine and cache unless forced. */
export async function resolveLine(
  ctx: Context,
  config: Config,
  options: { force?: boolean; pinnedOverride?: string; doFetch?: FetchProbe } = {},
): Promise<ProbeReport> {
  const settings = readSettings(ctx)
  const pinned = options.pinnedOverride ?? config.pinnedLine ?? settings.pinnedLine
  const now = Date.now()

  if (!options.force && cached !== undefined && now < cacheExpiresAt && pinned.length === 0) {
    const hit = cached
    return {
      winner: hit,
      entries: config.lines.map(line => ({
        line,
        latencyMs: line.id === hit.line.id ? hit.latencyMs : null,
        reachable: line.id === hit.line.id,
      })),
    }
  }

  if (pinned.length > 0) {
    const line = findLine(config.lines, pinned)
    if (line === undefined) throw new Error(`未知线路：${pinned}`)
    const winner: ResolvedLine = { line, latencyMs: 0, resolvedAt: now }
    cached = winner
    cacheExpiresAt = now + config.probeCacheTtlMs
    await patchSettings(ctx, {
      resolvedLine: line.id,
      resolvedAt: now,
      latencyMs: 0,
      pinnedLine: pinned,
    })
    return {
      winner,
      entries: config.lines.map(entry => ({
        line: entry,
        latencyMs: entry.id === line.id ? 0 : null,
        reachable: entry.id === line.id,
      })),
    }
  }

  const entries = await Promise.all(
    config.lines.map(line => probeLine(line, config.probeTimeoutMs, options.doFetch)),
  )
  const winner = pickWinner(config.lines, entries)
  cached = winner
  cacheExpiresAt = now + config.probeCacheTtlMs
  await patchSettings(ctx, {
    resolvedLine: winner.line.id,
    resolvedAt: winner.resolvedAt,
    latencyMs: winner.latencyMs,
  })
  return { winner, entries }
}

/** Test helper: clear resolver cache. */
export function resetLineCache(): void {
  cached = undefined
  cacheExpiresAt = 0
}
