# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-OPERATIONAL-AUTHORITY-MULTIPROJECT-SOURCE-AUDIT-16`  
**MASTER_PLAN:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1` / `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`  
**currentMasterStep:** `F10_OPERATIONAL_AUTHORITY_REPAIR_AND_MULTIPROJECT_SOURCE_GATES`  
**F8.5:** `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`  
**F9:** `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`  
**F10:** `LIVE_HR_KPI_PASS_PRESERVED__AUTHORITY_REPAIR_SOURCE_APPLIED__MULTIPROJECT_ONBOARDING_HOLD`  
**PHASE_A:** `100/100_CURRENT_LIVE_OPERATION__NEW_PROJECT_ONBOARDING_GATES_OPEN`  
**PRODUCTION_REAL_READINESS:** `100/100_CURRENT_LIVE_RELEASE__SOURCE_SUCCESSOR_NOT_DEPLOYED`  
**NEXT:** `F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`

## Autoridad viva — orden obligatorio

1. Este índice.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md` como plan congelado.
3. `app/docs/evidence/F10-OPERATIONAL-AUTHORITY-DEFINITIVE-SOLUTION-20260830.md`.
4. `app/docs/evidence/F10-MULTIPROJECT-PROJECT-CONFIG-SOURCE-AUDIT-20260830.md`.
5. `backend/contracts/cxorbia-project-source-contract-v1.json`.
6. `backend/config/cxorbia-phase-a-continuity-lock.json` como historia + `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json` como cursor efectivo hasta su siguiente sincronización formal.
7. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
8. `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`.
9. `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`.
10. Evidencia live F10 previa `app/docs/evidence/RC15-F10-LIVE-CONTENT-EQUIVALENCE-MECHANISM-SYNC-LATEST.json` como certificación de lectura/KPI del release ya desplegado, no como certificación de postulaciones/configuración de proyectos.
11. `backend/config/cxorbia-f10-approved-module-authority-live-overlay-v1.json` y matriz base de blobs aprobados.
12. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz cuando coincidan con este epoch.
13. PR #7 sigue siendo mirror histórico no autoritativo.
14. Única rama viva: `docs-tya-v6-v71-audit`.

## Estado live preservado

El release Phase A actualmente servido no fue modificado en esta auditoría. Se conserva la certificación del deploy F10 `33289344796` y del row-content/KPI PASS `33297814889`: 660 visitas, 15 periodos, 44 filas de agosto, 0 duplicados, 0 mismatches canónicos y digest proveedor↔Admin exacto `a5a6d0bc1ed109e1c4088d09553e49c860f6d390d187859175c1fd2d19741bb0`.

Ese PASS demuestra lectura HR y semántica de KPIs del release live. **No certificó** creación/edición durable de proyectos, postulaciones reales ni generalización de la fuente HR a proyectos futuros.

## Defecto transversal posterior demostrado

La auditoría posterior detectó dos familias separadas:

1. **Autoridad/persistencia operacional:** `hr-post-*` sintéticos y call-sites locales antes de provider ACK. Source repair: `app/adapters/tya-phase-a-operational-sync-v1.js` + provider durable source-only.
2. **Onboarding multiproyecto:** wizard/configuración actual son local-first, la fuente HR se persiste solo como etiqueta/origen, existe acoplamiento live TyA/Cinépolis, valores residuales `JUN 26`/quincenas/columnas fijas y acciones IA simuladas.

Se prepararon sin deploy:
- `backend/contracts/cxorbia-project-source-contract-v1.json`;
- `app/adapters/cxorbia-project-operational-source-v1.js`;
- `backend/runtime/cxorbia-project-command-provider-v1.mjs`;
- evidencias/locks citados arriba.

## Regla reusable de Hoja de Ruta

Cada proyecto elige su fuente operacional. Puede ser `internal` o `external` y, si es externa, puede usar Google Sheets, Excel importado, API/plataforma externa o adapter específico. El cuestionario se configura independientemente. Cinépolis es solo el proyecto inicial TyA; nunca lógica global.

## Pendiente real

Antes de pedir aceptación visual final y antes de permitir crear un segundo proyecto en producción deben pasar los gates read-only de autoridad, fuente por proyecto, creación/edición durable, aislamiento, provider binding, fuente interna, fuente externa y ausencia de IA simulada. Claude Code sigue HOLD hasta que backend deje esos contratos ejecutables y verificables.

No nuevo deploy, reimport, HR/Firestore/Auth/Storage/Rules/pagos writes, Make/Gemini ni merge fueron autorizados por este bloque.

**NEXT:** `F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`.
