@echo off
echo ==========================================
echo  Step 1: SolarSense backend start ho raha hai (nayi window mein)
echo ==========================================
start "SolarSense Backend" cmd /k "cd /d C:\Users\Admin\Desktop\SolaarSense\backend && node server.js"
timeout /t 4 /nobreak >nul
echo ==========================================
echo  Step 2: 5 test records bhej rahe hain...
echo ==========================================
cd /d C:\Users\Admin\Desktop\SolaarSense
python send_controller_data.py --count 5
echo.
echo ==========================================
echo  Done. Ab "SolarSense Backend" wali window mein [controller-data] lines dekho.
echo  Band karne ke liye: backend window mein Ctrl+C, ya dono windows band kar do.
echo ==========================================
pause
