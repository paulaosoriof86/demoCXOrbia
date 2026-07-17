# AUDITORÍA FORENSE — CANDIDATA CXORBIA V157

Fecha: 2026-07-17  
Fuente auditada: `Prototype development request CXOrbia V157.zip`  
Fuente inmediata exigida a Claude: `Prototype development request fix.zip`

## 1. Identidad y delta

- SHA-256 V157: `847161d6dfefe252d43e317f113fab9298bff6ff92143abdd0521e9d21f1fa48`.
- Archivos totales: 256.
- Delta contra `fix.zip`: 0 agregados, 0 eliminados y 9 modificados.
- Delta contra V156 original: los mismos 9 archivos modificados.

Archivos modificados:

1. `app/core/automations.js`
2. `app/core/ui.js`
3. `app/modules/academia.js`
4. `app/modules/administrabilidad.js`
5. `app/modules/cert.js`
6. `app/modules/configuracion.js`
7. `app/modules/correo.js`
8. `app/modules/crm.js`
9. `app/modules/importador.js`

## 2. Avances reales que deben preservarse

- `ui.statusBdg()` ya no muestra un estado desconocido crudo; usa `Estado pendiente de clasificación`.
- Configuración conserva `source_safe_preview → Vista previa`, elimina el fallback crudo y cambia el rótulo a `Estado de la información`.
- Se retiraron varias apariciones visibles de `backend` en Automatizaciones, Correo, CRM, Certificación e Importador.
- Academia cambió varias referencias visibles de `runtime` por `datos en vivo`.
- Los 66 archivos JS/MJS pasan `node --check`.
- `index.html` carga 66 scripts; no hay scripts locales faltantes ni duplicados.
- Se mantienen 48 módulos registrados sin IDs duplicados.

## 3. P0 demostrado — cierre comercial transversal incompleto

V157 no ejecutó la matriz completa del paquete V2. Continúan rutas y acciones comerciales capaces de renderizar jerga interna.

### Evidencia directa pendiente

- `app/modules/hr-source.js`: conserva fallback fail-open `|| sc.sourceReadMode`; puede renderizar `sourceRef` crudo dentro de `<code>`; conserva `reviewQueue`, `runtimeSyncActive` y estados internos alrededor de acciones administrativas.
- `app/modules/cert.js`: conserva mensajes visibles con `gate`, `backend`, `Auth`, `auditRef`, `preview` y publicación pendiente de confirmación del backend.
- `app/modules/administrabilidad.js`: la pestaña Phase A conserva `activación de backend`; la navegación conserva `Reglas & gates` y contenido explicativo de `gate`.
- `app/modules/crm.js`: la pestaña financiera conserva `Conciliación y cobros reales: pendiente activación backend`.
- `app/modules/finanzas.js`: el detalle de lote conserva `cruce real pendiente backend`.
- `app/modules/automatizaciones.js`: la ruta comercial mantiene el botón `vía Make (gate pendiente)`.
- `app/core/manuales-data.js`: los manuales comerciales todavía explican `pending_backend`, `connectionRef`, payload, adapter, API keys, webhooks y arquitectura interna.
- `app/modules/academia.js`: el curso visible `a_backend_prepared` no está protegido por `hasTechAccess()`; enseña `gate`, `preview`, fixtures, release readiness, synthetic pack y nombres de proveedores/infraestructura a administradores comerciales; el glosario visible conserva estados crudos como `manual_review_required`, `held_for_conflict`, `batchId`, `paymentItemId` y `movementId`.
- `app/core/data-source.js`: `label()` mantiene fallback `|| this.mode`, por lo que un modo nuevo puede mostrarse crudo en el sidebar.

La candidata corrigió 9 archivos, pero no revisó ni clasificó toda la matriz P0-A/P0-B/P0-C exigida. La respuesta anterior de Claude volvió a resolverse como barrido parcial, no como entrega completa.

## 4. Continuidad interna no actualizada

- `app/docs/RESUMEN-PARA-CLAUDE.md` todavía declara `estado V82`.
- `app/docs/PENDIENTES-PROTOTIPO.md` todavía declara `Actualizada 2026-07-04 (V82)`.
- No existe reporte V157, changelog V157, matriz de cumplimiento del paquete V2 ni lista de pruebas ejecutadas/no ejecutadas.
- No existe `MANIFEST-V157.json` ni build-lock V157. Estos dos últimos pueden regenerarse por ChatGPT/Codex después de una candidata frontend completa, pero el árbol entregado no es autoconsistente: `verify-manifest.mjs` reporta 19 diferencias contra `MANIFEST-V156.json`.
- Aggregate real recalculado del conjunto cubierto: `74aea28ad23b59c782944636911fdf5f2c9e896260fb55eb4821277005c645b7`.

## 5. Validaciones técnicas

- ZIP legible: PASS.
- Estructura `app/`: PASS.
- JavaScript/MJS: 0 fallos.
- Scripts locales de `index.html`: 0 faltantes, 0 duplicados.
- Módulos registrados: 48, 0 IDs duplicados.
- Manifest V156 sobre árbol V157: FAIL, 19 diferencias.
- Gate comercial inicial estático: FAIL por evidencia renderizable descrita arriba.
- Gate runtime automatizado: V157 no incluye herramienta/reporte propio. Un intento adicional de navegador en este entorno quedó bloqueado por la política de navegación del navegador, por lo que no se fabricó un PASS runtime.

## 6. Decisión

`P0_PROVEN_COMMERCIAL_GATE_INCOMPLETE_V157`

`HOLD · NO EMPALMAR V157 · NO DEPLOY · NO PRODUCCIÓN`

V157 no pierde sus avances y queda como única fuente para una corrección focalizada final. No se vuelve a V156/fix y no se reabre proyecto/periodo, KPIs, Finanzas, PWA, fixtures, TyA, R11D/R14C, pagos o certificaciones backend.

## 7. Siguiente bloque exacto

Claude debe corregir únicamente los P0 restantes y la continuidad frontend descritos en el paquete focalizado V157. Después:

`auditoría delta V157 → GO/P0 → APPLY_DELTA_DIRECTLY si GO → manifest/build-lock de unión → gates post-empalme → validación visual → freeze → Phase A operativa`

## 8. Clasificación

- **Reusable CXOrbia:** vocabulario comercial fail-closed, separación técnica/comercial, Academia por audiencia y continuidad de candidata.
- **Exclusivo cliente:** ninguno de los cambios solicitados; no hardcodear TyA/Cinépolis.
- **Claude/prototipo:** cierre P0 de copy/rutas/manuales/Academia y actualización de handoff.
- **Academia:** retirar jerga técnica de rutas comerciales y conservar contenido técnico solo en una ruta realmente inaccesible.
- **Sin impacto Claude:** manifest/build-lock de unión, empalme, overlays TyA y gates backend posteriores.

## 9. Estado seguro

Sin empalme, merge, deploy, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.