# REPORTE DE CORRECCIÓN — V123 (migración transversal de contratos: 2 consumidores nuevos)

Baseline: `Prototype development request CXOrbia V122.zip`.

## OLA 1 — Migración transversal de ctx(): 2 nuevos consumidores reales

1. `modules/diagnostico.js` (tab "Modo de datos"): nuevo panel "Contexto
   activo" que muestra los 6 campos de `CX.data.ctx()` (tenant, proyecto,
   periodo, países, rol, modo) en un solo lugar — el punto natural para que
   un admin detecte un desface tenant/proyecto/periodo/rol/modo en el acto,
   la misma clase de bug (`currentProjectId`/`currentPeriodId`
   desincronizados) que causó reprocesos completos en V111-V114.
2. `core/automations.js logAction()`: cada entrada de la bitácora de
   auditoría ahora incluye `ctx` completo — antes una acción quedaba
   registrada sin declarar en qué proyecto/periodo/rol ocurrió, dificultando
   auditar acciones cruzadas entre proyectos. Aditivo puro: no cambia el
   shape que ya consumen `auditFor()` ni las vistas existentes de bitácora.

Probado en runtime: panel de contexto visible con valores reales; entrada de
auditoría nueva incluye `ctx` con los 6 campos correctos. 48/48 módulos × 3
roles sin error.

## Resto de la migración transversal (Dashboard/Visitas/Histórico/Finanzas/
Cliente/Shoppers/Configuración aún leen estado por su cuenta) y matriz
formal CRM/Documentos/Configuración: sigue NO_ATENDIDO — backlog grande,
priorizado por impacto (los 2 consumidores de esta ronda son los de mayor
valor de detección temprana de bugs).

## Gate técnico
- Sintaxis: PASS (2 archivos). Smoke 48×3: sin error. Manifest V123
  regenerado, 0 diffs.
