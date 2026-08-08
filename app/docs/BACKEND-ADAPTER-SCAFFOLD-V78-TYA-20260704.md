# Backend adapter scaffold V78 TyA

Fecha: 2026-07-04

## Archivo creado

- `app/core/backend-adapter.v78.disabled.js`

## Proposito

Crear un scaffold real e inactivo del adapter backend futuro para `CX.data`, sin conectarlo al prototipo V78.

## Estado del archivo

- No esta importado por `index.html`.
- No reemplaza `CX.data`.
- No modifica modulos.
- No modifica core existente.
- No usa credenciales.
- No se conecta a backend real.
- No escribe datos.

## Funciones previstas

- `status()`
- `routes()`
- `project()`
- `projects()`
- `visitas()`
- `posts()`
- `shoppers()`
- `shoppersFor()`
- `getShopper()`
- `addShopper()`
- `updateShopper()`
- `assignVisit()`
- `postularVisita()`
- `setProject()`

## Razon tecnica

El inventario V78 muestra que los modulos llaman varios miembros de `CX.data`. El adapter futuro debe cubrir esas funciones para evitar cambios en modulos.

## Estado

- Scaffold creado.
- Inactivo.
- Sin cambios visuales.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
