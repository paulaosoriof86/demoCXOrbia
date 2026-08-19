# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY1-PROVIDER-TX-ORDER-HOLD-29`

## Preservado
I1/I2/I3 PASS, I4-A PASS, HR `15 periodos / 660 visitas`, Historical Shopper frozen, TARGET_B Admin no recrear, Finance V2/historical y legal v0.4. Sin cambios de frontend ni P0 nuevo demostrado.

## I4-B Retry1 — provider real alcanzado
Run `32297736022`: `application.create` PASS; replay idempotente PASS; tercer comando `application.status.update` HOLD por `Firestore transactions require all reads to be executed before all writes.` Retry1 quedó consumido y sin retry automático.

Safety: `providerCommandCalls=3`, `providerCommittedCalls=2`, `providerWritesReported=3`; fixture y aplicación sintéticos eliminados; visitas/postulaciones reales invariantes; Historical Shopper/Auth/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod sin cambios.

## Causa raíz técnica
En `backend/runtime/cxorbia-visit-lifecycle-command-provider-v1.mjs`, `application.status.update` hacía una escritura sobre la postulación y luego una lectura de la visita dentro de la misma transacción Firestore. Fix source-only `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`: toda lectura/validación ocurre antes de cualquier write. Verificador reforzado en `e1f62c8425d0fffc62b2ba92ccdd6141b60f3be6`.

## Causa raíz metodológica adicional — documentación parcialmente sincronizada
Se comprobó que Index/Execution State/Source Lock estaban en epoch 29, pero Checkpoint, Addendum, Plan Lock, Tracker, CAMBIOS, RESUMEN y PENDIENTES seguían en epoch 28. Esto podía volver a provocar gates bloqueados por source truth y explica la repetición del patrón documental.

Corrección durable: sincronización completa del conjunto canónico y modificación de `tools/verify-cxorbia-source-truth-sync.mjs` para que `SYNC_EPOCH` y frontera se deriven dinámicamente de `app/docs/CXORBIA-EXECUTION-STATE.json`, en lugar de quedar hard-codeados. El verificador exige coincidencia de epoch/frontera y 60/40 en todos los documentos canónicos antes de permitir avanzar a un gate.

Evidencia activa: `app/docs/evidence/I4B-RETRY1-PROVIDER-TX-ORDER-SOURCE-FIX.json`.

## Siguiente frontera
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

Retry2 requiere nueva autorización únicamente porque Retry1 sí fue consumido. Mismo scope sintético, sin Historical Shopper, sin visitas HR reales, sin producción. PASS → I4-C HR bidireccional.

## Clasificación
- Reusable CXOrbia: verificación dinámica de source truth, orden transaccional Firestore y gate single-use.
- Exclusivo TyA: tenant `tya`, proyecto Cinépolis, HR 15/660 y fixture sintético de I4-B.
- Claude/prototipo: sin cambio frontend; handoff previo se conserva.
- Academia: sin cambio funcional; no enseñar ciclo write como PASS hasta Retry2.
- Sin impacto Claude: corrección del provider, verifier y sincronización documental.
