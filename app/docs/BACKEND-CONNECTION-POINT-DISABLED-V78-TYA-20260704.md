# Backend connection point disabled V78 TyA

Fecha: 2026-07-04

## Archivo creado

- `app/core/backend-connection-point.v78.disabled.js`

## Proposito

Definir el punto unico futuro para alternar fuente de datos entre demo, local, backend DEV preview y unavailable, sin conectarlo todavia al prototipo V78.

## Estado del archivo

- No esta importado por `index.html`.
- No reemplaza `CX.data`.
- No modifica modulos.
- No conecta backend.
- No usa credenciales.
- No escribe datos.
- No activa runtime.

## Fuentes previstas

- `demo`
- `local`
- `backend-dev-preview`
- `unavailable`

## Funciones expuestas por el scaffold

- `status()`
- `canUseBackendPreview()`
- `resolveSource(requestedSource)`
- `passthroughLocal(methodName, args)`

## Uso futuro esperado

Cuando se autorice el punto unico, este archivo servira como referencia para decidir la fuente de datos antes de delegar en el adapter. Los modulos no deben enterarse de este cambio ni modificar sus llamadas actuales.

## Estado

- Punto unico documentado y creado como disabled.
- Sin cambios visuales.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
