# Post-staging smoke checklist - RC Phase A

Fecha: 2026-07-07

## Bloque completado

Se preparo checklist post-staging para usar en cuanto exista URL del preview channel `rc-phase-a`.

## Estado actual

- El workflow de staging esta creado.
- No hay URL de staging confirmada todavia en esta revision.
- No se confirma deploy ejecutado.
- El flujo sigue seguro mientras no exista URL confirmada ni artifact de staging deploy.

## Validacion post-staging obligatoria

Cuando exista URL de preview/staging, validar:

- login/shell;
- Dashboard;
- Postulaciones;
- Reservas;
- Automatizaciones;
- Cuestionario shopper;
- Finanzas;
- Academia admin;
- Academia shopper;
- consola sin errores criticos;
- copy honesto visible;
- backend real apagado;
- sin mensajes de envio, sync, pago o import real;
- sin datos sensibles visibles.

## Criterio GO

Puede mantenerse como RC Phase A staging controlado si:

- todas las pantallas criticas abren;
- no hay pantalla blanca;
- no hay error JS critico;
- no se activan proveedores reales;
- no se prometen acciones reales;
- Academia carga en admin y shopper.

## Criterio NO GO

Bloquear o corregir si aparece:

- pantalla blanca;
- error JS critico;
- navegacion base rota;
- guard rompe render;
- Academia no carga;
- copy que prometa envio/sync/pago/import real;
- escritura real no autorizada;
- proveedor externo activo;
- datos sensibles visibles.

## Pendiente tecnico

Si no aparece URL de staging, revisar GitHub Actions:

- workflow `CXOrbia RC Phase A Staging Deploy`;
- secret `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`;
- permisos de service account;
- target Hosting `cxorbia-dev`.

## Claude

No hay pendiente nuevo importante para Claude todavia.

Solo avisar si el staging muestra regresion visual real, pantalla critica rota o incoherencia fuerte de Academia.

## Estado seguro

Sin produccion real, sin merge final, sin reglas, sin proveedores reales, sin imports y sin datos sensibles.
