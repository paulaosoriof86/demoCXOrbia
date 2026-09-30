# RESUMEN PARA CLAUDE — V153 DOS P0 RESTANTES

Fecha: 2026-07-16

## Base única

La siguiente candidata debe derivarse únicamente de V153.

No volver a V151/V149/V131 para desarrollar ni rehacer R19.

## Avances que deben conservarse

- Finanzas: `data.project()` y adapter `project()/period()/visitas()`.
- PWA: un único listener de instalación.
- Catálogo demo curado Retail/Banca/Restaurantes.
- Nombres visibles de roles sin `(prueba)`.
- Cambios de copy ya aplicados.

## Dos P0 exactos

1. Hacer la limpieza de proyectos tenant-safe y repetible: la limpieza legacy solo en tenant demo; los fixtures explícitos se sanitizan en cada arranque; pruebas limpian sus datos.
2. Cerrar el gate comercial transversal: ocultar correctamente `a_backend`, eliminar `?internal=1` como autorización y lograr 0 términos técnicos visibles en todas las audiencias comerciales.

## No tocar

- TyA/Cinépolis.
- Backend/Firebase.
- HR real, adapters e importadores backend.
- R11D/R14C.
- Pagos y certificaciones.
- PWA/KPI/periodo/Finanzas salvo preservar lo ya corregido.

## Entrega

Candidata completa incremental sobre V153, lista exacta de archivos, manifest 0 diferencias y evidencia PASS de ambos gates.

No se requiere ninguna mejora opcional adicional.