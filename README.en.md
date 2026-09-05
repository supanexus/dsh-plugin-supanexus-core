# @supanexus/dsh-plugin-supanexus-core

[中文](./README.md) · English

SupaNexus platform core: branding, OAuth quick setup, dual-line model provider, and the app plugin market.

Repo: [GitHub](https://github.com/supanexus/dsh-plugin-supanexus-core)

## Install

```bash
dsh plugin --profile web add github:supanexus/dsh-plugin-supanexus-core#v0.2.0
```

Fully restart `dsh web` (or Desktop Host) after install, then open the printed `?token=` URL.

## What it does

- **Branding** — sidebar logo/name, conversation chrome, and browser tab (can be turned off in settings)
- **Quick setup** — one-click OAuth under Settings → Models; probes Global / China lines and writes the provider
- **App plugins** — browse, install, upgrade, and uninstall plugins from the sidebar market
- **Balance** (optional) — sidebar balance is off by default; enable it under plugin settings

## How to use

1. Install and restart, then open Settings → Models
2. Complete browser authorization via Quick Setup at the bottom
3. Pick **SupaNexus** from the model list; open **App Plugins** in the sidebar to install more

## Notes

- Uninstalling this plugin does **not** remove an already-written SupaNexus provider or API key
- Defaults point at production domains (`.ai` / `.io`); override `lines` in `cordis.patch.yml` for local backends

## Optional config

```yaml
config:
  lines:
    - id: global
      label: Global
      origin: https://api.supanexus.ai
      harnessOrigin: https://gateway-harness.supanexus.ai
      pluginCatalogOrigin: https://gateway-client.supanexus.ai
      consoleOrigin: https://console.supanexus.ai
    - id: cn
      label: 中国大陆
      origin: https://api.supanexus.io
      harnessOrigin: https://gateway-harness.supanexus.io
      pluginCatalogOrigin: https://gateway-client.supanexus.io
      consoleOrigin: https://console.supanexus.io
  pinnedLine: ''
  probeTimeoutMs: 2500
```

Brand and balance toggles are also available under Settings → Plugins.

## License

MIT © SupaNexus
