# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_PAYMENT_HISTORY_HOSTING_DEV_REMOTE_PASS_PENDING_PAULA_FINAL_VISUAL`

## 1. Objetivo

Operar TyA/Cinépolis como proyecto configurable con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización, sobre base nueva sin conectar/copiar la base vieja.

## 2. Secuencia por corte

`FUENTE → MAPPING/ADAPTER → GATES → BUILD → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE`

Un PASS técnico sin validación real no congela un corte.

## 3. Carril de candidatas

`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → si GO APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → HOSTING DEV → VALIDACIÓN → FREEZE`

No se sustituye por nueva rama/PR, workflow transportador, PowerShell, incoming, composite, tree directo ni acción manual de Paula.

Una falla reproducible después del empalme se corrige focalizadamente en backend/contratos/adapters/tools o se documenta para Claude si pertenece al frontend. No genera por sí sola nueva candidata o reauditoría.

## 4. Cortes cerrados

V174/M1/Corte 1/Corte 2A: **FROZEN/APROBADO**.

- source lock `d057d77c9117d9d451cfc9a6563083b78b926d57`;
- 14 periodos y 616 visitas preservados;
- HR, adapters y `CX.data` preservados.

## 5. Corte activo — Corte 3 Finanzas

Estado: `PAYMENT_HISTORY_HOSTING_DEV_REMOTE_PASS_PENDING_PAULA_FINAL_VISUAL`.

### 5.1 V182 y fuentes financieras

- V175–V181: HOLD histórico; no aplicadas.
- V182: source-GO y empalmada.
- Commit funcional: `e3cfe464fd80e5bd4ce273556cfd0021e22c0810`.
- R26–R32 post-apply: 135/135 PASS.
- 247 filas financieras / 209 vínculos exactos / 207 montos canónicos.
- 38 sin vínculo exacto / 79 revisiones de vínculo / 2 revisiones de monto.
- No V183. No R33.

### 5.2 P0 de histórico de pagos — corregido

La validación visual demostró que el runtime omitía el histórico de pagos al forzar cero confirmaciones. Se recuperó desde la fuente exacta en modo read-only y se proyectó sin PII.

Fuente:

- SHA-256 `b8e753ade03286caf3ff19e119a9b21b4dde7d5bd21d61fba70ab32719afea89`;
- hoja `Liquidación May 26`;
- rango `A1:AB57`;
- archivo crudo fuera del repo.

Reglas reusable CXOrbia:

- visita, liquidación, revisión financiera, pago y lote son estados separados;
- pago confirmado puede coexistir con revisión financiera;
- pago pendiente no abre revisión financiera;
- histórico de pago usa grupos inmutables/no ejecutables;
- no se inventa fecha completa ni `paymentBatchId`;
- no se deduplica por nombre;
- monedas permanecen separadas.

### 5.3 Verdad vigente

Mayo 2026:

- 44 visitas;
- 44 pagadas / 0 pendientes;
- 42 vínculos exactos / 2 reviews preservadas;
- CxP GT Q0 / HN L0;
- GT pagado source-safe Q7,488;
- HN pagado source-safe L5,861.

Junio 2026:

- 44 visitas;
- 2 pagadas / 42 pendientes;
- pagadas únicamente `JUNIO 26!2` y `JUNIO 26!6`;
- GT pagado Q451 / HN pagado L0;
- ninguna fila adicional inferida.

### 5.4 Implementación

- contrato `backend/contracts/tya-payment-history-source-safe-v1.json`;
- proyección `app/data/tya-payment-history-source-safe.js`;
- adapter común `app/adapters/tya-financial-canonical-source-safe-adapter.js`;
- gate funcional `tools/qa/tya-payment-history-source-safe-gate.mjs`;
- builder y smoke remoto actualizados;
- R24 fail-closed conserva identidades exactas;
- módulos UI no reescritos.

### 5.5 Evidencia vigente

- Gate local histórico: PASS.
- Adapter harness: PASS.
- R24 remoto: `PASS_CORTE3_V174_RUNTIME_PRESERVATION_R24`.
- Request Hosting DEV: `7d314818e58c19e4332830d4c474ff3a6157b509`.
- Run `30416875149`, job `90468374816`: SUCCESS.
- Live HR endpoint: PASS.
- Smoke remoto: `PASS_TYA_CORTE3_REMOTE_LIVE_PAYMENT_HISTORY_SMOKE_R25`.
- Mayo remoto: 44 pagadas / 0 pendientes / 2 reviews / CxP Q0-L0.
- Junio remoto: 2 pagadas / 42 pendientes / IDs exactos / Q451-L0.
- Beneficios Shopper identificado: pagos históricos visibles.
- Pagos ejecutados y lotes ejecutables: 0.

### 5.6 Pendiente para congelar Corte 3

1. Paula abre Hosting DEV.
2. Validar mayo: 44 pagadas, 0 pendientes, CxP Q0/L0 y 2 revisiones preservadas.
3. Validar junio: 2 pagadas, 42 pendientes, Q451/L0.
4. Validar Shopper/Beneficios con identidad.
5. Validar viewport móvil.
6. PDF sin gráfica y Excel básico permanecen P2 transversal no bloqueante.
7. Corregir solo diferencias reproducibles, si existen.
8. Paula responde `APROBADO`.
9. Freeze Corte 3 / ACTIVE_BASELINE.

Corte 4 no comienza antes.

## 6. Cortes siguientes

- **Corte 4:** backend nuevo `CX.data` read-only en Firebase nuevo/vacío.
- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

## 7. Claude/prototipo

No preparar V183. Preservar el contrato de pagos históricos. Cualquier copy/frontend que aún asuma cero pagos debe documentarse y corregirse de forma localizada por archivo/módulo, sin reinterpretar backend ni HR.

## 8. Academia

Después de aprobación visual documentar:

- fuente operacional, financiera y de pago;
- revisión financiera vs pago confirmado;
- pago histórico source-safe;
- precisión `source_day_only`;
- grupo histórico vs lote ejecutable;
- monedas separadas;
- liquidaciones, Movimientos, Dashboard y Beneficios;
- exportaciones P2.

## 9. Estado seguro

Sin producción, merge, Firestore/Auth/Storage/HR writes, imports, ejecución de pagos, lotes reales, Make ni Gemini live.
