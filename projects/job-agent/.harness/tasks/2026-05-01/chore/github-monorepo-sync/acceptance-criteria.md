# 验收标准

## 机器验证

- 临时克隆远端仓库成功，或明确记录远端访问阻塞。
- 目标结构中存在 `projects/job-agent/`。
- `git status` 中不包含 `.env`、`.venv/`、`data/my_*`、`outputs/` 等敏感或运行产物。
- 提交前运行基础验证命令，至少包括全量 unittest、评测集和 Web UI 编译。

## 行为验证

- GitHub 仓库根目录可以作为多项目作品集入口。
- Job Agent 项目在 `projects/job-agent/` 下保持完整可读。
- 用户后续添加新项目时，可以放入 `projects/<another-project>/`，不会和 Job Agent 混淆。

## 人工验收

- 用户确认 GitHub 仓库页面结构符合预期。
- 用户确认是否需要继续把作品集 PDF 作为仓库内文档附件单独提交。

