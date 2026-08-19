# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-PASS-I4C-FRONTIER-31`

Secuencia obligatoria I1→I2→I3→I4→I5. Progreso formal actual **60% completado / 40% pendiente** porque el Plan no asigna subpesos a I4-A..F.

Frozen: I1/I2/I3/I4-A/I4-B, Historical Shopper, TARGET_B Admin, HR `15 periodos / 660 visitas`, Finance V2/historical y legal v0.4. No reabrir ni reprocesar.

I4-B queda cerrado por Retry2 PASS, run `32305790197`: lifecycle provider-backed sintético completo, idempotencia y conflicto de versión probados, datos reales invariantes y gate consumido una sola vez.

Regla de continuidad: no volver a Retry2 ni a su workflow. Source truth debe seguir coincidiendo en 10 documentos usando epoch/frontera/progreso dinámicos del Execution State.

Siguiente frontera exacta: `I4C_HR_BIDIRECTIONAL_SYNC_READINESS_SOURCE_IMPLEMENTATION`.

I4-C comienza source-only. Debe implementar y verificar sincronización bidireccional HR/plataforma con claves estables, origen y estado de sincronización, sin deduplicación por nombre y con conflictos a revisión humana. HR writes, Make y producción siguen bloqueados hasta autorización posterior.

Tras I4-C: I4-D Finanzas → I4-E multi-proyecto → I4-F Academia → I5 producción.
