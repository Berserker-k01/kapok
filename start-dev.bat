@echo off
echo ========================================
echo    LESIGNE PLATFORM - DEMARRAGE DEV
echo ========================================
echo.

echo Demarrage du serveur backend...
start "Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Demarrage du User Panel...
start "User Panel" cmd /k "cd user-panel && npm run dev"

timeout /t 2 /nobreak >nul

echo Demarrage de l'Admin Panel...
start "Admin Panel" cmd /k "cd admin-panel && npm run dev"

echo.
echo ========================================
echo Applications en cours de demarrage...
echo.
echo Backend:     http://localhost:5000
echo User Panel:  http://localhost:3001  
echo Admin Panel: http://localhost:3002
echo ========================================
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul
