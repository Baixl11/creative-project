# 验收标准

## 机器验证

- `tests/test_input_reader.py` 覆盖中文 OCR 默认语言和 `OCR_LANG` 覆盖。
- 缺少 Tesseract 中文语言包时，测试能验证错误信息包含 `chi_sim`、`tesseract-lang` 和 `OCR_LANG` 指引。
- `.venv/bin/python -m unittest discover -s tests` 通过。
- `.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations` 通过。
- `.venv/bin/python -m py_compile web_app.py` 通过。

## 行为验证

- 用户上传中文 JD 截图时，默认会尝试 `chi_sim+eng`。
- 如果用户设置 `OCR_LANG`，系统使用用户指定语言。
- 如果本机缺少中文语言包，错误信息能指导用户运行 `brew install tesseract-lang` 并检查 `tesseract --list-langs`。

## 人工验收

- 用户可以根据文档理解中文 OCR 需要 Python 依赖、Tesseract app 和中文语言包三层条件。
- 若真实 OCR 仍受截图清晰度影响，文档和最终说明不夸大能力边界。
