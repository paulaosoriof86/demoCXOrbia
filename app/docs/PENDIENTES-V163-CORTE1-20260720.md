# Pendientes Corte 1 después de V164

Fecha: 2026-07-20
Estado: `TECHNICAL_PASS_PENDING_VISUAL`

## Resuelto

- Alcance Sucursal: los cuatro reportes usan solo `branchRows` de la sucursal resuelta.
- Sin `periodKey`: fail-closed, sin fallback a `latestPeriod`.
- Tendencia excluye el periodo activo.
- Coincidencia normalizada de sucursal exige unicidad.
- PDF, XLSX y PPTX reales.
- Nombres de archivo por alcance.
- 4 reportes disponibles y 3 pendientes de fuente.
- Gates frontend, runtime y navegador: PASS.

## Pendiente real

1. Autorización de Paula para Hosting DEV.
2. Publicar el build exacto.
3. Ejecutar smoke remoto.
4. Revisión visual de Paula.
5. Corrección focalizada solo si aparece una diferencia reproducible.
6. Aprobación y freeze Corte 1.

No se requiere otra candidata de Claude en este momento. Corte 2 continúa bloqueado hasta el freeze.
