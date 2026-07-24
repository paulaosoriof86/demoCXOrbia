# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-23  
**Estado:** `V174_ACTIVE_BASELINE_CORTE3_CANONICAL_FINANCE_SOURCE_SAFE_ADAPTER_APPLIED_PENDING_REMOTE_UI_GATES_NO_PRODUCTION`

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
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Hosting DEV vigente: 14 periodos, 616 visitas y 34 GT/10 HN por periodo.
- Módulos V174, lectura HR viva, adapters operativos y `CX.data`: preservados.

## 3. Pendientes visuales P1/P2 preservados

- responsive parcial en algunas tablas y fichas;
- PDF sin gráficas;
- Excel sin formato operativo suficiente;
- etiqueta técnica `sourceAccessMode` pendiente de alineación.

No reabren V174 ni bloquean el avance técnico de Corte 3.

## 4. Identidad estable de visita

Versión: `tya-stable-visit-id-r20-row-identity-v1`.

Campos canónicos:

`tenantId + projectId + periodKey + country + sourceRow`.

Cinema, shopping, quincena, franja, shopper, fechas y montos no forman parte de la identidad.

## 5. Corte 3 — conciliación financiera revisada

- visitas HR: 616;
- filas financieras: 247;
- enlaces exactos de identidad: 209;
- filas sin vínculo exacto: 38;
- review queue de vínculo: 79;
- evidencias candidatas de ledger: 37;
- pagos confirmados: 0;
- lotes importados: 0.

Evidencia:

- run `30038407143`;
- artifact `8576206104`;
- digest `sha256:485463c0304f39e8c866514d373a5e365de54640cd0c826869c3b6f386cff91e`.

## 6. Snapshot financiero canónico R23

Se creó una única verdad source-safe para Finanzas y Beneficios:

- 209 vínculos exactos preservados;
- 207 montos canónicos listos para consumo;
- 2 vínculos exactos en revisión de consistencia de monto;
- 79 entradas de revisión de vínculo;
- 37 evidencias de ledger tratadas solo como candidatas;
- cero estados `paid` confirmados;
- cero lotes.

Los dos conflictos de monto no se corrigieron ni sobrescribieron silenciosamente.

## 7. Adapter único DEV

- Snapshot: familia `app/data/tya-financial-canonical-source-safe*.js` (cabecera, chunks determinísticos y ensamblador final).
- Adapter: `app/adapters/tya-financial-canonical-source-safe-adapter.js`.
- Entrada DEV: `app/index-backend-dev.html`.
- `CX.data` conserva su interfaz.
- Finanzas y Beneficios consumen `CX.liq.forProject()` desde la misma verdad.
- `visitContract()` falla cerrado con `paymentState=pending_source_confirmation`.
- No se tocaron `app/modules/**`, `app/core/**` ni `app/index.html`.

Gate local:

`PASS_TYA_FINANCIAL_CANONICAL_SNAPSHOT_ADAPTER_R23`.

## 8. Siguiente bloque exacto

`GATE REMOTO DEL MISMO HEAD → VALIDAR FINANZAS Y BENEFICIOS EN UI → GATE PDF/EXCEL → HOSTING DEV CON AUTORIZACIÓN ESPECÍFICA → VALIDACIÓN VISUAL DE PAULA → FREEZE CORTE 3`.

No iniciar Corte 4 antes del freeze.

## 9. Clasificación

- **Reusable CXOrbia:** snapshot financiero canónico, adapter único, revisión separada de vínculo/monto y pago fail-closed.
- **Exclusivo cliente:** datos y revisión TyA/Cinépolis.
- **Claude/prototipo:** esperar evidencia UI reproducible antes de tocar módulos.
- **Academia:** honorario, boleto, combo, total, conciliación, revisión, liquidación y pago como conceptos separados.
- **Sin impacto Claude:** llaves estables, payload source-safe y guardas de pago.

## 10. Estado seguro

Sin merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, lotes ni pagos.
