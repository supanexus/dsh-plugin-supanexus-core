/** Line model and URL derivation — single source of truth for host and client. */

/** One Global / CN access line. */
export interface SupaLine {
  readonly id: string
  readonly label: string
  /** OpenAPI data plane (models / chat). */
  readonly origin: string
  /** Harness auth plane; omit to reuse `origin`. */
  readonly harnessOrigin?: string
  /** Plugin plaza gateway-client; omit → top-level / port heuristic. */
  readonly pluginCatalogOrigin?: string
  /** Developer console for spend-budget links; omit → top-level. */
  readonly consoleOrigin?: string
}

/** Outcome of a line probe. */
export interface ResolvedLine {
  readonly line: SupaLine
  readonly latencyMs: number
  readonly resolvedAt: number
}

/** Strip trailing slashes from an origin URL. */
export function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, '')
}

/** Harness API base for one line (`{harnessOrigin ?? origin}/harness/v1`). */
export function harnessBase(line: SupaLine): string {
  const base = normalizeOrigin(line.harnessOrigin ?? line.origin)
  return `${base}/harness/v1`
}

/** OpenAPI data-plane base for provider `baseURL` (`{origin}/v1`). */
export function dataPlaneBase(line: SupaLine): string {
  return `${normalizeOrigin(line.origin)}/v1`
}

/** Health probe target (`{origin}/healthz`). */
export function probeUrl(line: SupaLine): string {
  return `${normalizeOrigin(line.origin)}/healthz`
}

/** Find a line by id in the configured table. */
export function findLine(lines: readonly SupaLine[], id: string): SupaLine | undefined {
  return lines.find(line => line.id === id)
}
