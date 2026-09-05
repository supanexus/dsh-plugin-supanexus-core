/** Auth-line pinning + env-line healthz racing (separate caches). */

import type { Context } from '@deepseek-ai/cordis'
import type { LineProbeEntry } from '../../shared/auth-contract.ts'
import type { AuthLineSource } from '../../shared/line-contract.ts'
import { findLine, probeUrl, type ResolvedLine, type SupaLine } from '../../shared/line.ts'
import type { Config } from '../config.ts'
import { readSettings, patchSettings } from '../settings/device.ts'

export type { AuthLineSource } from '../../shared/line-contract.ts'

export type FetchProbe = (url: string, signal: AbortSignal) => Promise<Response>

const defaultFetch: FetchProbe = (url, signal) => fetch(url, { method: 'GET', signal })

export interface ProbeReport {
  readonly winner: ResolvedLine
  readonly entries: readonly LineProbeEntry[]
  /** Auth resolution only: who chose the line. */
  readonly source?: AuthLineSource
}

/** Independent TTL cache for plugin-market env probing (never writes settings). */
let envCached: ResolvedLine | undefined
let envCacheExpiresAt = 0

export type FetchProbeOptions = { doFetch?: FetchProbe }

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

function firstNonEmpty(...candidates: readonly (string | undefined)[]): string {
  for (const raw of candidates) {
    const value = raw?.trim() ?? ''
    if (value.length > 0) return value
  }
  return ''
}

function pinnedReport(line: SupaLine, source: AuthLineSource, now: number): ProbeReport {
  const winner: ResolvedLine = { line, latencyMs: 0, resolvedAt: now }
  return {
    winner,
    source,
    entries: [{ line, latencyMs: 0, reachable: true }],
  }
}

/**
 * Resolve the auth / platform region line.
 * Priority (non-empty string wins): pinnedOverride → config.pinnedLine → settings.pinnedLine → probe.
 * First auto probe also writes `pinnedLine` so the settings UI shows a selection.
 */
export async function resolveAuthLine(
  ctx: Context,
  config: Config,
  options: { pinnedOverride?: string; doFetch?: FetchProbe } = {},
): Promise<ProbeReport> {
  const settings = readSettings(ctx)
  const now = Date.now()

  const override = firstNonEmpty(options.pinnedOverride)
  if (override.length > 0) {
    const line = findLine(config.lines, override)
    if (line === undefined) throw new Error(`未知线路：${override}`)
    await patchSettings(ctx, {
      resolvedLine: line.id,
      resolvedAt: now,
      latencyMs: 0,
      pinnedLine: line.id,
    })
    return pinnedReport(line, 'user', now)
  }

  const fromConfig = firstNonEmpty(config.pinnedLine)
  if (fromConfig.length > 0) {
    const line = findLine(config.lines, fromConfig)
    if (line === undefined) throw new Error(`未知线路：${fromConfig}`)
    await patchSettings(ctx, {
      resolvedLine: line.id,
      resolvedAt: now,
      latencyMs: 0,
    })
    return pinnedReport(line, 'config', now)
  }

  const fromUser = firstNonEmpty(settings.pinnedLine)
  if (fromUser.length > 0) {
    const line = findLine(config.lines, fromUser)
    if (line === undefined) throw new Error(`未知线路：${fromUser}`)
    await patchSettings(ctx, {
      resolvedLine: line.id,
      resolvedAt: now,
      latencyMs: 0,
    })
    return pinnedReport(line, 'user', now)
  }

  const entries = await Promise.all(
    config.lines.map(line => probeLine(line, config.probeTimeoutMs, options.doFetch)),
  )
  const winner = pickWinner(config.lines, entries)
  await patchSettings(ctx, {
    pinnedLine: winner.line.id,
    resolvedLine: winner.line.id,
    resolvedAt: winner.resolvedAt,
    latencyMs: winner.latencyMs,
  })
  return { winner, entries, source: 'auto' }
}

/**
 * Resolve the plugin-market env line via healthz racing.
 * Uses an independent TTL cache and never writes auth settings.
 */
export async function resolveEnvLine(
  _ctx: Context,
  config: Config,
  options: { force?: boolean; doFetch?: FetchProbe } = {},
): Promise<ProbeReport> {
  const now = Date.now()
  if (!options.force && envCached !== undefined && now < envCacheExpiresAt) {
    const hit = envCached
    return {
      winner: hit,
      entries: config.lines.map(line => ({
        line,
        latencyMs: line.id === hit.line.id ? hit.latencyMs : null,
        reachable: line.id === hit.line.id,
      })),
    }
  }

  const entries = await Promise.all(
    config.lines.map(line => probeLine(line, config.probeTimeoutMs, options.doFetch)),
  )
  const winner = pickWinner(config.lines, entries)
  envCached = winner
  envCacheExpiresAt = now + config.probeCacheTtlMs
  return { winner, entries }
}

/** Whether cordis config locks the region (UI should disable switching). */
export function isAuthLineLocked(config: Config): boolean {
  return firstNonEmpty(config.pinnedLine).length > 0
}

/** Test helper: clear env-line probe cache. */
export function resetLineCache(): void {
  envCached = undefined
  envCacheExpiresAt = 0
}

/** Alias for {@link resetLineCache}. */
export const resetEnvLineCache = resetLineCache
