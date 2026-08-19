# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY1-PROVIDER-TX-ORDER-HOLD-29`

I1/I2/I3 PASS/frozen. I4-A PASS/frozen. Progreso formal canónico: **60% completado / 40% pendiente**.

## Pendiente activo único
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

Retry1 run `32297736022` llegó al provider real: `application.create` PASS, replay idempotente PASS y `application.status.update` HOLD por orden de lecturas/escrituras de Firestore. Retry1 quedó consumido y no admite retry automático.

La causa raíz técnica ya está corregida source-only en `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`, con guard reforzado en `e1f62c8425d0fffc62b2ba92ccdd6141b60f3be6`.

También se corrigió la causa raíz documental: había documentos canónicos en epoch 28 mientras Index/Execution State/Source Lock estaban en 29. El verifier pasa a derivar epoch/frontera del Execution State y a comprobar todo el conjunto canónico antes de ejecutar gates.

Retry2 conserva scope sintético: Historical Shopper=false; visita HR real=false; Auth/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod sin cambios.

PASS Retry2 → I4-C HR bidireccional → I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5.

No reabrir Auth, Shopper histórico, TARGET_B Admin, I1/I2/I3/I4-A ni crear nueva candidata/rama/PR.
