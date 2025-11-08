@echo off
echo ================================================
echo    Installing Activity Tracker Dependencies
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo Python found!
echo.

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip
echo.

REM Install dependencies
echo Installing dependencies from requirements.txt...
pip install -r requirements.txt
echo.

REM Download NLTK data
echo Downloading NLTK data...
python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"
echo.

echo ================================================
echo    Installation Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Set up Supabase database (run SQL in supabase_schema.sql)
echo 2. Configure .env.local with Supabase credentials
echo 3. Test connection: python supabase_helper.py
echo 4. Start tracker: python run_tracker.py
echo.
pause
