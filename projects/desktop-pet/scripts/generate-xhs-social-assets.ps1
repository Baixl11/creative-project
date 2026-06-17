param(
  [string] $OutDir = "docs/social/xhs-desktop-pet"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$outputDirectory = Join-Path $projectRoot $OutDir
[System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null

$W = 1080
$H = 1440

function T([string] $Base64) {
  return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($Base64))
}

$copy = @{
  WorkTag = T "QUkg57yW56iL5L2c5ZOB"
  Cover1 = T "5oiR5YGa5LqG5LiA5Liq"
  Cover2 = T "5Lya6La05Zyo5qGM6Z2i5LiK55qE"
  Cover3 = T "55S15a2Q5bCP5a6g54mp"
  CoverBody = T "5LiN5piv5aOB57q477yM5piv5LiA5Liq55yf55qE5qGM6Z2i5bCP5bqU55So44CC6YCP5piO5oKs5rWu44CB5Y+v5ouW5ou944CB5Lya5LqS5Yqo77yM6L+Y6IO95o2i6KeS6Imy44CC"
  Stack = T "RWxlY3Ryb24gKyBSZWFjdCArIFRocmVlLmpz"
  Runnable = T "V2luZG93cyDlj6/ov5DooYwgwrcg5L2c5ZOB6ZuG6aG555uu"
  FeatureTitle = T "5a6D55yf55qE5L2P5Zyo5qGM6Z2i5LiK"
  FeatureBody = T "5qC45b+D5LiN5piv4oCc5Y+v54ix5Zu+54mH4oCd77yM6ICM5piv5LiA5Liq6YCP5piO5qGM6Z2i56qX5Y+j6YeM55qE5LqS5Yqo5byP5bCP5a6g54mp44CC"
  Transparent = T "6YCP5piO56qX5Y+j"
  TransparentBody = T "5peg6L655qGG44CB572u6aG25pi+56S677yM6IOM5pmv5L+d5oyB6YCP5piO44CC"
  Mouse = T "6byg5qCH5LqS5Yqo"
  MouseBody = T "5oKs5YGc44CB54K55Ye744CB5ouW5ou944CB5oqa5pG45byP56e75Yqo6YO95pyJ5Y+N6aaI44CC"
  Tray = T "5omY55uY5bi46am7"
  TrayBody = T "6ZqQ6JeP44CB6YeN572u5L2N572u44CB6K6+572u44CB6YCA5Ye66YO95Zyo5omY55uY6I+c5Y2V6YeM44CC"
  LocalSave = T "5pys5Zyw5L+d5a2Y"
  LocalSaveBody = T "6KeS6Imy44CB6aKc6Imy44CB5aSn5bCP44CB57q/5p2h57KX57uG6YO95Lya5oyB5LmF5YyW44CC"
  Lineup1 = T "5LiA5qyh5YGa5LqGIDUg5Liq"
  Lineup2 = T "57q/56i/5bCP5a6g54mp"
  LineupBody = T "5q+P5Y+q6YO95pyJ6Ieq5bex55qE5Yqo5L2c5b6q546v77ya5Y+R5ZGG44CB6Lez5LiA6Lez44CB5Ly45oeS6IWw44CB5Y+r5LiA5aOw44CC"
  Dog = T "5bCP54uX"
  Cat = T "5bCP54yr"
  Rabbit = T "5bCP5YWU"
  Alpaca = T "576K6am8"
  Cow = T "5bCP54mb"
  LinePet = T "57q/56i/6KeS6Imy"
  Design = T "6K6+6K6h5pa55ZCR"
  DesignBody = T "55So5omL57uY57KX57q/5p2hICsg6L27IDNEIOWKqOaAgeaEn++8jOiuqeWug+abtOWDj+i2tOWcqOahjOmdoumHjOeahOWwj+eOqeWBtuOAgg=="
  Process1 = T "5LuO5oOz5rOV5Yiw"
  Process2 = T "5Y+v6L+Q6KGMIGV4ZQ=="
  ProcessBody = T "5oqK5LiA5Liq4oCc5qGM6Z2i6Zmq5Ly05oSf4oCd55qE5oOz5rOV77yM5ouG5oiQ5Lqn5ZOB5a6a5LmJ44CB5qGM6Z2i56qX5Y+j44CB6KeS6Imy57O757uf5ZKM5omT5YyF5Lqk5LuY44CC"
  Product = T "5Lqn5ZOB5a6a5LmJ"
  ProductBody = T "5YWI5YaZIFBSRO+8jOWumiBNVlAg6IyD5Zu077ya6YCP5piO5qGM5a6g44CB5Z+656GA5LqS5Yqo44CBRElZIOiuvue9ruOAgg=="
  Window = T "5qGM6Z2i56qX5Y+j"
  WindowBody = T "RWxlY3Ryb24g6YCP5piO572u6aG277yM5bm25aSE55CG6byg5qCH56m/6YCP5ZKM5ouW5ou944CC"
  CharacterSystem = T "6KeS6Imy57O757uf"
  CharacterBody = T "5oqK5a6g54mp5ouG5oiQ5Y+v5rOo5YaM55qEIFBldCBEZWZpbml0aW9u77yM5ZCO57ut6IO957un57ut5Yqg6KeS6Imy44CC"
  Package = T "5omT5YyF5Lqk5LuY"
  PackageBody = T "55Sf5oiQIFdpbmRvd3MgdW5wYWNrZWQg55uu5b2V5ZKMIGV4ZeOAgg=="
  Next = T "5LiL5LiA5q2l"
  NextBody = T "57un57ut5omT56Oo55yf5a6e5qGM6Z2i6YeM55qE5Yqo5L2c44CB5omL5oSf5ZKM5Y+R5biD5L2T6aqM44CC"
  DesktopPet = T "5qGM6Z2i546p5YG2IERlc2t0b3AgUGV0"
}

$colors = @{
  Ink = [System.Drawing.Color]::FromArgb(17, 24, 39)
  Muted = [System.Drawing.Color]::FromArgb(91, 102, 122)
  Paper = [System.Drawing.Color]::FromArgb(251, 250, 247)
  Card = [System.Drawing.Color]::White
  Grid = [System.Drawing.Color]::FromArgb(232, 227, 216)
  Line = [System.Drawing.Color]::FromArgb(217, 212, 200)
  Sky = [System.Drawing.Color]::FromArgb(199, 233, 255)
  Pink = [System.Drawing.Color]::FromArgb(255, 210, 223)
  Green = [System.Drawing.Color]::FromArgb(216, 244, 216)
  Yellow = [System.Drawing.Color]::FromArgb(255, 231, 163)
  Blue = [System.Drawing.Color]::FromArgb(219, 234, 254)
  Coral = [System.Drawing.Color]::FromArgb(255, 123, 141)
  Teal = [System.Drawing.Color]::FromArgb(26, 160, 144)
}

function New-Font([float] $Size, [System.Drawing.FontStyle] $Style = [System.Drawing.FontStyle]::Regular) {
  return New-Object System.Drawing.Font("Microsoft YaHei", $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
}

function New-Poster {
  $bitmap = New-Object System.Drawing.Bitmap($W, $H)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $graphics.Clear($colors.Paper)
  $gridPen = New-Object System.Drawing.Pen($colors.Grid, 1)
  for ($x = 0; $x -le $W; $x += 36) {
    $graphics.DrawLine($gridPen, $x, 0, $x, $H)
  }
  for ($y = 0; $y -le $H; $y += 36) {
    $graphics.DrawLine($gridPen, 0, $y, $W, $y)
  }
  $gridPen.Dispose()
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Save-Poster($Poster, [string] $Name) {
  $path = Join-Path $outputDirectory $Name
  $Poster.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $Poster.Graphics.Dispose()
  $Poster.Bitmap.Dispose()
  return $path
}

function RoundRect([float] $X, [float] $Y, [float] $Width, [float] $Height, [float] $Radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-Round($Graphics, [float] $X, [float] $Y, [float] $Width, [float] $Height, [float] $Radius, [System.Drawing.Color] $Fill, [System.Drawing.Color] $Stroke = [System.Drawing.Color]::Transparent, [float] $StrokeWidth = 2) {
  $path = RoundRect $X $Y $Width $Height $Radius
  $brush = New-Object System.Drawing.SolidBrush($Fill)
  $Graphics.FillPath($brush, $path)
  $brush.Dispose()
  if ($Stroke.A -gt 0) {
    $pen = New-Object System.Drawing.Pen($Stroke, $StrokeWidth)
    $Graphics.DrawPath($pen, $path)
    $pen.Dispose()
  }
  $path.Dispose()
}

function Draw-Text($Graphics, [string] $Value, [float] $X, [float] $Y, [float] $Size, [System.Drawing.FontStyle] $Style, [System.Drawing.Color] $Color, [float] $MaxWidth = 2000) {
  $font = New-Font $Size $Style
  $brush = New-Object System.Drawing.SolidBrush($Color)
  $Graphics.DrawString($Value, $font, $brush, [System.Drawing.RectangleF]::new($X, $Y, $MaxWidth, $Size * 1.55))
  $brush.Dispose()
  $font.Dispose()
}

function Draw-Wrapped($Graphics, [string] $Value, [float] $X, [float] $Y, [float] $MaxWidth, [float] $Size, [System.Drawing.FontStyle] $Style, [System.Drawing.Color] $Color) {
  $font = New-Font $Size $Style
  $brush = New-Object System.Drawing.SolidBrush($Color)
  $line = ""
  $lines = New-Object System.Collections.Generic.List[string]
  foreach ($ch in $Value.ToCharArray()) {
    $next = $line + $ch
    if ($Graphics.MeasureString($next, $font).Width -gt $MaxWidth -and $line.Length -gt 0) {
      $lines.Add($line)
      $line = [string]$ch
    } else {
      $line = $next
    }
  }
  if ($line.Length -gt 0) {
    $lines.Add($line)
  }
  $lineHeight = $Size * 1.45
  for ($i = 0; $i -lt $lines.Count; $i += 1) {
    $Graphics.DrawString($lines[$i], $font, $brush, $X, $Y + ($i * $lineHeight))
  }
  $brush.Dispose()
  $font.Dispose()
  return $lines.Count * $lineHeight
}

function Draw-Chip($Graphics, [string] $Value, [float] $X, [float] $Y, [System.Drawing.Color] $Fill) {
  $font = New-Font 26 ([System.Drawing.FontStyle]::Bold)
  $width = $Graphics.MeasureString($Value, $font).Width + 34
  Fill-Round $Graphics $X $Y $width 48 24 $Fill $colors.Ink 2
  $font.Dispose()
  Draw-Text $Graphics $Value ($X + 17) ($Y + 8) 24 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  return $width
}

function New-Pen([float] $Width) {
  $pen = New-Object System.Drawing.Pen($colors.Ink, $Width)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  return $pen
}

function P([float] $X, [float] $Y) {
  return [System.Drawing.PointF]::new($X, $Y)
}

function Draw-Stroke($Graphics, [object[]] $Points, [float] $Cx, [float] $Cy, [float] $Scale, [float] $Width = 8) {
  $pen = New-Pen $Width
  $converted = New-Object System.Collections.Generic.List[System.Drawing.PointF]
  foreach ($point in $Points) {
    $converted.Add((P ($Cx + ([float]$point[0] * $Scale)) ($Cy + ([float]$point[1] * $Scale))))
  }
  if ($converted.Count -eq 2) {
    $Graphics.DrawLine($pen, $converted[0], $converted[1])
  } else {
    $Graphics.DrawCurve($pen, $converted.ToArray(), 0.45)
  }
  $pen.Dispose()
}

function Draw-Dot($Graphics, [float] $Cx, [float] $Cy, [float] $Scale, [float] $X, [float] $Y, [float] $Radius, [System.Drawing.Color] $Fill = $colors.Ink) {
  $brush = New-Object System.Drawing.SolidBrush($Fill)
  $Graphics.FillEllipse($brush, $Cx + (($X - $Radius) * $Scale), $Cy + (($Y - $Radius) * $Scale), $Radius * 2 * $Scale, $Radius * 2 * $Scale)
  $brush.Dispose()
}

function Draw-Blob($Graphics, [float] $Cx, [float] $Cy, [float] $Scale, [float] $X, [float] $Y, [float] $Rx, [float] $Ry, [System.Drawing.Color] $Fill) {
  $brush = New-Object System.Drawing.SolidBrush($Fill)
  $Graphics.FillEllipse($brush, $Cx + (($X - $Rx) * $Scale), $Cy + (($Y - $Ry) * $Scale), $Rx * 2 * $Scale, $Ry * 2 * $Scale)
  $brush.Dispose()
}

function Draw-Pet($Graphics, [string] $Kind, [float] $Cx, [float] $Cy, [float] $Scale, [float] $Width = 8) {
  if ($Kind -eq "dog") {
    Draw-Stroke $Graphics @(@(-50,-76),@(-24,-104),@(28,-102),@(54,-72),@(90,-62),@(94,-18),@(68,8),@(88,34),@(70,76),@(26,82),@(-12,104),@(-58,82),@(-64,44),@(-96,26),@(-92,-28),@(-62,-40)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(-62,-54),@(-96,-56),@(-104,-12),@(-74,4)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(58,-54),@(92,-58),@(104,-16),@(76,4)) $Cx $Cy $Scale $Width
    Draw-Dot $Graphics $Cx $Cy $Scale -24 -20 5
    Draw-Dot $Graphics $Cx $Cy $Scale 24 -20 5
    Draw-Dot $Graphics $Cx $Cy $Scale 0 -2 7
    Draw-Stroke $Graphics @(@(0,4),@(-12,22),@(-30,10)) $Cx $Cy $Scale ($Width * 0.58)
    Draw-Stroke $Graphics @(@(0,4),@(12,22),@(30,10)) $Cx $Cy $Scale ($Width * 0.58)
    $tongue = New-Object System.Drawing.Drawing2D.GraphicsPath
    $tongue.StartFigure()
    $tongue.AddBezier(($Cx - 10 * $Scale), ($Cy + 22 * $Scale), ($Cx - 4 * $Scale), ($Cy + 44 * $Scale), ($Cx + 16 * $Scale), ($Cy + 42 * $Scale), ($Cx + 16 * $Scale), ($Cy + 22 * $Scale))
    $tongue.AddBezier(($Cx + 16 * $Scale), ($Cy + 22 * $Scale), ($Cx + 8 * $Scale), ($Cy + 28 * $Scale), $Cx, ($Cy + 30 * $Scale), ($Cx - 10 * $Scale), ($Cy + 22 * $Scale))
    $tongue.CloseFigure()
    $brush = New-Object System.Drawing.SolidBrush($colors.Coral)
    $Graphics.FillPath($brush, $tongue)
    $brush.Dispose()
    $tongue.Dispose()
    Draw-Stroke $Graphics @(@(-62,48),@(-44,76),@(-12,70),@(0,52),@(16,74),@(48,76),@(64,46)) $Cx $Cy $Scale $Width
  } elseif ($Kind -eq "cat") {
    Draw-Stroke $Graphics @(@(-82,-6),@(-78,-62),@(-18,-75),@(35,-54),@(78,-38),@(78,22),@(36,45),@(-2,66),@(-77,55),@(-92,20)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(-78,-42),@(-62,-84),@(-34,-54)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(-26,-58),@(-2,-96),@(18,-48)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(55,-26),@(86,-55),@(104,-30),@(82,4),@(72,20),@(57,24),@(42,16)) $Cx $Cy $Scale $Width
    Draw-Dot $Graphics $Cx $Cy $Scale -42 -26 5
    Draw-Dot $Graphics $Cx $Cy $Scale 1 -23 5
    Draw-Stroke $Graphics @(@(-23,-7),@(-16,2),@(-5,-8)) $Cx $Cy $Scale ($Width * 0.56)
    Draw-Stroke $Graphics @(@(-62,-5),@(-92,-12)) $Cx $Cy $Scale ($Width * 0.56)
    Draw-Stroke $Graphics @(@(-62,8),@(-94,10)) $Cx $Cy $Scale ($Width * 0.56)
    Draw-Stroke $Graphics @(@(18,-3),@(50,-11)) $Cx $Cy $Scale ($Width * 0.56)
    Draw-Stroke $Graphics @(@(18,10),@(52,13)) $Cx $Cy $Scale ($Width * 0.56)
    Draw-Stroke $Graphics @(@(-42,70),@(-8,48),@(44,52),@(70,70),@(38,96),@(-13,96),@(-42,70)) $Cx $Cy $Scale $Width
  } elseif ($Kind -eq "rabbit") {
    Draw-Stroke $Graphics @(@(-50,8),@(-62,-38),@(-42,-74),@(0,-74),@(44,-74),@(64,-36),@(54,8),@(72,24),@(70,72),@(38,90),@(10,105),@(-34,98),@(-54,70),@(-72,44),@(-68,20),@(-50,8)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(-28,-68),@(-52,-112),@(-18,-116),@(-8,-74)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(18,-70),@(32,-116),@(62,-108),@(40,-62)) $Cx $Cy $Scale $Width
    Draw-Dot $Graphics $Cx $Cy $Scale -19 -18 5
    Draw-Dot $Graphics $Cx $Cy $Scale 20 -18 5
    Draw-Stroke $Graphics @(@(-5,0),@(0,6),@(7,0)) $Cx $Cy $Scale ($Width * 0.56)
    Draw-Stroke $Graphics @(@(-18,22),@(0,34),@(19,22)) $Cx $Cy $Scale ($Width * 0.56)
    Draw-Stroke $Graphics @(@(72,82),@(76,60),@(100,60),@(104,82)) $Cx $Cy $Scale ($Width * 0.56)
  } elseif ($Kind -eq "alpaca") {
    Draw-Stroke $Graphics @(@(-28,-78),@(-46,-94),@(-30,-112),@(-12,-88)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(22,-82),@(40,-108),@(58,-90),@(34,-72)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(-38,-70),@(-48,-32),@(-38,18),@(-12,28),@(18,40),@(42,24),@(42,-10),@(42,-44),@(18,-74),@(-14,-80)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(-58,28),@(-86,45),@(-82,86),@(-42,94),@(-6,104),@(44,100),@(70,74),@(94,48),@(68,18),@(30,25)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(-44,-86),@(-28,-106),@(-8,-88),@(8,-110),@(24,-84),@(42,-90),@(50,-68)) $Cx $Cy $Scale ($Width * 0.6)
    Draw-Dot $Graphics $Cx $Cy $Scale -14 -36 5
    Draw-Dot $Graphics $Cx $Cy $Scale 18 -34 5
    Draw-Stroke $Graphics @(@(-2,-18),@(6,-10),@(16,-18)) $Cx $Cy $Scale ($Width * 0.56)
    Draw-Stroke $Graphics @(@(-50,92),@(-54,112)) $Cx $Cy $Scale ($Width * 0.56)
    Draw-Stroke $Graphics @(@(-10,100),@(-12,116)) $Cx $Cy $Scale ($Width * 0.56)
    Draw-Stroke $Graphics @(@(34,96),@(34,114)) $Cx $Cy $Scale ($Width * 0.56)
  } else {
    Draw-Stroke $Graphics @(@(-76,-28),@(-72,-72),@(-30,-88),@(12,-78),@(58,-68),@(82,-30),@(72,22),@(64,66),@(24,90),@(-22,82),@(-60,76),@(-86,38),@(-76,-28)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(-48,-70),@(-62,-98)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(42,-68),@(62,-96)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(-72,-42),@(-104,-62),@(-112,-20),@(-78,-12)) $Cx $Cy $Scale $Width
    Draw-Stroke $Graphics @(@(66,-42),@(104,-64),@(114,-20),@(78,-10)) $Cx $Cy $Scale $Width
    Draw-Blob $Graphics $Cx $Cy $Scale 6 -48 16 19 ([System.Drawing.Color]::FromArgb(209, 213, 219))
    Draw-Blob $Graphics $Cx $Cy $Scale -44 2 18 14 ([System.Drawing.Color]::FromArgb(229, 231, 235))
    Draw-Stroke $Graphics @(@(-38,12),@(-26,-8),@(30,-10),@(42,12),@(52,34),@(28,50),@(0,50),@(-28,50),@(-50,34),@(-38,12)) $Cx $Cy $Scale $Width
    Draw-Dot $Graphics $Cx $Cy $Scale -24 -24 5
    Draw-Dot $Graphics $Cx $Cy $Scale 28 -24 5
    Draw-Dot $Graphics $Cx $Cy $Scale -14 22 4
    Draw-Dot $Graphics $Cx $Cy $Scale 18 22 4
  }
}

function Draw-Device($Graphics, [float] $X, [float] $Y, [float] $Width, [float] $Height, [string] $Title) {
  Fill-Round $Graphics $X $Y $Width $Height 36 ([System.Drawing.Color]::FromArgb(238, 243, 248)) $colors.Ink 3
  Fill-Round $Graphics ($X + 20) ($Y + 22) ($Width - 40) ($Height - 44) 24 ([System.Drawing.Color]::FromArgb(248, 250, 252)) ([System.Drawing.Color]::FromArgb(203, 213, 225)) 2
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(203, 213, 225))
  $Graphics.FillEllipse($brush, $X + 42, $Y + 42, 14, 14)
  $Graphics.FillEllipse($brush, $X + 66, $Y + 42, 14, 14)
  $Graphics.FillEllipse($brush, $X + 90, $Y + 42, 14, 14)
  $brush.Dispose()
  Draw-Text $Graphics $Title ($X + 126) ($Y + 34) 22 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::FromArgb(51, 65, 85))
}

function Draw-Footer($Graphics, [string] $Page) {
  Draw-Text $Graphics ("DESKTOP PET  /  " + $Page) 72 1354 22 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::FromArgb(115, 115, 115))
}

function Draw-FeatureItem($Graphics, [float] $X, [float] $Y, [string] $Title, [string] $Body, [System.Drawing.Color] $Fill, [string] $Icon) {
  Fill-Round $Graphics $X $Y 430 236 26 $colors.Card $colors.Line 2
  Fill-Round $Graphics ($X + 28) ($Y + 28) 72 72 22 $Fill $colors.Ink 2
  Draw-Text $Graphics $Icon ($X + 50) ($Y + 48) 26 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Text $Graphics $Title ($X + 124) ($Y + 34) 34 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Wrapped $Graphics $Body ($X + 124) ($Y + 88) 260 24 ([System.Drawing.FontStyle]::Regular) $colors.Muted | Out-Null
}

function Draw-PetCard($Graphics, [string] $Kind, [string] $Name, [float] $X, [float] $Y, [System.Drawing.Color] $Fill) {
  Fill-Round $Graphics $X $Y 294 308 28 $colors.Card $colors.Ink 3
  Fill-Round $Graphics ($X + 24) ($Y + 24) 246 198 22 $Fill ([System.Drawing.Color]::Transparent)
  Draw-Pet $Graphics $Kind ($X + 147) ($Y + 128) $(if ($Kind -eq "alpaca") { 0.86 } else { 0.92 }) 8
  Draw-Text $Graphics $Name ($X + 38) ($Y + 242) 34 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Text $Graphics $copy.LinePet ($X + 40) ($Y + 282) 22 ([System.Drawing.FontStyle]::Bold) $colors.Muted
}

function Draw-FlowItem($Graphics, [float] $Y, [int] $Index, [string] $Title, [string] $Body, [System.Drawing.Color] $Fill) {
  $x = 116
  Fill-Round $Graphics $x $Y 848 154 26 $colors.Card $colors.Line 2
  Fill-Round $Graphics ($x + 28) ($Y + 35) 84 84 24 $Fill $colors.Ink 2
  Draw-Text $Graphics ("{0:D2}" -f $Index) ($x + 47) ($Y + 56) 30 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Text $Graphics $Title ($x + 140) ($Y + 34) 34 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Wrapped $Graphics $Body ($x + 140) ($Y + 84) 650 25 ([System.Drawing.FontStyle]::Regular) $colors.Muted | Out-Null
}

function Make-Cover {
  $poster = New-Poster
  $g = $poster.Graphics
  Draw-Chip $g $copy.WorkTag 72 74 $colors.Yellow | Out-Null
  Draw-Text $g $copy.Cover1 72 156 64 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Text $g $copy.Cover2 72 242 64 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Text $g $copy.Cover3 72 328 86 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Wrapped $g $copy.CoverBody 74 450 820 34 ([System.Drawing.FontStyle]::Regular) $colors.Muted | Out-Null
  Fill-Round $g 96 592 888 562 44 $colors.Card $colors.Ink 4
  $skyBrush = New-Object System.Drawing.SolidBrush($colors.Sky)
  $g.FillRectangle($skyBrush, 132, 630, 816, 440)
  $skyBrush.Dispose()
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  for ($i = 0; $i -lt 8; $i += 1) {
    $x = 152 + ($i * 98)
    $g.FillRectangle($white, $x, 650, 62, 42)
    $g.FillRectangle($white, $x + 28, 708, 48, 42)
    $g.FillRectangle($white, $x - 8, 786, 72, 42)
    $g.FillRectangle($white, $x + 34, 866, 58, 42)
  }
  $white.Dispose()
  Fill-Round $g 162 720 760 298 28 ([System.Drawing.Color]::FromArgb(180, 255, 255, 255)) ([System.Drawing.Color]::Transparent)
  Draw-Pet $g "dog" 540 852 2.18 15
  Draw-Chip $g "Electron" 120 1200 $colors.Blue | Out-Null
  Draw-Chip $g "React" 316 1200 $colors.Pink | Out-Null
  Draw-Chip $g "Three.js" 474 1200 $colors.Green | Out-Null
  Draw-Text $g $copy.Runnable 120 1268 30 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Footer $g "01"
  Save-Poster $poster "01-cover.png"
}

function Make-Features {
  $poster = New-Poster
  $g = $poster.Graphics
  Draw-Text $g $copy.FeatureTitle 72 84 60 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Wrapped $g $copy.FeatureBody 74 176 820 32 ([System.Drawing.FontStyle]::Regular) $colors.Muted | Out-Null
  Draw-Device $g 150 300 780 430 "Transparent Window"
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 238, 255))
  $g.FillRectangle($brush, 194, 374, 692, 292)
  $brush.Dispose()
  Fill-Round $g 230 420 220 138 22 ([System.Drawing.Color]::FromArgb(164, 255, 255, 255)) ([System.Drawing.Color]::Transparent)
  Fill-Round $g 622 474 200 96 20 ([System.Drawing.Color]::FromArgb(164, 255, 255, 255)) ([System.Drawing.Color]::Transparent)
  Draw-Pet $g "dog" 540 555 1.12 9
  Draw-Text $g "Transparent desktop pet" 318 682 30 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-FeatureItem $g 72 806 $copy.Transparent $copy.TransparentBody $colors.Sky "01"
  Draw-FeatureItem $g 578 806 $copy.Mouse $copy.MouseBody $colors.Pink "02"
  Draw-FeatureItem $g 72 1078 $copy.Tray $copy.TrayBody $colors.Green "03"
  Draw-FeatureItem $g 578 1078 $copy.LocalSave $copy.LocalSaveBody $colors.Yellow "04"
  Draw-Footer $g "02"
  Save-Poster $poster "02-features.png"
}

function Make-Lineup {
  $poster = New-Poster
  $g = $poster.Graphics
  Draw-Text $g $copy.Lineup1 72 84 60 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Text $g $copy.Lineup2 72 160 72 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Wrapped $g $copy.LineupBody 74 270 820 32 ([System.Drawing.FontStyle]::Regular) $colors.Muted | Out-Null
  Draw-PetCard $g "dog" $copy.Dog 72 398 $colors.Blue
  Draw-PetCard $g "cat" $copy.Cat 393 398 $colors.Pink
  Draw-PetCard $g "rabbit" $copy.Rabbit 714 398 $colors.Green
  Draw-PetCard $g "alpaca" $copy.Alpaca 232 744 ([System.Drawing.Color]::FromArgb(238, 231, 255))
  Draw-PetCard $g "cow" $copy.Cow 553 744 ([System.Drawing.Color]::FromArgb(244, 238, 226))
  Fill-Round $g 120 1130 840 152 32 $colors.Ink ([System.Drawing.Color]::Transparent)
  Draw-Text $g $copy.Design 170 1162 26 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::FromArgb(167, 243, 208))
  Draw-Wrapped $g $copy.DesignBody 170 1204 700 28 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::White) | Out-Null
  Draw-Footer $g "03"
  Save-Poster $poster "03-pet-lineup.png"
}

function Make-Process {
  $poster = New-Poster
  $g = $poster.Graphics
  Draw-Text $g $copy.Process1 72 84 60 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Text $g $copy.Process2 72 160 76 ([System.Drawing.FontStyle]::Bold) $colors.Ink
  Draw-Wrapped $g $copy.ProcessBody 74 274 840 32 ([System.Drawing.FontStyle]::Regular) $colors.Muted | Out-Null
  Draw-FlowItem $g 420 1 $copy.Product $copy.ProductBody $colors.Yellow
  Draw-FlowItem $g 604 2 $copy.Window $copy.WindowBody $colors.Sky
  Draw-FlowItem $g 788 3 $copy.CharacterSystem $copy.CharacterBody $colors.Pink
  Draw-FlowItem $g 972 4 $copy.Package $copy.PackageBody $colors.Green
  Fill-Round $g 116 1196 848 86 24 ([System.Drawing.Color]::FromArgb(255, 247, 237)) ([System.Drawing.Color]::FromArgb(254, 215, 170)) 2
  Draw-Text $g $copy.Next 154 1218 25 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::FromArgb(154, 52, 18))
  Draw-Text $g $copy.NextBody 268 1218 25 ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Color]::FromArgb(154, 52, 18))
  Draw-Footer $g "04"
  Save-Poster $poster "04-build-process.png"
}

$files = @(
  Make-Cover
  Make-Features
  Make-Lineup
  Make-Process
)

$files | ForEach-Object { Write-Output $_ }
