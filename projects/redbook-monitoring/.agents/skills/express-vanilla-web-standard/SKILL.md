---
name: express-vanilla-web-standard
description: 约束、实现或审查 Node.js Express + 原生 HTML/CSS/JavaScript Web 应用，覆盖路由与中间件边界、本地 SQLite 和文件状态一致性、安全响应头、后台任务、DOM 可访问性、响应式布局、自动化测试与发布检查。用于新建或修改 Express 本地工具、无框架管理后台、数据看板，或审查这类项目的工程质量；不用于 React/Vue/Next.js 等已有专属框架规范的前端，也不用于仅做技术选型。
---

# Express Vanilla Web Standard

## 执行流程

1. 先读取 `package.json`、服务入口、数据访问层、静态页面和测试脚本，确认运行时、数据所有权与现有约定。
2. 修改前使用项目中的 `change-impact-analysis`，涉及凭据、数据库迁移、后台任务或公开错误时采用 `security-critical` 风险等级。
3. 按边界实施：HTTP 层只负责验证和响应，服务层编排跨存储操作，仓储层管理单一数据源，前端按页面状态、视图渲染和图表能力拆分。
4. 每完成一个行为闭环立即运行针对性测试；完成全部改动后使用 `data-consistency-regression-test` 核对真实 diff、数据消费者和发布准备度。
5. 通过代码、API、桌面和移动端 UI 验证后再报告完成；无法自动验证的部分明确列为残余风险。

## 强制要求

- 只把 SQLite 中已采集的数据展示为真实数据；字段不可用时保留“待采集/不可用”语义，不以 `0` 或示例值代替。
- 跨 SQLite、`.env`、session 文件的写操作必须可回滚或补偿；文件写入使用临时文件加原子替换，并限制权限。
- 数据库迁移必须版本化、事务化、幂等；不得把运行时 schema 修改散落在业务仓储中。
- 后台任务状态必须由服务端持有，页面切换不得中止任务；成功、失败和部分成功必须落库并可跨页面读取。
- 不向页面、日志或 API 返回密码、session、本地绝对路径、浏览器启动参数、堆栈或数据库路径。
- 默认只监听 loopback 地址；需要远程访问时显式启用并先补鉴权、CSRF 与部署安全设计。
- 所有原生按钮、筛选、弹窗和图表交互提供键盘操作、可见焦点、状态语义和可读名称。
- 页面级布局不得产生横向溢出；数据表和长图表可在明确容器内滚动，并保留所有数据点。
- 新增共享行为必须补 `node:test` 单元或集成测试；用户流程必须补 Playwright 冒烟测试。

## 参考资料

- 读取 [references/backend-data-security.md](references/backend-data-security.md) 处理 Express、SQLite、凭据、日志和后台任务。
- 读取 [references/frontend-quality-release.md](references/frontend-quality-release.md) 处理原生前端结构、可访问性、响应式、测试和发布检查。

## 交付格式

先列出高风险问题和已实施修复，再说明测试结果与残余风险。代码审查时按严重程度排序并提供文件与行号；实现任务保持改动范围与现有项目一致。
