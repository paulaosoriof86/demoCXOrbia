# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2B-P0-PROVIDER-A-PROVEN-RECOVERY-PREPARED-49`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Estado:** `I5_G2A_PASS__G2B_PROVIDER_A_PROVEN__RECOVERY_REARM_AUTH_REQUIRED__98_2`  
**currentIteration:** `I5-G2`

## Orden obligatorio
1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `app/docs/evidence/I5-G2B-PROVIDER-READONLY-RECONCILIATION-LATEST.json`.
3. `backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-request.json`.
4. `backend/config/cxorbia-g2a-production-readonly-smoke.json`.
5. `backend/config/cxorbia-g2-live-in-platform-acceptance-plan.json` y `backend/config/cxorbia-g2b-live-synthetic-acceptance-request.json`.
6. `backend/config/cxorbia-g1-production-cutover.json` y `backend/config/cxorbia-r4-root-cause-closure.json`.
7. `backend/config/cxorbia-consumed-one-shot-gates.json`, `backend/config/cxorbia-evidence-aliases.json` y `backend/config/cxorbia-r3-critical-product-acceptance.json`.
8. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
9. `app/docs/CAMBIOS-BACKEND-ADDENDUM-G2B-PROVIDER-RECONCILIATION-RECOVERY-20260820.md`, `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-G2B-PROVIDER-RECONCILIATION-20260820.md` y `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-G2B-PROVIDER-RECONCILIATION-20260820.md`.
10. Execution State, Source Lock, Plan Operativo, Phase A Lock, promotion contract/evidence, Go-Live Tracker, documentos base `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, addenda de Academia, PR #7 y HEAD vivo.

PR #7 es mirror no autoritativo. HEAD se resuelve dinámicamente. Ante contradicción prevalecen el continuity lock, la evidencia provider-backed más reciente y este índice; no se reabren bloques PASS/FROZEN.

## Estado vivo
I1–I4, R1–R4 y G1 PASS/FROZEN. G2-A PASS. Phase A permanece **98/100**.

El P0 G2-B `G2B_CANONICAL_WRITE_PATH_DISABLED_OR_UNROUTED` fue corregido en source, pero el intento one-shot `c746bdf068edf1322b7c9a5e497ea5aff13e6b58` no materializó ningún deploy de la corrección.

La reconciliación read-only directa de proveedores cerró la incertidumbre con:

`A_NO_G2B_PROVIDER_DEPLOY_OBSERVED`

Pruebas: Cloud Run sigue `cxorbia-live-hr-dev-00010-n78`; Hosting no tiene release posterior al execute; la ruta G2-B todavía responde con el runtime anterior.

## Único frente restante — recuperación G2-B
Existe un recovery request preparado pero **deshabilitado**. No existe recovery execute. El siguiente gate es:

`PAULA_I5_G2B_P0_WRITEPATH_RECOVERY_REARM`

Hasta autorización expresa continúan en 0: Cloud Build de recuperación, Cloud Run deploy, Hosting deploy, Firestore/Auth/Storage, HR externa, datos/credenciales reales, pagos, Rules, Make, Gemini y merge.

Solo `RECOVERY_PASS_FULL` habilita el `STAGE_AND_TEST` sintético ya autorizado. La aceptación seguirá siendo en la misma plataforma, con `CXORBIA_E2E_SYNTH_*`, escenario visible para Paula antes de cleanup y post-clean readback obligatorio.

## Anti-bucle
No crear G3, otra candidata, rama, PR, workflow, PREPROD ni metodología. No repetir c746 ni el one-shot original. No retry automático. Cualquier recuperación parcial/no-side-effect debe detenerse y volver a decisión explícita después de reconciliar proveedor.
