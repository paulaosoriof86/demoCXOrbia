# EXECUTION STATE CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-OPERATIONAL-AUTHORITY-MULTIPROJECT-SOURCE-AUDIT-16`  
**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`  
**currentMasterStep:** `F10_OPERATIONAL_AUTHORITY_REPAIR_AND_MULTIPROJECT_SOURCE_GATES`  
**activeIncident:** `F10-OPERATIONAL-AUTHORITY-AND-PROJECT-SOURCE-20260830-02`  
**incidentStatus:** `SOURCE_REPAIR_APPLIED__READONLY_GATES_PENDING__CLAUDE_HOLD`  
**PHASE_A:** `100/100_CURRENT_LIVE_OPERATION__NEW_PROJECT_ONBOARDING_GATES_OPEN`  
**PRODUCTION_REAL_READINESS:** `100/100_CURRENT_LIVE_RELEASE__SOURCE_SUCCESSOR_NOT_DEPLOYED`  
**NEXT:** `F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`

## Evidencia live preservada

- Deploy F10 ya verificado: run `33289344796`, artefacto `9725498210`.
- Fresh row-content gate: run `33297814889`, artefacto `9727971958`, PASS.
- 660 visitas, 15 periodos, 44 filas agosto, 0 duplicados, 0 canonical mismatches.
- Digest provider/browser: `a5a6d0bc1ed109e1c4088d09553e49c860f6d390d187859175c1fd2d19741bb0`.

Ese PASS queda congelado como prueba de HR/KPI del release live; no se usa para afirmar que postulaciones, project create/update o fuentes futuras ya estén certificadas.

## Source successor actual

Se añadieron sin deploy ni provider writes:

- `app/adapters/tya-phase-a-operational-sync-v1.js`;
- `backend/runtime/cxorbia-operational-command-provider-v1.mjs`;
- `backend/contracts/cxorbia-project-source-contract-v1.json`;
- `app/adapters/cxorbia-project-operational-source-v1.js`;
- `backend/runtime/cxorbia-project-command-provider-v1.mjs`;
- locks/auditorías F10 de autoridad operacional y onboarding multiproyecto.

## Hallazgos vivos que cambian el NEXT

1. `hr-post-*` no puede ser postulación canónica.
2. UI de postulaciones/asignaciones contiene call-sites heredados local-first.
3. alta de proyecto usa `data.addProject()` local-first; backend wrapper hace persistencia separada y no ACK-before-success.
4. edición de proyecto muta `pr`, persiste localmente y muestra éxito sin provider ACK.
5. source config actual solo conserva `nativa|externa` + etiqueta; no provider binding/mapping/policies.
6. adapter live TyA está acoplado a `tya/cinepolis`; no es reusable global.
7. wizard conserva `ronda:'JUN 26'`, quincenas y columnas fijas y una regla visual 50/50 contradictoria.
8. acciones “IA” de set-up siguen simuladas/heurísticas y no pueden presentarse como producción.

## Regla anti-bucle ampliada

No crear un segundo proyecto reproduciendo el camino localStorage ni copiando el servicio Cinépolis. No hardcodear un nuevo endpoint por proyecto. No convertir Google Sheets en arquitectura global. Cada proyecto resuelve su fuente mediante contrato/provider binding. Fuente interna y externa usan la misma interfaz canónica y el cuestionario es independiente.

No modificar módulos antes de que backend deje cerrados los contratos/gates y se produzca el paquete focal para Claude Code.

## Siguiente ejecución permitida

Gates read-only/estructurales de autoridad operacional, fuente por proyecto, project create/update durable e aislamiento. Después, provider route sintético controlado bajo autorización específica. No deploy/reimport/HR write/Make/Gemini/pagos por rutina.

**NEXT:** `F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`.
