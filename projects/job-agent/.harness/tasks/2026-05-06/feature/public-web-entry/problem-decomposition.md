# 问题拆解

## 用户目标

让 Job Agent 从“需要本机终端启动的 Web UI”升级为“面试官或访客打开网页即可使用”的作品集入口，并把修改同步到 GitHub。

## 当前状态

- 项目已有 `web_app.py`，基于 Streamlit。
- 本地入口是 `streamlit run web_app.py`。
- GitHub 仓库是 monorepo，Job Agent 位于 `projects/job-agent/`。
- 当前 `web_app.py` 使用相对路径，例如 `data/sample_jd.txt`、`outputs/web` 和 `.env`。

## 期望状态

- GitHub 上的 `projects/job-agent/web_app.py` 可以被 Streamlit Community Cloud 作为主入口部署。
- 应用在 monorepo 根目录启动时，也能找到自己的 `data/`、`.env` 和 `outputs/`。
- README 和部署文档告诉用户：仓库、分支、入口文件路径分别填什么。
- 默认 mock 模式可以无 API key 运行，避免成本和密钥风险。

## 非目标

- 本轮不接入真实 LLM。
- 本轮不购买云服务器、不配置域名、不做 Docker/Kubernetes。
- 本轮不把 Streamlit 改写成 React/FastAPI 前后端分离项目。

## 硬约束

- 不能提交私有文件、真实简历、真实 JD、`.env` 或 `outputs/`。
- 保持 monorepo 多项目结构，不能把 Job Agent 文件散到远端仓库根目录。
- Web UI 仍必须调用 `JobApplicationAgent`，不能复制核心匹配逻辑。

## 不确定点

- Streamlit Cloud 的最终网页 URL 需要用户登录 Streamlit Cloud 后创建应用才能生成，Codex 无法代替用户完成账号授权。
- OCR 的系统包在云端是否完整可用需要部署后确认；本轮先写入配置和说明。

## 问题分类

- 主要类型：feature
- 次要类型：integration、docs、quality

## 已读取证据

- `ARCHITECTURE.md`：确认当前 Web UI 入口和模块边界。
- `.harness/environment.yaml`：确认本地 Streamlit 启动命令、URL 和验证规则。
- `web_app.py`：确认当前页面入口、样例路径、上传流程和输出路径。
- `requirements.txt`：确认 Python 依赖已经包含 Streamlit、PDF 和 OCR 包。
- Streamlit 官方部署文档：确认 Community Cloud 面向 GitHub 仓库部署，并支持配置主入口文件路径。

## 方案选项

### 方案 A：Streamlit Community Cloud 部署就绪

- 修改范围：让 `web_app.py` 使用自身文件所在目录作为项目根；补充部署配置和文档；同步到 GitHub。
- 优点：最贴合现有技术栈，改动小，免费，适合 2 周作品集节奏。
- 风险：最终公网 URL 仍需用户在 Streamlit Cloud 页面点击部署；OCR 系统包需部署后确认。
- 验证方式：单元测试、评测、编译、公开 demo CLI、本地 Streamlit smoke、GitHub push。
- 项目适配性：当前 Web UI 已是 Streamlit，避免不必要的前端重写。

### 方案 B：重写为静态前端网页

- 修改范围：新增前端项目并把分析逻辑迁移到浏览器或后端 API。
- 优点：更像传统网站。
- 风险：当前 Agent 依赖 Python 文件解析、PDF/OCR、报告生成，静态网页无法直接承载这些能力。
- 放弃理由：不适合当前学习目标和时间预算。

### 方案 C：自建服务器部署

- 修改范围：配置云服务器、进程管理、域名、反向代理和安全策略。
- 优点：控制力强。
- 风险：成本、维护和安全复杂度明显升高。
- 放弃理由：不符合“预算尽量免费”和初学项目阶段。

## 首选方案

选择方案 A：把现有 Streamlit Web UI 做成 Streamlit Community Cloud 部署就绪版本。

## 工作包拆分

| 工作包 | 目标 | 预计文件 | 验证 |
| --- | --- | --- | --- |
| 路径适配 | 让 Web UI 在 monorepo 子目录部署时仍能找到数据和输出目录 | `web_app.py`, `tests/test_web_app.py` | 单元测试、编译 |
| 部署配置 | 提供 Streamlit Cloud 需要的依赖和配置说明 | `packages.txt`, `.streamlit/config.toml`, `DEPLOYMENT.md` | 文件检查、文档检查 |
| 文档同步 | 更新 README/WEB_DEMO，让非技术用户知道入口在哪里 | `README.md`, `WEB_DEMO.md` | 人工阅读 |
| GitHub 同步 | 同步到 `creative-project` monorepo 并 push | 临时 clone | `git status`, `git push`, 远端指针确认 |

## 风险和降级策略

- 如果云端 OCR 系统包安装失败，网页仍可处理 txt/pdf 文本；截图 OCR 标记为部署后待确认。
- 如果 Streamlit Cloud 账号授权无法由 Codex 完成，交付部署步骤，用户手动创建应用。
- 如果本地 UI 自动化工具不可用，保留本地 smoke + 用户人工点击验收边界。
