param(
  [string]$StagingPreviewDir = "",
  [string]$OutDir = "",
  [int]$SampleRows = 5,
  [switch]$AllowBlockedPlan,
  [switch]$AllowLocalPiiPlan
)

$ErrorActionPreference = "Stop"

function Read-JsonFile([string]$Path) {
  if (!(Test-Path -LiteralPath $Path)) { throw "Missing required file: $Path" }
  return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Read-JsonLines([string]$Path) {
  if (!(Test-Path -LiteralPath $Path)) { return @() }
  $rows = @()
  Get-Content -LiteralPath $Path -Encoding UTF8 | ForEach-Object {
    if (-not [string]::IsNullOrWhiteSpace($_)) { $rows += ($_ | ConvertFrom-Json) }
  }
  return @($rows)
}

function Write-JsonLines([string]$Path,$Rows) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  $sw = New-Object System.IO.StreamWriter($Path,$false,$enc)
  try {
    foreach ($r in $Rows) { $sw.WriteLine(($r | ConvertTo-Json -Depth 30 -Compress)) }
  } finally { $sw.Dispose() }
}

function New-PlanRow([string]$Operation,[string]$Path,$Doc,[string]$SourceFile,[string]$Gate) {
  return [pscustomobject]@{
    operation = $Operation
    path = $Path
    docId = $Doc.docId
    importBatchId = $Doc.importBatchId
    sourceFile = $SourceFile
    gate = $Gate
    executeAllowed = $false
    payload = $Doc
  }
}

$Repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if ([string]::IsNullOrWhiteSpace($StagingPreviewDir)) { $StagingPreviewDir = Join-Path $Repo "tmp\tya-staging-preview" }
if ([string]::IsNullOrWhiteSpace($OutDir)) { $OutDir = Join-Path $Repo "tmp\tya-firestore-write-plan" }
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

$batch = Read-JsonFile (Join-Path $StagingPreviewDir 'migrationBatch.json')
$paths = Read-JsonFile (Join-Path $StagingPreviewDir 'firestorePathsPlan.json')
$rollback = Read-JsonFile (Join-Path $StagingPreviewDir 'rollbackPlan.json')
$issues = Read-JsonLines (Join-Path $StagingPreviewDir 'validationIssues.jsonl')
$visits = Read-JsonLines (Join-Path $StagingPreviewDir 'previewVisits.jsonl')
$submitidos = Read-JsonLines (Join-Path $StagingPreviewDir 'previewSubmitidos.jsonl')
$liqs = Read-JsonLines (Join-Path $StagingPreviewDir 'previewLiquidationCandidates.jsonl')
$shoppers = Read-JsonLines (Join-Path $StagingPreviewDir 'previewShoppers.jsonl')
$posts = Read-JsonLines (Join-Path $StagingPreviewDir 'previewPostulations.jsonl')
$notifications = Read-JsonLines (Join-Path $StagingPreviewDir 'previewNotifications.jsonl')

$critical = @($issues | Where-Object { $_.severity -eq 'critical' })
$warnings = @($issues | Where-Object { $_.severity -eq 'warning' })

if ($batch.security.piiIncluded -and -not $AllowLocalPiiPlan) {
  throw "Staging preview includes local PII. Rebuild preview without -IncludePiiLocal or pass -AllowLocalPiiPlan for local-only review."
}

$gateStatus = 'blocked'
if ($critical.Count -eq 0) { $gateStatus = 'review_required' }
if ($critical.Count -gt 0 -and $AllowBlockedPlan) { $gateStatus = 'blocked_plan_generated_for_review_only' }

$planRows = @()
$planRows += New-PlanRow 'create' $paths.migrationBatch $batch 'migrationBatch.json' 'metadata_only'

foreach ($v in $visits) { $planRows += New-PlanRow 'create' ("$($paths.previewVisits)/$($v.docId)") $v 'previewVisits.jsonl' $gateStatus }
foreach ($e in $submitidos) { $planRows += New-PlanRow 'create' ("$($paths.previewEvents)/$($e.docId)") $e 'previewSubmitidos.jsonl' $gateStatus }
foreach ($l in $liqs) { $planRows += New-PlanRow 'create' ("$($paths.previewLiquidationCandidates)/$($l.docId)") $l 'previewLiquidationCandidates.jsonl' $gateStatus }
foreach ($s in $shoppers) { $planRows += New-PlanRow 'create' ("$($paths.previewShoppers)/$($s.docId)") $s 'previewShoppers.jsonl' $gateStatus }
foreach ($p in $posts) { $planRows += New-PlanRow 'create' ("$($paths.previewEvents)/$($p.docId)") $p 'previewPostulations.jsonl' $gateStatus }
foreach ($n in $notifications) { $planRows += New-PlanRow 'create' ("$($paths.previewNotifications)/$($n.docId)") $n 'previewNotifications.jsonl' $gateStatus }
foreach ($i in $issues) {
  $issueDoc = [pscustomobject]@{
    docId = ((($i.severity + '-' + $i.code + '-' + [guid]::NewGuid().ToString('N')).ToLowerInvariant()) -replace '[^a-z0-9]+','-')
    importBatchId = $batch.batchId
    severity = $i.severity
    code = $i.code
    message = $i.message
    sourceFile = $i.sourceFile
    sourceKey = $i.sourceKey
  }
  $planRows += New-PlanRow 'create' ("$($paths.validationIssues)/$($issueDoc.docId)") $issueDoc 'validationIssues.jsonl' 'metadata_only'
}

$importGate = [pscustomobject]@{
  batchId = $batch.batchId
  status = $gateStatus
  canWriteToFirestore = $false
  reason = if ($critical.Count -gt 0) { 'critical_issues_present' } else { 'manual_review_required_before_dev_write' }
  criticalIssues = $critical.Count
  warnings = $warnings.Count
  firestoreWrites = 0
  importsExecuted = 0
  requiresExplicitAuthorization = $true
  requiredAuthorizationText = 'PAULA_AUTORIZA_DEV_STAGING_WRITE'
  generatedAt = (Get-Date).ToUniversalTime().ToString('o')
}

$manifest = [pscustomobject]@{
  batchId = $batch.batchId
  sourcePreviewDir = $StagingPreviewDir
  gate = $importGate
  counts = @{
    planRows = $planRows.Count
    previewVisits = $visits.Count
    previewSubmitidos = $submitidos.Count
    previewLiquidationCandidates = $liqs.Count
    previewShoppers = $shoppers.Count
    previewPostulations = $posts.Count
    previewNotifications = $notifications.Count
    validationIssues = $issues.Count
  }
  safety = @{
    firestoreWrites = 0
    importsExecuted = 0
    executeAllowed = $false
    piiIncluded = [bool]$batch.security.piiIncluded
    dpiIncluded = $false
  }
  rollbackPlan = $rollback
}

$enc = New-Object System.Text.UTF8Encoding($false)
Write-JsonLines (Join-Path $OutDir 'firestoreWritePlan.jsonl') $planRows
[System.IO.File]::WriteAllText((Join-Path $OutDir 'importGate.json'), ($importGate | ConvertTo-Json -Depth 20), $enc)
[System.IO.File]::WriteAllText((Join-Path $OutDir 'writePlanManifest.json'), ($manifest | ConvertTo-Json -Depth 20), $enc)

$sample = @($planRows | Select-Object -First $SampleRows)
[System.IO.File]::WriteAllText((Join-Path $OutDir 'writePlanSample.json'), ($sample | ConvertTo-Json -Depth 30), $enc)

$md = @()
$md += '# CXOrbia TyA Firestore write plan'
$md += ''
$md += "Batch: $($batch.batchId)"
$md += "Generated at: $($importGate.generatedAt)"
$md += 'Mode: plan-only-no-firestore-writes'
$md += ''
$md += '## Gate'
$md += "- Status: $($importGate.status)"
$md += "- Can write to Firestore: $($importGate.canWriteToFirestore)"
$md += "- Reason: $($importGate.reason)"
$md += "- Required authorization text: $($importGate.requiredAuthorizationText)"
$md += ''
$md += '## Counts'
$md += "- Plan rows: $($planRows.Count)"
$md += "- Visits: $($visits.Count)"
$md += "- Submitidos events: $($submitidos.Count)"
$md += "- Liquidation candidates: $($liqs.Count)"
$md += "- Shoppers preview: $($shoppers.Count)"
$md += "- Postulations events: $($posts.Count)"
$md += "- Notifications preview: $($notifications.Count)"
$md += "- Validation issues: $($issues.Count)"
$md += ''
$md += '## Safety'
$md += '- Firestore writes: 0'
$md += '- Imports executed: 0'
$md += '- Execute allowed: false'
$md += "- PII included: $([bool]$batch.security.piiIncluded)"
$md += '- DPI included: false'
$md += ''
$md += '## Next gate'
$md += '- Keep blocked until critical issues are resolved.'
$md += '- After approval, build a separate DEV importer with explicit authorization.'
$mdText = $md -join "`r`n"
[System.IO.File]::WriteAllText((Join-Path $OutDir 'writePlanReport.md'), $mdText, $enc)
Set-Clipboard -Value $mdText

Write-Host "CXOrbia TyA Firestore write plan generated:"
Write-Host "- $OutDir"
Write-Host "Gate status: $($importGate.status)"
Write-Host "Plan rows: $($planRows.Count)"
Write-Host "Firestore writes: 0"
Write-Host "Imports executed: 0"
Write-Host "Report copied to clipboard."
exit 0
