# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-29  
**Estado:** `PHASE_A_100__PROD_READINESS_100__F10_DYNAMIC_HR_MONITORING__P1_UI_CONTEXT_AND_CLIENT_FOLLOWUP`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5, F6 y F8 permanecen terminales. F7 permanece `GO_WITH_WARNINGS_NO_P0`. F8.5 está `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`. F9 está `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`.

Phase A=`100/100`; Production Real Readiness=`100/100`; release congelado=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

No reabrir synthetic lifecycle, F7, F8, IAM temporal, F8.5, F9, candidatas anteriores ni linaje de módulos sin P0 reproducible. No restaurar V182 completo. No rebuild/redeploy/reimport del release congelado y no crear candidata por rutina.

## Producción

No queda pendiente bloqueante para el release ya aceptado. F10 mantiene monitoreo continuo y debe detectar regresión nueva mediante evidencia viva antes de cualquier reapertura.

La prueba browser del 29/08 confirmó HR dinámica actual en Admin y Shopper: 15 periodos, 660 visitas, 216 shoppers, latest 2026-08, sin septiembre todavía. Agosto vivo: 44 total (GT34/HN10), 44 asignadas, 0 sin asignar, 3 sin agendar, 10 agendadas, 31 realizadas, 13 pendientes realizar, 0 cuestionario pendiente, 1 sin submitir, 0 liquidadas y 5 fuera de rango. Shopper exacto: 6 visitas propias y misma autoridad HR 15/660/216.

## Pendientes reales F10 — no bloquean producción salvo P0 reproducible

1. continuar reconciliación dinámica por sección, no limitar control a total global: Dashboard, HR source, Periodos, Histórico, Visitas, Postulaciones, Reservas, Shoppers, Finanzas/Liquidaciones y superficies Shopper deben leerse contra la autoridad viva correspondiente;
2. diagnosticar focalmente el follow-up Cliente del arnés actual: `page.waitForFunction` no alcanzó ready en 90 s mientras Admin/Shopper sí completaron; no adjudicar producto hasta aislar selector/contexto/runtime;
3. **P1 Claude/prototipo:** `Periodos` e `Histórico` muestran encabezado `Cinépolis JUN` aunque el periodo vivo actual es agosto. Los módulos toman el nombre del programa, no el periodo; revisar semántica/nombre de programa para evitar apariencia de dato obsoleto sin hardcodear meses ni cambiar backend;
4. monitoreo continuo de Auth/RBAC;
5. HR viva/histórica y sync HR↔plataforma con identidades estables, idempotencia y revisión de conflictos;
6. shoppers, postulaciones, certificaciones, visitas y evidencias;
7. liquidaciones/pagos con revisión controlada, sin inferir pagos;
8. errores runtime, performance y release drift;
9. alert delivery y runbooks;
10. profundidad de Academia por rol/módulo como seguimiento P2 de contenido.

## Frontend / Claude

No existe autorización para parche backend sobre UI. Único hallazgo nuevo a revisar por Claude: rótulo contextual `Cinépolis JUN` en `app/modules/periodos.js` y `app/modules/historico.js`. La navegación y los datos vivos no quedaron bloqueados por este hallazgo.

## Reglas vigentes

- prototipo manda; backend no rediseña `/app/modules` ni `/app/core`;
- release F6 permanece inmutable;
- base nueva y limpia; legacy solo export/import útil, nunca conexión/copia de la base vieja;
- multi-tenant `tenantId` + `projectId`;
- Make/Gemini/pagos solo con gate real;
- datos sensibles protegidos y fuera del repo;
- no crear/revivir mecanismo de transporte por rutina;
- F10 no reabre gates terminales sin P0 reproducible;
- toda validación de frescura HR debe usar fuente viva y estado/periodo actual, no snapshots ni totales globales como sustituto.

**NEXT:** `F10_CLIENT_FOLLOWUP_DIAGNOSIS_AND_CONTINUOUS_DYNAMIC_HR_SECTION_RECONCILIATION`.
