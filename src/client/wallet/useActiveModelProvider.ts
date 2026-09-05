/** Subscribe to the active session's model provider (shared modelDirectories state). */

import { useEffect, useState } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'

/**
 * Provider id of the currently opened session's model selection.
 * `undefined` while sessions/modelDirectories are unavailable;
 * `null` when there is no current session or no selection yet.
 */
export function useActiveModelProvider(ctx: ClientContext): string | null | undefined {
  const [provider, setProvider] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    const sessions = ctx.get('sessions')
    const models = ctx.get('modelDirectories')
    if (sessions === undefined || models === undefined) {
      setProvider(undefined)
      return
    }

    let attachedId: SessionId | undefined
    let stopDirectory: (() => void) | undefined
    let disposed = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const clearRetry = (): void => {
      if (retryTimer !== undefined) {
        clearTimeout(retryTimer)
        retryTimer = undefined
      }
    }

    const detachDirectory = (): void => {
      stopDirectory?.()
      stopDirectory = undefined
      attachedId = undefined
    }

    const attachDirectory = (id: SessionId): boolean => {
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
      // Ensure catalog + projection settle after session switch (fresh directories start loading).
      void directory.load().then(syncProvider, () => { /* store surfaces error */ })
      return true
    }

    const syncSession = (): void => {
      if (disposed) return
      clearRetry()
      const next = sessions.list.getSnapshot().current
      if (next === undefined) {
        detachDirectory()
        setProvider(null)
        return
      }

      if (next === attachedId && stopDirectory !== undefined) {
        return
      }

      if (attachDirectory(next)) return

      // list.current often updates before the session scope is minted (followCurrent
      // runs in another list subscriber). Retry shortly so we are not stuck hidden.
      detachDirectory()
      setProvider(null)
      retryTimer = setTimeout(() => {
        retryTimer = undefined
        if (disposed) return
        const again = sessions.list.getSnapshot().current
        if (again === undefined) return
        if (!attachDirectory(again)) {
          // One more microtask pass after scope materialization.
          queueMicrotask(() => {
            if (disposed) return
            const last = sessions.list.getSnapshot().current
            if (last !== undefined) void attachDirectory(last)
          })
        }
      }, 0)
    }

    syncSession()
    const stopSessions = sessions.list.subscribe(syncSession)
    return () => {
      disposed = true
      clearRetry()
      stopSessions()
      detachDirectory()
    }
  }, [ctx])

  return provider
}
