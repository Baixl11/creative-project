# Flutter Quality And Release

## 性能

- 为启动、首帧、页面切换、滚动帧、峰值内存、图片缓存、网络流量和包体设可测预算。
- CPU 密集 JSON、压缩、图像和加密工作放 isolate；小任务不要因 isolate 通信成本盲目迁移。
- 长列表使用惰性构建并稳定 key；图片按显示尺寸解码并限制缓存。
- 通过 DevTools/profile build 测量后再添加 `const`、repaint boundary 或缓存优化。
- 检查低端 Android、旧 iPhone、弱网、低存储和系统回收后的恢复路径。

## Semantics 与适配

- 使用语义化控件并提供 label、value、hint 和状态变化公告；装饰内容不进入语义树。
- 支持系统文本缩放，不截断关键信息；检查高对比度、色觉差异和非颜色状态表达。
- 交互目标满足平台尺寸，键盘/开关控制和焦点顺序可预测；对话框关闭后恢复焦点。
- 支持 RTL、本地化文本膨胀、日期数字 locale、安全区域、软键盘、横竖屏、平板和折叠屏。
- 尊重 reduced motion，并为关键动画提供无动画或低动画路径。

## 测试策略

- unit：领域规则、mapper、同步冲突、重试、权限状态机和错误分类。
- widget：加载/空/错误/成功、文本缩放、Semantics、导航和取消竞态。
- golden：只用于稳定视觉契约，固定字体、locale、尺寸和平台差异，并保留人工复核。
- integration：登录、深链、离线队列、数据库迁移、权限、通知和关键业务路径。
- 平台通道使用 fake 与至少一个真实端集成用例；发布候选版本在目标 OS/设备矩阵 smoke test。

## Flavors 与配置

- 使用明确的 dev/staging/prod flavor 或项目既有环境模型，隔离 bundle ID、API、推送、分析和签名。
- 编译时配置不得包含服务端密钥；客户端可提取的值按公开信息处理。
- CI 使用锁定 SDK/依赖，执行 format、analyze、测试、代码生成漂移和目标 flavor 构建。
- source map、Dart symbols、原生符号和版本映射上传到批准的崩溃平台并控制访问。

## 发布与回滚

- 验证 Android signing、target SDK、权限/foreground service 声明和应用包；验证 iOS signing、provisioning、entitlements、privacy manifest 与 archive。
- 商店元数据、隐私标签、数据删除说明和 SDK 数据收集必须与实际行为一致。
- 使用分阶段发布，监控 crash-free、ANR、启动、关键转化和同步失败；定义暂停阈值和负责人。
- 保留上一安全版本的构建与商店回滚方案；数据库/API 变更至少兼容发布窗口内仍在线的旧客户端。
- 记录不可自动化的真机、商店和权限验收，不以“构建成功”代替发布验证。
