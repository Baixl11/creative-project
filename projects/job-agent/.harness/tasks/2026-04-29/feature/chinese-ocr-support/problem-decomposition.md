# 问题拆解

## 用户目标

用户希望 JD 截图可以被本地项目识别为中文文本，减少手动复制 JD 的负担。

## 当前状态

- `app/utils/input_reader.py` 已支持图片文件。
- 图片 OCR 调用 `pytesseract.image_to_string(image, lang=os.getenv("OCR_LANG", "eng"))`。
- 本机 `tesseract --list-langs` 只有 `eng`、`osd`、`snum`，没有 `chi_sim`。
- `.harness/environment.yaml` 已记录中文 OCR 语言数据未确认。

## 期望状态

- 默认 OCR 语言优先使用 `chi_sim+eng`，适配中文 JD 中夹杂英文岗位名、AI、大模型等词的场景。
- 如果用户手动设置 `OCR_LANG`，代码尊重用户配置。
- 如果系统缺少中文语言包，报错能说明缺什么、怎么装、如何设置。
- 单元测试覆盖核心逻辑。
- 文档告诉用户如何检查和安装中文 OCR。

## 非目标

- 本轮不接入百度/腾讯/阿里/Google 云 OCR。
- 本轮不做扫描 PDF 的整页 OCR。
- 本轮不保证复杂低清截图、倾斜截图或手写文字都能准确识别。
- 本轮不把 OCR 结果直接改造成深度语义理解。

## 硬约束

- 保持本地免费优先。
- OCR 仍通过 Tesseract 本地能力完成。
- 私人 JD/简历数据不写入公开文档。
- 缺少系统语言包时不得宣称端到端中文 OCR 已完全通过。

## 不确定点

- Homebrew 是否能在当前网络环境下成功安装 `tesseract-lang`。
- 安装后 `chi_sim` 是否立即出现在当前 shell 的 Tesseract 语言列表中。

## 问题分类

主要类型：`feature`

次要类型：`quality`、`docs`

## 已读取证据

- `app/utils/input_reader.py`：图片 OCR 默认使用 `eng`。
- `tests/test_input_reader.py`：已有图片 OCR mock 测试，但未覆盖中文默认策略和语言包错误。
- `tesseract --list-langs`：当前缺少 `chi_sim`。
- `.harness/environment.yaml`：已记录中文 OCR 语言数据仍依赖环境。

## 方案选项

### 方案 A：增强本地 Tesseract 中文策略

- 修改范围：`app/utils/input_reader.py`、`tests/test_input_reader.py`、README/演示文档。
- 优点：免费、本地、符合项目现有架构。
- 风险：系统语言包安装仍依赖用户机器。
- 验证方式：mock 单测 + `tesseract --list-langs` + 如可安装则做真实中文截图 smoke。
- 项目适配性：最贴合当前 PDF/OCR 输入层设计。

### 方案 B：接入云 OCR

- 修改范围：新增外部 API 配置、密钥、网络调用、错误处理。
- 优点：可能识别更准。
- 风险：成本、隐私、密钥管理、用户预算和本地可运行目标冲突。
- 验证方式：需要真实 API 和样本截图。
- 放弃理由：不符合当前“尽量免费、本地可运行”的约束。

## 首选方案

选择方案 A：继续使用本地 Tesseract，但把中文默认策略、错误提示、环境检测和文档补齐。

## 工作包拆分

| 工作包 | 目标 | 预计文件 | 依赖 | 验证 |
| --- | --- | --- | --- | --- |
| OCR 语言策略 | 默认 `chi_sim+eng`，尊重 `OCR_LANG` | `app/utils/input_reader.py` | 无 | 单元测试 |
| 错误提示 | 缺少语言包时给出安装/检查指引 | `app/utils/input_reader.py` | OCR 语言策略 | 单元测试 |
| 文档同步 | 更新中文 OCR 使用步骤 | `README.md`, `WEB_DEMO.md`, `PORTFOLIO.md` | 代码策略 | 文档检查 |
| 环境尝试 | 尝试安装或检测中文语言包 | 系统 Tesseract | 代码可用 | `tesseract --list-langs` |

## 风险与降级

- 如果无法安装 `tesseract-lang`，代码仍能给出清楚错误，用户可稍后手动安装。
- 如果真实 OCR 识别质量一般，后续可加入截图预处理或云 OCR 作为可选增强。
