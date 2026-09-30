# CORTE 3 — SNAPSHOT FINANCIERO CANÓNICO + ADAPTER ÚNICO R23

**Fecha:** 2026-07-23  
**Estado:** `IMPLEMENTED_SOURCE_SAFE_PENDING_REMOTE_UI_GATES`  
**Producción:** no  
**Pagos ejecutados:** 0

## 1. Objetivo

Convertir la conciliación financiera R20 revisada en una única verdad source-safe consumible por Finanzas y Beneficios, sin cambiar la interfaz pública de `CX.data`, sin tocar módulos frontend y sin inferir pagos.

## 2. Fuente exacta

- Run: `30038407143`.
- Artifact: `8576206104`.
- Digest: `sha256:485463c0304f39e8c866514d373a5e365de54640cd0c826869c3b6f386cff91e`.
- HR R20: 616 visitas.
- Filas financieras: 247.
- Enlaces de identidad exactos: 209.
- Filas sin vínculo exacto: 38.
- Review queue de vínculo: 79.
- Evidencias candidatas de ledger: 37.

## 3. Hallazgo nuevo de consistencia de montos

La revisión del snapshot detectó dos filas con vínculo de identidad exacto, pero con inconsistencia entre el total de la fuente y la suma `honorario + boleto + combo`.

Decisión fail-closed:

- los 209 vínculos exactos se preservan;
- 207 quedan listos para consumo canónico de montos;
- 2 pasan a `amountReviewQueue`;
- esas dos filas no se exponen como montos canónicos en Finanzas o Beneficios;
- no se corrige, completa ni reemplaza silenciosamente ningún total.

## 4. Archivos funcionales

- Familia `app/data/tya-financial-canonical-source-safe*.js`
  - snapshot source-safe visible en DEV, serializado en chunks determinísticos y ensamblado antes del adapter;
  - 209 vínculos exactos;
  - 207 montos canónicos utilizables;
  - 79 revisiones de vínculo;
  - 2 revisiones de consistencia de montos;
  - 37 evidencias candidatas de ledger;
  - cero pagos y cero lotes.

- `app/adapters/tya-financial-canonical-source-safe-adapter.js`
  - conserva la interfaz de `CX.data`;
  - indexa por `visitId` y `hrRowId` estable;
  - reemplaza únicamente la lectura de liquidaciones en el build DEV;
  - hace que Finanzas y Beneficios consuman `CX.liq.forProject()` desde la misma fuente;
  - obliga `paymentState=pending_source_confirmation`;
  - bloquea `pagada`, `paidAt`, `paymentBatchId`, `confirmedBy` y `auditRef` sin fuente completa;
  - mantiene filas no reconciliadas como `pendiente_fuente_financiera`.

- `app/index-backend-dev.html`
  - carga el snapshot antes de `core/liquidacion.js`;
  - carga el adapter después de `core/finanzas-core.js` y antes de los módulos;
  - no modifica `app/index.html` ni módulos/core productivos.

## 5. Gate local reproducible

Resultado:

`PASS_TYA_FINANCIAL_CANONICAL_SNAPSHOT_ADAPTER_R23`

Comprobó:

- 209 vínculos exactos;
- 207 montos canónicos utilizables;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- cero pagos y lotes;
- montos exactos usados por el adapter;
- filas no reconciliadas fallan cerradas;
- `visitContract()` no puede confirmar pago;
- Finanzas y Beneficios usan la misma colección canónica;
- cero PII, secretos, datos bancarios crudos, imports, writes, deploy o producción.

## 6. Lo que todavía no cierra Corte 3

1. Gate remoto del mismo HEAD y del build DEV.
2. Validación de UI de Finanzas y Beneficios.
3. Gate de exportaciones PDF/Excel.
4. Hosting DEV con autorización específica.
5. Validación visual de Paula.
6. Freeze de Corte 3.

## 7. Clasificación

- **Reusable CXOrbia:** snapshot financiero canónico, adapter único, revisión separada de vínculo y monto, pago fail-closed.
- **Exclusivo cliente:** conciliación TyA/Cinépolis y sus conteos.
- **Claude/prototipo:** no tocar módulos ahora; los hallazgos visuales se evalúan después del gate UI.
- **Academia:** explicar honorario, boleto, combo, total, conciliación, revisión de monto, liquidación y pago como estados distintos.
- **Sin impacto Claude:** payload source-safe, índices, llaves estables y guardas de pago.

## 8. Estado seguro

Sin merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, lotes ni pagos.
