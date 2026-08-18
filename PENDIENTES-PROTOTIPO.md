# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 11:51 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-ROOT-CAUSE-RECOVERY-01`  
**Estado:** `I3_11C_PROVIDER_LINK_APPLICABILITY_HOLD__NO_FRONTEND_WORKAROUND__I4_VISIBLE_SLICES_PRESERVED__GO_LIVE_35`

## Pendiente vivo único antes de continuar I3

`NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES`.

No es una corrección de UI. Se debe adjudicar por lectura provider focal qué ocurrió con el link previamente materializado:
- target live `shp-57d2e3769946`;
- canonical esperado `TYA_GT_0C0BA8856E`;
- prior link `irl_3ed1b9a65d36c5873c1306bae1621e9d`;
- global applicable links `1`;
- target applicable links `0`;
- agosto canonical `0`;
- agosto residual live `2`.

Clasificación requerida: `deleted | deactivated | re_scoped | mutated | intact_but_nonapplicable`.

Rules I3.11C ya están PASS/verified/consumed. Staff/Admin existe y runtime está estable. No volver a esos diagnósticos ni crear workarounds visuales.

## No reprocesar

- I1/I2/I3.1→I3.8;
- I3.9/I3.10 congelados PASS;
- Historical Shopper run `31906391682`;
- TARGET_B Admin;
- request08;
- I3.5B/I3.5C-2/I3.8;
- Rules I3.11C run `32163552089`;
- HR 15/660;
- Finance V2/historical;
- legal V0.4 durable.

No crear otro Admin/Shopper como workaround. No credential reset/recovery histórico. No HR reimport. No Finance rebuild. No Rules redeploy por la causa ya cerrada.

## Criterio de cierre I3

Si la adjudicación demuestra drift corregible, se debe documentar primero el write exacto requerido y pedir un solo gate. Después:
- corrección canónica mínima;
- readback inmediato;
- same-state closure;
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- `2` visitas agosto canonical;
- `0` residuales live;
- duplicados `0`;
- I3.9/I3.10 reutilizados sin rerun.

Solo así formal 35% → 60%.

## Pendientes I4 — visibles y Phase A

### Slice A — Shopper onboarding/operación
- documentos/instrucciones;
- certificaciones históricas presentadas y nuevas;
- disponibles;
- postulación;
- asignación;
- perfil/roles/scopes;
- notificaciones;
- histórico completo sin regresión.

### Slice B — agenda y visita
- agendar;
- reprogramar;
- cancelar;
- ventanas/reglas por configuración;
- ejecución;
- evidencias;
- cuestionario;
- submit;
- review/auditoría;
- estados dinámicos.

### Slice C — HR/sync
- Plataforma→HR y HR→Plataforma;
- `tenantId/projectId/visitId/hrRowId/shopperId` exactos;
- `assignmentSource/assignmentSyncStatus/lastSyncedAt`;
- no duplicación;
- conflicto a revisión;
- Make solo bajo gate del bloque real.

### Slice D — Finanzas
- liquidaciones;
- estado de pagos;
- histórico preservado;
- junio operativo;
- honorarios/reembolsos configurables;
- trazabilidad por tenant/proyecto/visita/shopper.

### Slice E — multi-proyecto / no-code
- creación/configuración de nuevos proyectos desde plataforma;
- fuente de roadmap configurable;
- mapping;
- cuestionario/provider/link policy;
- documentos/reglas/certificación;
- agenda/pagos/integraciones;
- roles/notificaciones;
- country/currency/timezone/locale;
- evidencia/privacidad.

## Backlog reusable para prototipo/Claude

El objetivo no-code/comercializable queda explícito:

**TyA no es el producto; es el primer tenant. Cinépolis no es el producto; es el primer proyecto configurable.**

Fuentes roadmap objetivo:
- Google Sheets;
- Excel;
- CSV;
- API;
- plataforma nativa;
- import manual;
- proveedor/plataforma externa;
- link externo cuando aplique.

Flujo objetivo de alta:
`crear proyecto → configurar source → mapear → dry-run → validar → activar → monitorear`.

Todo hallazgo local debe clasificarse y, si es generalizable, pasar a contrato reusable. Claude recibe requerimiento por archivo/módulo + contrato backend + criterios de aceptación; backend no parchea módulos silenciosamente.

## Academia / manuales / notificaciones

Pendiente transversal en cada slice, no al final:
- cursos/manuales;
- rutas por rol;
- instrucciones de proyecto;
- certificaciones;
- notificaciones;
- privacidad/legal cuando aplique.

## Source truth / anti-loop

Pendiente permanente de cada cierre: sincronizar `CXORBIA-EXECUTION-STATE.json`, índice, source lock, checkpoint, plan/current docs y PR con un mismo `SYNC_EPOCH` y verificarlo. Si falta, el gate queda `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`.

## I5 pendiente

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → gate producción → cutover/smoke → baseline productivo → continuidad post-go-live con el mismo protocolo.

## Clasificación

- **Reusable CXOrbia:** Project Builder/config sources, sync exacto, no-code contracts, anti-loop documental.
- **Exclusivo TyA:** reconciliación/evidencia operativa actual.
- **Exclusivo Cinépolis:** primera configuración y datos de Phase A, sin hardcode global.
- **Claude/prototipo:** slices I4 y Project Builder futuro.
- **Academia:** sincronización transversal de material operativo.
- **Sin impacto Claude inmediato:** focal provider identity-link read.
