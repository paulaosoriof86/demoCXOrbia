## 2026-07-20 - Corte 1A HR viva confirmada; estabilidad y reportes live redeploy PASS

- V164 y Corte 1A continúan integrados en `docs-tya-v6-v71-audit`.
- Paula confirmó con cambios reales que la HR se lee en vivo: fecha de cuestionario actualiza KPI y asignación HR retira la visita disponible del shopper.
- No solicitar nueva candidata ni reabrir empalme, estados canónicos, multi-proyecto, Finanzas, shoppers o histórico.
- Run `29794082358`: PASS completo; source HEAD `42f1c1f9c9f142c34ee92224af425712c7c1e396`.

### Backend/adapters ya aplicados — no reabrir desde frontend

- `backend/runtime/hr-live-service/server.mjs`: revisión estable, bootstrap rápido y actualización controlada.
- `app/adapters/tya-live-source-refresh-watch.js`: recarga solo ante cambio real y evita bucles.
- `app/adapters/tya-corte1-report-projection-live.js`: cuatro reportes operativos desde el snapshot live.
- `tools/release/tya-source-safe-live-binding-build-r22.mjs`: carga la proyección live antes del watcher.

### Pendientes localizados para Claude/prototipo

#### Panorama por periodo

- `app/core/cliente-data.js`: invalidar cache por periodo y revisión live.
- `app/modules/cliente.js`: separar operación del periodo de score/NPS/secciones pendientes.
- `app/modules/cliente-insights.js`, si interviene en comparativos.
- Mostrar realizadas, cuestionarios, submitidas, cobertura y tendencia del periodo seleccionado.
- Sin score validado, conservar `Pendiente de fuente` sin ceros aparentes.

#### Reportes por rol y administración

- `app/modules/cliente-extra.js`: portal cliente, exportaciones y presentación.
- `app/modules/operacion-extra.js`: `Reportes & KPIs` administrativo y personalización visible.
- Admin debe seleccionar columnas, notas, orden y alcance reales.
- Imprimir/exportar debe generar el reporte, no la página completa.
- PDF/Excel/PPT deben usar revisión live, periodo, país, sucursal y rol activos.

#### Diseño reusable CXOrbia

- logo del tenant;
- colores y tipografía configurados;
- encabezado, fuente, alcance, fecha, pie y paginación;
- tablas legibles;
- gráficas de avance, cobertura, tendencia y distribución;
- fallback CXOrbia cuando no exista branding;
- no fijar diseño o lógica a TyA/Cinépolis.

#### Estados honestos

- Planes de acción, brechas/capacitación y scorecard continúan pendientes hasta sus fuentes reales.
- No inferir score, NPS, planes o brechas desde conteos operativos.

### Academia

- Actualizar después de la corrección visual: lectura viva, revisión, periodos, diferencia HR/resultados y exportación por rol.

### Estado

- HR viva real: CONFIRMADA.
- Estabilidad y proyección live: DEV PASS.
- Producción, imports, pagos e integraciones externas: HOLD.
- Pendiente: validación visual, correcciones frontend focalizadas, retiro del workflow temporal y freeze solo con `APROBADO`.

---

## Historial protegido

- V156/V155: gates comerciales y de lenguaje técnico preservados.
- V145/V131: separación proyecto-periodo, Finanzas y baseline histórica preservadas.
- No reabrir sin evidencia nueva reproducible.
