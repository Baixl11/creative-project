from __future__ import annotations

from pathlib import Path
from typing import Iterable, Sequence

from PIL import Image, ImageDraw, ImageFont, JpegImagePlugin


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "outputs" / "portfolio"
PDF_PATH = OUTPUT_DIR / "job_agent_case_study.pdf"
PAGE_DIR = OUTPUT_DIR / "pages"

W, H = 1440, 2030
M = 88

INK = "#10231b"
MUTED = "#65746b"
SUBTLE = "#8a958c"
ACCENT = "#a54f2b"
ACCENT_DARK = "#71351f"
OLIVE = "#6d7d53"
CARD = "#fffaf0"
CARD_ALT = "#f6eddc"
LINE = "#dcc8ac"
YELLOW = "#f3d36b"
GREEN = "#dfead1"
CLAY = "#ead0bd"


def font_path() -> str:
    candidates = [
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return candidate
    raise FileNotFoundError("No Chinese-capable system font found.")


FONT_PATH = font_path()


def f(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_PATH, size=size)


FONTS = {
    "eyebrow": f(30),
    "h1": f(82),
    "h2": f(56),
    "h3": f(34),
    "body": f(28),
    "body_s": f(24),
    "caption": f(21),
    "metric": f(48),
    "mono": f(24),
}


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def blend(a: str, b: str, t: float) -> tuple[int, int, int]:
    ar, ag, ab = hex_to_rgb(a)
    br, bg, bb = hex_to_rgb(b)
    return (
        int(ar + (br - ar) * t),
        int(ag + (bg - ag) * t),
        int(ab + (bb - ab) * t),
    )


def new_page() -> Image.Image:
    img = Image.new("RGB", (W, H), "#f7f1e3")
    px = img.load()
    for y in range(H):
        t = y / max(H - 1, 1)
        row = blend("#f8f0df", "#e9f0dc", t)
        for x in range(W):
            px[x, y] = row
    draw = ImageDraw.Draw(img)
    draw.ellipse((W - 520, -220, W + 160, 420), fill="#edf3da")
    draw.ellipse((-280, H - 460, 360, H + 180), fill="#f1dfc8")
    draw.rectangle((0, 0, W, 18), fill=ACCENT)
    return img


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> int:
    return int(draw.textbbox((0, 0), text, font=font)[2])


def line_height(font: ImageFont.FreeTypeFont, leading: int = 10) -> int:
    box = font.getbbox("国Ag")
    return box[3] - box[1] + leading


def wrap_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont,
    max_width: int,
) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        paragraph = paragraph.strip()
        if not paragraph:
            lines.append("")
            continue
        current = ""
        for char in paragraph:
            candidate = current + char
            if text_width(draw, candidate, font) <= max_width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = char
        if current:
            lines.append(current)
    return lines


def draw_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: str = INK,
    max_width: int | None = None,
    leading: int = 10,
) -> int:
    x, y = xy
    if max_width is None:
        draw.text((x, y), text, font=font, fill=fill)
        return y + line_height(font, leading)
    for line in wrap_text(draw, text, font, max_width):
        if line:
            draw.text((x, y), line, font=font, fill=fill)
        y += line_height(font, leading)
    return y


def card(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    fill: str = CARD,
    outline: str = "#e5d6bd",
    radius: int = 34,
    width: int = 2,
) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def chip(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, fill: str = "#efe2cc") -> int:
    font = FONTS["caption"]
    tw = text_width(draw, text, font)
    box = (x, y, x + tw + 36, y + 46)
    draw.rounded_rectangle(box, radius=23, fill=fill, outline="#dfc8a8", width=1)
    draw.text((x + 18, y + 10), text, font=font, fill=ACCENT_DARK)
    return x + tw + 48


def header(draw: ImageDraw.ImageDraw, page_no: str, title: str, subtitle: str = "") -> int:
    draw.text((M, 70), page_no, font=FONTS["eyebrow"], fill=ACCENT)
    draw_text(draw, (M, 120), title, FONTS["h2"], INK, W - M * 2, leading=12)
    y = 198
    if subtitle:
        y = draw_text(draw, (M, y), subtitle, FONTS["body_s"], MUTED, W - M * 2, leading=10) + 12
    draw.line((M, y, W - M, y), fill=LINE, width=2)
    return y + 46


def footer(draw: ImageDraw.ImageDraw, page: int) -> None:
    draw.text((M, H - 70), "Job Agent / Portfolio Case Study", font=FONTS["caption"], fill=SUBTLE)
    num = f"{page:02d}"
    draw.text((W - M - 44, H - 70), num, font=FONTS["caption"], fill=SUBTLE)


def bullet_list(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    items: Sequence[str],
    max_width: int,
    font: ImageFont.FreeTypeFont | None = None,
    gap: int = 18,
) -> int:
    font = font or FONTS["body_s"]
    for item in items:
        draw.ellipse((x, y + 13, x + 12, y + 25), fill=ACCENT)
        y = draw_text(draw, (x + 30, y), item, font, INK, max_width - 30, leading=9)
        y += gap
    return y


def draw_metric_card(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    number: str,
    label: str,
    note: str,
    fill: str = CARD,
) -> None:
    card(draw, box, fill=fill)
    x1, y1, x2, _ = box
    draw.text((x1 + 28, y1 + 24), number, font=FONTS["metric"], fill=ACCENT_DARK)
    draw.text((x1 + 28, y1 + 88), label, font=FONTS["h3"], fill=INK)
    draw_text(draw, (x1 + 28, y1 + 140), note, FONTS["caption"], MUTED, x2 - x1 - 56, leading=7)


def page_cover() -> Image.Image:
    img = new_page()
    draw = ImageDraw.Draw(img)
    y = 170
    draw.text((M, y), "AI AGENT / JOB SEARCH / LOCAL DEMO", font=FONTS["eyebrow"], fill=ACCENT)
    y += 78
    draw_text(draw, (M, y), "Job Agent", FONTS["h1"], INK, W - M * 2)
    y += 100
    draw_text(draw, (M, y), "求职与职业转型助手 Agent", FONTS["h2"], INK, W - M * 2)
    y += 104
    draw_text(
        draw,
        (M, y),
        "从 JD 和简历输入，到匹配分析、证据定位、简历改写和面试准备的本地 AI Agent 工作流。",
        FONTS["body"],
        MUTED,
        980,
        leading=14,
    )
    y += 160
    x = M
    for text in ["Python", "Streamlit", "PDF 解析", "OCR", "评测集", "Mock LLM"]:
        x = chip(draw, x, y, text)
    card(draw, (M, 880, W - M, 1390), fill="#fff7e8")
    draw.text((M + 54, 940), "项目核心定位", font=FONTS["h3"], fill=ACCENT_DARK)
    draw_text(
        draw,
        (M + 54, 1008),
        "这不是一个单次 prompt demo，而是一个完整 AI 产品闭环：输入处理、Agent 编排、规则匹配、结构化输出、Web UI、评测回归和真实数据迭代。",
        FONTS["body"],
        INK,
        W - M * 2 - 108,
        leading=16,
    )
    draw_metric_card(draw, (M, 1480, M + 292, 1715), "0-1", "完整构建", "从空项目到本地可运行 AI Agent", GREEN)
    draw_metric_card(draw, (M + 326, 1480, M + 618, 1715), "95/100", "真实样例", "中文 JD 与 PDF 简历匹配结果", CARD)
    draw_metric_card(draw, (M + 652, 1480, M + 944, 1715), "41", "自动化测试", "覆盖核心流程与 Web UI 辅助逻辑", CARD)
    draw_metric_card(draw, (M + 978, 1480, W - M, 1715), "3/3", "评测通过", "高 / 中 / 低匹配样例全部通过", CLAY)
    footer(draw, 1)
    return img


def page_summary() -> Image.Image:
    img = new_page()
    draw = ImageDraw.Draw(img)
    y = header(draw, "02", "项目摘要", "用真实求职问题，搭建可解释、可演示、可回归的 AI Agent。")
    card(draw, (M, y, W - M, y + 360), fill=CARD)
    draw.text((M + 42, y + 40), "项目背景", font=FONTS["h3"], fill=ACCENT_DARK)
    draw_text(
        draw,
        (M + 42, y + 105),
        "求职者在投递岗位前，通常很难判断自己的简历和目标 JD 到底匹不匹配，也不知道应该优先补强哪段经历。Job Agent 从这个真实痛点出发，把“凭感觉判断”转成“逐条要求 + 简历证据 + 可行动建议”。",
        FONTS["body"],
        INK,
        W - M * 2 - 84,
        leading=14,
    )
    y += 430
    metrics = [
        ("6 类输入", "TXT / MD / RTF / PDF / 图片 / macOS 文本包"),
        ("中文 OCR", "默认 chi_sim+eng，支持 JD 截图识别"),
        ("结构化输出", "Markdown 给人看，JSON 给系统接"),
        ("零成本演示", "默认 mock 模式，无需 API Key"),
    ]
    cols = 2
    gap = 30
    card_w = (W - M * 2 - gap) // cols
    card_h = 250
    for i, (title, body) in enumerate(metrics):
        x = M + (i % cols) * (card_w + gap)
        yy = y + (i // cols) * (card_h + gap)
        card(draw, (x, yy, x + card_w, yy + card_h), fill="#fffaf2")
        draw.text((x + 34, yy + 34), title, font=FONTS["h3"], fill=ACCENT_DARK)
        draw_text(draw, (x + 34, yy + 96), body, FONTS["body_s"], INK, card_w - 68)
    y += 2 * (card_h + gap) + 40
    draw.text((M, y), "这个项目证明了什么", font=FONTS["h3"], fill=INK)
    y += 66
    bullet_list(
        draw,
        M,
        y,
        [
            "能把一个真实用户问题拆成完整 AI 产品流程，而不是停留在概念层。",
            "能处理真实文件输入，包括 PDF 简历、截图 OCR 和异常文本格式。",
            "能让结果可解释，每条岗位要求都能看到对应简历证据。",
            "能用评测和测试守住迭代质量，避免只对单一样例有效。",
        ],
        W - M * 2,
    )
    footer(draw, 2)
    return img


def page_problem() -> Image.Image:
    img = new_page()
    draw = ImageDraw.Draw(img)
    y = header(draw, "03", "问题定义", "把模糊的求职判断，变成可解释的匹配证据。")
    left = (M, y, M + 600, y + 1180)
    right = (M + 650, y, W - M, y + 1180)
    card(draw, left, fill="#fff9ed")
    card(draw, right, fill="#eef4dc")
    draw.text((left[0] + 40, y + 42), "用户痛点", font=FONTS["h3"], fill=ACCENT_DARK)
    bullet_list(
        draw,
        left[0] + 44,
        y + 126,
        [
            "JD 很长，不知道真正关键的要求是什么。",
            "简历内容很多，不知道哪段经历最能支撑目标岗位。",
            "只能凭感觉判断匹配度，缺少逐条证据。",
            "即使知道有差距，也不知道简历 bullet 应该怎么改。",
        ],
        left[2] - left[0] - 88,
    )
    draw.text((right[0] + 40, y + 42), "产品目标", font=FONTS["h3"], fill=OLIVE)
    bullet_list(
        draw,
        right[0] + 44,
        y + 126,
        [
            "读懂岗位：从 JD 中提取关键要求。",
            "找到证据：从简历中定位能支撑要求的经历。",
            "判断差距：输出匹配分、已匹配项和待补强项。",
            "辅助改写：生成可参考的中文简历 bullet。",
            "准备面试：围绕岗位要求生成准备问题。",
        ],
        right[2] - right[0] - 88,
    )
    y2 = y + 1260
    card(draw, (M, y2, W - M, y2 + 360), fill=CARD)
    draw.text((M + 46, y2 + 44), "设计原则", font=FONTS["h3"], fill=INK)
    draw_text(
        draw,
        (M + 46, y2 + 112),
        "Job Agent 不替用户编造经历，而是把已有简历和目标岗位进行结构化对齐。它强调“可解释”和“可行动”：用户能看到为什么匹配、哪里不够、下一步简历该怎么表达。",
        FONTS["body"],
        INK,
        W - M * 2 - 92,
        leading=14,
    )
    footer(draw, 3)
    return img


def page_workflow() -> Image.Image:
    img = new_page()
    draw = ImageDraw.Draw(img)
    y = header(draw, "04", "Agent 工作流", "不是一次 prompt，而是多步骤任务编排。")
    steps = [
        ("01", "输入 JD 和简历", "支持文本、PDF、截图和 macOS 文本包。"),
        ("02", "读取与清洗", "处理文件校验、PDF 文本、OCR 空格和联系方式过滤。"),
        ("03", "解析岗位要求", "提取岗位标题、职责和任职要求。"),
        ("04", "提取简历亮点", "识别更可能支撑岗位要求的经历句。"),
        ("05", "逐条匹配证据", "把 JD 要求和简历证据关联，并计算匹配强度。"),
        ("06", "生成报告", "输出匹配分、缺口、证据解释和改写建议。"),
        ("07", "导出 JSON", "保留结构化结果，便于后续系统集成和评测。"),
        ("08", "Web UI 展示", "让非技术用户可以上传文件并查看结果。"),
    ]
    x1, x2 = M + 70, W - M - 70
    y0 = y + 20
    step_h = 175
    for i, (num, title, body) in enumerate(steps):
        yy = y0 + i * step_h
        draw.line((M + 36, yy + 58, M + 36, yy + step_h), fill=LINE, width=4)
        draw.ellipse((M, yy + 22, M + 72, yy + 94), fill=ACCENT)
        draw.text((M + 17, yy + 40), num, font=FONTS["caption"], fill="#fffaf0")
        card(draw, (x1, yy, x2, yy + 124), fill="#fffaf2", radius=26)
        draw.text((x1 + 34, yy + 24), title, font=FONTS["h3"], fill=INK)
        draw_text(draw, (x1 + 34, yy + 75), body, FONTS["caption"], MUTED, x2 - x1 - 68, leading=5)
    footer(draw, 4)
    return img


def page_capabilities() -> Image.Image:
    img = new_page()
    draw = ImageDraw.Draw(img)
    y = header(draw, "05", "核心能力拆解", "围绕真实求职数据，补齐输入、判断和输出能力。")
    cards = [
        ("多格式输入", "支持 TXT、MD、RTF、PDF、图片截图和 macOS 文本包，降低真实使用门槛。"),
        ("中文 OCR 与清洗", "默认 chi_sim+eng，处理中文截图识别后的异常空格，提升 JD 解析稳定性。"),
        ("可解释匹配", "不只输出分数，还逐条说明 JD 要求对应到简历里的哪一句证据。"),
        ("简历 bullet 改写", "区分当前依据、建议写法和改写理由，把分析结果变成可行动建议。"),
        ("本地 Web UI", "支持样例、真实样例和上传文件分析，面试展示更直观。"),
        ("评测回归", "高 / 中 / 低匹配样例和 41 个 unittest 支撑持续迭代。"),
    ]
    gap = 28
    card_w = (W - M * 2 - gap) // 2
    card_h = 385
    for i, (title, body) in enumerate(cards):
        x = M + (i % 2) * (card_w + gap)
        yy = y + (i // 2) * (card_h + gap)
        fill = "#fffaf2" if i % 2 == 0 else "#eef3df"
        card(draw, (x, yy, x + card_w, yy + card_h), fill=fill)
        draw.text((x + 38, yy + 42), f"0{i+1}", font=FONTS["eyebrow"], fill=ACCENT)
        draw.text((x + 38, yy + 94), title, font=FONTS["h3"], fill=INK)
        draw_text(draw, (x + 38, yy + 160), body, FONTS["body_s"], MUTED, card_w - 76, leading=10)
    footer(draw, 5)
    return img


def page_iteration() -> Image.Image:
    img = new_page()
    draw = ImageDraw.Draw(img)
    y = header(draw, "06", "真实数据迭代", "从真实数据问题中迭代，而不是只跑理想样例。")
    rows = [
        ("macOS 文本包", "看起来是 txt，实际是包含 TXT.rtf 的目录。", "增加文本包读取能力。"),
        ("PDF 断行", "简历经历被异常换行切断，证据句不完整。", "增加基础中文断行合并。"),
        ("中文匹配弱", "初始规则偏英文，真实样例只有 18/100。", "补中文 JD 章节识别和能力词组。"),
        ("报告混杂", "中英文混排，阅读成本高。", "改成中文口语化报告。"),
        ("上传方式真实化", "用户更可能上传 JD 截图和 PDF 简历。", "补 OCR、PDF 和 Web 上传入口。"),
    ]
    table_y = y
    col_x = [M, M + 310, M + 800]
    headers = ["问题", "暴露现象", "解决动作"]
    for x, h_text in zip(col_x, headers):
        draw.text((x, table_y), h_text, font=FONTS["h3"], fill=ACCENT_DARK)
    table_y += 74
    for problem, symptom, solution in rows:
        card(draw, (M, table_y, W - M, table_y + 178), fill="#fffaf2", radius=24)
        draw_text(draw, (col_x[0] + 24, table_y + 34), problem, FONTS["body_s"], INK, 250, leading=6)
        draw_text(draw, (col_x[1], table_y + 34), symptom, FONTS["caption"], MUTED, 430, leading=6)
        draw_text(draw, (col_x[2], table_y + 34), solution, FONTS["caption"], INK, 460, leading=6)
        table_y += 205
    y2 = table_y + 25
    card(draw, (M, y2, W - M, y2 + 330), fill="#eef3df")
    draw.text((M + 42, y2 + 40), "迭代结果", font=FONTS["h3"], fill=OLIVE)
    draw.text((M + 42, y2 + 118), "18/100", font=FONTS["metric"], fill=ACCENT)
    draw.text((M + 300, y2 + 136), "→", font=FONTS["metric"], fill=SUBTLE)
    draw.text((M + 420, y2 + 118), "95/100", font=FONTS["metric"], fill=ACCENT_DARK)
    draw_text(
        draw,
        (M + 42, y2 + 210),
        "真实中文岗位样例：智能化产品经理（G端）。当前已匹配 6 条岗位要求，待补强要求 0 条，并生成 3 条可参考简历 bullet。",
        FONTS["body_s"],
        INK,
        W - M * 2 - 84,
        leading=8,
    )
    footer(draw, 6)
    return img


def page_quality() -> Image.Image:
    img = new_page()
    draw = ImageDraw.Draw(img)
    y = header(draw, "07", "评测与质量保障", "用评测集和测试，保证 Agent 迭代可回归。")
    draw.text((M, y), "评测集结果", font=FONTS["h3"], fill=INK)
    y += 70
    cases = [
        ("high_match", "82", "80-100", "PASS", "#dfead1"),
        ("medium_match", "55", "45-79", "PASS", "#fff4d0"),
        ("low_match", "9", "0-44", "PASS", "#ead0bd"),
    ]
    for i, (case, score, expected, status, fill) in enumerate(cases):
        yy = y + i * 190
        card(draw, (M, yy, W - M, yy + 150), fill=fill)
        draw.text((M + 42, yy + 42), case, font=FONTS["h3"], fill=INK)
        draw.text((M + 470, yy + 35), score, font=FONTS["metric"], fill=ACCENT_DARK)
        draw.text((M + 690, yy + 52), f"Expected {expected}", font=FONTS["body_s"], fill=MUTED)
        draw.text((W - M - 180, yy + 52), status, font=FONTS["body_s"], fill=OLIVE)
    y += 620
    card(draw, (M, y, W - M, y + 520), fill=CARD)
    draw.text((M + 42, y + 42), "41 个 unittest 覆盖", font=FONTS["h3"], fill=ACCENT_DARK)
    bullet_list(
        draw,
        M + 46,
        y + 126,
        [
            "输入读取、PDF / OCR 辅助逻辑、JD 解析和简历解析。",
            "匹配引擎、Agent 主流程、报告与 JSON 输出。",
            "Web UI 辅助逻辑、上传入口文案、复制按钮和评测流程。",
        ],
        W - M * 2 - 92,
    )
    y2 = y + 590
    draw_text(
        draw,
        (M, y2),
        "我想表达的是：AI 项目不能只看一次生成效果，还需要有评测样例、回归测试和稳定演示路径。",
        FONTS["body"],
        INK,
        W - M * 2,
        leading=14,
    )
    footer(draw, 7)
    return img


def page_demo() -> Image.Image:
    img = new_page()
    draw = ImageDraw.Draw(img)
    y = header(draw, "08", "Demo 展示与产物", "从命令行到 Web UI，形成可演示的本地产品原型。")
    card(draw, (M, y, W - M, y + 430), fill="#fffaf2")
    draw.text((M + 42, y + 42), "Web UI 三种输入方式", font=FONTS["h3"], fill=ACCENT_DARK)
    bullet_list(
        draw,
        M + 46,
        y + 122,
        [
            "使用内置样例：证明基础流程稳定。",
            "使用真实样例：展示中文 JD + PDF 简历的真实效果。",
            "上传自己的文件：支持 JD 文件 / 截图和简历文件。",
        ],
        W - M * 2 - 92,
    )
    y += 500
    outputs = [
        ("Markdown 报告", "给人阅读，适合演示和作品集展示。"),
        ("JSON 结果", "给程序读取，适合后续接数据库、Web 页面和批量分析。"),
        ("评测 summary", "证明项目具备回归验证能力。"),
    ]
    for i, (title, body) in enumerate(outputs):
        yy = y + i * 210
        card(draw, (M, yy, W - M, yy + 170), fill="#eef3df" if i == 1 else CARD)
        draw.text((M + 42, yy + 38), title, font=FONTS["h3"], fill=INK)
        draw_text(draw, (M + 420, yy + 44), body, FONTS["body_s"], MUTED, W - M * 2 - 460, leading=8)
    y += 690
    draw.text((M, y), "建议截图清单", font=FONTS["h3"], fill=INK)
    y += 70
    bullet_list(
        draw,
        M,
        y,
        [
            "Web UI 首页和价值卡片。",
            "真实样例分析结果：匹配分和结论。",
            "逐条证据页签：JD 要求和简历证据。",
            "简历改写页签：建议写法和复制 icon。",
            "评测 summary：3 组样例全部通过。",
        ],
        W - M * 2,
        FONTS["caption"],
        gap=10,
    )
    footer(draw, 8)
    return img


def page_role() -> Image.Image:
    img = new_page()
    draw = ImageDraw.Draw(img)
    y = header(draw, "09", "我的角色与能力沉淀", "这个项目沉淀的是 AI 产品从 0 到 1 的完整构建能力。")
    card(draw, (M, y, W - M, y + 760), fill=CARD)
    draw.text((M + 42, y + 42), "我在项目中的角色", font=FONTS["h3"], fill=ACCENT_DARK)
    bullet_list(
        draw,
        M + 46,
        y + 126,
        [
            "定义求职匹配的用户问题和产品边界。",
            "拆解 Agent 工作流，而不是只写单次 prompt。",
            "设计输入、解析、匹配、输出、评测和 Web UI 的模块边界。",
            "用真实 JD 和简历暴露问题，并迭代中文匹配、PDF 清洗和报告表达。",
            "保持默认 mock 模式，控制成本和演示稳定性。",
            "通过测试、评测集和文档记录，让项目可以被复现、解释和继续扩展。",
        ],
        W - M * 2 - 92,
    )
    y += 850
    draw.text((M, y), "能力关键词", font=FONTS["h3"], fill=INK)
    y += 76
    x = M
    for text in [
        "AI 产品定义",
        "Agent 工作流设计",
        "真实数据迭代",
        "结构化输出",
        "评测回归",
        "本地 Demo 交付",
        "成本控制",
    ]:
        if x > W - M - 260:
            x = M
            y += 62
        x = chip(draw, x, y, text, fill="#fff4d0")
    y += 140
    card(draw, (M, y, W - M, y + 310), fill="#eef3df")
    draw.text((M + 42, y + 42), "适合简历的一句话", font=FONTS["h3"], fill=OLIVE)
    draw_text(
        draw,
        (M + 42, y + 120),
        "独立设计并实现本地求职场景 AI Agent，支持 JD/简历多格式输入、匹配分析、证据定位、简历 bullet 改写、Web UI 展示和评测回归。",
        FONTS["body"],
        INK,
        W - M * 2 - 84,
        leading=14,
    )
    footer(draw, 9)
    return img


def page_roadmap() -> Image.Image:
    img = new_page()
    draw = ImageDraw.Draw(img)
    y = header(draw, "10", "局限与下一步", "敢于讲清楚边界，项目会比“什么都能做”更可信。")
    left = (M, y, M + 610, y + 980)
    right = (M + 650, y, W - M, y + 980)
    card(draw, left, fill="#fffaf2")
    card(draw, right, fill="#eef3df")
    draw.text((left[0] + 40, y + 42), "当前限制", font=FONTS["h3"], fill=ACCENT_DARK)
    bullet_list(
        draw,
        left[0] + 44,
        y + 126,
        [
            "当前匹配机制是规则增强版，不是深度语义模型。",
            "复杂 PDF、多栏排版和扫描件仍需要更强清洗策略。",
            "真实截图 OCR 本轮暂不作为交付阻塞项。",
            "真实 LLM 接入暂停，默认 mock 模式保证稳定演示。",
            "当前是本地 Web UI，还没有公网部署和历史记录。",
        ],
        left[2] - left[0] - 88,
        FONTS["caption"],
    )
    draw.text((right[0] + 40, y + 42), "下一步规划", font=FONTS["h3"], fill=OLIVE)
    bullet_list(
        draw,
        right[0] + 44,
        y + 126,
        [
            "短期：整理作品集截图和演示脚本，初始化 git 仓库。",
            "中期：接入真实 LLM，优化 bullet 润色和语义判断。",
            "长期：支持多岗位批量比较、投递优先级和面试提纲。",
        ],
        right[2] - right[0] - 88,
        FONTS["caption"],
    )
    y2 = y + 1060
    card(draw, (M, y2, W - M, y2 + 480), fill=CARD)
    draw.text((M + 42, y2 + 42), "30 秒面试介绍", font=FONTS["h3"], fill=ACCENT_DARK)
    draw_text(
        draw,
        (M + 42, y2 + 120),
        "我做了一个本地运行的求职场景 AI Agent。它可以读取岗位 JD 和简历 PDF，自动提取岗位要求、定位简历证据、计算匹配度，并生成中文简历 bullet 改写和面试准备问题。这个项目不是单次 prompt，而是完整覆盖输入处理、Agent 编排、匹配逻辑、结构化输出、Web UI 和评测回归。",
        FONTS["body_s"],
        INK,
        W - M * 2 - 84,
        leading=10,
    )
    footer(draw, 10)
    return img


def build_pages() -> list[Image.Image]:
    return [
        page_cover(),
        page_summary(),
        page_problem(),
        page_workflow(),
        page_capabilities(),
        page_iteration(),
        page_quality(),
        page_demo(),
        page_role(),
        page_roadmap(),
    ]


def save_pdf(pages: Iterable[Image.Image]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PAGE_DIR.mkdir(parents=True, exist_ok=True)
    rgb_pages = [page.convert("RGB") for page in pages]
    for index, page in enumerate(rgb_pages, start=1):
        page.save(PAGE_DIR / f"job_agent_case_study_{index:02d}.png")
    first, rest = rgb_pages[0], rgb_pages[1:]
    first.save(PDF_PATH, save_all=True, append_images=rest, resolution=144.0)


def main() -> None:
    pages = build_pages()
    save_pdf(pages)
    print(PDF_PATH)


if __name__ == "__main__":
    main()
