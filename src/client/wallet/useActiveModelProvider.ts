/** Subscribe to the active session's model provider (shared modelDirectories state). */

import { useEffect, useState } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'

/**
 * Provider id of the currently opened session's model selection.
 * `undefined` while uiSession/modelDirectories are unavailable;
 * `null` when there is no current session or no selection yet.
 *
 * Navigation lives on `uiSession.adapter.current` (SessionList no longer
 * exposes `.current` after the Controller / ui-session split).
 */
export function useActiveModelProvider(ctx: ClientContext): string | null | undefined {
  const [provider, setProvider] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let attachedId: SessionId | undefined
    let stopDirectory: (() => void) | undefined
    let stopBinding: (() => void) | undefined
    let disposed = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let waitTimer: ReturnType<typeof setTimeout> | undefined

    const clearRetry = (): void => {
      if (retryTimer !== undefined) {
        clearTimeout(retryTimer)
        retryTimer = undefined
      }
    }

    const clearWait = (): void => {
      if (waitTimer !== undefined) {
        clearTimeout(waitTimer)
        waitTimer = undefined
      }
    }

    const detachDirectory = (): void => {
      stopDirectory?.()
      stopDirectory = undefined
      attachedId = undefined
    }

    const detachBinding = (): void => {
      stopBinding?.()
      stopBinding = undefined
    }

    const attachDirectory = (
      id: SessionId,
      models: NonNullable<ReturnType<typeof ctx.get<'modelDirectories'>>>,
    ): boolean => {
      let directory
      try {
        directory = models.directoryFor(id)
      } catch {
        return false
      }

      detachDirectory()
      attachedId = id

      const syncProvider = (): void => {
        if (disposed) return
        setProvider(directory.store.getSnapshot().current?.provider ?? null)
      }
      syncProvider()
      stopDirectory = directory.store.subscribe(syncProvider)
      void directory.load().then(syncProvider, () => { /* store surfaces error */ })
      return true
    }

    const bind = (): void => {
      if (disposed) return
      const uiSession = ctx.get('uiSession')
      const models = ctx.get('modelDirectories')
      if (uiSession === undefined || models === undefined) {
        setProvider(undefined)
        clearWait()
        waitTimer = setTimeout(bind, 50)
        return
      }

      clearWait()
      detachBinding()

      const binding = uiSession.adapter.current

      const syncSession = (): void => {
        if (disposed) return
        clearRetry()
        const next = binding.getSnapshot().key as SessionId | undefined
        if (next === undefined) {
          detachDirectory()
          setProvider(null)
          return
        }

        if (next === attachedId && stopDirectory !== undefined) {
          return
        }

        if (attachDirectory(next, models)) return

        // Binding often updates before the session scope is minted. Retry shortly.
        detachDirectory()
        setProvider(null)
        retryTimer = setTimeout(() => {
          retryTimer = undefined
          if (disposed) return
          const again = binding.getSnapshot().key as SessionId | undefined
          if (again === undefined) return
          if (!attachDirectory(again, models)) {
            queueMicrotask(() => {
              if (disposed) return
              const last = binding.getSnapshot().key as SessionId | undefined
              if (last !== undefined) void attachDirectory(last, models)
            })
          }
        }, 0)
      }

      syncSession()
      stopBinding = binding.subscribe(syncSession)
    }

    bind()
    return () => {
      disposed = true
      clearRetry()
      clearWait()
      detachBinding()
      detachDirectory()
    }
  }, [ctx])

  return provider
}
