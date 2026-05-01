# 功能测试计划

## 功能点拆分

| 功能点 | 风险 | 测试方式 | 测试数据 | 通过标准 |
| --- | --- | --- | --- | --- |
| 默认 OCR 语言 | high | 单元测试 mock pytesseract | 假图片 | 未设置 `OCR_LANG` 时传入 `chi_sim+eng` |
| 环境变量覆盖 | medium | 单元测试 mock env | `OCR_LANG=eng` | 传入 `eng` |
| 缺中文语言包提示 | high | 单元测试模拟 pytesseract 抛错 | 含 `chi_sim` 的错误 | 用户错误信息包含安装与检查指引 |
| 现有文本/PDF流程不受影响 | high | 全量 unittest/evaluation/CLI | 示例与私有样本 | 全部通过 |

## 核心流程测试

- 成功路径：图片输入 -> PIL 打开 -> pytesseract 使用中文+英文语言 -> 返回文本。
- 覆盖路径：用户设置 `OCR_LANG` -> 使用用户配置。
- 失败路径：Tesseract 缺少中文语言数据 -> 报可执行的中文 OCR 指引。

## 高层验证前置条件

上述 high 风险单元测试通过后，再尝试本机 `tesseract --list-langs` 和真实 OCR smoke。
