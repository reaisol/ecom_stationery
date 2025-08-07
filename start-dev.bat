@echo off
echo Starting Paper eCommerce Platform Development Environment
echo.

echo Starting Flask Backend...
start "Flask Backend" cmd /k "cd backend && python app.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting React Frontend...
start "React Frontend" cmd /k "npm start"

echo.
echo Development servers starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
pause
