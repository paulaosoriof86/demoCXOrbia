# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-19 10:04 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-DEDICATED-TEST-SHOPPER-PASS-21`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_FROZEN_PASS__GO_LIVE_60__I4A_DEDICATED_TEST_SHOPPER_PASS__VISIBLE_SMOKE_AUTH_NEXT__NO_PRODUCTION`

## Orden obligatorio

1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
6. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
7. evidencia activa indicada por Execution State
8. PR #7 vivo + HEAD remoto + delta desde el último HEAD canónico

Permanecen vigentes reglas maestras, addendum canónico de empalme/carril, Academia, patrones reutilizables y antidesvío. Históricos no sustituyen esta capa.

## CONTINUITY_FAST_PATH

No reconstruir PR #7 completo, miles de commits/Actions ni documentos históricos cuando la capa canónica esté consistente. Un objetivo técnico real por iteración; un artifact/decisión; una reconciliación atómica; sin cadenas `finalize/close/seal`. Los workflows legacy no relacionados son ruido CI.

## Carril único

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS` frozen; I4 `0/25` en curso/no puntuado; I5 `0/15` = **60% completado / 40% pendiente**.

## I4-A — verdad viva

La búsqueda de una identidad existente segura quedó agotada y no se repite. Se autorizó y materializó una única Shopper DEV dedicada sintética/no histórica mediante el contrato protegido. Verificación provider-backed read-only:

- run `32273818536`, job `96136329240`, artifact `9373197946`;
- decision `PASS_I4A_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER_VERIFIED_READONLY_NO_LOGIN`;
- claims, profile, membership, crosswalk, provider ACK y provenance explícita: `true`;
- identidad final dedicada: exactamente `1`;
- login `0`; Historical Shopper `false`; HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción `0/false`;
- no UID/email/credenciales crudos exportados.

Evidencia durable: `app/docs/evidence/I4A-DEDICATED-NONHISTORICAL-DEV-TEST-SHOPPER-PASS-LATEST.json`.

## Siguiente frontera exacta

`NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`

No está autoautorizado. Usará exclusivamente la identidad sintética dedicada para una sola prueba visible DEV de documentos/instrucciones, disponibles, postulación/estado, notificaciones y presentación de certificación nueva.

## Circuit breaker

Gate consumido no se reejecuta. Antes del siguiente gate, todas las fuentes canónicas y el verifier deben compartir este `SYNC_EPOCH`. Mismatch => `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`.
