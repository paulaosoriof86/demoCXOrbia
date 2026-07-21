## 2026-07-20 - Corte 1A HR viva confirmada; estabilidad y reportes live redeploy PASS

- V164 y Corte 1A continúan integrados en `docs-tya-v6-v71-audit`.
- Paula confirmó con cambios reales que la HR se lee en vivo:
  - fecha de cuestionario actualiza KPI;
  - asignación HR retira la visita disponible del shopper;
  - julio refleja la realidad actual.
- No solicitar nueva candidata ni reabrir empalme, estados canónicos, multi-proyecto, Finanzas, shoppers o histórico.
- El redeploy DEV estabilizó la revisión y restauró la proyección live de reportes.
- Run `29794082358`: PASS completo; source HEAD `42f1c1f9c9f142c34ee92224af425712c7c1e396`.

### Correcciones backend/adapters ya aplicadas — no reabrir desde frontend

1. `backend/runtime/hr-live-service/server.mjs`
   - revisión estable, sin timestamps volátiles;
   - bootstrap rápido y actualización en segundo plano;
   - lectura fresca explícita para watcher.
2. `app/adapters/tya-live-source-refresh-watch.js`
   - no recarga si la HR no cambió realmente;
   - evita repetir la misma recarga en una sesión.
3. `app/adapters/tya-corte1-report-projection-live.js`
   - cuatro reportes operativos derivados del mismo snapshot live.
4. `tools/release/tya-source-safe-live-binding-build-r22.mjs`
   - carga la proyección live antes del watcher.

No modificar estos contratos, endpoint, watcher, binding, IAM o Hosting desde frontend.

### Pendientes localizados para Claude/prototipo

#### P0/P1 — Panorama por periodo

Archivos principales:

- `app/core/cliente-data.js`;
- `app/modules/cliente.js`;
- cuando aplique, `app/modules/cliente-insights.js`.

Requerimiento:

- separar claramente **resultado operativo del periodo** de **score/NPS/secciones pendientes de cuestionario**;
- al cambiar MAY/JUN/JUL, mostrar métricas operativas propias del periodo —realizadas, cuestionarios, submitidas, cobertura y tendencia— usando `CX.data.period()` y la revisión live activa;
- si no existe score validado, conservar `Pendiente de fuente` sin mostrar ceros que parezcan resultados;
- cuando dos periodos tengan el mismo universo de 22 sucursales/44 visitas, explicar visualmente qué sí cambió y qué aún no tiene fuente;
- invalidar cache por periodo y revisión de fuente; no conservar listas del periodo anterior.

#### P0/P1 — Reportes por rol y administración

Archivos principales:

- `app/modules/cliente-extra.js` para portal cliente;
- módulo que registra `Reportes & KPIs` en administración, localizado en la candidata viva;
- helpers de branding/configuración ya existentes, sin duplicar configuración.

Requerimiento funcional:

- Admin debe visualizar y editar la composición real del reporte: seleccionar columnas, notas, orden y alcance;
- imprimir/exportar debe generar el **artefacto del reporte**, no la página completa;
- cliente, admin, shopper y demás roles deben recibir solo reportes permitidos por su alcance;
- PDF/Excel/PPT deben consumir la misma revisión live, periodo, país, sucursal y facets;
- no reintroducir proyecciones de snapshot ni conteos fijos.

Requerimiento de diseño reusable CXOrbia:

- encabezado profesional CXOrbia con logo del tenant;
- nombre del proyecto, periodo, país/sucursal, fecha y fuente;
- colores y tipografía configurados por el tenant;
- pie de página y paginación;
- tablas legibles y responsivas;
- gráficas útiles según reporte: avance, cobertura, tendencia y distribución;
- no usar diseño fijo de TyA/Cinépolis;
- fallback CXOrbia cuando el tenant todavía no tenga branding configurado.

#### Estados honestos

- `Planes de acción`, `Brechas y capacitación` y `Scorecard de marca` continúan `Pendiente de fuente` hasta contar con sus fuentes reales.
- No inferir score, NPS, planes ni brechas desde conteos operativos.

### Academia

Después de la corrección visual:

- actualizar manuales y cursos con lectura viva, actualización por revisión, periodos, estados pendientes y exportación por rol;
- explicar diferencia entre operación HR y resultados del cuestionario;
- mostrar branding y estructura de reportes sin exponer términos técnicos internos.

### Estado del bloque

- HR viva real: CONFIRMADA.
- Estabilidad/revisión y proyección live: DEV PASS.
- Producción, writes, imports, pagos y Make/Gemini live: HOLD.
- Pendiente: validación visual del redeploy, correcciones frontend focalizadas, retiro del workflow temporal y freeze de Corte 1.

---

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
- Gates protegidos cerrados: `hasTechAccess=false`, `a_backend` oculto; no reabrir esos gates.
- No empalmar todavía: queda un único P0 comercial transversal.
- Corregir solo lenguaje técnico visible en roles admin/ops/coordinador/aliado/shopper/cliente y entregar gate automatizado por rol/módulo con 0 coincidencias.
- No cambiar identificadores internos, contratos, comentarios ni contenido técnico realmente inaccesible.
- No reabrir proyectos, KPI, periodos, PWA, Finanzas, configuración, TyA, Firebase, R11D/R14C, pagos o certificaciones.
- Paquete: `PAQUETE-EXCLUSIVO-CLAUDE-V155-UNICO-P0-GATE-COMERCIAL-20260716.zip`.
- SHA-256 paquete: `995e5964ada9f3cc3f730fe32de897c0b88394e2a6882a5c51debebf23ddc549`.

## 2026-07-15 - Candidata externa V132 / interna V145

- La diferencia de numeración no bloquea.
- Manifest V145 y sintaxis JavaScript pasan.
- No empalmar todavía: quedan cinco críticos focalizados.
- No rehacer estados ortogonales, KPIs, Postulaciones, Shoppers, Finanzas ni los avances parciales del wizard/PWA.
- Corregir únicamente: periodo de medición visible; cambio MAY/JUN/JUL en runtime source-safe; configuración completa proyecto/tenant/HR; prompt PWA en primera interacción elegible; y restaurar `data.project()` en `finanzas-core.porPais()` conservando `period()` en el adapter local.
- La siguiente candidata debe derivarse directamente de V145.

## 2026-07-14 - Baseline integrada histórica V131

- V131 permanece como baseline integrada/rollback hasta la promoción atómica de la candidata aprobada.
- No corregir ni revertir la separación proyecto-periodo de `core/finanzas-core.js`.
- Importador debe consumir `CX.dataSource.sourceContract()`.
- El nombre externo del ZIP no es un bloqueo cuando build-lock y manifest internos son consistentes.
