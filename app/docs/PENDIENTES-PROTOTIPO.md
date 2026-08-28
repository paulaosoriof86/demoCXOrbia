# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-28  
**Estado:** `PHASE_A_100__PROD_READINESS_98__F9_IN_PROGRESS__NO_FRONTEND_CORRECTION_PENDING`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5, F6 y F8 permanecen terminales. F7 permanece `GO_WITH_WARNINGS_NO_P0`. F8.5 está `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`.

Phase A=`100/100`; Production Real Readiness=`98/100`; release congelado=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

No reabrir synthetic lifecycle, F7, F8, IAM temporal, candidatas anteriores ni linaje de módulos. No restaurar V182 completo. No rebuild/redeploy/reimport del release congelado y no crear candidata por rutina.

## Pendiente real actual

`F9_POSTPRODUCTION_ACCEPTANCE_98_TO_100` está `IN_PROGRESS`.

El master plan requiere ventana objetivo de 24 horas posterior al cutover. F8 concluyó `2026-08-28T17:19:06Z`, por lo que `POSTPROD_ACCEPTED` no puede cerrarse antes de `2026-08-29T17:19:06Z` (`11:19:06 -06:00`).

Fresh readbacks requeridos dentro de la ventana: Auth, HR, HR↔plataforma, shoppers, visitas, evidencias, liquidaciones/pagos, errores runtime, performance, drift y alertas/observabilidad.

El intento HTTP directo de esta sesión no alcanzó Hosting por falta de resolución DNS en el entorno. Clasificación: `SESSION_EXTERNAL_HTTP_TRANSPORT_GAP_NOT_PRODUCT_FAILURE`. No es P0 y no autoriza workflow, IAM, credenciales, rama, PR o transporte paralelo.

## Frontend / Claude

No existe pendiente correctivo nuevo de frontend por F8.5/F9. `/app/modules` y `/app/core` permanecen protegidos. Las autoridades M1/V161C/V174/V182/C6 y fixes sucesores ya están certificadas.

## Warnings no bloqueantes

1. Observabilidad/alert delivery debe quedar incluida en el cierre F9 cuando exista lectura fresca.
2. P2 Academia: profundidad por rol/módulo continúa como seguimiento de contenido, no como P0 runtime.

## Reglas vigentes

- prototipo manda; backend no rediseña `/app/modules` ni `/app/core`;
- release F6 permanece inmutable;
- base nueva y limpia; legacy solo export/import útil, nunca conexión/copia de la base vieja;
- multi-tenant `tenantId` + `projectId`;
- Make/Gemini/pagos solo con gate real;
- datos sensibles protegidos y fuera del repo;
- no crear/revivir mecanismo de transporte para suplir una lectura temporalmente no disponible.

**NEXT:** `F9_COLLECT_POSTCUTOVER_READONLY_OBSERVATIONS_AND_TERMINAL_ACCEPTANCE_NOT_BEFORE_2026-08-29T17:19:06Z`.
