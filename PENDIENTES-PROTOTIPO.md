# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-14 10:08 -06:00  
**Estado:** `FORENSIC_ROOT_CAUSE_LOCKED__DURABLE_PLAN_ACTIVE__SAME_CANDIDATE__ITERATION_1_NEXT`

## Decisión vigente

El tracker técnico anterior M1–M10 no se usa como porcentaje de readiness productivo. La auditoría forense del 14-ago demostró P0 compartidos de release integrity, Auth/identity, persistencia, Shopper workspace y Finance activation.

No nueva candidata, rama ni PR. Todas las correcciones continúan sobre `docs-tya-v6-v71-audit` / PR #7.

Plan rector: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

## Cerrado y NO REPROCESAR

- Exact Write V2/canonical readback.
- Principal canónico Staff `B=admin`.
- Formulario visible `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Firebase Auth como autoridad y namespace staff/shopper.
- Validación de role/tenant/project/shopper scope.
- Membership/RBAC Staff persistida/probada después de `CX.app.enter()`.
- `tya-c6-live-user-admin-membership-wiring-v1.js`.
- `cxorbia-exact-identity-contract-v1.js`: identidad solo por anclas técnicas exactas, nunca por similitud.
- HR live authority + Firestore protected overlay.
- cumulative read model y portal Shopper canónico.
- source repair Shopper ya PASS source-only; falta desplegar/probar el mismo source lock.
- manifests, rollback, reviewQueue, source locks y gates previos sin drift.

## P0 frontend quirúrgico — MISMA candidata

Estos puntos no autorizan nueva candidata ni rediseño:

1. `app/app.js` (archivo runtime `app.js`): el acceso DEV `pickShopperDev()` no puede interceptar la ruta humana protegida. En runtime protegido, las tarjetas deben delegar exclusivamente al controlador Auth canónico.
2. `app/modules/misvisitas.js`: reemplazar consumo por `find()`/estados literales por listas completas derivadas del read model/facets canónicos; identidad fail-closed conservada.

Aplicación debe ser focalizada sobre la misma rama/source lock y acompañada de regresión. No tocar backend desde Claude ni reinterpretar HR.

## Pendiente backend reusable

- consolidar owner único Auth/runtime sin reconstruir Auth;
- command adapter canónico detrás de la interfaz existente `CX.data`;
- eliminar mutaciones productivas locales/localStorage y false-success;
- alta/edición Shopper persistente Auth + claims + membership + profile/crosswalk;
- HR writer real gated/idempotente, conservando HR live como autoridad de lectura;
- Finance v2 activado por runtime contract, no hostname;
- build SHA/source lock/deploy/paridad remota inseparables;
- E2E real Admin/Ops/Shopper histórico/Shopper nuevo/Cliente + reload/new-tab/persistencia.

## Reusable CXOrbia / no-code

Toda corrección debe aceptar `tenantId/projectId` y configuración de país, moneda, fuente HR, mapping, cuestionario, certificación, pagos, evidencias e integraciones. Cinépolis es una instancia configurable, no lógica global.

## Academia

Actualizar manuales/cursos/checklists/rutas por rol para reflejar:

- login/identidad real;
- estados canónicos de visita;
- creación/edición Shopper persistente;
- sync HR/plataforma real vs pendiente;
- Finanzas: liquidación != pago;
- mensajes de error fail-closed y recuperación.

## Plan de ejecución

1. Iteración 1: source-only root-cause consolidation.
2. Iteración 2: canonical persistence + transversal regression.
3. Iteración 3: DEV Auth/Firestore Shopper persistence (gate write).
4. Iteración 4: HR bidirectional + Phase A E2E + Finance (gate HR/Make cuando aplique).
5. Iteración 5: exact build + preprod + go-live (gates deploy/producción).

No se abre una sexta iteración por rutina. Solo P0 nuevo reproducible o bloqueo externo comprobado.

## Pendiente frontend heredado no bloqueante separado

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. No forma parte de los P0 forenses actuales salvo nueva evidencia reproducible.

## Siguiente acción exacta

`ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION`.
