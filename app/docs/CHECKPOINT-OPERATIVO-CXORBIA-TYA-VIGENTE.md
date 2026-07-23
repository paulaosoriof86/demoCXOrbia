# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-23  
**Estado:** `V174_ACTIVE_BASELINE_STABLE_VISIT_ID_R20_PASS_CORTE3_FINANCIAL_RECONCILIATION_REVIEWED_PASS_CANONICAL_FINANCE_ADAPTER_NEXT_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama obligatoria: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- No nueva rama, PR, `main` ni force push.
- Producción, merge, imports, pagos y writes reales: no ejecutados.

## 2. Baseline V174 preservada

- V174/M1/Corte 1/Corte 2A: PASS técnico y visual aprobado.
- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Source lock de baseline visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Hosting DEV: vigente.
- HR viva: 14 periodos, 616 visitas y 34 GT/10 HN por periodo.
- Módulos V174, adapters operativos, overlays y `CX.data`: preservados.

## 3. Hallazgos visuales P1/P2

- responsive parcial en algunas tablas y fichas;
- PDF sin gráficas;
- Excel sin formato operativo suficiente;
- etiqueta técnica `sourceAccessMode` pendiente de alineación.

No reabren V174 ni bloquean Corte 3.

## 4. Causa raíz financiera/identidad corregida

La identidad de visita ya no depende de campos mutables de la HR.

Versión canónica:

`tya-stable-visit-id-r20-row-identity-v1`

Campos de identidad:

`tenantId`, `projectId`, `periodKey`, `country`, `sourceRow`.

Campos excluidos:

`cinemaId`, `shopping`, `quincena`, `franja`, shopper, fechas y montos.

La regla está integrada en el filtro runtime del inventario, payload source-safe, postprocesador idempotente y perfiles de gates V174/Corte 3.

## 5. Corte 3 — resultado fresco revisado

- visitas HR: 616;
- filas financieras: 247;
- enlaces exactos: 209;
- filas en revisión: 38;
- review queue: 79;
- filas itemizadas ledger: 37;
- ledger enlazado a visita: 1;
- nuevos exactos revisados: 15;
- exactos previos retirados y retenidos sin vínculo: 2;
- cambio de estado retenido sin vínculo: 1;
- cambios de `hrRowId` canónico: 0;
- registros financieros nuevos/perdidos: 0.

Los dos enlaces retirados mantienen `candidate_amount_or_hr_detail_mismatch`. El cambio de estado mantiene `candidate_shopper_ref_mismatch`. No se resolvieron por nombre ni por inferencia.

## 6. Evidencia reproducible

### Corte 3

- Reviewed-delta run: `30038407143`.
- Job: `89312040827`.
- Artifact: `8576206104`.
- Digest: `sha256:485463c0304f39e8c866514d373a5e365de54640cd0c826869c3b6f386cff91e`.
- Runtime stable-filter run: `30038739598`.
- Request commit: `9a3be4cdbca3c4e234bbcb3cb160b65607b96ceb`.
- Estado: PASS.

### Regresión V174/M1/Corte 2A

- Run: `30039152686`.
- Job: `89314519400`.
- Request commit: `b2c49ba2c237451a93fa1444fdf2894333238ca1`.
- Artifact: `8576510415`.
- Digest: `sha256:d9b3ac061fd8d667939fb5caec66810acfaf1a007d78c17cd685a56ae6b84eeb`.
- Todos los gates funcionales, browser, M1, Corte 2A, propuesta de source lock y verificación del composite propuesto: PASS.

## 7. Qué permanece pendiente en Corte 3

La conciliación backend está en PASS técnico, pero Corte 3 todavía no está congelado visualmente.

Pendiente:

1. generar snapshot financiero canónico source-safe;
2. conectar un adapter único sin cambiar la interfaz de `CX.data`;
3. hacer que Finanzas y Beneficios consuman la misma verdad;
4. probar honorario, boleto, combo/reembolso, total, moneda, liquidación y pago separado;
5. ejecutar gates de UI/exportaciones;
6. Hosting DEV y validación visual con autorización específica.

No se mostrará `paid` sin fuente, fecha, lote, confirmación y referencia de auditoría.

## 8. Siguiente bloque exacto

`SNAPSHOT FINANCIERO CANÓNICO SOURCE-SAFE → ADAPTER ÚNICO → FINANZAS Y BENEFICIOS CONSUMEN LA MISMA VERDAD → GATES UI/EXPORTACIONES → HOSTING DEV Y VALIDACIÓN VISUAL`.

## 9. Clasificación

- **Reusable CXOrbia:** identidad estable de visita, conciliación fail-closed, adapter financiero canónico.
- **Exclusivo cliente:** filas y revisión financiera TyA/Cinépolis.
- **Claude/prototipo:** no modificar ahora los módulos; pendientes responsive/PDF/Excel permanecen localizados.
- **Academia:** identidad estable, diferencia entre conciliación, liquidación y pago.
- **Sin impacto Claude:** runners, artifacts, source-lock propuesto, índice y checkpoint.

## 10. Estado seguro

Sin merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
