# CXOrbia TyA — PHASE A PLAN LOCK · NO DEVIATION

**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Fecha de reconciliación:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-R4`

## 1. Autoridad operativa actual

Este Plan Lock conserva la secuencia Phase A y delega el detalle vivo a `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`. El estado machine-readable obligatorio es `backend/config/cxorbia-phase-a-continuity-lock.json`.

No se crea otro roadmap si una conversación termina, aparece un bloqueo intermedio o falla un gate. Se continúa desde `currentIteration`.

## 2. Estado Phase A

- I1 `15/15`: PASS/FROZEN.
- I2 `20/20`: PASS/FROZEN.
- I3 `25/25`: PASS/FROZEN.
- I4 `25/25`: PASS/FROZEN.
- I5-R1 `2/2`: PASS.
- I5-R2 `3/3`: PASS — `CONTINUITY_DRIFT_AUDIT_PASS`.
- I5-R3 `3/3`: PASS — `CRITICAL_PRODUCT_ACCEPTANCE_PASS`.
- Source funcional: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- Score actual: `93/100`.
- Producción: no autorizada.

## 3. Secuencia obligatoria

`I5-R1 → I5-R2 → I5-R3 → I5-R4 → I5-G1 → I5-G2`

- R1 continuidad/validadores — PASS.
- R2 deriva documental/control-plane — PASS.
- R3 aceptación crítica producto exacto — PASS.
- R4 auditoría post-remediación — **ACTIVA**.
- G1 autorización + cutover — pendiente autorización.
- G2 smoke/hypercare/freeze — pendiente.

No se salta R4. Producción solo se habilita con `ROOT_CAUSE_CLOSED_PASS` y autorización explícita.

## 4. Regla de validación por corte

Cada iteración exige:

`FUENTE/CONTRATO → CAMBIO FOCALIZADO → VALIDADOR/GATE → EVIDENCIA TERMINAL → DOCUMENTACIÓN SINCRONIZADA → FREEZE`

Un PASS técnico aislado no cierra un bloque si documentos vivos, control machine-readable y evidencia no coinciden.

## 5. Anti-bucle persistente

Controles obligatorios:

- `backend/config/cxorbia-consumed-one-shot-gates.json`: un request consumido no puede reactivarse por conversación/documento stale.
- `backend/config/cxorbia-evidence-aliases.json`: una diferencia de nombres no genera rerun.
- `backend/config/cxorbia-r3-critical-product-acceptance.json`: matriz terminal R3; sus PASS no se reejecutan sin nuevo P0.
- `tools/continuity/validate-cxorbia-phase-a-continuity-lock.js`: valida docs canónicos y raíz, ledger, aliases, source y topología.
- La ruta PREPROD/Project Creator está `SUPERSEDED`; no es blocker ni pendiente.

## 6. Root causes

RC01–RC06 están PASS por R1/R2. RC07–RC10 están PASS por R3. R4 debe cerrar RC11 y auditar RC01–RC11 de forma independiente. RC12 se cierra en G2.

## 7. Aceptación crítica R3 — cerrada

`CRITICAL_PRODUCT_ACCEPTANCE_PASS` quedó persistido sobre el mismo artefacto con:

- HR/hoja de ruta viva sin clones/fallback demo/stale.
- Shoppers visibles según scope real.
- Visitas actuales e históricas visibles.
- Finanzas canónicas (`conciliada_pendiente_pago != pagada`; mayo 44/44; junio 2/44 + 42 pendientes + Q451).
- Multirol/RBAC y reload/nueva sesión.
- Same artifact/no rebuild.

Evidencia principal: Staff/Admin run `32342457328` / artifact `9396828201`; Cliente run `32400495121` / artifact `9418300899`; Shopper exacto congelado; `PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`; Hosting same-build run `32328316954` / artifact `9392151808`; matriz `backend/config/cxorbia-r3-critical-product-acceptance.json`.

Los HOLD R3 previos fueron harness stale con `productP0Proven=false` y quedaron consumidos. No abren producto.

## 8. Auditoría definitiva R4 — activa

R4 debe validar:

1. RC01–RC10 siguen PASS y sin contradicción.
2. RC11 `SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT` pasa.
3. mismo source `f9802f...`, no rebuild.
4. rollback listo/revalidable.
5. continuity/control-plane completo y validadores PASS.
6. cero P0 nuevo.
7. cutover y business/data writes siguen separados y no autorizados.

Única salida para avanzar: `ROOT_CAUSE_CLOSED_PASS` → 95/100. Si falla, corrección focal de la causa concreta y repetición R4; no nuevo plan.

## 9. Continuidad independiente de conversación

Toda sesión nueva lee índice → continuity lock → ledger one-shot → alias registry → matriz R3 → Execution State → Source Lock → Checkpoint → Plan → contrato/evidencia → documentos raíz → PR #7/HEAD. Si discrepan: `CONTINUITY_DRIFT_BLOCKED`; reconciliar control-plane y no reabrir bloques cerrados sin P0.

## 10. Conteo bounded

- R1–R3 ya PASS = 93/100.
- R4 = cierre/auditoría de causas raíz = 95/100.
- Producción en G1, sujeto a R4 PASS + autorización explícita = 98/100.
- Cierre 100/100 en G2.

Una conversación nueva, explicación o nomenclatura distinta no crea una iteración adicional.

## 11. Prohibiciones

- No nueva candidata/rama/PR/workflow por rutina.
- No nuevo PREPROD ni Project Creator por ruta retirada.
- No reabrir frozen sin P0 reproducible.
- No rebuild antes del cutover.
- No producción sin `ROOT_CAUSE_CLOSED_PASS` + autorización explícita.
- Cutover/deploy no autoriza business/data writes.
- No fallback demo/stale ni conflictos HR/plataforma resueltos silenciosamente.
- No declarar progreso sin salida terminal.

Epoch anterior preservado como historia: `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`, `currentIteration=I5-R3`.
