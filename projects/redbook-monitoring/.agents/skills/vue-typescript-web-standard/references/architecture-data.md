# Vue Architecture And Data

## SFC 与 Feature 边界

- 先遵循现有目录；greenfield 可按 `app`、`pages/routes`、`features`、`shared` 分层，并用 import 规则约束依赖方向。
- route/feature 容器负责路由、数据和权限展示；展示 SFC 通过 typed props、emits 和 slots 保持清晰契约。
- `<script setup>`、普通 setup 和 Options API 按现有项目选择，不为风格统一做无关迁移。
- 将可独立测试的纯转换放普通函数；需要 Vue 生命周期和响应性组合的逻辑才放 composable；远端 I/O 放 service/repository。
- barrel 文件只暴露 feature 公共 API，通过 lint/依赖图防止循环依赖和跨层深层导入。

## Composable 生命周期

- composable 命名 `useXxx` 并清晰说明返回 ref、readonly state、命令和副作用。
- watch/watchEffect 仅同步真实外部依赖，设置正确 flush/cleanup；避免多个 watch 双向复制同一状态。
- 事件、observer、stream、timer 和请求在 scope dispose 或组件卸载时清理。
- 异步 composable 使用 AbortSignal、请求 identity 或 query 库取消/忽略过期结果。
- 可复用 composable 不隐式修改全局 store；需要全局副作用时通过显式命令或依赖注入。

## 五类状态与 Pinia

- **局部 UI**：组件内 `ref`/`reactive`，随组件生命周期销毁。
- **URL**：route params/query，定义解析、默认、序列化和 history 行为。
- **表单**：草稿、dirty、validation、submit，服务端刷新不覆盖未提交编辑。
- **远端缓存**：server query、stale、mutation 和失效，不复制为 Pinia 权威状态。
- **全局客户端**：会话外观、跨页面工作流等无法归入前四类的状态。

按一致性和生命周期创建多个小而内聚的 Pinia store，不限制“每模块最多一个”。组件需要解构 state/getter 时使用 `storeToRefs`；action 可直接解构。持久化 store 必须定义版本、迁移、注销清理和敏感数据禁存规则。

## 契约与异步一致性

- 在 HTTP、storage、route、postMessage 和用户输入边界做 runtime schema 校验；TypeScript 类型和 Vue props 类型不是运行时信任依据。
- API DTO、领域模型、表单输入和 view model 可分离，通过 mapper/schema 保持可追踪。
- 明确 null、unknown enum、时间/时区、金额、ID 和分页；避免不安全断言和静默默认。
- mutation 定义防重复、乐观更新、失败回滚、并发冲突和 query/store 失效范围。
- 切换用户、路由、筛选或分页时，旧请求不得覆盖新上下文；注销时清理所有用户 query 和持久 store。
- mock/fixture 覆盖慢、空、错误、未授权和旧契约，不把 mock 分支打入生产行为。

## 错误与路由

- 使用 `onErrorCaptured` 或等价组件边界隔离局部渲染错误，应用级 handler 负责遥测而非吞掉所有异常。
- service 将 transport 错误映射为 validation、unauthenticated、forbidden、not-found、conflict、rate-limit 和 unexpected。
- 处理 Vue Router navigation failure、动态 import 失败和 route guard 异常，并提供恢复或重新加载路径。
- 路由守卫只管理导航体验；真实敏感操作必须由服务端授权。
- loading、empty、error 和成功反馈保持布局稳定并对辅助技术可感知。
