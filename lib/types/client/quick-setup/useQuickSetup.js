import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAuthStatus, startAuth } from "./wire.js";
import { writeSupaNexusProvider } from "./provider-write.js";
import { quickSetupT } from "./locales.js";
function formatWireError(error, locale) {
    const t = quickSetupT(locale);
    if (error instanceof Error) {
        if (error.message === 'HOST_API_NOT_FOUND' || error.message === 'not found') {
            return t('hostApiMissing');
        }
        if (error.message === 'unauthorized') {
            return t('unauthorized');
        }
        return error.message;
    }
    return t('error');
}
const POLL_MS = 1500;
const MAX_POLL_MS = 600_000;
/** Quick-setup state machine: authorize → poll → write provider (line probe runs on host). */
export function useQuickSetup(options) {
    const { ctx, locale } = options;
    const [phase, setPhase] = useState('idle');
    const [flowId, setFlowId] = useState();
    const [authorizeUrl, setAuthorizeUrl] = useState();
    const [message, setMessage] = useState();
    const pollStartedAt = useRef();
    const pollTimer = useRef();
    const clearPoll = useCallback(() => {
        if (pollTimer.current !== undefined) {
            clearTimeout(pollTimer.current);
            pollTimer.current = undefined;
        }
    }, []);
    useEffect(() => () => clearPoll(), [clearPoll]);
    const handleDone = useCallback(async (status) => {
        if (status.baseURL === undefined || status.models === undefined) {
            throw new Error(quickSetupT(locale)('error'));
        }
        setPhase('writing');
        await writeSupaNexusProvider(ctx.remote.settings, {
            baseURL: status.baseURL,
            models: status.models,
        });
        setPhase('done');
        setMessage(quickSetupT(locale)('done'));
    }, [ctx.remote.settings, locale]);
    const schedulePoll = useCallback((id) => {
        clearPoll();
        if (pollStartedAt.current === undefined)
            pollStartedAt.current = Date.now();
        pollTimer.current = setTimeout(() => {
            void (async () => {
                if (pollStartedAt.current !== undefined
                    && Date.now() - pollStartedAt.current > MAX_POLL_MS) {
                    setPhase('error');
                    setMessage(quickSetupT(locale)('error'));
                    return;
                }
                try {
                    const status = await fetchAuthStatus(id);
                    if (status.phase === 'done') {
                        await handleDone(status);
                        return;
                    }
                    if (status.phase === 'error') {
                        setPhase('error');
                        setMessage(status.message ?? quickSetupT(locale)('error'));
                        return;
                    }
                    schedulePoll(id);
                }
                catch (error) {
                    setPhase('error');
                    setMessage(formatWireError(error, locale));
                }
            })();
        }, POLL_MS);
    }, [clearPoll, handleDone, locale]);
    const start = useCallback(async () => {
        clearPoll();
        pollStartedAt.current = undefined;
        setMessage(undefined);
        setPhase('starting');
        try {
            const started = await startAuth(locale);
            setFlowId(started.flowId);
            setAuthorizeUrl(started.authorizeUrl);
            setPhase('awaiting-approval');
            window.open(started.authorizeUrl, '_blank', 'noopener,noreferrer');
            schedulePoll(started.flowId);
        }
        catch (error) {
            setPhase('error');
            setMessage(formatWireError(error, locale));
        }
    }, [clearPoll, locale, schedulePoll]);
    const reopenAuth = useCallback(() => {
        if (authorizeUrl !== undefined) {
            window.open(authorizeUrl, '_blank', 'noopener,noreferrer');
        }
    }, [authorizeUrl]);
    return {
        phase,
        flowId,
        authorizeUrl,
        message,
        start,
        reopenAuth,
    };
}
//# sourceMappingURL=useQuickSetup.js.map