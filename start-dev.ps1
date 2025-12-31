# Script PowerShell pour démarrer Lesigne Platform en mode développement

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LESIGNE PLATFORM - DEMARRAGE DEV" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou non disponible dans PATH" -ForegroundColor Red
    exit 1
}

# Arrêter les processus Node.js existants
Write-Host "🔄 Arrêt des processus existants..." -ForegroundColor Yellow
try {
    taskkill /f /im node.exe 2>$null
    Start-Sleep -Seconds 1
} catch {
    # Ignorer les erreurs si aucun processus n'est en cours
}

# Fonction pour démarrer une application dans un nouveau terminal
function Start-App {
    param($Name, $Path, $Command, $Color)
    
    Write-Host "🚀 Démarrage de $Name..." -ForegroundColor $Color
    
    $fullPath = Join-Path (Get-Location) $Path
    $scriptBlock = "cd '$fullPath'; $Command; Write-Host 'Appuyez sur une touche pour fermer...' -ForegroundColor Red; `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock -WindowStyle Normal
    
    Start-Sleep -Seconds 3
}

# Démarrer les applications
Start-App "Backend Server" "server" "npm run dev" "Yellow"
Start-App "User Panel" "user-panel" "npm run dev" "Blue" 
Start-App "Admin Panel" "admin-panel" "npm run dev" "Magenta"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Applications démarrées avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs d'accès:" -ForegroundColor White
Write-Host "   Backend:     http://localhost:5000" -ForegroundColor Gray
Write-Host "   User Panel:  http://localhost:3001" -ForegroundColor Gray  
Write-Host "   Admin Panel: http://localhost:3002" -ForegroundColor Gray
Write-Host ""
Write-Host "🔐 Comptes de test:" -ForegroundColor White
Write-Host "   Admin: admin@lesigne.com / admin123" -ForegroundColor Gray
Write-Host "   User:  demo@user.com ou bouton 'Connexion Démo'" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Problèmes courants:" -ForegroundColor White
Write-Host "   - Pages blanches: Vérifiez la console du navigateur" -ForegroundColor Gray
Write-Host "   - Erreurs 404: Assurez-vous que le backend est démarré" -ForegroundColor Gray
Write-Host "   - Ports occupés: Les apps changeront automatiquement de port" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
