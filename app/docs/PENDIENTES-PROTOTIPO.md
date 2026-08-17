# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-17 13:26 -06:00  
**Estado:** `UNIFIED_PLAN__NO_REPROCESS__AUTHORITY_COMPOSITION_SOURCE_PASS__I3_RUNTIME_VALIDATION_NEXT`

## Plan prevalente

`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Cortes 0B→8, S1→S6 e I1→I5 son el mismo plan visto desde cobertura funcional, controles forenses y avance formal. No crear plan paralelo ni omitir pasos intermedios.

## Cerrado / congelado — NO REPETIR

- I1 PASS / I2 PASS.
- Historical Shopper run `31906391682` PASS; reset único consumido; `passwordResets=0`; no credential reload/reconcile/recovery.
- request08 consumido/no rerun.
- TARGET_B Admin sign-in PASS `32049054855`; Paula ingresó. No crear/rotar/reemplazar Admin.
- HR viva: 15 periodos / 660 visitas; agosto 44 = GT 34 + HN 10. No reimportar.
- Shopper portal V2, Finance V2, cumulative read model V2, protected HR authority V2, state semantics V2 y exact identity contract: preservar.
- Finance source-safe/histórico de pagos: no reconstruir.
- materialización/deploy legal V0.4 previos: no rerun.

## Root cause source-only ya corregido

1. scope membership `cinepolis` (proyecto raíz/programa) era comparado contra IDs de periodo `cinepolis-YYYY-MM`;
2. `tya-live-source-inplace-apply.js` generaba `hr-post-*` desde asignaciones HR y las presentaba como postulaciones.

Delta: `tya-phase-a-authority-compat-v1.js` + wiring en `index-backend-dev.html`.

Source lock:
`SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md`.

## I3 — pendiente real en orden

1. **I3.2** validar runtime del mismo HEAD y desplegar exactamente ese HEAD a DEV solo bajo gate;
2. **I3.3** Proyecto + 15 periodos + AGO + 660 preservadas;
3. **I3.4** Postulaciones = posts persistidos; assignments HR separados;
4. **I3.5** `identityReviewQueue`/crosswalk exacto agosto, sin fuzzy ni reset histórico;
5. **I3.6** Mi Perfil/Histórico Shopper, identidad exacta y reload/new-tab;
6. **I3.7** provider ACK/readback durable del receipt V0.4 ya aceptado humanamente;
7. **I3.8** Admin create/update de un único Shopper nuevo por provider ACK;
8. **I3.9** Shopper nuevo: Auth/claims/membership/profile/crosswalk + login/reload/new-tab/segundo contexto;
9. **I3.10** KPI derivados `cuestPend`, `sinSubmitir`, `fueraRango` y facets relacionadas contra HR/state semantics;
10. **I3.11** cierre integral same-build.

No considerar I3.8/I3.9 resueltos por el Admin existente o por el Shopper histórico: son pruebas distintas del flujo administrativo de alta/persistencia de un Shopper nuevo.

## I4 — pendientes Phase A completos

1. documentos/instructivos;
2. certificación e histórico, sin repetir certificaciones ya presentadas/aprobadas;
3. disponibles + postulación real;
4. asignación + agenda + reprogramación + cancelación;
5. realizada + cuestionario configurable + submit/revisión;
6. HR bidireccional + Make/Sheets gated + conflictos/no duplicación;
7. Finanzas/liquidaciones/pagos con fuente exacta y períodos históricos preservados;
8. multi-proyecto/configuración por proyecto;
9. roles/scopes Admin/Ops/Shopper histórico/Shopper nuevo/Cliente;
10. evidencias/Storage según flujo real;
11. Academia/manuales/rutas/notificaciones;
12. Gemini gated según necesidad, siempre revisión humana;
13. S6 E2E integral del MISMO build, con persistencia reload/new-tab y negative scopes.

## I5 — pendientes finales

1. freeze sin P0;
2. SHA + manifest/build-lock/verificador;
3. preproducción remota exacta;
4. rollback;
5. E2E same-build;
6. autorización producción;
7. deploy/cutover/smoke;
8. `ACTIVE_BASELINE_PHASE_A_PRODUCTION` y documentación final.

## P1 no bloqueante actual

NDA/confidencialidad se mostró dos veces en la interacción humana. No automatizar aceptación. Sigue P1 mientras no impida login, persistencia de sesión o rutas. El receipt durable sí debe cerrarse en I3.7.

## Prohibiciones

No reimportar HR; no regenerar Shoppers históricos; no alterar Auth/claims/perfiles/passwords históricos; no deduplicar por similitud; no reconstruir Finanzas; no nueva candidata/rama/PR; no reauditoría general; no deploy/merge/producción ni provider write sin gate.

## Acción actual

`I3.2_PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_AND_EXACT_DEV_DEPLOY_NO_REPROCESS`.