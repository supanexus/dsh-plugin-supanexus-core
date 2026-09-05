# @supanexus/dsh-plugin-supanexus-core

[中文](./README.md) · English

SupaNexus platform core: branding, OAuth quick setup, dual-line model provider, and the app plugin market.

Repo: [GitHub](https://github.com/supanexus/dsh-plugin-supanexus-core)

## Install

```bash
dsh plugin --profile web add github:supanexus/dsh-plugin-supanexus-core#v0.3.1
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
- Brand and balance toggles are available under Settings → Plugins

## License

MIT © SupaNexus
