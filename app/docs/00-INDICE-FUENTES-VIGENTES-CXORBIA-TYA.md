# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-18 21:11 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-PROVIDER-HOLD-SYNC-20`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_FROZEN_PASS__GO_LIVE_60__I4A_PROVIDER_HOLD_CONSUMED__DEDICATED_TEST_IDENTITY_AUTH_NEXT__NO_PRODUCTION`

## Orden obligatorio

1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
6. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
7. evidencia activa indicada por Execution State
8. PR #7 vivo y HEAD remoto

Permanecen vigentes documento maestro, addendum canónico de empalme/carril, Academia, patrones reutilizables y antidesvío. Históricos no sustituyen esta capa canónica.

## Carril único

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS` frozen; I4 `0/25` en curso/no puntuado; I5 `0/15` = **60% completado / 40% pendiente**.

## I4-A — verdad viva

Source/readiness ya está cerrado y no se reaudita sin evidencia contradictoria. La búsqueda en evidencia congelada quedó agotada sin identidad test/no histórica reproducible.

Luego se ejecutó la clasificación provider/Auth read-only autorizada: run `32208829234`, job `95937257924`, artifact `9350022534`. Resultado: `HOLD_I4A_TEST_SHOPPER_IDENTITY_NOT_PROVEN__PROVIDER_READONLY_NO_LOGIN`; `1` provider read, `232` principals Auth, `211` Shopper, `0` candidatos con provenance explícita segura, `selected=null`. Login, credenciales, Firestore/profile/history/HR reads y todos los writes/deploy/merge/production permanecieron en cero.

El workflow terminó globalmente en failure solo porque falló la publicación del comentario PR: `PIPELINE_MECHANISM_FAILURE__PR_COMMENT_PERMISSION`. La clasificación provider-backed sí terminó y su operación queda consumida. **No se repite.**

## Siguiente frontera exacta

`NEW_AUTH_REQUIRED_I4A_CREATE_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER__PROTECTED_CONTRACT_NO_LOGIN`

Objetivo: una sola Shopper DEV dedicada, sintética/no histórica, con tenant/proyecto/rol/membership/provenance explícitos mediante el contrato protegido existente. Este gate no incluye login. Requiere autorización expresa antes de provider/Auth/Firestore writes.

Después de PASS de creación, la frontera será una autorización separada para `NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`.

## Circuit breaker documental

- Gate ejecutado => resultado operativo y artifact son verdad aunque falle comentario/status.
- Fallo de publicación => `PIPELINE_MECHANISM_FAILURE`; nunca reejecuta provider consumido.
- Antes de cualquier siguiente gate, los documentos canónicos, request consumido, evidencia y verifier deben compartir este `SYNC_EPOCH` y el verifier debe dar PASS.
- Mismatch => `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`.
- `tools/verify-cxorbia-source-truth-sync.mjs` es obligatorio antes de avanzar.
