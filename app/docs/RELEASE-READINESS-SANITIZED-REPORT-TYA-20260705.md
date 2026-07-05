# Release readiness sanitized report TyA

Fecha: 2026-07-05

## Objetivo

Crear el bloque que convierte el `release-readiness-snapshot-preview-validator` en un reporte humano, sanitizado y accionable para Phase A.

Este bloque no ejecuta la cadena local ni inventa resultados. Deja preparado el generador para cuando exista un reporte local en `_diagnosticos/tya-release-readiness`.

## Archivos agregados

1. `app/contracts/release-readiness-sanitized-report-phase-a.tya.contract.json`
   - Contrato del reporte sanitizado.
   - Define entrada permitida: `tya-release-readiness-snapshot-preview-validator`.
   - Define secciones requeridas.
   - Define reglas de redaccion y redaccion de datos.
   - Mantiene decision de produccion bloqueada hasta corregir P0 frontend y auditar nueva candidata.

2. `tools/migration/tya-release-readiness-sanitized-report.mjs`
   - Generador Node.
   - Lee el JSON del snapshot validator.
   - Produce Markdown o JSON summary.
   - Agrupa por readiness area, gates, validadores, blockers y manual review.
   - Redacta URLs, emails y numeros largos.
   - No incluye raw fixtures, stdout/stderr, payloads externos ni datos sensibles.

3. `tools/migration/tya-release-readiness-sanitized-report-local.ps1`
   - Wrapper PowerShell local.
   - Recibe `-SnapshotReportPath`.
   - Genera `05-release-readiness-sanitized-report-*.md` o `.json` en `_diagnosticos/tya-release-readiness`.

## Ejecucion local recomendada

Despues de correr la cadena:

```powershell
powershell -ExecutionPolicy Bypass -File tools/migration/tya-synthetic-pack-release-readiness-local-chain.ps1
```

Tomar el archivo `04-release-readiness-snapshot-report-*.json` generado localmente y ejecutar:

```powershell
powershell -ExecutionPolicy Bypass -File tools/migration/tya-release-readiness-sanitized-report-local.ps1 -SnapshotReportPath "_diagnosticos/tya-release-readiness/04-release-readiness-snapshot-report-YYYYMMDD_HHMMSS.json"
```

Para JSON summary:

```powershell
powershell -ExecutionPolicy Bypass -File tools/migration/tya-release-readiness-sanitized-report-local.ps1 -SnapshotReportPath "_diagnosticos/tya-release-readiness/04-release-readiness-snapshot-report-YYYYMMDD_HHMMSS.json" -Format json_summary
```

## Secciones del reporte

El reporte generado incluye:

1. Executive status.
2. Snapshot metadata.
3. Gate status.
4. Area summary.
5. Issues and warnings.
6. Next actions para frontend/Claude.
7. Next actions backend.
8. Production decision.
9. Safety.

## Politica de seguridad

El reporte sanitizado no debe incluir:

- cuerpos raw de fixtures;
- stdout/stderr completo;
- payloads de proveedores;
- correos reales;
- telefonos o WhatsApp reales;
- DPI/documentos/bancos;
- tokens/credenciales;
- URLs privadas o signed URLs;
- adjuntos.

## Decision de produccion

El reporte siempre debe mantener una decision conservadora:

- no source lock;
- no production ready;
- no deploy;
- no merge;
- no import real;
- no proveedores reales;
- no pagos reales;

hasta que Claude entregue candidata correctiva P0 con delta real y esa candidata sea auditada.

## Relacion con V87

La auditoria V87 confirmo que no hubo delta real contra V86 y que siguen vivos P0 de honestidad operativa. Por eso el reporte debe mostrar `prototype_audit` como blocker mientras no haya correccion.

## Siguiente bloque recomendado

Preparar una matriz acumulada para Claude y produccion controlada, separando:

- P0 frontend obligado;
- backend preview listo;
- backend pendiente de ejecucion local;
- P1 post-P0;
- Academia posterior;
- bloqueo de source lock.
