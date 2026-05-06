# 功能测试计划

## 功能点拆分

| 功能点 | 风险 | 测试方式 | 通过标准 |
| --- | --- | --- | --- |
| Web 项目根路径识别 | high | 单元测试 | 从任意 cwd 都能构造项目内 data/output 路径 |
| 公开 demo fallback | high | 现有单元测试 + CLI demo | 缺少私有样例时仍能使用 demo 数据 |
| 上传文件保存路径 | medium | 现有单元测试 | 上传文件仍保存到安全目录，文件名不穿越 |
| Streamlit 部署配置 | medium | 文件存在检查 + 文档检查 | 配置文件和部署文档存在且路径正确 |

## 核心流程测试

- 成功路径：公开中文 demo CLI 生成报告。
- 成功路径：Web UI 编译通过。
- 成功路径：monorepo 根目录启动 Streamlit 时，页面 HTTP 可达。
- 失败/降级路径：没有私有真实样例时，Web UI 自动使用公开 demo。

## 测试实现策略

- 优先使用现有 `unittest`。
- 补充 `tests/test_web_app.py` 覆盖项目根路径和部署路径。
- 不新增长期隐藏脚本。

## 高层验证前置条件

单元测试、评测、编译和公开 demo CLI 均通过后，再进入 Streamlit smoke 和 GitHub 同步。
