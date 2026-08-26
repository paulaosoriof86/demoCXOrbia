# RC15 — MAPA DE EJECUCIÓN M1–M9 BAJO EL MASTER PLAN CONGELADO

**Fecha:** 2026-08-26
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`
**MASTER_PLAN_VERSION:** `1.1.0`
**MASTER_PLAN_STATUS:** `FROZEN`
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`
**Autoridad:** subordinada al master plan; no crea plan paralelo.

## Regla anti-bucle

M1–M9 es secuencia finita. No se abre Tramo 15, Batch 4 ni auditoría indefinida. Un hallazgo nuevo dentro del universo bloqueado se resuelve focalmente; drift fuera del universo requiere STOP con evidencia y no crea automáticamente otra metodología.

## M1 — mecanismo, estado canónico e inventario F0

Estado: `CLOSED_PASS`. No se reabre sin drift demostrado.

## M2 — cierre finito F0

Estado: `CLOSED_PASS_4_OF_4`, 142 clasificados, 0 write-capable sin clasificar.

## M3 — F1 + F2 · TERMINAL 13

Estado actual: 17/30 tombstoneados; quedan 13 IDs exactos. Resolverlos individualmente y cerrar M3 en una única frontera `M3_TERMINAL_13_CLOSURE`. `M3_FINITE_QUEUE_BATCH_1` y Batch 2 son históricos cerrados. Batch 4 está prohibido.

## M4 — F3 · mecanismo provider + carril G2-B

Reparar/certificar `PROVIDER_PROMOTION_MECHANISM_V1`: release tuple inmutable, autorización estructurada, provider mutation lease separado, pre/post readback, idempotencia, rollback y taxonomía causal. Luego cerrar `G2B_RECOVERY_LANE_PASS`. Provider mutations=0 en M4.

## M5 — F4

Único recovery G2-B one-shot, solo con autorización explícita vigente y budgets del master plan.

## M6 — F5 + F6

Aceptación sintética E2E en plataforma canónica, cleanup, post-clean readback y freeze inmutable Phase A.

## M7 — F7

Readiness integral sobre release exacto: seguridad, aislamiento, migración, E2E/regresión, carga, rollback/restore, observabilidad, Claude y Academia.

## M8 — F8

Cutover a producción, solo con autorización específica y gates previos PASS.

## M9 — F9

Aceptación postproducción y cierre de ventana formal. F10 continúa como operación permanente.

## Invariantes

- `PHASE_A=98/100` y `PRODUCTION_REAL_READINESS=69/100` hasta cerrar gates correspondientes.
- Sin nueva rama/PR, sin frontend desde backend.
- Sin Firestore/Auth/Storage/HR/Make/Gemini/pagos/deploy salvo su fase y autorización.
- G2-B no retry/replay antes de M4/M5.
- Master plan V1.1 y su hash prevalecen.
