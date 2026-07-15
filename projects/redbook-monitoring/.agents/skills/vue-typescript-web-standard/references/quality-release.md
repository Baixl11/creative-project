# Vue Web Quality And Release

## 安全

- 客户端路由守卫和权限指令只控制体验，服务端必须执行真实授权和对象级检查。
- Cookie 会话评估 CSRF/SameSite，bearer token 避免长期存 localStorage；注销清除 query、Pinia 持久化和缓存。
- 所有 `VITE_*` 与 bundle 配置视为公开；服务端密钥不得进入客户端。
- 审查 `v-html`、动态组件、URL 和下载文件名；用户 HTML/Markdown 使用受维护 sanitizer 和 allowlist。
- 部署 CSP、frame、MIME、referrer 等 headers；第三方脚本/组件评估数据收集和供应链风险。
- 日志、分析、错误平台与 source map 过滤令牌、Cookie、表单、查询和个人数据。

## 无障碍

- 优先原生语义控件；自定义组件提供可访问名称、键盘行为、焦点和正确 ARIA 状态。
- route、drawer、dialog 和 teleport 内容管理标题、焦点 trap/恢复与背景交互。
- 表单 label、description 和 error 正确关联；提交错误可定位且状态更新有合适 live announcement。
- 支持 200% 文本缩放、reflow、对比度、非颜色表达、RTL、本地化膨胀和 reduced motion。
- 自动检查只做基线，关键流程做键盘与屏幕阅读器人工验收。

## 性能

- 以 LCP、INP、CLS、路由 JS、请求瀑布和内存为预算，先测量再优化。
- 使用 route/component async import 拆分非首屏代码；谨慎使用全量 UI/图表/编辑器包。
- 大表格/列表仅在规模证明必要时虚拟化，同时保留键盘、读屏、打印和导出路径。
- 避免大对象不必要深响应；需要时采用 shallow/ref/markRaw，但以 profile 和正确性为前提。
- 图片声明尺寸与响应资源，控制字体和第三方脚本的加载时机。

## 测试

- unit：schema、mapper、Pinia action、纯函数和状态机。
- component/integration：使用 Vue Test Utils 按用户行为测试 props/emits、slots、loading/empty/error、表单和竞态。
- API mock 使用协议级方案，不 mock Vue 内部实现；覆盖非法、慢和旧版响应。
- E2E 覆盖关键路由、导航守卫体验、真实授权响应、mutation、刷新/返回和跨浏览器路径。
- visual regression 只覆盖稳定高价值界面，并固定字体、locale、时区和 viewport。

## CI、发布与回滚

- CI 使用锁文件包管理器运行 vue-tsc/typecheck、lint、测试、production build、预算和必要 E2E。
- 构建时验证环境变量、base path、router history/fallback、静态资源、headers 和 source map 上传。
- 版本化静态资产并安全设置缓存；HTML/config 允许快速发布和回滚。
- 灰度观察错误率、Web Vitals、接口和业务指标，定义停止/回滚阈值。
- 保留上一可部署 artifact 与配置，确保 API/schema 在发布窗口内兼容旧前端。
