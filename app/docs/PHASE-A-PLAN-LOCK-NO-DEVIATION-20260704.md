# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY1-PROVIDER-TX-ORDER-HOLD-29`

Secuencia obligatoria I1→I2→I3→I4→I5. Progreso formal actual **60% completado / 40% pendiente** porque el Plan no asigna subpesos a I4-A..F.

Frozen: I1/I2/I3, Historical Shopper, TARGET_B Admin, HR `15 periodos / 660 visitas`, Finance V2/historical, legal v0.4 e I4-A. No reabrir ni reprocesar.

I4-B Retry1 run `32297736022` alcanzó provider real. `application.create` y replay idempotente PASS; `application.status.update` HOLD por orden de reads/writes en transacción Firestore. Retry1 consumido, sin retry automático.

Fix source-only `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`: todas las lecturas/validaciones de aprobación antes de cualquier write. Verificador source `e1f62c8425d0fffc62b2ba92ccdd6141b60f3be6`.

Regla de no desviación reforzada: el source-truth verifier deriva epoch y frontera del Execution State y debe confirmar coincidencia en todos los documentos canónicos. No se permite ejecutar un gate con documentación parcialmente sincronizada.

Siguiente frontera exacta: `NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

Retry2 mantiene el mismo alcance sintético, Historical Shopper=false, HR real=false y producción=false. PASS → I4-C HR bidireccional → I4-D Finanzas → I4-E multi-proyecto → I4-F Academia → I5 producción.
