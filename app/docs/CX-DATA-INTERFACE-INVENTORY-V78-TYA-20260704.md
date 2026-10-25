# CX.data interface inventory V78 TyA

Fecha: 2026-07-04

## Proposito

Inventariar las llamadas reales a `CX.data` en el prototipo V78 para que el futuro adapter backend preserve la interfaz actual.

## Baseline verificado

- Prototipo vigente: `Prototype development request CXOrbia V78.zip`.
- Source lock: V78.
- Frontend: carril Claude.
- Backend: carril ChatGPT/Codex.

## Miembros CX.data detectados en uso

- `_posts`
- `_visitas`
- `addShopper`
- `assignVisit`
- `currentProjectId`
- `getShopper`
- `postularVisita`
- `posts`
- `project`
- `projects`
- `projectsFor`
- `setProject`
- `shoppers`
- `shoppersFor`
- `updateShopper`
- `visitas`

## Archivos con uso directo de CX.data

- `app/app.js`
- `app/core/automations.js`
- `app/core/cliente-data.js`
- `app/core/dedupe.js`
- `app/core/finanzas-core.js`
- `app/core/hr.js`
- `app/core/importador.js`
- `app/core/programa.js`
- `app/core/router.js`
- `app/core/store.js`
- `app/modules/cliente-extra.js`
- `app/modules/cliente.js`
- `app/modules/configuracion.js`
- `app/modules/documentos.js`
- `app/modules/finanzas.js`
- `app/modules/importador.js`
- `app/modules/reservas.js`
- `app/modules/cert.js`
- `app/modules/clientes.js`
- `app/modules/dashboard.js`
- `app/modules/operacion-extra.js`
- `app/modules/postulaciones.js`
- `app/modules/shoppers.js`
- `app/modules/visitas.js`

## Implicacion para el adapter

El adapter futuro no puede limitarse a visitas y shoppers. Debe preservar tambien:

- seleccion de proyecto;
- lectura de proyectos por rol;
- postulaciones;
- gestion de shoppers;
- asignacion de visitas;
- uso de arrays internos para modulos legacy;
- fallback seguro cuando backend DEV no este disponible.

## Estado

- Inventario documental.
- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
