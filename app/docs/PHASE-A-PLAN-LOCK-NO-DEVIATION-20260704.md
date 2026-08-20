# CXOrbia TyA — PHASE A PLAN LOCK · NO DEVIATION

**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Fecha de reconciliación:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-DEFINITIVE-ROOT-CAUSE-PLAN-43`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`

## 1. Autoridad operativa actual

Este Plan Lock conserva la secuencia Phase A y delega el detalle vivo al único plan operativo vigente:

`app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`

El estado machine-readable obligatorio es:

`backend/config/cxorbia-phase-a-continuity-lock.json`

No se crea otro roadmap si una conversación termina, si aparece un bloqueo intermedio o si un gate falla. Se continúa desde `currentIteration` del continuity lock.

## 2. Estado Phase A

- I1 `15/15`: PASS/FROZEN.
- I2 `20/20`: PASS/FROZEN.
- I3 `25/25`: PASS/FROZEN.
- I4 `25/25`: PASS/FROZEN.
- I5: 15 puntos subdivididos en seis iteraciones terminales.
- Source funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- Score formal actual: `87/100` después de `I5-R1 PASS`.
- Producción: no autorizada todavía.

## 3. Secuencia obligatoria restante

`I5-R1 → I5-R2 → I5-R3 → I5-R4 → I5-G1 → I5-G2`

- `R1` 2 pts: continuidad/validadores fail-closed — **PASS**.
- `R2` 3 pts: cierre de deriva documental/control-plane — **ACTIVA**.
- `R3` 3 pts: aceptación crítica producto exacto — pendiente.
- `R4` 2 pts: auditoría post-remediación — pendiente.
- `G1` 3 pts: autorización + cutover — pendiente autorización.
- `G2` 2 pts: smoke/hypercare/freeze — pendiente.

No se salta `R4`. Producción solo se habilita con `ROOT_CAUSE_CLOSED_PASS` y autorización explícita.

## 4. Regla de validación por corte

Cada iteración exige:

`FUENTE/CONTRATO → CAMBIO FOCALIZADO → VALIDADOR/GATE → EVIDENCIA TERMINAL → DOCUMENTACIÓN SINCRONIZADA → FREEZE`

Un PASS técnico aislado no cierra un bloque si los documentos vivos, el control machine-readable y la evidencia no coinciden.

## 5. Root causes obligatorias

Las causas RC01–RC12 están registradas en `backend/config/cxorbia-phase-a-continuity-lock.json`. Ninguna causa crítica RC01–RC11 puede quedar abierta antes de `I5-G1`; RC12 se cierra en hypercare productivo.

## 6. Aceptación crítica obligatoria antes del cutover

Debe quedar PASS sobre el mismo artefacto probado:

- HR/hoja de ruta viva y sin clones.
- Shoppers visibles según scope real.
- Visitas actuales e históricas visibles.
- Finanzas con semántica canónica (`liquidada != pagada`).
- Multirol/RBAC y reload/nueva sesión.
- Cero fallback silencioso a demo/stale.
- Same artifact/no rebuild.
- Rollback listo.

## 7. Continuidad independiente de conversación

Toda nueva conversación debe leer en orden:

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `backend/config/cxorbia-phase-a-continuity-lock.json`;
3. Execution State;
4. Checkpoint;
5. Plan Operativo Unificado;
6. contrato y evidencia de promoción;
7. PR #7 y HEAD vivo.

Si esos elementos discrepan, estado obligatorio `CONTINUITY_DRIFT_BLOCKED`: primero reconciliar control-plane, sin reabrir I1–I4 ni inventar un plan nuevo.

## 8. Conteo bounded

- 4 iteraciones totales para cerrar/auditar causas raíz (`R1–R4`).
- Producción en la 5.ª (`G1`) si no existe nuevo `P0_PROVEN`.
- Estabilización y cierre 100/100 en la 6.ª (`G2`).

Una explicación, una conversación nueva o una nomenclatura distinta no crea una iteración adicional.

## 9. Prohibiciones

- No nueva candidata/rama/PR/workflow por rutina.
- No nuevo PREPROD ni Project Creator por la ruta retirada.
- No reabrir bloques frozen sin P0 reproducible.
- No rebuild antes del cutover.
- No producción sin `ROOT_CAUSE_CLOSED_PASS` + autorización explícita.
- No fallback demo/stale ni conflictos HR/plataforma resueltos silenciosamente.
- No declarar progreso sin salida terminal del subbloque.
