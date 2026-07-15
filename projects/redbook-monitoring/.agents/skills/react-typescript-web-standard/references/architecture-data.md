# React Architecture And Data

## Feature 与组件边界

- 先遵循现有目录；greenfield 可按 `app`、`routes/pages`、`features` 和 `shared` 分层，但用 import 边界而非目录名称保证架构。
- route/feature 容器负责路由参数、数据编排和权限展示；展示组件通过明确 props、children 或组合接口工作。
- 允许在合适的 feature 边界 colocate query 和 UI，不规定所有请求必须远离组件；禁止的是重复裸 transport 和不清晰所有权。
- 组件只在拥有独立行为、复用价值或测试边界时拆分；不要以行数或“单一职责”口号机械拆分。
- barrel `index.ts` 只导出 feature 公共 API，并通过 lint/依赖图阻止循环依赖和跨层深层导入。

## 五类状态

- **本地 UI**：展开、hover、临时选择等，靠近使用点保存。
- **URL**：筛选、排序、分页、tab 和可分享视图；用 schema 解析非法/缺省值并定义历史记录行为。
- **表单**：编辑草稿、dirty、validation、submit；服务端结果回填不能覆盖用户未提交输入。
- **远端缓存**：query result、stale、loading、mutation；query key 包含所有影响结果的身份/筛选维度。
- **全局客户端**：主题、跨树工作流等无法归入前四类的状态；按一致性和生命周期拆 store，不以业务对象强制“一对象一 store”。

避免将同一可变状态同时复制进 URL、query cache、store 和组件。确需派生副本时定义同步方向、初始化和失效，不用双向 effect 猜测一致性。

## 契约与运行时校验

- 在 HTTP、storage、postMessage、URL 和用户输入边界做 runtime schema 校验；复用项目已有 Zod/Valibot/生成方案。
- API DTO、领域模型、表单输入和 view model 可以不同，通过 mapper 和 schema 建立可追踪关系。
- OpenAPI/JSON Schema 可生成客户端类型和 fixture；生成结果由 CI 检查漂移，禁止手改生成文件。
- 明确 unknown enum、null、时间/时区、金额、ID 和分页语义；不要用 type assertion 绕过不可信数据。
- mock/fixture 模拟成功、空、慢、错误、未授权和旧契约，并确保不进入生产代码路径。

## 异步、竞态与 Mutation

- 使用 AbortSignal、query client 或 router 能力取消过时请求；组件卸载和路由切换后不提交旧结果。
- 搜索/筛选请求用请求 identity 或库提供的去重保证后发结果不被先发慢响应覆盖。
- mutation 定义防重复、乐观更新、失败回滚、并发冲突和失效范围；按钮 disabled 不是服务端幂等保证。
- effect 只同步外部系统，不用 effect 复制可在 render 中派生的状态；依赖数组必须反映真实依赖。
- 订阅、timer、observer 和事件监听在 cleanup 中释放，Strict Mode 下保持可重复执行。

## 错误处理

- route Error Boundary 处理路由/加载失败，局部边界隔离易失败 widget；事件 handler 错误仍需显式捕获和展示。
- 错误分类为 validation、unauthenticated、forbidden、not-found、conflict、rate-limit、network 和 unexpected。
- 向用户提供可执行恢复动作；日志保留 trace/correlation ID 但脱敏请求和个人数据。
- loading、empty 和 error 状态保持布局稳定且可被辅助技术感知。
