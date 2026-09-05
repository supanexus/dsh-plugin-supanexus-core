/** Brand copy keys. */

export const brandMessages = {
  'zh-CN': {
    subtitle: '智能 Agent 平台',
  },
  'en-US': {
    subtitle: 'AI Agent Platform',
  },
} as const

export type BrandLocale = keyof typeof brandMessages
export type BrandKey = keyof typeof brandMessages['zh-CN']

/** Resolve locale tag to brand dictionary accessor. */
export function brandT(locale: string | undefined): (key: BrandKey) => string {
  const tag: BrandLocale = locale?.startsWith('zh') ? 'zh-CN' : 'en-US'
  const dict = brandMessages[tag]
  return key => dict[key]
}
