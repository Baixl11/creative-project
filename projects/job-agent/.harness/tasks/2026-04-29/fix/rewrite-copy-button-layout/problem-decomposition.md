# 问题拆解

## 用户目标

让“简历改写建议”的复制按钮不遮挡建议文本，并以更轻量的复制 icon 呈现在文本框之外。

## 当前状态

- `web_app.py` 在“简历改写”页签中使用 `st.code()` 展示 `suggestion.rewrite_bullet`。
- Streamlit 会在 `st.code()` 右上角自动放复制按钮。
- 文本较短或换行时，按钮可能覆盖部分文本区域，影响阅读。

## 期望状态

- 不再用 `st.code()` 展示建议写法。
- 使用自定义可复制文本块：上方工具栏放 SVG 复制 icon，下面文本框只展示内容。
- 文本需要 HTML 转义，避免简历/JD 文本被当作 HTML 执行。

## 非目标

- 不重做整个 Web UI。
- 不改报告生成、匹配、简历改写算法。
- 不接入前端框架或新增复杂依赖。

## 硬约束

- 保持 Streamlit 本地运行。
- 不引入外部网络资源。
- UI 改动应尽量局部。

## 不确定点

- 当前环境没有可直接调用的浏览器自动化工具；本轮以单元测试、编译和 Streamlit 健康检查作为机器验证，视觉细节需要用户最终确认。

## 问题分类

主要类型：`fix`

次要类型：`ui-fidelity`

## 已读取证据

- `web_app.py`：第 243 行使用 `st.code(_to_chinese_display(suggestion.rewrite_bullet), language="text")`。
- `tests/test_web_app.py`：已有 Web UI 辅助函数测试，可新增 HTML builder 测试。

## 方案选项

### 方案 A：替换 `st.code()` 为自定义可复制组件

- 修改范围：`web_app.py` 和 `tests/test_web_app.py`。
- 优点：可以完全控制按钮位置，避免遮挡；不引入新依赖。
- 风险：自定义 HTML/JS 需要注意转义和浏览器剪贴板兼容。
- 验证方式：单元测试检查 HTML 转义和结构；py_compile；Streamlit smoke。
- 项目适配性：只影响展示层，不碰 Agent 核心。

### 方案 B：继续用 `st.code()`，靠 CSS 调整内置按钮

- 优点：改动少。
- 风险：Streamlit 内置 DOM 结构可能变；仍难保证按钮不遮挡。
- 放弃理由：用户明确希望按钮放到文本框之外，内置按钮不适合。

## 首选方案

选择方案 A。

## 工作包拆分

| 工作包 | 目标 | 预计文件 | 依赖 | 验证 |
| --- | --- | --- | --- | --- |
| 可复制文本块 | 新增 HTML builder 和渲染函数 | `web_app.py` | 无 | 单测、编译 |
| 替换建议写法展示 | 移除 `st.code()` 使用 | `web_app.py` | 可复制文本块 | 编译 |
| 测试 | 检查结构、转义、无 Streamlit code block | `tests/test_web_app.py` | 可复制文本块 | unittest |

## 风险与降级

- 如果浏览器剪贴板 API 不可用，组件内使用隐藏 textarea + `execCommand("copy")` 作为降级。
- 如果用户仍觉得视觉不理想，下一轮可进一步调 icon 位置、尺寸或颜色。
