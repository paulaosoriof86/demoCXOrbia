# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-14 10:42 -06:00  
**Estado:** `ITERATION_1_SOURCE_ONLY_PASS__SAME_CANDIDATE__ITERATION_2_NEXT__GO_LIVE_15`

## Decisión vigente

El tracker técnico M1–M10 es histórico y no representa readiness productivo. El porcentaje vigente proviene del plan forense durable.

No nueva candidata, rama ni PR. Todas las correcciones continúan sobre `docs-tya-v6-v71-audit` / PR #7.

Plan rector: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

Tracker productivo: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

**15% completado / 85% pendiente.**

## Cerrado y NO REPROCESAR

- Exact Write V2/canonical readback.
- Principal Staff Admin canónico.
- Formulario visible único y Firebase Auth como autoridad.
- Namespace staff/shopper + role/tenant/project/shopper scope.
- Membership/RBAC Staff.
- exact identity contract; cero matching por similitud.
- HR live authority + protected overlay.
- cumulative read model + portal Shopper canónico.
- Iteración 1: Auth owner efectivo consolidado sin reescribir UI.
- Iteración 1: Finance v2 por runtime contract, no hostname.
- Iteración 1: command adapter reusable fail-closed creado.
- Iteración 1: contrato alta/edición Shopper persistente creado.
- Iteración 1: HR writer reusable gated/idempotente creado.
- Iteración 1: source gate `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`, run `31820315435` SUCCESS.
- manifests/rollback/reviewQueue/source locks previos sin drift.

## Pendiente inmediato — Iteración 2

`ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION`

Debe cerrar, todavía sin provider writes:

1. delegar las mutaciones Phase A de `CX.data` al command adapter;
2. eliminar fallback local/localStorage productivo y false-success;
3. cubrir `addShopper`, `updateShopper`, `setVisitState`, `assignVisit`, postulaciones, reprogramación/cancelación y demás mutaciones Phase A;
4. exigir tenant/project scope, RBAC, idempotencyKey, expectedVersion, audit y provider ACK;
5. con writes cerrados: retorno blocked, cero mutación local y cero toast de éxito;
6. regresión de Dashboard, HR/histórico, Shopper, Finanzas, Certificación y Academia sobre read path;
7. prueba source-safe de configurabilidad multi-tenant/multi-proyecto sin inventar datos reales.

Cierre esperado: `SOURCE_READY_FOR_DEV_WRITE_GATES` y acumulado productivo **35%**.

## P0 frontend quirúrgico pendiente — MISMA candidata

`app/modules/misvisitas.js` sigue usando `find()` para estados y literales. Debe pasar a listas completas/facets canónicas en Iteración 2, sin rediseño y sin nueva candidata. Las acciones deben depender del command adapter/ACK.

El bypass Auth de `app.js` no se reescribió: quedó neutralizado únicamente en la ruta protegida por el adapter canónico, preservando el picker DEV para lab/demo explícito.

## Reusable CXOrbia / no-code

Toda corrección debe aceptar tenantId/projectId y configuración de país, moneda, fuente HR, mapping, cuestionario, certificación, pagos, evidencias e integraciones. Cinépolis es una instancia configurable, no lógica global.

## Academia

Pendiente actualizar contenido cuando los writes y flujos reales cierren: login/identidad, Mis Visitas, creación Shopper persistente, sync HR/plataforma, liquidación != pago y mensajes fail-closed.

## Plan restante

- I2: 20%.
- I3: 25% — DEV Auth/Firestore Shopper persistence, gate write.
- I4: 25% — HR bidireccional + Phase A E2E + Finance.
- I5: 15% — exact build + preprod + go-live.

No sexta iteración por rutina.

## Pendiente frontend heredado no bloqueante

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. Fuera de los P0 forenses actuales salvo nueva evidencia reproducible.

## Siguiente acción exacta

`ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION`.
