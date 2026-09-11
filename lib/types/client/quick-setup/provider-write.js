/** Write SupaNexus provider profile into engine-standard llm-pi-ai settings. */
import { CREDENTIAL_REF, PROVIDER_API, PROVIDER_DISPLAY_NAME, PROVIDER_NS, PROVIDER_ROUTE_ID, } from "../../shared/provider.js";
async function revisionOf(settings) {
    const response = await settings.describe();
    if (!response.ok)
        throw new Error(response.error.message);
    const view = response.value.namespaces.find(ns => ns.ns === PROVIDER_NS);
    return view?.revision;
}
/** Create or replace the supanexus provider row (credentials already on Host). */
export async function writeSupaNexusProvider(settings, input) {
    const revision = await revisionOf(settings);
    const value = {
        displayName: PROVIDER_DISPLAY_NAME,
        apiKeyEnv: CREDENTIAL_REF,
        api: PROVIDER_API,
        baseURL: input.baseURL,
        models: input.models.map(model => ({
            id: model.id,
            ...model.name === undefined ? {} : { name: model.name },
            ...model.contextWindow === undefined ? {} : { contextWindow: model.contextWindow },
            // pi-ai settings field is `input`; omit when unknown so catalog defaults apply.
            ...model.input === undefined || model.input.length === 0 ? {} : { input: [...model.input] },
            ...model.reasoningEfforts === undefined
                ? {}
                : { reasoningEfforts: { ...model.reasoningEfforts } },
        })),
    };
    const response = await settings.mutate(PROVIDER_NS, [{ op: 'set', path: ['providers', PROVIDER_ROUTE_ID], value }], revision);
    if (!response.ok) {
        if (response.error.code === 'settings-conflict') {
            const retryRevision = await revisionOf(settings);
            const retry = await settings.mutate(PROVIDER_NS, [{ op: 'set', path: ['providers', PROVIDER_ROUTE_ID], value }], retryRevision);
            if (!retry.ok)
                throw new Error(retry.error.message);
            return;
        }
        throw new Error(response.error.message);
    }
}
//# sourceMappingURL=provider-write.js.map