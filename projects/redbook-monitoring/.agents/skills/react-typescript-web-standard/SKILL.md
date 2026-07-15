---
name: react-typescript-web-standard
description: 约束、实现或审查 React + TypeScript 客户端 Web 应用，重点覆盖 Vite SPA 的组件边界、状态分层、路由、运行时数据契约、异步竞态、安全、无障碍、测试和发布。用于新建 React SPA、修改现有 React/Vite 管理后台或 SaaS 前端，或审查客户端工程质量；不用于 Next.js、Remix 等拥有服务端/路由专属约定的 React 框架。Electron renderer 可同时使用本 Skill，但桌面进程、IPC 与安全以 Electron Skill 为准。
---

# React TypeScript Web Standard

## 选择执行模式

- **greenfield**：为新的客户端 React 应用选择一套最小且一致的工具与质量门。
- **existing-project**：沿用仓库的 React major、路由、请求、状态、表单、UI 和测试方案，只做必要改动。
- **review**：不主动编辑，按严重度给出证据、行为风险和缺失测试。

## 先检查项目

开始实现或建议前：

1. 阅读仓库 `AGENTS.md`、贡献说明、目标 feature 和路由文档。
2. 检查 `package.json`、锁文件、workspace、React/TypeScript/Vite major 和包管理器。
3. 检查 router、server-state、client-state、form、runtime schema、UI/样式和 mock 方案。
4. 检查 `tsconfig`、Vite 配置、环境变量、ESLint、format、typecheck、test、build 和 preview 脚本。
5. 定位当前 feature 的 API 契约、service/loader、query cache、URL 状态、store、组件和错误边界。
6. 检查部署形态、base path、CDN/缓存、CSP、监控和 source map 策略。
7. `existing-project` 模式不得因推荐清单擅自换 router、状态库、请求库、UI 库或目录结构。

## Greenfield 决策

先按状态和能力分类，再为每类选择一个主方案：

| 需求 | 主方案 |
| --- | --- |
| 单组件短期交互 | `useState`；转换复杂或事件驱动时使用 `useReducer` |
| 可分享、可返回的筛选/分页/视图 | 路由 search params，建立解析和默认值 schema |
| 远端数据缓存、重试、失效和 mutation | 需求成立时选择 TanStack Query；简单请求可使用 router loader/service |
| 跨树且不属于服务端/URL/表单的数据 | 先评估 Context + reducer；频繁更新或复杂工具需求再选一个 client store |
| 复杂表单 | 需要字段订阅、动态数组和性能控制时选择 React Hook Form；简单表单使用原生能力 |
| HTTP transport | 复用团队已有 fetch wrapper；只有拦截、兼容或上传需求证明必要时选择 axios |

UI 体系根据现有设计系统和团队维护方式只选一个主体系。不要同时为同一职责引入多个状态、表单或请求库。

## 组件、状态与数据工作流

涉及 feature 结构、状态、请求、表单、schema、异步逻辑或错误处理时，读取 [architecture-data.md](references/architecture-data.md)。核心要求：

1. 分开管理本地 UI、URL、表单、远端缓存和全局客户端状态，并记录每份状态的所有者。
2. 路由/feature 容器可以协调 loader/service/query；展示组件保持清晰输入输出，避免叶子组件散落裸 HTTP。
3. 网络和持久化边界使用 runtime schema 验证，再映射为领域/view model；TypeScript 类型不能替代运行时校验。
4. 搜索、分页、切换账号和快速导航必须处理取消、旧响应覆盖、新旧 mutation 冲突和卸载后更新。
5. 为路由、渲染和异步事件设置适当 Error Boundary/错误 UI，并区分可重试、未授权、校验和系统错误。
6. 复用前确认语义、行为和生命周期一致；不要因“相似”强行制造大而全组件或 hook。

## 风险模式与 Companion Skills

选择且只选择最高风险模式：

- `local`：单个组件、纯 hook/helper 或同一状态所有权单元内的局部行为。
- `module`：同一 feature 内跨组件、route、query、store、form 或共享表格/筛选行为。
- `contract`：API/runtime schema、公开 route/search params、postMessage、共享组件 API 或外部消费者。
- `data-migration`：浏览器持久化 schema/语义、缓存迁移、backfill、保留或删除。
- `security-critical`：认证授权、令牌/Cookie/CSRF、支付、个人数据、构建机密和审计边界。

`existing-project` 实现模式以及 greenfield 开始写入代码前使用 `$change-impact-analysis` 并传递风险模式；纯 greenfield 决策和不计划修改的 review 不调用。任何模式只要实施了修改，完成后都使用 `$data-consistency-regression-test` 并继承同一模式。验证发现新的 `contract`、`data-migration` 或 `security-critical` 影响时，先升级并回到 `$change-impact-analysis`；最多往返两次。

companion Skill 缺失时，重建最小影响清单或执行最小验证，标记 `degraded`，不得声称已调用；缺少安全前提或两次循环后仍有关键失败时使用 `Blocked`。

## 质量与发布

涉及安全、性能、无障碍、测试或发布时读取 [quality-release.md](references/quality-release.md)。至少：

1. 使用仓库命令运行 typecheck、lint、unit/component 测试和 production build。
2. 验证 loading/empty/error/success、取消/重试、Error Boundary 和关键 mutation 的失败恢复。
3. 验证语义、键盘、焦点、表单错误、缩放、对比度、RTL 和 reduced motion。
4. 以数据验证路由拆包、bundle budget、Core Web Vitals、长列表和第三方脚本影响。
5. 发布前验证环境变量、CSP/headers、source map、监控、缓存失效、灰度和回滚 artifact。

## 输出契约

报告模式、React/TypeScript/Vite 与关键库版本、状态所有权、风险模式、改动文件、命令与人工检查证据、人工验收和回滚步骤。每个测试或检查状态必须且只能使用 `Pass`、`Fail`、`Blocked`、`Not run`、`N/A`；未执行浏览器/流程不得记为 `Pass`。review 模式给出文件与行号证据。

## References

- [architecture-data.md](references/architecture-data.md)：组件边界、五类状态、runtime schema、竞态与错误处理。
- [quality-release.md](references/quality-release.md)：Web 安全、无障碍、性能、测试、CI、发布和回滚。
