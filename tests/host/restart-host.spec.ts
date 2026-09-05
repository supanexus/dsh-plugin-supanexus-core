import { describe, expect, it, vi, afterEach } from 'vitest'

const spawnMock = vi.hoisted(() => vi.fn(() => ({ unref: vi.fn(), pid: 4242 })))

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
}))

import {
  isDirectLoopbackRequest,
  respawnInvocation,
  scheduleHostRelaunch,
} from '../../src/host/plugin-market/restart-host.ts'

describe('restart-host', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('accepts direct loopback requests', () => {
    const request = new Request('http://127.0.0.1:3080/api/supanexus.restart-host')
    expect(isDirectLoopbackRequest(request)).toBe(true)
  })

  it('accepts dsh http bridge requests with loopback Host header', () => {
    const request = new Request('http://dsh.internal/api/supanexus.restart-host', {
      headers: { host: '127.0.0.1:3080' },
    })
    expect(isDirectLoopbackRequest(request)).toBe(true)
  })

  it('rejects dsh http bridge requests with non-loopback Host header', () => {
    const request = new Request('http://dsh.internal/api/supanexus.restart-host', {
      headers: { host: 'example.com:3080' },
    })
    expect(isDirectLoopbackRequest(request)).toBe(false)
  })

  it('rejects forwarded loopback requests', () => {
    const request = new Request('http://127.0.0.1:3080/api/supanexus.restart-host', {
      headers: { 'x-forwarded-for': '203.0.113.1' },
    })
    expect(isDirectLoopbackRequest(request)).toBe(false)
  })

  it('rejects non-loopback hosts', () => {
    const request = new Request('http://example.com/api/supanexus.restart-host')
    expect(isDirectLoopbackRequest(request)).toBe(false)
  })

  it('wraps windows respawn in hidden powershell', () => {
    const wrapped = respawnInvocation({
      file: 'C:\\node.exe',
      args: ['bin.js', 'web'],
      cwd: 'C:\\work',
      viaShell: true,
    }, 'win32')
    expect(wrapped.file).toBe('powershell.exe')
    expect(wrapped.args[0]).toBe('-NoProfile')
  })

  it('schedules helper spawn and parent SIGTERM', () => {
    const kill = vi.fn()
    vi.useFakeTimers()
    const result = scheduleHostRelaunch(kill)
    expect(spawnMock).toHaveBeenCalledOnce()
    expect(result.helperPid).toBeDefined()
    vi.runAllTimers()
    expect(kill).toHaveBeenCalledOnce()
  })
})
