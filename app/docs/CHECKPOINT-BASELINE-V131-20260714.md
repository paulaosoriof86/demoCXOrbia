# CHECKPOINT ACUMULADO — BASELINE V131

Fecha de actualización: 2026-07-15

## Baseline viva

- Versión: V131.
- Estado: aceptada y empalmada.
- Commit runtime: `d5c04054d445723dd0bc9e48acbab75953a4b08b`.
- ZIP SHA-256: `19424b2b709a4bff457454bbeff6abe47cd1c52c0f0388fd1a380008c8adc740`.
- Manifest: `docs/MANIFEST-V131-EMPALME-RUNTIME-R1.json`.
- Aggregate SHA-256: `077f366fc17953a46be7927f416ed8b05531b96ae0c55ff958f4dff3dd4645bc`.

## Bloques operativos cerrados

### Plan Firestore completo source-safe

Estado: **PASS**.

- 1,421 operaciones en 4 lotes.
- 14 periodos, 616 visitas, 216 shoppers y 572 liquidaciones candidatas.
- Cero writes, pagos inferidos o certificaciones inventadas.

### R18C — overlays existentes aplicados sin reproceso

Estado: **PASS_EXISTING_R11D_R14C_CERTIFICATION_OUTPUTS_APPLIED_TO_PLAN**.

- Plan `phasea_9f67df19a2b9cd2f`.
- SHA-256 `4701f7bf0cca578702f1e2415a2e9822daf8e6f06da1c4d53bd0d2d4c4865086`.
- 196 enlaces financieros exactos aplicados a visitas.
- 196 enlaces financieros exactos aplicados a liquidaciones.
- 92 revisiones financieras preservadas.
- 1 revisión shopper R11D preservada.
- 0 identidades inventadas.
- 0 pagos confirmados o inferidos.
- 0 certificaciones materializadas.
- R11D/R14C no fueron recalculados.
- Workflow PASS: `29424007188`.

## R18D — preview visible source-safe

Estado: **HOLD_FRONTEND_P0_FINANCE_PERIOD_COMPATIBILITY**.

La copia de build R18D validó correctamente:

- 14 periodos únicos;
- 616 visitas y 44 en JUL 2026;
- 216 shoppers visibles;
- 196 controles financieros exactos como `pending_financial_review`;
- 92 casos financieros preservados en revisión;
- 1 revisión shopper y 1 revisión de certificaciones;
- 216 shoppers en HOLD de certificación;
- 0 pagos, lotes o certificaciones confirmadas;
- 0 solicitudes automáticas repetidas de certificación.

Módulos:

- Shoppers: PASS, muestra 216.
- Certificación: PASS, pendiente de fuente sin resultados inventados.
- Financiero: FAIL por `TypeError: data.period is not a function`.

Causa exacta: `app/core/finanzas-core.js`, función `serieMensual(p,c)`, construye un adapter local con `project()` y `visitas()` pero sin `period()`, requerido por `CX.liq.forProject()`.

Backend no parchó `app/core` ni `app/modules`. Se creó el paquete focalizado:

```text
app/docs/PAQUETE-EXCLUSIVO-CLAUDE-R18D-P0-FINANZAS-PERIOD-20260715.md
```

## Estado de continuidad

- V110 queda como referencia histórica anterior, no como baseline activa.
- No se repite auditoría ni empalme de V131.
- No se reconstruyen HR, periodos, shoppers, importadores, R11D ni R14C.
- El único trabajo frontend abierto es el P0 focalizado de `period()` en `app/core/finanzas-core.js`.
- La próxima candidata debe derivarse directamente de V131 y contener únicamente esa corrección más su manifest/source lock regenerado.

## Siguiente bloque exacto

`R18D-FIX — CORRECCIÓN FOCALIZADA CLAUDE + REEMPALME ATÓMICO + REEJECUCIÓN DE SMOKE`.

Secuencia:

1. Claude aplica `period: () => p` en el adapter local de `serieMensual()`.
2. Entrega candidata completa derivada de V131, sin cambios ajenos.
3. ChatGPT audita solo ese delta y empalma atómicamente.
4. Se reejecuta R18D.
5. Si el smoke pasa, se solicita autorización separada para Firebase Hosting DEV.
6. Después del deploy DEV controlado, Paula realiza la validación visual humana.

## Bloqueos externos vigentes

- Proyecto Firebase DEV nuevo y vacío: creación bloqueada por permisos/política del proveedor; no se reutiliza una base preexistente.
- Pagos: falta evidencia por ítem de fecha, lote y actor antes de `paid`.
- Certificaciones: fuente de carryover materializable todavía vacía.

## Restricciones

Sin deploy, producción, imports reales, Firestore/HR writes, Make/Gemini live ni pagos reales sin autorización específica.