# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4D-REUSE-CLOSED-I4E-ACTIVE-35`

**Avance formal canónico:** **60% completado / 40% pendiente**. El lock no asigna subpesos a I4-A..F; por eso el porcentaje formal no cambia hasta cerrar I4 completo.

## Corrección metodológica — no rehacer Finanzas
La revisión del HEAD vivo confirmó que el wiring financiero de `CX.data` ya existía y estaba cargado en el carril backend DEV. Por tanto, `I4D_FINANCE_PHASE_A_CX_DATA_READ_WIRING` no debía abrirse como una implementación nueva.

Activos existentes reutilizados:
- `app/core/backend-cxdata-finance-read.js` — bridge de lectura financiera sobre `CX.data`.
- `app/adapters/tya-financial-canonical-source-safe-adapter.js` — verdad financiera/histórica canónica sobre `CX.data`.
- `app/adapters/tya-canonical-finance-read-model-v2.js` — Finance/Liquidaciones read model v2.
- `app/index-backend-dev.html` — ya carga estos activos en el runtime DEV protegido.

No se tocó ni reescribió ninguno de esos archivos. Finance V2/historical queda preservado.

## Qué sí fue nuevo en I4-D
Solo se cerró una brecha de verdad histórica de pago para Phase A: Mayo 2026 44/44 pagadas; Junio 2026 44 visitas, 2 pagadas y 42 pendientes; Q451 total confirmado en junio. También se endureció el verifier source-safe a 24 aserciones para fijar claves estables y la regla `liquidada != pagada`.

Se corrige una afirmación documental previa: no existe evidencia de ejecución del verifier en esta evidencia ni en GitHub Actions. No se vuelve a afirmar replay ejecutado. El cierre I4-D se sustenta en inspección de fuente viva y reutilización del wiring ya existente.

## Estado I4-D
`PASS_I4D_FINANCE_EXISTING_CXDATA_REUSE_CONFIRMED`.

## Seguridad
0 payment execution, 0 payment-state writes, 0 Make/HR/Auth/Rules/Storage/Gemini calls/writes, 0 deploy/merge/producción. Datos bancarios crudos excluidos.

## Clasificación
- Reusable CXOrbia: bridge `CX.data`, Finance read model, reglas por claves estables.
- Exclusivo TyA: corte Mayo/Junio Cinépolis y cifras 44/44, 2/42, Q451.
- Claude/prototipo: preservar Finance existente; no pedir reconstrucción ni parche UI.
- Academia: Finanzas conserva separación liquidación/pago y evidencia histórica.
- Sin impacto Claude: corrección documental/verifier source-only.

## Siguiente bloque exacto
`I4E_MULTI_PROJECT_NO_CODE_REUSE_AUDIT`: inventariar y reutilizar lo ya existente de configuración multi-proyecto/no-code antes de crear o modificar cualquier cosa.