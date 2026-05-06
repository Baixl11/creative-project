# Deploy Job Agent as a Web App

This project is ready to deploy with Streamlit Community Cloud from the monorepo:

- Repository: `Baixl11/creative-project`
- Branch: `main`
- Main file path: `projects/job-agent/web_app.py`

## Why Streamlit Cloud

Job Agent already uses Streamlit for its Web UI, so Streamlit Community Cloud is the smallest deployment step: GitHub hosts the code, Streamlit runs the Python app, and reviewers can open a URL instead of running terminal commands.

## Deploy Steps

1. Open Streamlit Community Cloud.
2. Choose **Create app**.
3. Select the GitHub repository:

```text
Baixl11/creative-project
```

4. Select branch:

```text
main
```

5. Set the main file path:

```text
projects/job-agent/web_app.py
```

6. Keep mock mode enabled for the public demo. No API key is required.

7. Deploy the app and open the generated `*.streamlit.app` URL.

## Public Demo Mode

The Web UI supports three modes:

- `使用内置样例`: quick English sample for checking the basic flow.
- `使用真实样例`: uses private `data/my_*` files locally when present, and falls back to public Chinese demo data on GitHub or cloud deployment.
- `上传自己的文件`: upload JD and resume files directly in the browser.

The public deployment should use the public demo fallback because private files are intentionally excluded from GitHub.

## Optional Live LLM

The public app defaults to mock mode to avoid API cost and secret leakage.

If you later want live LLM output, configure secrets or environment variables in Streamlit Cloud:

```text
USE_MOCK_LLM=false
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=your_api_key
LLM_MODEL=gpt-4.1-mini
LLM_TIMEOUT_SECONDS=30
```

Do not commit these values to GitHub.

## OCR Notes

`requirements.txt` installs Python packages for PDF and OCR support.

`packages.txt` requests Linux system OCR packages for Streamlit Cloud:

- `tesseract-ocr`
- `tesseract-ocr-eng`
- `tesseract-ocr-chi-sim`

When this project is synced into the `creative-project` monorepo, keep a copy of this file at the repository root as well:

```text
creative-project/packages.txt
creative-project/projects/job-agent/packages.txt
```

OCR quality still depends on screenshot clarity, so real JD screenshots should be checked after deployment.
