@echo off
echo Starting Varu's Knit Store Development Environment...

echo.
echo Starting Backend (with Redis + ML Service auto-start)...
cd backend
start "Backend + Services" cmd /k "npm start"
cd ..

timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ✅ Development environment started!
echo - Backend + Redis + ML: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
pause