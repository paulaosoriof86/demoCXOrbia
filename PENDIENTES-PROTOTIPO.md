# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Pendiente real actual
No corresponde reintentar G2-B ni ejecutar synthetic stage.

Primero debe cerrar F0 RC15: auditoría exhaustiva de todas las superficies que pueden cambiar producto, estado canónico o proveedor o acceder a provider/legacy/HR bajo autoridad histórica. La matriz vigente contiene **92 hallazgos** y **22 HOLD**, pero todavía no declara cobertura exhaustiva.

## HOLD vigentes
Los 18 HOLD ya documentados en el tramo anterior permanecen. El tramo 6 agrega:
1. `RC15-CP-074` — clean-state reader: provider read ejecutable pese a `providerRunAuthorized=false` porque el runner no hace cumplir ese flag.
2. `RC15-CP-078` — live-HR read probe: HR refresh + writer de source-safe/evidence sin current request/lock gate.
3. `RC15-CP-090` — VIS-02 diagnostic: trigger request y request realmente usado para provider preflight son diferentes; authority binding defect.
4. `RC15-CP-091` — VIS-02 revalidation: request histórico `enabled=true` conserva permiso de Hosting real sin `consumed/executionsConsumed`; riesgo de deploy repetible si se toca el request.

No inertizar aisladamente durante F0. F1 debe cerrar todas las superficies históricas residuales de una sola vez y F2 debe obligar a cualquier executor a validar master plan + continuity lock + consumed ledger/current read authority antes de credential access, provider/external-HR/legacy access o repo mutation.

## Secuencia congelada
F0 auditoría sistémica → F1 inertización histórica → F2 autoridad/control-plane → F3 revalidación G2-B → F4 recovery one-shot autorizado → F5 aceptación sintética → F6 release 100 congelado → F7 readiness integral → F8 cutover → F9 postproducción → F10 operación permanente.

No crear otro plan, G3, candidata, branch, PR, workflow, PREPROD ni metodología paralela. Un cambio del plan requiere `PLAN_CHANGE_REQUEST`.

## Frontend/Academia
Sin P0 visual nuevo demostrado. Sin cambio funcional de Academia en este bloque.

## Siguiente exacto
`F0_RC15_SYSTEMIC_AUDIT_CONTINUE` hasta que los cuatro flags de exhaustividad puedan demostrarse true con evidencia.
