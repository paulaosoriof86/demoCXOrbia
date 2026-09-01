# CX.data bridge disabled V78 TyA

Fecha: 2026-07-04

## Archivo creado

- `app/core/cx-data-bridge.v78.disabled.js`

## Proposito

Crear el scaffold inactivo de la cadena futura:

`CX.data` -> connection point -> backend adapter -> fallback local.

## Estado del archivo

- No esta importado por `index.html`.
- No reemplaza `CX.data`.
- No modifica modulos.
- No conecta backend.
- No usa credenciales.
- No escribe datos.
- No activa runtime.

## Dependencias futuras esperadas

- `app/core/backend-connection-point.v78.disabled.js`
- `app/core/backend-adapter.v78.disabled.js`
- `app/core/backend-adapter.compat.v78.disabled.js`

## Funciones cubiertas por el bridge

- `status()`
- `resolve(methodName, args)`
- `project()`
- `projects()`
- `projectsFor()`
- `setProject()`
- `visitas()`
- `posts()`
- `shoppers()`
- `shoppersFor()`
- `getShopper()`
- `addShopper()`
- `updateShopper()`
- `assignVisit()`
- `postularVisita()`

## Regla de continuidad

El bridge solo podra conectarse cuando exista autorizacion explicita para el punto unico. Mientras tanto, el prototipo V78 conserva su `CX.data` actual.

## Estado

- Bridge creado como disabled.
- Sin cambios visuales.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
