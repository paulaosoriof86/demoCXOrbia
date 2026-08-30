# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-OPERATIONAL-AUTHORITY-REPAIR-15`  
**Estado:** `HOLD_CLAUDE_UNTIL_BACKEND_AUTHORITY_REPAIR_GATES_PASS`  
**NEXT:** `BACKEND_GATES_THEN_FOCAL_CLAUDE_CODE_HANDOFF`

HARD PRESERVE: el PASS F10 previo de lectura HR/KPIs y los módulos aprobados no se descartan. No restaurar V182, no reemplazar `app/modules/*` ni `app/core/*`, no rediseñar.

Defecto nuevo demostrado y ya aislado: una capa de lectura generaba `hr-post-*` desde visitas HR, confundiendo visita/asignación observada con una postulación real; además existen call-sites frontend heredados que muestran éxito tras mutación en memoria sin ACK durable.

Backend source repair ya aplicado:
- `app/adapters/tya-phase-a-operational-sync-v1.js` fija la matriz de autoridad HR/plataforma, excluye postulaciones sintéticas, instala `periodStats()` por evidencia HR y expone fachada durable ACK-aware.
- `backend/runtime/cxorbia-operational-command-provider-v1.mjs` prepara provider reusable y fail-closed.
- `app/docs/evidence/F10-OPERATIONAL-AUTHORITY-DEFINITIVE-SOLUTION-20260830.md` contiene el lock definitivo.

NO ejecutar todavía cambios frontend. Cuando backend complete gates y provider route/gate, el handoff a Claude Code será focal y limitado a sustituir los call-sites locales de Postular/Aprobar/Rechazar/Standby/Asignar/Reprogramar/Cancelar por las funciones durables ya preparadas, manteniendo diseño, textos y estructura salvo el copy necesario para estados honestos.

Invariantes obligatorios para Claude posterior: visita disponible != postulación; éxito solo después de provider ACK; `pending_hr`/`pending_platform`/`synced`/`conflict` son estados honestos; nunca dedupe por nombre; Cinépolis no hardcodeado como arquitectura general.
