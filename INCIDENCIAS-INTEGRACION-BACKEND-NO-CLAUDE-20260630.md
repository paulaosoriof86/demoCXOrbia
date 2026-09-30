# INCIDENCIAS-INTEGRACION-BACKEND-NO-CLAUDE-20260630

## Incidencia metodologica

Se uso `app/index-backend-dev.html` de la rama backend/migracion como si fuera una prueba del prototipo visual completo.

Ese archivo es un preview DEV de backend. No representa la base visual buena del prototipo y no debe usarse para decidir si el prototipo esta completo.

## Aclaracion para Claude

La falla observada al revisar `index-backend-dev.html` no debe documentarse para Claude como bug del prototipo.

Claude solo debe recibir errores reales reproducidos sobre la base visual buena del prototipo, o mejoras reales pendientes de implementar en esa base.

## Criterio correcto

- La validacion visual debe hacerse desde `app/index.html` en la rama RC basada en `origin/main` V56.
- `app/index-backend-dev.html` debe tratarse como preview DEV aislado.
- Los errores de integracion backend no deben confundirse con pendientes funcionales del prototipo V56.
