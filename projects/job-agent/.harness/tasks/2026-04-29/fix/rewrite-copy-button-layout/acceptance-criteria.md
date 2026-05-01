# 验收标准

## 机器验证

- `tests/test_web_app.py` 覆盖可复制文本块 HTML 结构和文本转义。
- `.venv/bin/python -m unittest discover -s tests` 通过。
- `.venv/bin/python -m py_compile web_app.py` 通过。

## 行为验证

- “简历改写”页签里的建议写法不再由 `st.code()` 渲染。
- 复制 icon 位于文本框外侧上方，不覆盖建议文本。
- 文本展示保留换行和中文可读性。

## 人工验收

- 用户打开 Web UI 后确认按钮不再遮挡文本。
