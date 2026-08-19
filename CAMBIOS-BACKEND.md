# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 19:58 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-TEST-SHOPPER-PROVENANCE-HOLD-19`  
**Estado:** `I3_FROZEN__GO_LIVE_60__I4A_TEST_SHOPPER_PROVENANCE_HOLD__READONLY_AUTH_NEXT__NO_PRODUCTION`

## Bloque ejecutado

`I4A_RESOLVE_EXISTING_NONHISTORICAL_TEST_SHOPPER_IDENTITY_FROM_FROZEN_EVIDENCE__READONLY_NO_LOGIN`

Tipo: source/read-only. No runtime Shopper, login, credenciales, provider read ni producto write.

## Resultado

`HOLD_I4A_TEST_SHOPPER_PROVENANCE__NONHISTORICAL_STATUS_NOT_REPRODUCIBLY_ESTABLISHED`.

### Causa única

La evidencia congelada/source-safe disponible prueba poblaciones y procedencia mediante fingerprints/agregados, pero no exporta un principal DEV individual cuyo `shopperId`/login/UID y condición sintética/test/no histórica puedan reproducirse. Los IDs de planes source-safe son plantillas no conectadas. Por tanto no se seleccionó ningún Shopper por memoria, nombre, coincidencia visual o inferencia.

### Evidencia exacta revisada

- `backend/config/corte6-shopper-equivalent-universe-source-only-request.json`: source-only, providerReads=false, providerWrites=false, integración de procedencia por universo equivalente.
- `backend/config/corte6-shopper-group-provenance-source-only-request.json`: fingerprints y diagnostic holds; sin PII/secrets.
- `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json`: ejecución histórica source-safe/provider read-only con raw names/logins/emails/passwords/UIDs no exportados.
- `app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-LATEST.json`: population/activity/linking/completeness equivalentes y delta-only provenance, sin individualización de principal.

No se reabrió I3 ni se consultó Firebase/provider en este bloque.

## Seguridad

- Shopper runtime/login/credential selection: `0/0/0`.
- Historical Shopper access: `0`.
- Provider reads/writes: `0/0`.
- Auth/Firestore/Rules/HR/Storage/Make/Gemini/payment writes: `0`.
- User create/password change/reset: `0`.
- Hosting/Cloud Run deploys: `0`.
- Merge/production: `false/false`.

## Archivos tocados

Solo continuidad documental: `app/docs/CXORBIA-EXECUTION-STATE.json`, índice, source lock, checkpoint, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y PR #7. Ningún archivo de producto/adapters/modules/core fue modificado.

## Clasificación

- **Reusable CXOrbia:** provenance explícita y fail-closed para identidades de prueba.
- **Exclusivo TyA:** selección futura del principal DEV apto para I4-A.
- **Claude/prototipo:** sin parche frontend.
- **Academia:** sin cambio; aún no se valida un nuevo comportamiento visible.
- **Sin impacto Claude:** diagnóstico source/read-only.

## Avance Phase A

I1 `15/15`; I2 `20/20`; I3 `25/25`; I4 `0/25` en curso/no puntuado; I5 `0/15` = **60% completado / 40% pendiente**.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_I4A_EXISTING_SHOPPER_IDENTITY_CLASSIFICATION_DEV_READONLY_NO_LOGIN`

Objetivo: una sola clasificación provider/Auth read-only de un principal Shopper ya existente como test/no histórico. Cero login/credenciales/perfil-histórico/writes/deploy/merge/producción. No autorizado todavía.
