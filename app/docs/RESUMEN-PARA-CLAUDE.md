## 2026-07-22 — V174 aplicada; no enviar a Claude salvo corrección focalizada posterior

Estado: `V174_FUNCTIONAL_EMPALMED_GATE_HOLD_NO_DEPLOY`.

La candidata V174 ya fue aplicada de forma atómica en `docs-tya-v6-v71-audit` mediante el commit `b21e494d127fb4b902de5576e3fab0292362b097`.

No pedir otra candidata ni reabrir V174. Si se requiere un bloque posterior para Claude/prototipo, debe ser focalizado al HOLD real:

- overlay preservado `app/core/tya-phase-a-source-safe-preview.js` colapsa ausencias financieras a cero en honorario, boleto y combo;
- el harness local de reportes debe simular `XLSX.utils.encode_range` si se mantiene el gate Node;
- el entorno local de navegador necesita Playwright completo para ejecutar el gate R20.

Backend, adapters live, contratos, CX.data, herramientas y documentación viva fueron preservados. No hubo deploy, merge, producción ni writes reales.

## 2026-07-22 — HOLD focalizado corregido; no pedir nueva candidata

Estado: `V174_HOLD_FIX_APPLIED_R20_SOURCE_IDENTITY_HOLD_NO_DEPLOY`.

El bloqueo de ausencia financiera fue corregido en `app/core/tya-phase-a-source-safe-preview.js`: ausencia ya no se convierte en cero, y `0` real se conserva. El gate Corte 2A canonical pasa.

No enviar nueva ronda a Claude por V174. El pendiente restante es operativo/gate:

- `tya-project-period-kpi-history-gate-r20.mjs` observa conteos correctos de HR viva/local, pero retiene HOLD porque `sourceAccessMode=public_gviz_csv_cache_busted`.
- El builder por inventario verificado también queda en HOLD por `header_not_found` en `JULIO 26`.

Causa raíz metodológica documentada: `PRE_GATE_NOT_RECONCILED_WITH_EXACT_HEAD_OVERLAY_COMPOSITE`.

## 2026-07-21 - V172 empalmada; pendiente post-gates y visual

- Se retracta el supuesto bloqueo por falta de checkout local; fue un desvío metodológico.
- V172 deriva de V171b y corrige únicamente el P0 de identidad Shopper fail-open.
- SHA-256: `2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5`.
- Delta funcional exacto: `app/app.js`, `app/modules/midia.js`, `app/modules/misvisitas.js`, `app/modules/reservas.js`.
- Gate dinámico A/B/sin identidad: PASS.
- 67 JS, referencias locales, hashes/bytes y UTF-8: PASS.
- No existe P0 nuevo reproducible.
- Decisión: `EMPALMED_PENDING_POST_GATES`.
- No solicitar otra candidata ni reiniciar desde V164.
- Preservar reportKit, reportes por rol, branding, gráficas, multiproyecto, Panorama canónico, add-ons aislados, geo-checkin honesto, `mireportes`, router `super` y Novedades por rol.
- Empalme file-aware aplicado en `docs-tya-v6-v71-audit`.
- Delta aplicado: `app/app.js`, `app/modules/midia.js`, `app/modules/misvisitas.js`, `app/modules/reservas.js`.
- V164/Corte 1A, reportKit, PDF/XLSX/PPTX, backend live-HR, Cloud Run, Hosting, IAM y contratos preservados.
- Manifest/build-lock/verificador V172 generados.
- Siguiente acción: post-gates, Hosting DEV autorizado y validación visual.

### Clasificación

- `Reusable CXOrbia`: identidad Shopper fail-closed por `shopperId`.
- `Exclusivo TyA`: validación posterior con shoppers reales; cero hardcode Cinépolis.
- `Claude/prototipo`: V172 ya es la candidata corregida; no abrir otra ronda.
- `Academia`: documentar selección de rol vs autenticación después de aprobación visual.
- `Sin impacto Claude`: backend live-HR, Cloud Run, Hosting, IAM y contratos preservados.

---

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
# Resumen vigente — V172 HR in-place

No enviar a Claude. Este bloque queda registrado solo como estado técnico de rama.

Se aplicó exactamente `PAQUETE_EJECUCION_CODEX_CXORBIA_V172_HR_INPLACE_20260721.zip` en `docs-tya-v6-v71-audit`.

Incluye:
- 14 archivos acumulados V172 faltantes.
- Runtime HR live con refresh in-place.
- Adapter `tya-live-source-inplace-apply.js`.
- R22 live binding actualizado.
- Gate `tya-live-hr-inplace-refresh-gate.mjs`.

Estado: `V172_HR_INPLACE_APPLIED_PENDING_REMOTE_DEV_GATES`.

No producción, no writes, no merge.
