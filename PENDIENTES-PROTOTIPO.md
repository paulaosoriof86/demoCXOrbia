# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Pendiente real actual

No corresponde reintentar G2-B ni ejecutar synthetic stage.

F0 RC15 continúa hasta clasificar exhaustivamente todas las superficies capaces de cambiar proveedor, datos, producto, fuente o estado canónico y toda autoridad de lectura sensible provider/HR/legacy.

La matriz alcanza **110 hallazgos clasificados**; se han descubierto acumulativamente **25 HOLD/P0**, de los cuales CP093 quedó contenido y permanecen **24 HOLD residuales**.

## Avance medible ya cerrado

La exhaustividad pasó de 0/4 a **2/4 flags true**:
- `allWorkflowsClassified=true`: unión HEAD/base 105/105;
- `allWorkflowDispatchClassified=true`;
- `.github/cxorbia-firebase-requests` queda 33/33 mapeado.

Siguen pendientes solo los dos dominios globales:
- `allRequestsClassified=false`;
- `allProviderWriteEntrypointsClassified=false`.

## P0 de rama base contenido

`RC15-CP-093` permanece cerrado como contención autorizada: `.github/workflows/cxorbia-v156-atomic-promotion.yml` está inerte en la rama base `fc7ead694ccdb01bee79856d47a761d34c8d88b9`, sin trigger PR/push, secrets, download/apply/commit/push/deploy y con job `if:false`.

## HOLD residual nuevo

`RC15-CP-108` — `.github/cxorbia-firebase-requests/corte4-p0-vis02b-final-revalidate.json` conserva `enabled=true` y `hostingDeployExecutions=1` sin terminalización consumida, mientras su executor nominal está inerte y declara la autorización consumida. No hay deploy ejecutable por ese workflow en su estado actual, pero existe deriva de autoridad request↔executor.

Tratamiento: incluir CP108 en la inertización conjunta de F1 y exigir en F2 coherencia plan + continuity lock + consumed ledger + request + executor antes de cualquier write-capable path.

Los HOLD residuales anteriores permanecen sin tratamiento parcial.

## Regla de tratamiento

Salvo la excepción P0 CP093 ya autorizada para hacer seguro el carril de auditoría, no inertizar aisladamente durante F0. F1 debe cerrar en conjunto las autoridades históricas residuales y F2 debe exigir master plan + continuity lock + consumed ledger/current read authority antes de credential access, provider/external-HR/legacy access o repo mutation.

## Próximo bloque exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE` sobre:
1. `backend/config`;
2. `backend/requests`;
3. execute markers y one-shots;
4. ledgers y aliases;
5. provider-write entrypoints restantes.

Objetivo inmediato: llevar los flags de exhaustividad de **2/4 a 4/4** y recién entonces iniciar F1.

## Secuencia congelada

F0 auditoría sistémica → F1 inertización histórica → F2 autoridad/control-plane → F3 revalidación G2-B → F4 recovery one-shot autorizado → F5 aceptación sintética → F6 release 100 congelado → F7 readiness integral → F8 cutover → F9 postproducción → F10 operación permanente.

## Frontend/Academia

Sin P0 visual nuevo y sin cambio funcional del frontend. Sin cambio funcional de Academia; se mantiene su revisión transversal posterior.
