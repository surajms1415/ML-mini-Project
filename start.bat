@echo off
echo ========================================================
echo Starting Potato Mandi Analytics Application
echo ========================================================

echo [1/2] Starting Backend API...
cd backend
IF NOT EXIST "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)
start cmd /k "venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

echo [2/2] Starting Frontend Server...
cd ../frontend
IF NOT EXIST "node_modules" (
    echo Installing frontend dependencies - this might take a minute...
    call npm install
)
start cmd /k "npm run dev"

echo ========================================================
echo Both services are starting up!
echo Opening your browser to the application...
echo ========================================================
timeout /t 5 /nobreak > NUL
start http://localhost:5173

