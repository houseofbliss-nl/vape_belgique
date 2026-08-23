# Génère public/images/og-default.png (1200×630) — image sociale VAPELT.
# Couleurs VAPELT : rouge primaire #dc2626 + violet #7C3AED sur fond sombre.
Add-Type -AssemblyName System.Drawing

$w = 1200; $h = 630
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Fond dégradé sombre (noir → gris très foncé)
$dark = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(18, 18, 20))
$g.FillRectangle($dark, 0, 0, $w, $h)

# Bande violette basse (accent)
$violet = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(124, 58, 237))  # #7C3AED
$g.FillRectangle($violet, 0, $h - 18, $w, 18)

# Gros « V » violet stylisé (carré à gauche)
$square = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(124, 58, 237))
$g.FillRectangle($square, 64, 60, 180, 180)

# Logo texte « VAPELT » près du carré
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$fLogo = New-Object System.Drawing.Font("Segoe UI", 72, [System.Drawing.FontStyle]::Bold)
$g.DrawString("VAPELT", $fLogo, $white, 300, 92)

# Rouge accent sur « E » ? — on fait juste un point rouge sous le texte
$red = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 38, 38))  # #dc2626
$g.FillRectangle($red, 304, 196, 260, 10)

# Sous-titre
$grey = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 200, 205))
$fSub = New-Object System.Drawing.Font("Segoe UI", 28, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Elektroninės cigaretės, vienkartiniai garintuvai,", $fSub, $grey, 304, 250)
$g.DrawString("e-skysčiai ir nikotino pagalvėlės", $fSub, $grey, 304, 292)

# Pied : Telegram + site
$fSite = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Užsakymas per Telegram  •  vapelt.dealsnows.com", $fSite, $grey, 64, 520)

# Pastille rouge à droite (avantage produit)
$red2 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 38, 38))
$g.FillEllipse($red2, 880, 60, 220, 220)
$fBig = New-Object System.Drawing.Font("Segoe UI", 40, [System.Drawing.FontStyle]::Bold)
$whiteTxt = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$g.DrawString("2180+", $fBig, $whiteTxt, 930, 120)
$fSmall = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Produktų", $fSmall, $whiteTxt, 945, 190)

$out = "C:\Users\Mitson informatique\Desktop\clones\vapelt-mobile\public\images\og-default.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "Écrit: $out ($([math]::Round((Get-Item $out).Length/1kb)) Ko)"