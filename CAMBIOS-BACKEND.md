# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY1-PREPROVIDER-DOCSYNC-FIX-28`

## Preservado
I1/I2/I3 PASS, I4-A PASS, HR `15 periodos / 660 visitas`, Historical Shopper frozen, TARGET_B Admin no recrear, Finance V2/historical y legal v0.4. I4-B readiness/provider source permanece PASS/source-ready.

## I4-B — primer E2E consumido
Run `32286832002`, artifact `9377953415`: `HOLD_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE__provider_is_not_defined`. Causa `PIPELINE_MECHANISM_FAILURE_PRIMARY`; provider commits/writes 0, fixture sintético retirado y visitas/postulaciones reales invariantes. No se atribuye a defecto del producto/provider.

## Retry1 — autorización vigente
Gate `NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY1__HARNESS_SCOPE_FIXED__SYNTHETIC_VISIT_ONLY` autorizado por Paula; `enabled=true`, `consumed=false`, `executionsConsumed=0`. Scope: sintético únicamente; Historical Shopper=false; mutación visita HR real=false; Auth/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod = 0/false.

## Hallazgo nuevo reproducible — desincronización documental
Se movió Retry1 a un carril PR observable y el run `32296607712` sí arrancó. Se detuvo antes de preparar runtime/provider porque `verify-cxorbia-source-truth-sync.mjs` devolvió `FAIL_SOURCE_TRUTH_SYNC` con un único error: `FRONTIER:app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Artifact `9381423175`, digest `sha256:e88ccd8cc244f7fd5a571ffbc2c9082bd56267f85a591a2cdbd959d85e0dfcb2`. Provider execution no inició: provider calls/commits/writes 0; no synthetic fixture creado; datos/proveedores protegidos no fueron tocados.

El finalizer mostró además un defecto secundario de shell (`syntax error: unexpected end of file`) y no persistió el HOLD ni consumió el gate. La autorización permanece vigente; no corresponde pedir otra.

Evidencia durable creada: `app/docs/evidence/I4B-RETRY1-PREPROVIDER-DOCSYNC-FAILURE.json`.

## Corrección en curso
Se abre `SYNC_EPOCH 28` para sincronizar Execution State, Source Lock, índice, checkpoint, addendum, Plan Lock, tracker, CAMBIOS, RESUMEN y PENDIENTES. El tracker 35/65 queda reemplazado por el formal canónico **60%/40%**: I3 ya está integralmente PASS/FROZEN.

Tras terminar el resync se corrige el finalizer y se ejecuta el mismo Retry1 autorizado en el carril observable. Si PASS → I4-C HR bidireccional.

## Clasificación
- Reusable CXOrbia: disciplina de gate, source-truth y finalizer observable.
- Exclusivo TyA: `tenantId=tya`, proyecto Cinépolis y protección HR 15/660.
- Claude/prototipo: handoff previo sin cambio; no P0 frontend nuevo.
- Academia: sin cambio funcional por este fallo pre-provider.
- Sin impacto Claude: workflows, gate, evidencia y sincronización documental.
