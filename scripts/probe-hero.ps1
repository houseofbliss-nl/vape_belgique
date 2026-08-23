// Analyse de luminosite des zones d une image (sans vision).
// But : decider ou poser le bouton Telegram et de quelle couleur il doit etre.
// Lit le fichier via System.Drawing, echantillonne des regions, calcule la luminance.
param([string]$Path, [int]$Samples = 60)
Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile($Path)
$w = $bmp.Width; $h = $bmp.Height
"IMG: $Path  ${w}x${h}"

function Luminance([int]$x, [int]$y) {
  $c = $bmp.GetPixel([Math]::Min($x, $w-1), [Math]::Min($y, $h-1))
  return (0.2126 * $c.R + 0.7152 * $c.G + 0.0722 * $c.B)
}

# Moyenne sur une région (fractions de largeur/hauteur)
function Region([double]$x0,[double]$y0,[double]$x1,[double]$y1) {
  $sum = 0.0; $n = 0
  $stepX = [Math]::Max(1, [int](($w * ($x1-$x0)) / ($W * 6)))
  $stepY = [Math]::Max(1, [int](($h * ($y1-$y0)) / ($W * 6 * ($h/$w))))
  for ($px = [int]($w*$x0); $px -lt [int]($w*$x1); $px += $stepX) {
    for ($py = [int]($h*$y0); $py -lt [int]($h*$y1); $py += $stepY) {
      $sum += Luminance $px $py; $n++
    }
  }
  return if ($n -gt 0) { [Math]::Round($sum/$n) } else { 0 }
}

"Luminosité des régions (0 = noir, 255 = blanc) :"
"  Bas-gauche (20%,65%-55%,130%): " + (Region 0.02 0.65 0.55 1.30)
"  Bas-centre : " + (Region 0.20 0.85 0.80 1.00)
"  Haut       : " + (Region 0.10 0.02 0.90 0.20)
"  Milieu     : " + (Region 0.25 0.35 0.75 0.70)
# Couleur dominante (échantillon central)
$c = $bmp.GetPixel([int]($w/2), [int]($h/2))
"Pixel centre : R=$($c.R) G=$($c.G) B=$($c.B)"
$bmp.Dispose()