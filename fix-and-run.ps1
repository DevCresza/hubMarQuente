# Script PowerShell para corrigir e rodar o projeto
# Execute como: .\fix-and-run.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  CORRIGINDO E INICIANDO PROJETO    " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Navegar para o diretório do script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "[1/8] Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✓ Cache limpo" -ForegroundColor Green
Write-Host ""

Write-Host "[2/8] Removendo node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✓ node_modules removido" -ForegroundColor Green
} else {
    Write-Host "✓ node_modules não existe" -ForegroundColor Green
}
Write-Host ""

Write-Host "[3/8] Removendo package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✓ package-lock.json removido" -ForegroundColor Green
} else {
    Write-Host "✓ package-lock.json não existe" -ForegroundColor Green
}
Write-Host ""

Write-Host "[4/8] Configurando npm para Windows..." -ForegroundColor Yellow
npm config set platform win32
npm config set arch x64
Write-Host "✓ npm configurado" -ForegroundColor Green
Write-Host ""

Write-Host "[5/8] Instalando dependências (isso pode demorar)..." -ForegroundColor Yellow
npm install
Write-Host "✓ Dependências instaladas" -ForegroundColor Green
Write-Host ""

Write-Host "[6/8] Instalando pacote Rollup para Windows..." -ForegroundColor Yellow
npm install --force @rollup/rollup-win32-x64-msvc
Write-Host "✓ Rollup instalado" -ForegroundColor Green
Write-Host ""

Write-Host "[7/8] Verificando instalação do Rollup..." -ForegroundColor Yellow
if (Test-Path "node_modules\@rollup\rollup-win32-x64-msvc") {
    Write-Host "✓ Rollup Win32 encontrado!" -ForegroundColor Green
    Get-ChildItem "node_modules\@rollup\" | Select-Object Name
} else {
    Write-Host "✗ AVISO: Rollup Win32 não encontrado" -ForegroundColor Red
    Write-Host "Pacotes Rollup disponíveis:" -ForegroundColor Yellow
    Get-ChildItem "node_modules\@rollup\" | Select-Object Name
}
Write-Host ""

Write-Host "[8/8] Iniciando servidor de desenvolvimento..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  SERVIDOR ESTÁ INICIANDO...        " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Acesse: http://localhost:5173" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

npm run dev
