# Next.js Architecture And Security

## Server 与 Client 边界

- Server Component 可以读取服务端资源，但应通过 server-only service/DAL 保持授权、缓存和错误策略一致。
- 将 `'use client'` 放在最小交互边界；传入可序列化且最小化的 props，不把数据库实体、session 或机密配置整体下发。
- 使用 `server-only` 或等价构建边界保护数据库、密钥和管理 SDK；客户端可见环境变量一律视为公开信息。
- 不为复用而把大子树变为 Client Component；交互组件可作为 server-rendered 内容的叶子或 slot。
- 防止跨请求共享可变模块状态，尤其是用户身份、权限和请求级缓存。

## 读取、Mutation 与 HTTP 边界

- 服务端读取优先由 Server Component 调用 service/DAL，不通过自身 Route Handler 额外绕一层 HTTP。
- Server Action 面向 UI mutation；每个导出的 `'use server'` 函数都按可远程调用入口处理。
- Route Handler 用于 webhook、公开/私有 API、流、文件和非浏览器客户端；遵守状态码、方法、缓存和内容类型语义。
- mutation 明确幂等、重复提交、并发冲突和成功后的缓存失效/导航；不要依赖按钮禁用作为唯一防重。
- 对上传和流设置类型、大小、超时、取消、存储和病毒/内容检查策略。

## 认证与授权

- 在 Server Action、Route Handler 和敏感 DAL/service 中分别验证当前身份与对象级权限；客户端隐藏按钮不是授权。
- Proxy/Middleware/layout 只用于快速拒绝或导航体验，不能代替靠近数据的授权。
- 验证 tenant、workspace、resource ID 是否属于当前主体，防止 IDOR；管理员路径也需要显式策略。
- cookie session 配置 Secure、HttpOnly、SameSite、期限和轮换；涉及 cookie mutation 时检查 origin/CSRF 策略。
- 登录、重置、邀请、Webhook 和高成本入口设置限流、审计和防枚举响应。

## Runtime Schema 与 DTO

- 在 Action/Handler 边界验证 `FormData`、JSON、params、query、headers 和 webhook 签名；TypeScript 类型不是运行时验证。
- 数据库模型、API DTO、表单输入和 UI view model 可以不同，通过 schema/mapping 保持可追踪关系。
- DTO 采用 allowlist 选择字段，避免将 password hash、内部状态、成本、权限标记或软删除信息带到客户端。
- 时间、金额、ID、null、未知枚举和分页使用明确契约；错误采用稳定、可观察且不泄密的表示。
- schema 变更定义向后兼容窗口，并同步生成类型、fixture、客户端和契约测试。

## 安全与依赖

- 使用仍受支持且包含安全修复的 Next.js/React patch；升级 major 前评估异步请求 API、缓存和 runtime 行为。
- 禁止把服务端密钥放入 `NEXT_PUBLIC_*`、客户端 bundle、静态 HTML、错误页或 source map。
- 对用户 HTML/Markdown 和 JSON-LD 做上下文正确的转义/净化；避免不受控 `dangerouslySetInnerHTML`。
- 依赖和部署插件锁定版本并检查安装脚本、供应链和运行时权限。
- 日志、trace 和错误平台过滤 Cookie、Authorization、请求体、个人数据和数据库记录。
