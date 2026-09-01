# RESUMEN PARA CLAUDE — Corte 4 · P0-C4-VIS-02

**Estado:** `P0_PROVEN__BACKEND_CORE_ONLY`

No generar nueva candidata ni tocar módulos por este hallazgo.

## Qué pasó

Después de corregir el fallback demo de Corte 4, la base DEV vacía se refleja correctamente como 0 proyectos/visitas/shoppers/postulaciones. Sin embargo, Administración queda en blanco porque el shell/router presupone que siempre existe un periodo/proyecto.

## Propiedad del fix

Backend/core, no frontend modular:

- `app/core/router.js`;
- `app/app.js`;
- eventualmente un helper core de estado vacío, si se decide crear uno.

No tocar `app/modules/*` para resolverlo.

## Patrón reusable a conservar

`BACKEND_CONNECTED + EMPTY_DATASET` es un estado válido. Debe tener render honesto y estable antes de cualquier módulo que requiera proyecto. Cambiar de rol/logout no puede dejar DOM del rol anterior.

## Pendiente Claude

Ninguno por ahora. Solo registrar el patrón para futuras candidatas/Academia una vez backend lo cierre.
