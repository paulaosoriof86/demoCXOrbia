# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_ROOT_FIX_SOURCE_GATE_HOLD_SELFTEST_OUTPUT_CONTAMINATION__NO_PROVIDER_ATTEMPT__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-SKIP13-ROOT-FIX-SOURCE-GATE-SELFTEST-HARNESS-HOLD-20260807.md`;
3. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
4. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.mjs`;
5. `app/docs/SOURCE-LOCK-C6-SKIP13-FINGERPRINT-NAMESPACE-MISMATCH-STOP-RETRY-20260807.md`;
6. `backend/config/c6-skip13-auth-access-adjudication-request.json` — consumido/deshabilitado;
7. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
8. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
9. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
10. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
11. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
12. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
13. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
14. addenda vigentes y PR #7.

## 2. Estado actual

```text
DirectRunnerDEV=PASS
SKIP13ContractV2=materialized
SKIP13AdjudicatorV2=materialized
SKIP13SourceGate=HOLD_SELFTEST_OUTPUT_CONTAMINATION
providerAttemptThisBlock=false
AuthRows=340
AuthHold=0
AuthExecuted=false
production=false
```

El source gate `31190357507` / job `92905316953` pasó checkout, Node y sintaxis, pero el self-test falló porque `--self-test` fue observado también por `cxorbia-c6-shopper-equivalent-universe.mjs`, contaminando la salida JSON con una línea adicional. No se creó request v2 y no hubo provider read.

El workflow v2 fue retirado en `e269347c8305c6ff60ad182aa6190c9c94abfe62`.

## 3. Siguiente gate

Nueva autorización source-only para corregir únicamente el harness de self-test; PASS estático y detención. Una revalidación provider SKIP13 requerirá autorización posterior distinta.
