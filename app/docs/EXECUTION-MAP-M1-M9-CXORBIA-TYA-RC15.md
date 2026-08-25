# RC15 — MAPA DE EJECUCIÓN M1–M9 BAJO EL MASTER PLAN CONGELADO

**Fecha:** 2026-08-25  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.0.0`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**Autoridad:** subordinada al master plan; este documento no crea un plan paralelo ni cambia F0–F10.

## Regla anti-bucle

M1–M9 es la secuencia finita de ejecución del master plan existente. No se abre Tramo 15 ni otra auditoría indefinida. Un hallazgo nuevo se clasifica dentro del inventario bloqueado o se detiene con evidencia de drift; no genera otra metodología.

`HEAD_AFTER` no se auto-incrusta en el mismo commit M1: el SHA de un commit depende de su contenido. Se resuelve por readback remoto después del único commit atómico. Los gates post-commit validan ese HEAD; no requieren un segundo commit para que M1 sea válido.

## M1 — mecanismo, estado canónico e inventario F0

Estado: `CLOSED_PASS` una vez que el commit atómico existe, el readback remoto confirma el HEAD y pasan `STATE_SYNC_GATE` y `F0_INVENTORY_LOCK`.

Materializa:
- reconciliación Tramo 14: `142 / 32 / 30`, exhaustividad `2/4`;
- `app/docs/evidence/RC15-M1-CANONICAL-STATE-LATEST.json`;
- `tools/continuity/validate-cxorbia-state-sync.js`;
- `app/docs/evidence/RC15-F0-INVENTORY-LOCK-LATEST.json`;
- `tools/continuity/validate-cxorbia-f0-inventory-lock.js`;
- fuentes vivas reconciliadas;
- `backend/config/cxorbia-phase-a-continuity-lock.json` actualizado;
- cero provider/data/frontend writes.

## M2 — cierre finito F0

Cerrar exclusivamente las familias restantes del inventario M1 hasta `4/4`, sin Tramo 15 abierto ni expansión silenciosa del universo.

## M3 — F1 + F2

Inertizar/terminalizar autoridades históricas write-capable y consolidar autoridad canónica, incluyendo `RC15-CP-142` / M9 y remanentes CP117/CP118.

## M4 — F3

Revalidación read-only del carril G2-B contra el estado actual del proveedor y autoridad canónica.

## M5 — F4

Único recovery G2-B one-shot, solo con autorización explícita vigente y budgets del master plan.

## M6 — F5 + F6

Aceptación sintética E2E en la plataforma canónica, cleanup, post-clean readback y freeze inmutable Phase A.

## M7 — F7

Readiness integral sobre el release exacto: seguridad, aislamiento, migración, E2E/regresión, carga, rollback/restore, observabilidad, Claude y Academia.

## M8 — F8

Cutover a producción, solo con autorización específica y gates previos PASS.

## M9 — F9

Aceptación postproducción y cierre de ventana formal. F10 continúa luego como operación permanente.

## Invariantes

- `PHASE_A=98/100` hasta cumplir lo ya definido para G2-B y aceptación.
- Sin nueva rama/PR, sin merge, sin frontend desde backend.
- Sin Firestore/Auth/Storage/HR/Make/Gemini/pagos/deploy salvo su fase y autorización.
- G2-B no retry/replay antes de M4/M5.
- El master plan `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1` y su hash siguen sin cambios.
