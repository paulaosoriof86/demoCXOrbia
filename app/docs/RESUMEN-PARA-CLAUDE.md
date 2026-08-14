# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-14 11:22 -06:00  
**Estado:** `ITERATION_2_CANONICAL_PERSISTENCE_PASS__MISVISITAS_P0_CLOSED__SAME_CANDIDATE__ITERATION_3_NEXT`

## Regla principal

No nueva candidata, rama ni PR. No rediseñar. Toda corrección frontend indispensable continúa sobre `docs-tya-v6-v71-audit`, preservando backend/adapters/tools/contratos/documentación.

Plan rector: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

Source lock I2: `app/docs/SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`.

## Auth — NO REPROCESO

Se preservan formulario visible único, Firebase Auth, namespaces staff/shopper, role/tenant/project/shopper scope, Admin/Exact Write V2, membership/RBAC Staff, exact identity contract, HR live authority/protected overlay, cumulative read model y portal Shopper canónico.

`core/backend-browser-auth.js` continúa como owner efectivo. No volver a bundle/password guessing legacy, identidad por nombre/email/teléfono/similitud ni snapshot operacional pre-Auth.

## Iteración 2 — PASS

Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE`.

Workflow `CXOrbia Phase A Live Execution Checkpoint`:

- run source I2 `31823098359`: SUCCESS;
- run final de checkpoint/documentación `31823620461`: SUCCESS, `35%/65%`, `iteration=2/5`.

### `app/modules/misvisitas.js` — P0 CERRADO

No volver a corregir el antiguo `find()` por estado. La misma candidata ya contiene `CX_MISVISITAS_CANONICAL_V2`:

- shopperId exacto fail-closed;
- listas completas de asignadas/agendadas/realizadas;
- facets canónicas;
- histórico coherente con contrato de visita/pago;
- agenda/realizada/reprogramación/cancelación dependen de command adapter + ACK;
- no success UI si no existe ACK real;
- check-in no muta la visita local; Storage sigue pendiente explícito.

Preservar UX/layout. No reconstruir el módulo.

## Persistencia canónica que Claude debe respetar

En runtime canónico:

`CX.data -> cxorbia-cxdata-command-boundary-v1 -> cxorbia-command-adapter-v1 -> provider gated -> ACK -> refresh`.

Con writes cerrados: blocked, cero mutación local/localStorage y cero toast de éxito.

No reactivar `backend-firebase.wrapDataMethods()` como local-first ni `cx_shoppers` como verdad productiva.

## Frontend pendiente funcional para I3/I4

### I3 — Shopper/Admin

Cuando el provider DEV sea autorizado:

- `modules/shoppers.js`: alta/edición debe consumir el `CX.data` command boundary en modo ACK-aware y refrescar solo después de provider ACK;
- registro Shopper de `app.js`: mismo flujo canónico; no crear segundo registro/login;
- error/provider conflict debe mostrarse como estado bloqueado/review, nunca inventar credencial ni mostrar éxito antes de ACK;
- password/reset es operación protegida separada, no browser-generated/localStorage.

### I3/I4 — Postulaciones

El firewall ya enruta status simple y reprogramación/cancelación al command boundary. Edición/reasignación compleja, asignación manual y sync HR permanecen fail-closed hasta su conversión ACK-aware. No desbloquearlos con mutación de closure.

### I4 — Cuestionario/evidencias/Reservas/HR

- submit de cuestionario permanece fail-closed hasta persistencia/evidencia canónica;
- Reservas no puede persistir en `cx_reservas_*` en runtime canónico;
- HR write real se activa por adapter/gate, nunca `CX.hr._ext`;
- Storage/evidencias se activan con su gate; preview de foto/GPS no equivale a evidencia persistida.

## Reusable CXOrbia

Ninguna corrección puede hardcodear TyA/Cinépolis dentro de contracts reusables. Tenant/project, país/moneda, fuente HR, cuestionario, certificación, pagos/evidencias e integraciones son configuración/adapters.

## Porcentaje

**35% completado / 65% pendiente.**

I1 15 PASS + I2 20 PASS. I3 vale 25 puntos y es el siguiente bloque.

## Academia

Actualizar solo cuando el provider correspondiente quede activo/probado:

- alta/edición Shopper persistente y errores reales;
- Mis Visitas con múltiples visitas/facets canónicas;
- significado de ACK/persistencia;
- cuestionario/evidencias y HR sync real vs bloqueado;
- rutas por rol/proyecto.

No prometer writes todavía.

## Siguiente frontera

`ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE` — requiere gate explícito DEV write. No reconstruir Auth; activar/probar el contrato existente.
