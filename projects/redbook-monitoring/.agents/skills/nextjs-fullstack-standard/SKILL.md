---
name: nextjs-fullstack-standard
description: 约束、实现或审查 Next.js + TypeScript App Router 应用的 React Server Components、Server Actions、Route Handlers、缓存、鉴权、SEO、测试和部署。用于新建 App Router 项目、修改现有 Next.js 全栈/内容/SaaS 项目，或审查服务端与客户端边界；不用于 Pages Router 专属项目、普通 Vite React SPA 或其他 React 框架。若同时匹配 React Skill，本 Skill 决定路由、RSC、服务端、安全、缓存和部署，React Skill 仅补充不冲突的客户端组件实践。
---

# Next.js Full-stack Standard

## 选择执行模式

- **greenfield**：为新 App Router 项目选择单一方案并建立服务端安全、缓存和部署基线。
- **existing-project**：按已安装 Next.js major、现有目录、runtime、鉴权、数据库、样式和部署平台修改，不主动迁移。
- **review**：只给出按严重度排序的证据、风险、测试缺口和整改建议。

## 先检查项目

任何实现或结论前：

1. 阅读仓库 `AGENTS.md`、贡献说明和目标路由附近文档。
2. 检查 `package.json`、锁文件、workspace、Next.js/React/Node major 和包管理器。
3. 确认 App Router 与 Pages Router 是否并存，检查 `next.config.*`、TypeScript、ESLint、环境变量和实验/缓存开关。
4. 检查 dev、typecheck、lint、test、build、数据库 migration 和部署脚本。
5. 定位 Server/Client Component 边界、Server Actions、Route Handlers、数据访问层、鉴权、runtime、缓存和错误边界。
6. 确认部署目标是 Node、平台 serverless、Edge 或静态输出，并核对数据库/依赖兼容性。
7. `existing-project` 模式禁止为迎合推荐而升级 Next major、切换 ORM/鉴权/UI 库或改变部署 runtime。

## 版本门

- 先以安装版本和项目配置为事实来源，再采用对应官方约定；不要把不同 major 的 API 拼在一起。
- Next.js 16 及以后使用项目支持的 `proxy.ts` 约定；较旧项目保留其 `middleware.ts`，除非用户明确要求迁移。
- 检查动态路由 `params`、cookies/headers 等请求 API 在当前 major 是否异步，并沿用生成类型或项目范式。
- 缓存默认值和 API 随 major/Cache Components 配置变化；按 [cache-quality-release.md](references/cache-quality-release.md) 明确每次读取的策略。

## Greenfield 决策

每项只选择一个主路径：

| 场景 | 主路径 |
| --- | --- |
| 服务端读取 | 在 Server Component 调用 server-only service/DAL；避免经内部 HTTP 绕行 |
| UI 发起写入 | 使用带输入验证和逐次授权的 Server Action |
| Webhook、公开 API、移动端或第三方调用 | 使用 Route Handler，并遵循 HTTP 语义、鉴权和限流 |
| 客户端交互取数 | 先评估是否可由 RSC 传入；确需客户端缓存时才选择项目现有 query 库 |
| 样式/UI | 复用产品或团队既有体系；greenfield 根据设计系统和团队维护能力选择一个主体系 |
| 数据库和鉴权 | 选择部署 runtime 已支持且团队能运维的一套方案；不因示例默认引入 Prisma 或 Auth.js |

## App Router 与安全工作流

涉及 RSC、Action、Handler、鉴权、数据库、DTO 或环境变量时，先读取 [architecture-security.md](references/architecture-security.md)。必须满足：

1. 默认使用 Server Component；仅在需要事件、浏览器 API 或客户端状态的最小边界声明 `'use client'`。
2. Server Action 用于 mutation，不作为通用读取 RPC；Route Handler 服务 HTTP 客户端与集成边界。
3. 每个 Server Action、Route Handler 和敏感 DAL/service 调用都执行认证、对象级授权和 runtime 输入验证。
4. Proxy/Middleware 或 layout 只能做乐观重定向和粗筛，不能作为唯一安全边界。
5. 数据库实体映射为最小 DTO 后再序列化给客户端；用 `server-only` 和导入边界保护机密代码。
6. 错误响应不泄露 SQL、堆栈、密钥或内部对象；日志和遥测默认脱敏。

## 风险模式与 Companion Skills

选择且只选择最高风险模式：

- `local`：单个 Server/Client Component、纯 mapper/schema helper 或单一路由所有权内的局部行为。
- `module`：同一 feature/segment 内跨组件、service、query、form 或内部缓存失效。
- `contract`：Server Action/Route Handler 输入输出、公开路由参数、Webhook、DTO、共享 schema 或外部消费者。
- `data-migration`：数据库 schema、持久化语义、migration、backfill、保留或删除。
- `security-critical`：认证授权、租户隔离、支付、Cookie/CSRF、私有缓存、机密、Webhook 信任和审计。

`existing-project` 实现模式以及 greenfield 开始写入代码前使用 `$change-impact-analysis` 并传递风险模式；纯 greenfield 决策和不计划修改的 review 不调用。任何模式只要实施了修改，完成后都使用 `$data-consistency-regression-test` 并继承同一模式。验证发现新的 `contract`、`data-migration` 或 `security-critical` 影响时，先升级并回到 `$change-impact-analysis`；最多往返两次。

companion Skill 缺失时，重建最小影响清单或执行最小验证，标记 `degraded`，不得声称已调用；缺少隔离数据库/环境、安全前提或两次循环后仍有关键失败时使用 `Blocked`。

## 质量、SEO 与发布

涉及缓存、RSC 行为、SEO、性能、测试或部署时，读取 [cache-quality-release.md](references/cache-quality-release.md)。至少验证：

1. typecheck、lint、单元/集成测试和生产 `next build` 使用仓库命令通过。
2. `loading`、`error`、`not-found`、Suspense/streaming、hydration 和 mutation 失败路径符合预期。
3. 关键路径满足键盘、焦点、语义、缩放、对比度和 reduced-motion 要求。
4. 内容页 metadata、canonical、robots/sitemap、OG、locale 和结构化数据与可见内容一致。
5. 部署前完成环境校验、migration 时序、观测、灰度/回滚和旧版本兼容性检查。

## 输出契约

报告模式、检测到的 Next/React/Node major、router/runtime/cache 模型、风险模式、改动文件、命令与人工检查证据、人工验收和回滚步骤。每个测试或检查状态必须且只能使用 `Pass`、`Fail`、`Blocked`、`Not run`、`N/A`；未执行不得记为 `Pass`。review 模式必须给文件与行号证据。

## References

- [architecture-security.md](references/architecture-security.md)：RSC/Client 边界、Action/Handler、逐层授权、DTO 和机密隔离。
- [cache-quality-release.md](references/cache-quality-release.md)：版本化缓存、错误/SEO、性能、无障碍、测试、部署和回滚。
