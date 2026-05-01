# 验收标准

## 机器验证

- `.venv/bin/python -m unittest discover -s tests` 通过。
- `.venv/bin/python -m py_compile web_app.py` 通过。

## 行为验证

- README 能引导读者找到项目状态页、作品集页和演示指南。
- Portfolio 中当前能力、局限和下一步计划与真实状态一致。
- Quality Score 不再是“待评估”。

## 人工验收

- 用户能用 `PROJECT_STATUS.md` 快速判断接下来做什么、项目还差什么。
