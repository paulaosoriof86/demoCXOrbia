# CXOrbia TyA — PHASE A PLAN LOCK · NO DEVIATION

**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Fecha de reconciliación:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-R3`

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
- Source funcional: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- Score actual: `90/100`.
- Producción: no autorizada.

## 3. Secuencia obligatoria

`I5-R1 → I5-R2 → I5-R3 → I5-R4 → I5-G1 → I5-G2`

- R1 continuidad/validadores — PASS.
- R2 deriva documental/control-plane — PASS.
- R3 aceptación crítica producto exacto — **ACTIVA**.
- R4 auditoría post-remediación — pendiente.
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
- `tools/continuity/validate-cxorbia-phase-a-continuity-lock.js`: valida docs canónicos y raíz, ledger, aliases, source y topología.
- La ruta PREPROD/Project Creator está `SUPERSEDED`; no es blocker ni pendiente.

## 6. Root causes

RC01–RC06 están PASS. R3 debe cerrar RC07–RC10. R4 cierra/verifica RC11 y audita RC01–RC11. RC12 se cierra en G2.

## 7. Aceptación crítica R3

Debe quedar evidencia terminal sobre el mismo artefacto:

- HR/hoja de ruta viva sin clones/fallback demo/stale.
- Shoppers visibles según scope real.
- Visitas actuales e históricas visibles.
- Finanzas canónicas (`liquidada != pagada`; mayo 44/44; junio 2/44 + 42 pendientes + Q451).
- Multirol/RBAC y reload/nueva sesión.
- Same artifact/no rebuild.

## 8. Continuidad independiente de conversación

Toda sesión nueva lee índice → continuity lock → ledger one-shot → alias registry → Execution State → Source Lock → Checkpoint → Plan → contrato/evidencia → documentos raíz → PR #7/HEAD. Si discrepan: `CONTINUITY_DRIFT_BLOCKED`; reconciliar control-plane y no reabrir I1–I4.

## 9. Conteo bounded

- R1–R4: cuatro iteraciones totales para cerrar/auditar causas; R1 y R2 ya PASS.
- Producción en G1, quinta iteración total, sujeto a R4 PASS + autorización explícita.
- Cierre 100/100 en G2.

Una conversación nueva, explicación o nomenclatura distinta no crea una iteración adicional.

## 10. Prohibiciones

- No nueva candidata/rama/PR/workflow por rutina.
- No nuevo PREPROD ni Project Creator por ruta retirada.
- No reabrir frozen sin P0 reproducible.
- No rebuild antes del cutover.
- No producción sin `ROOT_CAUSE_CLOSED_PASS` + autorización explícita.
- Cutover/deploy no autoriza business/data writes.
- No fallback demo/stale ni conflictos HR/plataforma resueltos silenciosamente.
- No declarar progreso sin salida terminal.
