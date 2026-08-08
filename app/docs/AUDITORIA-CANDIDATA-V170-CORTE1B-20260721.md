# Auditoría candidata V170 — Corte 1B

Fecha: 2026-07-21
Decisión: `HOLD_P0_PROVEN`

## Identidad

- Candidata: `Prototype development request (14).zip`.
- SHA-256: `c7819bbd28436d0ae22fabf0d7339e8b6ad4d653e950fed45cf1407641b8eaa3`.
- Rama viva auditada: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- `EXECUTION_LANE_READY`: confirmado; ZIP extraído, repo autenticado y rama viva comprobada.
- Aplicación a la rama viva: **no ejecutada**, por P0 reproducibles.

## Mejoras reales que deben preservarse

- motor reusable `CX.reportKit`;
- PDF, Excel y PPT en múltiples roles/secciones;
- editor de columnas, notas y gráficas;
- enfoque multiproyecto sin hardcode de Cinépolis;
- separación conceptual de operación y evaluación en Panorama;
- catálogo de add-ons con selección de roles;
- check-in geolocalizado visible para Shopper;
- Novedades segmentadas por rol.

Los 15 JavaScript incluidos pasan sintaxis. El HOLD no invalida el avance; impide aplicar fallos críticos junto con él.

## P0 demostrados

### 1. Router `super` sigue expuesto

`app/core/router.js` protege `buildRail`, pero mantiene accesos directos `CX.NAV[role].flatMap(...)` en `mount` y `CX.NAV[role].find(...)` en `nav`. Como `CX.NAV` no define `super`, el inicio o navegación aún puede lanzar `TypeError`.

### 2. Reportes Shopper fallan abiertos

`app/modules/operacion-extra.js` usa `shopperId || 'sh1'` en más de un flujo. Sin identidad verificable puede mostrar información de otro shopper. Debe fallar cerrado con cero filas y exportación bloqueada.

### 3. Extensión multiformato incorrecta

`CX.reportKit.openReport(spec,key)` reutiliza el mismo `spec.filename`. Varios consumidores abren el selector con un spec `.pdf`; Excel/PPT pueden producir contenido XLSX/PPTX con nombre `.pdf`. La extensión debe resolverse dentro de cada exportador.

### 4. Panorama reintroduce estados duplicados

`app/core/cliente-data.js` redefine `done`, `cuest` y `subm`. La regla `cuestFecha && submit !== false` cuenta como submitida una visita con `submit` indefinido. Contradice las facetas canónicas de `CX.data.visitFacets` y puede reabrir la inconsistencia cuestionario/submitido.

### 5. Reportes Admin duplican estados y pueden incluir archivadas

`app/modules/operacion-extra.js` redefine estados y no deriva todas las filas de `visitFacets`/`visitBucketFns`. Puede divergir de Dashboard, detalle y Panorama e incluir visitas canceladas/archivadas.

### 6. Add-ons sin aislamiento multi-tenant

`app/modules/integraciones.js` usa la clave global `cx_addons_fx`. No contiene `tenantId` ni `projectId`; activación y roles pueden filtrarse entre tenants/proyectos en el mismo navegador.

### 7. Foto geolocalizada no es evidencia persistida

`app/modules/misvisitas.js` guarda solo el nombre del archivo, muta `v.geoCheckin` en memoria y permite guardar sin GPS. Al recargar se pierde, pero la UI afirma `evidencia sellada`. Debe quedar fail-closed como preparación pendiente de backend/Storage o implementarse después con autorización separada, privacidad, hash, timestamp servidor y persistencia real.

## P1 importantes

- `mireportes` está registrado, pero no está agregado al NAV Shopper.
- `geo_checkin` permite seleccionar Admin sin consumidor funcional real.
- El PDF observado comprime columnas; PPT/Excel no demuestran todavía equivalencia integral de identidad/gráficas.
- `exportPPT` puede informar éxito antes de resolver la escritura asíncrona.

## Gates de salida

1. Router probado con admin/shopper/cliente/super/rol desconocido.
2. Cero fallback `sh1`; identidad Shopper fail-closed.
3. PDF `.pdf`, XLSX `.xlsx`, PPTX `.pptx` en todos los consumidores.
4. Panorama y Reportes Admin usan únicamente `CX.data.visitFacets`/`visitBucketFns`.
5. Add-ons aislados por `tenantId + projectId`.
6. Check-in no promete persistencia ni sello sin backend autorizado.
7. HR viva, Corte 1A, adapters, contratos, Cloud Run y Hosting preservados.

## Clasificación

- **Reusable CXOrbia:** reportKit, aislamiento multi-tenant, facetas canónicas y evidencia de campo.
- **Exclusivo TyA:** validación con HR/proyectos TyA, sin hardcode Cinépolis.
- **Claude/prototipo:** correcciones frontend localizadas.
- **Academia:** reportes, add-ons, privacidad y diferencia entre captura local/evidencia sincronizada.
- **Sin impacto Claude:** backend live-HR, Cloud Run, Hosting, IAM y contratos.

## Estado seguro

Sin merge, deploy, producción, importaciones, escrituras HR/Firestore/Auth/Storage, Make/Gemini live ni pagos.