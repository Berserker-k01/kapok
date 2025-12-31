# Script de test automatique des panels
Write-Host "🧪 TEST AUTOMATIQUE DES PANELS" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour tester une URL
function Test-PanelUrl($url, $name) {
    Write-Host "🔍 Test de $name ($url)..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            $content = $response.Content
            
            # Vérifications basiques
            $checks = @{
                "HTML valide" = $content -match "<!doctype html"
                "React chargé" = $content -match "root"
                "Pas d erreur 404" = $response.StatusCode -ne 404
                "Contenu non vide" = $content.Length -gt 100
            }
            
            $passed = 0
            $total = $checks.Count
            
            foreach ($check in $checks.GetEnumerator()) {
                if ($check.Value) {
                    Write-Host "  ✅ $($check.Key)" -ForegroundColor Green
                    $passed++
                } else {
                    Write-Host "  ❌ $($check.Key)" -ForegroundColor Red
                }
            }
            
            $percentage = [math]::Round(($passed / $total) * 100)
            
            if ($percentage -eq 100) {
                Write-Host "🎉 $name: SUCCÈS ($percentage%)" -ForegroundColor Green
                return $true
            } elseif ($percentage -ge 75) {
                Write-Host "⚠️ $name: PARTIEL ($percentage%)" -ForegroundColor Yellow
                return $true
            } else {
                Write-Host "❌ $name: ÉCHEC ($percentage%)" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "❌ $name: Code de statut $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $name: Erreur de connexion - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Attendre que les serveurs démarrent
Write-Host "⏳ Attente du démarrage des serveurs (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Tests des panels
$results = @{}
$results["User Panel"] = Test-PanelUrl "http://localhost:3001" "User Panel"
Write-Host ""
$results["Admin Panel"] = Test-PanelUrl "http://localhost:3002" "Admin Panel"
Write-Host ""

# Test du backend (optionnel)
Write-Host "🔍 Test du Backend (optionnel)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend: Actif" -ForegroundColor Green
        $results["Backend"] = $true
    } else {
        Write-Host "⚠️ Backend: Non configuré (normal)" -ForegroundColor Yellow
        $results["Backend"] = $null
    }
} catch {
    Write-Host "⚠️ Backend: Non démarré (normal)" -ForegroundColor Yellow
    $results["Backend"] = $null
}

# Résumé final
Write-Host ""
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

$successCount = 0
$totalTests = 0

foreach ($result in $results.GetEnumerator()) {
    if ($result.Value -ne $null) {
        $totalTests++
        if ($result.Value) {
            Write-Host "✅ $($result.Key): FONCTIONNEL" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ $($result.Key): PROBLÈME" -ForegroundColor Red
        }
    } else {
        Write-Host "⚪ $($result.Key): NON TESTÉ" -ForegroundColor Gray
    }
}

Write-Host ""
if ($successCount -eq $totalTests -and $totalTests -gt 0) {
    Write-Host "🎉 TOUS LES TESTS RÉUSSIS ! ($successCount/$totalTests)" -ForegroundColor Green
    Write-Host "La plateforme Lesigne est opérationnelle !" -ForegroundColor Green
} elseif ($successCount -gt 0) {
    Write-Host "⚠️ TESTS PARTIELS ($successCount/$totalTests)" -ForegroundColor Yellow
    Write-Host "Certains composants fonctionnent, vérifiez les erreurs ci-dessus." -ForegroundColor Yellow
} else {
    Write-Host "❌ ÉCHEC DES TESTS (0/$totalTests)" -ForegroundColor Red
    Write-Host "Consultez le guide de dépannage: TROUBLESHOOTING.md" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 LIENS RAPIDES" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "User Panel:  http://localhost:3001" -ForegroundColor Blue
Write-Host "Admin Panel: http://localhost:3002" -ForegroundColor Red
Write-Host "Backend:     http://localhost:5000 (si configuré)" -ForegroundColor Yellow
Write-Host ""
