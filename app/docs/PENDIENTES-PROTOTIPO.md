# PENDIENTES-PROTOTIPO.md

> Lista viva de mejoras del prototipo CXOrbia. Actualizada 2026-07-21.
> P0 crítico · P1 importante · P2 posterior · [TyA] específico · [CX] reusable.

## CORTE 1B — CANDIDATA V170 EN HOLD

### Resuelto y protegido

- [Backend] HR viva read-only confirmada con cambios reales.
- [Backend] Cloud Run DEV, Hosting DEV y refresco live desplegados.
- [Backend] Cuatro reportes operativos Cliente disponibles.
- [Gobierno] V170 no se aplicó porque contiene P0 reproducibles.
- [Gobierno] Preservar reportKit, reportes por rol, multiproyecto, branding, gráficas, Panorama, add-ons y Novedades.

### P0 — Router e identidad

- [Claude/CX] `router.js`: resolver NAV efectivo en `mount`, `buildRail` y `nav`; probar rol `super`.
- [Claude/CX] eliminar todo fallback `shopperId || 'sh1'`; identidad faltante debe fallar cerrado.

### P0 — Reportes y estados canónicos

- [Claude/CX] `reportKit`: extensión correcta por exportador y éxito PPT solo después de terminar la escritura.
- [Claude/CX] Panorama debe consumir `CX.data.visitFacets`/`visitBucketFns`; submit exige confirmación explícita.
- [Claude/CX] Reportes Admin debe consumir facetas canónicas y excluir canceladas/archivadas.
- [Claude/CX] Dashboard, detalle, Panorama y reportes deben compartir revisión y conteos.

### P0 — Add-ons y geo-checkin

- [Claude/CX] estado de add-ons aislado por `tenantId + projectId`; eliminar clave global `cx_addons_fx`.
- [Claude/CX] geo-checkin no puede afirmar foto guardada/evidencia sellada sin persistencia real.
- [Claude/CX] sin backend/Storage autorizado: captura local preparatoria, fail-closed, cero PII/foto en localStorage y estado `Pendiente de backend/Storage`.

### P1

- [Claude/CX] agregar `mireportes` al NAV Shopper.
- [Claude/CX] retirar rol Admin de geo-checkin o implementar consumidor funcional real.
- [Claude/CX] mejorar legibilidad PDF y equivalencia funcional de identidad/gráficas en PDF/XLSX/PPTX.
- [Claude/CX] Novedades no debe anunciar como final una función no persistida.

### Fuentes vinculantes

- `app/docs/AUDITORIA-CANDIDATA-V170-CORTE1B-20260721.md`.
- `app/docs/PAQUETE-CORRECCION-CLAUDE-V170-CORTE1B-20260721.md`.

### Cierre pendiente

`CANDIDATA V170 CORREGIDA → AUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`