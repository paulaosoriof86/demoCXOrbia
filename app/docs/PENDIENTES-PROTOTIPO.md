# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-28  
**Estado:** `PHASE_A_100__PROD_READINESS_95__F8_IAM_METADATA_P1_NONBLOCKING__PRECUTOVER_READONLY_NEXT`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5 y F6 permanecen terminales. F7 permanece `GO_WITH_WARNINGS_NO_P0`.

Phase A=`100/100`; Production Real Readiness=`95/100`; release congelado=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

No reabrir synthetic lifecycle, F7, R24/Corte 4, no rebuild/redeploy del release congelado, no reimportar datos y no crear nueva candidata por rutina.

## F8 — corrección del pendiente real

`F7-P1-002` permanece P1: el listado de metadata Secret Manager no está disponible al principal DEV por falta de `secretmanager.secrets.list`. F8 ya confirmó el resto del readback material de seguridad del release exacto: Cloud Run/revisión, IAM de Cloud Run, ausencia de secretos sensibles en plaintext, cero secret-backed env, APIs habilitadas y cuotas PASS. Payloads de secretos no se leyeron ni exportaron.

Por ello **ya no está pendiente construir un puente Owner/IAM**. La identidad humana `roles/owner` observada se conserva como evidencia administrativa, pero no se debe crear WIF, service account, credencial, binding o workflow para resolver un warning no bloqueante.

Evidencia de reconciliación: `app/docs/evidence/RC15-F8-IAM-METADATA-NONBLOCKING-RECONCILIATION-LATEST.json`.

## Próximo gate real

`F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK`.

Debe ser acotado, no destructivo, contra el release congelado y sin escritura de datos/provider. Su objetivo es cerrar la parte restante de `F7-P1-003` después de que cuotas ya quedaron PASS.

## Frontera posterior que sí requerirá autorización

- `F7-P1-004`: backup/export + restore verificable antes de cutover cuando implique mutación/provider storage.
- F8 cutover exacto: deployment/readbacks/smoke/rollback conforme al manifest congelado.

No ejecutar esas mutaciones por inferencia de una autorización anterior. Requieren autorización explícita específica vigente.

## Warnings no bloqueantes restantes

1. P1 `F7-P1-002`: metadata Secret Manager no listable; documentado, no bloquea.
2. P1 `F7-P1-003`: bounded load/failure check pendiente.
3. P1 `F7-P1-004`: backup/export + restore verification pendiente antes de cutover.
4. P2: alert delivery/runbook rehearsal.
5. P2: completar auditoría profunda de contenido Academia por rol/módulo.

## Reglas vigentes

- prototipo manda; backend no rediseña `/app/modules` ni `/app/core`;
- release F6 inmutable mientras no exista gate que autorice sustitución;
- base nueva y limpia; legacy solo export/import útil;
- multi-tenant `tenantId` + `projectId`;
- Cinépolis proyecto configurable, no lógica global;
- conflictos HR/identidad no se sobrescriben silenciosamente;
- Make/Gemini/pagos solo con gate real;
- datos sensibles protegidos y fuera del repo;
- P1/P2 se documentan y no bloquean sin evidencia de P0;
- Academia profunda, editable, por rol/módulo y sincronizada con cambios reales.

## Acción actual

`F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK` — sin grant, deploy, cutover ni intervención manual solicitada.
