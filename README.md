# dsh-plugin-market

DeepSeek Harness 插件市场索引仓库。插件清单写在 `plugins.txt`，用 DSH 官方参考生成器构建出 `public/index.json`。

同一份产物支持两种 DSH 索引源：

- **Git 仓库源**：`git+https://<host>/<owner>/<repo>.git?path=public%2Findex.json&ref=main`
- **静态 JSON 源**：`https://<user>.github.io/<repo>/index.json`

图标默认以内联 `data:` URL 写入索引（上限 32 KiB），因此两种源都能显示图标。

## 文件说明

| 文件 | 作用 |
|---|---|
| `plugins.txt` | 插件来源清单，每行一个 npm 包名或 https Git 仓库 URL |
| `scripts/build.sh` | 拉取 DSH 源码并调用官方生成器 |
| `public/index.json` | 生成产物，提交到仓库并发布到 Pages |
| `.github/workflows/build-market.yml` | 定时生成、回写索引、发布 GitHub Pages |

## 本地生成

在 Git Bash / Linux / macOS 中运行：

```sh
DSH_HARNESS_DIR="E:/workspace/deepseek-harness" bash scripts/build.sh
```

如果未设置 `DSH_HARNESS_DIR`，脚本会把 DSH 浅克隆到本仓库的 `.dsh-harness/`。设置 `UPDATE_DSH=1` 可更新该克隆。

可用环境变量：

| 变量 | 默认值 |
|---|---|
| `DSH_MARKET_TITLE` | `DSH Plugin Market` |
| `DSH_MARKET_DESCRIPTION` | `Community DSH plugin index` |
| `DSH_HARNESS_DIR` | `.dsh-harness/` |
| `UPDATE_DSH` | `0` |

## 添加插件

编辑 `plugins.txt`：

```text
# npm 包：必须声明 dsh.bundle，且非 private、未弃用
@scope/dsh-example

# Git 仓库：默认分支和发布标签中的 bundle 会被列出
https://github.com/you/dsh-plugin
```

把本仓库改成公开仓库，并在 DSH 中开启 **插件 → 实验性插件 → 自定义插件索引**，再添加上面两种索引源之一。

## 自动化

推送 `plugins.txt`、`scripts/build.sh` 或工作流文件会触发构建；每天 UTC 03:17 也会定时重建。生成结果会提交回 `public/`，同时发布到 GitHub Pages。

如果某个来源读取失败，生成器返回非 0，工作流会失败并保留上一次提交的成功索引。

## 安全提醒

索引内容是第三方声明。DSH 只校验格式，不校验标题、作者、来源是否真实。只收录你信任的插件，并在安装确认框中核对来源。
