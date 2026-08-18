# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 17:41 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4-SCOPE-SOURCE-GAP-16`  
**Estado:** `I3_FROZEN__GO_LIVE_60__I4_SCOPE_SOURCE_GAP__NO_EXECUTION`

## Preservado

I1 `15/15 PASS`, I2 `20/20 PASS`, I3 `25/25 PASS`. I3 final permanece frozen: Staff run `32196648462`, job `95901931320`, artifact `9346121436`; identityMap canonical, agosto `2/0`, duplicados `0/0`, estabilidad reload/nueva pestaña y safety cero. No se reejecutó I3.

## Bloque ejecutado

`RECOVER_CANONICAL_I4_SCOPE_FROM_ACTIVE_PLAN_LOCK__NO_EXECUTION_YET`

Tipo: documental/read-only. Cero cambios de producto, provider, Auth, Firestore, Rules, HR, Storage, Make, Gemini, pagos, Hosting/Cloud Run, usuarios/contraseñas, merge o producción.

### Hallazgo

El estado vivo usa I1–I5 con ponderación `15/20/25/25/15`, pero las fuentes canónicas heredadas disponibles siguen organizadas por `CORTE 0B` y `CORTES 1–8`. El plan contiene `CORTE 4`, sin declarar equivalencia con el I4 actual ni sus subgates.

Búsqueda dirigida en índice vigente entregado, Phase A plan lock, source lock, checkpoint, `app/docs`, commits y PR #7: no se encontró definición semántica autoritativa del I4 actual.

Bloqueo: `ACTIVE_SOURCE_GAP__I1_I5_PERCENT_WEIGHTS_PRESENT_BUT_I4_SEMANTIC_SCOPE_NOT_MATERIALIZED`.

Adjudicación: no mapear `CORTE 4` a I4 por coincidencia numérica; no inventar subgates/gates. I4 permanece `0/25`; avance **60% / 40%**.

## Archivos tocados

- `app/docs/SOURCE-LOCK-CXORBIA-TYA.md` — source gap I4 fijado.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` — checkpoint 60/40, I4 no iniciado.
- `PENDIENTES-PROTOTIPO.md` — brecha documental como pendiente vivo.
- `CAMBIOS-BACKEND.md` — este registro.
- `RESUMEN-PARA-CLAUDE.md` — sin parche frontend; pendiente de fuente I4.
- PR #7 — estado de bloqueo documental I4.

## Clasificación

- **Reusable CXOrbia:** antidesvío contra mapeo de nomenclaturas históricas por número.
- **Exclusivo TyA:** brecha de fuente del plan de salida.
- **Claude/prototipo:** sin parche UI.
- **Academia:** sin cambio funcional; manuales/cursos/rutas/notificaciones intactos.
- **Sin impacto Claude inmediato:** recuperación documental.

## Siguiente bloque exacto

`MATERIALIZE_CANONICAL_I4_SCOPE_FROM_APPROVED_SOURCE__NO_EXECUTION`

Se necesita la fuente aprobada que definió I1–I5 `15/20/25/25/15` junto con el alcance/subgates de I4, o una instrucción vigente explícita que los materialice. No ejecutar I4 antes.
