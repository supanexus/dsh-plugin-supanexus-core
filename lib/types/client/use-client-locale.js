import { useEffect, useState } from 'react';
/** Subscribe to DSH active locale for reactive client copy. */
export function useClientLocale(ctx) {
    const [locale, setLocale] = useState(() => ctx.locale.getSnapshot().active);
    useEffect(() => ctx.locale.subscribe(() => {
        setLocale(ctx.locale.getSnapshot().active);
    }), [ctx]);
    return locale;
}
//# sourceMappingURL=use-client-locale.js.map