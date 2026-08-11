# CAMBIOS-BACKEND — C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE__A_OWNER_ANCHOR_AND_PROJECT_ENTITLEMENT_REQUIRED__BC_OWNER_ANCHOR_PROJECT_ENTITLEMENT_CREDENTIAL_INPUT_REQUIRED__D_PRESERVED_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## Hecho

- Se trabajó exclusivamente A `1acd...`, B `2c4d...` y C `542...`.
- Se agotaron fuentes source-safe relevantes de ownership, inventario/handoff/import/continuidad de credenciales, claims, RBAC/taxonomía y runtime de Auth.
- A quedó con `OWNER_ANCHOR_REQUIRED` + `PROJECT_ENTITLEMENT_REQUIRED`; su único credential path canónico `super` no se puede asociar por unicidad de rol.
- B y C quedaron con `OWNER_ANCHOR_REQUIRED` + `PROJECT_ENTITLEMENT_REQUIRED` + `CREDENTIAL_INPUT_REQUIRED`; no hay canónicos importados `admin` ni `ops`.
- No se generó expected-claims digest porque ningún target quedó resuelto.
- D no se reabrió y conserva `REPAIR_PLAN_READY`.

## Archivos creados

- `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.json`;
- `app/docs/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.md`;
- `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-REQUIRED-20260810.md`;
- este addendum;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-20260810.md`;
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-20260810.md`;
- `app/docs/ACADEMIA-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-20260810.md`;
- `app/docs/PHASE-A-TRACKER-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-20260810.md`.

## Archivos actualizados

- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `CAMBIOS-BACKEND.md`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- PR #7 metadata/body al cierre.

## Incidente de herramienta sin mutación

Una llamada `update_file` a este addendum fue rechazada con HTTP 409 por SHA no vigente. Falló antes de commit; se recuperó el blob SHA actual mediante `fetch_file` y se actualizó correctamente. Sin efecto en provider, Auth, datos, frontend, deploy o producción.

## Seguridad

Provider reads 0; Auth/IAM/Firestore/HR/Rules/Storage writes 0; PREWRITE/Activation/smoke/repair false; deploy/merge/production 0/false/false. Solo hubo commits documentales source-safe.

## Clasificación

- **Reusable CXOrbia:** identidad owner, scope y credencial se resuelven por separado y sin inferencia.
- **Exclusivo cliente:** tres grupos staff TyA.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** principio interno de least privilege.
- **Sin impacto Claude:** reconciliación y source lock.
