# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-27  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `HOLD_PROVIDER_SECURITY_IAM_READ_CAPABILITY`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Cerrado y preservado

F5/F6/F7 permanecen terminales. Release F6 `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01` no se reconstruye ni redeploya durante prechecks F8.

Shopper permanece PASS read-only: identidad exacta, 6 visitas propias y HR viva 15 períodos / 30 hojas / 660 visitas / 214 shoppers. El request multirol fallido continúa retirado, consumido y sin replay.

Provider security run `33117362096` cerró causalmente la falsa alarma de variables de entorno: `plaintextSensitiveKeyCount=0`; `TOKEN_SHA256` y `TOKEN_EXPIRES_AT` son metadata derivada. Cloud Run target/revision, IAM, Service Usage y quotas están PASS.

## Bloqueo único inmediato

Secret Manager está `ENABLED`, pero la única credencial DEV disponible no tiene `secretmanager.secrets.list`; las dos rutas alternas históricas no existen actualmente en Actions. No se leyó ni exportó ningún payload de secreto.

Clasificación: `MECHANISM_P0_STOP_PROVIDER_IAM_READ_CAPABILITY`; no P0 de producto.

Evidencia: `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`.

## Siguiente exacto

`WAIT_FOR_EXPLICIT_F8_TEMPORARY_SECRET_MANAGER_METADATA_VIEWER_AUTHORIZATION`.

La autorización debe limitarse a:
1. grant temporal `roles/secretmanager.viewer` al principal DEV de precheck;
2. readback exacto de metadata Secret Manager;
3. revocación del rol inmediatamente después de capturar evidencia.

El rol propuesto es metadata-only y no incluye `secretmanager.versions.access` a payloads. Ninguna otra provider mutation, deploy, data write o cutover queda autorizada por ese permiso.

## Después de cerrar este HOLD

- carga/cuotas/failure injection acotado y no destructivo;
- backup/export + restore verificable antes de mutación de cutover;
- smokes restantes que correspondan al release exacto;
- deployment exacto del manifest únicamente con la autorización específica de cutover.

Seguimiento P2: alert/runbook rehearsal y profundidad/completitud Academia.

## Producto / Claude / Academia

Sin ajuste frontend nuevo; no tocar `/app/modules`, `/app/core` ni UI. Academia no cambia funcionalmente por este bloqueo IAM. El gate legal/confidencialidad sigue siendo aceptación humana.

## Estado seguro

Readiness `95/100`; provider/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=0; deploy/rebuild/reimport/merge=0 en este subbloque.
