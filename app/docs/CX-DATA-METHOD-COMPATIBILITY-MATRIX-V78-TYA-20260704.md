# CX.data method compatibility matrix V78 TyA

Fecha: 2026-07-04

## Archivos creados

- `app/core/backend-adapter.compat.v78.disabled.js`
- `app/docs/CX-DATA-METHOD-COMPATIBILITY-MATRIX-V78-TYA-20260704.md`

## Proposito

Definir compatibilidad metodo por metodo para el futuro adapter backend de `CX.data`, usando V78 como baseline vigente.

## Estado del archivo compat

- No esta importado por `index.html`.
- No reemplaza `CX.data`.
- No conecta backend.
- No escribe datos.
- No cambia visuales.

## Matriz metodo por metodo

| Miembro | Tipo | Entrada esperada | Salida compatible | Fallback |
|---|---|---|---|---|
| `status` | sync | ninguna | objeto de estado | estado disabled |
| `routes` | sync | ninguna | rutas backend o null | rutas null sin batch |
| `currentProjectId` | value | ninguna | string o null | proyecto local |
| `project` | read | projectId opcional | proyecto o null | local |
| `projects` | read | ninguna | array de proyectos | local |
| `projectsFor` | read | rol/contexto | array de proyectos | local |
| `setProject` | state-change | projectId | resultado compatible actual | local |
| `visitas` | read | filtros opcionales | array de visitas | local |
| `_visitas` | legacy-array | ninguna | array compatible | local |
| `posts` | read | filtros opcionales | array de postulaciones | local |
| `_posts` | legacy-array | ninguna | array compatible | local |
| `postularVisita` | preview-write-gated | visita/shopper/payload | resultado compatible actual | local si backend disabled |
| `assignVisit` | preview-write-gated | visita/shopper/payload | resultado compatible actual | local si backend disabled |
| `shoppers` | read | filtros opcionales | array de shoppers | local |
| `shoppersFor` | read | proyecto/rol | array de shoppers | local |
| `getShopper` | read | shopperId | shopper o null | local |
| `addShopper` | preview-write-gated | payload shopper | resultado compatible actual | local si backend disabled |
| `updateShopper` | preview-write-gated | shopperId + patch | resultado compatible actual | local si backend disabled |

## Reglas de implementacion futura

1. Primero se resuelve la fuente: demo, local, backend-dev-preview o unavailable.
2. Si la fuente es backend-dev-preview, todas las rutas deben incluir tenantId, projectId y batchId.
3. Las lecturas pueden mapearse a preview.
4. Las escrituras quedan bloqueadas salvo autorizacion especifica de preview.
5. Las respuestas deben ser compatibles con el frontend actual.
6. Si backend falla, debe existir fallback seguro sin romper navegacion.

## Estado

- Matriz documental.
- Compat file inactivo.
- Sin cambios visuales.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
