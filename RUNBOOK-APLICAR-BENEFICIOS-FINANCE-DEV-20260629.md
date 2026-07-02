# RUNBOOK-APLICAR-BENEFICIOS-FINANCE-DEV-20260629

## Objetivo

Cargar en Firestore DEV los `shopperBenefits` calculados desde HR V4 usando el write-plan ya validado.

Destino exclusivo:

```text
tenants/tya/shopperBenefits/{benefitId}
```

Esta carga crea beneficios calculados. No marca pagos reales.

## Autorización registrada

Paula autorizó:

```text
Autorizo cargar shopperBenefits calculados desde HR V4 en Firestore DEV, usando el write-plan validado OK, sin Hosting, sin merge, sin producción, sin activar adapter global, sin modificar /app/modules y sin marcar pagos reales.
```

Confirmación técnica exigida por el script:

```text
PAULA_AUTORIZA_CARGA_BENEFICIOS_DEV_20260629
```

## Requisitos previos

Deben existir estos archivos locales en el repo:

```text
firebase/private-output/finance-benefits-write-plan-dry-run.json
firebase/private-output/finance-benefits-write-plan-validation.json
```

La validación debe estar en `OK`.

Si la validación está en `FAIL`, el script se detiene.

Si la validación está en `REVIEW`, solo continúa con autorización técnica adicional usando `--allowReview=true`.

## Qué hace el script

Archivo:

```text
firebase/client-write-tools/apply-finance-benefits-write-plan-dev.mjs
```

Hace lo siguiente:

1. Lee `app/core/backend-config.js`.
2. Verifica que el Firebase projectId sea `cxorbia-backend-dev`.
3. Lee el write-plan y la validación.
4. Exige la confirmación exacta.
5. Autentica contra Firebase DEV con Email/Password.
6. Escribe únicamente rutas `tenants/{tenantId}/shopperBenefits/{benefitId}`.
7. Usa batches de máximo 450 operaciones.
8. Escribe con `merge:true`.
9. Genera reporte local.

## Qué NO hace

- No publica Hosting.
- No toca producción.
- No hace merge.
- No activa adapter global.
- No modifica `/app/modules`.
- No marca pagos reales.
- No escribe `paymentLots`.
- No escribe `financialMovements`.
- No escribe `reconciliations`.

## PowerShell para ejecutar la carga

Ejecutar en PowerShell:

```powershell
$ErrorActionPreference = "Stop"

Write-Host "== Buscar repo demoCXOrbia =="
$repo = Get-ChildItem -Path $env:USERPROFILE -Directory -Filter "demoCXOrbia" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $repo) { throw "No encontré demoCXOrbia dentro de tu usuario." }

Set-Location $repo.FullName

Write-Host "== Rama backend =="
git checkout feat/firebase-backend-dev-config-20260627
git pull

Write-Host "== Confirmar script de carga =="
$script = Join-Path $repo.FullName "firebase\client-write-tools\apply-finance-benefits-write-plan-dev.mjs"
if (-not (Test-Path $script)) {
  throw "No encontré el script apply-finance-benefits-write-plan-dev.mjs. Primero debe crearse en la rama."
}

Write-Host "== Instalar dependencias =="
npm --prefix firebase/client-write-tools install

Write-Host "== Confirmar write-plan validado =="
$plan = Join-Path $repo.FullName "firebase\private-output\finance-benefits-write-plan-dry-run.json"
$validation = Join-Path $repo.FullName "firebase\private-output\finance-benefits-write-plan-validation.json"

if (-not (Test-Path $plan)) { throw "No encontré finance-benefits-write-plan-dry-run.json." }
if (-not (Test-Path $validation)) { throw "No encontré finance-benefits-write-plan-validation.json." }

Write-Host "== Validar sintaxis del script =="
node --check firebase/client-write-tools/apply-finance-benefits-write-plan-dev.mjs

Write-Host "== Pedir clave temporal DEV =="
$env:CXORBIA_DEV_CREDENTIAL = Read-Host "Pega la clave temporal DEV usada para el preview"

Write-Host "== Cargar shopperBenefits calculados en Firestore DEV =="
node firebase/client-write-tools/apply-finance-benefits-write-plan-dev.mjs --confirm=PAULA_AUTORIZA_CARGA_BENEFICIOS_DEV_20260629

$report = Join-Path $repo.FullName "firebase\private-output\finance-benefits-dev-apply-result-summary.md"

if (-not (Test-Path $report)) {
  throw "No se generó el reporte de carga DEV."
}

Get-Content $report -Raw -Encoding UTF8 | Set-Clipboard

Write-Host ""
Write-Host "== LISTO =="
Write-Host "Reporte copiado al portapapeles:"
Write-Host $report
Write-Host ""
Write-Host "Pégalo en ChatGPT para continuar."
```

## Salidas esperadas

```text
firebase/private-output/finance-benefits-dev-apply-result.json
firebase/private-output/finance-benefits-dev-apply-result-summary.md
```

El resumen debe indicar:

- Estado `OK`.
- Firebase projectId `cxorbia-backend-dev`.
- Registros escritos.
- Batches ejecutados.
- Alcance exclusivo `shopperBenefits`.

## Si falla

- Si falta el script: hacer `git pull` en la rama correcta.
- Si falta el write-plan: volver a ejecutar el pipeline financiero completo.
- Si falla Auth: revisar la clave temporal DEV, no cambiar código.
- Si falla Rules/Permission: detenerse; no publicar reglas sin nueva autorización.
- Si falla por validación `FAIL`: no forzar.
- Si queda en `REVIEW`: revisar el reporte antes de usar `--allowReview=true`.
