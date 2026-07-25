# AUDITORÍA V175 — Corte 3 P0 PROVEN HOLD

**Fecha:** 2026-07-24  
**Estado:** `V175_P0_PROVEN_HOLD_NO_APPLY_NO_DEPLOY`  
**Baseline viva preservada:** V174  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. EXECUTION_LANE_READY

- ZIP V175 recibido y extraído en la sesión.
- Manifest y cinco hashes SHA-256: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: PASS en los cuatro JavaScript modificados.
- GitHub autenticado y rama viva verificada en `31c481e4c4382fef697aa93be94976b6a832c8cf` antes de la auditoría.
- No se aplicó ningún archivo.

## 2. Delta declarado

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js`;
- `app/app.js`;
- `app/styles/layout.css`.

No se detectaron secretos ni archivos fuera del alcance declarado.

## 3. Correcciones válidas de V175

- elimina `honPaga` del motor y separa devengado/por pagar/pagado;
- pagado exige `paymentConfirmed` y referencia;
- elimina la regla inferida del 85 %;
- agrega copy honesto de análisis determinístico;
- introduce bloques parciales por moneda;
- agrega estructura visual de revisión;
- agrega intento de acceso Shopper visible DEV;
- incorpora wrappers responsive y pista de scroll.

Estas mejoras no bastan para GO porque permanecen P0 reproducibles.

## 4. P0 comprobados

### P0-1 — Selector Shopper DEV expuesto por hostname genérico

`app/app.js` considera DEV cualquier hostname que contenga `web.app` o `firebaseapp`. Esos sufijos también pueden corresponder a Hosting productivo. El selector de identidades Shopper podría aparecer fuera del DEV autorizado.

**Corrección:** allowlist exacta del host DEV o flag de build/runtime fail-closed. Los sufijos Firebase genéricos no autorizan DEV.

### P0-2 — Las dos revisiones canónicas no entran a la bandeja

La bandeja filtra únicamente faltantes de país, moneda, honorario o total. Las dos filas de mayo pueden conservar esos campos y permanecer fail-closed por:

- `reviewRequired=true`;
- `financialSourceStatus='pending_or_review'`;
- `liquidationState='pending_financial_source'`;
- `paymentState='pending_source_confirmation'`.

V175 no filtra ni muestra esos contratos canónicos. No puede demostrar las dos revisiones GT.

### P0-3 — Periodo visible canónico con datos todavía locales

El selector usa `CX.fin.canonPeriods()`, pero Movimientos continúa leyendo `CX.finStore.curPeriod()` para:

- filtrar movimientos;
- presupuesto mensual;
- metadatos de exportación;
- creación de mes siguiente.

Cambiar mayo/julio no garantiza que cambien los datos. El estado paralelo original permanece.

### P0-4 — Multimoneda corregida solo en parte

Todavía se usa la moneda del primer país en:

- tabla de Movimientos;
- CxP;
- ingresos por tipo;
- presupuesto;
- KPIs principales y beneficio total de Beneficios.

Un shopper solo HNL puede ver Q 0 como resumen principal y el valor correcto en un bloque secundario. No es una presentación financiera válida.

### P0-5 — Presupuesto incoherente y potencialmente duplicado

El motor consulta presupuesto por id de proyecto/programa y lo aplica completo dentro de cada país. El módulo lo guarda por id de periodo y periodo local. Puede ignorarse el presupuesto configurado o duplicarse completo en GT y HN con monedas distintas.

### P0-6 — Exportación habilitada sin filas financieras reales

El Dashboard bloquea exportación solo si el proyecto no tiene países. Tener países no equivale a tener filas financieras. Puede volver a producir un reporte con filas cero/derivadas en lugar de fallar cerrado.

## 5. Evidencia entregada por V175

- `01-dashboard-revisiones.png` y `02-bandeja-revisiones.png` tienen SHA-256 idéntico.
- Ninguna de las dos muestra la bandeja de revisión.
- La evidencia no prueba las dos revisiones de mayo.
- La candidata reconoce que no validó los conteos canónicos TyA.

## 6. Gates

- Integridad de paquete: PASS.
- Sintaxis: PASS.
- R26: HOLD con ocho checks fallidos.
- R27 residual: HOLD con trece checks fallidos.

Gate agregado:

`tools/qa/tya-corte3-v175-residual-p0-r27-gate.mjs`.

## 7. Decisión

- V175: `P0_PROVEN_HOLD`.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- Hosting DEV: no actualizado.
- Freeze Corte 3: prohibido.
- Corte 4: no iniciar.

## 8. Clasificación

- **Reusable CXOrbia:** allowlist DEV, periodo único, multimoneda total, presupuesto canónico, review queue y export fail-closed.
- **Exclusivo cliente:** dos revisiones GT y conteos mayo TyA.
- **Claude/prototipo:** cinco archivos de V175.
- **Academia:** seguridad de entorno, periodo canónico, moneda, presupuesto, revisión y evidencia.
- **Sin impacto Claude:** auditoría, gates y documentación.

## 9. Siguiente bloque exacto

`CLAUDE CORRIGE V175 Y ENTREGA V176 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL REAL → APROBADO → FREEZE CORTE 3`.
