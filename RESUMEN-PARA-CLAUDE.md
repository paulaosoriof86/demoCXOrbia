# RESUMEN-PARA-CLAUDE.md

**Fecha:** 2026-08-27  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `HOLD_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Conectado y preservado

El release F6 permanece congelado y no fue reconstruido ni redeployado. Shopper sigue PASS read-only con identidad exacta, 6 visitas propias y HR viva 15 períodos / 30 hojas / 660 visitas / 214 shoppers. Cloud Run exacto, IAM readback, Service Usage y quotas permanecen PASS; `plaintextSensitiveKeyCount=0`.

Paula autorizó el grant temporal mínimo `roles/secretmanager.viewer`, un metadata readback y revocación inmediata. El preflight single-use probó antes de mutar que la única credencial DEV no posee `resourcemanager.projects.setIamPolicy`. El grant no se intentó, provider writes=0, Secret Manager metadata no se leyó y no hubo acceso a payloads. El código temporal de mutación se retiró inmediatamente.

Clasificación: `MECHANISM_P0_STOP_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`, no P0 de producto.

## Para Claude / prototipo

**No hay cambio frontend que Claude deba implementar.** No se modificó `/app/modules`, `/app/core` ni la UI. No inferir pantallas, flujos ni decisiones visuales desde este bloqueo IAM.

Preservar reglas ya vigentes: identidad Shopper exacta; conflictos a revisión; confidencialidad/aceptación legal humana; credenciales de recuperación efímeras.

## Academia

Sin cambio funcional nuevo. El bloqueo IAM y su fail-closed son operación/infraestructura. Los manuales/cursos por rol deben seguir reflejando autenticación exacta, histórico Shopper, resolución segura de identidad y gate legal humano. No convertir evidencia técnica de IAM en instrucción de usuario final.

## Pendiente técnico que no corresponde a Claude

F8 necesita una ruta provider con capacidad IAM suficiente antes de poder cerrar el metadata readback de Secret Manager. La autorización anterior fue single-use y quedó consumida sin mutación; cualquier nuevo intento de IAM requerirá autorización explícita nueva. Luego permanecen carga/cuotas/failure injection acotado, backup/export + restore verificable y cutover exacto bajo gate independiente.

Evidencias:
- `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`;
- `app/docs/evidence/RC15-F8-TEMP-SECRET-METADATA-VIEWER-ATTEMPT-LATEST.json`.
