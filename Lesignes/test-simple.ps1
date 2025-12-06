# Test simple des panels
Write-Host "TEST DES PANELS LESIGNE" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

# Test User Panel
Write-Host "Test User Panel..." -ForegroundColor Yellow
try {
    $userResponse = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -UseBasicParsing
    if ($userResponse.StatusCode -eq 200) {
        Write-Host "User Panel: OK" -ForegroundColor Green
    } else {
        Write-Host "User Panel: Erreur $($userResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "User Panel: Non accessible" -ForegroundColor Red
}

# Test Admin Panel  
Write-Host "Test Admin Panel..." -ForegroundColor Yellow
try {
    $adminResponse = Invoke-WebRequest -Uri "http://localhost:3002" -TimeoutSec 5 -UseBasicParsing
    if ($adminResponse.StatusCode -eq 200) {
        Write-Host "Admin Panel: OK" -ForegroundColor Green
    } else {
        Write-Host "Admin Panel: Erreur $($adminResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Admin Panel: Non accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "LIENS:" -ForegroundColor Cyan
Write-Host "User Panel:  http://localhost:3001" -ForegroundColor Blue
Write-Host "Admin Panel: http://localhost:3002" -ForegroundColor Red
Write-Host ""
