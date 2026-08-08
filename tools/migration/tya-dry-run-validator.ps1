param(
  [Parameter(Mandatory=$true)][string]$V6Zip,
  [Parameter(Mandatory=$true)][string]$V71Zip,
  [string]$HrLiveXlsx = "",
  [string]$OutDir = "",
  [switch]$FailOnCritical
)

$ErrorActionPreference = "Stop"

function Resolve-FullPath([string]$PathValue) {
  if ([string]::IsNullOrWhiteSpace($PathValue)) { return "" }
  return [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $PathValue).Path)
}

function Expand-AllZips([string]$Root) {
  $expandedAny = $true
  while ($expandedAny) {
    $expandedAny = $false
    Get-ChildItem -LiteralPath $Root -Recurse -Filter *.zip | ForEach-Object {
      $zip = $_.FullName
      $dest = Join-Path $_.DirectoryName ($_.BaseName + "__unzipped")
      if (!(Test-Path -LiteralPath $dest)) {
        New-Item -ItemType Directory -Path $dest | Out-Null
        Expand-Archive -LiteralPath $zip -DestinationPath $dest -Force
        $expandedAny = $true
      }
    }
  }
}

function Find-File([string]$Root,[string]$Name) {
  $f = Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object { $_.Name -ieq $Name } | Select-Object -First 1
  if ($null -eq $f) { return $null }
  return $f.FullName
}

function Read-CsvSafe([string]$Path) {
  if (!(Test-Path -LiteralPath $Path)) { return @() }
  return @(Import-Csv -LiteralPath $Path -Encoding UTF8)
}

function Get-Col($Row,[string[]]$Names) {
  foreach ($n in $Names) {
    $prop = $Row.PSObject.Properties | Where-Object { ($_.Name.Trim().ToLower() -replace '\s+',' ') -eq ($n.Trim().ToLower() -replace '\s+',' ') } | Select-Object -First 1
    if ($null -ne $prop -and -not [string]::IsNullOrWhiteSpace([string]$prop.Value)) { return ([string]$prop.Value).Trim() }
  }
  return ""
}

function Normalize-Key([string]$Value) {
  if ([string]::IsNullOrWhiteSpace($Value)) { return "" }
  $s = $Value.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
  $chars = $s.ToCharArray() | Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne [Globalization.UnicodeCategory]::NonSpacingMark }
  return (-join $chars) -replace '[^a-z0-9]',''
}

function Count-Duplicates($Rows,[string[]]$Cols) {
  $map = @{}
  foreach ($r in $Rows) {
    $k = Normalize-Key (Get-Col $r $Cols)
    if ($k) { $map[$k] = 1 + [int]($map[$k]) }
  }
  $groups = 0; $records = 0
  foreach ($v in $map.Values) { if ($v -gt 1) { $groups++; $records += $v } }
  return @{ groups = $groups; records = $records }
}

function Count-Orphans($Rows,[string[]]$Cols,$ValidSet) {
  $checked = 0; $orphans = 0
  foreach ($r in $Rows) {
    $k = Get-Col $r $Cols
    if ($k) { $checked++; if (!$ValidSet.Contains($k)) { $orphans++ } }
  }
  return @{ checked = $checked; orphans = $orphans }
}

function Add-Issue([string]$Severity,[string]$Code,[string]$Message) {
  $script:Issues += [pscustomobject]@{ severity=$Severity; code=$Code; message=$Message }
}

function Test-Mojibake($Rows) {
  $bad = 0
  foreach ($r in $Rows) {
    $hit = $false
    foreach ($p in $r.PSObject.Properties) {
      if ([string]$p.Value -match '├|┬|ƒ|�|Ã.|Â.|â') { $hit = $true; break }
    }
    if ($hit) { $bad++ }
  }
  return $bad
}

$Repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if ([string]::IsNullOrWhiteSpace($OutDir)) { $OutDir = Join-Path $Repo "tmp\tya-dry-run-report" }
$V6ZipFull = Resolve-FullPath $V6Zip
$V71ZipFull = Resolve-FullPath $V71Zip
$HrLiveFull = if ([string]::IsNullOrWhiteSpace($HrLiveXlsx)) { "" } else { Resolve-FullPath $HrLiveXlsx }

$Work = Join-Path $env:TEMP ("cxorbia_tya_dry_run_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
$V6Dir = Join-Path $Work "v6"
$V71Dir = Join-Path $Work "v71"
New-Item -ItemType Directory -Path $V6Dir,$V71Dir,$OutDir -Force | Out-Null
Expand-Archive -LiteralPath $V6ZipFull -DestinationPath $V6Dir -Force
Expand-Archive -LiteralPath $V71ZipFull -DestinationPath $V71Dir -Force
Expand-AllZips $V6Dir
Expand-AllZips $V71Dir

$script:Issues = @()
$allFiles = @(Get-ChildItem -LiteralPath $V6Dir,$V71Dir -Recurse -File)
$blocked = @('.js','.mjs','.cjs','.html','.css','.rules','.env','.pem','.key','.p12','.exe','.bat','.cmd','.ps1','.sh')
foreach ($f in $allFiles) {
  if ($blocked -contains $f.Extension.ToLowerInvariant()) { Add-Issue critical blocked_extension "Archivo con extension no permitida en paquete de datos: $($f.Name)" }
  if (@('.csv','.txt','.md','.json','.env') -contains $f.Extension.ToLowerInvariant()) {
    $raw = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
    if ($raw -match '-----BEGIN\s+(RSA\s+)?PRIVATE KEY-----|AIza[0-9A-Za-z\-_]{20,}|\b(token|api[_-]?key|secret|password)\b\s*[:=]') { Add-Issue critical possible_secret "Posible secreto detectado. Revisar archivo antes de usar: $($f.Name)" }
  }
}

$v6VisitsFile = Find-File $V6Dir 'migration_visits_master_hr.csv'
$v6SubFile = Find-File $V6Dir 'migration_submitidos_master_hr.csv'
$v6LiqFile = Find-File $V6Dir 'migration_liquidations_base_hr.csv'
$v6ManifestFile = Find-File $V6Dir 'migration_manifest.csv'
$v71ShoppersFile = Find-File $V71Dir 'shoppers.csv'
$v71PostsFile = Find-File $V71Dir 'postulations.csv'
$v71MarksFile = Find-File $V71Dir 'questionnaire_marks.csv'
$v71CertFile = Find-File $V71Dir 'certifications.csv'
$v71NotifFile = Find-File $V71Dir 'notifications.csv'
$v71TraceFile = Find-File $V71Dir 'notification_trace.csv'
$v71UsersRolesFile = Find-File $V71Dir 'users_roles.csv'

foreach ($p in @($v6VisitsFile,$v6SubFile,$v6LiqFile,$v6ManifestFile,$v71ShoppersFile,$v71PostsFile,$v71MarksFile,$v71CertFile,$v71NotifFile,$v71TraceFile)) { if ($null -eq $p) { Add-Issue critical missing_file "Falta un archivo requerido de migracion." } }
if ($null -eq $v71UsersRolesFile) { Add-Issue warning users_roles_not_delivered "users_roles.csv no viene fisicamente; si no hay roles migrables, documentar exclusion o entregar archivo vacio." }

$visits = Read-CsvSafe $v6VisitsFile
$submitidos = Read-CsvSafe $v6SubFile
$liqs = Read-CsvSafe $v6LiqFile
$manifest = Read-CsvSafe $v6ManifestFile
$visitSet = [System.Collections.Generic.HashSet[string]]::new()
foreach ($v in $visits) { [void]$visitSet.Add((Get-Col $v @('visitKey','visit_key'))) }
$junio26hn = @($visits | Where-Object { (Normalize-Key (Get-Col $_ @('periodo','source_tab','period'))) -match 'junio26hn' -or (((Normalize-Key (Get-Col $_ @('periodo','source_tab','period'))) -match 'junio26') -and ((Normalize-Key (Get-Col $_ @('pais','country'))) -match 'honduras|hn')) }).Count
if ($junio26hn -eq 11) { Add-Issue warning junio26_hn_11_rows "JUNIO 26 HN tiene 11 filas. Debe quedar en revision antes de importacion." }
Add-Issue warning liquidations_require_external_excel "Liquidaciones base no son deuda final; requieren cruce con Excel financiero externo."

$shoppers = Read-CsvSafe $v71ShoppersFile
$posts = Read-CsvSafe $v71PostsFile
$certs = Read-CsvSafe $v71CertFile
$notifications = Read-CsvSafe $v71NotifFile
$trace = Read-CsvSafe $v71TraceFile
$shopperHeaders = if ($shoppers.Count -gt 0) { @($shoppers[0].PSObject.Properties.Name) } else { @() }
if (($shopperHeaders | ForEach-Object { $_.Trim().ToLowerInvariant() }) -contains 'dpi') { Add-Issue critical dpi_present_in_shoppers "shoppers.csv incluye columna DPI. Definir politica de descarte/cifrado/staging restringido antes de importar." }
$mojiShop = Test-Mojibake $shoppers
if ($mojiShop -gt 0) { Add-Issue warning mojibake_in_shoppers "Posible mojibake detectado en shoppers.csv. Corregir encoding antes de importar." }
if ($v71MarksFile -and $v71PostsFile -and ((Get-FileHash -LiteralPath $v71MarksFile -Algorithm SHA256).Hash -eq (Get-FileHash -LiteralPath $v71PostsFile -Algorithm SHA256).Hash)) { Add-Issue critical questionnaire_marks_duplicate_postulations "questionnaire_marks.csv es identico a postulations.csv; no usar como fuente independiente." }
if ($certs.Count -eq 0) { Add-Issue info certifications_zero "Certificaciones migrables limpias: 0. No inventar certificaciones." }
$mojiNotif = Test-Mojibake $notifications
if ($mojiNotif -gt 0) { Add-Issue warning mojibake_in_notifications "Posible mojibake detectado en notifications.csv. Corregir encoding antes de importar." }
$unresolved = @($trace | Where-Object { -not (Get-Col $_ @('toUserId','to_user_id')) -and -not (Get-Col $_ @('toRole','to_role')) }).Count
if ($unresolved -gt 0) { Add-Issue warning notification_recipients_unresolved "Notificaciones sin destinatario canonico resuelto. Importar como historial hasta resolver destinatarios." }

$report = [pscustomobject]@{
  generatedAt = (Get-Date).ToUniversalTime().ToString('o')
  mode = 'dry-run-no-import'
  inputs = @{ v6Zip = (Split-Path $V6ZipFull -Leaf); v71Zip = (Split-Path $V71ZipFull -Leaf); hrLiveXlsxProvided = -not [string]::IsNullOrWhiteSpace($HrLiveFull) }
  security = @{ scannedFiles = $allFiles.Count }
  counts = @{ v6Visits = $visits.Count; v6Submitidos = $submitidos.Count; v6LiquidationCandidates = $liqs.Count; v6ManifestRows = $manifest.Count; v71Shoppers = $shoppers.Count; v71Postulations = $posts.Count; v71Notifications = $notifications.Count; v71Certifications = $certs.Count }
  validations = @{ visitKeyDuplicates = (Count-Duplicates $visits @('visitKey','visit_key')); submitidosWithoutVisit = (Count-Orphans $submitidos @('visitKey','visit_key') $visitSet); liquidationsWithoutVisit = (Count-Orphans $liqs @('visitKey','visit_key') $visitSet); shopperDuplicateByPhone = (Count-Duplicates $shoppers @('wa','telefono','phone')); shopperDuplicateByEmail = (Count-Duplicates $shoppers @('email','mail')); shopperDuplicateByName = (Count-Duplicates $shoppers @('nombre','name','shopper')); junio26HnRows = $junio26hn; notificationTraceUnresolvedRecipients = $unresolved; shoppersMojibakeRows = $mojiShop; notificationsMojibakeRows = $mojiNotif }
  issues = $script:Issues
}

$jsonPath = Join-Path $OutDir 'tya-dry-run-report.json'
$mdPath = Join-Path $OutDir 'tya-dry-run-report.md'
$report | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
$crit = @($script:Issues | Where-Object { $_.severity -eq 'critical' })
$warn = @($script:Issues | Where-Object { $_.severity -eq 'warning' })
$md = @()
$md += '# CXOrbia TyA migration dry-run report'
$md += ''
$md += "Generated at: $($report.generatedAt)"
$md += 'Mode: dry-run-no-import'
$md += ''
$md += '## Verdict'
$md += "- Critical issues: $($crit.Count)"
$md += "- Warnings: $($warn.Count)"
$md += '- Firestore writes: 0'
$md += '- Imports executed: 0'
$md += '- Raw PII printed: no'
$md += ''
$md += '## Counts'
$md += "- V6 visits: $($visits.Count)"
$md += "- V6 submitidos: $($submitidos.Count)"
$md += "- V6 liquidation candidates: $($liqs.Count)"
$md += "- V7.1 shoppers: $($shoppers.Count)"
$md += "- V7.1 postulations: $($posts.Count)"
$md += "- V7.1 notifications: $($notifications.Count)"
$md += "- V7.1 certifications: $($certs.Count)"
$md += ''
$md += '## Issues'
foreach ($i in $script:Issues) { $md += "- $($i.severity.ToUpper()) · $($i.code): $($i.message)" }
$md += ''
$md += '## Next gates'
$md += '- Resolver criticos antes de importar.'
$md += '- Mantener liquidaciones como candidatas hasta cruce financiero externo.'
$md += '- HR manda para visitas, fechas, submitidos y base de liquidacion.'
$md += '- RTDB solo complementa trazabilidad operativa.'
$md -join "`r`n" | Set-Content -LiteralPath $mdPath -Encoding UTF8
Set-Clipboard -Value (($md -join "`r`n"))
Write-Host "CXOrbia TyA dry-run report generado:"
Write-Host "- $mdPath"
Write-Host "- $jsonPath"
Write-Host "Critical issues: $($crit.Count)"
Write-Host "Firestore writes: 0"
Write-Host "Imports executed: 0"
Write-Host "Reporte copiado al portapapeles."
if ($crit.Count -gt 0 -and $FailOnCritical) { exit 2 }
exit 0
