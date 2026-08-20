# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R4-ROOT-CAUSE-CLOSED-PASS-46`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Estado:** `I5_R4_PASS__I5_G1_PENDING_AUTHORIZATION__95_5`  
**currentIteration:** `I5-G1`

## 1. Orden obligatorio vigente

Leer siempre en este orden antes de responder o actuar:

1. `backend/config/cxorbia-phase-a-continuity-lock.json` — autoridad machine-readable y `currentIteration`.
2. `backend/config/cxorbia-r4-root-cause-closure.json` — recibo terminal R4; un corte de conversación no invalida este PASS.
3. `backend/config/cxorbia-consumed-one-shot-gates.json` — requests consumidos que no pueden reactivarse.
4. `backend/config/cxorbia-evidence-aliases.json` — equivalencias históricas que no crean reruns.
5. `backend/config/cxorbia-r3-critical-product-acceptance.json` — matriz terminal de aceptación crítica R3.
6. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`.
7. `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`.
8. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
9. `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
10. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
11. `backend/config/cxorbia-production-promotion-contract.json`.
12. `backend/config/cxorbia-production-promotion-gate-evidence.json`.
13. `SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md` y addenda maestras vigentes.
14. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
15. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.
16. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit`.

PR #7 es **mirror no autoritativo**. Si el cuerpo del PR queda atrasado por corte de sesión, se reconcilia metadata/control-plane; nunca se reabre una iteración cerrada. El HEAD se resuelve dinámicamente y no desde un SHA escrito en una conversación o body antiguo.

Validadores obligatorios:

- `tools/continuity/validate-cxorbia-phase-a-continuity-lock.js`;
- `tools/production/validate-production-promotion-gates.js`.

## 2. Regla anti-pérdida y anti-bucle

El plan no se reconstruye desde la conversación. El siguiente bloque se obtiene exclusivamente de `backend/config/cxorbia-phase-a-continuity-lock.json.currentIteration`.

Un PASS terminal persiste aunque la conversación se interrumpa. Un request consumido permanece consumido. Una diferencia de nombre de evidencia, PR body, documento espejo o respuesta incompleta nunca autoriza rerun.

Si dos superficies contradicen `SYNC_EPOCH`, `PLAN_ID`, `currentIteration`, topología productiva o source lock funcional: `CONTINUITY_DRIFT_BLOCKED` y reconciliar control-plane únicamente. No reabrir I1–I4 ni R1–R4 sin un `P0_PROVEN` nuevo y reproducible.

## 3. Estado vivo

- I1–I4: `PASS/FROZEN`, 85/85.
- I5-R1: `PASS`, 2/2.
- I5-R2: `PASS`, 3/3 — `CONTINUITY_DRIFT_AUDIT_PASS`.
- I5-R3: `PASS`, 3/3 — `CRITICAL_PRODUCT_ACCEPTANCE_PASS`.
- I5-R4: `PASS`, 2/2 — `ROOT_CAUSE_CLOSED_PASS`.
- Score formal: **95/100**.
- Iteración activa: `I5-G1_EXPLICIT_CUTOVER_AND_PRODUCTION_PROMOTION` — `PENDING_AUTHORIZATION`.
- Producción autorizada: **NO**.
- Source funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

## 4. Cierre terminal I5-R4

Autoridad: `backend/config/cxorbia-r4-root-cause-closure.json`.

R4 verificó:

- RC01–RC10 continúan PASS sin contradicción;
- RC11 `SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT` = PASS;
- comparación `f9802f... → d300a...`: 131 commits y **0 runtime product files changed** en los scopes de producto congelados;
- GitHub Actions run `32403468692`, job `96536915288`: `GO_CANONICAL_CONTINUITY_LOCKED_RUNTIME_UNCHANGED`, `CONTINUITY_LOCK_PASS`, `runtimeChangedCount=0`;
- rollback permanece listo/revalidado antes de cutover;
- no se demostró P0 nuevo;
- `EXPLICIT_CUTOVER_AUTHORIZATION=PENDING`;
- deploy/cutover y business/data writes continúan no autorizados.

La evidencia de promoción queda en `READY_FOR_EXPLICIT_AUTHORIZATION_AFTER_ROOT_CAUSE_CLOSURE` con 5/5 gates técnicos PASS y autorización humana pendiente.

## 5. Evidencia terminal I5-R3 preservada

Los ocho criterios R3 permanecen FROZEN_REUSE:

- `ROADMAP_LIVE_NO_CLONES`;
- `SHOPPERS_VISIBLE_EXPECTED_SCOPE`;
- `VISITS_CURRENT_AND_HISTORY_VISIBLE`;
- `FINANCE_CANONICAL_SEMANTICS`;
- `MULTIROLE_SCOPE_PASS`;
- `RELOAD_SESSION_PASS`;
- `NO_DEMO_OR_STALE_FALLBACK`;
- `SAME_ARTIFACT_PASS`.

Evidencia focal: Staff/Admin run `32342457328` / artifact `9396828201`; Shopper exacto congelado; Cliente run `32400495121` / artifact `9418300899`; all-role runtime PASS; Finanzas mayo 44/44 y junio 2/44 + 42 pendientes + Q451; Hosting same-build run `32328316954` / artifact `9392151808`.

## 6. Topología productiva canónica

`PROMOTE_EXISTING_CLEAN_PROJECT`:

- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev` / `us-central1`.

`cxorbia-preprod-20260819` está `SUPERSEDED` y no se crea. `cxorbia-tya-dev-260729-c4` es sandbox. `tya-plataforma` permanece legacy intacto hasta cutover explícito.

## 7. Siguiente bloque exacto — I5-G1

No ejecutar producción automáticamente. `I5-G1` requiere **autorización explícita de Paula posterior a `ROOT_CAUSE_CLOSED_PASS`**.

Al autorizarse, el alcance permitido es únicamente cutover/promoción del **mismo artefacto** bajo `PROMOTE_EXISTING_CLEAN_PROJECT`, con rollback preparado. No rebuild. La autorización de cutover no autoriza business/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes.

Salida G1: `PRODUCTION_CUTOVER_EXECUTED` → **98/100**.

## 8. Plan bounded restante

1. `I5-G1` — 3 pts — autorización explícita + cutover mismo artefacto → 98%.
2. `I5-G2` — 2 pts — smoke/hypercare/rollback/freeze → 100%.

No se agregan iteraciones por una conversación nueva, respuesta incompleta, demora, nomenclatura distinta o PR body stale.

## 9. Circuit breaker

- No nueva candidata/rama/PR/workflow por rutina.
- No PREPROD adicional ni Project Creator por ruta descartada.
- No reabrir I1–I4 ni R1–R4 sin `P0_PROVEN` nuevo.
- No rebuild antes del cutover.
- No producción sin autorización explícita G1.
- Cutover no autoriza business/data writes.
- No fallback silencioso demo/stale.
- No overwrite silencioso de conflictos HR/plataforma.
- No declarar avance sin evidencia terminal.

## 10. Mantenimiento

Después de cada salida terminal: persistir primero evidencia machine-readable; actualizar continuity lock; reconciliar documentos vivos y PR mirror; ejecutar/readback de gates; solo entonces avanzar `currentIteration`. Si la sesión se corta a mitad, la siguiente sesión reconcilia lo pendiente desde el recibo terminal y **no repite la iteración**.

Epoch anterior preservado: `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45` / `currentIteration=I5-R4`.
