import { useCallback, useEffect, useRef, useState } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { AuthStatusResponse } from '../../shared/auth-contract.ts'
import { fetchAuthStatus, startAuth } from './wire.ts'
import { writeSupaNexusProvider, type SettingsWriteRemote } from './provider-write.ts'
import { quickSetupT } from './locales.ts'

function formatWireError(error: unknown, locale: string | undefined): string {
  const t = quickSetupT(locale)
  if (error instanceof Error) {
    if (error.message === 'HOST_API_NOT_FOUND' || error.message === 'not found') {
      return t('hostApiMissing')
    }
    if (error.message === 'unauthorized') {
      return t('unauthorized')
    }
    return error.message
  }
  return t('error')
}

export type QuickSetupPhase =
  | 'idle'
  | 'starting'
  | 'awaiting-approval'
  | 'writing'
  | 'done'
  | 'error'

const POLL_MS = 1500
const MAX_POLL_MS = 600_000

export interface UseQuickSetupOptions {
  readonly ctx: ClientContext
  readonly locale: string | undefined
}

export interface QuickSetupState {
  readonly phase: QuickSetupPhase
  readonly flowId: string | undefined
  readonly authorizeUrl: string | undefined
  readonly message: string | undefined
  readonly start: () => Promise<void>
  readonly reopenAuth: () => void
}

/** Quick-setup state machine: authorize → poll → write provider (line probe runs on host). */
export function useQuickSetup(options: UseQuickSetupOptions): QuickSetupState {
  const { ctx, locale } = options
  const [phase, setPhase] = useState<QuickSetupPhase>('idle')
  const [flowId, setFlowId] = useState<string | undefined>()
  const [authorizeUrl, setAuthorizeUrl] = useState<string | undefined>()
  const [message, setMessage] = useState<string | undefined>()
  const pollStartedAt = useRef<number | undefined>()
  const pollTimer = useRef<ReturnType<typeof setTimeout> | undefined>()

  const clearPoll = useCallback(() => {
    if (pollTimer.current !== undefined) {
      clearTimeout(pollTimer.current)
      pollTimer.current = undefined
    }
  }, [])

  useEffect(() => () => clearPoll(), [clearPoll])

  const handleDone = useCallback(async (status: AuthStatusResponse) => {
    if (status.baseURL === undefined || status.models === undefined) {
      throw new Error(quickSetupT(locale)('error'))
    }
    setPhase('writing')
    await writeSupaNexusProvider(ctx.remote.settings as unknown as SettingsWriteRemote, {
      baseURL: status.baseURL,
      models: status.models,
    })
    setPhase('done')
    setMessage(quickSetupT(locale)('done'))
  }, [ctx.remote.settings, locale])

  const schedulePoll = useCallback((id: string) => {
    clearPoll()
    if (pollStartedAt.current === undefined) pollStartedAt.current = Date.now()
    pollTimer.current = setTimeout(() => {
      void (async () => {
        if (pollStartedAt.current !== undefined
          && Date.now() - pollStartedAt.current > MAX_POLL_MS) {
          setPhase('error')
          setMessage(quickSetupT(locale)('error'))
          return
        }
        try {
          const status = await fetchAuthStatus(id)
          if (status.phase === 'done') {
            await handleDone(status)
            return
          }
          if (status.phase === 'error') {
            setPhase('error')
            setMessage(status.message ?? quickSetupT(locale)('error'))
            return
          }
          schedulePoll(id)
        } catch (error: unknown) {
          setPhase('error')
          setMessage(formatWireError(error, locale))
        }
      })()
    }, POLL_MS)
  }, [clearPoll, handleDone, locale])

  const start = useCallback(async () => {
    clearPoll()
    pollStartedAt.current = undefined
    setMessage(undefined)
    setPhase('starting')
    try {
      const started = await startAuth(locale)
      setFlowId(started.flowId)
      setAuthorizeUrl(started.authorizeUrl)
      setPhase('awaiting-approval')
      window.open(started.authorizeUrl, '_blank', 'noopener,noreferrer')
      schedulePoll(started.flowId)
    } catch (error: unknown) {
      setPhase('error')
      setMessage(formatWireError(error, locale))
    }
  }, [clearPoll, locale, schedulePoll])

  const reopenAuth = useCallback(() => {
    if (authorizeUrl !== undefined) {
      window.open(authorizeUrl, '_blank', 'noopener,noreferrer')
    }
  }, [authorizeUrl])

  return {
    phase,
    flowId,
    authorizeUrl,
    message,
    start,
    reopenAuth,
  }
}
