# ADDENDUM MAESTRO — PRIORIDAD GO-LIVE: FINANZAS ANTES DE MAKE

**Vigente desde:** 2026-08-19  
**Prevalencia:** corrige cualquier documento que convierta el binding live de Make/HR en bloqueo previo a la salida inicial a producción.

## Decisión operativa
La preparación source-only de sincronización HR↔plataforma de I4-C se conserva y se considera suficiente para el alcance inicial de Phase A. La conexión runtime de Make, revisión de escenarios existentes y activación de writes HR se difieren al bloque posterior de integraciones y **no bloquean el go-live inicial**.

La prioridad inmediata de Phase A es Finanzas: liquidaciones históricas y estado de pago visible/operable, con corte mínimo de junio, preservando la fuente histórica y sin ejecutar pagos bancarios desde CXOrbia.

## Orden desde este addendum
I4-C source/readiness queda cerrado para Phase A con runtime Make diferido → I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5 preproducción/go-live. Make/Gemini runtime se revisan después del núcleo indispensable de salida.

## Verdad financiera preservada
- Hasta mayo: pagos completos según la fuente documentada.
- Mayo 2026: 44/44 visitas con pago confirmado en `app/data/tya-payment-history-source-safe.js`.
- Junio 2026: 44 visitas; 2 pagos confirmados por evidencia source-safe y 42 pendientes.
- Las visitas hasta junio están ejecutadas; junio pendiente es control de liquidación/pago, no ejecución de visitas.
- `liquidada` nunca equivale por sí sola a `pagada`.
- No inventar `paidAt`, lote bancario ni referencia de pago.

## Seguridad
No activar Make, HR writes, ejecución de pagos, Auth/Rules/Storage/Gemini, deploy, merge ni producción por este addendum. Los datos bancarios/PII crudos permanecen fuera del repo.

## Regla antidesvío
No volver a pedir escenarios Make ni convertir Make en bloqueo mientras la frontera viva sea Finanzas/I4-E/I4-F/I5. Cuando llegue el bloque de integración posterior, reutilizar los escenarios Make ya existentes de Paula y auditarlos antes de activarlos.