# Next.js Cache, Quality And Release

## 版本化缓存策略

- 先记录安装的 Next.js major、相关配置和部署平台，再决定 fetch、route、RSC 与数据缓存行为。
- 不依赖“默认会缓存”或“默认不缓存”的记忆；对每个关键读取明确 public/private、freshness、共享范围和失效触发。
- Next.js 16/Cache Components 项目仅在项目已启用并理解语义时使用对应 cache 指令/API；旧 major 沿用其支持的机制。
- 用户、租户、权限和个性化数据不得进入跨用户共享缓存；缓存 key 必须包含所有隔离维度。
- mutation 成功后使相关列表、详情和聚合失效；定义标签/路径所有者，避免全站无差别刷新。
- 对并发 mutation 使用版本、事务或条件更新，不能用缓存刷新掩盖写冲突。

## 路由、错误与 SEO

- 为关键 segment 提供适当的 loading、error 和 not-found 边界，并测试 retry/reset 与日志关联。
- Suspense/streaming 保留稳定布局，慢数据不阻塞无关内容；错误不能导致已授权之外的数据闪现。
- 动态路由参数按当前 major 的同步/异步契约处理，复用生成 route types 或项目约定。
- metadata 使用静态或动态 API，保持 title、description、canonical、OG 和 locale 一致；预览图可真实访问。
- 提供正确 robots、sitemap 和状态码；结构化数据经安全序列化且与页面可见内容一致。

## 性能与无障碍

- 测量 Core Web Vitals、服务端响应、RSC payload、JS bundle、图片和字体；为关键页面设预算。
- 减少 Client Component 边界和第三方脚本，使用路由/组件级加载；只基于测量添加 memoization。
- 图片声明尺寸和响应策略，字体控制子集/预加载，避免 hydration 前后布局与 locale 不一致。
- 使用语义 HTML、正确 label/heading/live region，保证键盘、焦点恢复、缩放、对比度和 reduced motion。
- Server Action pending/error 状态可感知且不只靠颜色；表单错误与字段关联并在导航后管理焦点。

## 测试

- unit：纯领域规则、schema、授权策略、cache key 和 mapper。
- integration：DAL、数据库、Action、Handler、鉴权、事务、缓存失效和错误映射。
- component：稳定的同步 Client Component 行为；不要假设测试库已完整覆盖当前版本的 async RSC。
- E2E：关键 RSC 页面、登录/授权、mutation、并发、错误边界、metadata 和 hydration。
- 安全测试覆盖未登录、越权 tenant/resource、非法输入、重复提交、限流和私有缓存泄露。

## 部署与回滚

- 生产构建前验证必需环境变量、runtime、原生依赖和数据库连接方式；构建期与运行期变量分开。
- migration 独立于请求执行，支持滚动部署期间的新旧代码；不可逆变更采用 expand/contract。
- 发布记录 commit、Next/Node 版本、schema、环境、source map 和可回滚 artifact。
- 灰度监控错误率、延迟、授权拒绝、缓存命中、数据库和关键转化；设置停止与回滚阈值。
- 回滚应用前确认数据库和缓存仍向后兼容；无法回滚的步骤必须在发布前显式审批。
