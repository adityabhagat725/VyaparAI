@echo off
echo ========================================================
echo   Starting VyaparAI — Agentic Back Office for MSMEs
echo ========================================================
echo.
echo 1. Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo 2. Launching Backend and Frontend concurrently...
echo    - Backend API:       http://localhost:5000
echo    - Frontend & Sim:    http://localhost:3000
echo.
call npm run dev
pause
