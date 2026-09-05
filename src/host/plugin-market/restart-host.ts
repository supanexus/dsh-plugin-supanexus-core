/** Relaunch the current dsh Host process (loopback-only API). */

import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1'])
/** node:http bridge rewrites request URLs to this internal origin. */
const INTERNAL_BRIDGE_HOST = 'dsh.internal'
const HELPER_DELAY_MS = 1500
const PARENT_EXIT_DELAY_MS = 500

function parseHostname(host: string): string {
  const trimmed = host.trim().toLowerCase()
  if (trimmed.startsWith('[')) {
    const end = trimmed.indexOf(']')
    return end >= 0 ? trimmed.slice(1, end) : trimmed
  }
  return trimmed.split(':')[0] ?? trimmed
}

/** Hostname the caller intended to reach (bridge-aware). */
function resolveRequestHostname(request: Request): string {
  const url = new URL(request.url)
  const urlHost = url.hostname.toLowerCase()
  if (urlHost !== INTERNAL_BRIDGE_HOST) return urlHost
  const headerHost = request.headers.get('host')?.trim()
  if (headerHost === undefined || headerHost.length === 0) return urlHost
  return parseHostname(headerHost)
}

function nodeProcess(): NodeJS.Process {
  return process as unknown as NodeJS.Process
}

export interface RestartLaunch {
  readonly file: string
  readonly args: string[]
  readonly cwd: string
  readonly viaShell: boolean
}

export interface RespawnInvocation {
  readonly file: string
  readonly args: string[]
  readonly viaShell: boolean
  readonly detached: boolean
}

export interface HostRestartResult {
  readonly pid: number
  readonly helperPid: number | undefined
  readonly logOut: string
  readonly logErr: string
}

/** The exact boot invocation the detached restart helper replays. */
export function restartLaunch(): RestartLaunch {
  const proc = nodeProcess()
  return {
    file: proc.execPath,
    args: proc.argv.slice(1),
    cwd: proc.cwd(),
    viaShell: proc.platform === 'win32',
  }
}

/** Platform-correct spawn invocation for the replacement host. */
export function respawnInvocation(
  launch: RestartLaunch,
  platform: NodeJS.Platform = nodeProcess().platform,
): RespawnInvocation {
  if (platform !== 'win32') {
    return {
      file: launch.file,
      args: launch.args,
      viaShell: launch.viaShell,
      detached: true,
    }
  }
  const quote = (part: string): string => `'${part.replace(/'/g, "''")}'`
  return {
    file: 'powershell.exe',
    args: [
      '-NoProfile',
      '-WindowStyle',
      'Hidden',
      '-Command',
      [`& ${quote(launch.file)}`, ...launch.args.map(quote)].join(' '),
    ],
    viaShell: false,
    detached: false,
  }
}

/** Reject proxied or non-loopback restart requests. */
export function isDirectLoopbackRequest(request: Request): boolean {
  const host = resolveRequestHostname(request)
  if (!LOOPBACK_HOSTS.has(host)) return false
  const forwardedFor = request.headers.get('x-forwarded-for')?.trim()
  if (forwardedFor !== undefined && forwardedFor.length > 0) return false
  const forwardedHost = request.headers.get('x-forwarded-host')?.trim()
  if (forwardedHost !== undefined && forwardedHost.length > 0) return false
  const forwardedProto = request.headers.get('x-forwarded-proto')?.trim()
  if (forwardedProto !== undefined && forwardedProto.length > 0) return false
  const forwarded = request.headers.get('forwarded')?.trim()
  if (forwarded !== undefined && forwarded.length > 0) return false
  return true
}

/**
 * Spawn a detached helper that waits for this process to exit and free its port,
 * then relaunch dsh with the same argv/env/cwd.
 */
export function scheduleHostRelaunch(
  kill: (pid: number, signal: NodeJS.Signals) => void = (pid, signal) => {
    nodeProcess().kill(pid, signal)
  },
): HostRestartResult {
  const proc = nodeProcess()
  const launch = restartLaunch()
  const spawned = respawnInvocation(launch)
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const logOut = join(tmpdir(), `supanexus-restart-${stamp}.out.log`)
  const logErr = join(tmpdir(), `supanexus-restart-${stamp}.err.log`)
  const helperCode = [
    'const { spawn } = require(\'node:child_process\')',
    'const fs = require(\'node:fs\')',
    `const file = ${JSON.stringify(spawned.file)}`,
    `const args = ${JSON.stringify(spawned.args)}`,
    `const cwd = ${JSON.stringify(launch.cwd)}`,
    `const viaShell = ${JSON.stringify(spawned.viaShell)}`,
    `const detached = ${JSON.stringify(spawned.detached)}`,
    `const logOut = ${JSON.stringify(logOut)}`,
    `const logErr = ${JSON.stringify(logErr)}`,
  `setTimeout(() => {`,
    '  try {',
    '    const out = fs.openSync(logOut, \'a\')',
    '    const err = fs.openSync(logErr, \'a\')',
    '    const child = spawn(file, args, { cwd, detached, stdio: [\'ignore\', out, err], env: process.env, shell: viaShell })',
    '    child.unref()',
    '  } catch {}',
    `}, ${String(HELPER_DELAY_MS)})`,
  ].join('\n')
  const helper = spawn(proc.execPath, ['-e', helperCode], {
    detached: true,
    stdio: 'ignore',
    env: proc.env,
  })
  helper.unref()
  setTimeout(() => { kill(proc.pid, 'SIGTERM') }, PARENT_EXIT_DELAY_MS)
  return {
    pid: proc.pid,
    helperPid: helper.pid,
    logOut,
    logErr,
  }
}
