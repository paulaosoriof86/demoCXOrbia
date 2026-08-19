# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-LANE-READY-SOURCE-ONLY-30`

Secuencia obligatoria I1→I2→I3→I4→I5. Progreso formal actual **60% completado / 40% pendiente** porque el Plan no asigna subpesos a I4-A..F.

Frozen: I1/I2/I3, Historical Shopper, TARGET_B Admin, HR `15 periodos / 660 visitas`, Finance V2/historical, legal v0.4 e I4-A. No reabrir ni reprocesar.

I4-B Retry1 run `32297736022` alcanzó provider real; el único defecto probado fue el orden read/write de `application.status.update`, corregido source-only en `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`.

Regla reforzada: antes de cualquier provider gate, source-truth debe coincidir en 10 documentos usando epoch, frontera y progreso dinámicos del Execution State. El provider verifier debe comprobar las tres ramas transaccionales. El workflow I4-B es estable y request-driven: no se reconstruye por retry, no cancela un run activo y no consume autorización antes de entrar a un intento de mutación.

Siguiente frontera exacta: `NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

Retry2 está preparado source-only con gate deshabilitado y sin autorización. Historical Shopper=false, HR real=false y producción=false. PASS → I4-C HR bidireccional → I4-D Finanzas → I4-E multi-proyecto → I4-F Academia → I5 producción.
