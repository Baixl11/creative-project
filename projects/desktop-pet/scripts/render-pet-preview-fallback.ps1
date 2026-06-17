param(
  [Parameter(Mandatory = $true)]
  [string] $OutPath
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 1100
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$graphics.Clear([System.Drawing.Color]::FromArgb(247, 248, 245))

$dark = [System.Drawing.Color]::FromArgb(17, 24, 39)
$muted = [System.Drawing.Color]::FromArgb(71, 85, 105)
$linePen = New-Object System.Drawing.Pen($dark, 6)
$linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$linePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$thinPen = New-Object System.Drawing.Pen($dark, 4)
$thinPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$thinPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$thinPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(224, 231, 221), 1)
$cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215, 221, 210), 1)
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$titleBrush = New-Object System.Drawing.SolidBrush($dark)
$mutedBrush = New-Object System.Drawing.SolidBrush($muted)
$accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(244, 114, 139))
$softBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(229, 231, 235))
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 30, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$fontName = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$fontBody = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
$fontAction = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)

for ($x = 0; $x -le $width; $x += 20) {
  $graphics.DrawLine($gridPen, $x, 0, $x, $height)
}
for ($y = 0; $y -le $height; $y += 20) {
  $graphics.DrawLine($gridPen, 0, $y, $width, $y)
}

function Point([float] $x, [float] $y) {
  return New-Object System.Drawing.PointF($x, $y)
}

function Draw-Curve($graphics, $pen, [float] $cx, [float] $cy, [float] $scale, [object[]] $points) {
  $converted = New-Object System.Collections.Generic.List[System.Drawing.PointF]
  foreach ($point in $points) {
    $converted.Add((Point ($cx + ($point[0] * $scale)) ($cy + ($point[1] * $scale))))
  }
  if ($converted.Count -eq 2) {
    $graphics.DrawLine($pen, $converted[0], $converted[1])
  } else {
    $graphics.DrawCurve($pen, $converted.ToArray(), 0.45)
  }
}

function Draw-Dot($graphics, $brush, [float] $cx, [float] $cy, [float] $scale, [float] $x, [float] $y, [float] $radius) {
  $graphics.FillEllipse($brush, $cx + (($x - $radius) * $scale), $cy + (($y - $radius) * $scale), $radius * 2 * $scale, $radius * 2 * $scale)
}

function Draw-Pet($graphics, [string] $kind, [float] $cx, [float] $cy, [float] $scale) {
  if ($kind -eq "cat") {
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-82, -6), @(-78, -62), @(-18, -75), @(35, -54), @(78, -38), @(78, 22), @(36, 45), @(-2, 66), @(-77, 55), @(-92, 20))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-78, -42), @(-62, -84), @(-34, -54))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-26, -58), @(-2, -96), @(18, -48))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(55, -26), @(86, -55), @(104, -30), @(82, 4), @(72, 20), @(57, 24), @(42, 16))
    Draw-Dot $graphics $titleBrush $cx $cy $scale -42 -26 5
    Draw-Dot $graphics $titleBrush $cx $cy $scale 1 -23 5
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(-23, -7), @(-16, 2), @(-5, -8))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(-62, -5), @(-92, -12))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(-62, 8), @(-94, 10))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(18, -3), @(50, -11))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(18, 10), @(52, 13))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-42, 70), @(-8, 48), @(44, 52), @(70, 70), @(38, 96), @(-13, 96), @(-42, 70))
  } elseif ($kind -eq "rabbit") {
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-50, 8), @(-62, -38), @(-42, -74), @(0, -74), @(44, -74), @(64, -36), @(54, 8), @(72, 24), @(70, 72), @(38, 90), @(10, 105), @(-34, 98), @(-54, 70), @(-72, 44), @(-68, 20), @(-50, 8))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-28, -68), @(-52, -112), @(-18, -116), @(-8, -74))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(18, -70), @(32, -116), @(62, -108), @(40, -62))
    Draw-Dot $graphics $titleBrush $cx $cy $scale -19 -18 5
    Draw-Dot $graphics $titleBrush $cx $cy $scale 20 -18 5
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(-5, 0), @(0, 6), @(7, 0))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(-18, 22), @(0, 34), @(19, 22))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(72, 82), @(76, 60), @(100, 60), @(104, 82))
  } elseif ($kind -eq "alpaca") {
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-28, -78), @(-46, -94), @(-30, -112), @(-12, -88))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(22, -82), @(40, -108), @(58, -90), @(34, -72))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-38, -70), @(-48, -32), @(-38, 18), @(-12, 28), @(18, 40), @(42, 24), @(42, -10), @(42, -44), @(18, -74), @(-14, -80))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-58, 28), @(-86, 45), @(-82, 86), @(-42, 94), @(-6, 104), @(44, 100), @(70, 74), @(94, 48), @(68, 18), @(30, 25))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(-44, -86), @(-28, -106), @(-8, -88), @(8, -110), @(24, -84), @(42, -90), @(50, -68))
    Draw-Dot $graphics $titleBrush $cx $cy $scale -14 -36 5
    Draw-Dot $graphics $titleBrush $cx $cy $scale 18 -34 5
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(-2, -18), @(6, -10), @(16, -18))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(-50, 92), @(-54, 112))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(-10, 100), @(-12, 116))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(34, 96), @(34, 114))
    Draw-Curve $graphics $thinPen $cx $cy $scale @(@(66, 78), @(76, 100))
  } else {
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-76, -28), @(-72, -72), @(-30, -88), @(12, -78), @(58, -68), @(82, -30), @(72, 22), @(64, 66), @(24, 90), @(-22, 82), @(-60, 76), @(-86, 38), @(-76, -28))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-48, -70), @(-62, -98))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(42, -68), @(62, -96))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-72, -42), @(-104, -62), @(-112, -20), @(-78, -12))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(66, -42), @(104, -64), @(114, -20), @(78, -10))
    Draw-Curve $graphics $linePen $cx $cy $scale @(@(-38, 12), @(-26, -8), @(30, -10), @(42, 12), @(52, 34), @(28, 50), @(0, 50), @(-28, 50), @(-50, 34), @(-38, 12))
    Draw-Dot $graphics $titleBrush $cx $cy $scale -24 -24 5
    Draw-Dot $graphics $titleBrush $cx $cy $scale 28 -24 5
    Draw-Dot $graphics $titleBrush $cx $cy $scale -14 22 4
    Draw-Dot $graphics $titleBrush $cx $cy $scale 18 22 4
    $graphics.FillEllipse($softBrush, $cx - (10 * $scale), $cy - (68 * $scale), 32 * $scale, 38 * $scale)
    $graphics.FillEllipse($softBrush, $cx - (62 * $scale), $cy - (10 * $scale), 36 * $scale, 28 * $scale)
  }
}

$graphics.DrawString("Desktop Pet Visual Preview", $fontSub, $mutedBrush, 70, 42)
$graphics.DrawString("Line-style Pet Redesign", $fontTitle, $titleBrush, 70, 66)
$graphics.DrawString("Fallback renderer used because browser GPU/headless screenshot was unavailable.", $fontBody, $mutedBrush, 72, 114)

$lineup = @(
  @{ Name = "Line Cat"; Kind = "cat"; X = 95; Y = 170 },
  @{ Name = "Line Alpaca"; Kind = "alpaca"; X = 360; Y = 170 },
  @{ Name = "Line Rabbit"; Kind = "rabbit"; X = 625; Y = 170 },
  @{ Name = "Line Cow"; Kind = "cow"; X = 890; Y = 170 }
)

foreach ($item in $lineup) {
  $graphics.FillRectangle($whiteBrush, $item.X, $item.Y, 215, 215)
  $graphics.DrawRectangle($cardPen, $item.X, $item.Y, 215, 215)
  Draw-Pet $graphics $item.Kind ($item.X + 107) ($item.Y + 92) 0.58
  $graphics.FillRectangle($whiteBrush, $item.X + 1, $item.Y + 174, 213, 40)
  $nameSize = $graphics.MeasureString($item.Name, $fontName)
  $graphics.DrawString($item.Name, $fontName, $titleBrush, $item.X + ((215 - $nameSize.Width) / 2), $item.Y + 184)
}

$cards = @(
  @{ Name = "Line Cat"; Kind = "cat"; Text = "Crouching cat with pointed ears, raised tail and a small fish prop."; X = 70; Y = 450 },
  @{ Name = "Line Alpaca"; Kind = "alpaca"; Text = "Long-necked alpaca with fluffy bangs and wool body."; X = 620; Y = 450 },
  @{ Name = "Line Rabbit"; Kind = "rabbit"; Text = "Round seated rabbit with tall ears and a small mushroom accent."; X = 70; Y = 745 },
  @{ Name = "Line Cow"; Kind = "cow"; Text = "Round calf with horns, wide muzzle, ears and cow spots."; X = 620; Y = 745 }
)

foreach ($card in $cards) {
  $graphics.FillRectangle($whiteBrush, $card.X, $card.Y, 500, 250)
  $graphics.DrawRectangle($cardPen, $card.X, $card.Y, 500, 250)
  Draw-Pet $graphics $card.Kind ($card.X + 120) ($card.Y + 118) 0.7
  $graphics.DrawString($card.Name, $fontName, $titleBrush, $card.X + 250, $card.Y + 58)
  $bodyRect = [System.Drawing.RectangleF]::new([float]($card.X + 250), [float]($card.Y + 92), 220, 74)
  $actionRect = [System.Drawing.RectangleF]::new([float]($card.X + 250), [float]($card.Y + 174), 220, 48)
  $graphics.DrawString($card.Text, $fontBody, $mutedBrush, $bodyRect)
  $graphics.DrawString("Actions: idle / interact / character loop", $fontAction, $mutedBrush, $actionRect)
}

$directory = [System.IO.Path]::GetDirectoryName($OutPath)
if ($directory) {
  [System.IO.Directory]::CreateDirectory($directory) | Out-Null
}
$bitmap.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()
$linePen.Dispose()
$thinPen.Dispose()
$gridPen.Dispose()
$cardPen.Dispose()
$whiteBrush.Dispose()
$titleBrush.Dispose()
$mutedBrush.Dispose()
$accentBrush.Dispose()
$softBrush.Dispose()
$fontTitle.Dispose()
$fontSub.Dispose()
$fontName.Dispose()
$fontBody.Dispose()
$fontAction.Dispose()
