/** Quick-setup copy keys. */

export const quickSetupMessages = {
  'zh-CN': {
    title: 'SupaNexus 快速配置',
    description: '登录授权后自动添加 SupaNexus 模型提供方，无需手填 API Key。',
    quickSetup: '快速配置',
    reopenAuth: '重新打开授权页',
    awaiting: '请在浏览器中完成授权…',
    writing: '正在写入模型提供方…',
    done: 'SupaNexus 已配置，可在上方列表中使用。',
    error: '配置失败',
    hostApiMissing: 'Host 端接口未就绪。请在插件目录执行 pnpm build，然后完全重启 dsh web / Desktop（仅刷新浏览器不够）。',
    unauthorized: '会话未授权，请关闭页面后用终端里带 ?token= 的 dsh web 地址重新打开。',
  },
  'en-US': {
    title: 'SupaNexus Quick Setup',
    description: 'Sign in to add the SupaNexus provider automatically — no API key typing.',
    quickSetup: 'Quick setup',
    reopenAuth: 'Reopen authorization',
    awaiting: 'Complete authorization in your browser…',
    writing: 'Writing model provider…',
    done: 'SupaNexus is configured. Use it in the list above.',
    error: 'Setup failed',
    hostApiMissing: 'Host API is not ready. Run pnpm build in the plugin directory, then fully restart dsh web / Desktop (refreshing the browser is not enough).',
    unauthorized: 'Session is not authorized. Close this tab and reopen using the dsh web URL with ?token= from your terminal.',
  },
} as const

export type QuickSetupLocale = keyof typeof quickSetupMessages
export type QuickSetupKey = keyof typeof quickSetupMessages['zh-CN']

/** Resolve locale tag to a supported quick-setup dictionary. */
export function quickSetupT(locale: string | undefined): (key: QuickSetupKey) => string {
  const tag = locale?.startsWith('zh') ? 'zh-CN' : 'en-US'
  const dict = quickSetupMessages[tag]
  return key => dict[key]
}
