@echo off
echo Starting Streamlit Data Analysis App...
cd /d "%~dp0"
python -m streamlit run try.py --server.port 8501 --server.headless true --server.runOnSave true
pause
