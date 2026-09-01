# CXOrbia TyA — Validación visual y lock anti-regresión Corte 1 / M1

Fecha: 2026-07-22  
Estado: `CORTE_1_M1_APROBADO_CON_P1_P2_DOCUMENTADOS`  
Build funcional validado en DEV: `67c0943260f076f5686284ac509458ed5fd34dbd`  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama viva: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## 1. Decisión

La validación visual de Paula y la revisión crítica de capturas/exportaciones no demostraron ningún P0 que impida cerrar Corte 1 / M1.

Corte 1 / M1 queda aprobado con pendientes P1/P2 documentados. Esto no equivale a producción, merge ni cierre de Phase A.

Se congela como verdad funcional del corte:

- lectura HR runtime viva y source-safe;
- actualización en memoria sin recarga visible;
- cambio correcto de periodos;
- actualización automática de KPI ante cambios controlados de asignación/cuestionario;
- coherencia de conteos entre Dashboard Admin, Panorama Cliente y reportes operativos;
- retiro de visitas disponibles del portal shopper cuando HR asigna shopper;
- comportamiento fail-closed del reporte shopper sin identidad verificable.

## 2. Evidencia coherente comprobada

### Julio 2026

- 44 visitas: GT 34, HN 10.
- 41 asignadas: GT 32, HN 9.
- 3 sin asignar: GT 2, HN 1.
- 28 realizadas: GT 21, HN 7.
- 26 con cuestionario: GT 20, HN 6.
- 20 submitidas: GT 16, HN 4.
- 6 sin submitir.
- 2 cuestionarios pendientes.
- 0 pagos confirmados.

Dashboard Admin y Panorama Cliente coinciden en 44 visitas, 28 realizadas, 26 cuestionarios y 64% de cobertura. Los reportes exportados reproducen los mismos totales y desgloses.

## 3. Hallazgos críticos independientes

### P1 — Admin / Visitas usa estado visible no canónico

Archivo: `app/modules/visitas.js`.

La tabla renderiza `v.estado` directamente, mientras los KPI usan buckets/facets canónicos. Esto explica que Dashboard sea correcto y la columna Estado de Mis visitas/Visitas Admin no coincida con la semántica HR.

Corrección requerida en Corte 2: una sola proyección canónica para estado operativo, asignación, agenda, ejecución, cuestionario, submitido, liquidación y pago. Ninguna pantalla debe derivar el estado visible desde el texto crudo de `v.estado`.

### P1 — Ceros financieros falsos

Archivos relacionados:

- `app/core/tya-phase-a-source-safe-preview.js`;
- `app/modules/visitas.js`.

El bridge convierte honorario/boleto/combo ausentes a `0`; la tabla muestra `Q 0`. Un valor desconocido no debe convertirse en cero real. Debe conservarse `null`/pendiente de fuente hasta el bloque financiero.

### P1 — Reasignación incompleta

Archivo: `app/modules/postulaciones.js`.

El modal Reasignar solo permite elegir otro shopper. La fecha/franja está en una acción separada de Editar. La reasignación debe mostrar la fecha vigente y permitir elegir explícitamente:

- conservar fecha/franja;
- cambiar fecha/franja;
- dejar pendiente de agendamiento cuando corresponda.

No debe inferir ni borrar fecha silenciosamente.

### P1 — Exportar Postulaciones sin implementación

Archivo: `app/modules/postulaciones.js`.

El botón Exportar existe, pero no tiene identificador ni listener. Debe exportar únicamente el alcance filtrado y el periodo activo, con fuente/revisión y columnas autorizadas.

### P1 — Valor `undefined` visible

Archivo: `app/modules/postulaciones.js`.

La tarjeta imprime el teléfono sin fallback y muestra `undefined`. Debe presentar `Dato protegido`, `No disponible` o una referencia source-safe según rol; nunca el literal técnico.

### P1 — Calidad multiformato de reportes

Archivos/módulos relacionados:

- `app/modules/operacion-extra.js`;
- `app/modules/cliente-extra.js`;
- `app/adapters/tya-corte1-report-projection-live.js`;
- report kit/exportadores compartidos.

Validación de archivos reales exportados:

- Los datos de Excel son correctos, pero el libro carece del diseño aprobado del tenant, anchos adecuados, jerarquía visual, tablas/gráficas y branding. Hay textos truncados por columnas estrechas.
- Los PowerPoint contienen tablas y gráficas básicas, pero no incorporan el logo real del tenant y el diseño es genérico.
- En el resumen ejecutivo, la gráfica usa dos categorías idénticas `2026-07`; debe distinguir país/serie para no ser ambigua.
- La gráfica visible en preview no está preservada de forma consistente en todos los formatos. Cada formato debe tener una representación equivalente, no necesariamente idéntica.
- La personalización de columnas debe provenir de un catálogo completo por tipo de reporte y fuente. Para Cobertura por país, País/Realizadas/Total/Cobertura son coherentes; la limitación está en el catálogo general y en otros reportes.

Este bloque es P1 comercial/operativo y no bloquea M1.

### P2 — Fórmulas y copy

- El KPI `Efectividad 69%` requiere definición visible y gate de fórmula para que no sea una cifra opaca.
- El subtítulo del Dashboard duplica referencias de país (`GT/HN · GT HN`).
- Las exportaciones deben mostrar fecha/hora y revisión de fuente de manera uniforme.

### Comportamiento correcto que no es bug

`Mis Reportes` del shopper permanece bloqueado cuando la sesión dice `Evaluador (sin identidad)`. Es un fail-closed correcto: no deben mostrarse reportes de otro usuario. Se validará con identidad real cuando llegue Auth/RBAC.

## 4. Lock anti-regresión obligatorio

La lectura HR actual no se protege con una captura congelada ni con conteos hardcodeados. Se protege con invariantes reproducibles.

### Invariante 1 — Una fuente y una revisión

Dashboard Admin, Visitas, Postulaciones, Panorama Cliente, reportes y portal shopper deben consumir el mismo `tenantId`, `projectId`, `periodId` y `sourceRevision` de la lectura runtime.

### Invariante 2 — Refresco in-place

El watcher no puede usar `location.reload()`. Una revisión nueva debe aplicarse en memoria, invalidar proyecciones y emitir los eventos de contexto/visita correspondientes.

### Invariante 3 — Fresh remoto fail-closed

Todo deploy DEV debe comprobar `fresh=1`, `cacheOrigin=runtime_refresh`, ausencia de `refreshError` y cero blockers de encabezados/columnas. Si falla, no se conserva un snapshot anterior como verdad silenciosa.

### Invariante 4 — Estados ortogonales canónicos

Toda superficie visible debe usar las mismas facets canónicas. Se prohíbe usar el texto crudo `v.estado` como única verdad para representar simultáneamente asignación, agenda, ejecución, cuestionario, submitido, liquidación y pago.

### Invariante 5 — Ausencia no equivale a cero

Campos financieros, calidad, score, tiempo y cualquier dato no disponible deben conservarse como `null`/pendiente de fuente. No se convierten a cero salvo que la fuente confirme cero.

### Invariante 6 — Canary funcional sin recarga

Antes de cada freeze/deploy se prueba, en fuente controlada:

1. asignar o retirar shopper;
2. confirmar o retirar cuestionario;
3. verificar que cambian solo los KPI y listados esperados;
4. confirmar que el portal shopper retira/agrega la visita correcta;
5. confirmar que no hay pantalla blanca, recarga completa ni estado degradado.

### Invariante 7 — Coherencia transversal

Para el mismo periodo y revisión:

- total Admin = total Cliente = total reportes;
- realizadas Admin = realizadas Cliente = realizadas reportes;
- cuestionarios Admin = cuestionarios Cliente = cuestionarios reportes;
- asignadas + sin asignar = total;
- submitidas + sin submitir debe respetar el universo aplicable;
- ningún pago se infiere.

### Gates mínimos que permanecen obligatorios

- `tya-hr-header-variants-r20-gate.mjs`;
- `tya-live-hr-inplace-refresh-gate.mjs`;
- `tya-corte1-context-history-reports-gate.mjs`;
- `tya-corte1-report-frontend-runtime-gate.mjs`;
- `tya-project-period-kpi-history-gate-r20.mjs`;
- smoke remoto y validación visual.

Siguiente hardening reutilizable: consolidar estos controles en un gate compuesto de regresión que falle si cualquier superficie se separa de la misma revisión o vuelve a usar estado crudo/cero inventado.

## 5. Clasificación

- **Reusable CXOrbia:** lock de revisión única, refresco in-place, facets ortogonales, null distinto de cero, canary y coherencia transversal.
- **Exclusivo cliente:** variantes de encabezado y mapeo HR TyA/Cinépolis.
- **Claude/prototipo:** Visitas Admin, reasignación con fecha, Exportar Postulaciones, eliminación de `undefined`, reportes multiformato y catálogo de columnas.
- **Academia:** explicar fuente viva, revisión, refresco sin recarga, estados ortogonales, ausencia vs cero, reportes por formato y seguridad fail-closed del shopper.
- **Sin impacto Claude:** gates de runtime/fresh/header y evidencia de deploy DEV.

## 6. Siguiente bloque exacto

`CORTE 2A — CICLO SHOPPER Y OPERACIÓN CANÓNICA: Visitas Admin con facets canónicas + postulaciones/reasignación/fecha/exportación + canary de asignación/cuestionario, preservando el lock de Corte 1.`

El hardening de reportes multiformato entra como P1 transversal del siguiente bloque y no reabre ni bloquea M1.

## 7. Estado seguro

Sin merge, producción, importación real, escrituras HR/Firestore/Auth/Storage, Make/Gemini live ni pagos reales.
