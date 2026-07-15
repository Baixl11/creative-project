---
name: electron-desktop-standard
description: 约束、实现或审查 Electron + TypeScript 桌面应用的主进程、preload、renderer、IPC、本地能力、打包和更新。用于新建 Electron 项目、修改现有 Electron 代码、处理窗口/文件/数据库/协议/自动更新，或审查 Electron 安全与发布；不用于 Tauri、Qt、原生桌面应用或纯浏览器项目。若 renderer 使用 React/Vue，同时采用对应 Web Skill，但进程隔离、IPC 和桌面安全以本 Skill 为准。
---

# Electron Desktop Standard

## 选择执行模式

先确定且只选择一种模式：

- **greenfield**：设计新项目，在完成技术决策后建立最小骨架与质量门。
- **existing-project**：修改现有项目，优先遵循仓库既有架构、依赖和命令。
- **review**：只报告风险、证据和整改顺序；除非用户要求，不修改代码。

## 先检查项目

在提出方案或编辑代码前：

1. 阅读仓库级 `AGENTS.md`、贡献指南和目标目录附近的说明。
2. 检查 `package.json`、锁文件、workspace 配置、Electron major、Node 要求和 renderer 框架版本。
3. 检查开发、类型检查、lint、测试、打包、签名和发布脚本；沿用锁文件对应的包管理器。
4. 定位 main、preload、renderer、共享契约、窗口工厂、IPC 注册、协议、存储和 updater 的真实位置。
5. 检查 `BrowserWindow.webPreferences`、CSP、导航策略、session 权限、构建目标和各平台签名配置。
6. 记录当前架构与请求不一致之处；`existing-project` 模式不得因本 Skill 推荐擅自换构建器、状态库、数据库或 renderer 框架。

## Greenfield 决策

每一项只选择一种满足条件的主方案，并记录理由：

| 决策 | 默认选择条件 | 其他选择条件 |
| --- | --- | --- |
| 工具链 | 需要一体化脚手架、打包和插件时选择 Electron Forge | 已确定 Vite renderer 且需要 electron-builder 发布能力时选择 electron-vite + electron-builder |
| renderer | 团队和产品已有 React 体系时选择 React | 已有 Vue 体系时选择 Vue；不要为 Electron 单独换框架 |
| 状态 | 先使用 renderer 框架本地状态 | 只有明确的跨窗口/跨页面客户端状态才选择项目既有 store |
| 持久化 | 关系数据、事务和迁移选择 SQLite，由 main/utility process 管理 | IndexedDB 仅用于 renderer 范围的浏览器缓存；简单设置使用受控配置存储 |
| 契约校验 | 复用项目已有 runtime schema 库 | 没有时先证明 IPC/配置边界需要，再引入一个库 |

不要把 `electron-vite` 与 `electron-builder` 当作互斥工具，也不要同时引入多套打包发布体系。

## 架构与安全工作流

涉及进程边界、窗口、IPC、文件、协议或远程内容时，先阅读并执行 [architecture-security.md](references/architecture-security.md)。核心要求：

1. main 拥有桌面能力，renderer 只负责 Web UI；CPU 密集或不可信任务移入 worker/`utilityProcess`。
2. preload 通过 `contextBridge` 暴露按用例命名的窄方法；绝不暴露通用 `send`、`invoke`、Node 对象或整个 `ipcRenderer`。
3. IPC 参数和结果使用共享类型并在运行时校验；main handler 同时验证 sender、frame/origin、权限和资源范围。
4. 显式启用 `contextIsolation` 与 `sandbox`，关闭 `nodeIntegration`，限制导航、新窗口、权限、协议和外部 URL，并配置 CSP。
5. 文件访问使用规范化路径、允许目录、符号链接/TOCTOU 防护和原子写入；敏感信息不得进入 renderer 可读存储或日志。

## 风险模式与 Companion Skills

选择且只选择最高风险模式：

- `local`：单一 renderer 组件、纯 main/preload 辅助函数或同一所有权单元内的局部行为。
- `module`：同一桌面 feature 或进程内跨文件变更，例如窗口生命周期、菜单/托盘和内部设置。
- `contract`：IPC/preload API、协议、深链、跨窗口消息、更新 feed 或外部可消费文件格式。
- `data-migration`：SQLite schema、持久化配置/文件语义、迁移、backfill、保留或删除。
- `security-critical`：鉴权授权、IPC sender 权限、远程内容、文件访问范围、机密、签名和更新信任链。

`existing-project` 实现模式以及 greenfield 开始写入代码前使用 `$change-impact-analysis` 并传递风险模式；纯 greenfield 决策和不计划修改的 review 不调用。任何模式只要实施了修改，完成后都使用 `$data-consistency-regression-test` 并继承同一模式。验证发现新的 `contract`、`data-migration` 或 `security-critical` 影响时，先升级并回到 `$change-impact-analysis`；最多往返两次。

companion Skill 缺失时，重建最小影响清单或执行最小验证，标记 `degraded`，不得声称已调用；缺少安全前提或两次循环后仍有关键失败时使用 `Blocked`。

## 验证与发布

修改性能、无障碍、测试、打包、更新或发布流程时，读取 [quality-release.md](references/quality-release.md)。至少：

1. 运行仓库已有的 typecheck、lint、单元/契约测试和打包检查；按风险补 packaged-app E2E。
2. 验证 main/preload/renderer 失败路径、窗口关闭清理、IPC 超时/取消和日志脱敏。
3. 对目标 OS 验证键盘、焦点、缩放、高对比度和屏幕阅读器基础路径。
4. 发布前验证代码签名、公证、更新签名、渠道、灰度、崩溃监控与回滚工件。

## 输出契约

结束时报告：执行模式、检测到的关键版本和工具链、风险模式、改动文件、进程/平台影响、命令与人工检查证据、人工验收项和回滚方法。每个测试或检查状态必须且只能使用 `Pass`、`Fail`、`Blocked`、`Not run`、`N/A`；未执行不得记为 `Pass`。review 模式按严重度给出文件与行号证据。

## References

- [architecture-security.md](references/architecture-security.md)：进程所有权、窄 preload、IPC、窗口和本地能力安全。
- [quality-release.md](references/quality-release.md)：性能、无障碍、测试、打包、签名、更新和回滚。
