# 验证报告

## 已执行

- `.venv/bin/python -m unittest tests.test_input_reader`：通过，7 个测试成功。
- `.venv/bin/python -m unittest discover -s tests`：通过，37 个测试成功。
- `.venv/bin/python -m py_compile web_app.py`：通过。
- `.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations`：通过，3 个 case 全部成功。
- `.venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json`：通过，真实样本 mock 得分 95。
- `tesseract --list-langs`：通过，当前包含 `chi_sim`、`eng`、`osd`、`snum`。
- 图片 OCR 缺包错误路径：通过，程序明确提示缺少 `chi_sim`、安装 `tesseract-lang`、检查 `tesseract --list-langs` 和 `OCR_LANG=chi_sim+eng`。
- 临时中文 JD 截图 OCR smoke：通过，输出 `outputs/ocr_chinese_smoke.md` 和 `outputs/ocr_chinese_smoke.json`，岗位标题识别为 `智能化产品经理 (G 端)`，匹配分从清洗前 18 提升到 78。

## 残余风险

- 真实用户截图的清晰度、字体、压缩和排版仍会影响 Tesseract 识别质量。
- OCR 可能把 `AI` 误识别为 `Al`、把 `G端` 误识别为 `C端`，后续可继续做截图预处理或领域词纠错。
