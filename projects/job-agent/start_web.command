#!/bin/zsh

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "没有找到 .venv，请先创建并安装依赖。"
  echo "可以运行：python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

source .venv/bin/activate
export STREAMLIT_BROWSER_GATHER_USAGE_STATS=false
echo "正在启动 Job Agent Web UI..."
echo "如果浏览器没有自动打开，请访问：http://localhost:8501"
streamlit run web_app.py
