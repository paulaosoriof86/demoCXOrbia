# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-27  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `HOLD_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Cerrado y preservado

F5/F6/F7 permanecen terminales. Release F6 `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01` sigue congelado. Shopper runtime exacto, Cloud Run exacto, IAM readback, Service Usage y quotas permanecen PASS.

## Resultado de la autorización IAM temporal

La autorización fue ejecutada bajo gate single-use en run `33118612042`. Antes de cualquier mutación, el preflight comprobó que la única credencial DEV disponible no posee `resourcemanager.projects.setIamPolicy`.

Por tanto:
- grant `roles/secretmanager.viewer`: no intentado;
- provider writes: 0;
- Secret Manager metadata readback: no ejecutado;
- secret payload access/read/export: 0;
- revoke: no requerido porque nunca existió binding temporal;
- código temporal de mutación: retirado inmediatamente;
- autorización single-use: consumida, sin replay automático.

Evidencia: `app/docs/evidence/RC15-F8-TEMP-SECRET-METADATA-VIEWER-ATTEMPT-LATEST.json`.

Clasificación: `MECHANISM_P0_STOP_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`; no P0 de producto.

## Pendiente inmediato del camino crítico F8

`F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE`.

No repetir la autorización consumida ni ampliar permisos por inferencia. Si aparece una ruta provider IAM-capable, cualquier nuevo grant/readback/revoke requerirá autorización explícita nueva. No hay autorización de deploy ni cutover.

Después de cerrar este HOLD siguen: carga/cuotas/failure injection acotado, backup/export + restore verificable, smokes restantes y deployment exacto del manifest bajo gate independiente.

Seguimiento P2: alert/runbook rehearsal y profundidad/completitud Academia.

## Producto / Claude / Academia

Sin ajuste frontend nuevo; no tocar `/app/modules`, `/app/core` ni UI. Academia no cambia funcionalmente por este bloqueo IAM. El gate legal/confidencialidad sigue siendo aceptación humana.

## Estado seguro

Readiness `95/100`; provider/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=0; deploy/rebuild/reimport/merge=0 en el intento autorizado.
