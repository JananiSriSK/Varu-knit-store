@echo off
echo Starting Redis Server...
cd Redis
start "Redis Server" redis-server.exe
echo Redis Server started in new window
pause