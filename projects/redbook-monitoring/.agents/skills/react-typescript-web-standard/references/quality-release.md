# React Web Quality And Release

## 安全

- 客户端权限只控制体验，所有敏感操作仍由服务端授权；不得把隐藏按钮当安全边界。
- Cookie 会话评估 CSRF/SameSite，bearer token 避免长期存入 localStorage；注销清理所有用户缓存和持久状态。
- `VITE_*` 和 bundle 中的配置均视为公开信息，不放服务端密钥。
- 用户 HTML/Markdown 必须使用受维护 sanitizer 和明确 allowlist；审查 `dangerouslySetInnerHTML`、URL 和下载文件名。
- 部署 CSP、frame、MIME、referrer 等 headers；第三方脚本最小化并评估数据收集。
- 日志、分析、错误平台和 source map 过滤令牌、Cookie、表单、查询和个人数据。

## 无障碍

- 优先语义 HTML；控件具备可访问名称、键盘行为、可见焦点和正确 disabled/expanded/selected 状态。
- 页面和对话框导航管理标题与焦点，关闭 modal 后恢复触发点；不用正 tabindex 修补顺序。
- 表单 label、description 和 error 正确关联，提交失败聚焦/汇总问题；状态变化使用适当 live region。
- 支持 200% 文本缩放、reflow、对比度、非颜色提示、RTL、本地化膨胀和 reduced motion。
- 自动 axe 等检查只做基线，关键流程仍需键盘和屏幕阅读器人工验收。

## 性能

- 以 LCP、INP、CLS、路由 JS、请求瀑布和内存为预算，先测量后优化。
- 路由级 lazy/load 拆分非首屏代码；避免把同一大依赖复制到多个 chunk。
- 大表格/列表在数据规模证明必要时虚拟化，同时保留键盘、读屏和打印/导出路径。
- memo/useMemo/useCallback 只用于测量到的重渲染或稳定引用契约，不作为默认样板。
- 图片声明尺寸和响应资源；控制字体、图表和第三方编辑器的加载时机。

## 测试

- unit：schema、mapper、reducer、状态机和领域规则。
- component/integration：按用户行为测试 loading/empty/error、表单、权限展示、竞态和 Error Boundary。
- API mock 使用协议级工具或项目方案，不 mock React 内部实现；测试非法和旧版响应。
- E2E 覆盖关键路由、鉴权、mutation、刷新/返回、跨浏览器和可访问性主路径。
- visual regression 只覆盖稳定、高价值界面，并为字体、locale、时区和 viewport 固定条件。

## CI、发布与回滚

- CI 固定运行 typecheck、lint、测试、生产 build、bundle/预算和必要 E2E；使用锁文件包管理器。
- 构建时验证环境变量和 base path，预发布检查真实静态资源、路由 fallback、headers 和 source map 上传。
- 版本化静态资产并安全设置缓存；HTML/config 缓存必须允许快速发布和回滚。
- 灰度观察错误率、Web Vitals、关键接口和业务指标，定义停止/回滚阈值。
- 保留上一可部署 artifact 与配置，确保 API/schema 在发布窗口内兼容旧前端。
