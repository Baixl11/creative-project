# Security

## 当前安全边界

- Web UI must call `JobApplicationAgent`; it must not duplicate JD parsing, resume parsing, matching, or rewriting logic.
- Input extraction belongs in `app/utils/input_reader.py`; service layers should receive text or structured values.
- LLM/network calls must stay behind `LLMService` and respect mock mode, timeouts, and API-key boundaries.
- Generated reports and evaluations belong under `outputs/`; they are runtime artifacts, not source-of-truth code.
- Private real inputs under `data/my_*` are local test data and must not be committed or used in public docs without anonymization.
- Behavior-changing tasks require unit/evaluation checks plus runtime or interaction verification when UI/CLI behavior changes.

## 高风险区域

- Do not commit `.env`, `.venv/`, `outputs/`, Python caches, or private `data/my_*` files.
- Do not put API keys, resumes, phone numbers, emails, or private JD data into task files or public docs.
- Do not treat build/compile success as behavior proof for Agent, CLI, OCR/PDF, or Web UI changes.
- Do not edit generated runtime outputs to fake successful behavior.
- Do not enable live LLM mode without explicit user confirmation and cost/secret awareness.

## 规则

- 不把密钥、令牌或凭据写入任务文件。
- 涉及权限、认证、授权、文件系统、网络或数据迁移时必须记录风险和验证。
- 新增生产依赖、外部服务或远端发布需要人工确认。
