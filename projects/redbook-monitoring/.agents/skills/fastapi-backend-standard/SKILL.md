---
name: fastapi-backend-standard
description: 为 Python FastAPI 服务提供版本感知的初始化、现有项目修改和代码审查规范，覆盖 Pydantic/API 契约、同步与异步边界、SQLAlchemy/SQLModel、事务迁移、安全、测试、可观测性和发布。用户明确使用 FastAPI 并要求搭建、开发、重构或审查后端时使用；普通 Python 脚本、非 FastAPI 服务或仅做技术选型时不使用。
---

# FastAPI 工程规范

先服从项目已安装版本、现有架构和用户约束，再应用本规范。不要为了匹配模板擅自迁移目录、ORM、认证方案或依赖版本。

## 选择模式

| 模式 | 行为 |
|---|---|
| `greenfield` | 基于明确约束选择最小可维护架构，并记录关键决策。 |
| `existing-project` | 先读取项目和变更范围，沿用既有模式；重构必须有独立理由和授权。 |
| `review` | 只报告可验证问题、风险和修复顺序，不直接改动。 |

## 按需读取

- 涉及运行时、持久化、迁移或契约时读取 [references/runtime-and-data.md](references/runtime-and-data.md)。
- 涉及鉴权、安全、测试、可观测性或发布时读取 [references/security-and-quality.md](references/security-and-quality.md)。

## 第一步：识别真实项目

检查并记录：

- Python、FastAPI、Pydantic、ORM、数据库驱动和迁移工具的实际版本。
- `pyproject.toml`、锁文件、应用入口、配置方式、依赖注入和 lifespan。
- 路由、业务、数据访问和 schema 的现有边界。
- 同步或异步数据库驱动、外部客户端、任务队列和阻塞 I/O。
- OpenAPI 使用方式、客户端生成、测试命令、CI、容器和部署平台。
- 当前 git 状态、用户未提交修改和已有测试失败。

信息不足但决策可逆时采用最小假设并说明；认证、数据驻留、合规、事务一致性和部署约束不明确时先确认。

## Greenfield 决策

不要同时堆叠替代方案。按约束选择并记录：

| 决策 | 选择条件 |
|---|---|
| SQLAlchemy | 复杂查询、成熟映射、精细事务或长期维护项目。 |
| SQLModel | 模型简单、团队接受其抽象且所需能力已验证的小型服务。 |
| 同步执行 | 依赖主要为同步 I/O，吞吐需求普通，团队优先简单性。 |
| 异步执行 | 数据库和外部客户端均为异步，且并发 I/O 是已测量瓶颈。 |
| 外部 OIDC/OAuth2 提供方 | 企业身份、SSO、MFA、生命周期或合规要求明显。 |
| 本地认证 | 范围受控且团队能够承担密码、令牌、吊销和审计责任。 |

不得在 `async def` 中直接运行阻塞数据库、文件、HTTP 或 CPU 密集工作。不要用“AI 后端”作为选择异步或 FastAPI 的充分理由。

## 架构规则

1. 小型 CRUD 不强制建立无价值的多层转发；复杂业务使用 router/use-case 或 service/repository 等清晰边界。
2. Router 负责 HTTP 边界、依赖和响应映射，不承载长事务或复杂业务。
3. Pydantic 模型表达外部契约，ORM 模型表达持久化；通过显式映射控制可见字段。
4. 不直接向客户端序列化 ORM 实体、内部异常、秘密字段或未经验证的动态对象。
5. 领域枚举、错误语义和权限标识有明确 Owner；允许不同层存在显式派生表示。
6. 共享能力通过稳定模块 API 使用，不从其他模块深层导入内部实现。

## API 与数据契约

- 为请求、响应、分页和错误声明明确 schema，并保持 OpenAPI 与运行行为一致。
- 对网络输入执行运行时校验；静态类型不能替代边界校验。
- 变更契约时识别所有消费者、生成客户端、旧版本和兼容窗口。
- 使用 HTTP 状态、headers 和媒体类型表达协议语义；不要为文件、流或空响应强套统一 envelope。
- 对创建、支付、任务提交和 webhook 等重试场景设计幂等键与重复处理语义。

## 数据与迁移

- 明确 session 生命周期和事务边界；一次业务操作不要隐式跨多个独立提交。
- 迁移脚本进入版本控制，并在隔离数据库验证升级路径。
- 不兼容字段变更采用 expand/backfill/switch/contract，说明旧实例和旧客户端兼容期。
- 明确唯一约束、索引、外键、并发更新和乐观/悲观锁策略。
- 区分 canonical 数据、派生表、缓存和搜索索引，记录刷新与失效机制。

## 安全与运行时

- 在每个受保护 use case 执行授权，不把“已登录”等同于“有权操作该对象”。
- 根据 cookie 或 bearer token 模式分别处理 CSRF、CORS、SameSite、origin 和令牌存储。
- 对上传、URL 抓取、模板、反序列化和外部命令设置类型、大小、协议、目标和超时限制。
- 秘密只从受控配置读取；日志、错误和 trace 不包含密码、token、个人信息或原始请求体。
- 短小、可丢失的后置工作可使用进程内后台任务；关键、长时或需重试任务使用持久队列。
- 为外部调用设置连接/读取超时、取消、有限重试和熔断策略；非幂等请求不得自动重试。

## 测试与可观测性

- 从项目配置发现命令，先运行受影响模块，再按风险扩大到类型检查、契约、数据库集成和端到端测试。
- 使用隔离数据库和合成数据；禁止测试连接生产服务或共享生产凭据。
- 覆盖认证授权、验证错误、事务回滚、迁移、并发、幂等、分页和外部依赖失败。
- 结构化日志关联 request/trace ID；提供延迟、错误率、吞吐、队列和数据库池指标。
- 区分 liveness 与 readiness；验证优雅关闭、连接释放和部署回滚。

## 变更安全

选择且只选择命中的最高风险模式：

- `local`：单一 router、schema mapper 或同一所有权单元内的局部行为。
- `module`：同一业务模块内跨 router、service、repository 或任务的共享行为。
- `contract`：API/OpenAPI、schema、任务载荷、事件或外部消费者。
- `data-migration`：数据库结构/语义、迁移、backfill、保留或删除。
- `security-critical`：认证授权、租户、支付、秘密、隐私或审计边界。

按 `security-critical > data-migration > contract > module > local` 升级，不因改动文件少而降级。

- `existing-project` 实现模式以及 greenfield 开始写入代码前使用 `$change-impact-analysis` 并传递风险模式；`local` 只需轻量影响清单，纯 greenfield 决策和不计划修改的 review 不调用。
- 任何模式只要实施了修改，完成后都使用 `$data-consistency-regression-test` 并继承同一风险模式。
- 验证发现新的 `contract`、`data-migration` 或 `security-critical` 影响时，先升级风险并回到 `$change-impact-analysis`；最多往返两次。

companion Skill 缺失时，重建最小影响清单或执行最小验证，并标记 `degraded`；不得声称已调用。缺少隔离数据库、安全前提或两次循环后仍有关键失败时使用 `Blocked`。不要因发现邻近技术债扩大当前修改范围。

## 输出契约

报告执行模式、检测到的 Python/FastAPI/Pydantic/ORM 版本、风险模式、改动文件、API 与数据影响、命令及人工检查证据、人工验收项和回滚方法。每个测试或检查状态必须且只能使用 `Pass`、`Fail`、`Blocked`、`Not run`、`N/A`；未执行不得记为 `Pass`。review 模式按严重度给出文件与行号证据。

## 完成标准

- 代码符合已检测版本和现有项目约定。
- 边界输入、授权、事务、迁移和错误路径均有证据或明确未验证。
- 未静默改变 API、数据库或任务语义。
- 测试报告符合输出契约并附实际证据。
- 发布、兼容、监控和回滚风险与变更等级相匹配。
