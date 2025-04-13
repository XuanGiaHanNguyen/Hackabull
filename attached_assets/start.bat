@echo off
echo Starting EcoScan - Sustainability Product Analyzer
echo =================================================

REM Check if Python is installed
python --version 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if virtual environment exists, create if not
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created.
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt

REM Run the application
echo Starting the application...
echo.
echo When the server starts, open your browser and go to:
echo http://localhost:5000
echo.
python app.py

REM Deactivate virtual environment when the app stops
call venv\Scripts\deactivate.bat
pause 