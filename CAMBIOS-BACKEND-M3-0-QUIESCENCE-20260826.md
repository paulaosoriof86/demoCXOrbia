# CAMBIOS BACKEND — M3-0 QUIESCENCE / SINGLE AUTHORITY BARRIER

Fecha: 2026-08-26

## Causa

La clean probe posterior al concurrent-writer rootfix conservó HEAD estable y el gate M3 pasó, pero el mismo HEAD produjo fan-out de workflows muy superior al único push canónico esperado. Por tanto el auto-writer directo quedó contenido, pero la quiescencia global no estaba demostrada.

## Reparación

- PR #7 cerrado temporalmente, sin merge, para eliminar eventos `pull_request` synchronize durante M3.
- Se crea `backend/config/cxorbia-m3-quiescence-lock.json` como barrier persistente entre conversaciones.
- Se crea `tools/continuity/validate-cxorbia-m3-quiescence.js`.
- El checkpoint M3 verifica PR #7 cerrado y ejecuta el nuevo validator antes de los gates existentes.
- La cola queda congelada en 3 tombstones / 27 residuales hasta `CLOSED_PASS`.
- Se crea una métrica distinta de producción real: `PRODUCTION_REAL_READINESS 68/100`; Phase A 98/100 se conserva como métrica técnica interna.

## Preservación

No se toca source funcional, `/app/core`, `/app/modules`, HR, provider, Auth, Firestore, Storage, Rules, Make, Gemini, pagos, deploy ni merge. M1/M2/F0 no se reabren.

## Clasificación

- Reusable CXOrbia: barrier de quiescencia, single-authority y progreso por gates.
- Exclusivo cliente: PR/rama y residual inventory TyA.
- Claude/prototipo: sin cambio frontend.
- Academia: sin impacto funcional.
- Sin impacto Claude: control-plane, gates y documentación.

## Siguiente exacto

Readback remoto del materialization commit y luego `M3_0_CLEAN_PROBE_WITH_PR_CLOSED`. Si PASS, el progreso real pasa 68→69 y solo entonces se reanuda la cola finita M3.
