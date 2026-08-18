# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 12:37 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-FOCAL-ADJUDICATION-02`  
**Estado:** `I3_11C_PROVIDER_LINK_INTACT__TEMPORAL_RUNTIME_FORENSIC_NEXT__NO_FRONTEND_WORKAROUND__GO_LIVE_35`

## Pendiente vivo único antes de continuar I3

`I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS`.

La lectura focal provider ya cerró PASS:
- exact target link existe;
- mapping `shp-57d2e3769946 → TYA_GT_0C0BA8856E` intacto;
- normalized applicable/trusted;
- field diff `[]`;
- provider actual: 2 trusted normalized links, 0 rejected;
- provider writes 0.

No es un pendiente UI y **no requiere reparar el provider link**. Debe explicarse por qué el Staff runtime previo observó 1 link y 0 target links.

## R2B — forensic siguiente

Solo GitHub/source/evidence, provider reads `0`:
- cronología Staff HOLD → focal PASS;
- buscar cualquier ejecución con capacidad/write sobre `shopperIdentityLinks` en el intervalo;
- inspeccionar identidad/provider runtime load order;
- refresh/bus events/cache/signature/filtering;
- determinar si hubo provider state posterior o runtime stale/incomplete;
- cerrar `proven/disproven/unknown` y el mínimo siguiente gate.

## Frozen / no reprocesar

I1/I2/I3.1→I3.10 según PASS; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C; focal provider read `32171812808`; HR 15/660; Finance V2/historical; legal V0.4.

No Admin/Shopper workaround, password/reset histórico, HR reimport, Finance rebuild, Rules redeploy ni provider identity-link repair.

## Criterio de cierre I3

Después de probar causa y aplicar solo el mínimo cambio/validación autorizado:
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E` en runtime Staff;
- agosto canonical `2`;
- residual live `0`;
- duplicados `0`;
- invariantes preservadas;
- I3.9/I3.10 reutilizados sin rerun.

I3 integral PASS → formal **60%**.

## I4 — pendientes visibles

### A. Shopper lifecycle
Documentos/instrucciones, certificaciones históricas/nuevas, disponibles, postulación, asignación, perfil/roles/scopes, notificaciones e histórico.

### B. Agenda/visita
Agendar, reprogramar, cancelar, ventanas/reglas, ejecución, evidencias, cuestionario, submit, review/auditoría, estados dinámicos.

### C. HR/sync
Plataforma→HR y HR→Plataforma con IDs exactos, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`, no duplicación y conflictos a revisión.

### D. Finanzas
Liquidaciones, pagos, junio real, histórico, honorarios/reembolsos configurables y trazabilidad.

### E. Multi-proyecto/no-code
Project Builder/config: source, mapping, cuestionario/provider/link, documentos/reglas/certificación, agenda, pagos, roles/notificaciones, país/moneda/timezone/locale, integraciones, privacidad/evidencias.

## Backlog reusable Claude/prototipo

TyA = primer tenant. Cinépolis = primer proyecto. Cualquier hallazgo generalizable pasa a contrato reusable y handoff por archivo/módulo; nunca hardcode global.

Fuentes objetivo: Sheets, Excel, CSV, API, plataforma nativa, import manual, proveedor/link externo. Alta objetivo: `crear → configurar source → mapear → dry-run → validar → activar → monitorear`.

## Academia

Cursos/manuales/rutas/notificaciones/certificación se actualizan en paralelo a cada slice funcional.

## I5

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → gate producción → cutover/smoke → baseline → continuidad post-go-live.

## Avance

**Formal 35% / 65% pendiente.** R2 focal provider adjudication 100% cerrado; R2B es el siguiente bloque operacional. No se suman puntos formales hasta I3 integral PASS.
