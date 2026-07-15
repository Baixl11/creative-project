# 小红书账号监控平台

本项目是一个本地运行的小红书创作者账号监控看板，用于管理多个已授权账号，定时采集创作者中心数据，并通过 SQLite 与 Web 页面沉淀账号指标、笔记表现、趋势变化和采集任务状态。

它适合用于个人作品集、创作者运营监控 Demo，或作为后续扩展为团队级数据看板的基础版本。项目只读取本地配置的账号与登录态，不提交真实凭据、授权 session 或运行数据库。

## 核心能力

- 多账号配置：支持添加、删除和设置默认监控账号。
- 本地凭据管理：通过 `.env` 和账号设置页维护手机号/密码或微信扫码登录方式。
- 授权 session 保存：使用 Playwright 完成人工登录授权，并将登录态保存在本地 `data/xhs-auth/`。
- 定时采集：支持每天、每周或每月按分钟配置自动采集，也支持在页面中手动触发刷新。
- 总览看板：展示账号基础指标、最新完整日数据、周期累计数据和近期采集状态。
- 笔记监控：同步已发布笔记列表，并展示阅读、曝光、互动等指标。
- 趋势分析：基于 SQLite 中的日粒度指标查看粉丝、阅读、曝光和互动趋势。
- 任务追踪：展示登录态、采集队列、采集日志和需要人工处理的异常。

## 技术栈

- Node.js + Express：提供静态页面和本地 API。
- Playwright：打开小红书创作者中心并复用授权 session 采集数据。
- SQLite：本地持久化账号、笔记、指标快照和采集日志。
- 原生 HTML/CSS/JavaScript：实现总览、笔记、趋势、任务和设置页面。

## 目录结构

```text
redbook-monitoring/
  assets/                 # 前端样式与交互脚本
  scripts/                # 一致性检查脚本
  src/
    collectors/           # 小红书数据采集逻辑
    repositories/         # SQLite 读写封装
    authSessions.js       # Playwright 登录态管理
    credentials.js        # 本地凭据读写
    database.js           # 数据库初始化
    errorSanitizer.js     # 公开日志与异常脱敏
    httpSecurity.js       # 本地服务安全响应头与监听限制
    scheduler.js          # 定时/手动采集调度
    services/             # 跨 SQLite 与本地凭据的业务编排
    server.js             # Express 服务入口
  index.html              # 总览页
  notes.html              # 笔记监控页
  trends.html             # 趋势页
  tasks.html              # 采集任务页
  settings.html           # 账号设置页
```

## 启动方式

```bash
npm install
npm start
```

访问本地看板：

```text
http://127.0.0.1:4173
```

开发时可使用监听模式：

```bash
npm run dev
```

## 配置方式

复制示例环境变量文件：

```bash
cp .env.example .env
```

按需配置本地端口和账号信息：

```text
PORT=4173
HOST=127.0.0.1

XHS_ACCOUNTS=MAIN,ACCOUNT_2
XHS_MAIN_USERNAME=your_phone_or_email
XHS_MAIN_PASSWORD=your_password
XHS_MAIN_PROFILE_URL=https://xhslink.com/m/your-profile
XHS_MAIN_LOGIN_METHOD=password
```

也可以在 `settings.html` 对应的账号设置页中添加账号，并通过页面发起人工登录授权。

## 数据存储

- SQLite 数据库：`data/redbook-monitoring.sqlite`
- Playwright 登录态：`data/xhs-auth/`
- 本地凭据：`.env`

这些文件只应存在于本地环境，已通过 `.gitignore` 排除，不应提交到版本库。

## 主要数据来源

- 账号信息：`/api/galaxy/creator/home/personal_info`
- 账号周期数据：`/api/galaxy/v2/creator/datacenter/account/base`
- 笔记列表：`/api/galaxy/v2/creator/note/user/posted`
- 单篇笔记增强数据：`/api/galaxy/creator/datacenter/note/base`

当小红书接口未提供某个字段时，页面显示“待采集”，不使用模拟值替代。

## 可用脚本

```bash
npm run check
npm test
npm run test:consistency
npm run test:background-collection
npm run test:ui
```

`npm run check` 会运行语法和静态一致性检查；`npm test` 覆盖账号配置补偿回滚、数据库迁移、日志脱敏与本地访问安全；`npm run test:ui` 会使用临时 SQLite 启动隔离服务，并验证五个页面在桌面和移动端的布局、表单标签、筛选状态与弹窗交互。GitHub Actions 会自动执行以上核心质量门禁。

## 数据与安全约束

- SQLite 使用版本化事务迁移，并启用外键、WAL 与 busy timeout。
- 账号配置横跨 SQLite 与 `.env` 时执行补偿回滚；`.env` 使用同目录临时文件原子替换并保持 `0600` 权限。
- 采集日志在写入前移除本地路径、浏览器启动参数和多行运行细节。
- 服务默认只监听 loopback 地址，并为页面与 API 设置 CSP、`nosniff`、Frame、Referrer 与 Permissions Policy。
- 当小红书来源未提供字段时保留“待采集”语义，不用模拟值或 `0` 冒充真实数据。

项目级工程规范位于 `.agents/skills/express-vanilla-web-standard/`，用于后续实现和审查 Express + 原生 Web 变更。

## 当前状态

项目已具备本地使用闭环：配置账号、完成授权、启动服务、触发采集、查看总览/笔记/趋势/任务状态，并通过单元、一致性和 UI 自动化测试约束真实数据口径。后续可继续补充部署方案、异常告警、数据导出和更细粒度的运营分析指标。
