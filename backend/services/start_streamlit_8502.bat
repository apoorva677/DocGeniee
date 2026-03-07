@echo off
echo Starting Streamlit on port 8502...
cd /d "%~dp0"
python -m streamlit run try.py --server.port 8502 --server.headless true --server.runOnSave true
pause
