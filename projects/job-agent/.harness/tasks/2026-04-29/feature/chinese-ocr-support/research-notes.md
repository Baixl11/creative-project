# 调研记录

## 触发原因

中文 OCR 同时涉及代码默认值、系统 Tesseract 语言包和用户本机安装路径，不能只凭当前实现判断已经支持。

## 本地证据和已确认事实

- `app/utils/input_reader.py` 默认 `OCR_LANG=eng`。
- `tesseract --list-langs` 当前输出 `eng`、`osd`、`snum`，没有 `chi_sim`。
- `README.md` 已提到 `brew install tesseract-lang` 和 `OCR_LANG=chi_sim+eng`，但代码默认值仍不友好。

## 候选方案

- 本地 Tesseract：免费、隐私好、与现有依赖一致，但依赖本机语言包。
- 云 OCR：识别质量可能更好，但增加成本、密钥和隐私风险。

## 最终选择

本轮选择本地 Tesseract 增强：默认中文+英文，缺包提示清楚，测试和文档补齐。

## 仍需用户确认的问题

无阻塞问题。若 Homebrew 安装失败，会把结果作为残余风险说明。
