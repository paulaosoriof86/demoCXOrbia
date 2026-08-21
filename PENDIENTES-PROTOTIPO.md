# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Pendiente real actual

No corresponde reintentar G2-B ni ejecutar synthetic stage.

Primero debe cerrar F0 RC15: auditoría exhaustiva de todas las superficies que pueden cambiar producto, estado canónico o proveedor. La matriz vigente contiene **44 hallazgos**, pero todavía no declara cobertura exhaustiva.

HOLD confirmados para tratamiento conjunto después del cierre de F0:
1. `RC15-CP-005`: bootstrap Corte4 con `workflow_dispatch` + `enabled=true` / `providerConfigWrites=true`.
2. `RC15-CP-011`: protected smoke Corte4 con request `enabled=true`; permite configuración Auth y usuario temporal reversible.
3. `RC15-CP-014`: snapshot de autorización G2-B synthetic `enabled=true`, `consumed=false`; puede alterar state/evidence aunque el lock actual ya lo considera no autoritativo.
4. `RC15-CP-017`: creación Firebase DEV Corte4 con `workflow_dispatch`/push + `enabled=true`, `projectCreate=true`, `firebaseAdd=true`.
5. `RC15-CP-025`: postdeploy C6 read-only recheck manual/repetible capaz de reescribir estado/evidence canónico aun con autorización original consumida.
6. `RC15-CP-028`: deterministic-suffix source-only rootfix con request histórico `enabled=true/consumed=false`; puede mutar fuente/producto y hacer commit/push si se revive la autoridad vieja.
7. `RC15-CP-029`: postdeploy read-only revalidation con request `enabled=true/consumed=false`; provider read-only pero state/evidence writer del branch.
8. `RC15-CP-030`: canonical-plan-refresh-offline con request `enabled=true` sin terminalización; writer repetible de evidence/planes canónicos.
9. `RC15-CP-031`: live-HR current reconcile con request histórico activo y source binding antiguo; provider-read + writer de registry/evidence si se reactiva.

No inertizar aisladamente durante F0. F1 debe cerrar todas las superficies históricas residuales de una sola vez y F2 debe vincular los ejecutores restantes a una única autoridad canónica fail-closed.

## Secuencia congelada

F0 auditoría sistémica → F1 inertización histórica → F2 autoridad/control-plane → F3 revalidación G2-B → F4 recovery one-shot autorizado → F5 aceptación sintética → F6 release 100 congelado → F7 readiness integral → F8 cutover → F9 postproducción → F10 operación permanente.

No crear otro plan, G3, candidata, branch, PR, workflow, PREPROD ni metodología paralela. Un cambio del plan requiere `PLAN_CHANGE_REQUEST`.

## Frontend/Academia

Sin P0 visual nuevo demostrado. Sin cambio funcional de Academia en este bloque.
