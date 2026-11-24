# DSH 插件市场索引

## 如何设置索引源

1. 打开 DSH，进入 **插件**
2. 在 **实验性插件** 下打开 **自定义插件索引**
3. 进入 **发现** 标签页，点 **添加索引源**，会看到这个弹窗：

   ![添加索引源截图](docs/images/add-index-source.png)

4. 在「源地址」里粘贴下面这个地址，点 **添加**：

```text
https://sinyookkkk.github.io/dsh-plugin-market/index.json
```

之后就可以在「发现」里搜索并安装插件。

> 注意：这是**索引源地址**，不是插件安装包，不要粘到「安装插件」的输入框里。
> 如果你用的 `desktop-tauri` 打包版打不开「发现」页，那是打包漏了 `worker.cjs`，
> 请改用官方命令启动：`npx @deepseek-ai/dsh web`，再打开 `http://127.0.0.1:3080`。

---

## 分类与标签

索引现在带 9 个分类和 6 个标签，DSH「发现」页会显示分类 pills 和 Labels 菜单：

| 分类 | 内容 |
|---|---|
| 必备基础 | 上下文压缩、费用统计、上下文仪表盘 |
| 能力增强 | 视觉、搜索、记忆、文件引用、安全、工具目录 |
| 界面效率 | 侧边栏、Web 全家桶、PPT、对话分支 |
| 开发工作流 | LSP、Git、代码审查、TDD、OpenSpec/Superpowers、VSCode 模式 |
| Token 优化 | 上下文压缩、工具结果折叠、用量统计与预算 |
| 绘图设计 | 草图、白板、drawio、Mermaid、Excalidraw、文生图 |
| 3D 建模 | Blender、CAD、USD 预览、分子查看、GenUI |
| 趣味美化 | 宠物、余额挂件、表情包、主题、PUA |
| 其他 | 经显式登记的少数插件 |

标签：`视觉`、`搜索`、`记忆`、`节省消耗`、`用量统计`、`需本机环境`。

维护方式：新增或移除 `plugins.txt` 里的来源后，同步修改根目录的 `categories.json`。
索引中的每个插件都必须有显式分类，缺失会让构建失败并列出包名；使用「其他」的插件必须列在
`otherAllow` 里。构建会打印每个分类的插件数量。分类和标签只改索引，不需要发新版 DSH。

---

## 商店收录了哪些 plugin

目前共 **72 个**。名称就是 DSH 里可以搜索的关键字。

### 必装与实用

| 插件 | 作用 |
|---|---|
| `billion-context` | 上下文压缩，省 token |
| `dsh-cost-meter` | 费用统计、余额与峰谷提醒 |
| `dsh-context` | 上下文仪表盘，看清 token 花在哪 |

### 能力补全

| 插件 | 作用 |
|---|---|
| `@liustack/modlens` | 图片识别 / OCR |
| `dsh-vision-router` | 免费识图通道 |
| `dsh-web-search-pro` | 多源聚合搜索 |
| `@vectorize-io/hindsight-coding-agents` | Agent 长期记忆 |
| `dsh-openviking` | OpenViking 语义检索与记忆 |
| `dsh-at-file` | 用 `@` 引用本地文件 |
| `cc-safety-net` | 拦截危险命令，防误删 |

### 界面与效率

| 插件 | 作用 |
|---|---|
| `dsh-better-sidebar` | 文件树、编辑器、终端、子代理侧边栏 |
| `@linxin666/dsh-web-all` | DSH Web 全家桶 |
| `@tt-a1i/archify-dsh` | 自动画项目架构图 |
| `dsh-ppt` | 一句话生成 PPT |
| `dsh-synapse` | 对话分支画布 |

### 规范与方法论

| 插件 | 作用 |
|---|---|
| `dsh-openspec-opsx` | OpenSpec 规格驱动工作流 |
| `@dragon-talon/dsh-openspec` | OpenSpec 技能与命令别名 |
| `specpowers` | OpenSpec + Superpowers 组合 |
| `superpowers-dsh` | Superpowers 软件开发方法论 |
| `@zfdx123/dsh-superpowers` | Superpowers 技能与会话引导 |

### 编码增强与高星补充

| 插件 | 作用 |
|---|---|
| `dsh-lsp-actions` | LSP 诊断、格式化、补全、跳转定义 |
| `dsh-ide-git` | IDE 级 Git 工具窗口，作为侧边栏 Tab |
| `@michengai/dsh-code-review` | 独立子 Agent 做代码审查，出中英文报告 |
| `@ziduup/dsh-programming-mode` | 强制 TDD、先计划后编码、完成前验证 |
| `dsh-vscode-mode` | 类 VSCode 编辑体验，Monaco 编辑器与文件页签 |
| `dsh-purge-community` | 状态自检、提示词/规则管理、本机备份与回滚 |
| `treg-dsh` | 工具目录，4000+ agent-friendly 工具按需调用 |

### 更多高星插件

| 插件 | 作用 |
|---|---|
| `huashu-nuwa` | 把任何人蒸馏成可运行的思维 Skill |
| `dsh-plugin-wallpaper-engine` | DSH 网页壁纸引擎 |
| `dsh-ops` | Windows/Linux 原生文件与 PTC 工具 |
| `@nanmicoder/dsh-agent-teams` | 多 Agent 团队协作 |
| `dsh-mnemon` | 可组合的视图式上下文管理 |
| `@liustack/modsearch` | 面向编码 Agent 的免费网页搜索 |
| `@ljwei-stak/dsh-model-route-bot` | 模型路由与官方工具 bot 工作区 |
| `@michengai/dsh-skills-manager` | 统一加载与管理本机 Agent Skills |
| `@tencent-connect/dsh-qqbot` | 在 QQ 私聊/群聊里对话 DSH |

### Token 优化

**直接省 token**（注意：压缩/折叠类插件会接管同一套上下文逻辑，建议一次只启用一个）：

| 插件 | 作用 |
|---|---|
| `dsh-boost` | 把工具回执投影成精简版，并用确定性的只读调用替代大模型调用 |
| `dsh-context-compression-improved` | 每轮工具结果都更少 token，且全程可审计 |
| `dsh-context-fold` | 阶段结束时把已完成的工具结果折叠成结论，只留少量指针 |
| `dsh-live-compact` | 任务运行中就地压缩最近一轮，边跑边省，354 star |
| `dsh-compaction-weave` | 缓存友好的增量摘要，保留要求与进度，支持历史回查和失败重试 |
| `billion-context-dsh` | 主动上下文剪枝（ACP），模型驱动管理上下文，171 star |
| `dsh-compact-manager` | 手动/自动压缩均可切到「机械折页」，速度快且不消耗 token |
| `dsh-compact-suite` | 本地部署压缩控制面：一键压缩、摘要改走小模型省 prefill |
| `dsh-compact-arsenal` | 可配置的上下文压缩，三段独立控制 |
| `dsh-context-redline` | 发送前审阅、编辑或删掉模型将收到的上下文 |
| `dsh-context-compression-selector` | 一次装好压缩选择器，按需切换压缩策略 |
| `dsh-token-saver` | 在不影响任务质量的前提下做激进 token 优化 |

**统计花费与预算**（不直接省 token，但能看清花在哪）：

| 插件 | 作用 |
|---|---|
| `dsh-token-manager` | Token 成本监控、模型调用效率分析与上下文优化 |
| `dsh-billing-stats` | 只读的按轮次/会话账单统计 |
| `dsh-usage-stats` | token 趋势、活跃热力图、模型占比 |
| `dsh-auto-memory` | 可审计的自动记忆，减少重复上下文注入，207 star |

### 绘图与草图

| 插件 | 作用 |
|---|---|
| `dsh-sketch` | 输入框「+」菜单里的随手画板，画完直接当图片附件发进对话 |
| `dsh-sketchpad` | 手写与示意图白板 |
| `dsh-drawai` | 右侧栏可编辑画布 + AI 语义绘图，读写原生 `.drawio` |
| `dsh-diagram` | 把文章转成可编辑的 Excalidraw 画布 |
| `dsh-mermaid` | 在 DSH 中渲染和编辑 Mermaid 代码块 |
| `dsh-diagram-studio` | 规格驱动的图表审查与修复 |
| `dsh-diagram-leapavid` | 50 种编辑式图表类型与品牌配色 |
| `dsh-draw` | 统一管理多种静态图片生成模型的绘图工具 |
| `dsh-draw-mode` | 把本地 ComfyUI 接到 DSH 里绘图 |
| `dsh-image-gen` | ChatGPT 风格文生图，支持 Gemini/OpenAI/Seedream 等 |

### 3D 与建模

| 插件 | 作用 |
|---|---|
| `dsh-blender-studio` | Blender 建模工作台 |
| `dsh-cad` | 2D / 3D CAD 建模 |
| `dsh-usd-3d-preview` | USD 3D 预览 |
| `dsh-molecular-viewer` | 三维分子结构查看 |
| `@changfenhuang/dsh-genui` | 通用 UI 生成，含 3D 场景 |

### 趣味与美化

| 插件 | 作用 |
|---|---|
| `dsh-pet` | 桌面宠物鲸鱼娘 |
| `dsh-whale-widget` | 右下角余额挂件 |
| `@michengai/dsh-pua` | 给 AI 上强度的 PUA 玩法 |
| `dsh-meme` | 表情包斗图 |
| `dsh-claude-style` | Claude Code 风格主题 |
