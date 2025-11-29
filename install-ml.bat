@echo off
echo Installing ML Service Dependencies...
cd ml_service

echo Installing lightweight ML dependencies...
pip install -r requirements-lite.txt

echo.
echo Optional: Install full ML models (requires more space and time)
echo Run: pip install -r requirements.txt
echo.

echo ML Service setup complete!
echo Start with: python app.py
pause