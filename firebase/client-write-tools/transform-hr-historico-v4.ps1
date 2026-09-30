param(
  [Parameter(Mandatory=$true)][string]$XlsxPath,
  [Parameter(Mandatory=$true)][string]$OutJson,
  [Parameter(Mandatory=$true)][string]$ReportPath
)

$ErrorActionPreference = "Stop"

function Normalize-Text($text) {
  $s = "$text".Trim().ToLowerInvariant()
  $s = $s.Normalize([Text.NormalizationForm]::FormD)
  $s = [regex]::Replace($s, "\p{Mn}", "")
  $s = [regex]::Replace($s, "\s+", " ")
  return $s
}

function Slug($text) {
  $s = Normalize-Text $text
  $s = [regex]::Replace($s, "[^a-z0-9]+", "-")
  $s = $s.Trim("-")
  if (-not $s) { return "sin-dato" }
  return $s
}

function Hash-Short($text, $len = 14) {
  $sha = [System.Security.Cryptography.SHA1]::Create()
  $bytes = [System.Text.Encoding]::UTF8.GetBytes("$text")
  $hash = $sha.ComputeHash($bytes)
  return (([BitConverter]::ToString($hash)) -replace "-", "").Substring(0, $len).ToLowerInvariant()
}

function Find-Col($headers, $patterns) {
  for ($i = 1; $i -le $headers.Count; $i++) {
    $h = Normalize-Text $headers[$i]
    foreach ($p in $patterns) {
      if ($h -match $p) { return $i }
    }
  }
  return 0
}

function Safe-Cell($values, $row, $col) {
  if ($col -lt 1) { return "" }
  $v = $values[$row, $col]
  if ($null -eq $v) { return "" }
  return "$v".Trim()
}

function Raw-Cell($values, $row, $col) {
  if ($col -lt 1) { return $null }
  return $values[$row, $col]
}

function Filled($v) {
  return ($null -ne $v -and "$v".Trim() -ne "")
}

function Is-Yes($v) {
  $s = (Normalize-Text $v).ToUpperInvariant()
  return ($s -eq "SI" -or $s -eq "SÍ" -or $s -eq "YES" -or $s -eq "TRUE" -or $s -eq "1")
}

function Parse-DateSafe($v) {
  if ($null -eq $v) { return $null }

  if ($v -is [double] -or $v -is [int] -or $v -is [decimal]) {
    $n = [double]$v
    if ($n -gt 30000 -and $n -lt 70000) {
      return ([datetime]::FromOADate($n)).ToString("yyyy-MM-dd")
    }
  }

  $s = "$v".Trim()
  if (-not $s) { return $null }

  $num = 0.0
  if ([double]::TryParse($s, [ref]$num)) {
    if ($num -gt 30000 -and $num -lt 70000) {
      return ([datetime]::FromOADate($num)).ToString("yyyy-MM-dd")
    }
  }

  $formats = @("yyyy-MM-dd HH:mm:ss","yyyy-MM-dd","dd/MM/yyyy","d/M/yyyy","MM/dd/yyyy","M/d/yyyy")
  foreach ($fmt in $formats) {
    try {
      return ([datetime]::ParseExact($s, $fmt, [Globalization.CultureInfo]::InvariantCulture)).ToString("yyyy-MM-dd")
    } catch {}
  }

  try {
    return ([datetime]::Parse($s)).ToString("yyyy-MM-dd")
  } catch {
    return $null
  }
}

function Month-Key($dateText) {
  if ($dateText -and "$dateText" -match "^\d{4}-\d{2}") {
    return "$dateText".Substring(0,7)
  }
  return "__SIN_FECHA__"
}

function Add-Count($map, $key, $n = 1) {
  if (-not (Filled $key)) { $key = "__VACIO__" }
  if (-not $map.ContainsKey($key)) { $map[$key] = 0 }
  $map[$key] = [int]$map[$key] + $n
}

function Visit-State($shopperName, $fechaProgramada, $fechaRealizada, $fechaCuest, $fechaSubmit, $liquidado) {
  if ($liquidado) { return "liquidada" }
  if ($fechaSubmit) { return "submitida" }
  if ($fechaCuest) { return "cuestionario_realizado" }
  if ($fechaRealizada) { return "realizada" }
  if ($fechaProgramada) { return "agendada" }
  if ($shopperName) { return "asignada" }
  return "disponible"
}

$tenantId = "tya"
$clientId = "cinepolis"

$clients = @(
  [ordered]@{
    id = $clientId
    tenantId = $tenantId
    name = "Cinepolis"
    source = "hr-tya-historico-sync"
  }
)

$projects = New-Object System.Collections.ArrayList
$visits = New-Object System.Collections.ArrayList
$questionnaires = New-Object System.Collections.ArrayList
$liquidations = New-Object System.Collections.ArrayList
$shoppersById = @{}

$byCountry = @{}
$byEstado = @{}
$byMonthRealizada = @{}
$bySheet = New-Object System.Collections.ArrayList

$excel = $null
$wb = $null

try {
  Write-Host "Abriendo Excel en modo lectura..."
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $wb = $excel.Workbooks.Open($XlsxPath, 0, $true)

  foreach ($ws in $wb.Worksheets) {
    $sheetName = "$($ws.Name)"
    if ($sheetName -match "DASHBOARD") { continue }

    Write-Host "Procesando hoja: $sheetName"

    $used = $ws.UsedRange
    $rowCount = $used.Rows.Count
    $colCount = $used.Columns.Count

    if ($rowCount -lt 2 -or $colCount -lt 2) { continue }

    $values = $used.Value2
    $headers = @{}

    for ($c = 1; $c -le $colCount; $c++) {
      $headers[$c] = "$($values[1, $c])"
    }

    $cols = @{
      pais = Find-Col $headers @("^pais$", "pais")
      idCinema = Find-Col $headers @("id cinema", "cinema")
      ciudad = Find-Col $headers @("ciudad")
      direccion = Find-Col $headers @("direccion")
      sucursal = Find-Col $headers @("shopping", "sucursal")
      franja = Find-Col $headers @("franja")
      formato = Find-Col $headers @("formato")
      combo = Find-Col $headers @("tipo de combo", "combo")
      compra = Find-Col $headers @("tipo de compra", "compra")
      pago = Find-Col $headers @("metodo de pago", "pago")
      quincena = Find-Col $headers @("quincena")
      shopper = Find-Col $headers @("shopper")
      telefono = Find-Col $headers @("telefono", "teléfono")
      mail = Find-Col $headers @("mail", "correo", "email")
      programada = Find-Col $headers @("fecha programada")
      realizada = Find-Col $headers @("fecha realizada")
      cuestionario = Find-Col $headers @("cuestionario")
      boleto = Find-Col $headers @("precio de boleto", "boleto")
      comboPrecio = Find-Col $headers @("precio de combo")
      encuesta = Find-Col $headers @("encuesta")
      honorarios = Find-Col $headers @("honorarios")
      revisor = Find-Col $headers @("revisor")
      submitido = Find-Col $headers @("submit")
      liquidado = Find-Col $headers @("liquidado")
      disponibleDesde = Find-Col $headers @("disponible")
    }

    $sheetIsHN = ($sheetName -match "\bHN\b")
    $sheetCountry = if ($sheetIsHN) { "HN" } else { "GT" }
    $projectId = "cinepolis-" + (Slug $sheetName)

    [void]$projects.Add([ordered]@{
      id = $projectId
      tenantId = $tenantId
      clientId = $clientId
      name = "Cinepolis $sheetName"
      country = $sheetCountry
      source = "hr-tya-historico-sync"
      sourceSheet = $sheetName
      status = "active"
    })

    $stats = [ordered]@{
      sheet = $sheetName
      projectId = $projectId
      filas = 0
      asignadas = 0
      agendadas = 0
      realizadas = 0
      cuestionarios = 0
      submitidas = 0
      liquidadas = 0
      hasDisponibleDesde = ($cols.disponibleDesde -ge 1)
    }

    for ($r = 2; $r -le $rowCount; $r++) {
      $paisRaw = Safe-Cell $values $r $cols.pais
      $idCinema = Safe-Cell $values $r $cols.idCinema
      $sucursal = Safe-Cell $values $r $cols.sucursal

      if (-not (Filled $paisRaw) -and -not (Filled $idCinema) -and -not (Filled $sucursal)) { continue }

      $country = if ($sheetIsHN -or $paisRaw -match "Honduras") { "HN" } else { "GT" }
      $pais = if (Filled $paisRaw) { $paisRaw } elseif ($country -eq "HN") { "Honduras" } else { "Guatemala" }

      $shopperName = Safe-Cell $values $r $cols.shopper
      $shopperId = ""

      if (Filled $shopperName) {
        $shopperId = "shp-" + (Hash-Short "$country|$(Normalize-Text $shopperName)" 12)
        if (-not $shoppersById.ContainsKey($shopperId)) {
          $shoppersById[$shopperId] = [ordered]@{
            id = $shopperId
            tenantId = $tenantId
            displayName = $shopperName
            country = $country
            source = "hr-tya-historico-sync"
            phoneOmitted = (Filled (Safe-Cell $values $r $cols.telefono))
            emailOmitted = (Filled (Safe-Cell $values $r $cols.mail))
            documentsOmitted = $true
          }
        }
      }

      $fechaProgramada = Parse-DateSafe (Raw-Cell $values $r $cols.programada)
      $fechaRealizada = Parse-DateSafe (Raw-Cell $values $r $cols.realizada)
      $fechaCuest = Parse-DateSafe (Raw-Cell $values $r $cols.cuestionario)
      $fechaSubmit = Parse-DateSafe (Raw-Cell $values $r $cols.submitido)
      $disponibleDesde = Parse-DateSafe (Raw-Cell $values $r $cols.disponibleDesde)
      $liquidado = Is-Yes (Safe-Cell $values $r $cols.liquidado)

      $estado = Visit-State $shopperName $fechaProgramada $fechaRealizada $fechaCuest $fechaSubmit $liquidado
      $numeroEncuesta = Safe-Cell $values $r $cols.encuesta
      $visitId = "hr-" + (Hash-Short "$sheetName|$country|$idCinema|$sucursal|$numeroEncuesta|$r" 16)

      $visit = [ordered]@{
        id = $visitId
        tenantId = $tenantId
        clientId = $clientId
        projectId = $projectId
        source = "hr-tya-historico-sync"
        sourceSheet = $sheetName
        sourceRow = $r
        country = $country
        pais = $pais
        idCinema = $idCinema
        ciudad = Safe-Cell $values $r $cols.ciudad
        direccion = Safe-Cell $values $r $cols.direccion
        sucursal = $sucursal
        franja = Safe-Cell $values $r $cols.franja
        formato = Safe-Cell $values $r $cols.formato
        tipoCombo = Safe-Cell $values $r $cols.combo
        tipoCompra = Safe-Cell $values $r $cols.compra
        metodoPago = Safe-Cell $values $r $cols.pago
        quincena = Safe-Cell $values $r $cols.quincena
        shopperId = $shopperId
        shopperName = $shopperName
        fechaProgramada = $fechaProgramada
        fechaRealizada = $fechaRealizada
        fechaCuestionario = $fechaCuest
        fechaSubmitido = $fechaSubmit
        disponibleDesde = $disponibleDesde
        estado = $estado
        liquidado = $liquidado
        numeroEncuesta = $numeroEncuesta
        precioBoleto = Safe-Cell $values $r $cols.boleto
        precioCombo = Safe-Cell $values $r $cols.comboPrecio
        honorarios = Safe-Cell $values $r $cols.honorarios
        revisor = Safe-Cell $values $r $cols.revisor
        phoneOmitted = (Filled (Safe-Cell $values $r $cols.telefono))
        emailOmitted = (Filled (Safe-Cell $values $r $cols.mail))
        documentsOmitted = $true
        evidenceOmitted = $true
        notesOmitted = $true
      }

      [void]$visits.Add($visit)

      $stats.filas++
      if (Filled $shopperName) { $stats.asignadas++ }
      if ($fechaProgramada) { $stats.agendadas++ }
      if ($fechaRealizada) { $stats.realizadas++ }
      if ($fechaCuest) { $stats.cuestionarios++ }
      if ($fechaSubmit) { $stats.submitidas++ }
      if ($liquidado) { $stats.liquidadas++ }

      Add-Count $byCountry $country
      Add-Count $byEstado $estado
      Add-Count $byMonthRealizada (Month-Key $fechaRealizada)

      if ($fechaCuest) {
        [void]$questionnaires.Add([ordered]@{
          id = "q-$visitId"
          tenantId = $tenantId
          clientId = $clientId
          projectId = $projectId
          visitId = $visitId
          shopperId = $shopperId
          completedAt = $fechaCuest
          status = "completed"
          source = "hr-tya-historico-sync"
          sourceSheet = $sheetName
        })
      }

      if ($liquidado) {
        [void]$liquidations.Add([ordered]@{
          id = "liq-$visitId"
          tenantId = $tenantId
          clientId = $clientId
          projectId = $projectId
          visitId = $visitId
          shopperId = $shopperId
          status = "paid"
          source = "hr-tya-historico-sync"
          sourceSheet = $sheetName
        })
      }
    }

    [void]$bySheet.Add($stats)
  }
}
finally {
  if ($wb) { $wb.Close($false) | Out-Null }
  if ($excel) { $excel.Quit() | Out-Null }
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}

$shoppers = @($shoppersById.Values)

if ($visits.Count -lt 500) {
  throw "Transformación incompleta: solo $($visits.Count) visitas. No escribo JSON."
}

$output = [ordered]@{
  tenantId = $tenantId
  clients = @($clients)
  projects = @($projects)
  shoppers = @($shoppers)
  visits = @($visits)
  questionnaires = @($questionnaires)
  liquidations = @($liquidations)
  certifications = @()
  metadata = [ordered]@{
    generatedAt = (Get-Date).ToString("s")
    sourceFile = $XlsxPath
    privacy = "phones_emails_documents_evidence_notes_omitted"
  }
}

$json = $output | ConvertTo-Json -Depth 60
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($OutJson, $json, $utf8NoBom)

if (-not (Test-Path $OutJson)) {
  throw "No se pudo crear JSON: $OutJson"
}

$lines = New-Object System.Collections.Generic.List[string]
function Add-Line($text) { $script:lines.Add($text) | Out-Null }

Add-Line "# Transformación HR histórico T&A multihoja V4"
Add-Line ""
Add-Line "Este reporte no imprime shoppers, teléfonos, correos, documentos, evidencias ni observaciones."
Add-Line ""
Add-Line "## Archivo JSON local"
Add-Line ""
Add-Line '```text'
Add-Line $OutJson
Add-Line '```'
Add-Line ""
Add-Line "## Totales transformados"
Add-Line ""
Add-Line "- clients: $($clients.Count)"
Add-Line "- projects: $($projects.Count)"
Add-Line "- shoppers: $($shoppers.Count)"
Add-Line "- visits: $($visits.Count)"
Add-Line "- questionnaires: $($questionnaires.Count)"
Add-Line "- liquidations: $($liquidations.Count)"
Add-Line "- certifications: 0"
Add-Line ""
Add-Line "## Visitas por país"
Add-Line ""
foreach ($k in ($byCountry.Keys | Sort-Object)) { Add-Line "- ${k}: $($byCountry[$k])" }
Add-Line ""
Add-Line "## Visitas por estado"
Add-Line ""
foreach ($k in ($byEstado.Keys | Sort-Object)) { Add-Line "- ${k}: $($byEstado[$k])" }
Add-Line ""
Add-Line "## Meses por fecha realizada"
Add-Line ""
foreach ($k in ($byMonthRealizada.Keys | Sort-Object)) { Add-Line "- ${k}: $($byMonthRealizada[$k])" }
Add-Line ""
Add-Line "## Hojas transformadas"
Add-Line ""
foreach ($s in $bySheet) {
  Add-Line "### $($s.sheet)"
  Add-Line "- projectId: $($s.projectId)"
  Add-Line "- filas: $($s.filas)"
  Add-Line "- asignadas: $($s.asignadas)"
  Add-Line "- agendadas: $($s.agendadas)"
  Add-Line "- realizadas: $($s.realizadas)"
  Add-Line "- cuestionarios: $($s.cuestionarios)"
  Add-Line "- submitidas: $($s.submitidas)"
  Add-Line "- liquidadas: $($s.liquidadas)"
  Add-Line "- tiene disponible desde: $($s.hasDisponibleDesde)"
  Add-Line ""
}
Add-Line "## Estado"
Add-Line ""
Add-Line "No se escribió Firestore. No se hizo deploy. No se hizo merge. No se tocó producción. No se modificó app/modules."

[System.IO.File]::WriteAllText($ReportPath, ($lines -join "`n"), $utf8NoBom)

Write-Host ""
Write-Host "== Reporte transformación V4 =="
$lines | Select-Object -First 220
