param(
  [string]$OutputDirectory = "release/itch"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$version = (Get-Content -LiteralPath (Join-Path $root "VERSION") -Raw).Trim()
$output = Join-Path $root $OutputDirectory
$stage = Join-Path ([System.IO.Path]::GetTempPath()) ("catoons-itch-" + [guid]::NewGuid().ToString("N"))
$archive = Join-Path $output ("CatoonsTD_v{0}_ITCH_HTML5.zip" -f $version)

try {
  node (Join-Path $root "scripts/validate-release.mjs")
  if ($LASTEXITCODE -ne 0) { throw "A validação da release falhou." }

  New-Item -ItemType Directory -Force -Path $output | Out-Null
  New-Item -ItemType Directory -Force -Path $stage | Out-Null
  Copy-Item -LiteralPath (Join-Path $root "index.html") -Destination $stage
  Copy-Item -LiteralPath (Join-Path $root "src") -Destination $stage -Recurse
  Copy-Item -LiteralPath (Join-Path $root "assets") -Destination $stage -Recurse

  if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive }
  Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $archive -CompressionLevel Optimal
  Write-Host "Pacote itch.io criado: $archive"
}
finally {
  if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
}
