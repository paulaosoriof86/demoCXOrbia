# PENDIENTES PROTOTIPO — Addendum V170 HOLD

Fecha: 2026-07-21

## P0

- [Claude/CX] `router.js`: resolver NAV efectivo en `mount`, `buildRail` y `nav`; probar rol `super`.
- [Claude/CX] eliminar fallback shopper `sh1`; identidad faltante debe fallar cerrado.
- [Claude/CX] reportKit debe resolver extensión por exportador y esperar escritura PPT.
- [Claude/CX] Panorama debe usar `CX.data.visitFacets`/`visitBucketFns`; submit explícito.
- [Claude/CX] Reportes Admin debe usar facetas canónicas y excluir canceladas/archivadas.
- [Claude/CX] add-ons aislados por `tenantId + projectId`; eliminar clave global.
- [Claude/CX] geo-checkin no puede afirmar evidencia persistida; sin backend/Storage queda pendiente y fail-closed.

## P1

- [Claude/CX] agregar `mireportes` a navegación Shopper.
- [Claude/CX] retirar rol Admin de geo-checkin o implementar consumidor real.
- [Claude/CX] mejorar PDF comprimido y equivalencia funcional de branding/gráficas en PDF/XLSX/PPTX.
- [Claude/CX] Novedades no debe anunciar como final una función todavía pendiente de persistencia.

## Preservar

- reportKit reusable;
- reportes por múltiples roles/secciones;
- enfoque multiproyecto;
- branding, gráficas y editor;
- Panorama operación/evaluación;
- catálogo add-ons y roles;
- flujo visible de check-in;
- Novedades segmentadas.

## Cierre

`CORRECCIÓN V170 → REAUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`