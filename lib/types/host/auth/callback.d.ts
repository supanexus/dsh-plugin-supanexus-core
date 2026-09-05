/** OAuth loopback callback handler (system browser, no session cookie). */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from '../config.ts';
/** True when the TCP peer is loopback. */
export declare function isLoopbackRemote(req: IncomingMessage): boolean;
/** Handle GET /supanexus/oauth/callback?code=&state= */
export declare function handleOAuthCallback(ctx: Context, config: Config, req: IncomingMessage, res: ServerResponse): Promise<void>;
//# sourceMappingURL=callback.d.ts.map