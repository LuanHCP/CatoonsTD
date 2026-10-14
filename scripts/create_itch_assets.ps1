param(
  [string]$OutputDirectory = "release/itch"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$version = (Get-Content -LiteralPath (Join-Path $root "VERSION") -Raw).Trim()
$output = Join-Path $root $OutputDirectory
$media = Join-Path $output "page-assets"
$source = Join-Path $root "screenshots/pt/02-gameplay.jpg"
$cover = Join-Path $output "CatoonsTD-cover-630x500.jpg"

Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $media | Out-Null

$image = [System.Drawing.Image]::FromFile($source)
$bitmap = New-Object System.Drawing.Bitmap 630, 500
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
try {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $scale = [Math]::Max(630 / $image.Width, 500 / $image.Height)
  $drawWidth = [int]($image.Width * $scale)
  $drawHeight = [int]($image.Height * $scale)
  $drawX = [int]((630 - $drawWidth) / 2)
  $drawY = [int]((500 - $drawHeight) / 2)
  $graphics.DrawImage($image, $drawX, $drawY, $drawWidth, $drawHeight)

  $overlay = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(150, 4, 11, 22))
  $graphics.FillRectangle($overlay, 0, 0, 630, 500)
  $panel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(205, 7, 20, 35))
  $graphics.FillRectangle($panel, 34, 285, 562, 168)

  $titleFont = New-Object System.Drawing.Font "Arial", 48, ([System.Drawing.FontStyle]::Bold)
  $subtitleFont = New-Object System.Drawing.Font "Arial", 19, ([System.Drawing.FontStyle]::Bold)
  $smallFont = New-Object System.Drawing.Font "Arial", 14, ([System.Drawing.FontStyle]::Regular)
  $white = [System.Drawing.Brushes]::White
  $salmon = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 149, 127))
  $graphics.DrawString("CATOONS TD", $titleFont, $white, 53, 302)
  $graphics.DrawString(("BETA PÚBLICO • v{0}" -f $version), $subtitleFont, $salmon, 56, 373)
  $graphics.DrawString("Tower Defense de gatinhos", $smallFont, $white, 57, 416)

  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq "image/jpeg"
  $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
  $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 92L
  $bitmap.Save($cover, $encoder, $parameters)
}
finally {
  $graphics.Dispose()
  $bitmap.Dispose()
  $image.Dispose()
}

$shots = @("01-lobby.jpg", "02-gameplay.jpg", "03-heroes.jpg", "05-dual-path.jpg", "06-upgrades.jpg")
foreach ($shot in $shots) {
  Copy-Item -LiteralPath (Join-Path $root "screenshots/pt/$shot") -Destination (Join-Path $media $shot) -Force
}
Copy-Item -LiteralPath (Join-Path $root "docs/ITCH_IO_RELEASE.md") -Destination (Join-Path $media "TEXTO_DA_PAGINA.md") -Force

$kit = Join-Path $output ("CatoonsTD_v{0}_ITCH_PAGE_KIT.zip" -f $version)
if (Test-Path -LiteralPath $kit) { Remove-Item -LiteralPath $kit }
Compress-Archive -LiteralPath $cover, $media -DestinationPath $kit -CompressionLevel Optimal

Write-Host "Capa, capturas e kit da página do itch.io criados em: $output"
