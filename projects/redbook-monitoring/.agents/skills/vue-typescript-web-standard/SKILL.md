---
name: vue-typescript-web-standard
description: 约束、实现或审查 Vue 3 + TypeScript 客户端 Web 应用，重点覆盖 Vite SPA、Composition API、Pinia、路由、运行时数据契约、异步竞态、安全、无障碍、测试和发布。用于新建 Vue 3 SPA、修改现有 Vue/Vite 管理后台或业务系统，或审查客户端工程质量；不用于 Nuxt、Vue 2 或其他带专属服务端约定的框架。Electron renderer 可同时采用本 Skill，但桌面进程、IPC 与安全以 Electron Skill 为准。
---

# Vue TypeScript Web Standard

## 选择执行模式

- **greenfield**：为新的 Vue 3 SPA 选择一套最小且一致的工具、目录和质量门。
- **existing-project**：保留现有 Vue major、router、Pinia/状态、请求、表单、UI 和测试方案，只做必要改动。
- **review**：不主动编辑，按严重度报告组件、状态、契约和发布风险。

## 先检查项目

开始前：

1. 阅读仓库 `AGENTS.md`、贡献说明、目标 feature 和路由文档。
2. 检查 `package.json`、锁文件、workspace、Vue/TypeScript/Vite major 和包管理器。
3. 检查 Vue Router、Pinia/其他状态、server-state、form、runtime schema、UI 和 mock 方案。
4. 检查 `tsconfig`、Vite、ESLint、format、vue-tsc/typecheck、test、build 和 preview 命令。
5. 定位当前 feature 的 API、service、composable、query cache、route query、store、SFC 和全局错误处理。
6. 检查部署、base path、CDN/缓存、CSP、环境变量、监控和 source map 策略。
7. `existing-project` 模式不得因推荐清单擅自换状态库、路由、请求库、UI 库或目录结构。

## Greenfield 决策

每类职责只选择一个主方案：

| 需求 | 主方案 |
| --- | --- |
| 单组件短期 UI | 使用局部 `ref`/`reactive`，避免进入 Pinia |
| 可分享的筛选、分页和 tab | 使用 Vue Router query，并用 schema 解析默认/非法值 |
| 远端数据缓存、重试、失效和 mutation | 需求成立时选择 TanStack Query for Vue；简单请求由 route/feature composable 协调 service |
| 跨页面且不属于远端/URL/表单的数据 | 使用按一致性边界拆分的 Pinia store，而非每模块一个巨型 store |
| 复杂表单 | 需要跨字段 schema、动态字段和细粒度状态时选择一套表单方案；简单表单使用组件与原生约束 |
| HTTP transport | 优先项目统一 fetch service；只有拦截、上传进度或兼容需求时选择 axios |

UI 体系按现有设计系统和团队维护能力选择一个主体系。不要为同一职责混用多个状态、表单或请求库。

## 组件、状态与数据工作流

涉及 SFC、composable、store、请求、表单、schema、异步或错误处理时，读取 [architecture-data.md](references/architecture-data.md)。核心要求：

1. 分开管理局部 UI、route query、表单、远端缓存和全局客户端状态，记录唯一写入所有者。
2. route/feature composable 可以协调 service/query；展示组件通过 typed props/emits/slots 工作，不散落裸 HTTP。
3. 网络、storage、route 和用户输入在边界做 runtime schema 验证，再映射领域/view model。
4. Pinia 按一致性和生命周期拆 store；组件读取响应式 state 时使用 `storeToRefs` 或保持属性访问，避免错误解构。
5. composable 明确 effect、watch、订阅、timer 和请求的启动/停止；快速导航和筛选防止旧响应覆盖新状态。
6. 使用组件级捕获、全局 handler 和路由错误 UI 分层处理异常，并给用户可执行恢复动作。

## 风险模式与 Companion Skills

选择且只选择最高风险模式：

- `local`：单个 SFC、纯 composable/helper 或同一状态所有权单元内的局部行为。
- `module`：同一 feature 内跨组件、route、query、Pinia store、form 或共享表格/筛选行为。
- `contract`：API/runtime schema、公开 props/emits、route params/query、postMessage 或外部消费者。
- `data-migration`：Pinia/browser 持久化 schema/语义、缓存迁移、backfill、保留或删除。
- `security-critical`：认证授权、令牌/Cookie/CSRF、支付、个人数据、构建机密和审计边界。

`existing-project` 实现模式以及 greenfield 开始写入代码前使用 `$change-impact-analysis` 并传递风险模式；纯 greenfield 决策和不计划修改的 review 不调用。任何模式只要实施了修改，完成后都使用 `$data-consistency-regression-test` 并继承同一模式。验证发现新的 `contract`、`data-migration` 或 `security-critical` 影响时，先升级并回到 `$change-impact-analysis`；最多往返两次。

companion Skill 缺失时，重建最小影响清单或执行最小验证，标记 `degraded`，不得声称已调用；缺少安全前提或两次循环后仍有关键失败时使用 `Blocked`。

## 质量与发布

涉及安全、性能、无障碍、测试或发布时读取 [quality-release.md](references/quality-release.md)。至少：

1. 使用仓库命令运行 vue-tsc/typecheck、lint、unit/component 测试和 production build。
2. 验证 loading/empty/error/success、路由失败、取消/重试和关键 mutation 回滚。
3. 验证语义、键盘、焦点、表单错误、缩放、对比度、RTL 和 reduced motion。
4. 以数据验证路由拆包、bundle budget、Core Web Vitals、长列表和第三方组件影响。
5. 发布前验证环境变量、CSP/headers、source map、监控、缓存失效、灰度和回滚 artifact。

## 输出契约

报告模式、Vue/TypeScript/Vite 与关键库版本、状态所有权、风险模式、改动文件、命令与人工检查证据、人工验收和回滚步骤。每个测试或检查状态必须且只能使用 `Pass`、`Fail`、`Blocked`、`Not run`、`N/A`；未执行浏览器/流程不得记为 `Pass`。review 模式给出文件与行号证据。

## References

- [architecture-data.md](references/architecture-data.md)：SFC/composable、五类状态、Pinia、runtime schema、竞态和错误。
- [quality-release.md](references/quality-release.md)：Web 安全、无障碍、性能、测试、CI、发布和回滚。
