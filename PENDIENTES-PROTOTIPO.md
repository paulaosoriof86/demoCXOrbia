# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-27  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `IN_PROGRESS_READONLY_PRECHECKS`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Cerrado y preservado

F5/F6/F7 permanecen terminales. Release F6 `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01` no se reconstruye ni redeploya durante prechecks F8.

El defecto del predeploy `firebase-admin` observado históricamente quedó reparado y el predeploy actual pasa. El hold Shopper del intento F8 `33107287460` también quedó diagnosticado y resuelto como **gap del harness de lifecycle de credencial efímera**, no como P0 de producto.

Run de recertificación exacta `33109500671`: PASS read-only del Shopper histórico actual, sin password reset/update, con Auth/claims/profile/membership/crosswalk/historia exactos, 6 visitas propias y HR viva 15 períodos / 30 hojas / 660 visitas / 214 shoppers. Evidencia: `app/docs/evidence/RC15-F8-SHOPPER-HARNESS-RECOVERY-LATEST.json`.

El request multirol fallido quedó retirado: `enabled=false`, consumido, no replay y sin retry automático.

## Pendiente inmediato del camino crítico F8

Continuar únicamente prechecks read-only mientras no exista autorización explícita para mutación:

1. provider IAM/secrets/cuotas readback fresco;
2. carga/cuotas/failure injection acotado y no destructivo;
3. demostrar plan/estado de backup-export + restore verificable antes de cualquier cutover mutation;
4. determinar y ejecutar de forma read-only el smoke fresco Staff/Admin y Client sin volver a depender del password Shopper efímero;
5. preparar el gate final de deployment exacto del manifest, provider readbacks y rollback, pero **no ejecutarlo** sin autorización expresa de mutación.

Seguimiento P2: alert/runbook rehearsal y profundidad/completitud Academia.

## Producto / Claude

Sin ajuste frontend nuevo. No tocar `/app/modules`, `/app/core` ni UI por este hallazgo. El gate legal/confidencialidad debe permanecer visible cuando corresponda y su aceptación no se automatiza.

## Academia

Pendiente alinear manuales/cursos por rol con autenticación exacta, histórico Shopper, resolución de identidad, confidencialidad y credenciales de recuperación efímeras. No confundir prueba técnica con aceptación legal humana.

## Estado seguro

Readiness continúa `95/100`; F8 no está cerrado. Provider/data/Auth/HR/Storage/Rules/pagos/Make/Gemini writes=0; deploy/rebuild/reimport/merge=0 en este subbloque.

**Siguiente exacto:** `F8_CONTINUE_READONLY_PRECHECKS_NO_PROVIDER_MUTATION`.
