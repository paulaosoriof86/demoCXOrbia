# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-OPERATIONAL-AUTHORITY-MULTIPROJECT-SOURCE-AUDIT-16`  
**Estado:** `HOLD_CLAUDE_UNTIL_AUTHORITY_PROJECT_SOURCE_AND_PROVIDER_GATES_PASS`  
**NEXT:** `F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`

HARD PRESERVE: no restaurar V182, no reemplazar `app/modules/**`/`app/core/**`, no rediseñar. El PASS live F10 de lectura HR/KPIs se conserva y no autoriza inferir que los flujos de escritura u onboarding estén terminados.

## Arquitectura que Claude deberá preservar

- Cada proyecto elige su Hoja de Ruta/fuente operacional: `internal` o `external`.
- Fuente externa puede ser Google Sheets, Excel importado, API/plataforma externa o adapter específico; nunca un endpoint global hardcodeado.
- Fuente interna significa que CXOrbia/Firestore es autoridad de periodos/visitas/hitos.
- Fuente externa es autoridad de periodos/visitas/hitos observados, mientras CXOrbia conserva autoridad de postulaciones, decisiones, usuarios, perfiles, certificaciones, crosswalks y auditoría.
- El cuestionario es independiente de la fuente de Hoja de Ruta.
- Visita disponible != postulación; `hr-post-*` queda prohibido como aplicación canónica.
- éxito UI únicamente después de provider ACK + refresh.
- reconciliación por llaves técnicas; nunca dedupe por nombre.

## Backend source ya preparado

`tya-phase-a-operational-sync-v1.js`, `cxorbia-operational-command-provider-v1.mjs`, `cxorbia-project-source-contract-v1.json`, `cxorbia-project-operational-source-v1.js` y `cxorbia-project-command-provider-v1.mjs` fijan contratos reusable/fail-closed sin habilitar writes ni deploy.

## Hallazgos frontend que NO deben parchearse todavía

- `app/modules/proyecto-wizard.js`: alta local-first, `JUN 26`, quincenas/cols fijas y falsa extracción IA demo.
- `app/modules/proyectos.js`: edición local-first, fuente superficial, regla 50/50 contradictoria y sugerencia heurística.
- call-sites de postulaciones/asignaciones siguen necesitando sustitución por comandos ACK-aware.

Cuando backend cierre gates, Claude Code recibirá un paquete focal y deberá tocar solo los call-sites/documentación visual necesarios. No crear candidata, rama, PR, nueva arquitectura ni copiar el servicio Cinépolis para un proyecto nuevo.

Academia/manuales deberán reflejar configuración de fuente interna/externa, provider/mapping, estados de sync/conflicto y uso de IA solo cuando esté realmente habilitada.
