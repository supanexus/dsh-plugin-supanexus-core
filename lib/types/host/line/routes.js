/** Host HTTP route: region / auth-line status for the settings card. */
import { apiErr, apiOk } from "../../shared/auth-contract.js";
import { LINE_STATUS_PATH, toLineStatusRows, } from "../../shared/line-contract.js";
import { isAuthLineLocked, resolveAuthLine } from "./resolver.js";
function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
/** Register `GET /api/supanexus.line.status` (also auto-selects region on first call). */
export function registerLineRoutes(ctx, config) {
    ctx.effect(() => ctx.connection.fetch.register({
        path: LINE_STATUS_PATH,
        methods: ['GET'],
        fetch: async () => {
            try {
                const report = await resolveAuthLine(ctx, config);
                const body = apiOk({
                    lines: toLineStatusRows(config.lines),
                    activeLineId: report.winner.line.id,
                    source: report.source ?? 'auto',
                    latencyMs: report.winner.latencyMs,
                    locked: isAuthLineLocked(config),
                });
                return jsonResponse(body);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '无法解析访问区域。';
                return jsonResponse(apiErr(message), 400);
            }
        },
    }), 'supanexus: line.status');
}
//# sourceMappingURL=routes.js.map