# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-14 10:08 -06:00  
**Estado:** `FORENSIC_ROOT_CAUSE_LOCKED__SAME_CANDIDATE__TWO_FRONTEND_P0_SURGICAL_TASKS__NO_REDESIGN`

## Regla principal

No nueva candidata, rama ni PR. No rediseñar. Toda corrección frontend indispensable se aplica quirúrgicamente sobre la misma candidata/source lock en `docs-tya-v6-v71-audit`, preservando backend, adapters, tools, contratos y documentación.

Backend no debe reconstruirse desde frontend. HR/reglas/datos no se reinterpretan.

Plan rector: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

## Trabajo Auth que NO se reprocesa

Preservar:

- formulario visible único `#loginForm/#lgUser/#lgPass/#lgSubmit`;
- Firebase Auth como autoridad;
- namespaces `staff/shopper`;
- role/tenant/project/shopper scope;
- principal Admin canónico/Exact Write V2;
- membership/RBAC Staff y `tya-c6-live-user-admin-membership-wiring-v1.js`;
- `cxorbia-exact-identity-contract-v1.js` y matching solo por anclas técnicas exactas;
- HR live authority + protected overlay;
- cumulative read model/portal Shopper canónico;
- source repair Shopper ya PASS source-only.

No volver a bundle/password guessing legacy, identidad por nombre/email/teléfono/similitud ni snapshot operacional pre-Auth.

## P0 frontend 1 — `app/app.js`

Problema reproducible documentado: el handler de tarjetas conserva `pickShopperDev()` para Shopper DEV antes de la ruta normal `selectRole()`. En runtime humano protegido eso generó bypass/race y obligó a guards correctivos.

Corrección esperada:

- si el runtime protegido/Auth está activo, Shopper/Admin/Cliente/roles visibles delegan únicamente al controlador canónico de Auth;
- `pickShopperDev()` queda disponible solo para preview/laboratorio explícito NO protegido;
- no crear otra pantalla de login;
- no almacenar credenciales;
- cuando el owner único quede probado, los guards transitorios deben poder retirarse/aislarse sin cambiar UX.

Validación:

- click rápido/tardío/reload/new-tab nunca entra por picker DEV;
- una sola transición Auth;
- error de role/scope fail-closed;
- mismo comportamiento desktop/móvil.

## P0 frontend 2 — `app/modules/misvisitas.js`

Problema reproducible documentado: usa `find()` para asignada/agendada/realizada y estados literales, por lo que puede mostrar como máximo una visita por categoría y divergir del read model canónico.

Corrección esperada:

- conservar identidad fail-closed por `shopperId` exacto;
- derivar listas completas de visitas del Shopper;
- consumir `visitFacets()`/contrato canónico para categorías operativas, cuestionario, submit, liquidación, pago y cancelación;
- mostrar todas las activas aplicables, no una sola por estado;
- histórico completo coherente con Mi Perfil/Admin/Finanzas;
- acciones existentes conservan UX, pero su éxito debe depender del command adapter/ACK cuando backend lo active.

Validación:

- Shopper con múltiples visitas del mismo estado las ve todas;
- conteos coinciden con portal canónico/read model;
- no aparecen visitas de otro Shopper/proyecto;
- reload/new-tab conserva lectura correcta.

## Reusable CXOrbia

Ninguna de estas correcciones puede hardcodear TyA/Cinépolis. La decisión de runtime protegido, project scope y facets debe venir de contratos/configuración.

## Academia

Actualizar únicamente los contenidos/rutas afectados cuando los cambios estén activos: login real, errores de acceso, Mis Visitas con listas completas y estados canónicos. No crear contenido superficial ni prometer writes/sync no activados.

## Siguiente frontera

Backend: `ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION`.

Frontend/Claude: ejecutar únicamente estos P0 cuando el bloque de corrección los requiera, sobre la misma candidata, sin paquete/rediseño paralelo.
