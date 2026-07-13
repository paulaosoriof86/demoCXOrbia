# Phase A R14 — conciliación financiera TyA contra HR viva

Decisión: **HOLD_NO_EXACT_REAL_TYA_LINKS**

- Visitas HR source-safe: 616
- Filas reales de control de liquidación: 247
- Enlaces compuestos exactos: 0
- Filas de liquidación en revisión: 247
- Evidencias itemizadas de libro financiero: 37
- Cola de revisión total: 288

## Estado seguro

- Sin nombres de shoppers o tiendas en salida.
- Sin lectura del workbook crudo en CI.
- Sin writes Firebase/HR, import, pagos, deploy ni producción.

## Uso operativo

- Los enlaces exactos crean candidatos de liquidación vinculados a `visitId/hrRowId`.
- `liquidada` o día planificado no se convierten en pago.
- Evidencia de ledger permanece en revisión hasta tener lote/actor/fecha y enlace estable suficientes.
