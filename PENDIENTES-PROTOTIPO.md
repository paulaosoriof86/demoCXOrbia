# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Pendiente real actual

No corresponde reintentar G2-B ni ejecutar synthetic stage.

F0 RC15 continúa hasta clasificar exhaustivamente todas las superficies capaces de cambiar proveedor, datos, producto, fuente o estado canónico, y toda autoridad de lectura sensible provider/HR/legacy. La matriz alcanza **106 hallazgos clasificados**; se han descubierto acumulativamente **24 HOLD/P0**, de los cuales uno quedó contenido y permanecen **23 HOLD residuales**.

## P0 de rama base contenido

`RC15-CP-093` quedó cerrado como contención de emergencia autorizada: el workflow histórico `.github/workflows/cxorbia-v156-atomic-promotion.yml` en la rama base del PR podía reingresar por `pull_request/synchronize` y pushear una materialización V156 sobre la rama viva. La base avanzó a `fc7ead694ccdb01bee79856d47a761d34c8d88b9` y ese workflow quedó estructuralmente inerte: sin trigger PR/push, sin secrets, sin download/apply/commit/push/deploy y con job `if:false`.

Este cierre no cambia el plan maestro ni autoriza F1 o G2-B.

## HOLD residual nuevo

`RC15-CP-094` — `tya-hr-country-tab-consistency-current.yml` + `live-hr-country-tab-consistency.json`: request `enabled=true`, `contents:write`, live HR/provider reads y commit de evidence/registry sin current continuity-lock/consumed gate. Debe formar parte de la inertización conjunta de F1 y del enforcement de autoridad de F2.

Los 22 HOLD residuales previos permanecen sin tratamiento parcial. Con `CP-094`, el total residual actual es 23.

## Regla de tratamiento

Salvo la excepción P0 `CP-093` expresamente autorizada para hacer seguro el propio carril de auditoría, no inertizar aisladamente durante F0. F1 debe cerrar en conjunto las autoridades históricas residuales y F2 debe exigir master plan + continuity lock + consumed ledger/current read authority antes de credential access, provider/external-HR/legacy access o repo mutation.

## Cobertura todavía abierta

Los flags siguen en false:
- `allWorkflowsClassified`;
- `allRequestsClassified`;
- `allWorkflowDispatchClassified`;
- `allProviderWriteEntrypointsClassified`.

Por tanto F0 aún no cierra.

## Secuencia congelada

F0 auditoría sistémica → F1 inertización histórica → F2 autoridad/control-plane → F3 revalidación G2-B → F4 recovery one-shot autorizado → F5 aceptación sintética → F6 release 100 congelado → F7 readiness integral → F8 cutover → F9 postproducción → F10 operación permanente.

## Frontend/Academia

Sin P0 visual nuevo y sin cambio funcional del frontend. Sin cambio funcional de Academia; se mantiene su revisión transversal posterior.

## Siguiente exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`.
