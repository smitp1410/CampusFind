# CampusFind PowerShell Runner
$root = $PSScriptRoot
$env:PATH = "$env:LOCALAPPDATA\Programs\nodejs;$env:PATH"

Write-Host "===================================================" -ForegroundColor Green
Write-Host "    CAMPUSFIND — University Lost & Found System    " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; .venv\Scripts\python.exe run.py"

Write-Host "[2/2] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; `$env:PATH = '$env:LOCALAPPDATA\Programs\nodejs;' + `$env:PATH; npm run dev"

Write-Host "`n✓ Both services dispatched successfully!" -ForegroundColor Green
Write-Host "Frontend:     http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend Docs: http://localhost:8000/docs" -ForegroundColor Cyan
