# @supanexus/dsh-plugin-supanexus-core

中文 · [English](./README.en.md)

SupaNexus 平台核心：品牌样式、OAuth 快速配置、双线路模型接入，以及应用插件市场。

仓库：[GitHub](https://github.com/supanexus/dsh-plugin-supanexus-core)

## 安装

```bash
dsh plugin --profile web add github:supanexus/dsh-plugin-supanexus-core#v0.3.3
```

安装后请**完全重启** `dsh web`（或 Desktop Host），并用打印的 `?token=` 地址打开。

## 能做什么

- **品牌**：侧栏 Logo/名称、对话区标识与浏览器标签页切换为 SupaNexus 样式（可在设置中关闭）
- **快速配置**：设置 → 模型页底部一键授权；按插件配置「访问区域」钉死 Global / 中国大陆线路（首次自动选最快）
- **访问区域**：插件配置内可切换全球 / 中国大陆；授权、控制台、余额跟区域线；插件市场下载仍独立按网络探测
- **应用插件**：侧栏「应用插件」浏览、安装、升级、卸载社区与运营插件
- **余额入口**（可选）：侧栏余额默认关闭，可在设置 → 插件配置中开启

## 怎么用

1. 安装并重启后，打开设置 → 模型
2. 在底部「快速配置」完成浏览器授权
3. 模型列表出现 **SupaNexus** 后即可选用；需要装其它插件时打开侧栏「应用插件」

## 说明

- 卸载本插件后，已写入的 SupaNexus 提供方与 API Key **仍会保留**
- 品牌与余额显示可在设置 → 插件配置中调整

## License

MIT © SupaNexus
