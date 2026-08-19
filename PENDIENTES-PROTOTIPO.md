# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY1-PREPROVIDER-DOCSYNC-FIX-28`

I1/I2/I3 PASS/frozen. I4-A PASS/frozen. I4-B readiness/provider source PASS/frozen. Progreso formal canónico: **60% completado / 40% pendiente**.

## Pendiente activo único
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY1__HARNESS_SCOPE_FIXED__SYNTHETIC_VISIT_ONLY`.

El gate ya está autorizado por Paula y sigue `enabled=true / consumed=false / executionsConsumed=0`; no corresponde pedir nueva autorización mientras el scope no cambie.

Run observable `32296607712`: se detuvo antes de provider por `FAIL_SOURCE_TRUTH_SYNC` con único error `FRONTIER:app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`. El finalizer presentó además `syntax error: unexpected end of file` y no consumió el gate. Provider runtime/calls/commits/writes = 0; no fixture sintético, Historical Shopper, HR real, Auth, Rules, Storage, Make, Gemini, pagos, deploy, merge o producción.

Evidencia: `app/docs/evidence/I4B-RETRY1-PREPROVIDER-DOCSYNC-FAILURE.json`.

## Corrección inmediata
1. Completar sincronización documental del epoch 28, incluida eliminación del tracker histórico 35/65 como estado vigente.
2. Corregir finalizer shell del workflow Retry1 observable.
3. Ejecutar la misma autorización vigente, sin ampliar alcance.
4. PASS → I4-C HR bidireccional → I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5.

No reabrir Auth, Shopper histórico, TARGET_B Admin, I1/I2/I3/I4-A ni crear nueva candidata/rama/PR.
