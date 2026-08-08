# RESUMEN PARA CLAUDE — V151 CIERRE COMERCIAL

Fecha: 2026-07-16

## Fuente única

La próxima candidata debe derivarse exclusivamente de V151.

## Alcance correcto

Claude mantiene el prototipo comercializable genérico. No configura TyA, Cinépolis ni datos reales.

Conservar los proyectos demo curados:

- Proyecto Retail.
- Proyecto Banca.
- Proyecto Restaurantes.

## Dos P0

1. Limpiar únicamente residuos test del tenant demo: `Proyecto A/B`, `Test Dedupe Unico`, registros marcados fixture y nombres visibles con `(prueba)`. La migración debe ser idempotente y las pruebas deben limpiar lo que crean.
2. Tratar admin/ops/coordinador/aliado como audiencias comerciales. La jerga técnica interna queda solo en ruta `super` protegida. Cero backend/runtime/source-safe/pending_backend/reviewQueue/auditEvents/sourceRef/manifest/source lock/BUILD_ID/rutas `app/docs` en UI comercial.

## No reprocesar

No rehacer R19, KPI, periodos, Finanzas, PWA, HR, pagos ni certificaciones. No tocar Firebase, backend ni adapters.

## Continuidad

`delta V151 → dos gates → promoción atómica → empalme TyA/backend por ChatGPT → Hosting DEV → revisión visual → freeze`.
