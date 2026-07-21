# Paquete de corrección Claude — V170 / Corte 1B

Fecha: 2026-07-21
Estado: `P0_PROVEN_CORRECTION_REQUIRED`

## Regla de continuidad

Partir exactamente de la candidata V170 auditada. Preservar reportKit, reportes por rol, multiproyecto, branding, gráficas, editor, Panorama, add-ons y Novedades. No reconstruir desde cero ni volver a V164.

## Alcance autorizado

- `app/core/router.js`;
- `app/core/config.js`;
- `app/core/cliente-data.js`;
- `app/modules/cliente-extra.js`;
- `app/modules/operacion-extra.js`;
- `app/modules/integraciones.js`;
- `app/modules/misvisitas.js`;
- consumidores de `reportKit` ya tocados en V170 únicamente cuando sea indispensable corregir filename/extensión.

## Correcciones obligatorias

1. Crear un resolver único de navegación y usarlo en `mount`, `buildRail` y `nav`; probar rol `super`.
2. Eliminar todos los fallback `|| 'sh1'`; sin identidad shopper, cero filas y fail-closed.
3. Agregar `mireportes` al NAV Shopper.
4. Hacer neutral el spec de reportKit y resolver `.pdf`, `.xlsx` y `.pptx` dentro de cada exportador.
5. Esperar la promesa real de PPT antes de anunciar éxito.
6. Panorama y Reportes Admin deben consumir exclusivamente `CX.data.visitFacets` y `CX.data.visitBucketFns`; submitted exige confirmación explícita; excluir cancelled/archived.
7. Persistir activación/roles de add-ons con scope `tenantId + projectId`; eliminar clave global.
8. Admin solo puede seleccionarse para `geo_checkin` si existe consumidor real.
9. El check-in debe dejar de afirmar foto guardada/evidencia sellada. Sin backend/Storage autorizado: captura local preparatoria, fail-closed, cero PII/foto en localStorage y estado `Pendiente de backend/Storage`.
10. Conservar diseño y gráficas, mejorando legibilidad del PDF y equivalencia funcional por formato.

## Gates vinculantes

- sintaxis de todos los JS tocados;
- inicio sin error para admin/shopper/cliente/super/rol desconocido;
- cero `sh1` fail-open;
- fixture cuestionario con `submit` indefinido permanece `submitted=false`;
- archivadas excluidas;
- Dashboard, detalle, Panorama y reportes coinciden;
- extensiones y firmas correctas PDF/XLSX/PPTX;
- dos tenants en un mismo navegador no comparten add-ons;
- geo-checkin sin foto o GPS no se completa ni se presenta como persistido;
- cero cambios backend/adapters/contratos/IAM/Hosting/producción.

## Entrega requerida

- candidata completa incremental derivada de V170;
- lista exacta de archivos modificados;
- delta por P0/P1;
- resultados de gates;
- capturas de Router super, Reportes Admin/Cliente/Shopper, PDF/PPT/XLSX y add-on;
- impacto Reusable CXOrbia, exclusivo TyA, Academia y sin impacto backend.

## Flujo posterior

`CANDIDATA CORREGIDA → AUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`