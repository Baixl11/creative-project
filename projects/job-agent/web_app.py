from __future__ import annotations

import html as html_lib
import sys
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import streamlit as st
from streamlit.components.v1 import html as components_html

PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.agents.job_application_agent import JobApplicationAgent
from app.config import Settings
from app.errors import InputValidationError
from app.models import WorkflowResult


OUTPUT_DIR = PROJECT_ROOT / "outputs" / "web"
UPLOAD_DIR = OUTPUT_DIR / "uploads"
SUPPORTED_TYPES = [
    "txt",
    "md",
    "markdown",
    "rtf",
    "pdf",
    "png",
    "jpg",
    "jpeg",
    "webp",
    "bmp",
    "tif",
    "tiff",
]
SUPPORTED_FORMAT_SUMMARY = "支持 TXT / MD / RTF / PDF / PNG / JPG / WEBP / BMP / TIFF"
DISPLAY_TRANSLATIONS = {
    "Translate user research into product requirements and roadmaps.": "将用户研究转化为产品需求和路线图。",
    "Partner with design, engineering, and data teams to ship experiments.": "与设计、研发和数据团队协作，推动实验上线。",
    "Define metrics for activation, retention, and feature adoption.": "定义激活、留存和功能使用相关指标。",
    "Work with LLM-powered product features and evaluate quality.": "参与 LLM 驱动的产品功能，并评估功能质量。",
    "Communicate priorities to cross-functional stakeholders.": "向跨职能协作方清晰沟通优先级。",
    "3+ years of product management experience.": "3 年以上产品经理经验。",
    "Alex Chen Product Manager Led roadmap planning for a mobile productivity product used by 200k monthly active users.": "主导移动端效率产品路线图规划，产品月活用户约 20 万。",
    "Worked with designers, engineers, and analysts to launch onboarding experiments that improved activation by 12%.": "与设计师、工程师和数据分析师协作上线新用户引导实验，将激活率提升 12%。",
    "Built weekly KPI dashboards and partnered with data teammates to track retention and funnel conversion.": "搭建每周 KPI 看板，并与数据团队跟踪留存和漏斗转化。",
    "Wrote PRDs, aligned stakeholders, and ran sprint planning for cross-functional teams.": "撰写 PRD、对齐跨职能协作方，并组织跨团队 Sprint 规划。",
    "Explored AI note summarization features and coordinated early user testing with support and research teams.": "探索 AI 笔记总结功能，并协调客服和用户研究团队完成早期用户测试。",
    "Alex Chen Product Manager Led roadmap planning for a mobile productivity product used by 200k monthly active users": "主导移动端效率产品路线图规划，产品月活用户约 20 万",
}


def main() -> None:
    st.set_page_config(
        page_title="Job Agent",
        layout="wide",
        initial_sidebar_state="expanded",
    )
    _inject_style()

    st.markdown(
        """
        <section class="hero-card">
          <p class="eyebrow">Local AI Agent Demo</p>
          <h1>Job Agent 求职与职业转型助手</h1>
          <p class="hero-copy">
            上传 JD 和简历，Agent 会自动提取岗位要求、定位简历证据、计算匹配度，
            并生成可参考的简历 bullet 改写。
          </p>
        </section>
        """,
        unsafe_allow_html=True,
    )
    _render_value_cards()

    _render_sidebar()
    st.markdown("## 开始分析")
    mode = st.radio(
        "选择输入方式",
        ["使用内置样例", "使用真实样例", "上传自己的文件"],
        horizontal=True,
    )

    jd_path: Path | None = None
    resume_path: Path | None = None
    jd_file: object | None = None
    resume_file: object | None = None

    if mode == "使用内置样例":
        jd_path = _project_path("data", "sample_jd.txt")
        resume_path = _project_path("data", "sample_resume.txt")
        _render_mode_notice("这个模式适合面试演示第一步：证明基础流程稳定。")
    elif mode == "使用真实样例":
        private_sample_available = _private_real_sample_available()
        jd_path = _first_existing_path(
            [
                _project_path("data", "my_jd_plain.txt"),
                _project_path("data", "my_jd.txt"),
                _project_path("data", "demo_jd_cn.txt"),
            ]
        )
        resume_path = _first_existing_path(
            [
                _project_path("data", "my_resume.pdf"),
                _project_path("data", "demo_resume_cn.txt"),
            ]
        )
        if private_sample_available:
            _render_mode_notice("这个模式会运行你自己的中文 JD 和 PDF 简历，适合作品集展示。")
        else:
            _render_mode_notice("这个模式会运行公开中文 demo 样例，适合 GitHub 克隆后直接演示。")
    else:
        jd_file, resume_file = _render_upload_inputs()

    can_run = (jd_path is not None and resume_path is not None) or (
        jd_file is not None and resume_file is not None
    )
    if st.button("生成匹配报告", type="primary", disabled=not can_run):
        if jd_file is not None and resume_file is not None:
            run_id = _new_run_id()
            upload_dir = UPLOAD_DIR / run_id
            jd_path = _save_uploaded_file(jd_file, upload_dir, "jd")
            resume_path = _save_uploaded_file(resume_file, upload_dir, "resume")

        assert jd_path is not None
        assert resume_path is not None
        _run_agent(jd_path, resume_path)


def _render_value_cards() -> None:
    cards = [
        ("01", "读懂岗位", "从 JD 里抽取关键要求，避免只凭感觉判断匹配度。"),
        ("02", "定位证据", "把每条岗位要求对应到简历里的具体经历和证据句。"),
        ("03", "生成改写", "输出可参考的中文简历 bullet，帮助你下一步直接修改。"),
    ]
    columns = st.columns(3)
    for column, (index, title, body) in zip(columns, cards):
        with column:
            st.markdown(
                f"""
                <div class="value-card">
                  <span>{index}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )


def _render_mode_notice(message: str) -> None:
    st.markdown(f"<div class='mode-notice'>{message}</div>", unsafe_allow_html=True)


def _first_existing_path(paths: list[Path]) -> Path:
    for path in paths:
        if path.exists():
            return path
    return paths[-1]


def _project_path(*parts: str) -> Path:
    return PROJECT_ROOT.joinpath(*parts)


def _private_real_sample_available() -> bool:
    has_jd = _project_path("data", "my_jd_plain.txt").exists() or _project_path(
        "data", "my_jd.txt"
    ).exists()
    return has_jd and _project_path("data", "my_resume.pdf").exists()


def _render_sidebar() -> None:
    with st.sidebar:
        st.markdown("### 这个页面在项目里承担什么角色")
        st.write(
            "命令行版本证明 Agent 能跑通；Web UI 让面试官和非技术用户能直接理解产品价值。"
        )
        st.markdown("### 当前支持")
        st.write("JD：txt、md、rtf、pdf、图片截图")
        st.write("简历：txt、md、rtf、pdf、图片")
        st.markdown("### 推荐演示顺序")
        st.write("1. 先跑真实样例")
        st.write("2. 展示匹配分和证据句")
        st.write("3. 展示可改写 bullet")
        st.write("4. 打开 JSON 说明后续可接 UI/数据库")


def _render_upload_inputs() -> tuple[object | None, object | None]:
    st.markdown(
        """
        <div class="upload-note">
          上传 JD 和简历后开始分析。中文截图会优先使用本地 OCR。
        </div>
        """,
        unsafe_allow_html=True,
    )

    col_a, col_b = st.columns(2, gap="large")
    with col_a:
        st.markdown(
            _build_upload_field_label(
                title="上传 JD 文件或截图",
                hint="岗位描述、招聘网页文本或 JD 截图",
            ),
            unsafe_allow_html=True,
        )
        jd_file = st.file_uploader(
            "上传 JD 文件或截图",
            type=SUPPORTED_TYPES,
            label_visibility="collapsed",
            key="jd_upload",
        )
    with col_b:
        st.markdown(
            _build_upload_field_label(
                title="上传简历文件",
                hint="PDF 简历、文本简历或图片版简历",
            ),
            unsafe_allow_html=True,
        )
        resume_file = st.file_uploader(
            "上传简历文件",
            type=SUPPORTED_TYPES,
            label_visibility="collapsed",
            key="resume_upload",
        )

    if not jd_file or not resume_file:
        st.markdown(
            """
            <div class="upload-hint">
              <strong>还差一步：</strong>请同时上传 JD 和简历，然后再生成报告。
            </div>
            """,
            unsafe_allow_html=True,
        )
    return jd_file, resume_file


def _run_agent(jd_path: Path, resume_path: Path) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    run_id = _new_run_id()
    report_path = OUTPUT_DIR / f"report_{run_id}.md"
    json_path = OUTPUT_DIR / f"report_{run_id}.json"

    with st.spinner("Agent 正在读取文件、分析匹配度并生成报告..."):
        try:
            settings = Settings.load(_project_path(".env"))
            result = JobApplicationAgent(settings).run(
                jd_path,
                resume_path,
                report_path,
                json_path,
            )
        except InputValidationError as exc:
            st.error(f"输入文件有问题：{exc}")
            return

    st.success("报告生成完成")
    _render_result(result, report_path, json_path)


def _render_result(result: WorkflowResult, report_path: Path, json_path: Path) -> None:
    score = result.match_report.score
    matched_count = len(result.match_report.matched_requirements)
    missing_count = len(result.match_report.missing_requirements)
    suggestion_count = len(result.resume_suggestions)

    st.markdown("## 分析结果")
    _render_score_panel(result)

    metric_a, metric_b, metric_c = st.columns(3)
    metric_b.metric("已匹配要求", matched_count)
    metric_c.metric("待补强要求", missing_count)
    metric_a.metric("简历改写建议", suggestion_count)

    with st.expander("运行细节"):
        st.write(f"运行模式：`{result.run_mode}`")
        st.write(f"Markdown 报告：`{report_path}`")
        st.write(f"JSON 结果：`{json_path}`")

    tab_summary, tab_evidence, tab_rewrite, tab_interview, tab_artifacts = st.tabs(
        ["结论", "逐条证据", "简历改写", "面试准备", "产物文件"]
    )

    with tab_summary:
        if missing_count:
            st.warning("这份简历有一些 JD 要求还不够明显，建议优先看“简历改写”页签。")
        else:
            st.success("这份简历和目标岗位匹配度较高，可以重点强化表达和量化结果。")

        col_a, col_b = st.columns(2)
        with col_a:
            st.markdown("### JD 关键要求")
            for requirement in result.requirements:
                st.markdown(f"- {_to_chinese_display(requirement)}")

        with col_b:
            st.markdown("### 简历相关经历")
            for highlight in result.resume_highlights:
                st.markdown(f"- {_to_chinese_display(highlight)}")

    with tab_evidence:
        for item in result.match_report.requirement_evidence:
            label = "能对上" if item.status == "matched" else "还不够明显"
            with st.container(border=True):
                st.markdown(f"**{label}：{_to_chinese_display(item.requirement)}**")
                st.progress(min(max(item.match_strength, 0.0), 1.0))
                st.caption(f"匹配强度：{item.match_strength:.2f}")
                st.write(_to_chinese_display(item.best_resume_highlight) or "暂时没找到可用证据")

    with tab_rewrite:
        st.info("这里最适合截图放进作品集：它展示了 Agent 不只是评分，还能生成可执行的简历改写建议。")
        for index, suggestion in enumerate(result.resume_suggestions):
            with st.container(border=True):
                tag = "补强缺口" if suggestion.suggestion_type == "gap" else "强化优势"
                st.markdown(f"**{tag}：{_to_chinese_display(suggestion.target_requirement)}**")
                _render_copyable_text_block(
                    _to_chinese_display(suggestion.rewrite_bullet) or "",
                    key=f"rewrite-suggestion-{index}",
                )
                st.markdown("当前依据")
                st.write(_to_chinese_display(suggestion.current_evidence) or "当前简历里还没有明显证据")
                st.caption(_to_chinese_display(suggestion.why_it_helps))

    with tab_interview:
        for question in result.interview_questions:
            with st.container(border=True):
                st.markdown(f"**{_to_chinese_display(question.question)}**")
                st.write(_to_chinese_display(question.why_it_matters))

    with tab_artifacts:
        st.write(f"Markdown 报告：`{report_path}`")
        st.write(f"JSON 结果：`{json_path}`")
        st.download_button(
            "下载 Markdown 报告",
            data=report_path.read_text(encoding="utf-8"),
            file_name=report_path.name,
            mime="text/markdown",
        )
        st.download_button(
            "下载 JSON 结果",
            data=json_path.read_text(encoding="utf-8"),
            file_name=json_path.name,
            mime="application/json",
        )


def _render_score_panel(result: WorkflowResult) -> None:
    score = result.match_report.score
    status = _score_status(score)
    progress = _score_progress(score)
    st.markdown(
        f"""
        <section class="score-panel">
          <div>
            <p class="eyebrow">Match Score</p>
            <h2>{score}/100</h2>
            <p>{status}</p>
          </div>
          <div class="score-bar">
            <span style="width: {progress}%"></span>
          </div>
        </section>
        """,
        unsafe_allow_html=True,
    )


def _score_status(score: int) -> str:
    if score >= 80:
        return "强匹配：适合优先投递，重点打磨表达和面试故事。"
    if score >= 50:
        return "中等匹配：有基础相关性，需要补强关键证据。"
    return "低匹配：建议先补项目经历或换一个更接近的岗位。"


def _score_progress(score: int) -> int:
    return min(max(score, 0), 100)


def _build_upload_field_label(title: str, hint: str) -> str:
    return f"""
    <div class="upload-field-label">
      <strong>{html_lib.escape(title)}</strong>
      <span>{html_lib.escape(hint)}</span>
      <em>{html_lib.escape(SUPPORTED_FORMAT_SUMMARY)}</em>
    </div>
    """


def _render_copyable_text_block(text: str, key: str) -> None:
    components_html(
        _build_copyable_text_block_html(text, key),
        height=_copyable_text_block_height(text),
        scrolling=False,
    )


def _build_copyable_text_block_html(text: str, key: str) -> str:
    safe_id = _safe_html_id(key)
    button_id = f"{safe_id}-copy-button"
    status_id = f"{safe_id}-copy-status"
    safe_text = html_lib.escape(text)
    safe_copy_value = html_lib.escape(text, quote=True)
    return f"""
    <div class="copyable-text-block">
      <div class="copyable-toolbar">
        <span>建议写法</span>
        <button
          id="{button_id}"
          class="copy-icon-button"
          type="button"
          data-copy="{safe_copy_value}"
          title="复制建议写法"
          aria-label="复制建议写法"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M8 7.5C8 6.12 9.12 5 10.5 5h6C17.88 5 19 6.12 19 7.5v8c0 1.38-1.12 2.5-2.5 2.5h-6A2.5 2.5 0 0 1 8 15.5v-8Zm2.5-.8a.8.8 0 0 0-.8.8v8c0 .44.36.8.8.8h6c.44 0 .8-.36.8-.8v-8a.8.8 0 0 0-.8-.8h-6Z"/>
            <path d="M5 8.5C5 6.57 6.57 5 8.5 5h.25v1.7H8.5a1.8 1.8 0 0 0-1.8 1.8v8A1.8 1.8 0 0 0 8.5 18.3h5V20h-5A3.5 3.5 0 0 1 5 16.5v-8Z"/>
          </svg>
        </button>
        <span id="{status_id}" class="copy-status" aria-live="polite"></span>
      </div>
      <pre class="copyable-text">{safe_text}</pre>
    </div>
    <script>
    (function() {{
      const button = document.getElementById("{button_id}");
      const status = document.getElementById("{status_id}");
      function showStatus(message) {{
        status.textContent = message;
        window.setTimeout(function() {{
          status.textContent = "";
        }}, 1400);
      }}
      async function copyText() {{
        const value = button.getAttribute("data-copy") || "";
        try {{
          if (navigator.clipboard && navigator.clipboard.writeText) {{
            await navigator.clipboard.writeText(value);
          }} else {{
            const textarea = document.createElement("textarea");
            textarea.value = value;
            textarea.setAttribute("readonly", "");
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
          }}
          showStatus("已复制");
        }} catch (error) {{
          showStatus("复制失败");
        }}
      }}
      button.addEventListener("click", copyText);
    }})();
    </script>
    <style>
      :root {{
        color-scheme: light;
      }}
      body {{
        margin: 0;
        background: transparent;
        font-family: "Songti SC", "Noto Serif CJK SC", Georgia, serif;
        color: #17211b;
      }}
      .copyable-text-block {{
        width: 100%;
        box-sizing: border-box;
      }}
      .copyable-toolbar {{
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.55rem;
        min-height: 34px;
        margin-bottom: 0.4rem;
        color: #17211b;
        font-size: 0.92rem;
        font-weight: 800;
      }}
      .copyable-toolbar > span:first-child {{
        margin-right: auto;
      }}
      .copy-icon-button {{
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(23,33,27,0.18);
        border-radius: 999px;
        background: #fffaf0;
        color: #8f3f20;
        cursor: pointer;
        box-shadow: 0 8px 22px rgba(64,43,26,0.10);
      }}
      .copy-icon-button:hover {{
        background: #f8ebd8;
        transform: translateY(-1px);
      }}
      .copy-icon-button svg {{
        width: 17px;
        height: 17px;
        fill: currentColor;
      }}
      .copy-status {{
        min-width: 3.25rem;
        color: #8f3f20;
        font-size: 0.82rem;
        font-weight: 800;
      }}
      .copyable-text {{
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        padding: 0.95rem 1.05rem;
        border: 1px solid rgba(23,33,27,0.12);
        border-radius: 18px;
        background: #fffaf0;
        color: #102018;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        line-height: 1.72;
        font-size: 0.98rem;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.45);
      }}
    </style>
    """


def _copyable_text_block_height(text: str) -> int:
    line_count = max(1, text.count("\n") + 1)
    wrapped_line_count = max(0, len(text) // 56)
    return min(280, max(126, 96 + (line_count + wrapped_line_count) * 24))


def _safe_html_id(value: str) -> str:
    safe = [char if char.isalnum() or char in {"-", "_"} else "-" for char in value]
    return "".join(safe) or "copyable-text"


def _to_chinese_display(text: str | None) -> str | None:
    if text is None:
        return None

    translated = text
    for source, target in sorted(
        DISPLAY_TRANSLATIONS.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    ):
        translated = translated.replace(source, target)
    return translated


def _save_uploaded_file(uploaded_file: object, upload_dir: Path, prefix: str) -> Path:
    upload_dir.mkdir(parents=True, exist_ok=True)
    original_name = Path(uploaded_file.name).name  # type: ignore[attr-defined]
    suffix = Path(original_name).suffix
    safe_name = f"{prefix}{suffix or '.txt'}"
    target_path = upload_dir / safe_name
    target_path.write_bytes(uploaded_file.getbuffer())  # type: ignore[attr-defined]
    return target_path


def _new_run_id() -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{uuid4().hex[:8]}"


def _inject_style() -> None:
    st.markdown(
        """
        <style>
        :root {
          --ink: #17211b;
          --muted: #5f6f63;
          --paper: #f8f3e8;
          --card: #fffaf0;
          --accent: #d66b2d;
          --accent-dark: #8f3f20;
        }
        .stApp {
          background:
            radial-gradient(circle at top left, rgba(214,107,45,0.16), transparent 30rem),
            linear-gradient(135deg, #f8f3e8 0%, #edf3df 48%, #f9efe0 100%);
          color: var(--ink);
        }
        .stApp h1, .stApp h2, .stApp h3, .stApp h4,
        .stApp p, .stApp li, .stApp label,
        div[data-testid="stMarkdownContainer"],
        div[data-testid="stMarkdownContainer"] *,
        div[data-testid="stWidgetLabel"],
        div[data-testid="stWidgetLabel"] *,
        section[data-testid="stSidebar"],
        section[data-testid="stSidebar"] * {
          color: var(--ink) !important;
        }
        div[data-baseweb="radio"] label,
        div[data-baseweb="radio"] span {
          color: var(--ink) !important;
        }
        div[data-testid="stAlert"] *,
        div[data-testid="stExpander"] *,
        div[data-testid="stTabs"] *,
        div[data-testid="stMetric"] * {
          color: var(--ink) !important;
        }
        code, pre, .stCodeBlock, .stCodeBlock * {
          color: #102018 !important;
          background: #fffaf0 !important;
        }
        .block-container {
          padding-top: 2.5rem;
          padding-bottom: 4rem;
        }
        .hero-card {
          border: 1px solid rgba(23,33,27,0.12);
          background: rgba(255,250,240,0.78);
          border-radius: 28px;
          padding: 2.2rem 2.4rem;
          box-shadow: 0 24px 80px rgba(64,43,26,0.12);
        }
        .eyebrow {
          color: var(--accent-dark);
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin: 0 0 0.5rem 0;
        }
        .hero-card h1 {
          color: var(--ink);
          font-size: clamp(2.1rem, 5vw, 4.4rem);
          line-height: 0.98;
          margin: 0;
        }
        .hero-copy {
          color: var(--ink);
          font-size: 1.08rem;
          line-height: 1.8;
          max-width: 780px;
          margin-top: 1rem;
        }
        .value-card, .mode-notice, .score-panel {
          background: rgba(255,250,240,0.78);
          border: 1px solid rgba(23,33,27,0.10);
          border-radius: 22px;
          box-shadow: 0 16px 48px rgba(64,43,26,0.08);
        }
        .value-card {
          min-height: 165px;
          margin: 1rem 0 0.75rem 0;
          padding: 1.2rem;
        }
        .value-card span {
          color: var(--accent);
          font-weight: 900;
          letter-spacing: 0.08em;
        }
        .value-card h3 {
          margin: 0.35rem 0;
          color: var(--ink);
        }
        .value-card p {
          color: var(--ink);
          line-height: 1.7;
        }
        .mode-notice {
          color: var(--accent-dark);
          font-weight: 700;
          margin: 0.75rem 0 1rem 0;
          padding: 0.85rem 1rem;
        }
        .upload-note {
          margin: 0.75rem 0 1rem 0;
          color: var(--muted);
          font-size: 0.98rem;
          line-height: 1.65;
        }
        .upload-field-label {
          margin: 0.35rem 0 0.45rem 0;
        }
        .upload-field-label strong {
          display: block;
          color: var(--ink) !important;
          font-size: 1.06rem;
          line-height: 1.4;
        }
        .upload-field-label span {
          display: block;
          color: var(--muted) !important;
          font-size: 0.9rem;
          line-height: 1.55;
          margin-top: 0.15rem;
        }
        .upload-field-label em {
          display: block;
          color: var(--accent-dark) !important;
          font-size: 0.78rem;
          font-style: normal;
          font-weight: 800;
          letter-spacing: 0.02em;
          line-height: 1.45;
          margin-top: 0.25rem;
        }
        section[data-testid="stFileUploader"] {
          margin-top: 0.2rem !important;
          margin-bottom: 0.9rem !important;
          border-radius: 20px;
          background: rgba(255,250,240,0.66);
          border: 1px solid rgba(23,33,27,0.10);
          box-shadow: 0 10px 30px rgba(64,43,26,0.06);
          padding: 0.65rem;
        }
        section[data-testid="stFileUploader"] > div {
          color: var(--ink) !important;
        }
        div[data-testid="stFileUploaderDropzone"],
        section[data-testid="stFileUploaderDropzone"] {
          min-height: 82px;
          border: 1.5px dashed rgba(143,63,32,0.32) !important;
          border-radius: 16px !important;
          background: rgba(255,250,240,0.92) !important;
          color: var(--ink) !important;
          padding: 0.75rem !important;
        }
        div[data-testid="stFileUploaderDropzone"] *,
        section[data-testid="stFileUploaderDropzone"] * {
          color: var(--ink) !important;
        }
        div[data-testid="stFileUploaderDropzoneInstructions"],
        section[data-testid="stFileUploaderDropzoneInstructions"],
        div[data-testid="stFileUploaderDropzone"] small,
        section[data-testid="stFileUploaderDropzone"] small {
          display: none !important;
        }
        div[data-testid="stFileUploaderDropzone"] button,
        section[data-testid="stFileUploaderDropzone"] button {
          border-radius: 999px !important;
          border: 1px solid rgba(143,63,32,0.22) !important;
          background: var(--accent-dark) !important;
          color: #fffaf0 !important;
          font-weight: 900 !important;
          padding: 0.58rem 1rem !important;
        }
        div[data-testid="stFileUploaderDropzone"] button *,
        section[data-testid="stFileUploaderDropzone"] button * {
          color: #fffaf0 !important;
        }
        .upload-hint {
          margin: 0.5rem 0 1rem 0;
          padding: 0.95rem 1.05rem;
          border: 1px solid rgba(143,63,32,0.14);
          border-radius: 18px;
          background: rgba(255,243,178,0.56);
          color: var(--ink);
          font-size: 1rem;
        }
        .score-panel {
          margin: 0.5rem 0 1rem 0;
          padding: 1.4rem;
        }
        .score-panel h2 {
          color: var(--ink);
          font-size: clamp(2.4rem, 8vw, 5.6rem);
          line-height: 0.9;
          margin: 0;
        }
        .score-panel p {
          color: var(--ink);
          margin: 0.6rem 0 0 0;
          font-size: 1.05rem;
        }
        .score-bar {
          background: rgba(23,33,27,0.10);
          border-radius: 999px;
          height: 14px;
          margin-top: 1.25rem;
          overflow: hidden;
        }
        .score-bar span {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #d66b2d, #f2b15b);
        }
        div[data-testid="stMetric"] {
          background: rgba(255,250,240,0.78);
          border: 1px solid rgba(23,33,27,0.10);
          border-radius: 18px;
          padding: 1rem;
        }
        .stButton > button {
          background: var(--accent-dark);
          color: #fffaf0 !important;
          border: 1px solid rgba(23,33,27,0.18);
          border-radius: 999px;
          padding: 0.65rem 1.2rem;
          font-weight: 800;
        }
        .stButton > button * {
          color: #fffaf0 !important;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
