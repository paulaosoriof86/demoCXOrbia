# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-14 10:42 -06:00  
**Estado:** `ITERATION_1_SOURCE_ONLY_PASS__AUTH_INTEGRATION_FIXED_WITHOUT_UI_REWRITE__MISVISITAS_P0_NEXT`

## Regla principal

No nueva candidata, rama ni PR. No rediseñar. Toda corrección frontend indispensable continúa sobre `docs-tya-v6-v71-audit`, preservando backend/adapters/tools/contratos/documentación.

Plan rector: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

## Auth — NO REPROCESO y estado actual

Se preservan formulario visible único, Firebase Auth, namespaces staff/shopper, role/tenant/project/shopper scope, Admin/Exact Write V2, membership/RBAC Staff, exact identity contract, HR live authority/protected overlay, cumulative read model y portal Shopper canónico.

Iteración 1 corrigió la integración sin reescribir `app.js`:

- `app/adapters/tya-c6-shopper-auth-click-guard-v1.js` ahora delega todos los roles humanos protegidos a `core/backend-browser-auth.js` como owner efectivo;
- no captura clicks;
- no envuelve `authenticate`;
- no crea overlay Cliente separado;
- hace que `_isDevAccess()` resulte false únicamente en la ruta humana protegida, por lo que `pickShopperDev()` queda preservado para lab/demo explícito pero no puede interceptar Auth real.

Gate source-only: `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`, workflow run `31820315435` SUCCESS.

No volver a bundle/password guessing legacy, identidad por nombre/email/teléfono/similitud ni snapshot operacional pre-Auth.

## P0 frontend pendiente — `app/modules/misvisitas.js`

Sigue reproducible y visible: usa `find()` para asignada/agendada/realizada y estados literales, por lo que puede mostrar como máximo una visita por categoría y divergir del read model canónico.

Corrección quirúrgica requerida en Iteración 2, MISMA candidata:

- conservar shopperId exacto fail-closed;
- listas completas, no `find()`;
- derivar categorías desde `visitFacets()`/facets canónicas;
- histórico coherente con portal/Admin/Finanzas;
- no mostrar visitas de otro Shopper/proyecto;
- acciones existentes deben resolver por `CX.data` -> command adapter y mostrar éxito únicamente tras ACK real;
- con writes cerrados: blocked, cero mutación local y cero success toast.

No rediseñar UX ni reinterpretar HR.

## Backend reusable ya preparado

- `cxorbia-command-adapter-v1.js`;
- `cxorbia-shopper-admin-command-contract-v1.js`;
- `cxorbia-hr-write-adapter-contract-v1.js`;
- Finance v2 por runtime contract, no hostname.

Estos contratos son tenant/project scoped y no hardcodean Cinépolis como arquitectura global.

## Porcentaje

Tracker productivo vigente: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

**15% completado / 85% pendiente.**

## Academia

No prometer writes aún. Preparar actualización posterior de login real, Mis Visitas con listas completas/facets, alta Shopper persistente, mensajes fail-closed y estados HR/Finanzas reales.

## Siguiente frontera

Backend + ajuste frontend P0 focalizado: `ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION`.
