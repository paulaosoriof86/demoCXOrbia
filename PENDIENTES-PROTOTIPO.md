# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Pendiente real actual

No corresponde reintentar G2-B ni ejecutar synthetic stage.

Primero debe cerrar F0 RC15: auditoría exhaustiva de todas las superficies que pueden cambiar producto, estado canónico o proveedor. La matriz vigente ya contiene 18 hallazgos, pero todavía no declara cobertura exhaustiva.

HOLD confirmados para tratamiento después del cierre de F0:
- `RC15-CP-005`: bootstrap Corte4 con `workflow_dispatch` + request `enabled=true` / `providerConfigWrites=true`.
- `RC15-CP-011`: protected smoke Corte4 con request `enabled=true`; permite configuración Auth y usuario temporal reversible.
- `RC15-CP-014`: snapshot de autorización G2-B synthetic aún `enabled=true`, `consumed=false`; el preflight puede alterar estado canónico/evidence aunque el lock actual ya lo considera no autoritativo.
- `RC15-CP-017`: creación histórica de Firebase DEV Corte4 con request `enabled=true`, `projectCreate=true`, `firebaseAdd=true` y `workflow_dispatch`.

No inertizar todavía de forma aislada: F0 debe terminar primero para que F1 cierre todas las superficies históricas de manera sistémica y F2 las vincule a una única autoridad canónica.

## Secuencia congelada

F0 auditoría sistémica → F1 inertización histórica → F2 autoridad/control-plane → F3 revalidación G2-B → F4 recovery one-shot autorizado → F5 aceptación sintética → F6 release 100 congelado → F7 readiness integral → F8 cutover → F9 postproducción → F10 operación permanente.

No crear otro plan, G3, candidata, branch, PR, workflow, PREPROD ni metodología paralela. Un cambio del plan requiere `PLAN_CHANGE_REQUEST`.

## Frontend/Academia

Sin P0 visual nuevo demostrado. Sin cambio funcional de Academia en este bloque.
