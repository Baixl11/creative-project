# ChangeImpactManifest

```yaml
schema_version: "1.0"
artifact_type: ChangeImpactManifest
artifact_id: "redbook-quality-20260713"
project_root: "/Users/cyan/个人工作/creative-project/projects/redbook-monitoring"
created_at: "2026-07-13T17:25:00+08:00"
mode: security-critical
status: Ready
source_artifacts:
  - "用户要求完善设计规范审计中的全部待优化内容"
  - ".agents/skills/change-impact-analysis/SKILL.md"
evidence:
  - "EV-BASELINE"
  - "EV-UNIT"
  - "EV-UI"
unresolved: []
verification_iteration: 1
```

## 变更请求与验收标准

- 原始请求：安装开发规范 Skill 后，修复当前项目审计发现的全部数据、安全、测试、结构与 UI 问题。
- 明确不在范围内：迁移到线上数据库、部署公网、替换小红书数据源、实现小红书未提供的单篇曝光字段。
- 验收标准：跨存储操作可补偿；迁移可追踪；公开日志无本机细节；HTTP 有本地安全边界；五页桌面/移动端无页面级溢出且关键控件可访问；质量检查可在 CI 重复运行。

## 仓库基线

- 技术栈与版本：Node.js 25、Express 5、SQLite、Playwright、原生 HTML/CSS/JavaScript。
- 工作区状态：开始前已有首页、图表与多账号相关未提交改动，全部保留并在其上增量实施。
- 已有失败：无代码测试失败；审计发现跨存储非原子、无版本迁移、raw error、缺安全头、缺系统化测试与可访问性问题。

## 数据所有权

| 对象 | canonical owner | derived representations | cache owner/失效 | consumers |
|---|---|---|---|---|
| 账号配置 | SQLite `accounts` + 本地 `.env` | API 账号列表、授权状态 | 无浏览器持久缓存 | 设置、总览、笔记、趋势、任务 |
| 采集指标 | SQLite snapshots/daily metrics | overview/notes/trends API | 页面每次加载或任务完成后刷新 | 总览、笔记、趋势 |
| 任务状态 | 服务端 scheduler + collection_logs | 跨页面 toast、任务页日志 | 前端轮询，任务完成失效 | 全部页面 |
| 日期范围 | sessionStorage | 所有统计 API 查询参数 | 关闭浏览器会话后失效 | 总览、笔记、趋势、任务 |

## 影响清单

| 维度 | 影响 | 修改决策 | 验证方式 | evidence id |
|---|---|---|---|---|
| 页面/组件 | 五页导航、筛选、表格、弹窗、移动端 | 增加语义、44px 控件、内部滚动和 ES module | Playwright 双视口 | EV-UI |
| API/schema | health 契约、安全头、schema_migrations | 隐藏路径；版本化事务迁移 | 单元 + UI health | EV-UNIT/EV-UI |
| event/job | 采集失败消息 | 统一公开错误脱敏 | 单元测试 | EV-UNIT |
| permissions/audit | `.env`、本地监听 | 原子写、0600、默认 loopback | 单元 + 代码检查 | EV-UNIT |
| migration/backfill | 历史日志 | 迁移 2 清理本地路径与浏览器日志 | 真实 SQLite 查询 | EV-MIGRATION |
| tests/docs | 无 CI 与专项测试 | node:test、Playwright、Actions、README | 全量命令 | EV-CHECK |

## 兼容与发布

- API 兼容：`/api/health.storage` 从绝对路径改为稳定值 `sqlite`；其他数据契约不变。
- migration/backfill：服务启动时按版本顺序执行；历史数据库已完成 1、2 号迁移。
- rollout：先执行 `npm run check && npm test`，再重启本地服务和执行 UI/真实数据回归。
- rollback：代码可回退；数据库新增 `schema_migrations` 和清理后的日志不需要回滚，原始泄露信息不恢复。

## 验证计划

| 顺序 | 验收标准/风险 | 检查或测试 | 安全前提 |
|---:|---|---|---|
| 1 | 迁移与补偿 | `npm test` | 内存 SQLite/桩，不写真实凭据 |
| 2 | 静态和数据口径 | `npm run check`、consistency | 只读真实指标 |
| 3 | 布局与交互 | `npm run test:ui` | 临时 DATA_DIR |
| 4 | 真实页面 | 浏览器检查五页、API、数据范围 | 不触发删除和授权 |

## 证据

| id | kind | locator | observation | confidence |
|---|---|---|---|---|
| EV-BASELINE | audit | repository/browser | 审计问题可在代码与页面复现 | high |
| EV-UNIT | command | `npm test` | 8/8 通过 | high |
| EV-UI | command | `npm run test:ui` | 5 页 x 2 视口，3 弹窗通过 | high |
| EV-MIGRATION | query | `schema_migrations` | 版本 1、2 已登记，unsafeLogs=0 | high |
