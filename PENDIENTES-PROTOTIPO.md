# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-14 11:20 -06:00  
**Estado:** `ITERATION_2_CANONICAL_PERSISTENCE_PASS__SAME_CANDIDATE__ITERATION_3_NEXT__GO_LIVE_35`

## Decisión vigente

El tracker técnico M1–M10 es histórico y no representa readiness productivo. El porcentaje vigente proviene del plan forense durable.

No nueva candidata, rama ni PR. Todas las correcciones continúan sobre `docs-tya-v6-v71-audit` / PR #7.

Plan rector: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

Source lock I2: `app/docs/SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`.

Tracker productivo: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

**35% completado / 65% pendiente.**

## Cerrado y NO REPROCESAR

- Exact Write V2/canonical readback.
- Principal Staff Admin canónico.
- Formulario visible único y Firebase Auth como autoridad.
- Namespace staff/shopper + role/tenant/project/shopper scope.
- Membership/RBAC Staff.
- exact identity contract; cero matching por similitud.
- HR live authority + protected overlay.
- cumulative read model + portal Shopper canónico.
- I1: Auth owner efectivo, Finance runtime contract, command/shopper/HR contracts.
- I1 marker `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`.
- I2: `CX.data` canonical command boundary como owner final de mutación.
- I2: local mutation/localStorage fallback productivo desactivado.
- I2: provider ACK obligatorio y scope multi-tenant/multi-proyecto fail-closed.
- I2: Shopper localStorage queda solo demo/lab; perfil protegido exige backend/cifrado.
- I2: `app/modules/misvisitas.js` P0 `find()` cerrado con listas completas/facets/ACK.
- I2: direct-write legacy no convertido fail-closed, sin falso éxito.
- I2 marker `PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE`, run `31823098359` SUCCESS.
- manifests/rollback/reviewQueue/source locks previos sin drift.

## Pendiente inmediato — Iteración 3

`ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE`

Requiere gate explícito de writes DEV antes de ejecutar provider changes.

Debe cerrar:

1. registrar/activar el transporte provider real del command boundary para el alcance Shopper/Admin autorizado;
2. Admin crea un Shopper real: validación exacta -> Auth principal -> claims -> membership -> shopper/profile -> crosswalk -> ACK;
3. Admin edita el mismo Shopper con provider readback, sin localStorage;
4. Shopper histórico real resuelve identidad exacta y puede iniciar sesión;
5. Shopper nuevo inicia sesión con el flujo canónico;
6. reload/new-tab y segundo contexto conservan identidad/perfil persistidos;
7. colisiones o anclas ambiguas pasan a review; nunca matching por nombre/email/teléfono/similitud;
8. no regenerar el universo Auth ni repetir Exact Write V2 ya cerrado.

Cierre esperado: Admin + Shopper histórico + Shopper nuevo PASS en DEV con persistencia provider real y acumulado productivo **60%**.

## Flujos que siguen fail-closed hasta provider activation

Esto no es un P0 oculto ni local fallback. Es estado seguro deliberado después de I2:

- alta/edición/registro Shopper todavía no puede mostrar éxito hasta I3/provider ACK;
- edición/reasignación compleja de Postulaciones, asignación manual y sync HR requieren su command/provider flow;
- submit de cuestionario/evidencias requiere persistencia/Storage real;
- Reservas no puede usar localStorage como verdad canónica;
- pagos/lotificación siguen gated por Finance/source exacta.

No reactivar mutaciones locales para sortear estos gates.

## Reusable CXOrbia / no-code

Toda activación mantiene `tenantId/projectId`, país/moneda/configuración, source adapters, RBAC, idempotencia, expectedVersion, audit y ACK. Cinépolis es una instancia configurable, no lógica global.

## Academia

Actualizar cuando I3/I4 cierre provider real: login/identidad, alta Shopper persistente, Mis Visitas multi-registro, mensajes fail-closed, sync HR/plataforma, liquidación != pago y evidencia persistida vs preview.

## Plan restante

- I3: 25% — DEV Auth/Firestore Shopper persistence, gate write.
- I4: 25% — HR bidireccional + Phase A E2E + Finance.
- I5: 15% — exact build + preprod + go-live.

No sexta iteración por rutina.

## Pendiente frontend heredado no bloqueante

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. Fuera de los P0 forenses actuales salvo nueva evidencia reproducible.

## Siguiente acción exacta

`ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE` — solicitar/consumir solo el gate DEV write específico; no desplegar ni tocar HR/Make/Storage/pagos/producción.
