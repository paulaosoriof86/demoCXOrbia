# CAMBIOS-BACKEND — ADDENDUM F8 TEMP IAM CAPABILITY HOLD

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F8-TEMP-IAM-AUTH-CAPABILITY-HOLD-01`  
**Phase A:** `100/100`  
**Production Real Readiness:** `95/100`

## Qué se hizo

Se recibió autorización explícita y acotada para conceder temporalmente `roles/secretmanager.viewer` al principal DEV de precheck en `cxorbia-backend-dev`, ejecutar exactamente un readback de metadata de Secret Manager y revocar inmediatamente el rol. La autorización excluyó expresamente payloads de secretos, otras mutaciones provider, deploy y cutover.

Se implementó un ejecutor single-use fail-closed exclusivamente en el harness ya existente `tools/qa/tya-f8-provider-security-quota-readonly.mjs`; no se creó workflow, rama ni PR. El modo sensible quedó ligado al commit exacto `7acaee59deb5c80b9161370b1a8f1e56b7f3ff34` (`execute(f8): temporary secretmanager viewer grant-readback-revoke`).

Run `33118612042`, job `98679566949`, artifact `9665544809`, digest `sha256:1aca6f94f4e47694d92bd541e9653dffd3fb5c3e39d63eb47e299a9fc25409b1`.

## Resultado real

El gate previo a mutación consultó la capacidad IAM y obtuvo `F8_ONE_SHOT_SET_IAM_CAPABILITY_UNAVAILABLE`: la única credencial DEV disponible no posee `resourcemanager.projects.setIamPolicy`. Las rutas alternas de credencial continúan ausentes.

Por diseño fail-closed:
- `grantAttempted=false`;
- provider writes=`0`;
- Secret Manager metadata readback=`NOT_ATTEMPTED`;
- secret payload endpoint/read/export=`0`;
- revoke no fue necesario porque nunca existió binding temporal;
- binding temporal final=`absent`.

El ejecutor temporal fue retirado inmediatamente en commit `c72de8dde23eaeb664eca54c4cee31d3aa40a96a`. La autorización single-use queda consumida y no puede repetirse automáticamente.

Evidencia canónica: `app/docs/evidence/RC15-F8-TEMP-SECRET-METADATA-VIEWER-ATTEMPT-LATEST.json`.

## Qué se preservó

Release F6 intacto: no rebuild, deploy, reimport ni sustitución de SHA. Cloud Run exacto, IAM readback, Service Usage 4/4, quotas 4/4 y Shopper actual read-only continúan PASS. No se tocaron `/app/modules`, `/app/core` ni UI.

## Clasificación obligatoria

- **Reusable CXOrbia:** gate de capacidad antes de IAM, single-use, mínimo privilegio, no secret payload, fail-closed y retiro inmediato del código sensible.
- **Exclusivo cliente/TyA:** scope `cxorbia-backend-dev` y principal DEV de precheck; no se convierte en lógica global.
- **Claude/prototipo:** sin cambio frontend; no corresponde ajuste UI.
- **Academia:** sin cambio funcional de producto; puede documentarse el principio operativo de mínimo privilegio en material técnico interno, no como flujo de usuario final.
- **Sin impacto Claude:** provider capability probe, evidencia, locks y mirrors.

## Estado y pendiente real

Clasificación: `MECHANISM_P0_STOP_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`; `productP0Proven=false`.

Phase A `100/100`; Production Real Readiness `95/100`. El camino crítico queda en `F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE`. No hay autorización activa de provider mutation, deploy ni cutover y no se solicita acción manual de Paula en este corte.
