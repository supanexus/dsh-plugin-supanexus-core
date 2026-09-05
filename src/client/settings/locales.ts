/** Locales for the SupaNexus plugin settings card. */

export interface SettingsCardCopy {
  readonly title: string
  readonly description: string
  readonly showWallet: string
  readonly showWalletHint: string
  readonly showBrand: string
  readonly showBrandHint: string
  readonly readOnly: string
  readonly expand: string
  readonly collapse: string
}

const ZH: SettingsCardCopy = {
  title: 'SupaNexus',
  description: '平台连接与侧栏展示相关选项。',
  showWallet: '在侧栏显示余额',
  showWalletHint: '关闭后侧栏不再显示余额入口；仅在当前模型服务商为 SupaNexus 时才会出现该入口。',
  showBrand: '显示 SupaNexus 品牌样式',
  showBrandHint: '关闭后恢复 DSH 默认品牌（侧栏 Logo/名称、对话区标识与标题、浏览器标签页）。',
  readOnly: '当前连接为只读，无法保存更改。',
  expand: '展开',
  collapse: '收起',
}

const EN: SettingsCardCopy = {
  title: 'SupaNexus',
  description: 'Connection and sidebar display options.',
  showWallet: 'Show balance in sidebar',
  showWalletHint: 'When off, the sidebar balance entry is hidden. It only appears when the current model provider is SupaNexus.',
  showBrand: 'Show SupaNexus branding',
  showBrandHint: 'When off, restores the default DSH brand (sidebar mark/name, conversation hero, and browser tab).',
  readOnly: 'This connection is read-only; changes cannot be saved.',
  expand: 'Expand',
  collapse: 'Collapse',
}

export function settingsCardT(locale: string | undefined): (key: keyof SettingsCardCopy) => string {
  const table = locale?.toLowerCase().startsWith('zh') ? ZH : EN
  return (key) => table[key]
}
