/** Subscribe to the active session's model provider (shared modelDirectories state). */
import { useEffect, useState } from 'react';
/**
 * Provider id of the currently opened session's model selection.
 * `undefined` while sessions/modelDirectories are unavailable;
 * `null` when there is no current session or no selection yet.
 */
export function useActiveModelProvider(ctx) {
    const [provider, setProvider] = useState(undefined);
    useEffect(() => {
        const sessions = ctx.get('sessions');
        const models = ctx.get('modelDirectories');
        if (sessions === undefined || models === undefined) {
            setProvider(undefined);
            return;
        }
        let attachedId;
        let stopDirectory;
        let disposed = false;
        let retryTimer;
        const clearRetry = () => {
            if (retryTimer !== undefined) {
                clearTimeout(retryTimer);
                retryTimer = undefined;
            }
        };
        const detachDirectory = () => {
            stopDirectory?.();
            stopDirectory = undefined;
            attachedId = undefined;
        };
        const attachDirectory = (id) => {
            let directory;
            try {
                directory = models.directoryFor(id);
            }
            catch {
                return false;
            }
            detachDirectory();
            attachedId = id;
            const syncProvider = () => {
                if (disposed)
                    return;
                setProvider(directory.store.getSnapshot().current?.provider ?? null);
            };
            syncProvider();
            stopDirectory = directory.store.subscribe(syncProvider);
            // Ensure catalog + projection settle after session switch (fresh directories start loading).
            void directory.load().then(syncProvider, () => { });
            return true;
        };
        const syncSession = () => {
            if (disposed)
                return;
            clearRetry();
            const next = sessions.list.getSnapshot().current;
            if (next === undefined) {
                detachDirectory();
                setProvider(null);
                return;
            }
            if (next === attachedId && stopDirectory !== undefined) {
                return;
            }
            if (attachDirectory(next))
                return;
            // list.current often updates before the session scope is minted (followCurrent
            // runs in another list subscriber). Retry shortly so we are not stuck hidden.
            detachDirectory();
            setProvider(null);
            retryTimer = setTimeout(() => {
                retryTimer = undefined;
                if (disposed)
                    return;
                const again = sessions.list.getSnapshot().current;
                if (again === undefined)
                    return;
                if (!attachDirectory(again)) {
                    // One more microtask pass after scope materialization.
                    queueMicrotask(() => {
                        if (disposed)
                            return;
                        const last = sessions.list.getSnapshot().current;
                        if (last !== undefined)
                            void attachDirectory(last);
                    });
                }
            }, 0);
        };
        syncSession();
        const stopSessions = sessions.list.subscribe(syncSession);
        return () => {
            disposed = true;
            clearRetry();
            stopSessions();
            detachDirectory();
        };
    }, [ctx]);
    return provider;
}
//# sourceMappingURL=useActiveModelProvider.js.map