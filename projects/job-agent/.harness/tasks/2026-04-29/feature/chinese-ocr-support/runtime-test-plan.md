# 运行时测试计划

## 触发原因

OCR 是用户可见输入能力，只通过单元测试不足以证明本机环境真的具备中文识别语言包。

## 验证工具

- 项目原生 unittest。
- `tesseract --list-langs` 检测系统语言包。
- 如 `chi_sim` 可用，使用临时中文图片做 smoke test。

## 验证环境

- 工作目录：项目根目录。
- Python：`.venv/bin/python`。
- OCR app：系统 `tesseract`。
- 副作用：可能安装 Homebrew 包 `tesseract-lang`；不会写入私人数据。

## 运行路径

1. 检查语言包：`tesseract --list-langs`。
2. 如缺少 `chi_sim`，尝试安装 `brew install tesseract-lang`。
3. 安装后再次检查语言包。
4. 如可用，生成临时中文测试图并跑 OCR smoke。

## 工具缺失处理

如果 Homebrew 安装失败或网络不可用，本任务仍交付代码和文档，并把真实中文 OCR 端到端验证列为残余风险。

## 残余风险

截图清晰度、字体、缩放和排版会影响 Tesseract 中文识别质量，后续可加入图片预处理。
