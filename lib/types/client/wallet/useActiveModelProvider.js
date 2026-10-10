/** Subscribe to the active session's model provider (shared modelDirectories state). */
import { useEffect, useState } from 'react';
/**
 * Provider id of the currently opened session's model selection.
 * `undefined` while uiSession/modelDirectories are unavailable;
 * `null` when there is no current session or no selection yet.
 *
 * Navigation lives on `uiSession.adapter.current` (SessionList no longer
 * exposes `.current` after the Controller / ui-session split).
 */
export function useActiveModelProvider(ctx) {
    const [provider, setProvider] = useState(undefined);
    useEffect(() => {
        let attachedId;
        let stopDirectory;
        let stopBinding;
        let disposed = false;
        let retryTimer;
        let waitTimer;
        const clearRetry = () => {
            if (retryTimer !== undefined) {
                clearTimeout(retryTimer);
                retryTimer = undefined;
            }
        };
        const clearWait = () => {
            if (waitTimer !== undefined) {
                clearTimeout(waitTimer);
                waitTimer = undefined;
            }
        };
        const detachDirectory = () => {
            stopDirectory?.();
            stopDirectory = undefined;
            attachedId = undefined;
        };
        const detachBinding = () => {
            stopBinding?.();
            stopBinding = undefined;
        };
        const attachDirectory = (id, models) => {
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
            void directory.load().then(syncProvider, () => { });
            return true;
        };
        const bind = () => {
            if (disposed)
                return;
            const uiSession = ctx.get('uiSession');
            const models = ctx.get('modelDirectories');
            if (uiSession === undefined || models === undefined) {
                setProvider(undefined);
                clearWait();
                waitTimer = setTimeout(bind, 50);
                return;
            }
            clearWait();
            detachBinding();
            const binding = uiSession.adapter.current;
            const syncSession = () => {
                if (disposed)
                    return;
                clearRetry();
                const next = binding.getSnapshot().key;
                if (next === undefined) {
                    detachDirectory();
                    setProvider(null);
                    return;
                }
                if (next === attachedId && stopDirectory !== undefined) {
                    return;
                }
                if (attachDirectory(next, models))
                    return;
                // Binding often updates before the session scope is minted. Retry shortly.
                detachDirectory();
                setProvider(null);
                retryTimer = setTimeout(() => {
                    retryTimer = undefined;
                    if (disposed)
                        return;
                    const again = binding.getSnapshot().key;
                    if (again === undefined)
                        return;
                    if (!attachDirectory(again, models)) {
                        queueMicrotask(() => {
                            if (disposed)
                                return;
                            const last = binding.getSnapshot().key;
                            if (last !== undefined)
                                void attachDirectory(last, models);
                        });
                    }
                }, 0);
            };
            syncSession();
            stopBinding = binding.subscribe(syncSession);
        };
        bind();
        return () => {
            disposed = true;
            clearRetry();
            clearWait();
            detachBinding();
            detachDirectory();
        };
    }, [ctx]);
    return provider;
}
