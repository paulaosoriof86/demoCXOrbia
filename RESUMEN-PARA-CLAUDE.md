# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 12:37 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-FOCAL-ADJUDICATION-02`  
**Estado:** `NO_FRONTEND_PATCH__TARGET_PROVIDER_LINK_INTACT__RUNTIME_TEMPORAL_FORENSIC_NEXT__GO_LIVE_35`

## Estado Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 formal` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% / 65%**.

I3.9/I3.10 frozen PASS. Rules I3.11C PASS/consumed. Focal provider identity-link read PASS/consumed.

## Hallazgo nuevo relevante para frontend

No existe evidencia actual de que el target identity link esté roto en Firebase. Run `32171812808` probó:
- link exacto existente;
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- `tya/cinepolis/hr`;
- `materialized`, `tenant_adjudication`, period-independent;
- normalized applicable/trusted;
- field diff vacío;
- provider collection actual: 2 trusted links, 0 rejected.

Por tanto **no crear UI workaround, no hardcodear canonical ID y no compensar desde módulos**. El problema pendiente es explicar por qué el Staff runtime previo vio solo 1 link y 0 target links.

## Siguiente bloque backend

`I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS`.

Se revisarán chronology/source/event-order/refresh/filtering sin provider read/write. Solo si se prueba un defecto reusable en runtime se emitirá handoff Claude por archivo/módulo y criterios de aceptación.

## Preservar

- interfaz exacta `CX.data`;
- `/app/modules` y `/app/core` sin parches backend ad hoc;
- identidad exacta/crosswalk, no fuzzy matching;
- Staff/Admin existente;
- Historical Shopper frozen;
- I3.9/I3.10 frozen;
- multi-tenant `tenantId/projectId`;
- Cinépolis proyecto configurable, nunca global.

## Producto no-code/comercializable

Configuración por tenant/proyecto debe evolucionar para país/moneda/timezone/locale; source/mapping; documentos/reglas/certificación; disponibilidad/postulación/asignación; agenda/reprogram/cancel; cuestionarios; ejecución/evidencias/revisión; pagos/liquidación; roles/scopes/notificaciones; integraciones/gates; privacidad y Academia.

Fuentes objetivo: Google Sheets, Excel, CSV, API, CXOrbia nativo, import manual y plataforma/proveedor/link externo.

Project Builder objetivo: `crear proyecto → configurar source → mapear → dry-run → validar → activar → monitorear`.

## I4 que llegará a Claude después de I3

1. documentos/certificación/disponibles/postulación/asignación;
2. agenda/reprogram/cancelación/ejecución/evidencias/cuestionario/submit/review;
3. Finanzas/liquidaciones/pagos + multi-proyecto/configuración;
4. roles/scopes/notificaciones/integraciones y HR bidireccional;
5. estados vacíos/conflictos/revisión humana coherentes con autoridad backend.

## Academia

Cualquier cambio funcional posterior que altere acciones, roles, certificación, agenda, evidencias, pagos o configuración debe actualizar cursos/manuales/rutas/notificaciones en el mismo bloque.

## Clasificación

- **Reusable CXOrbia:** provider-state/runtime-state separation y focal identity adjudication.
- **Exclusivo TyA/Cinépolis:** IDs exactos de QA únicamente.
- **Claude/prototipo:** sin cambio UI inmediato; handoff solo si R2B prueba causa reusable.
- **Academia:** sin cambio funcional inmediato.
- **Sin impacto Claude inmediato:** forensic temporal/runtime siguiente.
