# CAMBIOS BACKEND — Corte 4 read-only hardening — 2026-07-29

## Estado

`CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_READONLY_HARDENED_PROVIDER_IDENTITY_PENDING`

## Corte 3

- Paula aprobó con `Procede`.
- Baseline creado: `CXORBIA-TYA-CORTE3-V182-20260729`.
- Manifest y freeze documentados.
- No se reabre por P1/P2.

## Corte 4 — archivos creados

- `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`.
- `app/core/backend-cxdata-readonly-corte4.js`.
- `tools/qa/cxdata-firestore-readonly-corte4-gate.mjs`.
- `backend/rules/firestore.corte4-readonly.rules` — candidato no desplegado.

## Archivos modificados

- `app/core/backend-config.js` — read-only estricto por defecto, backend desactivado, vacío permitido, fail-closed.
- `app/core/backend-config-preview-dev.js` — preview DEV solo lectura.
- `app/index-backend-dev.html` — carga el guard antes del bridge UI.
- checkpoint, índice y plan Phase A.

## Causa raíz prevenida

El adapter Firebase existente puede envolver métodos `CX.data` con persistencia Firestore y conservar mock/localStorage cuando el backend está vacío o falla. Corte 4 ahora:

- restaura la interfaz original de `CX.data`;
- bloquea `writeProject`, `writeShopper`, `writeVisit`;
- bloquea acciones operativas públicas;
- representa Firestore vacío como vacío;
- falla cerrado ante error;
- registra `fallbackUsed=false`.

## Rules

`firestore.rules` actual contiene rutas de create/update/delete y no es compatible con la activación read-only de Corte 4. Se preparó `backend/rules/firestore.corte4-readonly.rules`, pero:

- no está desplegado;
- `firebase.json` no apunta a ese archivo;
- no se autoriza deploy por este commit;
- limita la fase bootstrap a lectura de operadores autenticados;
- RBAC shopper/cliente queda para Corte 6.

## Clasificación

- **Reusable CXOrbia:** backend vacío fail-closed, interfaz estable, writeMode disabled, rules candidate no desplegado.
- **Exclusivo TyA:** tenant inicial `tya` y validación futura de `cxorbia-backend-dev`.
- **Claude/prototipo:** sin cambios de módulos UI; preservar el guard y no reintroducir persistencia desde frontend.
- **Academia:** lectura vs escritura, vacío real vs mock, Rules vs guard cliente.
- **Sin impacto Claude:** contratos, rules candidate y gate.

## Estado seguro

Sin provider activation, deploy de Rules, producción, merge, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini.
