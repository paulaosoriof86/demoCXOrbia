# Pendientes del prototipo — baseline V103 empalmada

## P0

- Portal Cliente: retirar responsables, scores, NPS, fechas y secciones generadas fuera de demo.
- Finanzas: `liquidada` no equivale a `pagada`; no usar fecha de realización como fecha de pago.
- Dashboard: cero KPIs/históricos derivados sin fuente.
- Certificación: preview/pending backend no habilita visitas.
- Permisos: contexto por entidad y país real; no `countries[0]`.
- Academia: controles y handlers con la misma acción/contexto.
- Topbar/copy/manuales: cero fixtures/promesas reales fuera de demo.
- Visitas: no hard-delete de registros HR; soft-delete/cancelación con motivo y auditoría.
- Smoke reproducible y manifest interno correcto.

## P1

- Componentes compartidos de vacío honesto, conflicto, gate y estado degradado.
- Accesibilidad y navegación móvil completa.
- Build ID derivado del source lock de empaquetado.

## Backend-only

Snapshot HR, adapters, base nueva, Auth/claims, reglas, Storage, imports, Make/Gemini, pagos y sincronización no se hardcodean en módulos.
