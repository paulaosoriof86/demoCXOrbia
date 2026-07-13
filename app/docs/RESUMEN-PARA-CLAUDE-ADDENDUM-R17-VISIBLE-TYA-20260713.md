# Resumen para Claude — corrección visible TyA R17

Fecha: 2026-07-13

## Estado

Paula detectó correctamente que la URL DEV anterior no mostraba la información TyA como debía, aunque el payload source-safe existía.

La causa no estaba en el diseño V110 ni requiere una nueva candidata. Estaba en el binding de datos de la build:

- el bridge TyA se ejecutaba antes del selector de origen;
- el selector volvía a modo demo;
- los periodos compartían el ID `cinepolis`;
- el smoke verificaba payload/rutas, no contenido visible.

## Corrección backend/build

- adapter DEV generado después de `core/data-source.js`;
- 14 periodos con IDs únicos;
- 616 visitas vinculadas por periodo;
- 210 shoppers source-safe;
- branding TyA y proyecto Cinépolis visibles;
- proyectos Retail/Banca/Restaurantes excluidos del entorno TyA;
- source-safe visible en estado ready;
- nuevo smoke de contenido visible.

Run `29283637827`: PASS completo.

## Impacto Claude

- P0 frontend nuevo: ninguno.
- No modificar `/app/modules` ni `/app/core`.
- No crear otra candidata por este defecto.
- Mantener los estados honestos `Source-safe (preview)`, `pendiente materialización` y `producción no autorizada`.
- Un futuro cambio visual solo será solicitado si Paula identifica una diferencia real después del redeploy corregido.

## Regla nueva para futuras auditorías

No considerar aprobada una candidata o integración solo porque carga rutas. La evidencia debe distinguir:

- payload presente;
- datos conectados a `CX.data`;
- contenido realmente visible;
- ambiente y gate activos;
- acciones todavía simuladas o bloqueadas.

## Clasificación

- **Reusable CXOrbia:** prueba visible separada de prueba técnica.
- **Exclusivo cliente:** TyA/Cinépolis y conteos.
- **Claude/prototipo:** sin P0 y sin nueva candidata.
- **Academia:** explicar fuente y ambiente visibles.
- **Sin impacto Claude:** adapter build-only y CI.
