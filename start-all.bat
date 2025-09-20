@echo off
echo Starting Varu's Knit Store Application...

echo.
echo 1. Starting Redis Server...
cd Redis
start "Redis Server" redis-server.exe
cd ..

echo.
echo 2. Starting ML Service...
cd ml_service
start "ML Service" cmd /k "python app.py"
cd ..

echo.
echo 3. Starting Backend...
cd backend
start "Backend" cmd /k "npm start"
cd ..

echo.
echo 4. Starting Frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo All services started!
echo - Redis: localhost:6379
echo - ML Service: localhost:5001
echo - Backend: localhost:5000
echo - Frontend: localhost:5173
echo.
pause