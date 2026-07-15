# Electron Architecture And Security

## 进程所有权

- 让 main 管理窗口、菜单、托盘、生命周期、系统集成和能力授权，不承载长时间 CPU 任务。
- 让 preload 只做安全桥接和结果整形，不放业务状态、数据库或大规模转换。
- 让 renderer 只消费能力接口；浏览器原生能力也要评估数据敏感度和窗口隔离。
- 将压缩、解析、索引、媒体转换及不可信工作负载移入 worker thread 或 `utilityProcess`；定义进度、取消、超时、崩溃和资源上限。
- 为多窗口定义状态所有者、订阅清理和窗口销毁行为，避免窗口各自维护冲突副本。

## BrowserWindow 基线

- 显式设置 `contextIsolation: true`、`sandbox: true`、`nodeIntegration: false` 和 `webSecurity: true`。
- 不使用关闭安全能力来解决开发期跨域或资源加载问题。
- 为生产内容设置限制性 CSP；避免 `unsafe-eval`，收紧脚本、连接、frame 和对象来源。
- 拒绝未允许的 `will-navigate`、重定向和 `setWindowOpenHandler` 请求；外部链接经 URL 解析和协议/域名允许列表后交给系统浏览器。
- 禁用不需要的 webview、远程内容和权限；通过 session permission handlers 做最小授权。
- 对自定义协议设置明确 scheme 权限和路径映射，禁止目录穿越和任意文件暴露。

## 窄 Preload API

- 按用户用例暴露方法，例如 `documents.open()`、`settings.read()`，不要暴露通道名参数。
- 只传递可序列化数据；不要跨桥暴露 EventEmitter、Buffer、文件句柄、Node 模块或可执行回调。
- 对订阅 API 返回显式 unsubscribe，并在窗口销毁时清理监听器。
- 在 TypeScript 全局声明中描述公开 API，但不要把编译期类型当作安全验证。
- 对错误返回稳定且脱敏的错误码；不要把堆栈、绝对路径、SQL 或令牌送入 renderer。

## IPC 契约

- 优先采用 `ipcRenderer.invoke`/`ipcMain.handle` 的请求响应模型；事件流定义生命周期、顺序、背压和取消。
- 在 handler 入口使用 runtime schema 校验参数，在返回前校验或构造稳定 DTO。
- 验证 `event.sender`、`senderFrame` URL/origin、目标窗口和当前会话权限；通道名不是授权边界。
- 对文件 ID、账户 ID 和工作区 ID 做对象级授权，不能只检查用户已登录。
- 为长操作设置超时、取消标识和幂等语义；窗口关闭时停止无主任务。
- 注册和移除 handler 要可重复，避免热重载、窗口重建或测试导致重复监听。
- 契约变更记录兼容性和迁移策略，并覆盖 main、preload、renderer 与测试。

## 文件、数据库和机密

- 从可信基目录解析用户输入，规范化后再次确认仍在允许范围；评估符号链接和检查后替换风险。
- 采用临时文件 + fsync/rename 等适合平台的原子写入策略；保留失败恢复和磁盘空间处理。
- SQLite 明确 migration 版本、事务、备份、回滚、并发模式和损坏恢复；不要从 renderer 直接打开数据库。
- 机密使用 OS 凭据能力或项目批准的安全存储；ASAR、混淆和普通配置文件都不是机密保护。
- 日志默认脱敏令牌、Cookie、个人数据、文件内容和用户路径；为诊断上传取得用户同意。

## 依赖与远程内容

- 使用仍受 Electron 支持并包含当前 Chromium 安全补丁的版本；升级前核对 Node/Chromium 和原生模块 ABI。
- 锁定依赖并检查原生模块来源、安装脚本和供应链风险。
- 尽量不在拥有桌面能力的窗口加载远程内容；确需加载时使用独立 session/窗口、零 preload 能力和严格 allowlist。
