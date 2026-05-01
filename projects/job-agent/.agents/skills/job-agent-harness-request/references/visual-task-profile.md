# Visual Task Profile

本文件只在截图、设计图、Figma、页面一比一复刻、视觉还原、UI 重构等任务中启用。

## 触发条件

只要需求包含以下任一信号，就按本 profile 执行：

- 用户提供截图、设计图、Figma、参考页面或视觉稿。
- 用户要求“一比一”“像素级”“复刻”“高度还原”“按图实现”。
- 任务主要结果是页面、组件、布局、样式、图标、动效或视觉状态。

## 任务目录增量文件

在通用任务文件之外，必须补充：

```text
.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/
├── input/reference.png 或 input/reference.md
├── visual-spec.md
├── visual-checklist.md
├── visual-review.md
├── visual-defects.md
└── snapshots/
    ├── actual-initial.png
    ├── actual-after-fix-1.png
    └── actual-final.png
```

如果参考图只存在于当前对话，`input/reference.md` 必须记录图片编号、尺寸、关键区域和无法落盘的原因。

## Planner 必做

- 先识别参考图尺寸、目标视口、页面外框、主网格、模块边界和滚动规则。
- 明确截图基准：浏览器视口或 Electron 窗口尺寸、CSS 像素尺寸、deviceScaleFactor、zoomFactor、系统缩放假设。
- 对 Electron 任务，必须记录目标窗口尺寸、最小窗口尺寸、缩放策略和自适应断点；不能只按当前机器截图尺寸实现。
- 在 `visual-spec.md` 中记录颜色、字号、字重、间距、圆角、边框、阴影、图标风格和状态文案。
- 在 `visual-checklist.md` 中按区域列出验收项，至少覆盖：标题栏、侧栏、顶部工具栏、主内容区、结果列表、右侧面板、底部操作、滚动/溢出。
- 在 `visual-checklist.md` 中额外列出缩放和响应式验收项，至少覆盖目标视口、窄屏或缩放视口、内容溢出、侧栏/面板压缩规则。
- `task-package.yaml.done_when` 必须包含“无 blocking/major 视觉缺陷”。
- 如果缺少可运行的截图环境，先记录风险，不得把视觉任务标为已验证。
- 如果视觉任务同时改变交互状态、数据计算、列表生成、表单校验、API/IPC 或文件流程，必须按 `functional-verification.md` 先生成并执行 `functional-test-plan.md`，不能只靠截图对比证明功能正确。
- 如果视觉任务同时涉及页面可操作状态，必须按 `interaction-verification.md` 生成 `interaction-test-plan.yaml`，先确认目标控件可识别、可点击、状态可变化，再进入截图对比。

## Coder 必做

- 实现前先按 `visual-spec.md` 建立布局比例和缩放策略，避免只在单一截图尺寸下硬编码。
- 优先用项目已有设计系统、SVG、CSS 图形或现有图标资源；不要用 Unicode 字符假冒图标，除非参考图本身就是文本字符。
- 先搭建与参考图一致的整体网格，再实现组件细节；不要先堆内容再靠局部微调。
- 为截图复刻任务定义局部 design tokens，例如主色、背景、边框、字号、模块尺寸、栏宽。
- 保持内容密度接近参考图，不要为了代码简洁牺牲间距、行高、区域比例。
- 视频、图片、缩略图可用静态模拟，但必须在 `decision-log.md` 写明替代策略。
- 如果 verifier 记录了 open 状态的 `blocking` 或 `major` 缺陷，coder 必须优先修复这些缺陷，不得继续新增无关功能。
- 每轮修复后必须在 `decision-log.md` 记录修复了哪些视觉缺陷、放弃了哪些差异以及原因。

## Verifier 必做

- 使用真实浏览器或 Electron 窗口截图，保存到 `snapshots/`，至少包含 `actual-initial.png` 和最终 `actual-final.png`。
- 使用 MCP Playwright 或项目 Playwright 时，截图前必须先获取 snapshot，确认主要区域、按钮、表单和面板在可访问结构中存在；snapshot 结果应保存或摘要写入 `visual-review.md`。
- 截图前必须记录运行环境：视口尺寸、窗口尺寸、deviceScaleFactor、zoomFactor、系统缩放假设、截图文件名。
- 对 Electron 任务，至少验证目标窗口尺寸和一个缩放/窄屏退化视口；如果无法验证第二视口，状态不得超过 `needs_visual_verification`。
- 在 `visual-review.md` 按区域对比参考图和实际图，不能只写“已截图”。
- 对每个区域写出“参考图表现 / 实际表现 / 差异 / 修复动作或接受理由”。
- 在 `visual-defects.md` 记录缺陷表：

```text
| 区域 | 严重度 | 差异 | 修复建议 | 状态 |
| --- | --- | --- | --- | --- |
| 右侧面板 | major | 宽度和内边距偏离参考图 | 调整网格列宽和 padding | open |
```

- 严重度使用 `blocking`、`major`、`minor`、`accepted-difference`。
- 存在 open 状态的 `blocking` 或 `major` 时，状态不得进入 `ready_for_human_review`，必须回到 coder 至少迭代一轮。
- 每轮 coder 修复后，verifier 必须重新截图，保存为 `actual-after-fix-N.png`，再次更新 `visual-review.md` 和 `visual-defects.md`。
- 如果仍有 open 状态的 `blocking` 或 `major`，继续回到 coder；除非环境阻塞，否则不得把任务交付为完成。
- 机器验证通过只代表构建和截图流程可运行，不代表视觉验收通过。
- 如果只完成截图但没有 snapshot、区域对比、缺陷记录和复验，视觉验证必须判定为失败或停在 `needs_visual_verification`。

## 视觉对比矩阵

`visual-review.md` 必须包含区域级对比矩阵：

```text
| 区域 | 参考图要求 | 实际截图 | 差异 | 严重度 | 处理结果 |
| --- | --- | --- | --- | --- | --- |
| 右侧面板 | 宽约 480px，顶部 tab 高 56px | 宽约 420px，tab 偏窄 | 面板比例偏差明显 | major | 已调整 grid 列宽 |
```

至少覆盖：

- 整体窗口尺寸、留白、安全边界。
- 三栏或多栏主布局比例。
- 标题栏、顶部工具栏、按钮密度。
- 主视频或核心内容区域。
- 列表、缩略图、文本列宽、行高。
- 右侧表单/面板/底部按钮。
- 字体、颜色、图标、边框、圆角、阴影。
- 滚动、溢出、裁切。
- 目标视口和缩放/窄屏退化视口。

## 自修复闭环

视觉任务必须执行以下闭环：

```text
实现
-> 截 actual-initial.png
-> 区域级对比 reference 与 actual-initial
-> 写 visual-defects.md
-> 如有 open blocking/major，回到 coder 修复
-> 截 actual-after-fix-N.png
-> 重新对比并更新缺陷状态
-> 无 open blocking/major 后截 actual-final.png
-> 进入 ready_for_human_review
```

规则：

- 只截图不对比视为验证失败。
- 只记录缺陷不修复视为验证失败。
- 修复后不复验视为验证失败。
- `accepted-difference` 必须写明接受原因，不能用来掩盖明显偏差。
- 如果因为环境限制无法完成截图、缩放或复验，必须进入 `needs_visual_verification`，并在 `handoff.md` 写明阻塞。

## 推荐视觉对照顺序

1. 页面尺寸和安全边界。
2. 三栏/多栏主布局比例。
3. 顶部标题栏和工具栏。
4. 主视频或核心内容区域。
5. 列表、表单、按钮和面板状态。
6. 字体、颜色、边框、阴影、图标。
7. 滚动、溢出、裁切和响应式退化。
8. Electron 窗口缩放、系统缩放和最小窗口表现。

## 完成条件

截图任务只有在以下条件都满足时，才能进入 `ready_for_human_review`：

- 构建、类型检查或项目原生命令没有阻塞性失败。
- 涉及功能行为或核心流程时，`functional-test-plan.md` 中 blocking/high 风险功能点已经通过，并写入 `validations.json.functional_checks`。
- 已保存初始截图、修复后截图和最终截图；如果没有修复轮次，必须说明初始截图无 blocking/major 缺陷。
- `visual-review.md` 已完成区域级对照。
- `visual-defects.md` 中没有 open 状态的 `blocking` 或 `major` 缺陷。
- 已验证目标视口和至少一个缩放/窄屏退化视口，或明确记录环境阻塞并停在 `needs_visual_verification`。
- 残余差异被明确标为 `minor` 或 `accepted-difference`，并说明原因。
