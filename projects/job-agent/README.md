# Job Agent

`Job Agent` is a local Python project that simulates a practical AI agent workflow for job search and career transition.

It reads a job description and a resume, extracts the most relevant signals, scores the fit, shows the best resume evidence for each requirement, generates resume improvement suggestions, and writes a Markdown report to disk.
The report now includes structured resume bullet rewrite suggestions that separate original evidence from rewritten bullets, so the output is not only diagnostic but also actionable.
The input files can be plain text, Markdown, a macOS text package, a text-based resume PDF, or a screenshot image when OCR dependencies are installed.
It also exports a structured JSON artifact that is useful for evaluation, future UI work, and workflow debugging.

This project is designed to help a beginner learn the full AI project lifecycle:

- product scoping
- project structure
- prompt design
- tool orchestration
- model integration
- evaluation
- documentation

## Portfolio and demo docs

If you are reviewing this as a portfolio project, start here:

- [PORTFOLIO.md](PORTFOLIO.md): product story, architecture, real-data iteration, current limitations, and interview talking points
- [PORTFOLIO_CASE_STUDY.md](PORTFOLIO_CASE_STUDY.md): page-by-page portfolio case study copy, screenshot plan, resume bullets, and interview script
- [PROJECT_STATUS.md](PROJECT_STATUS.md): current completion status, next 3 days, remaining work, and delivery checklist
- [DEMO_GUIDE.md](DEMO_GUIDE.md): step-by-step local demo script for interviews or project walkthroughs
- [WEB_DEMO.md](WEB_DEMO.md): local Streamlit web UI launch and demo guide
- [DEPLOYMENT.md](DEPLOYMENT.md): Streamlit Community Cloud deployment guide for the GitHub monorepo
- [AGENTS.md](AGENTS.md): Codex collaboration rules, verification gates, and task workflow
- [ARCHITECTURE.md](ARCHITECTURE.md): current project map, module boundaries, generated artifacts, and core commands

## Web entry

The recommended portfolio entry is the Streamlit Web UI.

For local use:

```bash
streamlit run web_app.py
```

For the GitHub monorepo deployment, use Streamlit Community Cloud with:

```text
Repository: Baixl11/creative-project
Branch: main
Main file path: projects/job-agent/web_app.py
```

The public Web app runs in mock mode by default, so reviewers can try the product flow without an API key or model cost.

## Why this project is a good first AI build

- The use case is real and easy to explain in interviews.
- The workflow is small enough to finish in two weeks.
- The architecture leaves room for future upgrades.
- The app can run in `mock` mode without an API key.

## Project structure

```text
app/
  agents/
  prompts/
  services/
  utils/
data/
outputs/
tests/
.harness/
docs/
web_app.py
```

## Privacy and generated files

The project uses `.gitignore` to keep local-only files out of version control:

- `.env` and `.venv/`
- Python caches
- generated reports under `outputs/`
- real personal test inputs under `data/my_*`

This keeps the portfolio safe to share while still allowing you to test locally with private JD and resume files.

## Quick start

1. Create a virtual environment.

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies.

```bash
pip install -r requirements.txt
```

Plain `.txt` inputs can still run with the Python standard library only. Install dependencies when you want PDF resume parsing, screenshot OCR, or the Streamlit Web UI.

3. Copy the environment template.

```bash
cp .env.example .env
```

4. Run the agent in mock mode.

```bash
python3 -m app.main --jd data/sample_jd.txt --resume data/sample_resume.txt --output outputs/report.md --json-output outputs/report.json
```

You can also use a JD screenshot and a resume PDF:

```bash
python3 -m app.main --jd data/my_jd.png --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json
```

Private local samples use the `data/my_*` naming pattern and are ignored by git. For public demos, use:

```bash
python3 -m app.main --jd data/demo_jd_cn.txt --resume data/demo_resume_cn.txt --output outputs/demo_cn_report.md --json-output outputs/demo_cn_report.json
```

5. Or launch the local Web UI.

```bash
streamlit run web_app.py
```

If this project is inside the `creative-project` monorepo, launch it from the monorepo root with:

```bash
streamlit run projects/job-agent/web_app.py
```

6. Open the generated artifacts.

```bash
cat outputs/report.md
cat outputs/report.json
```

## Switching from mock mode to a live model

Update `.env`:

```bash
LLM_API_KEY=your_key_here
USE_MOCK_LLM=false
```

The current code expects an OpenAI-compatible `chat/completions` endpoint. That means you can use any provider that supports the same API shape.

## Run the baseline tests

```bash
python3 -m unittest discover -s tests
```

## Run the evaluation suite

The project includes a small evaluation set with high, medium, and low match examples. This helps you check whether scoring changes still behave as expected across multiple cases.

```bash
python3 -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations
```

Open the generated summary. It includes the score, expected range, pass/check status, matched and missing requirement counts, top evidence, and a short diagnosis for each case.

```bash
cat outputs/evaluations/summary.md
```

## What each part teaches you

- `app/main.py`: CLI entrypoint and argument handling
- `app/agents/`: agent orchestration
- `app/services/`: parsing, scoring, report generation, and LLM access
- `app/services/resume_rewriter.py`: turns match evidence into structured resume bullet rewrite suggestions
- `app/evaluate.py`: batch evaluation entrypoint for multiple sample cases
- `data/eval_cases/`: high, medium, and low match examples for regression checks
- `outputs/report.json`: structured workflow result for evaluation or UI integration
- `app/prompts/`: prompt assets for later iterations
- `app/utils/`: file and text helpers
- `tests/`: a small example of workflow validation with the standard library

## Current workflow

1. Validate the job description and resume files
2. Read the job description
3. Read the resume
4. Extract useful lines
5. Score the overlap
6. Attach the best or closest resume evidence to each requirement
7. Generate structured resume bullet rewrite suggestions from the strongest evidence
8. Generate interview questions
9. Write Markdown and JSON outputs

## Input validation

The CLI checks the required input files before running the agent. It will stop with a clear `Input error` message when:

- the JD file path does not exist
- the resume file path does not exist
- either path points to an unsupported directory instead of a file or macOS text package
- either input file is empty or has no extractable text
- the file type is not supported

Supported file types:

- Text and Markdown: `.txt`, `.md`, `.markdown`
- macOS text packages that contain `TXT.rtf` or `Text.rtf`
- Resume PDFs: `.pdf`
- JD screenshots or image inputs: `.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.tif`, `.tiff`

PDF input uses `pypdf` and works best for text-based PDFs. The project includes basic Chinese resume line cleanup, but scanned PDFs may not contain extractable text.

Image OCR uses `Pillow`, `pytesseract`, and the Tesseract OCR app. Install Python dependencies with:

```bash
pip install -r requirements.txt
```

On macOS, install the OCR app with:

```bash
brew install tesseract
```

For Chinese screenshots, the app now defaults to `chi_sim+eng` so it can handle Chinese JD text mixed with English terms like AI, LLM, SaaS, or SQL. On macOS, install the Chinese language data first:

```bash
brew install tesseract-lang
tesseract --list-langs
```

Confirm that `chi_sim` appears in the language list. Then run:

```bash
python3 -m app.main --jd data/my_jd.png --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json
```

If you want to force a different OCR language, override it with `OCR_LANG`:

```bash
OCR_LANG=eng python3 -m app.main --jd data/my_jd.png --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json
```

## Recommended next upgrades

- finish Web UI manual acceptance for upload, copy, and download flows
- test OCR with real JD screenshots and add domain-term correction if needed
- initialize git and create a clean project history
- use a live LLM to polish resume bullet rewrites when API setup is ready
- strengthen complex PDF cleanup for multi-column or heavily formatted resumes

## Learning tip

For a first AI project, do not chase complexity too early. A stable, understandable workflow is much better for learning than a large but fragile agent stack.
