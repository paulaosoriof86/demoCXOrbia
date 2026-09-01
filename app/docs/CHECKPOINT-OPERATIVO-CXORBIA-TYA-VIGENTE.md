# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-OPERATIONAL-AUTHORITY-MULTIPROJECT-SOURCE-AUDIT-16`  
**PHASE_A:** `100/100_CURRENT_LIVE_OPERATION__NEW_PROJECT_ONBOARDING_GATES_OPEN`  
**PRODUCTION_REAL_READINESS:** `100/100_CURRENT_LIVE_RELEASE__SOURCE_SUCCESSOR_NOT_DEPLOYED`  
**F10:** `LIVE_HR_KPI_PASS_PRESERVED__AUTHORITY_REPAIR_SOURCE_APPLIED__MULTIPROJECT_ONBOARDING_HOLD`  
**NEXT:** `F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`

## Corte exacto

El PASS F10 de lectura HR/KPIs permanece válido: deploy `33289344796`; row-content gate `33297814889`; 660 visitas, 15 periodos, 44 filas de agosto, 0 duplicados y digest operacional proveedor/Admin exacto `a5a6d0bc1ed109e1c4088d09553e49c860f6d390d187859175c1fd2d19741bb0`.

Ese PASS no certificó todos los caminos de escritura ni el onboarding de nuevos proyectos. La auditoría posterior demostró dos desviaciones de arquitectura que deben cerrarse antes de aceptación final:

1. postulaciones sintéticas `hr-post-*` y call-sites local-first sin provider ACK;
2. configuración multiproyecto todavía local-first y fuente de Hoja de Ruta insuficientemente parametrizada.

## Solución source aplicada sin deploy

- `app/adapters/tya-phase-a-operational-sync-v1.js`: autoridad HR/plataforma, `periodStats` por evidencia, fachada ACK-aware y reconciliación estable.
- `backend/runtime/cxorbia-operational-command-provider-v1.mjs`: provider durable source-only para postulaciones/asignaciones.
- `backend/contracts/cxorbia-project-source-contract-v1.json`: fuente operacional por proyecto `internal|external` y provider/mapping/policies.
- `app/adapters/cxorbia-project-operational-source-v1.js`: resolver reusable por proyecto.
- `backend/runtime/cxorbia-project-command-provider-v1.mjs`: `project.create|project.update` durable, Auth/RBAC/idempotencia/versionado, ID canónico y secretos prohibidos.
- `app/docs/evidence/F10-MULTIPROJECT-PROJECT-CONFIG-SOURCE-AUDIT-20260830.md`: auditoría detallada.

## Hallazgos de configuración que quedan como HOLD

`proyecto-wizard.js` todavía llama `data.addProject()` y crea configuración local; mantiene `ronda:'JUN 26'`, quincenas y columnas HR fijas. `proyectos.js` edita el objeto directamente y guarda localmente. El bridge HR live actual está acoplado a TyA/Cinépolis. Las acciones de “IA” del wizard siguen siendo simuladas/heurísticas y no pueden presentarse como integración real.

Cada proyecto debe poder elegir Hoja de Ruta interna o externa; una fuente externa puede ser Google Sheets, Excel importado, API/plataforma externa o adapter específico. El cuestionario se configura aparte. Este criterio queda reusable para cualquier tenant/proyecto.

## Estado seguro

No hubo deploy/rebuild/reimport ni writes HR/Firestore/Auth/Storage/Rules/pagos, Make/Gemini o merge en esta auditoría. El release vivo permanece intacto. Claude Code continúa HOLD.

## Siguiente bloque exacto

Ejecutar gates read-only/estructurales del authority repair y del contrato de fuente/proyecto; corregir cualquier defecto del mecanismo; después habilitar únicamente el provider route/gate sintético controlado. Solo entonces preparar el paquete focal de Claude Code.

**NEXT:** `F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`.
