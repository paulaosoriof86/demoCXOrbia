# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-OPERATIONAL-AUTHORITY-MULTIPROJECT-SOURCE-AUDIT-16`  
**Estado:** `LIVE_F10_PASS_PRESERVED__AUTHORITY_AND_MULTIPROJECT_SOURCE_SUCCESSOR_NOT_DEPLOYED__GATES_PENDING`  
**NEXT:** `F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`

El PASS live F10 permanece válido para lo que realmente certificó: deploy `33289344796`, row-content/KPI gate `33297814889`, 660 visitas, 15 periodos, 44 filas de agosto, 0 duplicados/mismatches y digest proveedor↔Admin `a5a6d0bc1ed109e1c4088d09553e49c860f6d390d187859175c1fd2d19741bb0`. No certificó postulaciones durables ni onboarding/configuración genérica de proyectos.

## Source repair no desplegado

Se preserva el authority repair previo y se amplía a fuente operacional configurable por proyecto:
- `app/adapters/tya-phase-a-operational-sync-v1.js`: separa autoridad operacional externa/plataforma, excluye `hr-post-*`, corrige `periodStats` y expone comandos ACK-aware.
- `backend/runtime/cxorbia-operational-command-provider-v1.mjs`: provider durable source-only para postulaciones/asignaciones.
- `backend/contracts/cxorbia-project-source-contract-v1.json`: contrato reusable para Hoja de Ruta `internal|external`, provider binding, mapping, read/write policy y autoridad.
- `app/adapters/cxorbia-project-operational-source-v1.js`: resolver reusable por proyecto, backward-compatible y sin writes.
- `backend/runtime/cxorbia-project-command-provider-v1.mjs`: `project.create|project.update` durable con Auth/RBAC/idempotencia/expectedVersion/ID canónico y prohibición de secretos crudos.
- `app/docs/evidence/F10-MULTIPROJECT-PROJECT-CONFIG-SOURCE-AUDIT-20260830.md`: auditoría transversal de onboarding/configuración.

## Defectos proactivamente demostrados

- `proyecto-wizard.js` todavía crea local-first con `data.addProject()` y éxito inmediato.
- `proyectos.js` edita el objeto `pr` y guarda en localStorage antes de un ACK durable.
- la fuente actual solo conserva `nativa|externa` + etiqueta; no binding/mapping/capacidades.
- bridge live TyA/Cinépolis es cliente-específico y no puede convertirse en arquitectura global.
- permanecen `ronda:'JUN 26'`, quincenas/columnas fijas y copy 50/50 contradictorio.
- acciones “IA” del set-up siguen simuladas/heurísticas; no pueden declararse integración real.
- la opción de Hoja de Ruta interna aún no tiene CRUD durable completo bajo el command boundary final.

Cada proyecto deberá elegir su propia fuente de Hoja de Ruta: interna o externa (Google Sheets, Excel importado, API/plataforma externa o adapter específico). El cuestionario se configura independientemente. Cinépolis continúa como proyecto normal de TyA, no como lógica global.

No se modificaron `app/modules/**` desde backend, no hubo deploy/rebuild/reimport ni Firestore/Auth/HR/Storage/Rules/pagos writes, Make/Gemini o merge. Los módulos quedan para patch focal de Claude Code solo cuando los gates backend hayan pasado.
