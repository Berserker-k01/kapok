# Script de diagnostic complet pour Lesigne Platform
param(
    [switch]$Fix,
    [switch]$Verbose
)

Write-Host "🔍 DIAGNOSTIC LESIGNE PLATFORM" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$fixes = @()

# Fonction pour ajouter un problème
function Add-Issue($title, $description, $fixAction = $null) {
    $script:issues += @{
        Title = $title
        Description = $description
        FixAction = $fixAction
    }
}

# Fonction pour exécuter une correction
function Execute-Fix($action) {
    if ($Fix -and $action) {
        try {
            & $action
            Write-Host "✅ Correction appliquée" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erreur lors de la correction: $_" -ForegroundColor Red
        }
    }
}

# 1. Vérifier Node.js
Write-Host "🔍 Vérification Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Add-Issue "Node.js manquant" "Node.js n'est pas installé ou non disponible dans PATH"
    Write-Host "❌ Node.js non trouvé" -ForegroundColor Red
}

# 2. Vérifier les dépendances
Write-Host "🔍 Vérification des dépendances..." -ForegroundColor Yellow

$panels = @("user-panel", "admin-panel", "server")
foreach ($panel in $panels) {
    if (Test-Path "$panel/package.json") {
        if (!(Test-Path "$panel/node_modules")) {
            Add-Issue "Dépendances manquantes - $panel" "node_modules manquant dans $panel" {
                Set-Location $panel
                npm install
                Set-Location ..
            }
            Write-Host "❌ $panel: node_modules manquant" -ForegroundColor Red
        } else {
            Write-Host "✅ $panel: dépendances OK" -ForegroundColor Green
        }
    }
}

# 3. Vérifier les fichiers critiques
Write-Host "🔍 Vérification des fichiers critiques..." -ForegroundColor Yellow

$criticalFiles = @{
    "user-panel/src/App.jsx" = "Composant principal User Panel"
    "user-panel/src/main.jsx" = "Point d'entrée User Panel"
    "user-panel/src/store/authStore.js" = "Store d'authentification User Panel"
    "admin-panel/src/App.jsx" = "Composant principal Admin Panel"
    "admin-panel/src/main.jsx" = "Point d'entrée Admin Panel"
    "admin-panel/src/store/authStore.js" = "Store d'authentification Admin Panel"
    "server/src/index.js" = "Serveur backend"
}

foreach ($file in $criticalFiles.Keys) {
    if (Test-Path $file) {
        Write-Host "✅ $($criticalFiles[$file])" -ForegroundColor Green
    } else {
        Add-Issue "Fichier manquant" "$($criticalFiles[$file]) - $file manquant"
        Write-Host "❌ $($criticalFiles[$file]) manquant" -ForegroundColor Red
    }
}

# 4. Vérifier les configurations Tailwind
Write-Host "🔍 Vérification des configurations Tailwind..." -ForegroundColor Yellow

foreach ($panel in @("user-panel", "admin-panel")) {
    $tailwindConfig = "$panel/tailwind.config.js"
    if (Test-Path $tailwindConfig) {
        $content = Get-Content $tailwindConfig -Raw
        if ($content -match "primary.*500" -and $content -match "secondary.*500") {
            Write-Host "✅ $panel: Configuration Tailwind OK" -ForegroundColor Green
        } else {
            Add-Issue "Configuration Tailwind incomplète - $panel" "Couleurs personnalisées manquantes dans $tailwindConfig"
            Write-Host "⚠️ $panel: Configuration Tailwind incomplète" -ForegroundColor Yellow
        }
    } else {
        Add-Issue "Configuration Tailwind manquante - $panel" "$tailwindConfig manquant"
        Write-Host "❌ $panel: tailwind.config.js manquant" -ForegroundColor Red
    }
}

# 5. Vérifier les ports
Write-Host "🔍 Vérification des ports..." -ForegroundColor Yellow

$ports = @{3001 = "User Panel"; 3002 = "Admin Panel"; 5000 = "Backend"}
foreach ($port in $ports.Keys) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "✅ Port $port ($($ports[$port])): Actif" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Port $port ($($ports[$port])): Libre" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ Port $port ($($ports[$port])): Non testé" -ForegroundColor Yellow
    }
}

# 6. Vérifier les processus Node.js
Write-Host "🔍 Vérification des processus..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "✅ $($nodeProcesses.Count) processus Node.js actifs" -ForegroundColor Green
    if ($Verbose) {
        $nodeProcesses | ForEach-Object { Write-Host "   PID: $($_.Id)" -ForegroundColor Gray }
    }
} else {
    Write-Host "⚠️ Aucun processus Node.js actif" -ForegroundColor Yellow
}

# Résumé
Write-Host ""
Write-Host "📊 RÉSUMÉ DU DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

if ($issues.Count -eq 0) {
    Write-Host "🎉 Aucun problème détecté ! La plateforme semble fonctionnelle." -ForegroundColor Green
} else {
    Write-Host "⚠️ $($issues.Count) problème(s) détecté(s):" -ForegroundColor Yellow
    Write-Host ""
    
    for ($i = 0; $i -lt $issues.Count; $i++) {
        $issue = $issues[$i]
        Write-Host "$(($i+1)). $($issue.Title)" -ForegroundColor Red
        Write-Host "   $($issue.Description)" -ForegroundColor Gray
        
        if ($Fix -and $issue.FixAction) {
            Write-Host "   🔧 Application de la correction..." -ForegroundColor Yellow
            Execute-Fix $issue.FixAction
        }
        Write-Host ""
    }
    
    if (!$Fix) {
        Write-Host "💡 Utilisez le paramètre -Fix pour appliquer les corrections automatiques" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "🚀 COMMANDES UTILES" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "Démarrer tout:     .\start-dev.ps1" -ForegroundColor Gray
Write-Host "Installer tout:    .\install-all.bat" -ForegroundColor Gray
Write-Host "Diagnostic + Fix:  .\diagnose.ps1 -Fix" -ForegroundColor Gray
Write-Host "Arrêter Node.js:   taskkill /f /im node.exe" -ForegroundColor Gray
Write-Host ""
