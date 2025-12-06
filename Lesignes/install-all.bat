@echo off
echo ========================================
echo    LESIGNE PLATFORM - INSTALLATION
echo ========================================
echo.

echo Installation des dependances du serveur...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation du serveur
    pause
    exit /b 1
)
cd ..

echo.
echo Installation des dependances du User Panel...
cd user-panel
call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation du User Panel
    pause
    exit /b 1
)
cd ..

echo.
echo Installation des dependances de l'Admin Panel...
cd admin-panel
call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation de l'Admin Panel
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo ✅ Installation terminee avec succes!
echo ========================================
echo.
echo Prochaines etapes:
echo 1. Configurer la base de donnees PostgreSQL
echo 2. Copier server/.env.example vers server/.env
echo 3. Executer start-dev.bat pour demarrer
echo.
echo Appuyez sur une touche pour continuer...
pause >nul
