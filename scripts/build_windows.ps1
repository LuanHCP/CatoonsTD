$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$env:GOOS = "windows"
$env:GOARCH = "amd64"
$env:CGO_ENABLED = "0"

go build -trimpath -ldflags="-s -w -H windowsgui" -o CatoonsTD.exe .\desktop\launcher.go
Write-Host "Build criada: CatoonsTD.exe"
Write-Host "Para distribuição, mantenha o executável ao lado de uma pasta app/ contendo index.html e src/."
