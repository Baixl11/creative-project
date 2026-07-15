# Spring Boot 安全与质量门禁

## Security

- 验证发行方、audience、时钟偏差、token 生命周期和吊销策略。
- 不自行解析未验证 JWT；优先使用 OAuth2 Resource Server/OIDC 标准组件。
- 对 URL、方法和对象分别授权，测试跨 tenant/Owner 越权。
- CORS 明确 origin、method、header 和 credentials；不要用通配解决部署问题。
- cookie/session 模式验证 CSRF、SameSite、secure 和会话固定防护。
- 管理端点、Actuator 和错误详情采用独立暴露与权限策略。

## 可靠性

- 外部调用设置连接/读取超时、并发上限和有限重试。
- 只重试幂等操作，或使用幂等键和去重表。
- Resilience4j 等机制按真实故障模型配置，不复制通用阈值。
- Scheduled job 和消息消费者处理多实例、锁、重复执行和优雅停止。

## 测试矩阵

| 风险 | 最小验证 |
|---|---|
| `local` | 目标单元测试和编译/静态检查。 |
| `module` | application/service、slice 和数据库集成测试。 |
| `contract` | OpenAPI/consumer contract、序列化和安全测试。 |
| `data-migration` | migration、backfill、混合版本和恢复。 |
| `security-critical` | 认证、对象授权、CSRF/CORS、审计和秘密泄漏。 |

记录 wrapper 命令、profile、环境、退出码、基线失败和新增失败。禁止使用生产凭据或生产数据库进行自动测试。

## Observability 与发布

- 结构化日志关联 trace、请求、用户/tenant 的脱敏标识。
- metrics 覆盖延迟、错误率、线程池、连接池、GC、消息 lag 和外部依赖。
- 健康检查避免昂贵查询，并区分活性与就绪。
- 配置启动时校验；关键缺失立即失败，不回退到不安全默认值。
- 发布计划说明 migration、应用实例、消费者和 feature flag 顺序以及回滚边界。
