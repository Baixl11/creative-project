---
name: flutter-mobile-standard
description: 约束、实现或审查 Flutter + Dart 的 iOS/Android 应用，包括路由、状态、网络、离线数据、权限、平台集成、性能、测试和商店发布。用于新建 Flutter 移动项目、修改现有 Flutter App、处理弱网/缓存/生命周期/原生插件，或审查移动端质量；不用于 React Native、原生 Swift/Kotlin、纯 Flutter Web 或桌面应用。共享代码同时面向其他端时，本 Skill 只决定移动端要求，其他端采用其对应规范。
---

# Flutter Mobile Standard

## 选择执行模式

- **greenfield**：为新 iOS/Android 项目选择一套一致的架构和发布基线。
- **existing-project**：保留现有状态库、路由、模型、目录、原生配置和包管理约定，只做请求范围内的改动。
- **review**：不主动编辑，按严重度报告代码、平台配置、隐私与发布风险。

## 先检查项目

开始前完成以下检查：

1. 阅读仓库 `AGENTS.md`、贡献说明和模块文档。
2. 检查 `pubspec.yaml`、`pubspec.lock`、Flutter/Dart SDK 约束、Melos/workspace 和依赖 override。
3. 检查现有状态管理、路由、网络、序列化、数据库、安全存储、代码生成和依赖注入方案。
4. 检查 `analysis_options.yaml`、format/analyze/test/build_runner 命令、flavors、环境配置和 CI。
5. 检查 Android manifest/Gradle、iOS plist/entitlements、最低系统版本、目标 SDK、签名和隐私声明。
6. 定位远端数据、缓存、领域状态、UI 状态和同步逻辑的真实所有者。
7. `existing-project` 模式不得因本 Skill 推荐而擅自替换状态库、路由、数据库、网络库或目录结构。

## Greenfield 决策

每类能力只选择一个主方案，并说明条件：

| 决策 | 选择条件 |
| --- | --- |
| 状态管理 | 团队熟悉响应式 provider、需要可测试依赖图时选 Riverpod；事件/状态机复杂且团队已有 Bloc 经验时选 Bloc；简单应用先用 Flutter 本地状态，不为统一而引入全局库 |
| 路由 | 需要深链、Web URL、一致重定向或嵌套路由时选 `go_router`；简单封闭流程可沿用 Navigator |
| 网络 | 需要拦截器、取消、上传下载进度时选 Dio；简单 HTTP 且无这些需求时选轻量客户端 |
| 模型 | 不可变模型、union 和大量 JSON 契约时选 `freezed` + `json_serializable`；少量稳定模型可用明确的手写解析与测试 |
| 存储 | 普通偏好使用 preferences；令牌/密钥使用平台安全存储；事务、查询、离线同步数据使用受维护的 SQLite 层 |

目录名称适配已选方案，例如 Bloc 项目使用 `blocs/` 或 application 层，不强行生成 `providers/`。引入依赖前检查维护状态、平台支持、许可证和现有替代能力。

## 数据与移动端工作流

涉及状态、网络、缓存、权限、生命周期、模型或平台插件时，读取并执行 [architecture-data.md](references/architecture-data.md)。核心要求：

1. 区分远端权威数据、持久缓存、同步队列、乐观状态和临时 UI 状态；为每层定义所有者与失效条件。
2. 网络 DTO 在边界解析和验证，再映射为领域/UI 模型；不要让页面手工解析 JSON。
3. 离线写入必须定义冲突检测、合并/覆盖策略、重放顺序、幂等键和用户可见状态。
4. 仅对幂等或具备幂等键的操作自动重试，并使用指数退避、抖动、取消和次数上限。
5. 权限按需申请，处理拒绝和永久拒绝；令牌、密钥和敏感数据只进入平台安全存储。
6. 生命周期恢复按数据时效和幂等规则刷新，不在每次 resume 无条件重复请求。

## 风险模式与 Companion Skills

选择且只选择最高风险模式：

- `local`：单个 Widget、纯 mapper/formatter 或同一状态所有权单元内的局部行为。
- `module`：同一 feature 内跨页面、provider/bloc、repository 的共享行为，或内部路由与缓存策略。
- `contract`：远端 API/DTO、深链、平台通道、通知 payload、共享路由参数或外部插件边界。
- `data-migration`：本地数据库/cache schema、离线队列语义、迁移、backfill、保留或删除。
- `security-critical`：认证授权、支付、权限、平台安全存储、隐私、签名和敏感数据边界。

`existing-project` 实现模式以及 greenfield 开始写入代码前使用 `$change-impact-analysis` 并传递风险模式；纯 greenfield 决策和不计划修改的 review 不调用。任何模式只要实施了修改，完成后都使用 `$data-consistency-regression-test` 并继承同一模式。验证发现新的 `contract`、`data-migration` 或 `security-critical` 影响时，先升级并回到 `$change-impact-analysis`；最多往返两次。

companion Skill 缺失时，重建最小影响清单或执行最小验证，标记 `degraded`，不得声称已调用；缺少隔离设备/环境、安全前提或两次循环后仍有关键失败时使用 `Blocked`。

## 质量与发布

修改 UI、性能、测试、原生配置或发布时读取 [quality-release.md](references/quality-release.md)。至少：

1. 运行仓库已有的 format、analyze、unit/widget 测试、代码生成一致性和目标 flavor 构建。
2. CPU 密集解析、压缩和转换移入 isolate，并以 profile 数据验证帧时间、启动、内存和包体。
3. 验证 Semantics、动态字体、屏幕阅读器、焦点、触控目标、RTL、横竖屏及目标设备尺寸。
4. 按风险覆盖 unit、widget、golden、integration、平台通道和真实设备/模拟器测试。
5. 发布前验证 flavors、环境隔离、签名、隐私声明、符号上传、灰度、监控和回滚路径。

## 输出契约

报告执行模式、Flutter/Dart 与关键插件版本、状态/路由/数据所有权、风险模式、变更文件、iOS/Android 差异、命令与人工检查证据、人工验收项和回滚步骤。每个测试或检查状态必须且只能使用 `Pass`、`Fail`、`Blocked`、`Not run`、`N/A`；未执行设备测试不得记为 `Pass`。review 模式给出文件与行号证据。

## References

- [architecture-data.md](references/architecture-data.md)：状态分层、离线同步、安全存储、权限、网络和生命周期。
- [quality-release.md](references/quality-release.md)：isolate、性能、Semantics、测试、flavors、商店发布与回滚。
