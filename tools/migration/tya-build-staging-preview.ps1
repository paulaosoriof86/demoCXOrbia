param(
  [Parameter(Mandatory=$true)][string]$V6Zip,
  [Parameter(Mandatory=$true)][string]$V71Zip,
  [string]$OutDir = "",
  [string]$TenantId = "tya",
  [string]$ProgramId = "cinepolis",
  [string]$ProjectId = "cinepolis",
  [switch]$IncludePiiLocal
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
  if ([string]::IsNullOrWhiteSpace($Path) -or !(Test-Path -LiteralPath $Path)) { return @() }
  return @(Import-Csv -LiteralPath $Path -Encoding UTF8)
}

function Get-Col($Row,[string[]]$Names) {
  foreach ($n in $Names) {
    $prop = $Row.PSObject.Properties | Where-Object { ($_.Name.Trim().ToLower() -replace '\s+',' ') -eq ($n.Trim().ToLower() -replace '\s+',' ') } | Select-Object -First 1
    if ($null -ne $prop -and -not [string]::IsNullOrWhiteSpace([string]$prop.Value)) { return ([string]$prop.Value).Trim() }
  }
  return ""
}

function Normalize-Id([string]$Value,[string]$Fallback) {
  $v = if ([string]::IsNullOrWhiteSpace($Value)) { $Fallback } else { $Value }
  $v = $v.ToLowerInvariant()
  $v = $v -replace '[^a-z0-9]+','-'
  $v = $v.Trim('-')
  if ([string]::IsNullOrWhiteSpace($v)) { return ([guid]::NewGuid().ToString('N')) }
  return $v
}

function Add-Issue([string]$Severity,[string]$Code,[string]$Message,[string]$SourceFile,[string]$SourceKey) {
  $script:Issues += [pscustomobject]@{
    severity = $Severity
    code = $Code
    message = $Message
    sourceFile = $SourceFile
    sourceKey = $SourceKey
  }
}

function Write-JsonLines([string]$Path,$Rows) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  $sw = New-Object System.IO.StreamWriter($Path,$false,$enc)
  try {
    foreach ($r in $Rows) { $sw.WriteLine(($r | ConvertTo-Json -Depth 20 -Compress)) }
  } finally { $sw.Dispose() }
}

function New-SourceRef([string]$System,[string]$File,$Row,[string]$Key) {
  return [pscustomobject]@{
    sourceSystem = $System
    sourceFile = $File
    sourceKey = $Key
    sourceTab = Get-Col $Row @('source_tab','tab','periodo')
    sourceRow = Get-Col $Row @('source_row','row')
  }
}

$Repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if ([string]::IsNullOrWhiteSpace($OutDir)) { $OutDir = Join-Path $Repo "tmp\tya-staging-preview" }
$V6ZipFull = Resolve-FullPath $V6Zip
$V71ZipFull = Resolve-FullPath $V71Zip
$BatchId = "tya-v6-v71-preview-" + (Get-Date -Format "yyyyMMdd-HHmmss")

$Work = Join-Path $env:TEMP ("cxorbia_tya_staging_preview_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
$V6Dir = Join-Path $Work "v6"
$V71Dir = Join-Path $Work "v71"
New-Item -ItemType Directory -Path $V6Dir,$V71Dir,$OutDir -Force | Out-Null
Expand-Archive -LiteralPath $V6ZipFull -DestinationPath $V6Dir -Force
Expand-Archive -LiteralPath $V71ZipFull -DestinationPath $V71Dir -Force
Expand-AllZips $V6Dir
Expand-AllZips $V71Dir

$script:Issues = @()

$v6VisitsFile = Find-File $V6Dir 'migration_visits_master_hr.csv'
$v6SubFile = Find-File $V6Dir 'migration_submitidos_master_hr.csv'
$v6LiqFile = Find-File $V6Dir 'migration_liquidations_base_hr.csv'
$v6ManifestFile = Find-File $V6Dir 'migration_manifest.csv'
$v71ShoppersFile = Find-File $V71Dir 'shoppers.csv'
$v71PostsFile = Find-File $V71Dir 'postulations.csv'
$v71MarksFile = Find-File $V71Dir 'questionnaire_marks.csv'
$v71NotifFile = Find-File $V71Dir 'notifications.csv'
$v71TraceFile = Find-File $V71Dir 'notification_trace.csv'

foreach ($entry in @(
  @{p=$v6VisitsFile;n='migration_visits_master_hr.csv'},
  @{p=$v6SubFile;n='migration_submitidos_master_hr.csv'},
  @{p=$v6LiqFile;n='migration_liquidations_base_hr.csv'},
  @{p=$v6ManifestFile;n='migration_manifest.csv'},
  @{p=$v71ShoppersFile;n='shoppers.csv'},
  @{p=$v71PostsFile;n='postulations.csv'},
  @{p=$v71NotifFile;n='notifications.csv'}
)) {
  if ($null -eq $entry.p) { Add-Issue critical missing_file "Required file missing" $entry.n "" }
}

$visits = Read-CsvSafe $v6VisitsFile
$submitidos = Read-CsvSafe $v6SubFile
$liqs = Read-CsvSafe $v6LiqFile
$manifest = Read-CsvSafe $v6ManifestFile
$shoppers = Read-CsvSafe $v71ShoppersFile
$posts = Read-CsvSafe $v71PostsFile
$notifications = Read-CsvSafe $v71NotifFile
$trace = Read-CsvSafe $v71TraceFile

if ($v71MarksFile -and $v71PostsFile) {
  if ((Get-FileHash -LiteralPath $v71MarksFile -Algorithm SHA256).Hash -eq (Get-FileHash -LiteralPath $v71PostsFile -Algorithm SHA256).Hash) {
    Add-Issue critical questionnaire_marks_duplicate_postulations "questionnaire_marks.csv equals postulations.csv; do not import as independent questionnaire source" "questionnaire_marks.csv" ""
  }
}

$shopperHeaders = if ($shoppers.Count -gt 0) { @($shoppers[0].PSObject.Properties.Name) } else { @() }
if (($shopperHeaders | ForEach-Object { $_.Trim().ToLowerInvariant() }) -contains 'dpi') {
  Add-Issue critical dpi_present_in_shoppers "Sensitive DPI field present in shoppers.csv; exclude from sanitized preview and define encryption/drop policy" "shoppers.csv" ""
}

$previewVisits = @()
foreach ($r in $visits) {
  $key = Get-Col $r @('visitKey','visit_key')
  $period = Get-Col $r @('periodo','period','source_tab')
  $country = Get-Col $r @('pais','country')
  $sourceRow = Get-Col $r @('source_row','row')
  $docId = Normalize-Id $key ("visit-" + $period + "-" + $sourceRow)
  $periodNorm = ($period.ToLowerInvariant() -replace '\s+','')
  $periodStatus = Get-Col $r @('periodo_migracion','periodStatus')
  if ([string]::IsNullOrWhiteSpace($periodStatus)) {
    if ($periodNorm -match 'julio26') { $periodStatus = 'preparacion' } else { $periodStatus = 'historico' }
  }
  if ($periodNorm -match 'junio26hn') { Add-Issue warning junio26_hn_review "JUNIO 26 HN row must be reviewed before import" "migration_visits_master_hr.csv" $key }
  $doc = [ordered]@{
    docId = $docId
    tenantId = $TenantId
    programId = $ProgramId
    projectId = $ProjectId
    importBatchId = $BatchId
    collectionTarget = "tenants/$TenantId/projects/$ProjectId/visits"
    hrVisitKey = $key
    periodRaw = $period
    periodStatus = $periodStatus
    country = $country
    cinemaId = Get-Col $r @('id_cinema','ID CINEMA','cinemaId')
    branchName = Get-Col $r @('sucursal','Shopping','shopping','branchName')
    city = Get-Col $r @('ciudad','city')
    timeBand = Get-Col $r @('franja','Franja Horaria','timeBand')
    cinemaFormat = Get-Col $r @('Formato de Cine','formato','cinemaFormat')
    comboType = Get-Col $r @('Tipo de Combo','comboType')
    purchaseType = Get-Col $r @('Tipo de Compra','purchaseType')
    paymentMethod = Get-Col $r @('Metodo de Pago','Método de Pago','paymentMethod')
    quincena = Get-Col $r @('quincena','Quincena')
    availableFromRaw = Get-Col $r @('Disponible a partir de','disponible_desde','availableFrom')
    scheduledDateRaw = Get-Col $r @('Fecha programada','Fecha  programada','fecha_programada')
    completedDateRaw = Get-Col $r @('Fecha realizada','fecha_realizada')
    questionnaireDateRaw = Get-Col $r @('Ccuestionario completado','cuestionario completado','fecha_cuestionario')
    submittedAtRaw = Get-Col $r @('Fecha submitido','Fecha  submitido','fecha_submitido')
    ticketAmountRaw = Get-Col $r @('Precio de boleto','precio_boleto')
    comboAmountRaw = Get-Col $r @('Precio de combo','precio_combo')
    surveyIdRaw = Get-Col $r @('N Encuesta','N° Encuesta','encuesta')
    honorariumRaw = Get-Col $r @('Honorarios','honorarios')
    reviewerRaw = Get-Col $r @('Revisor','revisor')
    liquidatedRaw = Get-Col $r @('Liquidado','liquidado')
    estadoConfianza = Get-Col $r @('estado_confianza','estadoConfianza')
    piiPolicy = if ($IncludePiiLocal) { 'local_preview_includes_pii' } else { 'pii_omitted_in_preview' }
    sourceRef = New-SourceRef 'HR_V5' 'migration_visits_master_hr.csv' $r $key
  }
  if ($IncludePiiLocal) {
    $doc.shopperNameRaw = Get-Col $r @('Shopper Asignado','shopper_asignado')
    $doc.phoneRaw = Get-Col $r @('Telefono','telefono')
    $doc.emailRaw = Get-Col $r @('Mail','email')
  } else {
    $doc.hasShopperName = -not [string]::IsNullOrWhiteSpace((Get-Col $r @('Shopper Asignado','shopper_asignado')))
    $doc.hasPhone = -not [string]::IsNullOrWhiteSpace((Get-Col $r @('Telefono','telefono')))
    $doc.hasEmail = -not [string]::IsNullOrWhiteSpace((Get-Col $r @('Mail','email')))
  }
  $previewVisits += [pscustomobject]$doc
}

$previewSubmitidos = @()
foreach ($r in $submitidos) {
  $key = Get-Col $r @('visitKey','visit_key')
  $previewSubmitidos += [pscustomobject]@{
    docId = Normalize-Id ("submitted-" + $key) ([guid]::NewGuid().ToString('N'))
    tenantId = $TenantId
    programId = $ProgramId
    projectId = $ProjectId
    importBatchId = $BatchId
    collectionTarget = "tenants/$TenantId/migrationBatches/$BatchId/previewEvents"
    eventType = 'submitted_by_tya'
    hrVisitKey = $key
    submittedAtRaw = Get-Col $r @('Fecha submitido','Fecha  submitido','fecha_submitido')
    sourceRef = New-SourceRef 'HR_V5' 'migration_submitidos_master_hr.csv' $r $key
  }
}

$previewLiquidations = @()
foreach ($r in $liqs) {
  $key = Get-Col $r @('visitKey','visit_key')
  $previewLiquidations += [pscustomobject]@{
    docId = Normalize-Id ("liquidation-candidate-" + $key) ([guid]::NewGuid().ToString('N'))
    tenantId = $TenantId
    programId = $ProgramId
    projectId = $ProjectId
    importBatchId = $BatchId
    collectionTarget = "tenants/$TenantId/migrationBatches/$BatchId/previewLiquidationCandidates"
    candidateOnly = $true
    requiresExternalFinanceCrosscheck = $true
    hrVisitKey = $key
    sourceRef = New-SourceRef 'HR_V5' 'migration_liquidations_base_hr.csv' $r $key
  }
}
Add-Issue warning liquidations_require_external_excel "Liquidation candidates require external finance Excel crosscheck before final debt/payment import" "migration_liquidations_base_hr.csv" ""

$previewShoppers = @()
foreach ($r in $shoppers) {
  $sourceId = Get-Col $r @('source_id','id')
  $node = Get-Col $r @('source_node')
  $doc = [ordered]@{
    docId = Normalize-Id ("shopper-" + $node + "-" + $sourceId) ([guid]::NewGuid().ToString('N'))
    tenantId = $TenantId
    programId = $ProgramId
    projectId = $ProjectId
    importBatchId = $BatchId
    collectionTarget = "tenants/$TenantId/migrationBatches/$BatchId/previewShoppers"
    sourceNode = $node
    sourceId = $sourceId
    dpiPolicy = 'excluded_from_preview_requires_policy'
    piiPolicy = if ($IncludePiiLocal) { 'local_preview_includes_pii' } else { 'pii_omitted_in_preview' }
    countryRaw = Get-Col $r @('pais','country')
    cityRaw = Get-Col $r @('ciudad','city')
    activeRaw = Get-Col $r @('activo','active')
    sourceRef = New-SourceRef 'RTDB_V4' 'shoppers.csv' $r $sourceId
  }
  if ($IncludePiiLocal) {
    $doc.nameRaw = Get-Col $r @('nombre','name')
    $doc.emailRaw = Get-Col $r @('email','mail')
    $doc.phoneRaw = Get-Col $r @('wa','telefono','phone')
  } else {
    $doc.hasName = -not [string]::IsNullOrWhiteSpace((Get-Col $r @('nombre','name')))
    $doc.hasEmail = -not [string]::IsNullOrWhiteSpace((Get-Col $r @('email','mail')))
    $doc.hasPhone = -not [string]::IsNullOrWhiteSpace((Get-Col $r @('wa','telefono','phone')))
  }
  $previewShoppers += [pscustomobject]$doc
}

$previewPostulations = @()
foreach ($r in $posts) {
  $sourceId = Get-Col $r @('source_id','id')
  $platformVisitKey = Get-Col $r @('visitKey','vid')
  $previewPostulations += [pscustomobject]@{
    docId = Normalize-Id ("postulation-" + $sourceId) ([guid]::NewGuid().ToString('N'))
    tenantId = $TenantId
    programId = $ProgramId
    projectId = $ProjectId
    importBatchId = $BatchId
    collectionTarget = "tenants/$TenantId/migrationBatches/$BatchId/previewEvents"
    eventType = 'postulation'
    platformVisitKey = $platformVisitKey
    hrVisitKeyResolution = 'pending_platform_to_hr_map'
    countryRaw = Get-Col $r @('pais','country')
    branchNameRaw = Get-Col $r @('shopping','sucursal')
    proposedDateRaw = Get-Col $r @('fp','fecha_programada')
    completedDateRaw = Get-Col $r @('freal','fecha_realizada')
    statusRaw = Get-Col $r @('est','estado')
    piiPolicy = 'pii_omitted_in_preview'
    sourceRef = New-SourceRef 'RTDB_V4' 'postulations.csv' $r $sourceId
  }
}

$previewNotifications = @()
foreach ($r in $notifications) {
  $sourceId = Get-Col $r @('source_id','id')
  $previewNotifications += [pscustomobject]@{
    docId = Normalize-Id ("notification-" + $sourceId) ([guid]::NewGuid().ToString('N'))
    tenantId = $TenantId
    programId = $ProgramId
    projectId = $ProjectId
    importBatchId = $BatchId
    collectionTarget = "tenants/$TenantId/migrationBatches/$BatchId/previewNotifications"
    legacyNotificationId = $sourceId
    notificationMode = 'history_until_recipient_resolved'
    recipientResolution = 'pending'
    typeRaw = Get-Col $r @('tipo','type')
    createdAtRaw = Get-Col $r @('fecha','createdAt')
    sourceRef = New-SourceRef 'RTDB_V4' 'notifications.csv' $r $sourceId
  }
}

$unresolved = @($trace | Where-Object { -not (Get-Col $_ @('toUserId','to_user_id')) -and -not (Get-Col $_ @('toRole','to_role')) }).Count
if ($unresolved -gt 0) { Add-Issue warning notification_recipients_unresolved "Notification recipients are not canonical yet; keep as history until resolved" "notification_trace.csv" "" }

$batch = [pscustomobject]@{
  batchId = $BatchId
  tenantId = $TenantId
  programId = $ProgramId
  projectId = $ProjectId
  status = 'preview_created_local_only'
  dryRunOnly = $true
  firestoreWrites = 0
  importsExecuted = 0
  createdAt = (Get-Date).ToUniversalTime().ToString('o')
  sourcePackages = @(
    @{ kind='V6'; file=(Split-Path $V6ZipFull -Leaf) },
    @{ kind='V7.1'; file=(Split-Path $V71ZipFull -Leaf) }
  )
  counts = @{
    previewVisits = $previewVisits.Count
    previewSubmitidos = $previewSubmitidos.Count
    previewLiquidationCandidates = $previewLiquidations.Count
    previewShoppers = $previewShoppers.Count
    previewPostulations = $previewPostulations.Count
    previewNotifications = $previewNotifications.Count
    validationIssues = $script:Issues.Count
  }
  security = @{
    piiIncluded = [bool]$IncludePiiLocal
    dpiIncluded = $false
    repoSafe = -not [bool]$IncludePiiLocal
  }
}

$pathsPlan = [pscustomobject]@{
  migrationBatch = "tenants/$TenantId/migrationBatches/$BatchId"
  previewVisits = "tenants/$TenantId/migrationBatches/$BatchId/previewVisits"
  previewEvents = "tenants/$TenantId/migrationBatches/$BatchId/previewEvents"
  previewLiquidationCandidates = "tenants/$TenantId/migrationBatches/$BatchId/previewLiquidationCandidates"
  previewShoppers = "tenants/$TenantId/migrationBatches/$BatchId/previewShoppers"
  previewNotifications = "tenants/$TenantId/migrationBatches/$BatchId/previewNotifications"
  validationIssues = "tenants/$TenantId/migrationBatches/$BatchId/validationIssues"
  rollbackPlan = "tenants/$TenantId/migrationBatches/$BatchId/rollbackPlan"
}

$rollbackPlan = [pscustomobject]@{
  batchId = $BatchId
  strategy = 'delete_only_documents_with_importBatchId_or_restore_snapshot_before_promotion'
  firestoreWrites = 0
  importsExecuted = 0
  reversibleUntilPromotion = $true
  notes = @(
    'This file is a local preview plan only.',
    'Do not import without explicit authorization.',
    'For final import, keep created document paths and before snapshots.'
  )
}

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $OutDir 'migrationBatch.json'), ($batch | ConvertTo-Json -Depth 20), $enc)
[System.IO.File]::WriteAllText((Join-Path $OutDir 'firestorePathsPlan.json'), ($pathsPlan | ConvertTo-Json -Depth 20), $enc)
[System.IO.File]::WriteAllText((Join-Path $OutDir 'rollbackPlan.json'), ($rollbackPlan | ConvertTo-Json -Depth 20), $enc)
Write-JsonLines (Join-Path $OutDir 'previewVisits.jsonl') $previewVisits
Write-JsonLines (Join-Path $OutDir 'previewSubmitidos.jsonl') $previewSubmitidos
Write-JsonLines (Join-Path $OutDir 'previewLiquidationCandidates.jsonl') $previewLiquidations
Write-JsonLines (Join-Path $OutDir 'previewShoppers.jsonl') $previewShoppers
Write-JsonLines (Join-Path $OutDir 'previewPostulations.jsonl') $previewPostulations
Write-JsonLines (Join-Path $OutDir 'previewNotifications.jsonl') $previewNotifications
Write-JsonLines (Join-Path $OutDir 'validationIssues.jsonl') $script:Issues

$crit = @($script:Issues | Where-Object { $_.severity -eq 'critical' })
$warn = @($script:Issues | Where-Object { $_.severity -eq 'warning' })
$md = @()
$md += '# CXOrbia TyA staging preview report'
$md += ''
$md += "Batch: $BatchId"
$md += "Generated at: $($batch.createdAt)"
$md += 'Mode: local-preview-no-firestore-writes'
$md += ''
$md += '## Counts'
$md += "- Preview visits: $($previewVisits.Count)"
$md += "- Preview submitidos: $($previewSubmitidos.Count)"
$md += "- Preview liquidation candidates: $($previewLiquidations.Count)"
$md += "- Preview shoppers: $($previewShoppers.Count)"
$md += "- Preview postulations: $($previewPostulations.Count)"
$md += "- Preview notifications: $($previewNotifications.Count)"
$md += ''
$md += '## Safety'
$md += '- Firestore writes: 0'
$md += '- Imports executed: 0'
$md += '- DPI included: no'
$md += "- PII included locally: $([bool]$IncludePiiLocal)"
$md += ''
$md += '## Issues'
$md += "- Critical: $($crit.Count)"
$md += "- Warning: $($warn.Count)"
foreach ($i in $script:Issues) { $md += "- $($i.severity.ToUpper()) - $($i.code): $($i.message)" }
$md += ''
$md += '## Next gate'
$md += '- Review generated preview files locally.'
$md += '- Keep import blocked until critical issues are resolved and Paula authorizes DEV staging write.'
$mdText = $md -join "`r`n"
[System.IO.File]::WriteAllText((Join-Path $OutDir 'stagingPreviewReport.md'), $mdText, $enc)
Set-Clipboard -Value $mdText

Write-Host "CXOrbia TyA staging preview generated:"
Write-Host "- $OutDir"
Write-Host "Critical issues: $($crit.Count)"
Write-Host "Warnings: $($warn.Count)"
Write-Host "Firestore writes: 0"
Write-Host "Imports executed: 0"
Write-Host "Report copied to clipboard."
exit 0
