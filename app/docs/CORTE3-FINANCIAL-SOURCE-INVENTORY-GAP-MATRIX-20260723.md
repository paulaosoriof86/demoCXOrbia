# CORTE 3 — INVENTARIO DE FUENTES FINANCIERAS Y MATRIZ DE GAPS

**Fecha:** 2026-07-23  
**Modo:** read-only / source-safe  
**Datos sensibles:** excluidos

## Fuentes vigentes recuperadas

| Fuente | Función | Estado |
|---|---|---|
| `app/data/tya-financial-control-source-safe.js` | Envelope de afirmaciones operativas | Fuente financiera pendiente; pagos/lotes vacíos |
| `backend/contracts/phase-a-liquidation-payment-control-v1.json` | Estados, llaves y reglas de liquidación/pago | Preparado, no ejecutado |
| `backend/config/phase-a-financial-live-hr-reconciliation-r14c.source-safe.json` | Reconciliación financiera vs. HR | PASS con revisión; snapshot 2026-07-13 |
| `backend/config/phase-a-financial-review-queue-r14c.source-safe.json` | Conflictos y candidatos para revisión | Source-safe; requiere refresco contra HR R20 actual |
| `backend/config/phase-a-ledger-payment-evidence-candidates-r14c.source-safe.json` | Evidencias candidatas de movimientos | Source-safe; no confirma pagos por sí sola |

## Resumen R14C recuperado

- HR histórica: 616 visitas.
- Filas de liquidación financiera: 247.
- Enlaces operativos exactos aceptados: 196.
- Filas de liquidación a revisión: 51.
- Filas itemizadas de ledger: 37.
- Ledger enlazado a visita: 1.
- Review queue: 92.

### Motivos de revisión

- 48: diferencia de monto o detalle HR.
- 1: diferencia de referencia de shopper.
- 1: múltiples candidatos protegidos posibles.
- 1: sin candidato operativo protegido.

## Cobertura enero–junio 2026

| Periodo | País | HR | Filas financieras | Exactas | Gap exacto / fuente |
|---|---:|---:|---:|---:|---:|
| 2026-01 | GT | 34 | 34 | 34 | 0 |
| 2026-01 | HN | 10 | 10 | 0 | 10 exactas |
| 2026-02 | GT | 34 | 34 | 30 | 4 exactas |
| 2026-02 | HN | 10 | 10 | 9 | 1 exacta |
| 2026-03 | GT | 34 | 34 | 33 | 1 exacta |
| 2026-03 | HN | 10 | 10 | 8 | 2 exactas |
| 2026-04 | GT | 34 | 34 | 32 | 2 exactas |
| 2026-04 | HN | 10 | 10 | 9 | 1 exacta |
| 2026-05 | GT | 34 | 34 | 32 | 2 exactas |
| 2026-05 | HN | 10 | 10 | 9 | 1 exacta |
| 2026-06 | GT | 34 | 17 | 0 | 17 fuente + 17 exactas |
| 2026-06 | HN | 10 | 10 | 0 | 10 exactas |

## Periodos sin fuente financiera en R14C

- junio–diciembre 2025: cero filas financieras;
- julio 2026: cero filas financieras.

La ausencia de fuente no autoriza marcar como no pagado o pagado de forma definitiva; debe mostrarse como fuente pendiente o no disponible según el estado canónico.

## Decisión

El snapshot R14C sirve como insumo, pero no puede reutilizarse como verdad final porque la HR R20 actual es posterior. El siguiente paso debe regenerar la reconciliación contra el HEAD y la HR vigentes, conservando las llaves estables y la review queue.

## Siguiente subbloque exacto

`REFRESCAR RECONCILIACIÓN R14C CONTRA HR R20 ACTUAL → COMPARAR DELTA DE CONTEOS Y LLAVES → EMITIR MATRIZ EXACTOS/FALTANTES/AMBIGUOS/CONFLICTOS → GATE FAIL-CLOSED`.

## Estado seguro

No se importó, modificó ni confirmó ningún pago. Cero writes y cero datos bancarios crudos.
