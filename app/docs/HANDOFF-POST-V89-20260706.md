# Handoff post V89

Fecha: 2026-07-06

V89 queda como working candidate controlada, no como source lock final.

Mejoras locales a conservar:

- Ajustar textos operativos para usar preparado, preview o pendiente backend.
- Separar cuestionario realizado, submitido, revision, liquidacion y pago.
- Mantener Academia con IDs unicos: a_backend_prepared y a_ops_conflicts_route.
- No redisenar ni activar integraciones reales.

Archivos prioritarios:

- app/modules/postulaciones.js
- app/modules/dashboard.js
- app/modules/automatizaciones.js
- app/modules/cuestionario-shopper.js
- app/modules/reservas.js
- app/modules/correo.js
- app/core/topbar.js
- app/modules/finanzas.js
- app/modules/beneficios.js
- app/modules/academia.js
- app/core/manuales-data.js

Referencia principal:

- app/docs/MODIFICACIONES-LOCALES-POST-V89-P0-TEXTOS-HONESTOS-20260706.md
- app/docs/PENDIENTES-POST-EMPALME-V89-SIN-CLAUDE-20260706.md
