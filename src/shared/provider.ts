/** Provider write targets in engine-standard settings / credentials storage. */

/** Settings namespace for pi-ai custom providers. */
export const PROVIDER_NS = 'llm-pi-ai' as const

/** Fixed route id for the SupaNexus provider row. */
export const PROVIDER_ROUTE_ID = 'supanexus' as const

/** Credential ref written by Host; referenced in provider profile. */
export const CREDENTIAL_REF = 'SUPANEXUS_API_KEY' as const

/** Refresh token credential ref (Host-only, not in settings). */
export const REFRESH_CREDENTIAL_REF = 'SUPANEXUS_REFRESH_TOKEN' as const

/** Wire protocol for the custom provider profile. */
export const PROVIDER_API = 'openai-completions' as const

/** Display name shown in the Models list. */
export const PROVIDER_DISPLAY_NAME = 'SupaNexus' as const

/** OAuth callback path on the local dsh web server (exact route). */
export const OAUTH_CALLBACK_PATH = '/supanexus/oauth/callback' as const
