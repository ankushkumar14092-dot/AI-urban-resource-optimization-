@echo off
echo Starting AI Urban Resource Optimization API...
pip install -r api_requirements.txt --quiet
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
