## 2026-07-20 - Corte 1A HR viva desplegada en DEV

- V164 y Corte 1A están integrados en `docs-tya-v6-v71-audit`.
- Cloud Run DEV read-only y Hosting DEV pasaron build, deploy y smoke same-origin.
- La plataforma ya no debe depender de conteos fijos ni de un snapshot aprobado como verdad operativa.
- Cada proyecto conserva su propia HR y configuración de cuestionario.
- TyAOnline es solo un proveedor posible de cuestionarios, no el sincronizador general de HR.
- No solicitar nueva candidata ni reabrir el empalme.

### Pendientes localizados para Claude/prototipo

1. KPI y modal deben consumir la misma revisión live y las mismas facets.
2. `Sin submitir` no puede mostrar filas etiquetadas como `Pend. cuestionario`.
3. Panorama debe reproyectarse por periodo; si falta fuente, no mostrar cifras aparentes o estáticas.
4. Reportes Admin deben permitir composición real de columnas y exportar el reporte, no imprimir la página.
5. Reportes de todos los roles deben usar branding configurable del tenant: logo, color, tipografía y gráficas cuando aplique.
6. No alterar contratos backend, endpoint live, watcher, binding R22, IAM ni Hosting desde frontend.
7. Academia y manuales deben explicar lectura viva, revisión de fuente y estados honestos.

### Estado del bloque

- DEV deploy: PASS.
- Producción, writes, imports, pagos y Make/Gemini live: HOLD.
- Pendiente: prueba de cambio real en HR, validación visual, correcciones focalizadas y freeze de Corte 1.

## 2026-07-16 - Candidata interna V156 / gate reportado no coincide con ZIP

- Fuente única de trabajo Claude/prototipo: V156.
- ZIP SHA-256: `8a8672b6403b0eccdd1406ffeaa1942546d100b3c99615549000fd519be65933`.
- Manifest V156: 205 archivos, aggregate `0262675769bf613c933e0872484bd27d38c4adabe28b335f697ae456cc5c0305`, 0 diferencias.
- JavaScript: 66 archivos, 0 fallos.
- El reporte declara 0 coincidencias, pero el ZIP conserva copy visible con `backend`, `runtime`, `pending_backend`, `reviewQueue`, `source_safe` y otros términos internos.
- Regresión nueva: `modules/dashboard.js` muestra el typo `pendienteend`.
- No empalmar todavía: corregir únicamente este P0 comercial y entregar gate estático/runtime reproducible dentro del ZIP.
- No reabrir proyectos, PWA, Finanzas, KPI, periodos, configuración, TyA, Firebase, R11D/R14C, pagos o certificaciones.
- Paquete: `PAQUETE-EXCLUSIVO-CLAUDE-V156-CIERRE-REAL-GATE-COMERCIAL-20260716.zip`.
- SHA-256 paquete: `cfe4a74afc19265af55133c56de1c974f7464dc790f4965b4fbd54cf73ccc58e`.
- La siguiente candidata deriva únicamente de V156.

## 2026-07-16 - Candidata interna V155 / único P0 restante

- Fuente única de trabajo Claude/prototipo: V155.
- ZIP SHA-256: `5dfd63bb7568e5dba9d70d6817b03998b8cb01a3cc144ac17f63fbb8a729ab13`.
- Manifest V155: 204 archivos, aggregate `1c32731bcb249d5e8c2291d89932afbedf42f15687a849865b613aa85f231f51`, 0 diferencias.
- P0 proyectos cerrado: migración tenant-safe y sanitización repetible de fixtures.
- Gates protegidos cerrados: `hasTechAccess=false`, `a_backend` oculto, Finanzas y PWA preservadas.
- No empalmar todavía: queda un único P0 comercial transversal.
- Corregir solo lenguaje técnico visible en roles admin/ops/coordinador/aliado/shopper/cliente y entregar gate automatizado por rol/módulo con 0 coincidencias.
- No cambiar IDs internos, contratos, comentarios ni contenido técnico realmente inaccesible.
- No reabrir proyectos, KPI, periodos, PWA, Finanzas, configuración, TyA, Firebase, R11D/R14C, pagos o certificaciones.
- Paquete: `PAQUETE-EXCLUSIVO-CLAUDE-V155-UNICO-P0-GATE-COMERCIAL-20260716.zip`.
- SHA-256 paquete: `995e5964ada9f3cc3f730fe32de897c0b88394e2a6882a5c51debebf23ddc549`.
- La siguiente candidata deriva únicamente de V155.

## 2026-07-15 - Candidata externa V132 / interna V145

- La diferencia de numeración no bloquea.
- Manifest V145 y sintaxis JavaScript pasan.
- No empalmar todavía: quedan cinco críticos focalizados.
- No rehacer estados ortogonales, KPIs, Postulaciones, Shoppers, Finanzas ni los avances parciales del wizard/PWA.
- Corregir únicamente: periodo de medición visible; cambio MAY/JUN/JUL en runtime source-safe; configuración completa proyecto/tenant/HR; prompt PWA en primera interacción elegible; y restaurar `data.project()` en `finanzas-core.porPais()` conservando `period()` en el adapter local.
- La siguiente candidata debe derivarse directamente de V145. Se auditará solo el delta contra estos cinco críticos y contra la reconciliación protegida V131+R18D.
- Entregar candidata completa, lista exacta de archivos, gates PASS y sin cambios backend/Firebase/datos/R11D/R14C.

## 2026-07-14 - Baseline integrada histórica V131

- V131 permanece como baseline integrada/rollback hasta la promoción atómica de la candidata aprobada.
- No corregir ni revertir la separación proyecto-periodo de `core/finanzas-core.js`.
- Importador debe consumir `CX.dataSource.sourceContract()`.
- El nombre externo del ZIP no es un bloqueo cuando build-lock y manifest internos son consistentes.