# Phase A Firestore schema and adapter routes TyA

Fecha: 2026-07-04

## Archivos creados

- `app/contracts/phase-a-firestore-target-schema.v1.json`
- `app/contracts/phase-a-adapter-route-map.v1.json`

## Proposito

Definir colecciones Firestore objetivo y rutas esperadas del adapter para Phase A, sin conectar runtime ni ejecutar escrituras.

## Colecciones objetivo

El schema propone:

- `tenants/{tenantId}`
- `tenants/{tenantId}/projects/{projectId}`
- `tenants/{tenantId}/projects/{projectId}/hrSources/{hrSourceId}`
- `tenants/{tenantId}/projects/{projectId}/visits/{visitId}`
- `tenants/{tenantId}/projects/{projectId}/postulations/{postulationId}`
- `tenants/{tenantId}/projects/{projectId}/assignments/{assignmentId}`
- `tenants/{tenantId}/shoppers/{shopperId}`
- `tenants/{tenantId}/projects/{projectId}/projectShoppers/{shopperId}`
- `tenants/{tenantId}/projects/{projectId}/certificationBanks/{bankId}`
- `tenants/{tenantId}/projects/{projectId}/certifications/{certificationId}`
- `tenants/{tenantId}/projects/{projectId}/reviews/{reviewId}`
- `tenants/{tenantId}/projects/{projectId}/liquidations/{liquidationId}`
- `tenants/{tenantId}/projects/{projectId}/contacts/{contactType}`
- `tenants/{tenantId}/projects/{projectId}/syncEvents/{syncEventId}`

## Reglas clave

- Todo debe tener `tenantId` y, donde aplique, `projectId`.
- Shoppers existen a nivel tenant y se vinculan a proyectos con `projectShoppers`.
- Visits, postulations, assignments, reviews, liquidations y contacts viven por proyecto.
- `syncEvents` registra Make/HR/plataforma.
- Datos sensibles no deben guardarse crudos.

## Adapter route map

El mapa relaciona metodos actuales/futuros con rutas:

- `project`
- `projects`
- `projectsFor`
- `visitas`
- `posts`
- `shoppers`
- `shoppersFor`
- `getShopper`
- `postularVisita`
- `assignVisit`
- `setProject`
- `setVisitState`
- `reviewVisit`
- `liquidationsForShopper`

## Politica de escritura

- Default bloqueado hasta gate.
- Requiere autorizacion explicita.
- Requiere contexto `tenantId/projectId`.
- Requiere llave estable de visita.
- Conflictos van a revision, no sobrescritura.

## Estado

- Contratos creados.
- Sin cambios frontend.
- Sin runtime conectado.
- Sin deploy ejecutado.
- Sin escritura Firestore en este bloque.
