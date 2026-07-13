# Resumen para Claude — corrección visible TyA R17

Fecha: 2026-07-13

## Estado

Paula detectó correctamente que la URL DEV anterior no mostraba la información TyA como debía, aunque el payload source-safe existía.

La causa no estaba en el diseño V110 ni requería una nueva candidata. Estaba en el binding de datos de la build:

- el bridge TyA se ejecutaba antes del selector de origen;
- el selector volvía a modo demo;
- los periodos compartían el ID `cinepolis`;
- el smoke verificaba payload/rutas, no contenido visible.

## Corrección backend/build desplegada

- adapter DEV generado después de `core/data-source.js`;
- 14 periodos con IDs únicos;
- 616 visitas vinculadas por periodo;
- 210 shoppers source-safe;
- branding TyA y proyecto Cinépolis visibles;
- proyectos Retail/Banca/Restaurantes excluidos del entorno TyA;
- source-safe visible en estado ready;
- smoke autoritativo de contenido y 13 rutas por rol;
- Firebase Hosting DEV redesplegado sin escrituras de datos.

Redeploy:

- run `29285177647`;
- commit desplegado `cf4c845722e2bbe2b401b2b332ff9f4d2f6cb803`;
- build `tya-visible-r17-source-safe`;
- artifact digest `sha256:756049ce4eb22e279b21f93a74e98e88541a262eb2937cb3141868a006acf9d4`.

Smoke remoto independiente:

- run `29285540738`;
- decisión `PASS_VISIBLE_TYA_DATA_R17`;
- 13/13 rutas;
- 0 blockers, warnings, errores de consola o página;
- artifact digest `sha256:8b849b2248c2d277a2b8434035d4e2679818a89f7a630b0615fdd8fe1277b1f7`.

## Impacto Claude

- No crear otra candidata por el binding R17.
- No modificar ni revertir la conexión build-only.
- Mantener los estados honestos `Source-safe (preview)`, `pendiente materialización` y `producción no autorizada`.
- `Admin Demo` sigue siendo un perfil temporal porque Auth real está HOLD; no presentarlo como usuario real.
- Pendiente visual concreto: en `Mi Día`, el periodo seleccionado es JUL 2026 pero el calendario puede abrir en junio de 2026. Auditar la relación entre selector de periodo y mes del cronograma sin alterar el contrato `CX.data` ni hardcodear Cinépolis.
- Este pendiente es Claude/prototipo; backend no debe parchear `app/modules` ni `app/core`.

## Regla para futuras auditorías

No considerar aprobada una candidata o integración solo porque carga rutas. La evidencia debe distinguir:

- payload presente;
- datos conectados a `CX.data`;
- proyecto raíz y periodo activo;
- contenido realmente visible;
- ambiente y gate activos;
- acciones todavía simuladas o bloqueadas.

## Clasificación

- **Reusable CXOrbia:** prueba visible separada de prueba técnica y proyecto raíz separado de periodo.
- **Exclusivo cliente:** TyA/Cinépolis y conteos.
- **Claude/prototipo:** calendario Mi Día vs periodo activo; sin nueva candidata por el binding.
- **Academia:** explicar fuente, proyecto, periodo y ambiente visibles.
- **Sin impacto Claude:** adapter build-only, CI, Hosting, proof y cleanup.
