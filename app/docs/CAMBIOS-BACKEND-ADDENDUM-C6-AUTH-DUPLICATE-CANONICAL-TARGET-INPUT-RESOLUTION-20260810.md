# CAMBIOS-BACKEND — C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE__A_OWNER_ANCHOR_AND_PROJECT_ENTITLEMENT_REQUIRED__BC_OWNER_ANCHOR_PROJECT_ENTITLEMENT_CREDENTIAL_INPUT_REQUIRED__D_PRESERVED_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## Hecho

- Se trabajó exclusivamente A `1acd...`, B `2c4d...` y C `542...`.
- Se agotaron fuentes source-safe relevantes de ownership, credenciales, claims, RBAC/taxonomía y runtime de Auth.
- A: `OWNER_ANCHOR_REQUIRED` + `PROJECT_ENTITLEMENT_REQUIRED`; credential path `super` condicionado a owner proof independiente.
- B/C: `OWNER_ANCHOR_REQUIRED` + `PROJECT_ENTITLEMENT_REQUIRED` + `CREDENTIAL_INPUT_REQUIRED`.
- D no se reabrió y conserva `REPAIR_PLAN_READY`.
- No se generaron expected-claims digests porque ningún target A–C quedó resuelto.

## Archivos del bloque

Creados: evidencia, reporte, source lock y addenda de CAMBIOS, Claude, Pendientes, Academia y Phase A tracker con sufijo `C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-20260810`.

Actualizados: checkpoint, índice vigente, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md`.

## Incidentes de herramienta

Una llamada `update_file` fue rechazada HTTP 409 antes de commit. Después se produjeron seis commits documentales redundantes sobre este mismo addendum durante un error de cierre de herramienta. No hubo provider/Auth/data/frontend/deploy/production effect. Regla correctiva: este addendum queda congelado; no volver a tocarlo en el bloque actual.

## Seguridad

Provider reads 0; Auth/IAM/Firestore/HR/Rules/Storage writes 0; PREWRITE/Activation/smoke/repair false; deploy/merge/production 0/false/false. Solo commits documentales source-safe.

## Clasificación

- **Reusable CXOrbia:** identidad owner, scope y credencial se resuelven por separado y sin inferencia.
- **Exclusivo cliente:** tres grupos staff TyA.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** least privilege.
- **Sin impacto Claude:** reconciliación/source lock.
